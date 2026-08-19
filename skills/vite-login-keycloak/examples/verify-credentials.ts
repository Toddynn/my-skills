import { api } from "./axios-instances";
import { KEYCLOAK_AUTH_ROUTES } from "./auth-endpoints";

export interface KeycloakCurrentUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  cpfCnpj: string;
  roles: string[];
}

export async function verifyCredentials(code: string, state: string): Promise<KeycloakCurrentUser> {
  const {
    data: { user },
  } = await api.post<{ user: KeycloakCurrentUser }>(KEYCLOAK_AUTH_ROUTES.VERIFY_CREDENTIALS, {
    code,
    state,
  });
  return user;
}
