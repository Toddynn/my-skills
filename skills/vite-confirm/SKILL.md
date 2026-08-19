---
name: vite-confirm
description: useConfirm para deletes e ações sensíveis. Use when adding delete actions, destructive flows, confirm modals, ConfirmProvider, or replacing window.confirm.
---

# Ações sensíveis — useConfirm

Copiar os quatro arquivos. Vite usa URL (`confirm-modal`), não `useState` local (isso é Next clube-adm).

## Exemplos

- [`examples/use-confirm.ts`](examples/use-confirm.ts)
- [`examples/confirm-context.ts`](examples/confirm-context.ts)
- [`examples/confirm-provider.tsx`](examples/confirm-provider.tsx)
- [`examples/confirm-modal.tsx`](examples/confirm-modal.tsx)
- [`examples/confirm-modal-interfaces.ts`](examples/confirm-modal-interfaces.ts)
- [`examples/delete-widget-action.tsx`](examples/delete-widget-action.tsx)

## Wiring

1. `ConfirmContext` + `ConfirmProvider` no root (junto dos outros providers).
2. Provider: `useModalControlQuery('confirm', { key: 'confirm-modal' })`.
3. `confirm(options)` → abre modal, `Promise<boolean>`.
4. `useConfirm()` lê context — throw se fora do provider.

`ConfirmOptions`: `title` obrigatório; `description`; `requireConfirmationText` + `compareTo` pra digitar texto.

## Quando obrigatório

Delete, side-effect irreversível. Sem `window.confirm`. Sem confirm em ação inofensiva.

## Action button

`const res = await confirm({ title, description })`. Se `res`, `mutateAsync`. Toast no `on_success`. `isPending` → Spinner + disabled.
