import { useContext } from 'react';
import { KeycloakAuthContext } from '@/contexts/keycloak-auth-context';

export const useKeycloakAuth = () => {
	const context = useContext(KeycloakAuthContext);

	if (!context) {
		throw new Error('useKeycloakAuth must be used within a <AuthProvider />');
	}

	return context;
};
