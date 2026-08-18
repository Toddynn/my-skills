---
name: nextjs-login-keycloak
description: Authorization Code Flow Keycloak em Next.js App Router via BFF Nest. Cookie httpOnly de sessão, callback /verify-credentials, refresh 401, proxy.ts, roles. Use when implementing Next.js Keycloak login, AuthProvider, session cookie, verify-credentials, or admin authorization guards.
---

# Next.js Keycloak authorization

Padrão de `clube-adm-frontend`. Frontend **nunca** fala com Keycloak. BFF Nest troca `code`, guarda tokens na sessão Redis, seta cookie httpOnly. Sem `keycloak-js`, sem next-auth, sem iron-session.

Login humano = Authorization Code. M2M e Admin REST = skill `nestjs-keycloak-admin`.

## Proibido

- `keycloak-js` / next-auth / OIDC no browser
- Env `KC_*` no frontend (client id, secret, realm)
- Header `Authorization` no axios
- Token em localStorage / React persist
- Trocar `code` no Next
- PKCE no frontend
- Concatenar URL de auth — sempre `API_ROUTES` + `buildApiRoute`

## Fluxo

1. Botão login chama `getLoginUrl()` — **sem** email/senha
2. `authless.get` `GET /auth/keycloak/admin/get-login-url` (`withCredentials`)
3. Backend gera `state`/`nonce`, grava na sessão, devolve `{ url }` + `Set-Cookie`
4. `window.open(url, '_self', 'noopener,noreferrer')`
5. Keycloak volta `{app}/verify-credentials?code=&state=`
6. Página POST `{ code, state }` em `/auth/keycloak/admin/verify-credentials`
7. Backend valida state/nonce, `grant_type=authorization_code`, tokens **só no server**, devolve `{ adminUser }`
8. `updateUserSession(adminUser)` + `push('/home')`

## Arquivos

```
src/lib/providers/auth-provider/index.tsx
src/lib/providers/axios/api/index.ts
src/contexts/auth-context/index.ts
src/hooks/use-auth/index.ts
src/proxy.ts                          # Next 16 — não middleware.ts
src/app/(public)/(auth)/(login)/page.tsx
src/app/(public)/(auth)/verify-credentials/page.tsx
src/shared/constants/api-routes/index.ts
src/shared/constants/app-routes.ts
src/shared/constants/roles/index.ts
src/shared/constants/session-expired-query.ts
src/shared/functions/build-expired-session-login-route/index.ts
src/components/ui/authorization-wrapper/index.tsx
src/hooks/use-verify-authorization/index.ts
```

## Axios

```ts
const axiosConfigWithCredentials = {
  baseURL: `${backend_url}`,
  withCredentials: true,
} as const;

export const api = axios.create(axiosConfigWithCredentials);
export const authless = axios.create(axiosConfigWithCredentials);
```

- `api` — interceptor 401
- `authless` — get-login-url, refresh, terminate logout (sem loop)
- Cookie vai sozinho. Sem Bearer.

## Contrato BFF (admin)

| Método | Path | Client | Body / resp |
|--------|------|--------|-------------|
| GET | `/auth/keycloak/admin/get-login-url` | `authless` | `{ url }` |
| POST | `/auth/keycloak/admin/verify-credentials` | `api` | `{ code, state }` → `{ adminUser }` |
| POST | `/auth/keycloak/admin/refresh` | `authless` | `{ adminUser }` |
| GET | `/auth/keycloak/admin/get-logout-url` | `api` (logout) / `authless` (expirada) | `{ url }` |

Rotas app: `LOGIN: '/'`, `VERIFY_CREDENTIALS: '/verify-credentials'`, `HOME: '/home'`.

## Sessão

- Cookie name = `NEXT_PUBLIC_COOKIE_SESSION_ID` = backend `SESSION_NAME` (ex. `clube.sid`)
- Flags do cookie: **só backend** (`httpOnly`, `secure` prod, `sameSite: none|lax`, `domain`)
- User em React state: `id`, `name`, `email`, `email_verified`, `cpf_cnpj`, `roles`
- `sessionStorage` só last-visited route — não token
- Axios bate `backend_url` direto (mesmo parent domain do cookie). Rewrite Next só pra media.

Env frontend auth: `NEXT_PUBLIC_COOKIE_SESSION_ID` + `NEXT_PUBLIC_BACKEND_*` / `NEXT_PUBLIC_APP_*`. Zero `KC_*`.

## Provider

- `getLoginUrl` → `authless.get` login-url → `window.open`
- `verifyCredentials({ code, state, redirect_to })` → POST verify → `updateUserSession` → `push(redirect_to)`
- Mount: se rota **não** pública, `refresh()` via `authless`
- Logout intencional: `getLogoutUrl()` via `api` → `window.location.assign(url)` Keycloak end-session
- Sessão morta: `terminateSession` → limpa state → `authless.get` logout → `/?session=expired`

`isSessionResolved`: `false` até o primeiro refresh acabar. Roles vazio nesse intervalo ≠ sem permissão.

Root: `TanstackQueryClientProvider` > `AuthProvider` > resto.

## 401

Fila `RefreshTokenQueue` no interceptor de `api`:

- Skip 403, `_retry`, URL de refresh/logout
- Refresh em andamento → enqueue → retry original
- Senão `refresh()` → `flush` → retry
- Falha → `getLogoutUrl()` / `terminateSession`

## `proxy.ts` (Next 16)

Export `proxy` + `config.matcher`. Checa **presença** do cookie, não validade.

- Sem cookie + rota privada → `/`
- Cookie + rota pública `whenAuthenticated: 'redirect'` + **sem** `?session=expired` → `/home`
- `/verify-credentials`: `whenAuthenticated: 'stay'`
- `?session=expired` quebra loop cookie zumbi → login

Sessão morta: **sempre** `buildExpiredSessionLoginRoute()` (`/?session=expired`), nunca `APP_ROUTES.PUBLIC.LOGIN` puro.

`experimental.authInterrupts: true` no `next.config.ts` (pra `unauthorized()`).

## Callback `/verify-credentials`

```ts
useEffect(() => {
  if (requestedRef.current) return;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) return push(buildAppRoute(APP_ROUTES.PUBLIC.LOGIN));
  verifyCredentials({ code, state, redirect_to: APP_ROUTES.PRIVATE.HOME }).catch((error) =>
    setErrorExists(!!error),
  );
}, []);
```

`requestedRef` anti double-call.

## Roles / guards

Roles = client roles kebab PT (`acesso`, `administrador-master`, `visualizar-banners`, …). Catálogo: `shared/constants/roles` — **mesmo** strings do backend `ADMIN_ROLES`.

- Layout privado: `ROLES.ACCESS` (`acesso`) + `redirectToLoginPage`
- Página: `AuthorizationWrapper` + `required_roles` + `redirectToUnauthorizedPage` → `unauthorized()` (403) ou login expired se `!user`
- Hide ação: `useVerifyAuthorization([ROLES.…], { action: 'hideElements', elementIds: [...] })`
- `ADMIN_ROLES.MASTER` bypass
- Validações: `atLeastOne` (default), `allOf`, `anyRoleExcept`, `perElement`
- Esperar `isSessionResolved`

CRUD de administradores Keycloak (promover user, copiar roles) **não** é login — skill `nestjs-keycloak-admin`.
