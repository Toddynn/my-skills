import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import { InfiniteList } from '@/components/infinite-list';
import { LoadingPage } from '@/components/layouts/loading-page';
import { NotFoundPage } from '@/components/layouts/not-found';
import { MyPromptCard } from '@/components/ui/cards/my-prompt-card';
import { PublicPromptCard } from '@/components/ui/cards/public-prompt-card';
import { Separator } from '@/components/ui/separator';
import { env } from '@/shared/constants/env-variables';
import { usePrivateGetAllMyPrompts } from '@/shared/functions/tanstack-query/prompts/get-all-my-prompts-paginated/use-index';
import { privateGetAllPromptsCount } from '@/shared/functions/tanstack-query/prompts/get-all-prompts-count';
import type { Prompt } from '@/shared/functions/tanstack-query/prompts/get-all-public-paginated';
import { usePrivateGetAllPublicPrompts } from '@/shared/functions/tanstack-query/prompts/get-all-public-paginated/use-index';
import { useMyPromptsListVisibilityStore } from '@/shared/stores/my-prompts-list-visibility-store';
import { usePublicPromptsListVisibilityStore } from '@/shared/stores/public-prompts-list-visibility-store';
import { MyPromptsHeader } from './-shared/components/headers/my-prompts-header';
import { PromptsPageHeader } from './-shared/components/headers/prompts-page-header';
import { PublicPromptsHeader } from './-shared/components/headers/public-prompts-header';
import { PromptsListCollapsible } from './-shared/components/prompts-list-collapsible';
import { usePromptsQueryStates } from './-shared/functions/use-prompts-query-states';
import { type PromptsSearchParams, PromptsSearchParamsSchema } from './-shared/schemas/prompts-search-params';

export const Route = createFileRoute('/_private/prompts/')({
	head: () => ({
		meta: [
			{
				title: `${env.VITE_APP_NAME} | Prompts`,
			},
		],
	}),
	validateSearch: (search): PromptsSearchParams => PromptsSearchParamsSchema.parse(search),
	beforeLoad: async () => {
		const promptsCount = await privateGetAllPromptsCount();
		return { promptsCount };
	},
	component: RouteComponent,
	loader: () => ({
		crumb: 'Prompts',
		component: <LoadingPage className="size-full min-h-fit" />,
	}),
	notFoundComponent: () => <NotFoundPage className="size-full min-h-fit" />,
});

function RouteComponent() {
	const { promptsCount } = Route.useRouteContext();
	const { debouncedMyPromptsSearch, debouncedPublicPromptsSearch, debouncedStringifiedPromptCategoryIds } = usePromptsQueryStates();
	const isMyPromptsListVisible = useMyPromptsListVisibilityStore((s) => s.isListVisible);
	const isPublicPromptsListVisible = usePublicPromptsListVisibilityStore((s) => s.isListVisible);

	const {
		data: PublicPromptsPagination,
		isLoading: isLoadingPublicPrompts,
		isFetchingNextPage: isFetchingNextPagePublicPrompts,
		fetchNextPage: fetchNextPagePublicPrompts,
		hasNextPage: hasNextPagePublicPrompts,
		error: errorPublicPrompts,
		isFetching: isFetchingPublicPrompts,
	} = usePrivateGetAllPublicPrompts({
		search: debouncedPublicPromptsSearch,
		category_ids: debouncedStringifiedPromptCategoryIds || undefined,
		enabled: isPublicPromptsListVisible,
	});

	const {
		data: MyPromptsPagination,
		isLoading: isLoadingMyPrompts,
		isFetchingNextPage: isFetchingNextPageMyPrompts,
		fetchNextPage: fetchNextPageMyPrompts,
		hasNextPage: hasNextPageMyPrompts,
		error: errorMyPrompts,
		isFetching: isFetchingMyPrompts,
	} = usePrivateGetAllMyPrompts({
		search: debouncedMyPromptsSearch,
		category_ids: debouncedStringifiedPromptCategoryIds || undefined,
		enabled: isMyPromptsListVisible,
	});

	const renderMyPrompt = useCallback((prompt: Prompt) => {
		return <MyPromptCard prompt={prompt} />;
	}, []);

	const renderPublicPrompt = useCallback((prompt: Prompt) => {
		return <PublicPromptCard prompt={prompt} />;
	}, []);

	return (
		<div className="p-4 space-y-12">
			<PromptsPageHeader totalPrompts={promptsCount.count} totalCreatedPrompts={MyPromptsPagination?.pages.at(0)?.totalCount ?? 0} />

			<Separator />

			<section id="my-prompts-section" className="space-y-12">
				<MyPromptsHeader isFetching={isFetchingMyPrompts} />

				<PromptsListCollapsible id="my-prompts-list" useVisibilityStore={useMyPromptsListVisibilityStore}>
					<InfiniteList
						className="relative w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-start gap-6 py-4"
						pages={MyPromptsPagination}
						renderItem={renderMyPrompt}
						isLoading={isLoadingMyPrompts}
						isFetchingNextPage={isFetchingNextPageMyPrompts}
						hasNextPage={!!hasNextPageMyPrompts}
						error={errorMyPrompts}
						onEndReached={fetchNextPageMyPrompts}
					/>
				</PromptsListCollapsible>
			</section>

			<Separator />

			<section id="public-prompts-section" className="space-y-12">
				<PublicPromptsHeader isFetching={isFetchingPublicPrompts} />

				<PromptsListCollapsible id="public-prompts-list" useVisibilityStore={usePublicPromptsListVisibilityStore}>
					<InfiniteList
						className="relative w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-start gap-6 py-4"
						pages={PublicPromptsPagination}
						renderItem={renderPublicPrompt}
						isLoading={isLoadingPublicPrompts}
						isFetchingNextPage={isFetchingNextPagePublicPrompts}
						hasNextPage={!!hasNextPagePublicPrompts}
						error={errorPublicPrompts}
						onEndReached={fetchNextPagePublicPrompts}
					/>
				</PromptsListCollapsible>
			</section>
		</div>
	);
}
