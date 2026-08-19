---
name: vite-query
description: TanStack Query — estrutura get, query keys, infinite pagination. Use when creating GET queries, query-key.ts, useInfiniteQuery, invalidateQueries, or InfiniteList pagination.
---

# TanStack Query

## Exemplos

- [`examples/index.ts`](examples/index.ts) — Entity + fetch
- [`examples/query-key.ts`](examples/query-key.ts) — `*_query_key`
- [`examples/use-index.ts`](examples/use-index.ts) — `useInfiniteQuery`

## Árvore por recurso

```
shared/functions/tanstack-query/<domain>/<operation>/
├── index.ts        # tipo Entity + privateGetX (axios)
├── query-key.ts    # private_get_x_query_key(params) => QueryKey
└── use-index.ts    # useInfiniteQuery | useSuspenseQuery | useQuery
```

## `query-key.ts`

```ts
export const private_get_all_external_videos_query_key = ({ search }: Params): QueryKey => [
  'private-get-all-external-videos',
  search,
];
```

- Nome da fn: **snake_case** `private_get_*_query_key`
- 1º elemento da key: string estável da família
- Incluir filtros relevantes (search, ids…) — não hardcode em call sites

## Hook de listagem (paginação infinita)

```ts
export const usePrivateGetAllExternalVideos = ({ search, page = 1, limit = 10, enabled = true }) =>
  useInfiniteQuery({
    queryKey: private_get_all_external_videos_query_key({ search }),
    queryFn: async ({ pageParam }) => await privateGetAllExternalVideos({ search, page: pageParam, limit }),
    initialPageParam: page,
    getNextPageParam: ({ currentPage, totalPages }) => getNextPageParam({ currentPage, totalPages }),
    placeholderData: keepPreviousData,
    enabled,
  });
```

- UI: `InfiniteList` + `onEndReached={fetchNextPage}`
- Response tipada com `DefaultPaginatedResponse<T>`

## Detail

- Preferir `useSuspenseQuery` quando a rota já garante dados (loader/`beforeLoad`/suspense boundary)

## Invalidação

```ts
await invalidateQueries({
  query_client,
  query_keys_to_invalidate: private_get_all_external_videos_query_key({}),
});
```

- Sempre via fn de `query-key.ts`
- Helper invalida por família (1º segmento da key) — passar a fn, não inventar key

## Naming

| Tipo | Padrão |
|------|--------|
| Fetch fn | `privateGetAllExternalVideos` |
| Query key fn | `private_get_all_external_videos_query_key` |
| Hook | `usePrivateGetAllExternalVideos` / `useSuspenseGetExternalVideoById` |

Entidade (`ExternalVideo`, …) exportada no `index.ts` do get.
