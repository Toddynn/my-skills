---
name: nextjs-module
description: Estrutura de pastas e page shell para módulos admin CRUD (posts, products, banner-set, rankings). Use when creating or organizing Next.js App Router admin modules under src/app/(private), page.tsx RSC shells, headers, or lists.
---

# Módulo admin CRUD — estrutura

## Exemplos

- [`examples/tree.txt`](examples/tree.txt)
- [`examples/page.tsx`](examples/page.tsx) — RSC + prefetch + HydrationBoundary

Referências: `posts`, `products`, `banner-set`, `rankings`, `campaigns`.

## Árvore obrigatória em `src/app/(private)/{module}/`

```
page.tsx
components/header/index.tsx
components/{entity}-list/index.tsx
shared/
  contexts/{entity}-actions-context.tsx
  functions/
    use-{entity}-search-params.ts
    use-{entity}-actions.ts
    use-{entity}-table-query-filters.ts   # se listagem montar params da API
  schemas/
    create-{entity}-form-fields-schema.ts
    edit-{entity}-form-fields-schema.ts
    create-{entity}-schema.ts             # payload API
    edit-{entity}-schema.ts               # geralmente partial do create
  interfaces/
    create-{entity}-form-fields.ts        # infer_zod do form-fields schema
    edit-{entity}-form-fields.ts
  constants/                              # labels/parsers de filtro, column visibility, etc.
```

- Tudo do módulo (hooks, schemas, interfaces, constants, contexts, stores) fica em `shared/` — **não** criar `functions/`, `schemas/`, `interfaces/` ou `constants/` soltos na raiz do módulo.
- Tipo de domínio (`Post`, `Product`, etc.) fica em `src/shared/functions/tanstack-query/get/`, não no módulo.
- Filtros extras do módulo: `components/filter-by-*/` (ex.: products).
- **Não** criar rotas `/create` ou `/edit/[id]` — CRUD via Sheet na listagem.

## `page.tsx` (RSC)

- Server Component, sem `'use client'`.
- `getQueryClient()` + `prefetchQuery` com query key default `{}`.
- `HydrationBoundary` + `dehydrate`.
- Shell idêntico:

```tsx
<section className="relative mt-16 flex h-full min-h-0 w-full ... rounded-3xl border ...">
  <Admin{Entity}Header />
  <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto max-sm:scrollbar-hide">
    <{Entity}List />
  </div>
</section>
```

- Nome da função: `Admin{Entity}` (PascalCase).

## Header e lista

**Header** (`'use client'`): título + `SearchInputGroup` + `{Entity}Actions.OpenCreate{Entity}Drawer`. Filtros extras ao lado da busca quando existirem.

**Lista** (`'use client'`): hook GET + estados loader/error/empty + map de `{Entity}Card` + `DefaultListFooter` (`page`, `setPage`, `totalPages`). Listagem usa `debouncedSearch`, header usa `search` + `clearSearch`.

## Naming de prefixos por módulo

| Módulo | Rota/pasta | Prefixo URL | Modal key | Progress key (se mídia) |
|--------|------------|-------------|-----------|-------------------------|
| posts | `posts` | `po_` | `po_modal` | `po_progress` |
| products | `products` | `prd_` | `prd_modal` | `prd_progress` |
| banner-set | `banner-set` | `bs_` | `bs_modal` | `bs_progress` |
| rankings | `rankings` | `rnk_` | `rnk_modal` | — |
| campaigns | `campaigns` | `c_` | `c_modal` | — |

- Código interno de banner-set usa plural (`banner-sets`, `BannerSetsActions`) — manter consistência com pastas existentes em `components/ui`.

## UI compartilhada (fora do módulo)

```
src/components/ui/cards/{entity}-card/
src/components/ui/composition-pattern/actions/{entity-plural}/
src/components/ui/composition-pattern/cards/{entity}/
src/components/ui/drawers/{entity-plural}/
src/components/ui/formularies/{entity-plural}/
  components/index.ts              # {Entity}FormularyUI
  create-{entity}-formulary/
  edit-{entity}-formulary/
src/components/ui/modals/{entity-plural}/   # só quando necessário (ex.: about, elegíveis)
```

## O que não fazer

- HeroUI em módulos novos — só shadcn (`Button`, `Input`, `Sheet`, `Dialog`, `Field`, etc.).
- API inline em list/card — usar `use-{entity}-actions`.
- `useState` manual por campo — usar react-hook-form nos formularies.
