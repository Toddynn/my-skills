import { object, string } from "zod/v4";
import { modalControlSearchParams } from "@/shared/schemas/modal-control-search-params";
import type { InferZod } from "@/shared/interfaces/inferzod";

export const widgetsSearchParamsDefaults = {
  page: "1",
  limit: "10",
  widgets_search: "",
};

export const WidgetsSearchParamsSchema = object({
  page: string().optional().default(widgetsSearchParamsDefaults.page),
  limit: string().optional().default(widgetsSearchParamsDefaults.limit),
  widgets_search: string().optional().default(widgetsSearchParamsDefaults.widgets_search),
}).extend(modalControlSearchParams.shape);

export type WidgetsSearchParams = InferZod<typeof WidgetsSearchParamsSchema>;
