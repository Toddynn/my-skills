import { type AxiosError, HttpStatusCode, isAxiosError } from 'axios';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { toast } from 'sonner';
import { KeycloakAuthContext, type KeycloakCurrentUser, type VerifyCredentialsParams } from '@/contexts/keycloak-auth-context';
import { router } from '@/router';
import { RefreshTokenQueue } from '@/shared/classes/refresh-token-queue';
import { API_ROUTES } from '@/shared/constants/api-routes';
import { env } from '@/shared/constants/env-variables';
import { ROLES } from '@/shared/constants/roles';
import { buildApiRoute } from '@/shared/functions/build-api-route';
import { handleErrorTreatment } from '@/shared/functions/handle-error-treatment';
import { api, authless } from '../api';
export interface RefreshTokenResponse {
	user: KeycloakCurrentUser;
}

const refreshTokenQueue = new RefreshTokenQueue();

function isAuthEndpoint(url?: string): boolean {
	if (!url) return false;
	return (
		url.includes(API_ROUTES.POST.PRIVATE.AUTH.REFRESH_TOKEN) ||
		url.includes(API_ROUTES.GET.PRIVATE.AUTH.GET_LOGOUT_URL) ||
		url.includes(API_ROUTES.POST.PUBLIC.AUTH.VERIFY_CREDENTIALS)
	);
}

function redirectToLogin(): void {
	router.navigate({ to: '/login', search: { redirect: location.href, unauthorized: true } });
}

export const KeycloakAuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [currentUser, setCurrentUser] = useState<KeycloakCurrentUser | null>(null);
	const [hasAccess, setHasAccess] = useState(false);
	const [canViewSensitiveActions, setCanViewSensitiveActions] = useState(false);
	const [canViewPetimIntegrationActions, setCanViewPetimIntegrationActions] = useState(false);

	const clearUserSession = useCallback(() => {
		setCurrentUser(null);
		setHasAccess(false);
		setCanViewSensitiveActions(false);
		setCanViewPetimIntegrationActions(false);
	}, []);

	const updateUserSession = useCallback((user: KeycloakCurrentUser) => {
		const roles: KeycloakCurrentUser['roles'] = user.roles ?? [];
		const petimRoles: KeycloakCurrentUser['petimRoles'] = user.petimRoles ?? [];
		const petimIntegrationRequiredRoles = env.VITE_PETIM_INTEGRATION_REQUIRED_ROLES.split(',')
			.map((role) => role.trim())
			.filter(Boolean);
		const nextUser: KeycloakCurrentUser = {
			...user,
			roles,
			petimRoles,
			emailVerified: user.emailVerified ?? false,
		};

		setCurrentUser(nextUser);
		setHasAccess(roles.includes(ROLES.ACCESS));
		setCanViewSensitiveActions(roles.includes(ROLES.GENERAL_ADMINISTRATOR));
		setCanViewPetimIntegrationActions(petimIntegrationRequiredRoles.every((role) => petimRoles.includes(role)));
		return nextUser;
	}, []);

	const handleUnauthorizedError = useCallback(async () => {
		clearUserSession();
		toast.error('Sessão expirada');
		await authless.get<{ url: string }>(buildApiRoute(API_ROUTES.GET.PRIVATE.AUTH.GET_LOGOUT_URL)).catch(() => {});

		redirectToLogin();
	}, [clearUserSession]);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { user },
			} = await authless.post<RefreshTokenResponse>(buildApiRoute(API_ROUTES.POST.PRIVATE.AUTH.REFRESH_TOKEN));
			return updateUserSession(user);
		} catch (err) {
			if (isAxiosError(err) && err.response?.status === HttpStatusCode.Unauthorized) {
				await handleUnauthorizedError();
				return null;
			}
			handleErrorTreatment(err);
			redirectToLogin();
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [updateUserSession, handleUnauthorizedError]);

	const getLogoutUrl = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { url },
			} = await api.get<{ url: string }>(buildApiRoute(API_ROUTES.GET.PRIVATE.AUTH.GET_LOGOUT_URL));
			window.open(url, '_self', 'noopener,noreferrer')?.focus();
		} catch (err) {
			handleErrorTreatment(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const getLoginUrl = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { url },
			} = await authless.get<{ url: string }>(buildApiRoute(API_ROUTES.GET.PUBLIC.AUTH.GET_LOGIN_URL));
			window.open(url, '_self', 'noopener,noreferrer')?.focus();
		} catch (err) {
			handleErrorTreatment(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const createErrorInterceptor = useCallback(
		() =>
			api.interceptors.response.use(
				(response) => response,
				async (error: AxiosError) => {
					const originalRequest = error.config;
					const status = error.response?.status;

					if (!originalRequest) {
						return Promise.reject(error);
					}

					const shouldNotRetry =
						status === HttpStatusCode.Forbidden ||
						status !== HttpStatusCode.Unauthorized ||
						(originalRequest as { _retry?: boolean })._retry ||
						isAuthEndpoint(originalRequest.url);

					if (shouldNotRetry) {
						return Promise.reject(error);
					}

					(originalRequest as { _retry?: boolean })._retry = true;

					if (refreshTokenQueue.isInProgress()) {
						return new Promise((resolve, reject) => {
							refreshTokenQueue.enqueue({
								resolve: () => resolve(api(originalRequest)),
								reject,
							});
						});
					}

					refreshTokenQueue.setRefreshing(true);
					try {
						await refresh();
						refreshTokenQueue.flush();
						return api(originalRequest);
					} catch (err) {
						await getLogoutUrl();
						refreshTokenQueue.flush(err);
						return Promise.reject(err);
					} finally {
						refreshTokenQueue.setRefreshing(false);
					}
				},
			),
		[refresh, getLogoutUrl],
	);

	const setupErrorInterceptor = useEffectEvent(() => {
		return createErrorInterceptor();
	});

	useEffect(() => {
		const interceptorId = setupErrorInterceptor();
		return () => {
			api.interceptors.response.eject(interceptorId);
		};
	}, []);

	const verifyCredentials = useCallback(
		async ({ code, state }: VerifyCredentialsParams) => {
			setIsLoading(true);
			try {
				const {
					data: { user },
				} = await authless.post<RefreshTokenResponse>(buildApiRoute(API_ROUTES.POST.PUBLIC.AUTH.VERIFY_CREDENTIALS), { code, state });
				updateUserSession(user);
				router.navigate({
					to: '/',
				});
			} catch (err) {
				clearUserSession();
				if (isAxiosError(err)) {
					throw err;
				}
				handleErrorTreatment(err);
				redirectToLogin();
			} finally {
				setIsLoading(false);
			}
		},
		[updateUserSession, clearUserSession],
	);

	return (
		<KeycloakAuthContext.Provider
			value={{
				isLoading,
				refresh,
				getLoginUrl,
				getLogoutUrl,
				verifyCredentials,
				currentUser,
				hasAccess,
				canViewSensitiveActions,
				canViewPetimIntegrationActions,
			}}
		>
			{children}
		</KeycloakAuthContext.Provider>
	);
};
