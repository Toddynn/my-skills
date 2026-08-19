import { api } from "@/lib/providers/api";
import { buildApiRoute } from "@/shared/functions/build-api-route";
import { API_ROUTES } from "@/shared/constants/api-routes";
import type { DefaultPaginatedResponse } from "@/shared/interfaces/default-paginated-response";
import type { BaseDates } from "@/shared/interfaces/base-dates";

export interface Widget extends BaseDates {
  id: string;
  name: string;
}

export async function privateGetAllWidgets(params: {
  search?: string;
  page: number;
  limit: number;
}): Promise<DefaultPaginatedResponse<Widget>> {
  const { data } = await api.get<DefaultPaginatedResponse<Widget>>(
    buildApiRoute(API_ROUTES.GET.PRIVATE.WIDGETS.LIST),
    { params },
  );
  return data;
}
