'use client';

import { memo } from 'react';
import parseTextWithLinks from '@/shared/functions/parse-text-with-links';

interface FaqQuestionProps {
	question: string;
}

export const FaqQuestion = memo(({ question }: FaqQuestionProps) => {
	return <h1 className="text-xl font-semibold whitespace-pre-wrap text-pretty">{parseTextWithLinks(question)}</h1>;
});
