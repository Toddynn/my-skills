import { api } from '@/lib/providers/api';
import { getQueryClient } from '@/lib/providers/tanstack-query';
import { API_ROUTES } from '@/shared/constants/api-routes';
import { buildApiRoute } from '@/shared/functions/build-api-route';
import { handleErrorTreatment } from '@/shared/functions/handle-error-treatment';
import { invalidateQueries } from '@/shared/functions/invalidate-queries';
import type { Prompt } from '@/shared/functions/tanstack-query/prompts/get-all-public-paginated';
import type { BaseActionArgs } from '@/shared/interfaces/base-action-args';
import type { BaseCallbackArgs } from '@/shared/interfaces/base-callback-args';
import type { CreatePromptForm } from '../interfaces/create-prompt-form';
import type { EditPromptForm } from '../interfaces/edit-prompt-form';

type CreatePromptArgs = BaseActionArgs<CreatePromptForm>;
type EditPromptArgs = BaseActionArgs<EditPromptForm> & {
	prompt_id: Prompt['id'];
};

type DeletePromptArgs = BaseCallbackArgs & {
	prompt_id: Prompt['id'];
};

interface UsePromptsActionsResult {
	createPrompt: (args: CreatePromptArgs) => Promise<void>;
	deletePrompt: (args: DeletePromptArgs) => Promise<void>;
	editPrompt: (args: EditPromptArgs) => Promise<void>;
}
export function usePromptsActions(): UsePromptsActionsResult {
	const query_client = getQueryClient();
	const createPrompt = async ({ form_data, on_fail, on_success, query_keys_to_invalidate }: CreatePromptArgs) => {
		try {
			const response = await api.post(buildApiRoute(API_ROUTES.POST.PRIVATE.PROMPTS.CREATE_PROMPT), form_data);
			if (query_keys_to_invalidate) await invalidateQueries({ query_client, query_keys_to_invalidate });
			on_success?.(response.data);
		} catch (error) {
			handleErrorTreatment(error);
			on_fail?.(error);
		}
	};

	const deletePrompt = async ({ prompt_id, on_fail, on_success, query_keys_to_invalidate }: DeletePromptArgs) => {
		try {
			await api.delete(buildApiRoute(API_ROUTES.DELETE.PRIVATE.PROMPTS.DELETE_PROMPT, { prompt_id }));
			if (query_keys_to_invalidate) await invalidateQueries({ query_client, query_keys_to_invalidate });
			on_success?.();
		} catch (error) {
			handleErrorTreatment(error);
			on_fail?.(error);
		}
	};

	const editPrompt = async ({ form_data, on_fail, on_success, query_keys_to_invalidate, prompt_id }: EditPromptArgs) => {
		try {
			await api.patch(buildApiRoute(API_ROUTES.PATCH.PRIVATE.PROMPTS.EDIT_PROMPT, { prompt_id }), form_data);
			if (query_keys_to_invalidate) await invalidateQueries({ query_client, query_keys_to_invalidate });
			on_success?.();
		} catch (error) {
			handleErrorTreatment(error);
			on_fail?.(error);
		}
	};

	return {
		createPrompt,
		deletePrompt,
		editPrompt,
	};
}
