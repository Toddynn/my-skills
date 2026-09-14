<div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl border bg-card shadow-sm">
	<Table className="h-auto border-separate border-spacing-0" style={{ width: table.getTotalSize() }}>
		<TableHeader>
			{table.getHeaderGroups().map((header_group) => (
				<TableRow key={header_group.id}>
					{header_group.headers.map((header) => {
						const pinned = header.column.getIsPinned();
						return (
							<TableHead
								key={`${header.id}:${String(pinned)}`}
								className="relative bg-background text-muted-foreground"
								style={{
									width: header.getSize(),
									minWidth: header.column.columnDef.minSize ?? 80,
									...getCommonColumnPinningStyles(header.column),
								}}
							>
								{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								{header.column.getCanResize() && (
									<button
										type="button"
										aria-label={`Redimensionar coluna ${header.column.id}`}
										onMouseDown={header.getResizeHandler()}
										onTouchStart={header.getResizeHandler()}
										className="absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none border-0 bg-transparent p-0 hover:bg-border"
									/>
								)}
							</TableHead>
						);
					})}
				</TableRow>
			))}
		</TableHeader>
		<TableBody>
			{rows.map((row) => (
				<TableRow key={row.id}>
					{row.getVisibleCells().map((cell) => (
						<TableCell
							key={cell.id}
							className={cn(cell.column.getIsPinned() && 'bg-card')}
							style={{
								width: cell.column.getSize(),
								minWidth: cell.column.columnDef.minSize ?? 80,
								...getCommonColumnPinningStyles(cell.column),
							}}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	</Table>
</div>
