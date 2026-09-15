// Mede o cartão, não a <table>: a largura do cartão é imposta pelo layout, então
// não há realimentação quando as colunas esticam.
const container_ref = useRef<HTMLDivElement>(null);
const [container_width, setContainerWidth] = useState(0);

useLayoutEffect(() => {
     const element = container_ref.current;
     if (!element) return;

     const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
     observer.observe(element);

     return () => observer.disconnect();
}, []);

const total_size = table.getTotalSize();

// Sobrando espaço, as sizes viram proporção em vez de pixel fixo: a tabela
// preenche o cartão inteiro. Faltando, o fator é 1 e o overflow volta a rolar.
const stretch = container_width > total_size ? container_width / total_size : 1;

<div ref={container_ref} className="min-w-0 w-full max-w-full overflow-hidden rounded-xl border bg-card shadow-sm">
     <Table
          className="h-auto border-separate border-spacing-0"
          style={{ width: stretch > 1 ? container_width : total_size }}
     >
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
                                             width: header.getSize() * stretch,
                                             minWidth: header.column.columnDef.minSize ?? 80,
                                             ...getCommonColumnPinningStyles(header.column, stretch),
                                        }}
                                   >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanResize() && (
                                             <button
                                                  type="button"
                                                  aria-label={`Redimensionar coluna ${header.column.id}`}
                                                  onMouseDown={header.getResizeHandler()}
                                                  onTouchStart={header.getResizeHandler()}
                                                  className="absolute top-0 right-0 h-full w-px cursor-col-resize touch-none border-0 bg-transparent p-0 hover:bg-border"
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
                                        width: cell.column.getSize() * stretch,
                                        minWidth: cell.column.columnDef.minSize ?? 80,
                                        ...getCommonColumnPinningStyles(cell.column, stretch),
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
