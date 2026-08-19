'use client';

import { LucideCheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { ModalControlQueryControl } from '@/hooks/use-modal-control-query';

interface ProgressModalProps {
	control?: ModalControlQueryControl;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	onClose?: () => void;
	isLoading: boolean;
	progress: number;
	onCancelRequest?: () => void;
	loading_message?: string;
	finish_message?: string;
}

export default function ProgressModal({
	control,
	isOpen,
	onOpenChange,
	onClose,
	loading_message = 'Fazendo upload dos arquivos',
	finish_message = 'Finalizado',
	isLoading,
	progress,
	onCancelRequest,
}: ProgressModalProps) {
	const resolvedControl: ModalControlQueryControl = control ?? {
		open: isOpen ?? false,
		onOpenChange: (open) => {
			onOpenChange?.(open);
			if (!open) onClose?.();
		},
	};

	const handleOpenChange = (open: boolean) => {
		if (isLoading && !open) return;
		resolvedControl.onOpenChange(open);
	};

	return (
		<Dialog open={resolvedControl.open} onOpenChange={handleOpenChange}>
			<DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isLoading ? loading_message : finish_message}</DialogTitle>
				</DialogHeader>

				<div className="space-y-2">
					<Progress value={progress} />
					<p className="text-sm text-muted-foreground">
						{isLoading ? (
							'Carregando...'
						) : (
							<span className="inline-flex items-center gap-2">
								Finalizado <LucideCheckCircle className="size-4 text-green-600" />
							</span>
						)}
					</p>
					<p className="text-right text-sm font-medium">{progress}%</p>
				</div>

				<DialogFooter>
					<Button variant="ghost" disabled={!isLoading || progress === 100} onClick={onCancelRequest}>
						Cancelar
					</Button>
					<Button disabled={isLoading} onClick={() => handleOpenChange(false)}>
						{isLoading ? 'Por favor, aguarde...' : 'Fechar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
