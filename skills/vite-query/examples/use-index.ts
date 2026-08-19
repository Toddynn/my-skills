import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { privateGetAllWidgets } from "./index";
import { private_get_all_widgets_query_key } from "./query-key";

function getNextPageParam({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return currentPage < totalPages ? currentPage + 1 : undefined;
}

export const usePrivateGetAllWidgets = ({
  search,
  page = 1,
  limit = 10,
  enabled = true,
}: {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: private_get_all_widgets_query_key({ search }),
    queryFn: async ({ pageParam }) =>
      await privateGetAllWidgets({ search, page: pageParam, limit }),
    initialPageParam: page,
    getNextPageParam,
    placeholderData: keepPreviousData,
    enabled,
  });
