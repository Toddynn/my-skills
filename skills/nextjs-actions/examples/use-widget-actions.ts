import { api } from "@/lib/providers/axios/api";
import { handleErrorTreatment } from "@/shared/functions/zod/get-zod-errors";
import { invalidateQueries } from "@/shared/functions/invalidate-queries";
import { getQueryClient } from "@/lib/providers/query";
import { buildApiRoute } from "@/shared/functions/build-api-route";
import { API_ROUTES } from "@/shared/constants/api-routes";
import { CreateWidgetSchema } from "../../schemas/create-widget-schema";
import type { CreateWidgetFormFields } from "../../interfaces/create-widget-form-fields";
import type { BaseActionArgs, BaseCallbackArgs } from "@/shared/interfaces/base-action-args";

export function useWidgetActions() {
  const query_client = getQueryClient();

  const create_widget = async ({
    form_data,
    on_success,
    on_fail,
    query_keys_to_invalidate,
  }: BaseActionArgs<CreateWidgetFormFields>) => {
    try {
      const parsed = await CreateWidgetSchema.parseAsync(form_data);
      const response = await api.post(buildApiRoute(API_ROUTES.POST.ADMIN.WIDGETS.CREATE), parsed);
      if (query_keys_to_invalidate) {
        await invalidateQueries({ query_client, query_keys_to_invalidate });
      }
      on_success?.(response.data);
    } catch (error) {
      handleErrorTreatment(error);
      on_fail?.(error);
    }
  };

  const delete_widget = async ({
    widget_id,
    on_success,
    on_fail,
    query_keys_to_invalidate,
  }: BaseCallbackArgs & { widget_id: string }) => {
    try {
      await api.delete(buildApiRoute(API_ROUTES.DELETE.ADMIN.WIDGETS.DELETE, { widget_id }));
      if (query_keys_to_invalidate) {
        await invalidateQueries({ query_client, query_keys_to_invalidate });
      }
      on_success?.();
    } catch (error) {
      handleErrorTreatment(error);
      on_fail?.(error);
    }
  };

  return { create_widget, delete_widget };
}
