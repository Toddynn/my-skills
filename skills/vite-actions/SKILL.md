---
name: vite-actions
description: Actions hooks da rota, mutations no consumidor, invalidate via query-key fn. Use when creating use-*-actions, mutations, invalidateQueries, or moving mutations out of tanstack-query.
---

# Actions e API (rota)

## Exemplos

- [`examples/use-prompts-actions.ts`](examples/use-prompts-actions.ts) — canônico (prompts)

## Separação

| Camada | Onde | O quê |
|--------|------|-------|
| GET | `shared/functions/tanstack-query/...` | fetch + query-key + hook |
| Mutations | `routes/.../-shared/functions/use-*-actions.ts` | api + invalidate |
| `useMutation` | formulary **ou** delete/action | toast + callbacks |

**Nunca** `tanstack-query/mutation/`.

## `use*Actions`

Copiar o example. Regras:

- Args: `BaseActionArgs<TForm>` / `BaseCallbackArgs` + id
- `try/catch` → `handleErrorTreatment` → `on_fail?.(error)`
- Rotas: `API_ROUTES` + `buildApiRoute` — params objeto (`{ prompt_id }`)
- Invalidate: **sempre** fn `*_query_key({})` — nunca array literal
- Zod: resolver no **formulary**. Action manda `form_data` já validado (prompts **não** chama `parseAsync` de novo)
- Return tipado (`UsePromptsActionsResult`)

## Consumidor

`useMutation` no formulary/botão. `query_keys_to_invalidate` + `on_success` (toast, fechar modal) no call.
