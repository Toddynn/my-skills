---
name: vite-modals
description: Modais/drawers controlados por URL com useModalControlQuery. Use when adding Dialog, Sheet, drawer, select-modal, confirm-modal, or URL-controlled overlay state.
---

# Modais via URL

Hook global: `hooks/use-modal-control-query`.

Schema global: `shared/schemas/modal-control-search-params.ts`.

## Keys suportadas

`modal`, `drawer`, `secondary-drawer`, `secondary-modal`, `filter-modal`, `select-modal`, `confirm-modal`, `dropdown`, `redirect-modal`, `loading-modal`.

- Preferir `Dialog` (`modal` / `select-modal` / …)
- `drawer` / `secondary-drawer` + `Sheet` quando UX lateral fizer sentido — manter keys no schema mesmo se pouco usadas hoje

## Uso

```ts
const { control, state, set } = useModalControlQuery('edit-external-video', {
  key: 'modal',           // default
  hasState: true,         // valor `action:id`
  onlyExplicitOpen: true, // opcional
});
```

- `action_name` estável por fluxo (`create-external-video`, `edit-external-video`, `confirm`, …)
- Com ID: `hasState: true` → URL `modal=edit-external-video:123`
- Confirm global usa key `confirm-modal` (via ConfirmProvider)

## Action que abre modal

```tsx
export function OpenEditExternalVideoModalAction({ external_video, … }: Props) {
  const { control } = useModalControlQuery(`edit-external-video`, { /* ou com id */ });
  return (
    <Fragment>
      <Button onClick={() => control.onOpenChange(true)} />
      <EditExternalVideoModal control={control} externalVideo={external_video} />
    </Fragment>
  );
}
```

## Modal

- Props: `control: ModalControlQueryControl` (+ entidade se edit)
- Monta formulary com `actions={<DialogFooter>…</DialogFooter>}`
- Fechar no success: `on_success_callback={() => control.onOpenChange(false)}`
- Bloquear close enquanto `isPending` quando fizer sentido

## Search schema da rota

Toda rota com modal deve `.extend(modalControlSearchParams.shape)` no Zod de search.
