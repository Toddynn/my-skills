import axios from "axios";

export async function exchangeAuthorizationCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  keycloakUrl: string;
  realm: string;
}) {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: "authorization_code",
    redirect_uri: params.redirectUri,
    code: params.code,
  });

  const { data } = await axios.post(
    `${params.keycloakUrl}/realms/${params.realm}/protocol/openid-connect/token`,
    body.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  return data as {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    refresh_expires_in: number;
  };
}
