---
name: devops-nestjs
description: >-
  Torna backend NestJS production-ready no DevOps (Docker multi-stage, compose,
  envs por ambiente). Use when adding Dockerfile, docker-compose, .docker/scripts,
  .env.prod/.env.test, or production-ready Nest deploy config.
---

# DevOps NestJS (production-ready)

Canônico: `clube-backend`.

## Exemplos

- [`examples/Dockerfile`](examples/Dockerfile) / [`Dockerfile.dev`](examples/Dockerfile.dev) / [`Dockerfile.test`](examples/Dockerfile.test)
- [`examples/.docker/scripts/`](examples/.docker/scripts/) — `install-deps`, `build-app`, `start-server`
- [`examples/.dockerignore`](examples/.dockerignore)
- [`examples/docker-compose.yml`](examples/docker-compose.yml)

## Árvore obrigatória

```
.docker/scripts/install-deps.sh
.docker/scripts/build-app.sh
.docker/scripts/start-server.sh
Dockerfile
Dockerfile.dev
Dockerfile.test
.dockerignore
docker-compose.yml   # ou .yaml — compose local usa Dockerfile.dev
.sample.env          # versionado
.env / .env.prod / .env.test   # locais, gitignore (.env*)
pnpm-workspace.yaml
```

## Regras

- Base: `node:24-alpine3.23`, Corepack + pnpm, multi-stage `base → deps → builder → runner`
- Única diferença entre os 3 Dockerfiles: `ENV NODE_ENV` = `production` | `development` | `test`
- Runner: TZ `America/Sao_Paulo`, copia `package*`, lock, `node_modules`, `dist`
- Compose local: `dockerfile: Dockerfile.dev`, `env_file: .env`, porta `${APP_PORT}:APP_PORT`
- `develop.watch`: sync código + rebuild em `package.json` / lockfile
- **Não** incluir healthcheck sem script `health` no `package.json`
- Volume `uploads` só se o app persistir arquivos locais
- Sem bind mount `.:/app` e sem `command: start:dev` no compose production-ready

## Entrypoint (`start-server.sh`)

- Sem `rootDir` no tsconfig (Nest default): `dist/src/main.js`
- Com `"rootDir": "./src"`: `dist/main.js` — alinhar script ao layout real do `nest build`

## Envs

| Arquivo | Uso |
|---------|-----|
| `.sample.env` | Template commitado (placeholders) |
| `.env` | Dev / compose local |
| `.env.prod` | Produção (valores reais, não commit) |
| `.env.test` | Testes |

Compose referencia `.env`. Deploy prod usa `Dockerfile` + `.env.prod` no orquestrador.

## Checklist

1. Copiar `examples/` para a raiz do repo; trocar `APP_NAME` / portas
2. Ajustar `start-server.sh` ao path real de `main.js`
3. `EXPOSE` e mapeamento compose = `APP_PORT` do app
4. Criar `.env.prod` / garantir `.env.test` + `.sample.env`
5. `docker compose build && docker compose up` sobe imagem compilada via `start-server`
