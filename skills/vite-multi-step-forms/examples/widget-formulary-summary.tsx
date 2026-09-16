import { FormDataSummary } from '@/components/ui/form-data-summary';
import { widget_fields_metadata } from '@/routes/_private/widgets/-shared/constants/widget-fields-metadata';
import type { CreateWidgetForm } from '@/routes/_private/widgets/-shared/interfaces/create-widget-form';

interface WidgetFormularySummaryProps {
	snapshot: CreateWidgetForm;
}

export function WidgetFormularySummary({ snapshot }: WidgetFormularySummaryProps) {
	return (
		<FormDataSummary
			data={snapshot}
			metadata={widget_fields_metadata}
			fields_order={['title', 'description', 'isPublic', 'categoryId']}
		/>
	);
}
