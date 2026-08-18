---
name: vite-env
description: Validação de variáveis de ambiente com Zod no boot (Vite). Use when adding VITE_ env vars, env-variables schema, import.meta.env, or .sample.env in Vite apps.
---

# Env variables (Zod)

Path: `src/shared/constants/env-variables/index.ts`

## Regras

- Schema Zod v4 (`zod/v4`) parseia `import.meta.env` no boot
- App **não sobe** com env inválida — falha cedo
- Consumir **só** via `env`, `backend_url`, `app_url`, `youtube_embed_url`, `is_production`
- **Nunca** ler `import.meta.env.VITE_*` direto fora desse módulo

## Padrão

```ts
const clientEnvSchema = object({
  VITE_APP_NAME: string({ error: 'VITE_APP_NAME is required.' }),
  VITE_DEFAULT_DEBOUNCE_IN_MS: coerce.number({ error: '…' }),
  // …
});

export const env = clientEnvSchema.parse(rawClientEnv);
export const backend_url = withPort(env.VITE_BACKEND_PROTOCOL, env.VITE_BACKEND_DOMAIN, env.VITE_BACKEND_PORT);
```

## Ao adicionar variável

1. Entrar no schema + `rawClientEnv`
2. Documentar em `.sample.env`
3. Tipar com `string` / `coerce.number` / etc. — mensagem de erro clara
4. Usar no código via `env.VITE_…`

## Debounce / limites

- Debounce search: `env.VITE_DEFAULT_DEBOUNCE_IN_MS`
- Upload size: `env.VITE_MAX_VIDEO_UPLOAD_SIZE_IN_MB` (ou constante derivada em `shared/constants`)
