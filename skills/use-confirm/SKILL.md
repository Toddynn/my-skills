---
name: use-confirm
description: useConfirm para deletes e ações sensíveis. Use when adding delete actions, destructive flows, confirm modals, ConfirmProvider, or replacing window.confirm.
---

# Ações sensíveis — useConfirm

Hook: `hooks/use-confirm` → lê o `ConfirmProvider` (`lib/providers/confirm`).

Confirm UI usa `useModalControlQuery('confirm', { key: 'confirm-modal' })`.

## Quando obrigatório

- Delete de entidade
- Integrações irreversíveis / side-effects sensíveis (ex.: integrar com Petim)
- Qualquer ação destrutiva ou difícil de desfazer

## Padrão no action button

```ts
const confirm = useConfirm();

const waitForConfirmation = useCallback(async () => {
  const res = await confirm({
    title: 'Essa ação irá excluir um vídeo!',
    description: 'Confirme essa ação, por motivos de segurança.',
  });
  if (res) await handleDelete();
}, [confirm, handleDelete]);
```

- `useMutation` no botão chama o actions hook da rota
- Toast de sucesso no `on_success`
- `isPending` → `Spinner` + `disabled`
- Default visual delete: `variant="destructive"` + `LucideTrash2`

## Não fazer

- `window.confirm`
- Delete direto sem confirm
- Confirmar ações idempotentes/inofensivas (só ruído)
