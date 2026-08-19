---
name: nextjs-login-keycloak
description: Authorization Code Flow Keycloak em Next.js App Router via BFF Nest. Cookie httpOnly de sessão, callback /verify-credentials, refresh 401, proxy.ts, roles. Use when implementing Next.js Keycloak login, AuthProvider, session cookie, verify-credentials, or admin authorization guards.
---

# Next.js Keycloak authorization

Frontend **nunca** fala com Keycloak. BFF Nest troca `code`, sessão Redis, cookie httpOnly. Sem `keycloak-js`, next-auth, iron-session.

## Exemplos

- [`examples/auth-provider.tsx`](examples/auth-provider.tsx) — **obrigatório**. Copiar esse provider, não resumir.
- [`examples/auth-context.ts`](examples/auth-context.ts)
- [`examples/use-auth.ts`](examples/use-auth.ts)
- [`examples/proxy.ts`](examples/proxy.ts)
- [`examples/auth-endpoints.ts`](examples/auth-endpoints.ts)

Login humano = Authorization Code. M2M / Admin REST = skill `nestjs-keycloak-admin`.

## Proibido

- `keycloak-js` / next-auth / OIDC no browser
- Env `KC_*` no frontend
- Header `Authorization` no axios
- Token em localStorage
- Trocar `code` no Next / PKCE no frontend
- Concatenar URL — `API_ROUTES` + `buildApiRoute`

## Fluxo

1. `getLoginUrl()` — `authless.get` GET login-url (`withCredentials`)
2. `window.open(url, '_self', 'noopener,noreferrer')`
3. Keycloak volta `{app}/verify-credentials?code=&state=`
4. `verifyCredentials` POST `{ code, state }` → `{ adminUser }`
5. `updateUserSession` + `push(redirect_to)`

## Arquivos

```
src/lib/providers/auth-provider/index.tsx
src/contexts/auth-context/index.ts
src/hooks/use-auth/index.ts
src/lib/providers/axios/api/index.ts
src/proxy.ts
src/app/(public)/(auth)/verify-credentials/page.tsx
```

Root: `TanstackQueryClientProvider` > `AuthProvider` > resto.

## Provider (ler o arquivo)

`AuthProvider` guarda user em React state. `RefreshTokenQueue` no interceptor de `api`.

- `getLoginUrl` / `getLogoutUrl` / `verifyCredentials` / `refresh` / `terminateSession`
- Mount: se rota **não** pública, `refresh()` via `authless`
- `isSessionResolved`: `false` até o primeiro refresh. Roles vazio nesse intervalo ≠ sem permissão
- Sessão morta: limpa state → `authless.get` logout-url (expira cookie) → `/?session=expired`
- Logout intencional: `api.get` logout-url → `window.location.assign(url)`

## Axios

`api` + `authless`: `baseURL` backend, `withCredentials: true`. Cookie sozinho. Sem Bearer. `authless` = login-url, refresh, logout expirado.

## Contrato BFF (admin)

| Método | Path | Client |
|--------|------|--------|
| GET | `/auth/keycloak/admin/get-login-url` | `authless` |
| POST | `/auth/keycloak/admin/verify-credentials` | `api` |
| POST | `/auth/keycloak/admin/refresh` | `authless` |
| GET | `/auth/keycloak/admin/get-logout-url` | `api` / `authless` |

Cookie name = `NEXT_PUBLIC_COOKIE_SESSION_ID` = backend `SESSION_NAME`. Flags do cookie **só** no backend.

## `proxy.ts` (Next 16)

Só presença do cookie. Sem cookie + privada → `/`. Cookie + login **sem** `?session=expired` → `/home`. `/verify-credentials` stay. `?session=expired` quebra cookie zumbi.

## Callback `/verify-credentials`

`requestedRef` anti double-call. Sem `code`/`state` → login. `verifyCredentials({ code, state, redirect_to: HOME })`.

## Roles

Client roles kebab PT. Layout: `ROLES.ACCESS`. Página: `AuthorizationWrapper`. Hide: `useVerifyAuthorization`. Esperar `isSessionResolved`.
