import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";

export function getCommonColumnPinningStyles<TData>(
	column: Column<TData, unknown>,
	/** Mesmo fator aplicado às larguras — sem ele o offset sticky desalinha. */
	stretch = 1,
): CSSProperties {
	const is_pinned = column.getIsPinned();
	if (!is_pinned) return {};

	const is_last_left_pinned_column =
		is_pinned === "left" && column.getIsLastColumn("left");
	const is_first_right_pinned_column =
		is_pinned === "right" && column.getIsFirstColumn("right");

	return {
		boxShadow: is_last_left_pinned_column
			? "-4px 0 4px -4px var(--border) inset"
			: is_first_right_pinned_column
				? "4px 0 4px -4px var(--border) inset"
				: undefined,
		left:
			is_pinned === "left"
				? `${column.getStart("left") * stretch}px`
				: undefined,
		right:
			is_pinned === "right"
				? `${column.getAfter("right") * stretch}px`
				: undefined,
		position: "sticky",
		zIndex: 1,
	};
}
