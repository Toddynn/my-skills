---
name: vite-forms
description: React Hook Form + Zod formularies (Controller/Field shadcn). Use when creating forms, Zod schemas, Controller/Field, formularies, or RHF + shadcn Field.
---

# Formularies e validação

## Onde fica cada pedaço

| Peça | Local |
|------|-------|
| Schema Zod CRUD | `routes/<module>/-shared/schemas/` |
| Interface do form | `routes/<module>/-shared/interfaces/*-form.ts` |
| Formulary UI | `components/ui/formularies/<domain>/` |
| File schema global | `shared/schemas/file-schema.ts` |

## useForm

```ts
useForm<FormType>({
  defaultValues: { … },
  disabled: isPending,
  resolver: standardSchemaResolver(ZodSchema),
});
```

- Zod v4 (`zod/v4`)
- Strings: `.trim().min(1, '…')` — nunca validar só `undefined`
- Submit: `handleSubmit(onSubmit)` → só chama action se Zod do form passar

## Campos — padrão

Todo campo com `Controller` + shadcn `Field`:

```tsx
<Controller
  name="sourceUrl"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>
        Label <FieldLabelRequired />
      </FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupInput {...field} id={field.name} aria-invalid={fieldState.invalid} />
        </InputGroup>
      </FieldContent>
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

- **Não** esconder `Controller` em wrapper opaco
- Switch/boolean: `Field` horizontal + `Switch`

## Mutation no formulary

```ts
const { mutateAsync, isPending } = useMutation({
  mutationFn: async (form_data) =>
    await createX({
      form_data,
      query_keys_to_invalidate: private_get_all_x_query_key({}),
      on_success: () => handleSuccess(),
    }),
});
```

- Toast no success do formulary
- `actions: React.ReactNode` = footer do modal (submit/reset/cancel via `form={id}`)
- `on_success_callback` fecha modal

## Props padrão

```ts
interface Props {
  actions: React.ReactNode;
  on_success_callback?: () => void;
  on_fail_callback?: () => void;
}
```

Edit recebe também a entidade.

## Named export

`export function CreateExternalVideoFormulary` — sem default.
