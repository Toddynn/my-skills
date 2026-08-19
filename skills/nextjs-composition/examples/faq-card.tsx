'use client';

import { Card, CardContent, CardFooter, type CardProps } from '@/components/ui/card';
import { FaqsActions } from '@/components/ui/composition-pattern/actions/faqs';
import { DateUI } from '@/components/ui/composition-pattern/cards/date';
import { FaqCardUI } from '@/components/ui/composition-pattern/cards/faq';
import { cn } from '@/lib/utils';
import type { Faq } from '@/shared/functions/tanstack-query/get/faqs/get-all-faqs';

interface FaqCardProps extends CardProps {
	faq: Faq;
}

export function FaqCard({ faq, className, ...props }: FaqCardProps) {
	const has_medias = !!faq.medias?.length;

	return (
		<Card className={cn('w-full', className)} {...props}>
			<CardContent className="flex flex-col gap-4 md:flex-row">
				{has_medias && <FaqCardUI.Medias medias={faq.medias} />}

				<div className="flex w-full flex-col justify-start gap-6">
					<div className="flex flex-wrap items-center gap-2">
						<FaqCardUI.Question question={faq.question} />
						<FaqCardUI.StatusChip faq={faq} />
					</div>
					<FaqCardUI.Answer answer={faq.answer} className="line-clamp-5 text-ellipsis" />
				</div>
			</CardContent>
			<CardFooter className="flex flex-wrap-reverse justify-between gap-4">
				<div className="flex w-full flex-col gap-2 sm:w-auto">
					<DateUI.CreatedAt created_at={faq.createdAt} className="text-sm" />
					<DateUI.UpdatedAt updated_at={faq.updatedAt} className="text-sm" />
				</div>
				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					<FaqsActions.OpenEditFaqDrawer faq={faq} />
					<FaqsActions.DeleteFaq faq={faq} />
				</div>
			</CardFooter>
		</Card>
	);
}
