import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WidgetDetailSkeleton() {
	return (
		<div className="w-full space-y-8 px-1">
			<div className="space-y-3">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>
			<Card className="gap-4 p-6">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-24 w-full" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-28" />
					<Skeleton className="h-9 w-28" />
				</div>
			</Card>
		</div>
	);
}
