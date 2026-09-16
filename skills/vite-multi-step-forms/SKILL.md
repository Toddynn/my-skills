---
name: vite-multi-step-forms
description: Multi-step formularies with one React Hook Form instance, shadcn Tabs, step navigation, jump-to-error-tab, and optional review-confirm modal with data summary. Use when a form has visual overload, grouped fields, wizard/tabs/passos, revisão de dados before submit, or a confirm-creation summary modal.
---

# Form multi-step (RHF)

Canônico: um `useForm` + `Controller` no formulary (`vite-forms`). Overlay (Dialog/Sheet) tem `Tabs` + Anterior/Próximo. **Não** `useFormContext` por step. **Não** um `useForm` por tab.

Confirmação de dados ≠ `vite-confirm` (delete). Aqui: modal de **revisão do snapshot** antes do mutate.

## Exemplos

- [`examples/create-widget-form-steps.ts`](examples/create-widget-form-steps.ts)
- [`examples/form-steps-navigation.tsx`](examples/form-steps-navigation.tsx)
- [`examples/create-widget-formulary.tsx`](examples/create-widget-formulary.tsx)
- [`examples/create-widget-modal.tsx`](examples/create-widget-modal.tsx)
- [`examples/form-data-summary.tsx`](examples/form-data-summary.tsx) — primitivo
- [`examples/widget-fields-metadata.ts`](examples/widget-fields-metadata.ts)
- [`examples/widget-formulary-summary.tsx`](examples/widget-formulary-summary.tsx)
- [`examples/confirm-widget-creation-modal.tsx`](examples/confirm-widget-creation-modal.tsx)

## Quando

Multi-step se o form tem **carga visual** ou **grupos distintos** (arquivo vs revisão vs acesso; geral vs datas vs local).

Single-page (`vite-forms` puro) se cabe num scroll curto.

Confirmar dados se o create é **minucioso** (evento, versão com revisão, regra de elegibilidade). Skip no 2-tab simples salvo o user pedir.

## Peças

| Peça | Local |
|------|-------|
| Steps (`id`, `label`, `step_fields`) | `routes/<module>/-shared/constants/*-form-steps.ts` |
| Nav genérica | `components/ui/form-steps-navigation.tsx` (reuso) ou colada no overlay |
| Formulary | `components/ui/formularies/<domain>/` — `useForm` + `TabsContent` |
| Overlay | `components/ui/modals/<domain>/` ou `sheets/<domain>/` — `Tabs` + footer |
| Summary UI | `formularies/<domain>/` (`{Domain}Formulary.Summary` se tiver barrel) |
| Fields metadata | `routes/<module>/-shared/constants/*-fields-metadata.ts` |
| FormDataSummary | `components/ui/form-data-summary` — **uma vez por app** |
| Confirm | `modals/<domain>/confirm-*-creation-modal.tsx` — key `confirm-modal` |

Constants: **id + label + campos**. Sem JSX de step no constant — Controllers ficam no formulary.

## Overlay

`useState` pro step se Tabs, nav e form estão na mesma árvore. Zustand `createNavigationStore` só se nav/confirm desmontam em árvores irmãs (passin eventos).

```tsx
<Tabs value={current_step} onValueChange={…} className="flex min-h-0 w-full flex-1 flex-col">
  <TabsList className="w-full">
    {steps.map((step) => (
      <TabsTrigger key={step.id} value={step.id} className="w-full">{step.label}</TabsTrigger>
    ))}
  </TabsList>
  <CreateWidgetFormulary on_step_change={setCurrentStep} actions={<DialogFooter>…</DialogFooter>} />
</Tabs>
```

- Overlay: `flex max-h-[85dvh] flex-col overflow-hidden`
- `TabsTrigger` **dentro** de `TabsList`
- Tabs clicáveis — **não** wizard travado. `Próximo` **não** valida
- Finish só na última tab (`FormStepsNavigation`)
- Close: reset step pro primeiro. `isPending` bloqueia close
- Step condicional: filtra `steps`; clamp `current_step` se o id sumiu

## Formulary

Um schema Zod, um `useForm`. Cada tab = `TabsContent` + `FieldGroup`. `TabsContent` precisa ser descendente de `Tabs` (form no meio ok).

```tsx
onSubmit={handleSubmit(onSubmit, (errors) => {
  on_step_change?.(get_form_step_from_errors(errors, steps_ids, step_fields));
})}
```

- Sem confirm: `onSubmit` muta (toast + `reset` + `on_success_callback`)
- Com confirm: `onSubmit` **não** muta — chama `on_review_callback(data)`
- `{actions}` **dentro** do form
- `className="flex min-h-0 flex-1 flex-col gap-6"`; `TabsContent` com `overflow-y-auto`

## Confirmação (opcional)

Key URL `confirm-modal`, action estável (`confirm-widget-creation`). Skill `vite-modals`.

1. Última tab: finish `type="submit" form={id}` label **Revisar**
2. RHF valida o form inteiro; erro → pula tab; ok → overlay guarda snapshot e abre confirm
3. Confirm: título "Revise as informações" + Summary + **Preciso mudar** (fecha confirm, form fica) + **Confirmar e criar** (mutate)
4. Mutate **no modal de confirmação**, não no formulary
5. Success: toast, reset form/stores, fecha confirm **e** overlay, `goToFirstStep`

Summary: `FormDataSummary` + `*-fields-metadata`. Snapshot via props — **não** ler RHF no confirm.

Se o app **não** tem o primitivo: copiar [`examples/form-data-summary.tsx`](examples/form-data-summary.tsx) pra `components/ui/form-data-summary`. Named export. Metadata por domínio: toda key do snapshot, `label` + `fields` + `formatter`. Key sem UI (só entra noutro formatter): `label: ''`. `fields_order` define o que aparece e a ordem.

`vite-confirm` (`useConfirm`) = delete / irreversível. Não servir revisão de create.

## Não fazer

- `useFormContext` / um form por tab
- Validar no `Próximo` (trava o tab click)
- `space-y-*` no form — `flex flex-col gap-*`
- Content JSX no array de steps quando o padrão é RHF único
- Confirm genérico de delete pra revisar dados
