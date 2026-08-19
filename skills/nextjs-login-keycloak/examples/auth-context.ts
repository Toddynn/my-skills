import { createContext } from 'react';
import type { Role } from '@/shared/constants/roles';

export interface AdminKeycloakCurrentUser {
	id: string;
	name: string;
	badge: string;
	email: string;
	email_verified: boolean;
	cpf_cnpj: string;
	roles: Array<Role>;
}

export interface VerifyCredentialsParams {
	code: string;
	state: string;
	redirect_to: string;
}
interface AuthContextData {
	isLoading: boolean;
	/**
	 * `false` até a primeira tentativa de refresh terminar. Enquanto for `false`,
	 * `userRoles` estar vazio não significa "sem permissão", só "ainda não sei" —
	 * quem decide redirect/unauthorized precisa esperar.
	 */
	isSessionResolved: boolean;
	user: AdminKeycloakCurrentUser | undefined;
	userId: AdminKeycloakCurrentUser['id'] | undefined;
	userRoles: AdminKeycloakCurrentUser['roles'];
	getLoginUrl(): Promise<void>;
	refresh(): Promise<void>;
	getLogoutUrl(): void;
	verifyCredentials({ code, state }: VerifyCredentialsParams): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
