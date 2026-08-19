'use client';

import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { type ModalControlQueryControl, useModalControlQuery } from '@/hooks/use-modal-control-query';

interface UseUploadProgressModalProps {
	isUploading: boolean;
	abortControllerRef: RefObject<AbortController | null>;
	key?: string;
	action_name?: string;
}

const MIN_VISIBLE_TIME_MS = 500;
const FALLBACK_CLOSE_DELAY_MS = 100;

type TimerRef = ReturnType<typeof setTimeout> | null;

export function useUploadProgressModal({
	isUploading,
	abortControllerRef,
	key = 'progress_modal',
	action_name = 'upload-progress',
}: UseUploadProgressModalProps) {
	const { control, set } = useModalControlQuery(action_name, { key });
	const openedAtRef = useRef<number | null>(null);
	const closeTimerRef = useRef<TimerRef>(null);

	const clearCloseTimer = useCallback(() => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
	}, []);

	const resetState = useCallback(() => {
		openedAtRef.current = null;
		clearCloseTimer();
	}, [clearCloseTimer]);

	const calculateCloseDelay = useCallback((openedAt: number): number => {
		const elapsed = Date.now() - openedAt;
		return Math.max(0, MIN_VISIBLE_TIME_MS - elapsed);
	}, []);

	const scheduleModalClose = useCallback(
		(delay: number) => {
			closeTimerRef.current = setTimeout(() => {
				resetState();
				void set(false);
			}, delay);
		},
		[resetState, set],
	);

	const handleUploadStart = useCallback(() => {
		if (!control.open) {
			void set(true);
		}
		if (!openedAtRef.current) {
			openedAtRef.current = Date.now();
		}
	}, [control.open, set]);

	const handleUploadEnd = useCallback(() => {
		if (!control.open) return;

		clearCloseTimer();

		if (openedAtRef.current) {
			const delay = calculateCloseDelay(openedAtRef.current);
			scheduleModalClose(delay);
		} else {
			scheduleModalClose(FALLBACK_CLOSE_DELAY_MS);
		}
	}, [control.open, clearCloseTimer, calculateCloseDelay, scheduleModalClose]);

	useEffect(() => {
		return () => {
			clearCloseTimer();
		};
	}, [clearCloseTimer]);

	useEffect(() => {
		clearCloseTimer();

		if (isUploading) {
			handleUploadStart();
		} else {
			handleUploadEnd();
		}

		return clearCloseTimer;
	}, [isUploading, handleUploadStart, handleUploadEnd, clearCloseTimer]);

	const cancel_upload = useCallback(() => {
		resetState();
		abortControllerRef.current?.abort();
		void set(false);
	}, [abortControllerRef, resetState, set]);

	const on_progress_modal_close = useCallback(() => {
		resetState();
		void set(false);
	}, [resetState, set]);

	return {
		control,
		cancel_upload,
		on_progress_modal_close,
		is_progress_modal_open: control.open,
		on_progress_modal_open_change: control.onOpenChange,
	};
}

export type { ModalControlQueryControl };
