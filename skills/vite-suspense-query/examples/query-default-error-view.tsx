import { LucideAlertTriangle, RefreshCcwIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QueryDefaultErrorViewProps extends ComponentProps<"div"> {
	error: Error | null;
	retry?: () => void;
}

export function QueryDefaultErrorView({
	error,
	retry,
	className,
}: QueryDefaultErrorViewProps) {
	return (
		<div className={cn("flex w-full flex-col items-stretch gap-4", className)}>
			<Alert variant="destructive">
				<LucideAlertTriangle />
				<AlertTitle>Erro ao carregar</AlertTitle>
				<AlertDescription>
					{String(error?.message ?? "Ocorreu um erro inesperado.")}
				</AlertDescription>
			</Alert>
			{retry ? (
				<Button variant="outline" className="self-start" onClick={retry}>
					<RefreshCcwIcon />
					Tentar novamente
				</Button>
			) : null}
		</div>
	);
}
