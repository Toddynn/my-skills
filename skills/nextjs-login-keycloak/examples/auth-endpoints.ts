export const ADMIN_AUTH_ROUTES = {
  GET_LOGIN_URL: "/auth/keycloak/admin/get-login-url",
  VERIFY_CREDENTIALS: "/auth/keycloak/admin/verify-credentials",
  REFRESH_TOKEN: "/auth/keycloak/admin/refresh",
  GET_LOGOUT_URL: "/auth/keycloak/admin/get-logout-url",
} as const;
