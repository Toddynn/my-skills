import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/shared/constants/env-variables";
import { WidgetsSearchParamsSchema } from "./-shared/schemas/search-params-schema";

export const Route = createFileRoute("/_private/widgets/")({
  head: () => ({ meta: [{ title: `${env.VITE_APP_NAME} | Widgets` }] }),
  validateSearch: (search) => WidgetsSearchParamsSchema.parse(search),
  loader: () => ({ crumb: "Widgets" }),
  component: WidgetsPage,
});

function WidgetsPage() {
  return null;
}
