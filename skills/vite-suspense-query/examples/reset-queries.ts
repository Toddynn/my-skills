import type { QueryClient, QueryKey } from "@tanstack/react-query";

interface ResetQueriesProps {
	query_client: QueryClient;
	query_keys_to_reset: QueryKey;
}

export const resetQueries = async ({
	query_client,
	query_keys_to_reset,
}: ResetQueriesProps) => {
	await query_client.resetQueries({
		predicate: (query) =>
			query_keys_to_reset.includes(String(query.queryKey[0])),
	});
};
