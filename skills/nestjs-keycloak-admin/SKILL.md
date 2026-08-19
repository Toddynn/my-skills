---
name: nestjs-keycloak-admin
description: Keycloak no NestJS — Authorization Code BFF com sessão Redis, client_credentials M2M, Admin REST (users, client roles, administrators, partner users). Use when implementing Keycloak login backend, getSystemAccessToken, KeycloakAdminService, creating administrators, assigning roles, or calling Keycloak Admin API.
---

# Keycloak — login BFF + Admin REST

## Exemplos

Origem histórica: Nest Keycloak. **Não** precisa do repo origem. Paths REST: [reference.md](reference.md).

- [`examples/keycloak-api.ts`](examples/keycloak-api.ts)
- [`examples/get-system-access-token.ts`](examples/get-system-access-token.ts) — M2M
- [`examples/get-login-url.ts`](examples/get-login-url.ts) — `state`/`nonce`
- [`examples/authorization-code-token.ts`](examples/authorization-code-token.ts)
- [`examples/assign-client-roles.ts`](examples/assign-client-roles.ts)
- [`examples/create-administrator.ts`](examples/create-administrator.ts)
- [`examples/to-keycloak-api-error.ts`](examples/to-keycloak-api-error.ts)

Módulos Nest: `keycloak-auth`, `administrators-admin`, `keycloak-partner-users-admin`. Frontend: `nextjs-login-keycloak` / `vite-login-keycloak`. Estrutura: `nestjs-module`.

Dois grants, dois axios, dois realms (admin / partner). Paths completos: [reference.md](reference.md).

## Dois grants

| Quem | `grant_type` | Onde token mora | Uso |
|------|--------------|-----------------|-----|
| Humano | `authorization_code` (+ `refresh_token`) | sessão Redis + cookie httpOnly | login painel |
| Máquina | `client_credentials` | memória do service | Admin REST |

Nunca misturar. Token M2M **não** entra na sessão do browser. Access token do humano **não** autentica Admin REST.

Sem `userinfo`. Sem `introspect`. Sem groups. Roles de permissão = **client roles** do client (`resource_access[KC_*_CLIENT_ID].roles`). JWT Passport/JWKS existe em arquivo e **não** está registrado — guards leem `session.adminUser` / `session.partnerUser`.

## Proibido

- Admin REST no controller — só service → use case → controller
- `clientId` no path de roles/mappings — resolver UUID via `GET /admin/realms/{realm}/clients?clientId=`
- Criar group / realm role pra permissionamento admin
- `POST /users` pra “criar administrador” — admin já existe no realm; só assign client roles
- Atribuir `administrador-master` pela API (`ASSIGNABLE_ROLE_VALUES` exclui)
- Validar Bearer JWT na request autenticada
- User attribute de patrocinador no Keycloak (escopo fica no banco)

## User login (Authorization Code)

Espelho admin (`KC_ADMIN_*` + `KEYCLOAK_ADMIN_URL`) e partner (`KC_PARTNER_*`).

### Login URL

`randomBytes(16).toString('base64')` → `state` + `nonce` na sessão (`saveUninitialized: false` — precisa `saveSession` **antes** do redirect).

```
GET {KEYCLOAK_*_URL}/realms/{realm}/protocol/openid-connect/auth
  ?client_id &redirect_uri &response_type=code &scope=openid &state &nonce
```

`redirect_uri` = `FRONT_END_*_URL + KC_*_REDIRECT_URI` (path, não URL absoluta no env).

Rotas Nest públicas: `GET auth/keycloak/admin|partner/get-login-url`.

### Troca de code

Sessão obrigatória. `state === session.state`. Senão logout + 406.

```ts
const bodyParams = new URLSearchParams({
  client_id: env.KC_ADMIN_CLIENT_ID,
  client_secret: env.KC_ADMIN_CLIENT_SECRET,
  grant_type: 'authorization_code',
  redirect_uri: `${FRONT_END_ADMIN_URL}${env.KC_ADMIN_REDIRECT_URI}`,
  code,
});

await axios.post(
  `${KEYCLOAK_ADMIN_URL}/realms/${env.KC_ADMIN_REALM}/protocol/openid-connect/token`,
  bodyParams.toString(),
  { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
);
```

