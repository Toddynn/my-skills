import { array, object, string } from 'zod/v4';
import type { InferZod } from '@/shared/interfaces/inferzod';
import { modalControlSearchParams } from '@/shared/schemas/modal-control-search-params';

export const promptsSearchParamsDefaults = {
	page: '1',
	limit: '10',
	my_prompts_search: '',
	public_prompts_search: '',
	prompt_category_ids: [] as string[],
};

export const PromptsSearchParamsSchema = object({
	page: string().optional().default(promptsSearchParamsDefaults.page),
	limit: string().optional().default(promptsSearchParamsDefaults.limit),
	my_prompts_search: string().optional().default(promptsSearchParamsDefaults.my_prompts_search),
	public_prompts_search: string().optional().default(promptsSearchParamsDefaults.public_prompts_search),
	prompt_category_ids: array(string()).optional().default(promptsSearchParamsDefaults.prompt_category_ids),
}).extend(modalControlSearchParams.shape);

export type PromptsSearchParams = InferZod<typeof PromptsSearchParamsSchema>;
