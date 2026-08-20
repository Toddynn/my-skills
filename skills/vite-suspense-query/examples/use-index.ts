import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { privateGetWidgetById } from "./index";
import { private_get_widget_by_id_query_key } from "./query-key";

export function useGetWidgetById({ widget_id }: { widget_id: string }) {
	return useQuery({
		queryKey: private_get_widget_by_id_query_key({ widget_id }),
		queryFn: async () => await privateGetWidgetById({ widget_id }),
		enabled: !!widget_id,
	});
}

export function useSuspenseGetWidgetById({ widget_id }: { widget_id: string }) {
	return useSuspenseQuery({
		queryKey: private_get_widget_by_id_query_key({ widget_id }),
		queryFn: async () => await privateGetWidgetById({ widget_id }),
	});
}