Decode JWT local (`jwt-decode`, sem JWKS). `id_token.nonce === session.nonce`. Roles em `access_token.resource_access[clientId].roles`. Sem role `acesso` → logout Keycloak + 401.

Grava sessão: `adminUser`/`partnerUser`, `access_token`, `refresh_token`, `id_token`, `expires_in`, `refresh_expires_in`. Cookie `maxAge` = `refresh_expires_in * 1000`.

Partner extra: normaliza `cpf_cnpj`, liga `User.idKeycloak` no Postgres, recusa `isActive=false`.

### Refresh / logout

Refresh: form `grant_type=refresh_token` + `scope=openid` + `refresh_token` da sessão. Axios 401 Keycloak → `UnauthorizedException` + limpa cookie **antes** de `session.destroy`.

Logout: destroi sessão Nest, devolve URL browser `.../protocol/openid-connect/logout?post_logout_redirect_uri=&id_token_hint=`.

Falha de state/nonce/role: GET logout Keycloak `id_token_hint`, timeout 5s, `validateStatus: () => true`, erro engolido.

### Cookie sessão

`express-session` + `connect-redis` (fallback memory). `SessionConfigService` no `main.ts`.

- `name`: `SESSION_NAME`
- `httpOnly: true`, `path: '/'`, `secure: IS_PRODUCTION`
- `sameSite`: `'none'` prod, `'lax'` dev
- `domain`: `COOKIE_DOMAIN`
- `saveUninitialized: false`, `resave: false`

Guards: `AdminSessionAuthGuard` / `PartnerSessionAuthGuard` checam user na sessão — **não** revalidam JWT. Roles: `AdminRolesGuard` + `@Roles(...)`; `administrador-master` bypass. Partner guard **não** tem master bypass; ainda busca row Postgres.

`@IsPublic()` só metadata. **Nenhum** guard global lê isso. Auth = `@UseGuards` no controller.

## M2M (client_credentials)

```ts
export const keycloakAdminApi = axios.create({
  baseURL: KEYCLOAK_ADMIN_URL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});
```

Espelho `keycloakPartnerApi` + `KEYCLOAK_PARTNER_URL`.

Token em memória no service. Refresh se `tokenExpiry <= now + 30s`. Expiry gravado = `expires_in - 60s`.

```ts
const params = new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: env.KC_ADMIN_CLIENT_ID,
  client_secret: env.KC_ADMIN_CLIENT_SECRET,
});

await keycloakAdminApi.post(
  `realms/${env.KC_ADMIN_REALM}/protocol/openid-connect/token`,
  params.toString(),
);
```

Falha de token = `InternalServerErrorException('Unable to authenticate as system administrator')` — **não** `toKeycloakApiError`.

Service account do client precisa roles `realm-management`: `view-users`, `query-users`, `manage-users`, `view-clients`, `manage-clients`. Sem `manage-clients`, assign/remove client roles quebra (403/500).

Constantes: `KEYCLOAK_REQUEST_TIMEOUT_MS=30000`, `KEYCLOAK_TOKEN_SAFETY_MARGIN_SECONDS=60`, `KEYCLOAK_DEFAULT_EXPIRES_IN_SECONDS=300`, `KEYCLOAK_TOKEN_REFRESH_BUFFER_MS=30000`.

## Nova operação Admin REST

1. Método em `KeycloakAdminService` **ou** `KeycloakPartnerService` (realm certo).
2. `const token = await this.getSystemAccessToken()`.
3. Client roles/mappings: `getClientUuid(env.KC_*_CLIENT_ID)` — path usa **UUID**.
4. `keycloakAdminApi` / `keycloakPartnerApi` + `timeout: KEYCLOAK_REQUEST_TIMEOUT_MS`.
5. GET: `authHeaders(token)`. JSON mutate: `jsonAuthHeaders(token)` (`Content-Type: application/json`). Token POST usa form-urlencoded default da instance.
6. `try/catch` → log `formatKeycloakAxiosError` → `throw toKeycloakApiError(error)` (salvo bootstrap token/uuid).
7. Use case no módulo consumidor injeta o service (`KeycloakAuthModule.exports`).
8. Controller: `@UseGuards(AdminSessionAuthGuard, AdminRolesGuard)` + `@Roles(ADMIN_ROLES.…)` + `docs.ts`.

