---
name: vite-routes
description: Estrutura de pastas, rotas TanStack e colocation com -shared (Vite SPA). Use when creating or organizing routes, pages, -shared folders, file-based routing, or src/ layout in Vite + React + TanStack Router. Do not apply to Next.js App Router or RSC.
---

# Estrutura de pastas e rotas

## Exemplos

- [`examples/tree.txt`](examples/tree.txt) — árvore `src/`
- [`examples/route-index.tsx`](examples/route-index.tsx) — `createFileRoute` mínimo

Stack: Vite + React + TanStack Router (file-based). **Não** usar padrões Next (`'use client'`, App Router, RSC).

## Árvore `src/`

```
src/
├── routes/                 # file routes (TanStack)
├── components/             # app shell + ui
│   ├── ui/                 # shadcn + domínio reutilizável
│   ├── infinite-list/
│   ├── file-uploader/
│   └── layouts/
├── hooks/                  # hooks globais (useConfirm, useModalControlQuery, useDebounce…)
├── shared/
│   ├── constants/          # env, api-routes, roles…
│   ├── functions/          # invalidateQueries, tanstack-query, helpers
│   ├── interfaces/         # bases (pagination, action args…)
│   ├── schemas/            # schemas globais (modal-control, file)
│   └── stores/             # zustand
├── contexts/
├── lib/                    # providers (api, query, confirm, auth)
├── app.tsx
└── main.tsx
```

## Grupos de rota

| Prefixo | Papel |
|---------|--------|
| `_private` | auth + shell (Sidebar/Navbar) |
| `_public` | login / verify-credentials |
| `_home` | home pathless |
| `$id` | param dinâmico |
| `-shared` | colocation **ignorada** pelo router (não vira URL) |

## Onde colocar cada coisa

| Tipo | Local |
|------|-------|
| Page / `Route` / `validateSearch` / `beforeLoad` / `loader` | `routes/.../index.tsx` ou `layout.tsx` |
| Schemas, query-states, actions, interfaces **só deste módulo** | `routes/.../-shared/` |
| Cards, formularies, modals, composition actions/card UI | `components/ui/{cards,formularies,modals,composition-pattern}/` |
| Hook/util usado por **>1 módulo** | `hooks/` ou `shared/functions/` |
| Query GET reutilizável | `shared/functions/tanstack-query/` |

## `-shared` por escopo

Exemplo `videos`:

```
routes/_private/videos/
├── index.tsx
├── -shared/                 # listagem / CRUD vídeo
├── new/
│   ├── index.tsx
│   └── -shared/             # só da página de criação
└── $id/
    ├── index.tsx
    ├── -shared/             # só utilidades do video_id
    └── completions/
        ├── index.tsx
        └── -shared/         # só completions
```

- `-shared` de `$id`/`new` **não** sobe utilidades genéricas de listagem.
- **Toda página com rota própria** (`new`, `$id`, etc.) vai **na sua pasta**, nunca solta como `new.tsx`/`$id.tsx` na raiz do módulo — senão o `-shared` daquela página some dentro do `-shared` do módulo inteiro.
- Algo usado por **mais de uma sub-rota** (ex.: header de formulário usado por `new` e `$id`) sobe para o `-shared` do nível pai comum — não duplicar.
- Header/constantes locais da página podem ficar em `-shared/components` e `-shared/constants`.
- **Cards de domínio** vão em `components/ui/cards/` — **não** deixar card em `-shared` (mesmo se “só home”).

## Naming

- Pastas/arquivos: `kebab-case`
- Grupos pathless: `_private`, `_public`
- Colocation: `-shared`
- **Named exports obrigatórios** (Biome `style/noDefaultExport`) — exceção: `vite.config.ts`
- **Proibido** `'use client'` neste projeto

## Padrão mínimo de rota

```tsx
export const Route = createFileRoute('/_private/videos/')({
  head: () => ({ meta: [{ title: `${env.VITE_APP_NAME} | …` }] }),
  validateSearch: (search) => Schema.parse(search),
  loader: () => ({ crumb: '…', component: <LoadingPage /> }),
  notFoundComponent: () => <NotFoundPage />,
  component: RouteComponent,
});
```
