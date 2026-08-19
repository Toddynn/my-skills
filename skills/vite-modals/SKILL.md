---
name: vite-modals
description: Modais/drawers controlados por URL com useModalControlQuery. Use when adding Dialog, Sheet, drawer, select-modal, confirm-modal, or URL-controlled overlay state.
---

# Modais via URL (Vite)

**Sem nuqs.** Search da rota TanStack. Canônico: passin `hooks/use-modal-control-query.ts`. Next admin ainda usa nuqs (skill `nextjs-search-params`) — **não** misturar.

## Exemplos

- [`examples/use-modal-control-query.ts`](examples/use-modal-control-query.ts)
- [`examples/modal-control-search-params.ts`](examples/modal-control-search-params.ts)
- [`examples/open-edit-widget-modal-action.tsx`](examples/open-edit-widget-modal-action.tsx)

## Hook

`useSearch({ strict: false })` + `router.navigate`. Key tipada `ModalControlKey`. Fechar grava `undefined` (some da URL), não `null`.

```ts
const { control, state, set } = useModalControlQuery('create-widget', { key: 'modal' });
```

- Default `openBehaviour` / `closeBehaviour`: `'replace'`
- `control.open` / `control.onOpenChange(boolean)`
- `set(true | false | string)` — string vira `action:value`
- `onlyExplicitOpen`: ignora `onOpenChange(true)`
- `hasState: true` → split `rawValue` em `action:state`

Create: `action_name` estável (`create-widget`). Edit: id no action_name `` `edit-widget:${id}` ``, **sem** `hasState`.

Confirm: key `confirm-modal`, action `confirm` (`vite-confirm`).

## Keys no schema da rota

`.extend(modalControlSearchParams.shape)`. Keys do schema: `modal`, `drawer`, `secondary-drawer`, `secondary-modal`, `filter-modal`, `select-modal`, `confirm-modal`, `dropdown`, `redirect-modal`, `loading-modal`.

## Action + modal

`<Fragment>` Button + Modal. Modal recebe `control`. Success: `control.onOpenChange(false)`. Bloquear close se `isPending`.
