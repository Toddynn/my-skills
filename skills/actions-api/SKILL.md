---
name: actions-api
description: Actions hooks da rota, mutations no consumidor, invalidate via query-key fn. Use when creating use-*-actions, mutations, invalidateQueries, or moving mutations out of tanstack-query.
---

# Actions e API (rota)

## Separação

| Camada | Onde | O quê |
|--------|------|-------|
| GET | `shared/functions/tanstack-query/...` | fetch + query-key + hook |
| Mutations imperativas | `routes/.../-shared/functions/use-*-actions.ts` | api + Zod parse + invalidate |
| `useMutation` | formulary **ou** delete/action button | wrapper fino + toast + callbacks |

**Nunca** criar `tanstack-query/mutation/`. Mutations ficam no actions hook; `useMutation` só no consumidor.

## `use*Actions`

```ts
export function useExternalVideosActions() {
  const query_client = getQueryClient();

  const createExternalVideo = async ({ form_data, on_success, on_fail, query_keys_to_invalidate }: CreateArgs) => {
    try {
      const parsed = await CreateSchema.parseAsync(form_data);
      const response = await api.post(buildApiRoute(API_ROUTES.POST.…), parsed);
      if (query_keys_to_invalidate) await invalidateQueries({ query_client, query_keys_to_invalidate });
      on_success?.(response.data);
    } catch (error) {
      handleErrorTreatment(error);
      on_fail?.(error);
    }
  };

  return { createExternalVideo, editExternalVideo, deleteExternalVideo };
}
```

- Args: `BaseActionArgs<TForm, TResponse>` / `BaseCallbackArgs`
- Sempre `handleErrorTreatment` no catch
- Rotas via `API_ROUTES` + `buildApiRoute` — sem URL hardcoded

## Invalidação — rastreabilidade

```ts
query_keys_to_invalidate: private_get_all_external_videos_query_key({}),
```

- **Sempre** chamar a função `*_query_key` do módulo da query
- **Nunca** passar array literal / string hardcoded (`['private-get-…']`)
- Assim a key continua rastreável a partir do arquivo `query-key.ts`

## Consumidor

```ts
useMutation({
  mutationFn: async (form_data) =>
    await createExternalVideo({
      form_data,
      query_keys_to_invalidate: private_get_all_external_videos_query_key({}),
      on_success: () => { toast.success('…'); on_success_callback?.(); },
    }),
});
```
