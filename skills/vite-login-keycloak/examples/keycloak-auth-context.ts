import { createContext } from 'react';
import type { Role } from '@/shared/constants/roles';

export interface KeycloakCurrentUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	roles: Array<Role>;
	petimRoles: Array<string>;
}
export interface VerifyCredentialsParams {
	code: string;
	state: string;
}

export interface KeycloakAuthContextProps {
	hasAccess: boolean;
	canViewSensitiveActions: boolean;
	canViewPetimIntegrationActions: boolean;
	isLoading: boolean;
	currentUser: KeycloakCurrentUser | null;
	getLoginUrl(): Promise<void>;
	refresh(): Promise<KeycloakCurrentUser | null>;
	getLogoutUrl(): Promise<void>;
	verifyCredentials(params: VerifyCredentialsParams): Promise<void>;
}

export const KeycloakAuthContext = createContext<KeycloakAuthContextProps>({} as KeycloakAuthContextProps);
