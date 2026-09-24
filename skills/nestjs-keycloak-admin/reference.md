# Keycloak Admin REST + OIDC — paths

Complemento de [SKILL.md](SKILL.md). Paths Admin REST + OIDC.

## Axios

`src/shared/services/keycloak-api.ts`:

- `keycloakAdminApi` → `KEYCLOAK_ADMIN_URL`
- `keycloakPartnerApi` → `KEYCLOAK_PARTNER_URL`
- Default header: `Content-Type: application/x-www-form-urlencoded`
- JSON mutate: override `Content-Type: application/json` via `jsonAuthHeaders`

OIDC login (authorization_code / refresh / logout / auth URL) usa `axios` direto, **não** essas instances (exceto M2M token POST, que usa).

## OIDC (browser / BFF)

```
GET  /realms/{realm}/protocol/openid-connect/auth
POST /realms/{realm}/protocol/openid-connect/token    # authorization_code | refresh_token | client_credentials
GET  /realms/{realm}/protocol/openid-connect/logout
GET  /realms/{realm}/protocol/openid-connect/certs    # strategies JWT — não registradas
```

Nest:

```
GET  auth/keycloak/admin/get-login-url
POST auth/keycloak/admin/verify-credentials
POST auth/keycloak/admin/refresh
GET  auth/keycloak/admin/get-logout-url

GET/POST auth/keycloak/partner/...                     # espelho
```

## Admin REST — realm admin (`KC_ADMIN_REALM`)

`KeycloakAdminService`. Client alvo = `KC_ADMIN_CLIENT_ID`.

```
POST   /realms/{realm}/protocol/openid-connect/token
GET    /admin/realms/{realm}/clients?clientId=
GET    /admin/realms/{realm}/clients/{clientUuid}/roles
POST   /admin/realms/{realm}/clients/{clientUuid}/roles          body { name }
GET    /admin/realms/{realm}/clients/{clientUuid}/roles/{roleName}
DELETE /admin/realms/{realm}/clients/{clientUuid}/roles/{roleName}
GET    /admin/realms/{realm}/clients/{clientUuid}/roles/{roleName}/users   briefRepresentation=false
GET    /admin/realms/{realm}/users?first&max&briefRepresentation=false     loop max=100
GET    /admin/realms/{realm}/users/{userId}                                briefRepresentation=false
GET    /admin/realms/{realm}/users/{userId}/role-mappings/clients/{clientUuid}
POST   /admin/realms/{realm}/users/{userId}/role-mappings/clients/{clientUuid}   body [{id,name}]
DELETE /admin/realms/{realm}/users/{userId}/role-mappings/clients/{clientUuid}   body [{id,name}]
GET    /admin/realms/{realm}/groups                                              briefRepresentation=true
POST   /admin/realms/{realm}/groups                                              body { name }
GET    /admin/realms/{realm}/groups/{groupId}/role-mappings/clients/{clientUuid}
POST   /admin/realms/{realm}/groups/{groupId}/role-mappings/clients/{clientUuid} body [{id,name}]
DELETE /admin/realms/{realm}/groups/{groupId}/role-mappings/clients/{clientUuid} body [{id,name}]
GET    /admin/realms/{realm}/users/{userId}/groups
PUT    /admin/realms/{realm}/users/{userId}/groups/{groupId}
DELETE /admin/realms/{realm}/users/{userId}/groups/{groupId}
GET    /admin/realms/{realm}/group-by-path/{encodedPath}                         # passin: path admin fixo
GET    /health/ready
```

Nest groups (clube): `admin/keycloak-groups` (+ `/users/:keycloakUserId`, `/:groupId/roles`). Passin espelho: `keycloak/groups`.

Search de candidates: fetch all + filtro in-memory (username, first/last, email, id, `attributes.cpf_cnpj`). Paginação Node depois.

## Admin REST — realm partner (`KC_PARTNER_REALM`)

`KeycloakPartnerService`.

