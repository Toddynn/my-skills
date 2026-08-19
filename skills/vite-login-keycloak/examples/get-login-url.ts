import { authless } from "./axios-instances";
import { KEYCLOAK_AUTH_ROUTES } from "./auth-endpoints";

export async function getLoginUrl(): Promise<void> {
  const {
    data: { url },
  } = await authless.get<{ url: string }>(KEYCLOAK_AUTH_ROUTES.GET_LOGIN_URL);
  window.open(url, "_self", "noopener,noreferrer")?.focus();
}
