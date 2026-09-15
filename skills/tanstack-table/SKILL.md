---
name: tanstack-table
description: >-
  TanStack Table (React) com resize, column pinning sticky, row selection, visibility
  e persist Zustand. Use when creating or editing data-tables, column-header pin,
  view-options, table stores, getCommonColumnPinningStyles, or sticky overflow wrappers.
  Same pattern for Vite and Next — do not split by framework.
---

# TanStack Table — resize, pin, selection

Stack: `@tanstack/react-table` + shadcn `Table` + Zustand persist. **Mesmo padrão Vite e Next** (Next só adiciona `'use client'` onde houver hooks/eventos).

Referências canônicas:
- Overflow + pin styles: **documentos-frontend** `folders-table`
- Row selection + bulk: **clube-adm-frontend** `reward-deliveries` table

## Exemplos

- [`examples/tree.txt`](examples/tree.txt) — pastas do módulo
- [`examples/get-common-column-pinning-styles.ts`](examples/get-common-column-pinning-styles.ts)
- [`examples/create-data-table-store.ts`](examples/create-data-table-store.ts)
- [`examples/overflow-shell.tsx`](examples/overflow-shell.tsx) — card + Table + cells

## Árvore do módulo

```
{entity}-table/   # ou components/table/ + components/data-table/
  index.tsx                 # query + loading/error/empty → DataTable
  columns.tsx               # ColumnDef[] (ou getColumns(mode))
  column-header.tsx         # título + pin (+ sort opcional)
  actions.tsx               # toolbar: view-options + bulk
  view-options.tsx          # hide/show cols via meta.label
  data-table.tsx            # useReactTable + overflow markup + resize handles
  cells/
    {entity}-{field}-cell.tsx
    {entity}-actions-cell.tsx

# store do feature (fora do folder da table ok)
.../stores/{entity}-table-store/index.ts

# app-wide
shared/functions/table/get-common-column-pinning-styles.ts
shared/stores/data-table-store/create-data-table-store.ts   # preferir factory
shared/@types/table.d.ts                                   # ColumnMeta.label
components/ui/table.tsx                                    # overflow-x-auto no container
```

## Checklist de features

| Feature | Obrigatório | Notas |
|---------|-------------|--------|
| Resize | sim | `enableColumnResizing`, `columnResizeMode: 'onChange'`, handle no `TableHead` |
| Pinning | sim | `enableColumnPinning`; `defaultColumn.enablePinning: false`; opt-in por coluna |
| Visibility | sim | store + `view-options` |
| Sizing/pin persist | sim | Zustand `persist` |
| Overflow sticky | sim | card `overflow-hidden` + Table `overflow-x-auto` + `border-separate` + `getTotalSize()` |
| Stretch | sim | fator `container_width / getTotalSize()` quando sobra espaço no card |
| Page size | sim | `PageSizeSelect` + search params |
| Row selection | se bulk | local state; **não** persistir; clear ao mudar filtro |
| `meta.label` | sim | labels do view-options |

## Componentização

| Peça | Responsabilidade | Não colocar |
|------|------------------|-------------|
| `columns` | `ColumnDef`: id, size, flags, `meta.label`, header→ColumnHeader, cell→Cell | JSX pesado, fetch, store |
| `cells/` | UI da row (link, badge, menu) | pin, resize, chrome da table |
| `column-header` | título + pin (+ sort) | resize handle |
| `view-options` | dropdown hideable via table API | lógica de domínio |
| `actions` | toolbar: view-options + bulk | definição de colunas |
| `data-table` | `useReactTable`, overflow, resize handles, pagination, wiring store/selection | visuals de cell |
| `index` | query + estados vazios | internals da table |
| store | persist sizing/visibility/pinning | `rowSelection` |

## Overflow + sticky (obrigatório)

Sem isso, coluna fixa **estoura** o overflow / vaza do card.

1. Card: `min-w-0 w-full max-w-full overflow-hidden rounded-xl border bg-card`
2. `Table` UI: container interno `overflow-x-auto` (já no `components/ui/table.tsx`)
3. `<table>`: `border-separate border-spacing-0` + largura do § Stretch
4. **Não** usar `table-fixed`
5. Header: sempre `bg-background` (opaco)
6. Cell pinned: `bg-card`
7. Styles: `width`/`minWidth` no JSX + `...getCommonColumnPinningStyles(column, stretch)`
8. Key do head: `` `${header.id}:${String(pinned)}` ``

Ver [`examples/overflow-shell.tsx`](examples/overflow-shell.tsx).

## Stretch — preencher o card (obrigatório)

`width: table.getTotalSize()` fixo deixa a tabela **terminando no meio do card** quando
a soma das `size` é menor que o container (poucas colunas, tela larga). As `size`
devem valer como **proporção**, não pixel absoluto:

```tsx
// Mede o card, não a <table>: a largura do card é imposta pelo layout, então
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
const stretch = container_width > total_size ? container_width / total_size : 1;
```

Aplicar o fator em **três** lugares — esquecer um desalinha a tabela:

| Lugar | Valor |
|-------|-------|
| `<table>` | `width: stretch > 1 ? container_width : total_size` |
| head/cell | `width: column.getSize() * stretch` |
| pin styles | `getCommonColumnPinningStyles(column, stretch)` — escala `getStart`/`getAfter` |

