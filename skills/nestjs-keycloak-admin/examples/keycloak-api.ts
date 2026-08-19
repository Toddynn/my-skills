import axios from "axios";

export const keycloakAdminApi = axios.create({
  baseURL: process.env.KEYCLOAK_ADMIN_URL,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});
