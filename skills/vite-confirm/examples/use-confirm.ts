import { useContext } from 'react';
import { ConfirmContext } from '../../contexts/confirm-context';

export const useConfirm = () => {
	const context = useContext(ConfirmContext);

	if (!context) {
		throw new Error('useConfirm must be used within a ConfirmDialogProvider');
	}

	return context.confirm;
};
