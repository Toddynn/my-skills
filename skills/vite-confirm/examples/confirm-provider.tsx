'use client';
import { LucideAlertCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/ui/modals/confirm-modal';
import type { ConfirmOptions, ConfirmProviderProps } from '@/components/ui/modals/confirm-modal/interfaces';
import { ConfirmContext } from '@/contexts/confirm-context';
import { useModalControlQuery } from '@/hooks/use-modal-control-query';

export function ConfirmProvider({
	defaultOptions = {
		icon: <LucideAlertCircle className="size-6" />,
	},
	children,
}: ConfirmProviderProps) {
	const { control } = useModalControlQuery('confirm', { key: 'confirm-modal' });

	const [options, setOptions] = useState<Partial<ConfirmOptions>>(defaultOptions);
	const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});
	const [inputValue, setInputValue] = useState('');

	const confirm = useCallback(
		(options: ConfirmOptions) => {
			setOptions({ ...defaultOptions, ...options });
			control.onOpenChange(true);
			return new Promise<boolean>((resolve) => {
				setResolver(() => resolve);
			});
		},
		[defaultOptions, control],
	);

	const handleConfirm = useCallback(() => {
		setInputValue('');
		control.onOpenChange(false);
		resolver(true);
	}, [resolver, control]);

	const handleCancel = useCallback(() => {
		setInputValue('');
		control.onOpenChange(false);
		resolver(false);
	}, [resolver, control]);

	const contextValue = useMemo(() => ({ confirm }), [confirm]);

	return (
		<ConfirmContext.Provider value={contextValue}>
			{children}

			<ConfirmModal
				control={control}
				config={options}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				inputValue={inputValue}
				setInputValue={setInputValue}
			/>
		</ConfirmContext.Provider>
	);
}
