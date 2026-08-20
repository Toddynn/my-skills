import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { QueryDefaultErrorView } from "@/components/query-default-error-view";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getQueryClient } from "@/lib/providers/tanstack-query";
import { resetQueries } from "@/shared/functions/reset-queries";
import { private_get_widget_by_id_query_key } from "@/shared/functions/tanstack-query/widgets/get-by-id/query-key";
import { useSuspenseGetWidgetById } from "@/shared/functions/tanstack-query/widgets/get-by-id/use-index";
import { WidgetDetailSkeleton } from "./-shared/components/widget-detail-skeleton";

export const Route = createFileRoute("/_private/widgets/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id: widget_id } = Route.useParams();
	const query_client = getQueryClient();

	return (
		<ErrorBoundary
			fallback={(error, retry) => (
				<QueryDefaultErrorView
					error={error}
					retry={() => {
						resetQueries({
							query_client,
							query_keys_to_reset: private_get_widget_by_id_query_key({
								widget_id,
							}),
						});
						retry();
					}}
				/>
			)}
		>
			<Suspense fallback={<WidgetDetailSkeleton />}>
				<WidgetDetail widget_id={widget_id} />
			</Suspense>
		</ErrorBoundary>
	);
}

function WidgetDetail({ widget_id }: { widget_id: string }) {
	const { data: widget } = useSuspenseGetWidgetById({ widget_id });

	return (
		<div className="w-full space-y-4">
			<h1 className="text-2xl font-semibold tracking-tight">{widget.name}</h1>
		</div>
	);
}
