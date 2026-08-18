---
name: vite-login-keycloak
description: Authorization Code Flow Keycloak em Vite + TanStack Router via BFF. Cookie httpOnly, callback /verify-credentials, beforeLoad guard, KeycloakAuthProvider, 401 queue. Use when implementing Vite Keycloak login, keycloak-auth-provider, verify-credentials route, or SPA session with withCredentials.
---

# Vite Keycloak authorization

Padrão de `passin-frontend`. SPA **nunca** fala com Keycloak. BFF Nest monta URL, troca `code`, seta cookie. Sem `keycloak-js`, sem `oidc-client`. Axios + rotas: skill `vite-api`. M2M / Admin REST: skill `nestjs-keycloak-admin`.

## Proibido

- `keycloak-js` / `oidc-client` / PKCE no SPA
- Env `VITE_KEYCLOAK_*` / client id / realm / secret
- Trocar `code` no frontend
- Ler/escrever cookie de token no app (`cookie-client` é leftover)
- Header `Authorization` no axios (proxy `/media` no Vite é exceção)
- Token em localStorage
- `useKeycloakAuth()` em componente de rota — usar `Route.useRouteContext()`
- Concatenar URL — `API_ROUTES` + `buildApiRoute`

## Fluxo

1. `/login` — form chama `getLoginUrl()` (sem senha)
2. `authless.get` `GET /auth/keycloak/get-login-url`
3. `{ url }` → `window.open(url, '_self', 'noopener,noreferrer')`
4. Keycloak volta `/verify-credentials?code=&state=`
5. `beforeLoad` exige `code`+`state`; senão redirect `/`
6. `POST /auth/keycloak/verify-credentials` `{ code, state }`
7. `{ user }` → `updateUserSession` → navigate `/admin/events`

## Arquivos

```
src/lib/providers/keycloak-auth-provider/index.tsx
src/contexts/keycloak-auth-context/index.ts
src/hooks/use-keycloak-auth/index.ts      # só app.tsx injeta no router
src/lib/providers/api/index.ts
src/shared/classes/refresh-token-queue.ts
src/app.tsx                               # KeycloakAuthProvider wrap
src/router.tsx                            # RouterContext.auth.keycloak
src/routes/_public/login/index.tsx
src/routes/_public/verify-credentials/index.tsx
src/routes/admin/layout.tsx               # beforeLoad guard
src/shared/constants/roles/index.ts
src/shared/constants/api-routes/index.ts
src/shared/constants/env-variables/index.ts
```

Colocation: `-shared` nas rotas. `_public` é pathless.

## Axios

```ts
const keycloakAxiosConfigWithCredentials = {
  baseURL: backend_url,
  withCredentials: true,
};

const api = axios.create(keycloakAxiosConfigWithCredentials);
export const authless = axios.create(keycloakAxiosConfigWithCredentials);
```

Mesmo config. `api` tem interceptor 401. `authless` = refresh / get-login-url / logout expirado.

Env Zod: `VITE_TOKEN_KEY` (nome do cookie, ex. `passin_token`), `VITE_COOKIE_DOMAIN`, `VITE_BACKEND_*`. App **não lê** o cookie. Consumir só via `env` / `backend_url` (skill `vite-env`).

## Contrato BFF

| Método | Path | Client | Resp |
|--------|------|--------|------|
| GET | `/auth/keycloak/get-login-url` | `authless` | `{ url }` |
| POST | `/auth/keycloak/verify-credentials` | `api` | `{ user }` |
| POST | `/auth/keycloak/refresh` | `authless` | `{ user }` |
| GET | `/auth/keycloak/get-logout-url` | `api` / `authless` | `{ url }` |

Paths em `API_ROUTES.GET/POST.PUBLIC|PRIVATE.AUTH.*`.

User em memória:

```ts
interface KeycloakCurrentUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  cpfCnpj: string;
  roles: Array<Role>;
  passin_user_id: string;
}
```

Reload → `refresh()` no `beforeLoad` de `/admin`. Sem persist.

## Provider + router

```tsx
<KeycloakAuthProvider>
  <InnerRouter /> {/* useKeycloakAuth() → RouterProvider context={{ auth: { keycloak } }} */}
</KeycloakAuthProvider>
```

`router.tsx`: `RouterContext { auth: { keycloak: KeycloakAuthContextProps } }`.

Flags derivadas em `updateUserSession`:

- `hasAccess` = role `acesso`
- `canViewSensitiveActions` = `administrador-comum` **ou** `administrador-geral`
- `isGeneralAdministrator` = `administrador-geral`

UI: `AdminLayoutRoute.useRouteContext().auth.keycloak` — `hidden={!canViewSensitiveActions}`.

## Guard `admin/layout.tsx`

```ts
beforeLoad: async ({ context, location }) => {
  const user = context.auth.keycloak.currentUser ?? (await context.auth.keycloak.refresh());

  if (!user) {
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }

  if (!user.roles.includes(ROLES.ACCESS)) {
    toast.error('Você não tem permissão para acessar esta página');
    throw redirect({
      to: '/login',
      search: { redirect: location.href, unauthorized: true },
    });
  }
},
```

Login `beforeLoad`: se `currentUser`, redirect `search.redirect ?? '/admin/events'`.

Rotas públicas (`/`, evento, check-in) **sem** auth.

## Callback

Search params Zod: `code`, `state`, `errorExists`. Verify **no** `beforeLoad` via `context.auth.keycloak.verifyCredentials({ code, state })`.

Login search: `redirect` opcional, `unauthorized` boolean.

## 401

`RefreshTokenQueue`: `isInProgress`, `enqueue`, `flush(error?)`, `setRefreshing`.

Interceptor em `api` (registrar no `useEffect` / `useEffectEvent`):

- Skip 403, `_retry`, URL refresh/logout
- Refresh rodando → enqueue → `api(originalRequest)`
- Senão `refresh()` → `flush` → retry
- Fail: `getLogoutUrl()` + `flush(err)`

Sessão expirada: zera state, toast, `authless.get` logout, `/login?unauthorized=true`. Frontend **não** apaga cookie.

Logout intencional: `api.get` logout-url → `window.open(url, '_self', 'noopener,noreferrer')`.

## Roles

```ts
export const ROLES = {
  ACCESS: 'acesso',
  COMMON_ADMINISTRATOR: 'administrador-comum',
  GENERAL_ADMINISTRATOR: 'administrador-geral',
  VIEWER: 'visualizador',
} as const;
```

CRUD realm admin (listar users, criar/remover admin) é feature, não login. Só `isGeneralAdministrator`. Shape Keycloak (`id`, `username`, `attributes.pass_in_user_id`). Create `{ user_id, roles: Role[] }`.

## Erros

`try/catch` → `handleErrorTreatment(error)` (Zod + Axios → sonner).
