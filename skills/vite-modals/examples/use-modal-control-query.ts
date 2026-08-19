import { useRouter, useSearch } from '@tanstack/react-router';
import type { ModalControlKey } from '@/shared/schemas/modal-control-search-params';

export type ModalControlQueryOptions = {
	openBehaviour?: 'push' | 'replace';
	closeBehaviour?: 'push' | 'replace';
	key?: ModalControlKey;
	onlyExplicitOpen?: boolean;
	hasState?: boolean;
};

export type ModalControlQueryControl = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export type ModalControlQueryResult = {
	control: ModalControlQueryControl;
	state: string | null;
	set: (open: boolean | string) => void;
};

export const useModalControlQuery = (
	action_name: string,
	{ openBehaviour = 'replace', closeBehaviour = 'replace', key = 'modal', onlyExplicitOpen, hasState }: ModalControlQueryOptions = {},
): ModalControlQueryResult => {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const router = useRouter();

	const rawValue = search[key] as string | undefined;
	const [open_action, state] = hasState ? (rawValue?.split(':') ?? []) : [rawValue];

	const set = (open: boolean | string) => {
		const value = open ? [action_name, ...(typeof open === 'string' ? [open] : [])].join(':') : undefined;
		const currentSearch = router.state.location.search as Record<string, unknown>;

		router.navigate({
			search: { ...currentSearch, [key]: value } as never,
			replace: open ? openBehaviour === 'replace' : closeBehaviour === 'replace',
		});
	};

	return {
		control: {
			open: open_action === action_name,
			onOpenChange: (open: boolean) => {
				if (open && onlyExplicitOpen) return;
				set(open);
			},
		},
		state: (typeof state === 'string' ? state : (rawValue ?? null)) as string | null,
		set,
	};
};
