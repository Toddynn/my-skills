---
name: vite-new-module
description: Checklist para criar um novo módulo/rota no Vite + TanStack Router. Use when creating a new module, route, CRUD page, or feature folder under src/routes in Vite SPAs with -shared colocation.
---

# Novo módulo — checklist

Canônico: `src/routes/_private/prompts` (content-creator). Skills irmãs têm o código.

## Exemplos

- [`examples/prompts-tree.txt`](examples/prompts-tree.txt)
- [`examples/prompts-route.tsx`](examples/prompts-route.tsx)
- [`examples/prompts-search-params.ts`](examples/prompts-search-params.ts)
- [`examples/use-prompts-query-states.ts`](examples/use-prompts-query-states.ts)
- Actions: `vite-actions` `use-prompts-actions.ts`
- Formulary: `vite-forms` `create-prompt-formulary.tsx`

Antes: entidade, path, upload?, select-modal?

Rules: `vite-routes`, `vite-search-params`, `vite-modals`, `vite-actions`, `vite-query`, `vite-composition`, `vite-forms`, `vite-zustand`, `vite-confirm`, `vite-env`, `vite-types`, `vite-api`.

## 1. Rota `src/routes/_private/{module}/`

- [ ] `index.tsx` — `createFileRoute`, `head`, `validateSearch` (Zod parse), `loader` crumb + `LoadingPage`, `notFoundComponent`, `component: RouteComponent` **local** (não export)
- [ ] `beforeLoad` opcional (prompts: count)
- [ ] `-shared/schemas/*-search-params.ts` — defaults string + `.extend(modalControlSearchParams.shape)`
- [ ] `-shared/functions/use-*-query-states.ts` — `Route.useSearch` + `useNavigate` + `useDebounce` + `reset('page')`
- [ ] `-shared/functions/use-*-actions.ts` — create/edit/delete
- [ ] `-shared/schemas` + `-shared/interfaces` (`InferZod`)
- [ ] Header da página em `-shared/components/headers/`
- [ ] List extra (collapsible, visibility store) **só** se o módulo tiver duas listas — não copiar de prompts à toa
- [ ] Rota **sem** `'use client'`. Query-states de prompts tem leftover `'use client'` — **não** replicar no Vite

## 2. TanStack GET `shared/functions/tanstack-query/{domain}/`

- [ ] fetch + `query-key.ts` fn snake_case
- [ ] `use-index.ts` infinite
- [ ] Page: `InfiniteList` + card named export

## 3. UI `components/ui/`

- [ ] `cards/{entity}-card/` — **não** em `-shared`
- [ ] `composition-pattern/actions|cards|triggers/{domain}/`
- [ ] `formularies/{domain}/` — RHF no mesmo arquivo (`vite-forms`)
- [ ] `modals/{domain}/` — `control` + `actions` no formulary
- [ ] Delete: `useConfirm`

## 4. Estado

- [ ] Filtro/page/modal na **URL**
- [ ] Upload → `useFiles` (skill `vite-zustand`)
- [ ] Select-modal → selection store se precisar (prompts: `useSelectPromptCategoriesStore`)

## 5. API

- [ ] `API_ROUTES` + `buildApiRoute` tipado
- [ ] Env nova → Zod `env-variables` + `.sample.env`

## 6. Não criar

- `'use client'` na rota
- `tanstack-query/mutation/`
- query key hardcoded
- card em `-shared`
- default export (exceto se Biome do projeto permitir)
- HeroUI / `window.confirm` / `useState` por campo
- `useFormContext` + field file separado (padrão prompts = um formulary)
