---
name: search-params-url
description: Search params na URL via TanStack Router, debounce e query-states. Use when adding filters, pagination, tabs, validateSearch, use-*-query-states, or URL search params in TanStack Router. Do not use nuqs.
---

# Search params (URL)

**Sem nuqs.** Estado de filtro/paginação/tab/modal fica na URL via TanStack Router.

## Schema na rota

`routes/<module>/-shared/schemas/*-search-params.ts`:

```ts
export const videosSearchParamsDefaults = {
  page: '1',
  limit: '10',
  videos_search: '',
  // …
};

export const VideosSearchParamsSchema = object({
  page: string().optional().default(videosSearchParamsDefaults.page),
  limit: string().optional().default(videosSearchParamsDefaults.limit),
  videos_search: string().optional().default(videosSearchParamsDefaults.videos_search),
}).extend(modalControlSearchParams.shape);

export type VideosSearchParams = InferZod<typeof VideosSearchParamsSchema>;
```

- Valores na URL: **strings** (`page`, `limit`)
- Keys de busca: **snake_case** e prefixadas por domínio (`videos_search`, `completions_search`)
- Sempre estender `modalControlSearchParams` quando a página tiver modais
- Exportar `*SearchParamsDefaults` para reset e `<Link search={…}>`

## Na definição da rota

```ts
validateSearch: (search) => VideosSearchParamsSchema.parse(search),
```

## Hook `use-*-query-states`

`routes/<module>/-shared/functions/use-*-query-states.ts`:

- Importar `Route` da página e usar `Route.useSearch()` + `Route.useNavigate()`
- Setters: `navigate({ search: (prev) => ({ …prev, field: value }), replace: true })`
- `reset(field)` → volta ao default do schema
- Debounce search: `useDebounce(search, env.VITE_DEFAULT_DEBOUNCE_IN_MS, { onDebounce: () => reset('page') })`
- Retornar valor cru + `debounced*` + setters + `Number(page)` / `Number(limit)` na borda

## O que vai na URL vs zustand

| URL | Zustand |
|-----|---------|
| page, limit, search, tab, filtros | seleção em modal, files upload, UI persistida |

## Listagem

- Header/input usa valor **não** debounced
- Query TanStack usa **debounced** search
- Infinite scroll: `InfiniteList` + `fetchNextPage`
