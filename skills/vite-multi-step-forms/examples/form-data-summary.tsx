import type { ReactNode } from 'react';

export type FieldMetadata<T, Fields extends ReadonlyArray<keyof T> = []> =
	| {
			label: string;
			fields: Fields;
			formatter: (fields: Pick<T, Fields[number]>) => React.ReactNode | string;
	  }
	| {
			label: string;
			fields?: undefined;
			formatter?: undefined;
	  };

export type FieldsMetadata<T> = {
	[K in keyof T]: FieldMetadata<T, Array<keyof T>>;
};

export interface FormDataSummaryProps<T> {
	data: T;
	metadata: FieldsMetadata<T>;
	fields_order?: Array<keyof T>;
}

export function FormDataSummary<T>({ data, metadata, fields_order }: FormDataSummaryProps<T>) {
	const keys = fields_order ?? (Object.keys(metadata) as Array<keyof T>);

	return (
		<ul className="m-0 flex list-none flex-col gap-2 p-0">
			{keys.map((key) => {
				const meta = metadata[key];
				if (!meta) return null;

				let displayValue: ReactNode = null;

				if (meta.formatter && meta.fields && meta.fields.length > 0) {
					const fieldsObj = Object.fromEntries(meta.fields.map((fieldKey) => [fieldKey, data[fieldKey]])) as Pick<
						T,
						(typeof meta.fields)[number]
					>;

					displayValue = meta.formatter(fieldsObj);
				} else {
					const value = data[key];
					displayValue = value ? String(value) : null;
				}

				return (
					<li key={String(key)}>
						<strong>{meta.label}:</strong> {displayValue}
					</li>
				);
			})}
		</ul>
	);
}
