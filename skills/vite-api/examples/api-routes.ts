export const API_ROUTES = {
  GET: {
    PUBLIC: {
      AUTH: { GET_LOGIN_URL: "/auth/keycloak/get-login-url" },
    },
    PRIVATE: {
      AUTH: { GET_LOGOUT_URL: "/auth/keycloak/get-logout-url" },
      WIDGETS: { GET_BY_ID: "/widgets/:widget_id" },
    },
  },
  POST: {
    PUBLIC: {
      AUTH: { VERIFY_CREDENTIALS: "/auth/keycloak/verify-credentials" },
    },
    PRIVATE: {
      AUTH: { REFRESH_TOKEN: "/auth/keycloak/refresh" },
      WIDGETS: { CREATE: "/widgets" },
    },
  },
  DELETE: {
    PRIVATE: {
      WIDGETS: { DELETE: "/widgets/:widget_id" },
    },
  },
} as const;
