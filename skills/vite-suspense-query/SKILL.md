---
name: vite-suspense-query
description: useSuspenseQuery + Suspense + ErrorBoundary + Skeleton (shadcn) + resetQueries. Use when wiring GET detail/list with suspense, ErrorBoundary retry, query skeletons, or QueryDefaultErrorView.
---

# Suspense Query (TanStack)

Padrão obrigatório para GET que alimenta tela/seção: **não** `isPending`/`isError` no consumidor. Dados via `useSuspenseQuery`; loading/erro via boundary.

Complementa [`vite-query`](../vite-query/SKILL.md) (estrutura `index` / `query-key` / `use-index`).

## Exemplos

- [`examples/use-index.ts`](examples/use-index.ts) — `useSuspense*` + `useQuery` opcional
- [`examples/query-key.ts`](examples/query-key.ts)
- [`examples/index.ts`](examples/index.ts) — Entity + fetch
- [`examples/get-query-client.ts`](examples/get-query-client.ts)
- [`examples/reset-queries.ts`](examples/reset-queries.ts)
- [`examples/error-boundary.tsx`](examples/error-boundary.tsx)
- [`examples/skeleton.tsx`](examples/skeleton.tsx) — primitivo shadcn
- [`examples/query-default-error-view.tsx`](examples/query-default-error-view.tsx)
- [`examples/page-skeleton.tsx`](examples/page-skeleton.tsx) — fallback composto
- [`examples/route-with-suspense.tsx`](examples/route-with-suspense.tsx) — wiring completo

## Checklist (ordem)

1. Fetch + tipo + `*_query_key` em `shared/functions/tanstack-query/<domain>/<op>/` ([`vite-query`](../vite-query/SKILL.md))
2. Hook `useSuspenseX` com `useSuspenseQuery` (mesmo `queryKey`/`queryFn` do `useQuery` se existir)
3. Garantir `getQueryClient()` singleton usado no `QueryClientProvider`
4. Ter `ErrorBoundary`, `Skeleton` (shadcn), `QueryDefaultErrorView`, `resetQueries`
5. Shell da página/seção: `ErrorBoundary` → `Suspense` → filho que chama `useSuspense*`
6. `fallback` do Suspense = skeleton que espelha layout real (não spinner genérico)
7. `fallback` do boundary = error view + `resetQueries` da key + `retry()`

## Onde vive cada peça

| Peça | Path |
|------|------|
| Fetch + Entity | `shared/functions/tanstack-query/<domain>/<op>/index.ts` |
| Query key | `…/query-key.ts` |
| Hook suspense | `…/use-index.ts` → `useSuspenseGetX` / `useSuspensePublicListX` |
| `getQueryClient` | `lib/providers/tanstack-query.ts` |
| `resetQueries` | `shared/functions/reset-queries/index.ts` |
| `ErrorBoundary` | `components/ui/error-boundary.tsx` |
| `Skeleton` | `components/ui/skeleton.tsx` (shadcn) |
| Error UI retry | `components/query-default-error-view.tsx` |
| Page/section skeleton | `routes/…/-shared/components/*-skeleton.tsx` |
| Consumidor | filho **dentro** do `Suspense` (nunca o shell com toggle/header estático) |

## Hook

```ts
export function useSuspenseGetWidgetById({ widget_id }: Params) {
  return useSuspenseQuery({
    queryKey: private_get_widget_by_id_query_key({ widget_id }),
    queryFn: async () => await privateGetWidgetById({ widget_id }),
  });
}
```

- Nome: `useSuspense` + mesmo radical do fetch (`useSuspensePublicListPlans`, `useSuspenseGetEventById`)
- **Proibido** `enabled: false` em suspense (use `useQuery` se condicional)
- `data` sempre definido no consumidor — sem `data?`

## Wiring na UI

```tsx
export function RouteComponent() {
  const query_client = getQueryClient();
  const { id } = Route.useParams();

  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <QueryDefaultErrorView
          error={error}
          retry={() => {
            resetQueries({
              query_client,
              query_keys_to_reset: private_get_widget_by_id_query_key({ widget_id: id }),
            });
            retry();
          }}
        />
      )}
    >
      <Suspense fallback={<WidgetDetailSkeleton />}>
        <WidgetDetail widget_id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

function WidgetDetail({ widget_id }: { widget_id: string }) {
  const { data: widget } = useSuspenseGetWidgetById({ widget_id });
  return <… />;
}
```

### Regras

- Ordem: **ErrorBoundary por fora**, **Suspense por dentro**
- Retry: `resetQueries` **antes** de `retry()` do boundary (limpa cache da família)
- Header/filtros estáticos **fora** do Suspense (não piscam no loading)
- Nested Suspense OK para seções lazy (fallback menor por bloco)
- Skeleton = composição de `Skeleton` shadcn espelhando cards/tabela/hero da seção

## Anti-padrões

- `useQuery` + `if (isPending)` / `if (isError)` no mesmo componente que renderiza dados suspense
- Spinner genérico no lugar de skeleton de layout
- `retry()` sem `resetQueries` (erro volta do cache)
- `useSuspenseQuery` sem boundary pai → erro sobe sem UI
- Duplicar `new QueryClient()` fora do singleton `getQueryClient`

## Naming

| Tipo | Padrão |
|------|--------|
| Hook suspense | `useSuspenseGetWidgetById` / `useSuspensePublicListPlans` |
| Skeleton seção | `WidgetDetailSkeleton` / `PricingPlansSkeleton` |
| Error view | `QueryDefaultErrorView` |
