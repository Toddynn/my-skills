---
name: vite-forms
description: React Hook Form + Zod formularies (Controller/Field shadcn). Use when creating forms, Zod schemas, Controller/Field, formularies, or RHF + shadcn Field.
---

# Formularies e validação

Canônico: `CreatePromptFormulary`. **Não** `useFormContext` em field separado. `useForm` + `Controller` no mesmo arquivo.

## Exemplos

- [`examples/create-prompt-formulary.tsx`](examples/create-prompt-formulary.tsx)
- [`examples/create-prompt-schema.ts`](examples/create-prompt-schema.ts)
- [`examples/create-prompt-form.ts`](examples/create-prompt-form.ts) — `InferZod<typeof Schema>`

## Onde

| Peça | Local |
|------|-------|
| Schema Zod | `routes/<module>/-shared/schemas/` |
| Tipo form | `routes/<module>/-shared/interfaces/*-form.ts` |
| Formulary | `components/ui/formularies/<domain>/` |

## useForm

```ts
useForm<CreatePromptForm>({
  defaultValues: { title: '', template: '', isPublic: false, categoryId: '' },
  disabled: isPending,
  resolver: standardSchemaResolver(CreatePromptSchema),
});
```

- Zod v4 (`zod/v4`). String: `.trim().min(1, '…')` + `string({ error: (issue) => issue.input === undefined ? '… obrigatório' : undefined })`.
- `<form id="…" onSubmit={handleSubmit(onSubmit)} onReset={handleReset}>`
- `{actions}` **dentro** do form (footer do modal injeta botões `form={id}`).
- Named export `export function CreatePromptFormulary`.

## Campos

Todo campo: `Controller` + `Field` + `FieldError`. Texto: `InputGroup` + `InputGroupAddon` + `InputGroupInput`/`Textarea`. Obrigatório: `FieldLabelRequired`. Boolean: `Switch` + `Field` `orientation="responsive"` + `FieldDescription`. Select de domínio: Trigger composition (`PromptCategoriesTriggers.SelectPromptCategory`).

**Não** wrapper opaco escondendo `Controller`. **Não** `useFormContext` pra field filho neste padrão.

## Mutation

`useMutation` no formulary chama `usePromptsActions().createPrompt`. Toast + `reset()` + `on_success_callback` no success. Invalidate via fn `*_query_key` (pode ser array concat se duas lists).

## Props

```ts
interface Props {
  actions: React.ReactNode;
  on_success_callback?: () => void;
}
```

Edit recebe a entidade também.
