---
name: vite-api
description: Axios API client, Keycloak auth, API_ROUTES e buildApiRoute. Use when adding API endpoints, axios client, Keycloak, API_ROUTES, buildApiRoute, or 401 refresh.
---

# API e auth

## Exemplos

- [`examples/axios-instances.ts`](examples/axios-instances.ts)
- [`examples/api-routes.ts`](examples/api-routes.ts)
- [`examples/build-api-route.ts`](examples/build-api-route.ts) — **copiar inteiro**. Tipagem `AllApiPaths` + params obrigatórios. Regex simples **erra**.

## Client

`lib/providers/api`: `api` (401 interceptor) + `authless` (refresh/login/logout). `withCredentials: true`. Sem Bearer.

Auth: skill `vite-login-keycloak`.

## `buildApiRoute`

Ler o example. Comportamento:

- `Path extends AllApiPaths` — só path da árvore `API_ROUTES`
- Sem `:param` no path → **não** aceita 2º argumento
- Com `:param` → objeto **exato** das keys (`{ prompt_id }`)
- Runtime: replace `:name`; missing → `throw new Error(\`Missing parameter "${paramName}" for path "${path}"\`)`

```ts
buildApiRoute(API_ROUTES.DELETE.PRIVATE.PROMPTS.DELETE_PROMPT, { prompt_id })
```

**Nunca** concatenar URL.

## Erros

Actions: `handleErrorTreatment(error)` + `on_fail`.
