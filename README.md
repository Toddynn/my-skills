# my-skills

Skills pessoais de agente (Cursor, Claude Code e `~/.agents/skills`).

Só o que é teu. Skills de terceiros (Emil Kowalski, caveman, graphify, etc.) não entram aqui — ficam nas pastas da ferramenta.

Cada skill deste repo vira um symlink dentro das pastas padrão. O resto que já estiver lá continua.

## Pré-requisito

Git. Linux ou macOS.

| Ferramenta | Destino |
|------------|---------|
| Cursor | `~/.cursor/skills` |
| Claude Code | `~/.claude/skills` |
| Agents | `~/.agents/skills` |

## Instalar

Clone onde quiser:

```bash
git clone <URL-DO-REPO> ~/my-skills
cd ~/my-skills
```

Cria as pastas se não existirem. **Não** substitui a pasta inteira — isso apagaria skills de outros autores.

```bash
mkdir -p ~/.cursor/skills ~/.claude/skills ~/.agents/skills

for skill in skills/*/; do
  name="$(basename "$skill")"
  ln -sfn "$(pwd)/skills/$name" ~/.cursor/skills/"$name"
  ln -sfn "$(pwd)/skills/$name" ~/.claude/skills/"$name"
  ln -sfn "$(pwd)/skills/$name" ~/.agents/skills/"$name"
done
```

Confere:

```bash
ls -l ~/.cursor/skills | head
ls skills
```

Reinicia Cursor / Claude Code se as skills não aparecerem na hora.

## Atualizar

```bash
cd ~/my-skills
git pull
```

Symlinks das skills que já existiam continuam. Skill **nova** no repo: roda o `for` de novo.

## O que tem aqui

| Grupo | Skills |
|-------|--------|
| Vite + TanStack Router | `estrutura-pastas-rotas`, `checklist-novo-modulo`, `search-params-url`, `modals-url`, `actions-api`, `tanstack-query`, `composition-ui`, `formularies`, `zustand-stores`, `use-confirm`, `interfaces-base`, `api-auth`, `env-zod`, `vite-keycloak-authorization` |
| Next.js admin CRUD | `admin-crud-module-structure`, `admin-crud-new-module-checklist`, `admin-crud-search-params`, `admin-crud-actions-api`, `admin-crud-composition-ui`, `admin-crud-formularies`, `admin-crud-media-upload`, `nextjs-keycloak-authorization` |
| NestJS | `nestjs-module-structure`, `keycloak-admin-rest` |

Cada skill vive em `skills/<nome>/SKILL.md`.

## Desinstalar

Remove só os symlinks deste repo. Skills de terceiros na mesma pasta ficam.

```bash
cd ~/my-skills
for skill in skills/*/; do
  name="$(basename "$skill")"
  rm -f ~/.cursor/skills/"$name" ~/.claude/skills/"$name" ~/.agents/skills/"$name"
done
```
