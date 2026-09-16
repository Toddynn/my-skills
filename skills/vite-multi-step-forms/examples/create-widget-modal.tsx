import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	CREATE_WIDGET_FORMULARY_ID,
	CreateWidgetFormulary,
} from '@/components/ui/formularies/widgets/create-widget-formulary';
import { FormStepsNavigation } from '@/components/ui/form-steps-navigation';
import { ConfirmWidgetCreationModal } from '@/components/ui/modals/widgets/confirm-widget-creation-modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ModalControlQueryControl, useModalControlQuery } from '@/hooks/use-modal-control-query';
import {
	type CreateWidgetFormStepId,
	create_widget_form_steps,
	create_widget_form_steps_ids,
	is_create_widget_form_step,
} from '@/routes/_private/widgets/-shared/constants/create-widget-form-steps';
import type { CreateWidgetForm } from '@/routes/_private/widgets/-shared/interfaces/create-widget-form';

interface CreateWidgetModalProps {
	control: ModalControlQueryControl;
}

export function CreateWidgetModal({ control }: CreateWidgetModalProps) {
	const [current_step, setCurrentStep] = useState<CreateWidgetFormStepId>('general');
	const [review_snapshot, setReviewSnapshot] = useState<CreateWidgetForm | null>(null);
	const { control: confirm_control } = useModalControlQuery('confirm-widget-creation', {
		key: 'confirm-modal',
	});

	const handleClose = useCallback(() => {
		setCurrentStep('general');
		setReviewSnapshot(null);
		control.onOpenChange(false);
	}, [control]);

	return (
		<>
			<Dialog
				open={control.open}
				onOpenChange={(open) => {
					if (open) control.onOpenChange(true);
					else handleClose();
				}}
			>
				<DialogContent className="flex max-h-[85dvh] min-w-0 flex-col gap-4 overflow-hidden sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Novo widget</DialogTitle>
						<DialogDescription>Geral e opções. Revise antes de criar.</DialogDescription>
					</DialogHeader>
					<Tabs
						value={current_step}
						onValueChange={(value) => {
							if (is_create_widget_form_step(value)) setCurrentStep(value);
						}}
						className="flex min-h-0 w-full flex-1 flex-col"
					>
						<TabsList className="w-full">
							{create_widget_form_steps.map((step) => (
								<TabsTrigger key={step.id} value={step.id} className="w-full">
									{step.label}
								</TabsTrigger>
							))}
						</TabsList>
						<CreateWidgetFormulary
							on_step_change={setCurrentStep}
							on_review_callback={(data) => {
								setReviewSnapshot(data);
								confirm_control.onOpenChange(true);
							}}
							actions={
								<DialogFooter className="flex-row flex-wrap justify-between gap-2 sm:justify-between">
									<Button type="button" variant="outline" onClick={handleClose}>
										Cancelar
									</Button>
									<FormStepsNavigation
										current_step={current_step}
										steps_ids={create_widget_form_steps_ids}
										on_step_change={setCurrentStep}
										finish_button={
											<Button type="submit" form={CREATE_WIDGET_FORMULARY_ID}>
												Revisar
											</Button>
										}
									/>
								</DialogFooter>
							}
						/>
					</Tabs>
				</DialogContent>
			</Dialog>
			{review_snapshot ? (
				<ConfirmWidgetCreationModal
					control={confirm_control}
					snapshot={review_snapshot}
					on_success_callback={handleClose}
				/>
			) : null}
		</>
	);
}
