import { keycloakAdminApi } from "./keycloak-api";
import { getSystemAccessToken } from "./get-system-access-token";

const REQUEST_TIMEOUT_MS = 30_000;

export async function assignClientRolesToUser(params: {
  realm: string;
  clientUuid: string;
  userId: string;
  roles: Array<{ id: string; name: string }>;
}): Promise<void> {
  const token = await getSystemAccessToken();
  await keycloakAdminApi.post(
    `/admin/realms/${params.realm}/users/${params.userId}/role-mappings/clients/${params.clientUuid}`,
    params.roles,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT_MS,
    },
  );
}
