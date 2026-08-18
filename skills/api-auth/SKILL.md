---
name: api-auth
description: Axios API client, Keycloak auth, API_ROUTES e buildApiRoute. Use when adding API endpoints, axios client, Keycloak, API_ROUTES, buildApiRoute, or 401 refresh.
---

# API e auth

## Client

`lib/providers/api`:

- `api` — axios com `baseURL: backend_url`, `withCredentials: true`, interceptor 401
- `authless` — refresh/logout sem loop de interceptor

## Auth Keycloak

- Provider + context: `lib/providers/keycloak-auth-provider`, `contexts/keycloak-auth-context`
- Hook: `useKeycloakAuth()`
- 401 → fila `refresh-token-queue` → retry
- Roles em `shared/constants/roles` (+ roles Petim via env)

## Rotas tipadas

```ts
buildApiRoute(API_ROUTES.DELETE.PRIVATE.VIDEOS.DELETE_EXTERNAL_VIDEO, { external_video_id })
```

- Árvore em `shared/constants/api-routes`
- **Nunca** concatenar URL de endpoint na mão
- Params de path via objeto no `buildApiRoute`

## Erros

- Actions: `try/catch` → `handleErrorTreatment(error)` → `on_fail?.(error)`
- `handleErrorTreatment` → toast sonner (Zod + Axios)
- Guards de rota: toast + `redirect` quando sem auth

## Skills irmãs

Login Keycloak completo: `vite-keycloak-authorization` (Vite) / `nextjs-keycloak-authorization` (Next). Admin REST / M2M: `keycloak-admin-rest`.

## Proxy dev

`/media` proxied no Vite para o backend (cookies/token) — não reinventar fetch de blob sem checar o get existente em `tanstack-query/medias`.
