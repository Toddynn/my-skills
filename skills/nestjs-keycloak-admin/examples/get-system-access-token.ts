import { InternalServerErrorException } from "@nestjs/common";
import { keycloakAdminApi } from "./keycloak-api";

const TOKEN_REFRESH_BUFFER_MS = 30_000;
const TOKEN_SAFETY_MARGIN_SECONDS = 60;
const DEFAULT_EXPIRES_IN_SECONDS = 300;

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

export async function getSystemAccessToken(): Promise<string> {
  const refreshThreshold = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS);
  if (accessToken && tokenExpiry && tokenExpiry > refreshThreshold) {
    return accessToken;
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.KC_ADMIN_CLIENT_ID ?? "",
    client_secret: process.env.KC_ADMIN_CLIENT_SECRET ?? "",
  });

  try {
    const response = await keycloakAdminApi.post(
      `realms/${process.env.KC_ADMIN_REALM}/protocol/openid-connect/token`,
      params.toString(),
    );
    accessToken = response.data.access_token as string;
    const expiresIn = (response.data.expires_in as number) || DEFAULT_EXPIRES_IN_SECONDS;
    tokenExpiry = new Date(Date.now() + (expiresIn - TOKEN_SAFETY_MARGIN_SECONDS) * 1000);
    return accessToken;
  } catch {
    throw new InternalServerErrorException("Unable to authenticate as system administrator");
  }
}
