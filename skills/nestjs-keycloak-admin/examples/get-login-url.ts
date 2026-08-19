import { randomBytes } from "node:crypto";

export function buildKeycloakLoginUrl(params: {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
}) {
  const state = randomBytes(16).toString("base64");
  const nonce = randomBytes(16).toString("base64");
  const search = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: "openid",
    state,
    nonce,
  });

  return {
    url: `${params.keycloakUrl}/realms/${params.realm}/protocol/openid-connect/auth?${search.toString()}`,
    state,
    nonce,
  };
}
