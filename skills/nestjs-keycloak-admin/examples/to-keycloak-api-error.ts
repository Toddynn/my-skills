import { HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

export class KeycloakApiErrorException extends HttpException {
  constructor(status: number | undefined, payload: unknown) {
    const normalized =
      status && Object.values(HttpStatus).includes(status as HttpStatus)
        ? status
        : HttpStatus.BAD_GATEWAY;
    const message =
      payload && typeof payload === "object" && "errorMessage" in payload
        ? String((payload as { errorMessage: unknown }).errorMessage)
        : "Erro ao comunicar com o Keycloak";
    super({ message, keycloak: payload }, normalized);
  }
}

export function toKeycloakApiError(error: unknown): KeycloakApiErrorException {
  if (axios.isAxiosError(error)) {
    return new KeycloakApiErrorException(error.response?.status, error.response?.data ?? error.message);
  }
  return new KeycloakApiErrorException(undefined, error instanceof Error ? error.message : String(error));
}
