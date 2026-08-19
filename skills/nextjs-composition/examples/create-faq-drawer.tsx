'use client';

import { useCallback, useState } from 'react';
import { FaqsActionsProvider } from '@/app/(private)/faqs/shared/contexts/faqs-actions-context';
import { useFaqsActions } from '@/app/(private)/faqs/shared/functions/use-faqs-actions';
import { Button } from '@/components/ui/button';
import { CreateFaqFormulary } from '@/components/ui/formularies/faqs/create-faq-formulary';
import ProgressModal from '@/components/ui/progress-modal';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ModalControlQueryControl } from '@/hooks/use-modal-control-query';
import { useUploadProgressModal } from '@/hooks/use-upload-progress-modal';
import { useFiles } from '@/hooks/zustand/use-files';

interface CreateFaqDrawerProps {
	control: ModalControlQueryControl;
}

const CREATE_FAQ_FORMULARY_ID = 'create-faq-formulary';

function CreateFaqDrawerContent({ control }: CreateFaqDrawerProps) {
	const faqs_actions = useFaqsActions();
	const { files, clearAll } = useFiles();
	const [is_pending, setIsPending] = useState(false);

	const {
		cancel_upload,
		control: progress_control,
		on_progress_modal_close,
	} = useUploadProgressModal({
		isUploading: is_pending,
		abortControllerRef: faqs_actions.abort_controller_ref,
		key: 'fa_progress',
	});

	const handleClose = useCallback(() => {
		if (is_pending) return;
		for (const file of files) {
			URL.revokeObjectURL(file.preview);
		}
		clearAll();
		control.onOpenChange(false);
	}, [is_pending, files, clearAll, control]);

	const handleOpenChange = (open: boolean) => {
		if (!open && is_pending) return;
		if (!open) handleClose();
		else control.onOpenChange(open);
	};

	return (
		<FaqsActionsProvider value={faqs_actions}>
			<Sheet open={control.open} onOpenChange={handleOpenChange}>
				<SheetContent side="right" showCloseButton={false} className="data-[side=right]:md:min-w-xl data-[side=right]:min-w-full ">
					<SheetHeader>
						<SheetTitle className="text-2xl">Adicionar nova pergunta frequente</SheetTitle>
					</SheetHeader>
					<Separator />
					<CreateFaqFormulary
						id={CREATE_FAQ_FORMULARY_ID}
						on_pending_change={setIsPending}
						on_success_callback={() => {
							on_progress_modal_close();
							handleClose();
						}}
						on_fail_callback={on_progress_modal_close}
					/>
					<SheetFooter>
						<SheetClose asChild>
							<Button className="sm:w-auto w-full" type="button" variant="ghost" disabled={is_pending} onClick={handleClose}>
								Cancelar
							</Button>
						</SheetClose>
						<Button variant="outline" className="sm:w-auto w-full" type="reset" form={CREATE_FAQ_FORMULARY_ID} disabled={is_pending}>
							Resetar
						</Button>
						<Button className="sm:w-auto w-full" type="submit" form={CREATE_FAQ_FORMULARY_ID} disabled={is_pending}>
							Finalizar
						</Button>
					</SheetFooter>

					<ProgressModal
						control={progress_control}
						isLoading={is_pending}
						progress={faqs_actions.request_progress}
						onCancelRequest={cancel_upload}
					/>
				</SheetContent>
			</Sheet>
		</FaqsActionsProvider>
	);
}

export function CreateFaqDrawer({ control }: CreateFaqDrawerProps) {
	return <CreateFaqDrawerContent control={control} />;
}
