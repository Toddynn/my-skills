import { LucideChevronLeft, LucideChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormStepsNavigationProps<StepId extends string> {
	current_step: StepId;
	steps_ids: ReadonlyArray<StepId>;
	on_step_change: (step: StepId) => void;
	finish_button: React.ReactNode;
	disabled?: boolean;
}

export function get_form_step_from_errors<StepId extends string>(
	errors: Record<string, unknown>,
	steps_ids: ReadonlyArray<StepId>,
	step_fields: Record<StepId, readonly string[]>,
): StepId {
	for (const step of steps_ids) {
		if (step_fields[step].some((field) => Boolean(errors[field]))) {
			return step;
		}
	}

	const [first_step] = steps_ids;
	if (!first_step) {
		throw new Error('Form steps cannot be empty');
	}

	return first_step;
}

export function FormStepsNavigation<StepId extends string>({
	current_step,
	steps_ids,
	on_step_change,
	finish_button,
	disabled = false,
}: FormStepsNavigationProps<StepId>) {
	const current_index = steps_ids.indexOf(current_step);
	const previous_step = current_index > 0 ? steps_ids[current_index - 1] : undefined;
	const next_step =
		current_index >= 0 && current_index < steps_ids.length - 1 ? steps_ids[current_index + 1] : undefined;
	const is_last_step = current_index === steps_ids.length - 1;

	return (
		<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
			<Button
				type="button"
				variant="secondary"
				onClick={() => {
					if (previous_step) on_step_change(previous_step);
				}}
				disabled={disabled || !previous_step}
			>
				<LucideChevronLeft data-icon="inline-start" />
				Anterior
			</Button>
			{is_last_step ? (
				finish_button
			) : (
				<Button
					type="button"
					onClick={() => {
						if (next_step) on_step_change(next_step);
					}}
					disabled={disabled || !next_step}
				>
					Próximo
					<LucideChevronRight data-icon="inline-end" />
				</Button>
			)}
		</div>
	);
}
