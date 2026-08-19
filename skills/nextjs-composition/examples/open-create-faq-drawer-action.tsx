'use client';

import { LucidePlusCircle } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { CreateFaqDrawer } from '@/components/ui/drawers/faqs/create-faq-drawer';
import { useModalControlQuery } from '@/hooks/use-modal-control-query';
import { useVerifyAuthorization } from '@/hooks/use-verify-authorization';
import { cn } from '@/lib/utils';
import { PAGE_TYPE_ID } from '@/shared/constants/page-type-ids';
import { ROLES } from '@/shared/constants/roles';

export function OpenCreateFaqDrawerAction({ children, className, ...props }: Omit<React.ComponentProps<typeof Button>, 'onClick'>) {
	const { control } = useModalControlQuery('create-faq', { key: 'fa_modal' });
	useVerifyAuthorization([ROLES.ADMIN.PAGES[PAGE_TYPE_ID.FAQS].CREATE], {
		action: 'hideElements',
		elementIds: ['open-create-faq-drawer-action'],
	});

	return (
		<Fragment>
			<Button
				id="open-create-faq-drawer-action"
				className={cn('sm:w-auto w-full self-end', className)}
				{...props}
				onClick={() => control.onOpenChange(true)}
			>
				{children ?? (
					<Fragment>
						Nova pergunta
						<LucidePlusCircle className="size-4 transition-all duration-200 group-hover:rotate-90" />
					</Fragment>
				)}
			</Button>
			<CreateFaqDrawer control={control} />
		</Fragment>
	);
}
