import type { ColumnPinningState, ColumnSizingState, Updater, VisibilityState } from '@tanstack/react-table';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function apply_updater<T>(updater: Updater<T>, previous: T): T {
	return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater;
}

interface DataTableStore {
	columnVisibility: VisibilityState;
	setColumnVisibility: (visibility: VisibilityState) => void;
	columnSizing: ColumnSizingState;
	setColumnSizing: (sizing: ColumnSizingState) => void;
	columnPinning: ColumnPinningState;
	setColumnPinning: (updater: Updater<ColumnPinningState>) => void;
}

interface CreateDataTableStoreOptions {
	persistName: string;
	initialVisibility?: VisibilityState;
	defaultColumnPinning: ColumnPinningState;
}

export function createDataTableStore({ persistName, initialVisibility = {}, defaultColumnPinning }: CreateDataTableStoreOptions) {
	return create<DataTableStore>()(
		persist(
			(set) => ({
				columnVisibility: initialVisibility,
				setColumnVisibility: (visibility) => set({ columnVisibility: visibility }),
				columnSizing: {},
				setColumnSizing: (sizing) => set({ columnSizing: sizing }),
				columnPinning: defaultColumnPinning,
				setColumnPinning: (updater) => set((state) => ({ columnPinning: apply_updater(updater, state.columnPinning) })),
			}),
			{
				name: persistName,
				partialize: (state) => ({
					columnVisibility: state.columnVisibility,
					columnSizing: state.columnSizing,
					columnPinning: state.columnPinning,
				}),
				merge: (persisted, current) => {
					const persisted_state = (persisted ?? {}) as Partial<DataTableStore>;
					return {
						...current,
						columnVisibility: {
							...initialVisibility,
							...persisted_state.columnVisibility,
						},
						columnSizing: persisted_state.columnSizing ?? {},
						columnPinning: {
							left: persisted_state.columnPinning?.left ?? current.columnPinning.left,
							right: persisted_state.columnPinning?.right ?? current.columnPinning.right,
						},
					};
				},
			},
		),
	);
}
