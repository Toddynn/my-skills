import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/providers/query";
import { getAllWidgets, get_all_widgets_query_key } from "@/shared/functions/tanstack-query/get/widgets";
import { AdminWidgetHeader } from "./components/header";
import { WidgetList } from "./components/widget-list";

export default async function AdminWidget() {
  const query_client = getQueryClient();
  await query_client.prefetchQuery({
    queryKey: get_all_widgets_query_key({}),
    queryFn: () => getAllWidgets({ page: 1 }),
  });

  return (
    <HydrationBoundary state={dehydrate(query_client)}>
      <section className="relative mt-16 flex h-full min-h-0 w-full rounded-3xl border">
        <AdminWidgetHeader />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WidgetList />
        </div>
      </section>
    </HydrationBoundary>
  );
}
