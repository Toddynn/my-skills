export const create_widget_form_steps = [
	{ id: 'general', label: 'Geral' },
	{ id: 'options', label: 'Opções' },
] as const;

export type CreateWidgetFormStepId = (typeof create_widget_form_steps)[number]['id'];

export const create_widget_form_steps_ids: ReadonlyArray<CreateWidgetFormStepId> =
	create_widget_form_steps.map((step) => step.id);

export const create_widget_form_step_fields: Record<CreateWidgetFormStepId, readonly string[]> = {
	general: ['title', 'description'],
	options: ['isPublic', 'categoryId'],
};

export function is_create_widget_form_step(value: string): value is CreateWidgetFormStepId {
	return create_widget_form_steps_ids.some((step) => step === value);
}
