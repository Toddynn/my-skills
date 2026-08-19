import { object, string } from 'zod/v4';

export const modalControlSearchParams = object({
	modal: string().optional(),
	drawer: string().optional(),
	'filter-modal': string().optional(),
	'select-modal': string().optional(),
	'confirm-modal': string().optional(),
	dropdown: string().optional(),
	'secondary-drawer': string().optional(),
	'secondary-modal': string().optional(),
	'redirect-modal': string().optional(),
	'loading-modal': string().optional(),
});

export type ModalControlKey = keyof typeof modalControlSearchParams.shape;
