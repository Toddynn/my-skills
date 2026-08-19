export const KEYCLOAK_AUTH_ROUTES = {
  GET_LOGIN_URL: "/auth/keycloak/get-login-url",
  VERIFY_CREDENTIALS: "/auth/keycloak/verify-credentials",
  REFRESH_TOKEN: "/auth/keycloak/refresh",
  GET_LOGOUT_URL: "/auth/keycloak/get-logout-url",
} as const;
