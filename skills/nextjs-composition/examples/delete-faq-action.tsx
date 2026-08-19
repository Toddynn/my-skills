'use client';

import { useMutation } from '@tanstack/react-query';
import { LucideTrash2 } from 'lucide-react';
import { Fragment, useCallback } from 'react';
import { toast } from 'sonner';
import { useFaqsActions } from '@/app/(private)/faqs/shared/functions/use-faqs-actions';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useConfirm } from '@/hooks/use-confirm';
import { useVerifyAuthorization } from '@/hooks/use-verify-authorization';
import { cn } from '@/lib/utils';
import { PAGE_TYPE_ID } from '@/shared/constants/page-type-ids';
import { ROLES } from '@/shared/constants/roles';
import type { Faq } from '@/shared/functions/tanstack-query/get/faqs/get-all-faqs';
import { get_all_faqs_query_key } from '@/shared/functions/tanstack-query/get/faqs/get-all-faqs/query-key';

interface DeleteFaqActionProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
	faq: Faq;
}

export function DeleteFaqAction({ faq, className, variant = 'destructive', size = 'default', children, disabled, ...props }: DeleteFaqActionProps) {
	const { delete_faq } = useFaqsActions();
	const confirm = useConfirm();
	const element_id = `delete-faq-action-${faq.id}`;
	useVerifyAuthorization([ROLES.ADMIN.PAGES[PAGE_TYPE_ID.FAQS].DELETE], { action: 'hideElements', elementIds: [element_id] });

	const { mutateAsync: handleDeleteFaq, isPending: isDeletingFaq } = useMutation({
		mutationFn: async () =>
			await delete_faq({
				faq_id: faq.id,
				query_keys_to_invalidate: get_all_faqs_query_key({}),
				on_success: () => toast.success('Pergunta frequente deletada com sucesso!'),
			}),
	});

	const waitForConfirmation = useCallback(async () => {
		if (faq.active) {
			const res = await confirm({ title: 'Tem certeza que deseja deletar esse FAQ?' });
			if (!res) return;
		}
		await handleDeleteFaq();
	}, [confirm, faq.active, handleDeleteFaq]);

	return (
		<Button
			id={element_id}
			className={cn('w-full sm:w-auto', className)}
			variant={variant}
			size={size}
			onClick={waitForConfirmation}
			disabled={isDeletingFaq || disabled}
			{...props}
		>
			{isDeletingFaq && <Spinner />}
			{children ?? (
				<Fragment>
					Excluir
					<LucideTrash2 />
				</Fragment>
			)}
		</Button>
	);
}
