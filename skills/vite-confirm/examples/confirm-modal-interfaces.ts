import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from 'react';
import type { ButtonProps } from '@/components/ui/button';
import type { ModalControlQueryControl } from '@/hooks/use-modal-control-query';

export interface ConfirmOptions {
	title: string;
	description?: string;
	confirmButtonProps?: ButtonProps;
	cancelButtonProps?: ButtonProps;
	confirmText?: string;
	cancelText?: string;
	icon?: ReactNode;
	customActions?: (onConfirm: () => void, onCancel: () => void) => ReactNode;
	requireConfirmationText?: boolean;
	compareTo?: string;
	confirmationTextInputProps?: ComponentProps<'input'>;
}

export interface ConfirmContextType {
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export interface ConfirmModalProps {
	control: ModalControlQueryControl;
	config: Partial<ConfirmOptions>;
	onConfirm: () => void;
	onCancel: () => void;
	inputValue?: string;
	setInputValue?: Dispatch<SetStateAction<string>>;
}

export interface ConfirmProviderProps {
	defaultOptions?: Partial<ConfirmOptions>;
	children: ReactNode;
}
