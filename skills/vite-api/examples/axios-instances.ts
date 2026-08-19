import axios from "axios";
import { backend_url } from "@/shared/constants/env-variables";

const withCredentials = {
  baseURL: backend_url,
  withCredentials: true,
} as const;

export const api = axios.create(withCredentials);
export const authless = axios.create(withCredentials);
