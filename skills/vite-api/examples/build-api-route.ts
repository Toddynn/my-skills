// --- Helper types ---

import type { API_ROUTES } from '@/shared/constants/api-routes';

type ExtractRouteParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}`
	? Param | ExtractRouteParams<`/${Rest}`>
	: Path extends `${string}:${infer Param}`
		? Param
		: never;

type ParamsObject<Path extends string> = [ExtractRouteParams<Path>] extends [never]
	? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{}
	: {
			[K in ExtractRouteParams<Path>]: string | number;
		};

// --- Flatten API_ROUTES ---

type FlattenApiRoutes<T> =
	T extends Record<string, any>
		? {
				[K in keyof T]: T[K] extends string ? T[K] : FlattenApiRoutes<T[K]>;
			}[keyof T]
		: never;

type AllApiPaths = FlattenApiRoutes<typeof API_ROUTES>;

// --- buildRoute Function ---

/**
 * Função para construir URL de API com base em um caminho definido e parâmetros.
 *
 * @param {string} path - Caminho da API.
 * @param {Record<string, string | number>} params - Parâmetros a serem passados.
 * @returns {string} URL construída com base no path e parâmetros.
 * @throws {Error} Se algum parâmetro for o caminho não for encontrado.
 */
export function buildApiRoute<Path extends AllApiPaths>(
	path: Path,
	...args: ExtractRouteParams<Path> extends never
		? [] // Nenhum param esperado => não pode passar nada
		: [params: ParamsObject<Path>] // Se tiver params, eles são obrigatórios e exatos
): string {
	let builtPath = String(path);

	const params = (args[0] ?? {}) as Record<string, string | number>;

	builtPath = builtPath.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
		const value = params[paramName];
		if (value === undefined) {
			throw new Error(`Missing parameter "${paramName}" for path "${path}"`);
		}
		return String(value);
	});

	return builtPath;
}
