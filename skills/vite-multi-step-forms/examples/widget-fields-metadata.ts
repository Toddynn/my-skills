import type { FieldsMetadata } from '@/components/ui/form-data-summary';
import type { CreateWidgetForm } from '@/routes/_private/widgets/-shared/interfaces/create-widget-form';

export const widget_fields_metadata: FieldsMetadata<CreateWidgetForm> = {
	title: {
		label: 'Título',
		fields: ['title'],
		formatter: ({ title }) => title || '—',
	},
	description: {
		label: 'Descrição',
		fields: ['description'],
		formatter: ({ description }) => description || '—',
	},
	isPublic: {
		label: 'Visibilidade',
		fields: ['isPublic'],
		formatter: ({ isPublic }) => (isPublic ? 'Público' : 'Privado'),
	},
	categoryId: {
		label: 'Categoria',
		fields: ['categoryId'],
		formatter: ({ categoryId }) => categoryId || '—',
	},
};
