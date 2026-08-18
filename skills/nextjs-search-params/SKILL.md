---
name: nextjs-search-params
description: Search params (nuqs) para listagem e modais em módulos admin CRUD. Use when working on Next.js App Router admin CRUD modules, nuqs search params, prefixed URL keys, or useModalControlQuery drawers.
---

# Search params — módulos admin

## Hook de listagem (`functions/use-{entity}-search-params.ts`)

- `'use client'` + `nuqs` (`parseAsString`, `parseAsInteger`, `parseAsBoolean`).
- Prefixo único por módulo (`po_`, `prd_`, `bs_`, `rnk_`) em **todas** as keys para evitar colisão.
- Keys mínimas: `{prefix}_search`, `{prefix}_page`.
- Exportar `default{Entity}SearchParams`.
- Debounce: `useDebounce(search, env.NEXT_PUBLIC_DEFAULT_DEBOUNCE_IN_MS, { onDebounce: (v) => v && setPage(1) })`.
- `clearSearch`: `setSearch('')` + `setPage(1)`.
- Retorno: `search`, `setSearch`, `page`, `setPage`, `debouncedSearch`, `clearSearch` (+ filtros extras).

## Filtros extras (quando o módulo precisar)

- Products: `prd_active`, `prd_main`, `prd_hideInProgress`.
- Banner-set: `bs_active`, `bs_routeIdFilter`.
- Rankings: só search + page (sem `stickyHeader` morto).
- Passar filtros para `useGetAll{Entity}({ search: debouncedSearch, page, ...filters })`.

## Modais via URL (`useModalControlQuery`)

Hook: `hooks/use-modal-control-query/index.ts`.

| Uso | action_name | key |
|-----|-------------|-----|
| Create drawer | `create-{entity}` | `{prefix}_modal` |
| Edit drawer | `` `edit-{entity}:${id}` `` | `{prefix}_modal` |
| Dialog extra | `` `about-{entity}:${id}` `` etc. | `{prefix}_modal` |
| Upload progress | `upload-progress` (default) | `{prefix}_progress` |

- Cada action renderiza `<Fragment>` com `Button` + drawer/dialog montado junto.
- Edit com ID no `action_name` → um drawer por item.

## Modais com params próprios

Quando o modal tem filtros internos (ex.: product eligible users), criar hook dedicado em `functions/` com prefixo do módulo (`prd_eligible_*`).
