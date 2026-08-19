'use client';

import { type AxiosError, HttpStatusCode, isAxiosError } from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type AdminKeycloakCurrentUser, AuthContext, type VerifyCredentialsParams } from '@/contexts/auth-context';
import { API_ROUTES } from '@/shared/constants/api-routes';
import { APP_ROUTES } from '@/shared/constants/app-routes';
import type { Role } from '@/shared/constants/roles';
import { buildApiRoute } from '@/shared/functions/build-api-route';
import { buildAppRoute } from '@/shared/functions/build-app-route';
import { buildExpiredSessionLoginRoute } from '@/shared/functions/build-expired-session-login-route';
import { handleErrorTreatment } from '@/shared/functions/zod/get-zod-errors';
import { api, authless } from '../axios/api';

export interface RefreshAdminTokenResponse {
	adminUser: AdminKeycloakCurrentUser;
}

type QueuedRequest = {
	resolve: (value?: unknown) => void;
	reject: (error?: unknown) => void;
};

class RefreshTokenQueue {
	private isRefreshing = false;
	private queue: QueuedRequest[] = [];

	isInProgress(): boolean {
		return this.isRefreshing;
	}

	enqueue(request: QueuedRequest): void {
		this.queue.push(request);
	}

	flush(error?: unknown): void {
		for (const queuedRequest of this.queue) {
			if (error) {
				queuedRequest.reject(error);
			} else {
				queuedRequest.resolve();
			}
		}
		this.queue = [];
	}

	setRefreshing(value: boolean): void {
		this.isRefreshing = value;
	}
}

const refreshTokenQueue = new RefreshTokenQueue();

function isAuthEndpoint(url?: string): boolean {
	if (!url) return false;
	return url.includes(API_ROUTES.POST.AUTH.REFRESH_TOKEN) || url.includes(API_ROUTES.GET.AUTH.GET_LOGOUT_URL);
}

function isPublicRoute(pathname: string): boolean {
	const publicRoutes = new Set<string>([
		APP_ROUTES.PUBLIC.LOGIN,
		APP_ROUTES.PUBLIC.VERIFY_CREDENTIALS,
		APP_ROUTES.PUBLIC.NOT_FOUND,
		APP_ROUTES.PUBLIC.MEDIA,
	]);

	return publicRoutes.has(pathname);
}

function redirectToLogin(push: (url: string) => void): void {
	push(buildAppRoute(APP_ROUTES.PUBLIC.LOGIN));
}

function redirectToExpiredSessionLogin(push: (url: string) => void): void {
	push(buildExpiredSessionLoginRoute());
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const pathname = usePathname();
	const pathnameRef = useRef(pathname);
	pathnameRef.current = pathname;
	const sessionTerminatedRef = useRef(false);
	const { push } = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isSessionResolved, setIsSessionResolved] = useState(false);
	const [user, setUser] = useState<AdminKeycloakCurrentUser | undefined>(undefined);
	const [userId, setUserId] = useState<AdminKeycloakCurrentUser['id'] | undefined>(undefined);
	const [userRoles, setUserRoles] = useState<Array<Role>>([]);

	const updateUserSession = useCallback(async (user: AdminKeycloakCurrentUser) => {
		setUser(user);
		setUserRoles(user.roles);
		setUserId(user.id);
	}, []);

	/**
	 * Derruba a sessão local e manda o usuário para o login.
	 *
	 * O GET da url de logout é chamado pelo efeito colateral: com a sessão já morta no
	 * backend, o guard responde 401 com `Set-Cookie` expirando o cookie de sessão. Sem
	 * essa chamada o cookie sobrevive no browser e o proxy continua tratando o usuário
	 * como autenticado.
	 */
	const terminateSession = useCallback(
		async (message?: string) => {
			sessionTerminatedRef.current = true;
			setUser(undefined);
			setUserId(undefined);
			setUserRoles([]);
			if (message) toast.error(message);

			await authless.get<string>(buildApiRoute(API_ROUTES.GET.AUTH.GET_LOGOUT_URL)).catch(() => {});

			redirectToExpiredSessionLogin(push);
		},
		[push],
	);

	const refresh = useCallback(async () => {
		if (isPublicRoute(pathnameRef.current) || sessionTerminatedRef.current) {
			setIsSessionResolved(true);
			return;
		}
		setIsLoading(true);
		try {
			const {
				data: { adminUser },
			} = await authless.post<RefreshAdminTokenResponse>(buildApiRoute(API_ROUTES.POST.AUTH.REFRESH_TOKEN));
			await updateUserSession(adminUser);
		} catch (err) {
			if (isAxiosError(err) && err.response?.status === HttpStatusCode.Unauthorized) {
				await terminateSession('Sessão expirada');
				return;
			}
			handleErrorTreatment(err);
			await terminateSession();
		} finally {
			setIsLoading(false);
			setIsSessionResolved(true);
		}
	}, [updateUserSession, terminateSession]);

	const getLogoutUrl = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { url },
			} = await api.get<{ url: string }>(buildApiRoute(API_ROUTES.GET.AUTH.GET_LOGOUT_URL));

			window.location.assign(url);
		} catch (err) {
			handleErrorTreatment(err);
			await terminateSession();
		} finally {
			setIsLoading(false);
		}
	}, [terminateSession]);

	const getLoginUrl = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { url },
			} = await authless.get<{ url: string }>(buildApiRoute(API_ROUTES.GET.AUTH.GET_LOGIN_URL));
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
						status !== HttpStatusCode.Unauthorized || (originalRequest as { _retry?: boolean })._retry || isAuthEndpoint(originalRequest.url);

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

	useEffect(() => {
		refresh();

		const interceptor = createErrorInterceptor();

		return () => {
			api.interceptors.response.eject(interceptor);
		};
	}, [refresh, createErrorInterceptor]);

	const verifyCredentials = useCallback(
		async ({ code, state, redirect_to }: VerifyCredentialsParams) => {
			setIsLoading(true);
			try {
				const {
					data: { adminUser },
				} = await api.post<RefreshAdminTokenResponse>(buildApiRoute(API_ROUTES.POST.AUTH.VERIFY_CREDENTIALS), { code, state });
				await updateUserSession(adminUser);
				push(redirect_to);
			} catch (err) {
				setUserId(undefined);
				if (isAxiosError(err)) {
					throw err;
				}
				handleErrorTreatment(err);
				redirectToLogin(push);
			} finally {
				setIsLoading(false);
			}
		},
		[push, updateUserSession],
	);

	return (
		<AuthContext.Provider
			value={{
				isLoading,
				isSessionResolved,
				user,
				refresh,
				getLoginUrl,
				getLogoutUrl,
				verifyCredentials,
				userId,
				userRoles,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
