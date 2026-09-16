import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WidgetFormularySummary } from '@/components/ui/formularies/widgets/widget-formulary-summary';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ModalControlQueryControl } from '@/hooks/use-modal-control-query';
import { useWidgetsActions } from '@/routes/_private/widgets/-shared/functions/use-widgets-actions';
import type { CreateWidgetForm } from '@/routes/_private/widgets/-shared/interfaces/create-widget-form';
import { private_get_all_widgets_query_key } from '@/shared/functions/tanstack-query/widgets/get-all/query-key';

interface ConfirmWidgetCreationModalProps {
	control: ModalControlQueryControl;
	snapshot: CreateWidgetForm;
	on_success_callback?: () => void;
}

export function ConfirmWidgetCreationModal({
	control,
	snapshot,
	on_success_callback,
}: ConfirmWidgetCreationModalProps) {
	const { createWidget } = useWidgetsActions();

	const { mutateAsync: handleCreateWidget, isPending: isCreatingWidget } = useMutation({
		mutationFn: async () =>
			await createWidget({
				form_data: snapshot,
				query_keys_to_invalidate: private_get_all_widgets_query_key({}),
				on_success: () => {
					toast.success('Widget criado com sucesso!');
					control.onOpenChange(false);
					on_success_callback?.();
				},
			}),
	});

	return (
		<Dialog {...control}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Revise as informações</DialogTitle>
				</DialogHeader>
				<ScrollArea className="max-h-104">
					<WidgetFormularySummary snapshot={snapshot} />
				</ScrollArea>
				<DialogFooter>
					<Button variant="secondary" disabled={isCreatingWidget} onClick={() => control.onOpenChange(false)}>
						Preciso mudar
					</Button>
					<Button disabled={isCreatingWidget} onClick={() => void handleCreateWidget()}>
						Confirmar e criar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
