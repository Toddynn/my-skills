import { api } from "@/lib/providers/axios/api";
import type { QueryKey } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

export interface Widget {
  id: string;
  name: string;
}

export const get_all_widgets_query_key = ({
  search,
  page,
}: {
  search?: string;
  page?: number;
}): QueryKey => ["get-all-widgets", search, page];

export async function getAllWidgets(params: { search?: string; page: number }) {
  const { data } = await api.get("/admin/widgets", { params });
  return data;
}

export function useGetAllWidgets(params: { search?: string; page: number }) {
  return useQuery({
    queryKey: get_all_widgets_query_key(params),
    queryFn: () => getAllWidgets(params),
  });
}
