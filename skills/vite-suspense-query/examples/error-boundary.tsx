import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error, retry: () => void) => ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
	}

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, () => {
					this.setState({ hasError: false, error: null });
				});
			}

			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<h2 className="mb-2 text-lg font-semibold text-destructive">
						Algo deu errado
					</h2>
					<p className="mb-4 text-sm text-muted-foreground">
						Ocorreu um erro inesperado. Tente recarregar a página.
					</p>
					<button
						type="button"
						onClick={() => this.setState({ hasError: false, error: null })}
						className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Tentar novamente
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
