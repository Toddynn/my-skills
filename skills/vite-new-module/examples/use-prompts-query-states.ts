'use client';

import { useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { env } from '@/shared/constants/env-variables';
import type { PromptCategory } from '@/shared/functions/tanstack-query/prompt-categories/get-all-paginated';
import { Route as PromptsRoute } from '../..';
import { promptsSearchParamsDefaults } from '../schemas/prompts-search-params';

type SearchParamKey = keyof typeof promptsSearchParamsDefaults;

interface UsePromptsQueryStatesResult {
	page: number;
	limit: number;
	my_prompts_search: string;
	public_prompts_search: string;
	prompt_category_ids: PromptCategory['id'][];
	stringified_prompt_category_ids: string;
	debouncedMyPromptsSearch: string;
	debouncedPublicPromptsSearch: string;
	debouncedStringifiedPromptCategoryIds: string;
	setPromptCategoryIds: (value: PromptCategory['id'][]) => void;
	setLimit: (value: string) => void;
	setPage: (value: string) => void;
	setMyPromptsSearch: (value: string) => void;
	setPublicPromptsSearch: (value: string) => void;
	reset: (field: SearchParamKey) => void;
}

export function usePromptsQueryStates(): UsePromptsQueryStatesResult {
	const { page, limit, my_prompts_search, public_prompts_search, prompt_category_ids } = PromptsRoute.useSearch();
	const navigate = PromptsRoute.useNavigate();

	const stringified_prompt_category_ids = useMemo(() => prompt_category_ids?.join(',') ?? '', [prompt_category_ids]);

	const setPage = (value: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				page: value,
			}),
			replace: true,
		});
	};

	const setLimit = (value: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				limit: value,
			}),
			replace: true,
		});
	};

	const setMyPromptsSearch = (value: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				my_prompts_search: value,
			}),
			replace: true,
		});
	};

	const setPublicPromptsSearch = (value: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				public_prompts_search: value,
			}),
			replace: true,
		});
	};
	const setPromptCategoryIds = (value: PromptCategory['id'][]) => {
		navigate({
			search: (prev) => ({
				...prev,
				prompt_category_ids: value,
			}),
			replace: true,
		});
	};

	const reset = useCallback(
		(field: SearchParamKey) => {
			navigate({
				search: (prev) => ({
					...prev,
					[field]: promptsSearchParamsDefaults[field],
				}),
				replace: true,
			});
		},
		[navigate],
	);

	const debouncedMyPromptsSearch = useDebounce(my_prompts_search, env.VITE_DEFAULT_DEBOUNCE_IN_MS, {
		onDebounce: () => reset('page'),
	});

	const debouncedPublicPromptsSearch = useDebounce(public_prompts_search, env.VITE_DEFAULT_DEBOUNCE_IN_MS, {
		onDebounce: () => reset('page'),
	});

	const debouncedStringifiedPromptCategoryIds = useDebounce(stringified_prompt_category_ids, env.VITE_DEFAULT_DEBOUNCE_IN_MS, {
		onDebounce: () => reset('page'),
	});

	return {
		page: Number(page),
		limit: Number(limit),
		my_prompts_search,
		public_prompts_search,
		debouncedMyPromptsSearch,
		debouncedPublicPromptsSearch,
		debouncedStringifiedPromptCategoryIds,
		prompt_category_ids,
		stringified_prompt_category_ids,
		setPromptCategoryIds,
		setPage,
		setLimit,
		reset,
		setMyPromptsSearch,
		setPublicPromptsSearch,
	};
}
