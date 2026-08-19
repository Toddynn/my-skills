import axios from "axios";
import { backend_url } from "@/shared/constants/env-variables";

const keycloakAxiosConfigWithCredentials = {
  baseURL: backend_url,
  withCredentials: true,
};

export const api = axios.create(keycloakAxiosConfigWithCredentials);
export const authless = axios.create(keycloakAxiosConfigWithCredentials);