```
POST   /realms/{realm}/protocol/openid-connect/token
GET    /admin/realms/{realm}/roles/{roleName}
GET    /admin/realms/{realm}/clients?clientId=
GET    /admin/realms/{realm}/clients/{clientUuid}/roles/{roleName}
GET    /admin/realms/{realm}/users?username=&exact=true
POST   /admin/realms/{realm}/users
GET    /admin/realms/{realm}/users/{id}
PUT    /admin/realms/{realm}/users/{id}
PUT    /admin/realms/{realm}/users/{id}/reset-password
PUT    /admin/realms/{realm}/users/{id}/execute-actions-email?client_id&redirect_uri&lifespan
GET    /admin/realms/{realm}/users/{id}/role-mappings/realm
POST   /admin/realms/{realm}/users/{id}/role-mappings/realm
GET    /admin/realms/{realm}/users/{id}/role-mappings/clients/{clientUuid}
POST   /admin/realms/{realm}/users/{id}/role-mappings/clients/{clientUuid}
GET    /admin/realms/{realm}/users/{id}/sessions
POST   /admin/realms/{realm}/users/{id}/logout
GET    /admin/realms/{realm}/authentication/required-actions
GET    /health/ready
```

Create user: id no header `Location`. 409 → lookup `username` exact.

Reset password body: `{ type: 'password', value: KC_DEFAULT_PARTNER_PASSWORD, temporary: true }`.

## Service account (client admin)

No client `KC_ADMIN_CLIENT_ID`: Client authentication + Service accounts roles. Assign de `realm-management`:

- `view-users`
- `query-users`
- `manage-users` — membership user↔group
- `view-clients`
- `manage-clients` — sem isso, POST/PATCH/DELETE administrators **e** role-mappings de group quebra
- `manage-realm` — pode ser necessário pra `POST /groups` (create); validar no ambiente

Partner service account: equivalente no client partner (criar user, reset-password, sessions, role-mappings).

## Shapes

```ts
interface KeycloakRoleRepresentation {
  id: string;
  name: string;
}

interface KeycloakGroupRepresentation {
  id: string;
  name: string;
  path?: string;
}

interface KeycloakUserRepresentation {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: {
    locale: string[];
    cpf_cnpj: string[];
  };
  enabled: boolean;
  createdTimestamp: number;
  totp: boolean;
  notBefore: number;
  requiredActions?: string[];
}
```

Token OIDC payload: `access_token`, `expires_in`, `refresh_expires_in`, `refresh_token`, `token_type`, `id_token`, `session_state`, `scope`.

Sessão Express: `adminUser?`, `partnerUser?`, `nonce`, `state`, `access_token`, `refresh_token`, `expires_in`, `refresh_expires_in`, `id_token`.

## Roles

Fonte: `keycloak-auth/shared/constants/keycloak-roles.constant.ts`.

- `ADMIN_ROLES.ACCESS = 'acesso'` — login não completa sem
- `ADMIN_ROLES.MASTER = 'administrador-master'` — bypass guard; **não** atribuível pela API
- `ASSIGNABLE_ROLE_VALUES` = `ROLE_VALUES` menos master
- `PARTNER_ROLES.ACCESS = 'acesso'`
- Permissionamento fino: kebab PT (`visualizar-banners`, `criar-banners`, …)

FE admin precisa das **mesmas** strings em `shared/constants/roles`.

## Módulos

| Módulo | Papel |
|--------|--------|
| `keycloak-auth` | OIDC BFF, session, services Admin/Partner, sync roles, partner sync cron |
| `administrators-admin` | CRUD roles em users do realm admin |
| `keycloak-groups-admin` | CRUD groups + role-mappings + membership (sem DELETE grupo) |
| `keycloak-partner-users-admin` | UI admin sobre users do realm partner |

Desvio vs skill Nest: `services/` na raiz de `keycloak-auth`; guards em `models/`; axios em `src/shared/services`. Administrators/groups **sem** entity TypeORM — Keycloak é source of truth. Entity só `KeycloakPartnerSyncRun`.

## O que não existe neste código

- DELETE de realm group no produto (só create/list + roles + membership)
- Realm roles no permissionamento admin (partner usa 1 realm role default no register)
- Create/update client
- userinfo / introspect
- PKCE
- Passport JWT nas requests
