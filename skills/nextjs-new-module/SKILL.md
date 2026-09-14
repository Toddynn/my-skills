---
name: nextjs-new-module
description: Checklist para criar um novo módulo admin CRUD do zero (posts/products/banner-set/rankings). Use when creating a new Next.js App Router admin CRUD module, page, list, drawer, or feature under src/app/(private).
---

# Novo módulo admin CRUD — checklist

## Exemplos

Checklist só orquestra. Código canônico nas skills listadas acima.

Antes de codar, defina: **nome da entidade**, **prefixo URL** (`xx_`), **tem mídia?** (multipart + progress) ou **JSON puro?**

Rules detalhadas: `nextjs-module`, `nextjs-search-params`, `nextjs-actions`, `nextjs-composition`, `nextjs-forms`, `nextjs-upload`.

## 1. Módulo `src/app/(private)/{module}/`

- [ ] `page.tsx` — RSC, prefetch GET, `HydrationBoundary`, shell section + header + list
- [ ] `shared/functions/use-{entity}-search-params.ts` — `{prefix}_search`, `{prefix}_page`, debounce, `clearSearch` (+ filtros se precisar)
- [ ] `components/header/index.tsx` — `SearchInputGroup` + `{Entity}Actions.OpenCreate{Entity}Drawer`
- [ ] `components/{entity}-list/index.tsx` — GET hook, loader/error/empty, map card, `DefaultListFooter`
- [ ] `schemas/` — `*-form-fields-schema` (RHF) + `*-schema` (API)
- [ ] `interfaces/` — `infer_zod` dos form-fields
- [ ] `shared/functions/use-{entity}-actions.ts` — create/edit/delete (+ media helpers se multipart)
- [ ] `shared/contexts/{entity}-actions-context.tsx`

## 2. TanStack GET `src/shared/functions/tanstack-query/get/{entity}/`

- [ ] `index.ts` — fetch + tipo `Entity`
- [ ] `query-key.ts` — prefix estável
- [ ] `use-index.ts` — `useQuery` / `useInfiniteQuery` se necessário

## 3. UI compartilhada `src/components/ui/`

- [ ] `cards/{entity}-card/index.tsx`
- [ ] `composition-pattern/cards/{entity}/` → `{Entity}CardUI`
- [ ] `composition-pattern/actions/{entity-plural}/` → `{Entity}Actions` (create/edit/delete)
- [ ] `drawers/{entity-plural}/create-{entity}-drawer` + `edit-{entity}-drawer`
- [ ] `formularies/{entity-plural}/create-{entity}-formulary` + `edit-{entity}-formulary`
- [ ] `formularies/{entity-plural}/components/index.ts` → `{Entity}FormularyUI` (inputs numéricos: inteiro vs decimal 2 casas)
- [ ] `modals/{entity-plural}/confirm-{entity}-creation-dialog` — opcional, só se módulo exigir revisão antes do POST

## 4. Formulary

- [ ] `useForm` + `standardSchemaResolver(FormFieldsSchema)` + `disabled: isPending`
- [ ] Todo campo: `Controller` → `Field` / `FieldLabel` / `FieldContent` / `FieldError` (shadcn)
- [ ] Strings: `.trim().min(1)` no schema — nunca só `undefined`
- [ ] `useMutation` inline → actions context; toast no success; invalidate query keys
- [ ] Com mídia: `useFiles` / `useMedias`, `FileUploader`, `ProgressModal` no drawer

## 5. Drawer

- [ ] Create `side="right"`, edit `side="left"`
- [ ] `{Entity}ActionsProvider` + formulary com `id` constante
- [ ] Footer: Cancelar | Resetar (`form={id}`) | Finalizar (`form={id}`)
- [ ] `useModalControlQuery('create-{entity}' | \`edit-{entity}:${id}\`, { key: '{prefix}_modal' })`
- [ ] Bloquear close se `is_pending`

## 6. Card

- [ ] `Card` + `{Entity}CardUI.*` + `DateUI` + actions edit/delete no footer
- [ ] Sem API inline na lista — delete via `{Entity}Actions.Delete`

## 7. Não criar

- Rotas `/create` ou `/edit/[id]`
- HeroUI em código novo
- `useState` por campo no form
- Mutations em `tanstack-query/mutation/` separado
- `Controller` escondido em wrapper que o formulary não mostra

## Referência rápida por tipo

| Tipo | Exemplo | Upload | Progress |
|------|---------|--------|----------|
| Com mídia | posts, products, banner-set | FormData + zustand | `{prefix}_progress` |
| Sem mídia | rankings | JSON | — |
