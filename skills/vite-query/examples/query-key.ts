import type { QueryKey } from "@tanstack/react-query";

export const private_get_all_widgets_query_key = ({
  search,
}: {
  search?: string;
}): QueryKey => ["private-get-all-widgets", search];
