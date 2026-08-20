import { api } from "@/lib/providers/api";
import { API_ROUTES } from "@/shared/constants/api-routes";
import { buildApiRoute } from "@/shared/functions/build-api-route";
import type { BaseDates } from "@/shared/interfaces/base-dates";

export interface Widget extends BaseDates {
	id: string;
	name: string;
}

export async function privateGetWidgetById(params: {
	widget_id: string;
}): Promise<Widget> {
	const { data } = await api.get<Widget>(
		buildApiRoute(API_ROUTES.GET.PRIVATE.WIDGETS.BY_ID, {
			widget_id: params.widget_id,
		}),
	);
	return data;
}