- `minWidth` **não** escala: é piso de legibilidade, não proporção.
- Faltando espaço, `stretch === 1` e o comportamento é exatamente o de antes (scroll horizontal).
- Resize continua natural: encolher uma coluna faz as outras absorverem a sobra.

## Pinning styles

Copiar [`examples/get-common-column-pinning-styles.ts`](examples/get-common-column-pinning-styles.ts).

Só: `position: sticky`, `left`/`right`, `boxShadow` inset na borda, `zIndex: 1`.  
**Proibido** no helper: `width`, `maxWidth`, `opacity`, `background`, `overflow: hidden` hacks.

## Store

Preferir factory [`examples/create-data-table-store.ts`](examples/create-data-table-store.ts):

```ts
export const DEFAULT_X_COLUMN_PINNING: ColumnPinningState = {
  left: ['name'], // ou ['user', ...]
  right: ['actions'],
};

export const useXTableStore = createDataTableStore({
  persistName: 'x-table-settings-v1',
  defaultColumnPinning: DEFAULT_X_COLUMN_PINNING,
});
```

**Pinning = state local + hydrate** (evita flash):

```tsx
const [column_pinning, setColumnPinning] = useState<ColumnPinningState>(() =>
  useXTableStore.persist.hasHydrated()
    ? useXTableStore.getState().columnPinning
    : DEFAULT_X_COLUMN_PINNING,
);

useEffect(() => {
  const sync = () => setColumnPinning(useXTableStore.getState().columnPinning);
  if (useXTableStore.persist.hasHydrated()) sync();
  return useXTableStore.persist.onFinishHydration(sync);
}, []);

const handle_column_pinning_change: OnChangeFn<ColumnPinningState> = useCallback((updater) => {
  setColumnPinning((prev) => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    useXTableStore.getState().setColumnPinning(next);
    return next;
  });
}, []);
```

Sizing/visibility: `useShallow` do store → `state` do `useReactTable` → `onColumn*Change` grava store (debounce ~500ms ok).

## Column header — pin

```tsx
const handle_pin_toggle = (e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  e.stopPropagation();
  if (!column) return;
  if (column.getIsPinned()) {
    column.pin(false);
    return;
  }
  column.pin(column.id === 'actions' ? 'right' : 'left');
};
// LucidePin / LucidePinOff se column.getCanPin()
```

Resize **não** fica aqui — handle absoluto no `TableHead` do data-table:

```tsx
{header.column.getCanResize() && (
  <button
    type="button"
    aria-label={`Redimensionar coluna ${header.column.id}`}
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    className="absolute top-0 right-0 h-full w-px cursor-col-resize touch-none border-0 p-0 hover:bg-border"
  />
)}
```

## useReactTable — núcleo

```tsx
useReactTable({
  data,
  columns,
  defaultColumn: { enablePinning: false },
  getRowId: (row) => row.id, // se selection
  state: {
    columnSizing,
    columnVisibility,
    columnPinning: column_pinning,
    rowSelection, // se selection
  },
  onColumnSizingChange,
  onColumnVisibilityChange,
  onColumnPinningChange: handle_column_pinning_change,
  onRowSelectionChange: setRowSelection,
  enableColumnPinning: true,
  enableColumnResizing: true,
  columnResizeMode: 'onChange',
  enableRowSelection: true, // ou (row) => row.original.canEdit
  getCoreRowModel: getCoreRowModel(),
});
```

Colunas pinnable: `enablePinning: true` (ex.: name/user + actions).  
Coluna `select`: `enableHiding/Resizing/Pinning/Sorting: false`, size ~44.

## Row selection (bulk)

Padrão completo: **reward-deliveries**.

```tsx
const [row_selection, setRowSelection] = useState<RowSelectionState>({});

useEffect(() => {
  setRowSelection({});
}, [/* page, quantity, search, filtros relevantes */]);

const selected_ids = useMemo(
  () => Object.keys(row_selection).filter((id) => row_selection[id]),
  [row_selection],
);
```

- Coluna checkbox: header `toggleAllPageRowsSelected`, cell `toggleSelected`
- `actions`: badge count + bulk + `onClearSelection={() => setRowSelection({})}`
- Mutations success também limpam selection
- Constraints de domínio (só rows compatíveis) = opcional; core = getRowId + clear on filter + ids → actions
- **Nunca** persistir `rowSelection`

## ColumnMeta

```ts
// shared/@types/table.d.ts
import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<_TData, _TValue> {
    label?: string;
  }
}
```

## O que não fazer

- `table-fixed`
- Card sem `overflow-hidden`
- `border-collapse` (usar `border-separate border-spacing-0`)
- Helper de pin com width/maxWidth/opacity/background
- Header/cell pinned sem background opaco
- `enablePinning` default true
- Persistir row selection
- Esquecer `width: table.getTotalSize()` (ou fixá-la sem o fator de stretch — a tabela termina no meio do card)
- Aplicar o stretch na largura mas não no `getCommonColumnPinningStyles` — coluna fixa desalinha
- Esquecer key `` `${id}:${pinned}` `` no head
- Skill/código split Vite vs Next — só `'use client'` / paths diferem
