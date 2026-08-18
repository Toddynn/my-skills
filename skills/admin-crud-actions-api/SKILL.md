---
name: admin-crud-actions-api
description: Actions hook, context, TanStack GET e invalidação em módulos admin CRUD. Use when creating use-{entity}-actions, actions context, TanStack GET queries, or invalidateQueries in Next.js admin modules.
---

# Actions e API — módulos admin

## Separação de responsabilidades

| Camada | Onde | O quê |
|--------|------|-------|
| GET | `shared/functions/tanstack-query/get/{entity}/` | `getAll`, `query-key.ts`, `use-index.ts` |
| Mutations | `app/(private)/{module}/shared/functions/use-{entity}-actions.ts` | `api.post/patch/delete`, Zod parse, invalidate |
| `useMutation` | formulary ou delete action | wrapper fino + toast + callbacks |

**Nunca** criar `tanstack-query/mutation/` separado — mutations ficam no actions hook; `useMutation` só no consumidor.

## `use{Entity}Actions`

- Retorno snake_case: `create_{entity}`, `edit_{entity}`, `delete_{entity}` (+ extras: `delete_media`, `update_media_icon`, etc.).
- Args create/edit: `BaseActionArgs<FormFields>` + `on_success`, `on_fail`, `query_keys_to_invalidate`.
- Args delete: `BaseCallbackArgs` + `{entity}_id`.
- Sempre `handleErrorTreatment(err)` no catch — não engolir erro.
- Invalidar via `invalidateQueries({ query_client, query_keys_to_invalidate })`.
- Exportar `{entity}_invalidation_keys` quando várias keys forem reutilizadas (products, banner-sets).

## Com mídia (posts, products, banner-set)

- `abort_controller_ref` + `request_progress` (0–100) via `onUploadProgress`.
- `FormData` + `multipart_form_header`.
- Builder privado `buildCreate{Entity}FormData` / `appendArchives`.
- Form fields → actions junta `files` do zustand como `archives` → parse com schema API.

## Sem mídia (rankings)

- JSON direto: `api.post(route, parsed_data)`.
- Sem `abort_controller_ref`, sem `request_progress`, sem `ProgressModal`.

## Context

```tsx
// shared/contexts/{entity}-actions-context.tsx
{Entity}ActionsProvider + use{Entity}ActionsContext()
```

- Provider **só** nos drawers create/edit.
- Formularies consomem `use{Entity}ActionsContext()`.
- Delete actions chamam `use{Entity}Actions()` **direto** (fora do provider).

## TanStack GET

```
get-all-{entity}/
  index.ts      # função fetch + interface Entity
  query-key.ts  # prefix string estável ('get-all-posts')
  use-index.ts  # useQuery
```

- Query key inclui filtros usados na listagem (`page`, `search`, etc.).
