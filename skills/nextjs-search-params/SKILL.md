---
name: nextjs-search-params
description: Search params (nuqs) para listagem e modais em módulos admin CRUD. Use when working on Next.js App Router admin CRUD modules, nuqs search params, prefixed URL keys, or useModalControlQuery drawers.
---

# Search params — módulos admin

## Exemplos

- [`examples/use-widget-search-params.ts`](examples/use-widget-search-params.ts) — nuqs + prefixo
- [`examples/use-debounce.ts`](examples/use-debounce.ts) — copiar hook global `hooks/use-debounce`

## Hook de listagem (`shared/functions/use-{entity}-search-params.ts`)

- Path: `app/(private)/{module}/shared/functions/use-{entity}-search-params.ts` — **não** `functions/` na raiz do módulo.
- `'use client'` + `nuqs` (`parseAsString`, `parseAsInteger`, `parseAsBoolean`).
- Prefixo único por módulo (`fa_`, `po_`, `prd_`) em **todas** as keys.
- Keys mínimas: `{prefix}_search`, `{prefix}_page`.
- Exportar `default{Entity}SearchParams`.
- Debounce: todos filtros da query (search, selects, enums, arrays) via `useDebounce` com `onDebounce: () => void setPage(1)` — exceto apply por botão (confirm/clear helpers no mesmo hook).
- `clearSearch`: `setSearch('')` + `setPage(1)`.
- Input/select usa valor cru. Query usa `debounced*`.

## `useDebounce`

Copiar [`examples/use-debounce.ts`](examples/use-debounce.ts).

- Skip `onDebounce` no **primeiro** render.
- Guardar `onDebounce` em ref (não re-agendar por identity do callback).
- Cleanup `clearTimeout`.

## Modais via URL

Next: `nuqs` `useQueryState` (clube-adm). Vite: TanStack `useSearch` — skill `vite-modals`. **Não** copiar o hook Vite aqui.

| Uso | action_name | key |
|-----|-------------|-----|
| Create | `create-{entity}` | `{prefix}_modal` |
| Edit | `` `edit-{entity}:${id}` `` | `{prefix}_modal` |
| Upload progress | `upload-progress` | `{prefix}_progress` |