`toKeycloakApiError`: Axios → `KeycloakApiErrorException(status, data)`; senão 502. Body `{ message, keycloak }`. Message: `errorMessage` | `error_description` | `error` | `message`.

## Administrators (realm admin)

**Não** cria user Keycloak. User já existe. “Criar admin” = assign client roles + força `acesso`.

```ts
const rolesToAssign = roles.includes(ADMIN_ROLES.ACCESS) ? roles : [...roles, ADMIN_ROLES.ACCESS];
await this.keycloakAdminService.assignClientRolesToUser(keycloak_user_id, rolesToAssign);
```

Rotas (`@Roles(gerenciar-administradores)`):

| HTTP | Path | Efeito |
|------|------|--------|
| GET | `admin/administrators` | users com client role `acesso` |
| GET | `admin/administrators/candidates` | realm users paginado local |
| POST | `admin/administrators` | `{ keycloak_user_id, roles[] }` |
| PATCH | `admin/administrators/:keycloakUserId` | `replaceClientRolesForUser` (mantém `acesso`) |
| DELETE | `admin/administrators/:keycloakUserId` | remove `ASSIGNABLE_ROLE_VALUES` — user Keycloak **fica** |
| POST | `admin/administrators/copy-roles` | copia roles atribuíveis; falha por target isolada, HTTP 200 no lote |

`replaceClientRolesForUser`: diff só em `ASSIGNABLE_ROLE_VALUES` — não mexe em `administrador-master`.

Sync catálogo: `POST admin/keycloak/roles/sync` (`@Roles(sincronizar-roles)`). `listClientRoles` vs `ROLE_VALUES`; `createClientRole` / `deleteClientRole`. Role fora do catálogo **apaga** no client.

Role nova: string em `ADMIN_ROLES` (`keycloak-roles.constant.ts`) **e** no frontend `shared/constants/roles`. Depois sync. Master só no console Keycloak.

## Partner users (criação real)

`KeycloakPartnerService.registerPartnerUser`:

1. `POST /admin/realms/{KC_PARTNER_REALM}/users` `{ enabled, firstName, username=document, attributes.cpf_cnpj, email? }`
2. id = último segmento do header `Location`
3. 409: `GET /users?username=&exact=true`, reusa id
4. `PUT .../reset-password` `{ type:'password', value: KC_DEFAULT_PARTNER_PASSWORD, temporary:true }`
5. realm role `KC_PARTNER_REALM_DEFAULT_ROLE` + client role `acesso`

Cron 04:00 + `POST admin/keycloak/partner-sync`. Batch 200, delay 300ms. Liga `User.idKeycloak`.

Admin partner (`administrador-master`): GET/PATCH user, sessions, logout, reset-password, `execute-actions-email`.

## Env (Zod boot, todas required)

```
KC_ADMIN_REALM, KC_ADMIN_CLIENT_ID, KC_ADMIN_CLIENT_SECRET
KC_ADMIN_REDIRECT_URI, KC_ADMIN_POST_LOGOUT_REDIRECT_URI
KC_ADMIN_PROTOCOL, KC_ADMIN_DOMAIN, KC_ADMIN_PORT → KEYCLOAK_ADMIN_URL

KC_PARTNER_* (espelho) + KC_DEFAULT_PARTNER_PASSWORD + KC_PARTNER_REALM_DEFAULT_ROLE

SESSION_NAME, SESSION_SECRET, COOKIE_DOMAIN
REDIS_DOMAIN, REDIS_PORT, REDIS_SESSION_PREFIX, REDIS_TTL
FRONT_END_ADMIN_*, FRONT_END_PARTNER_*
```

## Checklist operação nova

- [ ] Realm certo (admin vs partner axios)
- [ ] M2M token via `getSystemAccessToken`
- [ ] UUID do client, não `clientId`, em roles/mappings
- [ ] Timeout + headers certos (form vs JSON)
- [ ] `toKeycloakApiError` nos métodos públicos
- [ ] Use case + guard + `@Roles` + `docs.ts`
- [ ] Role nova no catálogo BE **e** FE; master fora de assignable
