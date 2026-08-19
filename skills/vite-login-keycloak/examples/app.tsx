import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useKeycloakAuth } from './hooks/use-keycloak-auth';
import { KeycloakAuthProvider } from './lib/providers/keycloak-auth-provider';
import { TanstackQueryClientProvider } from './lib/providers/tanstack-query';
import { router } from './router';

function InnerRouter() {
	const keycloak = useKeycloakAuth();

	return <RouterProvider router={router} context={{ auth: { keycloak } }} />;
}

export function App() {
	return (
		<TanstackQueryClientProvider>
			<ThemeProvider>
				<KeycloakAuthProvider>
					<InnerRouter />

					<Toaster
						richColors
						position="top-center"
						swipeDirections={['bottom', 'left', 'right', 'top']}
						theme={'light'}
						className="cursor-grab select-none"
						closeButton
					/>
				</KeycloakAuthProvider>
			</ThemeProvider>
		</TanstackQueryClientProvider>
	);
}
