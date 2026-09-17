---
name: devops-nextjs
description: >-
  Torna frontend Next.js production-ready no DevOps (standalone Docker multi-stage,
  compose, envs). Use when adding Dockerfile, output standalone, docker-compose,
  .docker for Next, or production-ready Next deploy.
---

# DevOps Next.js standalone (production-ready)

Canônico: `clube-adm-frontend` / `new-petim-frontend`.

## Exemplos

- [`examples/Dockerfile`](examples/Dockerfile) / [`Dockerfile.dev`](examples/Dockerfile.dev) / [`Dockerfile.test`](examples/Dockerfile.test)
- [`examples/.docker/scripts/`](examples/.docker/scripts/) — `install-deps`, `build-app`, `start-server`
- [`examples/.dockerignore`](examples/.dockerignore)
- [`examples/docker-compose.yaml`](examples/docker-compose.yaml)
- [`examples/next.config.snippet.ts`](examples/next.config.snippet.ts)

## Árvore obrigatória

```
.docker/scripts/install-deps.sh
.docker/scripts/build-app.sh
.docker/scripts/start-server.sh
Dockerfile
Dockerfile.dev
Dockerfile.test
.dockerignore
docker-compose.yaml
next.config.ts          # output: 'standalone'
.sample.env
.env / .env.prod / .env.test
pnpm-workspace.yaml
```

## Regras

- Base: `node:24-alpine3.23`, Corepack + pnpm, multi-stage `base → deps → builder → runner`
- Única diferença entre os 3 Dockerfiles: `ENV NODE_ENV`
- Runner: TZ `America/Sao_Paulo`; copia:
  - `public/` → `./public`
  - `.next/standalone/app/` → `./` (path depende de `turbopack.root`; confirmar após `next build`)
  - `.next/static/` → `./.next/static`
- `start-server.sh`: valida `server.js` → `exec node server.js`
- Compose local: `dockerfile: Dockerfile.dev`, porta `${NEXT_PUBLIC_APP_PORT}:3000`
- **Não** incluir healthcheck sem script `health` no `package.json`
- `.env` não está no `.dockerignore` — build embute `NEXT_PUBLIC_*` se `next.config` / app ler no build

## next.config

```ts
output: 'standalone',
outputFileTracingIncludes: {
  '/**': ['./node_modules/@swc/helpers/esm/**'],
},
```

Se `turbopack.root` aponta para o pai do repo, standalone fica em `.next/standalone/app/`. Repo flat sem esse root: conferir se o path é `.next/standalone/` e ajustar o `COPY` do Dockerfile.

## Envs

| Arquivo | Uso |
|---------|-----|
| `.sample.env` | Template commitado |
| `.env` | Dev / compose |
| `.env.prod` | Produção |
| `.env.test` | Testes |

- `NEXT_PUBLIC_*` — client + bake no build
- `NEXT_PRIVATE_*` — só servidor (quando o app tiver)

## Checklist

1. Garantir `output: 'standalone'` no `next.config`
2. Copiar `examples/`; trocar `APP_NAME` / porta default
3. Após primeiro `next build`, confirmar path standalone e ajustar `COPY` se preciso
4. `pnpm-workspace.yaml`: `allowBuilds` / `onlyBuiltDependencies` para `sharp` etc.
5. Criar `.env.prod` / `.env.test` + `.sample.env`
6. `docker compose build && docker compose up` sobe `node server.js` na 3000
