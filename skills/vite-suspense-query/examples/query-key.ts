import type { QueryKey } from "@tanstack/react-query";

export const private_get_widget_by_id_query_key = ({
	widget_id,
}: {
	widget_id: string;
}): QueryKey => ["private-get-widget-by-id", widget_id];
