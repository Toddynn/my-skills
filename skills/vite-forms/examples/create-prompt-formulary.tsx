import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMutation } from '@tanstack/react-query';
import { LucideTextSearch, LucideTextSelection } from 'lucide-react';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PromptCategoriesTriggers } from '@/components/ui/composition-pattern/triggers/prompt-categories';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLabelRequired } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { usePromptsActions } from '@/routes/_private/prompts/-shared/functions/use-prompts-actions';
import type { CreatePromptForm } from '@/routes/_private/prompts/-shared/interfaces/create-prompt-form';
import { CreatePromptSchema } from '@/routes/_private/prompts/-shared/schemas/create-prompt-schema';
import { private_get_all_my_prompts_query_key } from '@/shared/functions/tanstack-query/prompts/get-all-my-prompts-paginated/query-key';
import { private_get_all_public_prompts_query_key } from '@/shared/functions/tanstack-query/prompts/get-all-public-paginated/query-key';
import { useSelectPromptCategoriesStore } from '@/shared/stores/select-prompt-categories-store';

interface CreatePromptFormularyProps {
	actions: React.ReactNode;
	on_success_callback?: () => void;
}
export function CreatePromptFormulary({ actions, on_success_callback }: CreatePromptFormularyProps) {
	const { createPrompt } = usePromptsActions();
	const clearPromptsCategoriesSelection = useSelectPromptCategoriesStore((s) => s.clearSelection);

	const { mutateAsync: handleCreatePrompt, isPending: isCreatingPrompt } = useMutation({
		mutationFn: async (form_data: CreatePromptForm) =>
			await createPrompt({
				form_data,
				on_success: () => handleSuccess(),
				query_keys_to_invalidate: form_data.isPublic
					? [...private_get_all_my_prompts_query_key({}), ...private_get_all_public_prompts_query_key({})]
					: private_get_all_my_prompts_query_key({}),
			}),
	});

	const { control, reset, handleSubmit } = useForm<CreatePromptForm>({
		defaultValues: {
			title: '',
			template: '',
			isPublic: false,
			categoryId: '',
		},
		disabled: isCreatingPrompt,
		resolver: standardSchemaResolver(CreatePromptSchema),
	});

	const handleSuccess = useCallback(() => {
		toast.success('Prompt criado com sucesso!');
		reset();
		clearPromptsCategoriesSelection();
		return on_success_callback?.();
	}, [reset, on_success_callback, clearPromptsCategoriesSelection]);

	const onSubmit = async (data: CreatePromptForm) => {
		await handleCreatePrompt(data);
	};

	const handleReset = () => {
		reset();
	};

	return (
		<form id="create-prompt-formulary" onSubmit={handleSubmit(onSubmit)} onReset={handleReset} className="space-y-6">
			<FieldGroup className="z-0">
				<Controller
					name="title"
					control={control}
					render={({ field, fieldState }) => {
						return (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Título
									<FieldLabelRequired />
								</FieldLabel>
								<FieldContent>
									<InputGroup className="h-10">
										<InputGroupAddon align={'inline-start'}>
											<LucideTextSearch size={18} />
										</InputGroupAddon>
										<InputGroupInput
											{...field}
											id={field.name}
											name={field.name}
											aria-invalid={fieldState.invalid}
											type="text"
											placeholder="Digite o título do prompt"
											className="h-10"
										/>
									</InputGroup>
								</FieldContent>
								<FieldError errors={[fieldState.error]} />
							</Field>
						);
					}}
				/>

				<Controller
					name="template"
					control={control}
					render={({ field, fieldState }) => {
						return (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Template
									<FieldLabelRequired />
								</FieldLabel>
								<FieldContent>
									<InputGroup className="h-40 items-start">
										<InputGroupAddon align={'inline-start'} className="py-2">
											<LucideTextSelection size={18} />
										</InputGroupAddon>
										<InputGroupTextarea
											{...field}
											id={field.name}
											name={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Digite o template do prompt"
											className="h-40"
										/>
									</InputGroup>
								</FieldContent>
								<FieldDescription>
									Utilize a variável <span className="font-bold">{'{transcription}'}</span> para inserir o valor da transcrição no
									template.
								</FieldDescription>
								<FieldError errors={[fieldState.error]} />
							</Field>
						);
					}}
				/>

				<Controller
					name="categoryId"
					control={control}
					render={({ field, fieldState }) => {
						return (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Categoria
									<FieldLabelRequired />
								</FieldLabel>
								<FieldContent>
									<PromptCategoriesTriggers.SelectPromptCategory
										onChange={(value) => field.onChange(value ?? '')}
										disabled={field.disabled}
										className="w-full"
									/>
								</FieldContent>
								<FieldError errors={[fieldState.error]} />
							</Field>
						);
					}}
				/>

				<Controller
					name="isPublic"
					control={control}
					render={({ field, fieldState }) => {
						return (
							<FieldLabel className="dark:bg-input/30 border-input" htmlFor={field.name}>
								<Field data-invalid={fieldState.invalid} orientation="responsive">
									<Switch id={field.name} name={field.name} checked={field.value} onCheckedChange={field.onChange} />
									<FieldContent>
										Prompt público
										<FieldDescription>Um prompt público será visível para todos os usuários do sistema.</FieldDescription>
									</FieldContent>
									<FieldError errors={[fieldState.error]} />
								</Field>
							</FieldLabel>
						);
					}}
				/>
			</FieldGroup>
			{actions}
		</form>
	);
}
