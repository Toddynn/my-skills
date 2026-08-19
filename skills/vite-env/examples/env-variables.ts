import { coerce, object, string } from "zod/v4";

const rawClientEnv = {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_BACKEND_PROTOCOL: import.meta.env.VITE_BACKEND_PROTOCOL,
  VITE_BACKEND_DOMAIN: import.meta.env.VITE_BACKEND_DOMAIN,
  VITE_BACKEND_PORT: import.meta.env.VITE_BACKEND_PORT,
  VITE_DEFAULT_DEBOUNCE_IN_MS: import.meta.env.VITE_DEFAULT_DEBOUNCE_IN_MS,
};

const clientEnvSchema = object({
  VITE_APP_NAME: string({ error: "VITE_APP_NAME is required." }),
  VITE_BACKEND_PROTOCOL: string({ error: "VITE_BACKEND_PROTOCOL is required." }),
  VITE_BACKEND_DOMAIN: string({ error: "VITE_BACKEND_DOMAIN is required." }),
  VITE_BACKEND_PORT: string({ error: "VITE_BACKEND_PORT is required." }),
  VITE_DEFAULT_DEBOUNCE_IN_MS: coerce.number({ error: "VITE_DEFAULT_DEBOUNCE_IN_MS is required." }),
});

export const env = clientEnvSchema.parse(rawClientEnv);

export const backend_url = `${env.VITE_BACKEND_PROTOCOL}://${env.VITE_BACKEND_DOMAIN}:${env.VITE_BACKEND_PORT}`;
export const is_production = import.meta.env.PROD;
