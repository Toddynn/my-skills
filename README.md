# my-skills

Skills pessoais de agente (Cursor, Claude Code e `~/.agents/skills`).

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
git clone https://github.com/Toddynn/my-skills
cd ~/my-skills
```

Simplesmente peça para o seu agente fazer o symlink das skills do repositório que acabou de clonar

ou

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
| Vite + TanStack Router | `vite-routes`, `vite-new-module`, `vite-search-params`, `vite-modals`, `vite-actions`, `vite-query`, `vite-composition`, `vite-forms`, `vite-multi-step-forms`, `vite-zustand`, `vite-confirm`, `vite-types`, `vite-api`, `vite-env`, `vite-login-keycloak` |
| Next.js admin CRUD | `nextjs-module`, `nextjs-new-module`, `nextjs-search-params`, `nextjs-actions`, `nextjs-composition`, `nextjs-forms`, `nextjs-upload`, `nextjs-login-keycloak` |
| NestJS | `nestjs-module`, `nestjs-keycloak-admin` |

Cada skill vive em `skills/<nome>/SKILL.md`. Código canônico em `skills/<nome>/examples/` (domínio `widget`). O symlink global aponta a **pasta inteira** da skill, então o agente lê os examples sem os repositórios origem. `SKILL.md` = regras. `examples/` = copiar.

Não coloque examples na raiz do repo — o destino `~/.cursor/skills/<nome>` não enxerga a raiz.

## Desinstalar

Remove só os symlinks deste repo. Skills de terceiros na mesma pasta ficam.

```bash
cd ~/my-skills
for skill in skills/*/; do
  name="$(basename "$skill")"
  rm -f ~/.cursor/skills/"$name" ~/.claude/skills/"$name" ~/.agents/skills/"$name"
done
```
