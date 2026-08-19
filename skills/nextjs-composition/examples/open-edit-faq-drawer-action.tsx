'use client';

import { LucidePen } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { EditFaqDrawer } from '@/components/ui/drawers/faqs/edit-faq-drawer';
import { useModalControlQuery } from '@/hooks/use-modal-control-query';
import { useVerifyAuthorization } from '@/hooks/use-verify-authorization';
import { cn } from '@/lib/utils';
import { PAGE_TYPE_ID } from '@/shared/constants/page-type-ids';
import { ROLES } from '@/shared/constants/roles';
import type { Faq } from '@/shared/functions/tanstack-query/get/faqs/get-all-faqs';

interface OpenEditFaqDrawerActionProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
	faq: Faq;
}

export function OpenEditFaqDrawerAction({ faq, children, className, variant = 'outline', size = 'default', ...props }: OpenEditFaqDrawerActionProps) {
	const { control } = useModalControlQuery(`edit-faq:${faq.id}`, { key: 'fa_modal' });
	const element_id = `open-edit-faq-drawer-action-${faq.id}`;
	useVerifyAuthorization([ROLES.ADMIN.PAGES[PAGE_TYPE_ID.FAQS].UPDATE], { action: 'hideElements', elementIds: [element_id] });

	return (
		<Fragment>
			<Button
				id={element_id}
				className={cn('w-full sm:w-auto', className)}
				variant={variant}
				size={size}
				{...props}
				onClick={() => control.onOpenChange(true)}
			>
				{children ?? (
					<Fragment>
						Editar
						<LucidePen />
					</Fragment>
				)}
			</Button>
			<EditFaqDrawer control={control} faq={faq} />
		</Fragment>
	);
}
