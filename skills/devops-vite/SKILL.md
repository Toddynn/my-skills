---
name: devops-vite
description: >-
  Torna frontend Vite SPA production-ready no DevOps (Docker multi-stage, nginx,
  SERVER_NAME, compose, envs). Use when adding Dockerfile, nginx, docker-compose,
  .docker for Vite, or production-ready Vite static deploy.
---

# DevOps Vite (production-ready)

Canônico: `passin-frontend`.

## Exemplos

- [`examples/Dockerfile`](examples/Dockerfile) / [`Dockerfile.dev`](examples/Dockerfile.dev) / [`Dockerfile.test`](examples/Dockerfile.test)
- [`examples/.docker/scripts/`](examples/.docker/scripts/) — `install-deps`, `build-app`, `start-server`
- [`examples/.docker/nginx/nginx.conf.template`](examples/.docker/nginx/nginx.conf.template)
- [`examples/.dockerignore`](examples/.dockerignore)
- [`examples/docker-compose.yaml`](examples/docker-compose.yaml)

## Árvore obrigatória

```
.docker/scripts/install-deps.sh
.docker/scripts/build-app.sh
.docker/scripts/start-server.sh
.docker/nginx/nginx.conf.template
Dockerfile
Dockerfile.dev
Dockerfile.test
.dockerignore
docker-compose.yaml
.sample.env
.env / .env.prod / .env.test
pnpm-workspace.yaml
```

## Regras

- Build stages: `node:24-alpine3.23` + pnpm → `vite build` → runner **`nginx:alpine`**
- Única diferença entre os 3 Dockerfiles: `ENV NODE_ENV`
- Runner: `dist` → `/usr/share/nginx/html`, `EXPOSE 80`, `CMD start-server`
- `start-server.sh`: `SERVER_NAME` (default `_`) → `envsubst` no template nginx → `nginx -g 'daemon off;'`
- Compose: `dockerfile: Dockerfile` (prod image), porta `${VITE_APP_PORT:-80}:80`
- `.env` **entra** no contexto de build (`.dockerignore` não ignora `.env`) — `VITE_*` bake no bundle
- `SERVER_NAME` = runtime nginx; **não** é variável Vite
- Trocar `container_name` / `hostname` pelo nome do app

## Envs

| Arquivo | Uso |
|---------|-----|
| `.sample.env` | Template commitado |
| `.env` | Dev + build Docker local |
| `.env.prod` | Build/deploy prod (VITE_* + SERVER_NAME) |
| `.env.test` | Testes |

Obrigatório no sample/env:

```
SERVER_NAME = "app.example.local"
VITE_APP_PORT = "5173"
# demais VITE_* do schema Zod do app
```

## Checklist

1. Copiar `examples/`; ajustar nomes e porta default no compose
2. Garantir `SERVER_NAME` em `.env` / `.sample.env`
3. Criar `.env.prod` / `.env.test` locais
4. `pnpm run build` deve gerar `dist/index.html` (fumadocs/MDX etc. ok se build passar)
5. `docker compose build && docker compose up` serve nginx na porta do host
