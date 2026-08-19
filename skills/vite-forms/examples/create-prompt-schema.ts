import { boolean, object, string } from 'zod/v4';

export const CreatePromptSchema = object({
	title: string({ error: (issue) => (issue.input === undefined ? 'Título é obrigatório' : undefined) })
		.trim()
		.min(1, 'Título deve ter no mínimo 1 caractere'),
	template: string({ error: (issue) => (issue.input === undefined ? 'Template é obrigatório' : undefined) })
		.trim()
		.min(1, 'Template deve ter no mínimo 1 caractere'),
	isPublic: boolean().default(false),
	categoryId: string({ error: (issue) => (issue.input === undefined ? 'Categoria é obrigatória' : undefined) }),
});
