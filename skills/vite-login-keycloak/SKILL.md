---
name: vite-login-keycloak
description: Authorization Code Flow Keycloak em Vite + TanStack Router via BFF. Cookie httpOnly, callback /verify-credentials, beforeLoad guard, KeycloakAuthProvider, 401 queue. Use when implementing Vite Keycloak login, keycloak-auth-provider, verify-credentials route, or SPA session with withCredentials.
---

# Vite Keycloak authorization

SPA **nunca** fala com Keycloak. Axios + rotas: `vite-api`. M2M: `nestjs-keycloak-admin`.

## Exemplos

- [`examples/keycloak-auth-provider.tsx`](examples/keycloak-auth-provider.tsx) — **obrigatório**. Copiar.
- [`examples/keycloak-auth-context.ts`](examples/keycloak-auth-context.ts)
- [`examples/use-keycloak-auth.ts`](examples/use-keycloak-auth.ts)
- [`examples/app.tsx`](examples/app.tsx) — `InnerRouter` injeta context no `RouterProvider`
- [`examples/axios-instances.ts`](examples/axios-instances.ts)
- [`examples/auth-endpoints.ts`](examples/auth-endpoints.ts)
- [`examples/get-login-url.ts`](examples/get-login-url.ts)
- [`examples/verify-credentials.ts`](examples/verify-credentials.ts)
- [`examples/refresh-token-queue.ts`](examples/refresh-token-queue.ts)
- [`examples/admin-before-load.ts`](examples/admin-before-load.ts)

## Proibido

- `keycloak-js` / PKCE / env `VITE_KEYCLOAK_*`
- Trocar `code` no SPA / Bearer no axios (exceto proxy `/media`)
- `useKeycloakAuth()` em componente de rota — usar `Route.useRouteContext()`
- Concatenar URL

## Fluxo

1. `getLoginUrl()` → `authless.get` → `window.open(url, '_self')`
2. `/verify-credentials?code=&state=`
3. `verifyCredentials` POST via `authless` → `updateUserSession` → navigate
4. Guard `beforeLoad`: `refresh()` se sem `currentUser`

## Provider

Ler `keycloak-auth-provider.tsx`. Faz:

- State: `currentUser`, `hasAccess`, `canViewSensitiveActions`, flags extras (Petim via env)
- `updateUserSession` deriva flags das roles
- Interceptor 401 em `api` via `useEffectEvent` + `RefreshTokenQueue`
- Fail: `handleUnauthorizedError` → toast + `authless` logout-url + `/login?unauthorized=true`

```tsx
<KeycloakAuthProvider>
  <InnerRouter /> {/* useKeycloakAuth() → RouterProvider context={{ auth: { keycloak } }} */}
</KeycloakAuthProvider>
```

`useKeycloakAuth` **só** no `app.tsx` (InnerRouter). Throw se fora do provider.

## Contrato BFF

GET login-url (`authless`) · POST verify (`authless`) · POST refresh (`authless`) · GET logout (`api` / `authless`). Paths em `API_ROUTES.*.AUTH.*`.

User: `id`, `name`, `email`, `emailVerified`, `roles`, `petimRoles`. Sem persist — reload chama `refresh()`.

## Guard

`beforeLoad`: `currentUser ?? await refresh()`. Sem user → `/login`. Sem role `acesso` → toast + login unauthorized.

## 401

Skip 403, `_retry`, URLs de auth. Enqueue se refresh em curso. Fail → `getLogoutUrl` / terminate. Cookie **não** apaga no frontend.

## Roles

`ROLES.ACCESS` = `acesso`. UI sensível: `canViewSensitiveActions` via `useRouteContext().auth.keycloak`.
