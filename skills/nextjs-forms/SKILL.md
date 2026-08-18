---
name: nextjs-forms
description: React Hook Form, schemas Zod e formularies dos módulos admin CRUD. Use when creating Next.js admin forms, Zod form-fields vs API schemas, Controller/Field shadcn, or {Entity}FormularyUI barrels.
---

# Formularies e validação — módulos admin

## Schemas — split obrigatório

| Arquivo | Uso |
|---------|-----|
| `create-{entity}-form-fields-schema.ts` | react-hook-form (`standardSchemaResolver`) |
| `create-{entity}-schema.ts` | payload API (pode incluir `archives`, campos montados no actions hook) |
| `edit-{entity}-form-fields-schema.ts` | geralmente igual ao create form-fields |
| `edit-{entity}-schema.ts` | `CreateSchema.partial()` para PATCH parcial |

- Form-fields: strings com `.trim().min(1, '...')` — **nunca** validar só `undefined` (string vazia passa).
- Interfaces: `type X = infer_zod<typeof Schema>` em `interfaces/*-form-fields.ts`.
- Constantes de default (cores, limites) no schema form-fields quando fizer sentido.

## Formulary (`formularies/{entity-plural}/`)

Props padrão:

```ts
interface Props {
  id: string;
  on_success_callback?: () => void;
  on_fail_callback?: () => void;      // módulos com upload
  on_pending_change?: (is_pending: boolean) => void;
}
```

Edit recebe também `entity: Entity`.

## Composition — `{Entity}FormularyUI`

Componentes presentacionais do formulary ficam em `formularies/{entity-plural}/components/` com barrel:

```ts
// formularies/{entity-plural}/components/index.ts
export const {Entity}FormularyUI = {
  ColorPicker: RankingColorPickerInput,
  FormPreview: RankingFormPreview,
  // SeasonPicker, RangeCalendar, Summary, ListOfRoutes, etc.
};
```

- Create/edit (e modais de revisão) importam **só** `{Entity}FormularyUI` — nunca o arquivo do componente direto.
- Nomes curtos no barrel (`SeasonPicker`, `ColorPicker`, `Summary`); implementação em `{entity}-{feature}-input.tsx`.
- Helpers não-UI (`syncCampaignSeasonStore`, `buildApiPayload`) ficam export nomeado no arquivo de origem, não no barrel.
- `Controller` + `Field` permanecem no formulary; `{Entity}FormularyUI.*` é só UI dentro de `FieldContent`.

## useForm

```ts
useForm<FormFields>({
  defaultValues: { ... },
  disabled: isPending,
  resolver: standardSchemaResolver(FormFieldsSchema),
});
```

- Edit: `useEffect` + `reset(entity)` quando dados mudam.
- Submit: `handleSubmit(onSubmit)` — só chama API se Zod do form passar.

## Campos — padrão obrigatório

Todo campo com `Controller`:

```tsx
<Controller
  name="field"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>
        Label <FieldRequiredLabelIndicator />
      </FieldLabel>
      <FieldContent>
        <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      </FieldContent>
      <FieldDescription>...</FieldDescription>
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

- Texto: shadcn `Input` / `Textarea`.
- Valores numéricos: componentes em `{Entity}FormularyUI` com `sanitize-numeric-input` — inteiro (`ValueInput`) ou decimal com vírgula e até 2 casas (`CostInput`, `MultiplierInput`).
- Switch/boolean: `Field` horizontal + `Switch`.
- Color picker: `Controller` explícito no formulary + `{Entity}FormularyUI.ColorPicker` (ou equivalente) com `value`, `onChange`, `onBlur`.
- **Não** encapsular `Controller` em wrapper opaco — manter visível no formulary ou componente só UI.

## Mutation inline no formulary

```ts
const { mutateAsync: handleCreate, isPending } = useMutation({
  mutationFn: async (form_data) =>
    await create_entity({
      form_data,
      files, // se mídia
      on_success: () => handleSuccess(),
      on_fail: () => on_fail_callback?.(),
      query_keys_to_invalidate: get_all_*_query_key({}),
    }),
});
```

- `useEffect` → `on_pending_change?.(isPending)`.
- Toast de sucesso no `handleSuccess` do formulary.
- Reset form (+ revoke URLs / clear zustand) no success.
- Edit invalidate: spread de múltiplas query keys `[...get_all_*({}), ...get_one_*({ id })]`.

## Preview no form (rankings)

- `useWatch({ control })` para seção de prévia.
- `{Entity}FormularyUI.FormPreview` (ou equivalente) em `formularies/{entity}/components/`.

## Resumo para revisão (campaigns e futuros)

- `{Entity}FormularyUI.Summary` em `formularies/{entity}/components/`.
- Recebe snapshot via props (montado no clique em Revisar no create drawer).
- Create drawer expõe `trigger` + `getValues` do RHF (`on_form_ready`) para validar e montar payload API antes de abrir o dialog.
- Helper `build{Entity}ApiPayload` no módulo quando form-fields divergem do schema API.
