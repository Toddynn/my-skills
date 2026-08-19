---
name: nextjs-composition
description: Cards, actions, drawers e modais — composition pattern dos módulos admin. Use when creating Next.js admin cards, {Entity}Actions barrels, Sheet drawers, Dialogs, or composition-pattern UI.
---

# Composition UI — módulos admin

Canônico: FAQ no clube-adm. Copiar estrutura dos examples, não só o barrel.

## Exemplos

- [`examples/faqs-actions.ts`](examples/faqs-actions.ts) — barrel
- [`examples/open-create-faq-drawer-action.tsx`](examples/open-create-faq-drawer-action.tsx)
- [`examples/open-edit-faq-drawer-action.tsx`](examples/open-edit-faq-drawer-action.tsx) — `action_name` com id
- [`examples/delete-faq-action.tsx`](examples/delete-faq-action.tsx) — confirm + mutation
- [`examples/faq-card.tsx`](examples/faq-card.tsx) — card orquestra
- [`examples/faq-card-ui.ts`](examples/faq-card-ui.ts) + [`faq-question.tsx`](examples/faq-question.tsx)
- [`examples/create-faq-drawer.tsx`](examples/create-faq-drawer.tsx) — Sheet + ProgressModal

## Actions (`composition-pattern/actions/{entity-plural}/`)

- Arquivo: `open-create-{entity}-drawer-action.tsx`, `open-edit-{entity}-drawer-action.tsx`, `delete-{entity}-action.tsx`.
- Props: `Omit<ButtonProps, 'onClick'>` (+ entidade no edit/delete).
- `children` opcional com default (label + ícone lucide).
- `useModalControlQuery` key `{prefix}_modal` (`fa_modal`).
- Create: `'create-faq'`. Edit: `` `edit-faq:${faq.id}` `` (id no `action_name`, sem `hasState`).
- Cada action: `<Fragment>` → `Button` + drawer/dialog montado junto.
- Next admin: `useVerifyAuthorization` + `id` no botão pra hide.

## Delete

1. `use{Entity}Actions().delete_{entity}`.
2. `useMutation` no botão.
3. `useConfirm()` antes (FAQ: só se `faq.active`).
4. Toast no `on_success` do action hook.
5. `isPending` → `Spinner` + `disabled`.
6. Default `variant="destructive"` + `LucideTrash2`.

## Cards

- Card em `cards/{entity}-card/index.tsx` — named export.
- Subcomponentes em `composition-pattern/cards/{entity}/` → barrel `{Entity}CardUI`.
- Um arquivo por peça (`question.tsx`, `answer.tsx`, …). Card só orquestra. Subcomponentes puros.

## Drawers

- `Sheet` shadcn: create `side="right"`, edit `side="left"`.
- `{Entity}ActionsProvider` envolvendo conteúdo.
- Constante `CREATE_{ENTITY}_FORMULARY_ID`.
- `is_pending` bloqueia close.
- Footer **fora** do `<form>`: Cancelar / Resetar (`form={id}`) / Finalizar (`form={id}`).
- Com mídia: `ProgressModal` + `useUploadProgressModal({ key: '{prefix}_progress' })` + revoke/`clearAll` no close.

## Modal de revisão

Só se o módulo exige revisão antes do POST (campaigns). Dialog **local** (`useState`), não URL. Ver skill antiga campaigns se precisar.

## Modais extras

- shadcn `Dialog`. Props: `control: ModalControlQueryControl` + dados.
- Named export em cards/drawers/actions. Page: default export.
