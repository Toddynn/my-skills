import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Controller, useForm } from 'react-hook-form';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLabelRequired,
} from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { get_form_step_from_errors } from '@/components/ui/form-steps-navigation';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import {
	type CreateWidgetFormStepId,
	create_widget_form_step_fields,
	create_widget_form_steps_ids,
} from '@/routes/_private/widgets/-shared/constants/create-widget-form-steps';
import type { CreateWidgetForm } from '@/routes/_private/widgets/-shared/interfaces/create-widget-form';
import { CreateWidgetSchema } from '@/routes/_private/widgets/-shared/schemas/create-widget-schema';

export const CREATE_WIDGET_FORMULARY_ID = 'create-widget-formulary';

interface CreateWidgetFormularyProps {
	actions: React.ReactNode;
	on_step_change?: (step: CreateWidgetFormStepId) => void;
	on_review_callback?: (data: CreateWidgetForm) => void;
}

export function CreateWidgetFormulary({
	actions,
	on_step_change,
	on_review_callback,
}: CreateWidgetFormularyProps) {
	const { control, reset, handleSubmit } = useForm<CreateWidgetForm>({
		defaultValues: { title: '', description: '', isPublic: false, categoryId: '' },
		resolver: standardSchemaResolver(CreateWidgetSchema),
	});

	const onSubmit = (data: CreateWidgetForm) => {
		on_review_callback?.(data);
	};

	return (
		<form
			id={CREATE_WIDGET_FORMULARY_ID}
			onSubmit={handleSubmit(onSubmit, (errors) => {
				on_step_change?.(
					get_form_step_from_errors(errors, create_widget_form_steps_ids, create_widget_form_step_fields),
				);
			})}
			onReset={() => reset()}
			className="flex min-h-0 flex-1 flex-col gap-6"
		>
			<TabsContent value="general" className="min-h-0 flex-1 overflow-y-auto">
				<FieldGroup>
					<Controller
						name="title"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Título
									<FieldLabelRequired />
								</FieldLabel>
								<FieldContent>
									<InputGroup>
										<InputGroupInput {...field} id={field.name} aria-invalid={fieldState.invalid} />
									</InputGroup>
								</FieldContent>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<Controller
						name="description"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
								<FieldContent>
									<InputGroup>
										<InputGroupTextarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
									</InputGroup>
								</FieldContent>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</FieldGroup>
			</TabsContent>

			<TabsContent value="options" className="min-h-0 flex-1 overflow-y-auto">
				<FieldGroup>
					<Controller
						name="isPublic"
						control={control}
						render={({ field }) => (
							<FieldLabel htmlFor={field.name}>
								<Field orientation="responsive">
									<FieldContent>
										Público
										<FieldDescription>Visível para todos.</FieldDescription>
									</FieldContent>
									<Switch
										id={field.name}
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={field.disabled}
									/>
								</Field>
							</FieldLabel>
						)}
					/>
				</FieldGroup>
			</TabsContent>
			{actions}
		</form>
	);
}
