---
name: vite-new-module
description: Checklist para criar um novo módulo/rota no Vite + TanStack Router. Use when creating a new module, route, CRUD page, or feature folder under src/routes in Vite SPAs with -shared colocation.
---

# Novo módulo — checklist

Antes de codar: **entidade**, **path da rota**, **tem upload?** (files store) ou **JSON puro?**, **tem select-modal?**

Rules: `vite-routes`, `vite-search-params`, `vite-modals`, `vite-actions`, `vite-query`, `vite-composition`, `vite-forms`, `vite-zustand`, `vite-confirm`, `vite-env`, `vite-types`, `vite-api`.

## 1. Rota `src/routes/_private/{module}/`

- [ ] `index.tsx` — `createFileRoute`, `head`, `validateSearch`, `loader` crumb + LoadingPage, `notFoundComponent`
- [ ] `-shared/schemas/*-search-params.ts` — defaults + Zod + `.extend(modalControlSearchParams.shape)`
- [ ] `-shared/functions/use-*-query-states.ts` — search/page + debounce + reset page
- [ ] `-shared/functions/use-*-actions.ts` — create/edit/delete + `handleErrorTreatment` + invalidate
- [ ] `-shared/schemas` + `-shared/interfaces` de form
- [ ] `-shared/components/header` se header específico
- [ ] **Sem** `'use client'`
- [ ] **Named exports**

## 2. TanStack GET `shared/functions/tanstack-query/{domain}/`

- [ ] `{operation}/index.ts` — Entity + fetch
- [ ] `query-key.ts` — fn snake_case (nunca hardcode no call site)
- [ ] `use-index.ts` — infinite/suspense/query
- [ ] Paginação: `DefaultPaginatedResponse` + `getNextPageParam` + `InfiniteList`

## 3. UI `components/ui/`

- [ ] `cards/{entity}-card/` — named export
- [ ] `composition-pattern/cards/{domain}/` → `{Domain}CardUI`
- [ ] `composition-pattern/actions/{domain}/` → `{Domain}Actions`
- [ ] `formularies/{domain}/` — RHF + Zod + `Controller`/`Field`
- [ ] `modals/{domain}/` — `control` + formulary `actions`
- [ ] Delete action com `useConfirm`

## 4. Estado

- [ ] Filtros/paginação/modal na **URL**
- [ ] Upload → `useFiles` + clear no close
- [ ] Select-modal → selection store (factory) se precisar

## 5. API

- [ ] Entradas em `API_ROUTES` + uso via `buildApiRoute`
- [ ] Env nova → schema Zod em `env-variables` + `.sample.env`

## 6. Não criar

- `'use client'`
- `tanstack-query/mutation/`
- query key hardcoded (sempre fn `*_query_key`)
- card de domínio em `-shared` (vai em `components/ui/cards`)
- default export
- HeroUI / `window.confirm` / `useState` por campo de form
