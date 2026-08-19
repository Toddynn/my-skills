import { useEffect, useRef, useState } from 'react';

interface UseDebounceOptions<T> {
	onDebounce?: (value: T) => void;
}

export function useDebounce<T>(value: T, delay: number, options?: UseDebounceOptions<T>): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	const onDebounceRef = useRef(options?.onDebounce);
	const isFirstRender = useRef(true);

	onDebounceRef.current = options?.onDebounce;

	useEffect(() => {
		const timeOutId = setTimeout(() => {
			setDebouncedValue(value);

			if (isFirstRender.current) {
				isFirstRender.current = false;
				return;
			}

			onDebounceRef.current?.(value);
		}, delay);

		return () => {
			clearTimeout(timeOutId);
		};
	}, [value, delay]);

	return debouncedValue;
}
