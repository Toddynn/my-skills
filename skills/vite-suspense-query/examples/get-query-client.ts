import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: STALE_TIME,
				gcTime: GC_TIME,
			},
		},
	});
}

export function getQueryClient() {
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}
