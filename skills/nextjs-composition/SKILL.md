---
name: nextjs-composition
description: Cards, actions, drawers e modais — composition pattern dos módulos admin. Use when creating Next.js admin cards, {Entity}Actions barrels, Sheet drawers, Dialogs, or composition-pattern UI.
---

# Composition UI — módulos admin

## Actions (`composition-pattern/actions/{entity-plural}/`)

Barrel export:

```ts
export const {Entity}Actions = {
  OpenCreate{Entity}Drawer: OpenCreate{Entity}DrawerAction,
  OpenEdit{Entity}Drawer: OpenEdit{Entity}DrawerAction,
  Delete{Entity}: Delete{Entity}Action,
  // extras: OpenAboutDialog, OpenEligibleUsersModal, etc.
};
```

- Arquivo: `open-create-{entity}-drawer-action.tsx`, `open-edit-{entity}-drawer-action.tsx`, `delete-{entity}-action.tsx`.
- Props estendem `Omit<ButtonProps, 'onClick'>`.
- `children` opcional com default (label + ícone lucide).
- `useModalControlQuery` com key `{prefix}_modal`.
- Cada action: `<Fragment>` → `Button` + drawer/dialog.

## Delete action

1. `use{Entity}Actions().delete_{entity}` direto.
2. `useMutation` inline.
3. `useConfirm()` antes de executar (condicional se entidade ativa, quando aplicável).
4. Toast em `on_success` do action hook.
5. `isPending` → `Spinner` + `disabled`.
6. Default: `variant="destructive"`, texto "Excluir" + `LucideTrash2`.

## Cards (`cards/{entity}-card/index.tsx`)

```tsx
<Card>
  <CardContent>
    <{Entity}CardUI.* />  {/* subcomponentes de apresentação */}
  </CardContent>
  <CardFooter>
    <DateUI.CreatedAt /> + <DateUI.UpdatedAt />
    <{Entity}Actions.OpenEdit... /> + <{Entity}Actions.Delete... />
  </CardFooter>
</Card>
```

- Subcomponentes em `composition-pattern/cards/{entity}/` → export `{Entity}CardUI`.
- Um subcomponente por arquivo (`title.tsx`, `cover-media.tsx`, `color-preview.tsx`, etc.).
- Card orquestra; subcomponentes são puros (só props).

## Drawers (`drawers/{entity-plural}/`)

- `Sheet` shadcn: create `side="right"`, edit `side="left"`.
- `{Entity}ActionsProvider` envolvendo conteúdo.
- Constante `CREATE_{ENTITY}_FORMULARY_ID` / `EDIT_{ENTITY}_FORMULARY_ID`.
- `is_pending` bloqueia close enquanto submit.
- Footer fora do `<form>`:

```tsx
<Button variant="ghost" onClick={handleClose}>Cancelar</Button>
<Button variant="outline" type="reset" form={FORM_ID}>Resetar</Button>
<Button type="submit" form={FORM_ID}>Finalizar</Button>
```

- Create **com revisão** (campaigns): footer usa **Revisar** no lugar de Finalizar — ver seção abaixo.
- Com mídia: `ProgressModal` + `useUploadProgressModal({ key: '{prefix}_progress' })` + cleanup `useFiles`/`useMedias` no close.

## Modal de revisão na criação (campaigns e futuros)

Quando o módulo exige revisão antes do POST:

- Local: `modals/{entity-plural}/confirm-{entity}-creation-dialog/`
- shadcn `Dialog`; control **local** no create drawer (`useState`), não URL
- Footer create drawer: Cancelar | Resetar | **Revisar** (`type="button"` — valida RHF e abre dialog)
- Dialog: `{Entity}FormularyUI.Summary` + botões "Preciso mudar" | "Confirmar criação"
- `useConfirm()` antes do POST; mutation via `{Entity}ActionsContext`
- JSON puro: **sem** `ProgressModal`
- Bloquear close do dialog enquanto `is_pending` (`onInteractOutside` / `onEscapeKeyDown`)

## Modais extras (`modals/{entity-plural}/`)

- shadcn `Dialog`, não HeroUI `Modal`.
- Props: `control: ModalControlQueryControl` + dados da entidade.
- Pode usar control local `{ open, onOpenChange }` fora da listagem (ex.: seasons).

## Exports

- Page components: `default export`.
- Cards, drawers, formularies, actions: `named export`.
