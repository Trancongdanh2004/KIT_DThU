import * as React from "react"
import {
  columnFilteringFeature, columnPinningFeature, columnSizingFeature, columnVisibilityFeature, constructFilterFn, FlexRender,
  createExpandedRowModel, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, globalFilteringFeature, rowExpandingFeature,
  rowPaginationFeature, rowSelectionFeature, rowSortingFeature, tableFeatures, useTable,
} from "@tanstack/react-table"
import type {
  ColumnDef, ColumnFiltersState, ColumnSizingState, Column, ExpandedState, PaginationState, Row, RowSelectionState, SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown, Columns3, Download, Filter, LoaderCircle, Rows3, Search, X } from "lucide-react"
import { useUiConfig } from "@/lib/ui-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { tableSoftBorder } from "@/components/ui/table"
import { exportRows, type ExportFormat } from "@/components/ui/data-grid-export"

export type { RowSelectionState, SortingState, ColumnFiltersState, ColumnSizingState, PaginationState }

/** Giá trị nguyên thuỷ dùng để sắp xếp / lọc một cột. */
export type DataGridValue = string | number | boolean | Date | null | undefined

function normalize(value: unknown): string {
  return String(value ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d")
}
function compare(a: unknown, b: unknown, locale: string): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: "base" })
}

const textFilter = constructFilterFn({
  filter: (dataValue: unknown, filterValue: unknown) => normalize(dataValue).includes(String(filterValue)),
  resolveDataValue: normalize,
  resolveFilterValue: normalize,
  autoRemove: (v: unknown) => !v,
})
const equalsFilter = constructFilterFn({
  filter: (dataValue: unknown, filterValue: unknown) => String(dataValue) === String(filterValue),
  autoRemove: (v: unknown) => !v,
})

const features = tableFeatures({
  rowSortingFeature, sortedRowModel: createSortedRowModel(),
  columnFilteringFeature, globalFilteringFeature, filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature, paginatedRowModel: createPaginatedRowModel(),
  rowExpandingFeature, expandedRowModel: createExpandedRowModel(),
  rowSelectionFeature, columnVisibilityFeature, columnPinningFeature, columnSizingFeature,
})

/** Tham số truyền cho `editor` của cột khi đang sửa một ô. */
export interface DataGridEditorProps<T extends object> {
  /** Dòng đang sửa. */
  row: T
  /** Giá trị nháp hiện tại (ban đầu là giá trị của `accessor`). */
  value: unknown
  /** Cập nhật giá trị nháp. */
  onChange: (value: unknown) => void
  /** Lưu giá trị nháp; truyền giá trị để lưu ngay giá trị đó (ví dụ khi chọn một mục). */
  commit: (value?: unknown) => void
  /** Huỷ sửa và trả focus về ô. */
  cancel: () => void
  /** Đang chờ `onCellEdit` trả về (Promise chưa xong). */
  saving: boolean
  /** Thông báo lỗi khi lần lưu trước thất bại. */
  error: string | null
}

/** Mô tả một cột của DataGrid. */
export interface DataGridColumn<T extends object> {
  /** Mã cột, duy nhất. */
  id: string
  /** Tiêu đề cột (cũng dùng trong menu ẩn/hiện cột). */
  header: string
  /** Lấy giá trị nguyên thuỷ để sắp xếp và lọc. Bỏ trống nếu cột chỉ hiển thị. */
  accessor?: (row: T) => DataGridValue
  /** Cách hiển thị ô; mặc định hiển thị giá trị của `accessor`. */
  cell?: (row: T) => React.ReactNode
  /** Cho phép sắp xếp theo cột (cần `accessor`). Mặc định true khi có `accessor`. */
  sortable?: boolean
  /** Bộ lọc riêng của cột: `"text"` (ô nhập) hoặc `{ options }` (danh sách chọn). */
  filter?: "text" | { options: { value: string; label: string }[] }
  /** Căn lề nội dung. */
  align?: "start" | "center" | "end"
  /** Độ rộng (px). Bắt buộc nên đặt khi ghim cột. */
  width?: number
  /** Ghim cột về đầu hoặc cuối bảng. */
  pin?: "start" | "end"
  /** Cho phép ẩn cột trong menu. Mặc định true. */
  hideable?: boolean
  /** Ẩn cột ngay từ đầu. */
  defaultHidden?: boolean
  /**
   * Cho phép sửa tại ô (bấm đúp, Enter hoặc F2). Truyền hàm để quyết định theo từng dòng.
   * Khi có ít nhất một cột sửa được, bảng chuyển sang role="grid" và di chuyển giữa các ô bằng phím mũi tên.
   */
  editable?: boolean | ((row: T) => boolean)
  /** Ô nhập khi sửa. Mặc định: Input; cột có `filter.options` thì dùng Select với các lựa chọn đó. */
  editor?: (props: DataGridEditorProps<T>) => React.ReactNode
}

export type DataGridDensity = "compact" | "normal" | "comfortable"

export interface DataGridProps<T extends object> extends Omit<React.ComponentProps<"div">, "children"> {
  /** Dữ liệu. Nên giữ tham chiếu ổn định (useMemo / hằng số). Ở `mode="server"` là các dòng của trang hiện tại. */
  data: T[]
  /** Danh sách cột. Nên giữ tham chiếu ổn định. */
  columns: DataGridColumn<T>[]
  /** Lấy mã duy nhất của dòng (dùng cho chọn dòng). Mặc định là chỉ số. */
  getRowId?: (row: T, index: number) => string
  /** Nhãn truy cập của bảng. */
  "aria-label": string
  /** Hiển thị khung chờ thay cho dữ liệu. Ở `mode="server"` mà đã có dòng thì giữ dòng cũ, làm mờ và đặt aria-busy. */
  loading?: boolean
  /** Nội dung khi không có dòng nào. */
  emptyState?: React.ReactNode
  /** Hiện cột checkbox chọn dòng. */
  selectable?: boolean
  /** Trạng thái chọn dòng (điều khiển từ ngoài), khoá theo `getRowId`. */
  rowSelection?: RowSelectionState
  defaultRowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  /** Sắp xếp (điều khiển từ ngoài). */
  sorting?: SortingState
  defaultSorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** Hiện ô tìm kiếm chung. Truyền chuỗi để đặt placeholder. */
  searchable?: boolean | string
  /** Hiện nút bật hàng lọc theo cột (cột có `filter`). */
  columnFilters?: boolean
  /** Số dòng mỗi trang ban đầu. */
  pageSize?: number
  /** Các lựa chọn số dòng mỗi trang. */
  pageSizeOptions?: number[]
  /** Mật độ dòng (điều khiển từ ngoài). */
  density?: DataGridDensity
  defaultDensity?: DataGridDensity
  onDensityChange?: (density: DataGridDensity) => void
  /** Hiện nút đổi mật độ. */
  densityToggle?: boolean
  /** Hiện menu ẩn/hiện cột. */
  columnMenu?: boolean
  /** Ô thao tác ở cuối mỗi dòng (nút, menu...). */
  rowActions?: (row: T) => React.ReactNode
  /**
   * Tiêu đề cột thao tác. Mặc định lấy `labels.gridActions` của UiProvider.
   * @default Thao tác
   */
  rowActionsLabel?: string
  /** Vùng thêm vào thanh công cụ (bên phải). */
  toolbar?: React.ReactNode
  /** Tiêu đề dính khi cuộn dọc (cần `maxHeight`). */
  stickyHeader?: boolean
  /** Chiều cao tối đa của vùng bảng, ví dụ 420 hoặc "60vh". */
  maxHeight?: number | string
  /** Gọi khi bấm vào một dòng. */
  onRowClick?: (row: T) => void
  /**
   * Hiện nút "Xuất" (CSV, Excel). Xuất theo thứ tự sắp xếp và bộ lọc hiện tại, mọi trang, các cột đang hiện;
   * nếu đang chọn dòng thì chỉ xuất dòng đã chọn. Giá trị lấy từ `accessor` của cột (cột chỉ có `cell` bị bỏ qua).
   * Ở `mode="server"` xuất trang hiện tại, hoặc toàn bộ nếu có `onExportAll`.
   */
  exportable?: boolean | { filename?: string; formats?: ExportFormat[] }
  /** Bật phân trang. Mặc định true; đặt false để hiện mọi dòng trong một vùng cuộn (nên kèm `maxHeight`). */
  paginated?: boolean
  /**
   * Chỉ dựng các dòng đang nhìn thấy khi cuộn, dùng cho vài nghìn dòng trở lên. Cần `maxHeight`; tự tắt phân trang.
   * Dòng có chiều cao cố định `rowHeight` (px), nên ô không nên xuống dòng. Không dùng được ở `mode="server"`.
   */
  virtualize?: boolean | { rowHeight?: number; overscan?: number }
  /**
   * `"client"` (mặc định): `data` là toàn bộ dữ liệu, bảng tự sắp xếp, lọc, phân trang.
   * `"server"`: `data` là một trang; sắp xếp, lọc, phân trang do bạn làm khi nhận `onSortingChange`,
   * `onGlobalFilterChange`, `onColumnFiltersChange`, `onPaginationChange`. Đổi sắp xếp hoặc bộ lọc thì về trang đầu.
   */
  mode?: "client" | "server"
  /** Tổng số dòng phía server (bắt buộc khi `mode="server"`), dùng tính số trang. */
  rowCount?: number
  /** Trang hiện tại và số dòng mỗi trang (điều khiển từ ngoài). Không truyền thì bảng tự giữ, bắt đầu từ `pageSize`. */
  pagination?: PaginationState
  /** Gọi khi đổi trang hoặc số dòng mỗi trang. */
  onPaginationChange?: (pagination: PaginationState) => void
  /** Từ khoá tìm chung (điều khiển từ ngoài). */
  globalFilter?: string
  /** Gọi khi từ khoá tìm chung đổi. Ở `mode="server"` chỉ gọi sau 300 ms ngừng gõ. */
  onGlobalFilterChange?: (query: string) => void
  /** Giá trị lọc theo cột (điều khiển từ ngoài). Tên khác `columnFilters` vì prop đó là nút bật hàng lọc. */
  columnFilterState?: ColumnFiltersState
  /** Gọi khi giá trị lọc theo cột đổi. */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  /** Chỉ dùng ở `mode="server"`: lấy toàn bộ dòng (theo bộ lọc hiện tại) khi xuất; không có thì chỉ xuất trang hiện tại. */
  onExportAll?: () => Promise<T[]>
  /**
   * Gọi khi lưu một ô đã sửa (cột có `editable`). Trả Promise thì ô hiện vòng chờ;
   * Promise bị từ chối thì giữ ô nhập và đọc thông báo lỗi (message của Error) qua vùng aria-live.
   */
  onCellEdit?: (row: T, columnId: string, value: unknown) => void | Promise<void>
  /** Cho phép kéo mép phải tiêu đề cột để đổi độ rộng; khi focus tay cầm, mũi tên trái/phải đổi ±16px. */
  resizableColumns?: boolean
  /** Độ rộng cột theo mã cột (điều khiển từ ngoài), dùng để lưu lại lựa chọn của người dùng. */
  columnSizing?: ColumnSizingState
  /** Gọi khi độ rộng cột đổi. */
  onColumnSizingChange?: (sizing: ColumnSizingState) => void
  /** Nội dung chi tiết của dòng: thêm cột nút mở ở đầu bảng, dòng chi tiết chiếm hết chiều ngang. */
  renderExpanded?: (row: T) => React.ReactNode
  /**
   * Dữ liệu dạng cây: trả về các dòng con. Cột đầu thụt lề theo cấp và có nút mở/đóng
   * (mũi tên phải/trái cũng mở/đóng). Khi lọc, dòng cha của dòng khớp vẫn được giữ và tự mở ra.
   */
  getSubRows?: (row: T) => T[] | undefined
}

const densityPad: Record<DataGridDensity, string> = { compact: "py-1", normal: "py-2.5", comfortable: "py-4" }
const alignClass = { start: "text-left", center: "text-center", end: "text-right" } as const
const minColumnWidth = 48
const maxColumnWidth = 1200
const resizeStep = 16

function useControllable<V>(controlled: V | undefined, initial: V, onChange?: (v: V) => void): [V, (v: V | ((p: V) => V)) => void] {
  const [inner, setInner] = React.useState<V>(initial)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : inner
  const ref = React.useRef(value)
  ref.current = value
  const set = React.useCallback((next: V | ((p: V) => V)) => {
    const v = typeof next === "function" ? (next as (p: V) => V)(ref.current) : next
    ref.current = v
    if (!isControlled) setInner(v)
    onChange?.(v)
  }, [isControlled, onChange])
  return [value, set]
}

function pinStyle<T extends object>(column: Column<typeof features, T, unknown>): React.CSSProperties | undefined {
  const pinned = column.getIsPinned()
  if (!pinned) return undefined
  return pinned === "start"
    ? { position: "sticky", insetInlineStart: column.getStart("start"), zIndex: 1 }
    : { position: "sticky", insetInlineEnd: column.getAfter("end"), zIndex: 1 }
}

function canEditCell<T extends object>(def: DataGridColumn<T> | undefined, row: T): boolean {
  if (!def?.editable) return false
  return typeof def.editable === "function" ? def.editable(row) : true
}

/** Ô nhập mặc định khi sửa: Select nếu cột có `filter.options`, ngược lại Input (kiểu số nếu giá trị gốc là số). */
function DefaultEditor<T extends object>({ def, props, label, errorId }: { def: DataGridColumn<T>; props: DataGridEditorProps<T>; label: string; errorId: string }) {
  const { value, onChange, commit, cancel, saving, error } = props
  const picked = React.useRef(false)
  if (typeof def.filter === "object") {
    return (
      <Select
        defaultOpen value={value == null ? undefined : String(value)}
        onValueChange={(v) => { picked.current = true; commit(v) }}
        onOpenChange={(open) => { if (!open && !picked.current) cancel() }}
      >
        <SelectTrigger className="h-8" aria-label={label} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}><SelectValue /></SelectTrigger>
        <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
          {def.filter.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    )
  }
  const numeric = typeof def.accessor?.(props.row) === "number"
  return (
    <Input
      autoFocus className="h-8" type={numeric ? "number" : "text"} aria-label={label}
      value={value == null ? "" : value instanceof Date ? value.toISOString() : String(value)}
      readOnly={saving} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => { const v = e.target.value; onChange(numeric && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : v) }}
    />
  )
}

interface EditState { rowId: string; colId: string; draft: unknown; saving: boolean; error: string | null }

/**
 * Bảng dữ liệu đầy đủ tính năng dựa trên @tanstack/react-table v9: sắp xếp (aria-sort), tìm kiếm chung và lọc theo cột,
 * chọn dòng (trang / tất cả), ẩn/hiện cột, ghim cột, phân trang, khung chờ, trạng thái rỗng, tiêu đề dính, đổi mật độ,
 * ô thao tác cuối dòng, cuộn ngang trên màn hình nhỏ, sửa tại ô, đổi độ rộng cột, dòng mở rộng và dữ liệu dạng cây.
 *
 * Mặc định xử lý phía client (`data` là toàn bộ dữ liệu, hợp với vài nghìn dòng tải sẵn). Với API phân trang, đặt
 * `mode="server"` + `rowCount` và tải lại `data` khi nhận `onPaginationChange` / `onSortingChange` / `onGlobalFilterChange` /
 * `onColumnFiltersChange`; vẫn giữ được chọn cột, lọc, xuất (`onExportAll`). Block `shell/data-table` chỉ còn hợp khi cần
 * bảng tối giản không có thanh công cụ.
 */
export function DataGrid<T extends object>({
  data, columns, getRowId, loading = false, emptyState, selectable = false,
  rowSelection: rowSelectionProp, defaultRowSelection, onRowSelectionChange,
  sorting: sortingProp, defaultSorting, onSortingChange,
  searchable = false, columnFilters: showColumnFilterToggle = false,
  pageSize: initialPageSize = 10, pageSizeOptions = [5, 10, 20, 50],
  density: densityProp, defaultDensity = "normal", onDensityChange, densityToggle = false, columnMenu = true,
  rowActions, rowActionsLabel, toolbar, stickyHeader = false, maxHeight, onRowClick, exportable = false, paginated = true, virtualize = false,
  mode = "client", rowCount, pagination: paginationProp, onPaginationChange,
  globalFilter: globalFilterProp, onGlobalFilterChange, columnFilterState, onColumnFiltersChange, onExportAll,
  onCellEdit, resizableColumns = false, columnSizing: columnSizingProp, onColumnSizingChange, renderExpanded, getSubRows,
  className, ...props
}: DataGridProps<T>) {
  const { "aria-label": ariaLabel, ...rest } = props
  const { locale, labels } = useUiConfig()
  const server = mode === "server"
  const densityLabel: Record<DataGridDensity, string> = { compact: labels.gridDensityCompact, normal: labels.gridDensityNormal, comfortable: labels.gridDensityComfortable }
  const [rowSelection, setRowSelection] = useControllable<RowSelectionState>(rowSelectionProp, defaultRowSelection ?? {}, onRowSelectionChange)
  const [sorting, setSorting] = useControllable<SortingState>(sortingProp, defaultSorting ?? [], onSortingChange)
  const [density, setDensity] = useControllable<DataGridDensity>(densityProp, defaultDensity, onDensityChange)
  const [globalFilter, setGlobalFilter] = useControllable<string>(globalFilterProp, "", onGlobalFilterChange)
  const [colFilters, setColFilters] = useControllable<ColumnFiltersState>(columnFilterState, [], onColumnFiltersChange)
  const [pagination, setPagination] = useControllable<PaginationState>(paginationProp, { pageIndex: 0, pageSize: initialPageSize }, onPaginationChange)
  const [columnSizing, setColumnSizing] = useControllable<ColumnSizingState>(columnSizingProp, {}, onColumnSizingChange)
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  // ô tìm ở mode server: chữ đang gõ, chỉ đẩy ra ngoài sau 300 ms
  const [searchText, setSearchText] = React.useState(globalFilter)
  // ô lọc chữ theo cột ở mode server: giá trị đang gõ theo mã cột, chỉ đẩy ra ngoài sau 300 ms
  const [filterDraft, setFilterDraft] = React.useState<Record<string, string>>({})
  const virt = virtualize && !server ? { rowHeight: 44, overscan: 8, ...(typeof virtualize === "object" ? virtualize : {}) } : null
  const paginate = paginated && !virt
  // không phân trang: một "trang" chứa mọi dòng (dữ liệu cây cần đủ chỗ cho cả dòng con đang mở)
  const pageState = paginate ? pagination : { pageIndex: 0, pageSize: getSubRows ? Number.MAX_SAFE_INTEGER : Math.max(data.length, 1) }
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = React.useState({ top: 0, height: 480 })
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [visibility, setVisibility] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.filter((c) => c.defaultHidden).map((c) => [c.id, false])))
  const [active, setActive] = React.useState<{ rowId: string; colId: string } | null>(null)
  const [edit, setEdit] = React.useState<EditState | null>(null)
  const [liveMessage, setLiveMessage] = React.useState("")
  const baseId = React.useId()
  const gridMode = columns.some((c) => c.editable)

  const resetPage = () => { if (pagination.pageIndex !== 0) setPagination((p) => ({ ...p, pageIndex: 0 })) }

  const defs = React.useMemo(() => columns.map((c): ColumnDef<typeof features, T, unknown> => {
    const sortable = c.sortable ?? Boolean(c.accessor)
    const accessor = c.accessor
    const base = {
      id: c.id,
      header: c.header,
      size: c.width ?? 160,
      minSize: minColumnWidth,
      maxSize: maxColumnWidth,
      enableSorting: sortable && Boolean(accessor),
      enableHiding: c.hideable ?? true,
      enableColumnFilter: Boolean(c.filter && accessor),
      sortFn: (a: Row<typeof features, T>, b: Row<typeof features, T>, id: string) => compare(a.getValue(id), b.getValue(id), locale),
      filterFn: typeof c.filter === "object" ? equalsFilter : textFilter,
      sortUndefined: false as const,
      sortDescFirst: false,
      cell: ({ row }: { row: Row<typeof features, T> }) => c.cell ? c.cell(row.original) : String(accessor?.(row.original) ?? ""),
    }
    return (accessor ? { ...base, accessorFn: (row: T) => accessor(row) } : base) as unknown as ColumnDef<typeof features, T, unknown>
  }), [columns, locale])

  const pinning = React.useMemo(() => ({
    start: [...(selectable ? ["__select"] : []), ...columns.filter((c) => c.pin === "start").map((c) => c.id)],
    end: columns.filter((c) => c.pin === "end").map((c) => c.id),
  }), [columns, selectable])

  const table = useTable({
    features,
    columns: defs,
    data,
    getRowId: getRowId as ((row: T, index: number) => string) | undefined,
    ...(getSubRows ? { getSubRows: (row: T) => getSubRows(row), filterFromLeafRows: true } : {}),
    ...(renderExpanded ? { getRowCanExpand: () => true } : {}),
    ...(server ? { manualPagination: true, manualSorting: true, manualFiltering: true, rowCount: rowCount ?? data.length } : {}),
    state: {
      rowSelection, sorting, globalFilter, columnFilters: colFilters, pagination: pageState, columnVisibility: visibility, columnPinning: pinning,
      columnSizing, expanded,
    },
    onRowSelectionChange: (u) => setRowSelection(typeof u === "function" ? u(rowSelection) : u),
    onSortingChange: (u) => { setSorting(typeof u === "function" ? u(sorting) : u); if (server) resetPage() },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColFilters,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setVisibility,
    onColumnSizingChange: setColumnSizing,
    onExpandedChange: setExpanded,
    autoResetExpanded: false,
    enableRowSelection: selectable,
    enableSortingRemoval: true,
    globalFilterFn: textFilter,
    getColumnCanGlobalFilter: (column) => Boolean(column.accessorFn),
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const rows = table.getRowModel().rows
  const filteredCount = server ? (rowCount ?? data.length) : table.getPrePaginatedRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)
  const selectedCount = Object.values(rowSelection).filter(Boolean).length
  const pageAllSelected = selectable && rows.length > 0 && table.getIsAllPageRowsSelected()
  const pageSomeSelected = selectable && table.getIsSomePageRowsSelected()
  const filterableColumns = columns.filter((c) => c.filter && c.accessor)
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (rowActions ? 1 : 0)
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide())
  const cellPad = densityPad[density]
  const showFilterRow = filtersOpen && filterableColumns.length > 0
  const activeFilters = colFilters.length + (globalFilter ? 1 : 0)
  const dimRows = server && loading && rows.length > 0
  const showSkeleton = loading && !dimRows
  const actionsLabel = rowActionsLabel ?? labels.gridActions

  const resetFilters = () => { setGlobalFilter(""); setSearchText(""); setFilterDraft({}); setColFilters([]); resetPage() }

  // giữ ô tìm khớp khi từ khoá đổi từ ngoài
  React.useEffect(() => { setSearchText(globalFilter) }, [globalFilter])
  React.useEffect(() => {
    if (!server || searchText === globalFilter) return
    const t = setTimeout(() => { setGlobalFilter(searchText); resetPage() }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server, searchText])
  React.useEffect(() => {
    const ids = Object.keys(filterDraft)
    if (!server || ids.length === 0) return
    const t = setTimeout(() => {
      setColFilters((prev) => [
        ...prev.filter((f) => !ids.includes(f.id)),
        ...ids.filter((id) => filterDraft[id]).map((id) => ({ id, value: filterDraft[id] })),
      ])
      setFilterDraft({})
      resetPage()
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server, filterDraft])

  // dữ liệu cây: khi đang lọc thì mở hết để thấy dòng khớp nằm sâu bên trong
  const filterKey = getSubRows && activeFilters > 0 ? JSON.stringify([globalFilter, colFilters]) : ""
  React.useEffect(() => { if (filterKey) setExpanded(true) }, [filterKey])

  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (!virt || !el) return
    const measure = () => setScroll((s) => (s.height === el.clientHeight ? s : { ...s, height: el.clientHeight || s.height }))
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [Boolean(virt)])

  // cửa sổ dòng hiển thị khi virtualize: chỉ dựng dòng trong khung nhìn cộng vùng đệm, phần còn lại thay bằng hai dòng đệm
  const first = virt ? Math.max(0, Math.floor(scroll.top / virt.rowHeight) - virt.overscan) : 0
  const last = virt ? Math.min(rows.length, Math.ceil((scroll.top + scroll.height) / virt.rowHeight) + virt.overscan) : rows.length
  const visibleRows = virt ? rows.slice(first, last) : rows
  const padTop = virt ? first * virt.rowHeight : 0
  const padBottom = virt ? (rows.length - last) * virt.rowHeight : 0

  const exportOpts = typeof exportable === "object" ? exportable : {}
  const exportFormats: ExportFormat[] = exportOpts.formats ?? ["csv", "xls"]
  const exportCount = selectedCount > 0 ? selectedCount : server && !onExportAll ? data.length : filteredCount
  const runExport = async (format: ExportFormat) => {
    const cols = table.getVisibleLeafColumns()
      .map((c) => columns.find((d) => d.id === c.id))
      .filter((d): d is DataGridColumn<T> => Boolean(d?.accessor))
      .map((d) => ({ header: d.header, value: d.accessor! }))
    const sorted = table.getSortedRowModel().rows
    const source = selectedCount > 0 ? sorted.filter((r) => r.getIsSelected()).map((r) => r.original)
      : server ? (onExportAll ? await onExportAll() : data)
      : sorted.map((r) => r.original)
    exportRows(cols, source, format, exportOpts.filename, labels)
  }

  // ── sửa tại ô và di chuyển bằng bàn phím (chỉ khi có cột editable) ──
  const navCols = visibleColumns.map((c) => c.id)
  const activeCell = active && navCols.includes(active.colId) && visibleRows.some((r) => r.id === active.rowId)
    ? active : visibleRows[0] && navCols[0] ? { rowId: visibleRows[0].id, colId: navCols[0] } : null
  const focusCell = (rowId: string, colId: string) => {
    const el = Array.from(scrollRef.current?.querySelectorAll<HTMLElement>("td[data-row-id]") ?? [])
      .find((td) => td.dataset.rowId === rowId && td.dataset.colId === colId)
    el?.focus()
  }
  const defOf = (colId: string) => columns.find((c) => c.id === colId)
  const startEdit = (row: Row<typeof features, T>, colId: string) => {
    setActive({ rowId: row.id, colId })
    setEdit({ rowId: row.id, colId, draft: defOf(colId)?.accessor?.(row.original), saving: false, error: null })
    setLiveMessage("")
  }
  const cancelEdit = () => {
    if (!edit) return
    setEdit(null)
    setLiveMessage("")
    focusCell(edit.rowId, edit.colId)
  }
  const nextEditable = (rowId: string, colId: string, dir: 1 | -1) => {
    const cells = visibleRows.flatMap((r) => navCols.filter((id) => canEditCell(defOf(id), r.original)).map((id) => ({ row: r, colId: id })))
    const i = cells.findIndex((c) => c.row.id === rowId && c.colId === colId)
    return i < 0 ? undefined : cells[i + dir]
  }
  const commitEdit = async (row: Row<typeof features, T>, colId: string, value: unknown, move?: 1 | -1) => {
    if (!edit || edit.saving) return
    try {
      const result = onCellEdit?.(row.original, colId, value)
      if (result && typeof (result as Promise<void>).then === "function") {
        setEdit((e) => e && { ...e, draft: value, saving: true, error: null })
        setLiveMessage(labels.gridSaving)
        await result
      }
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : labels.gridEditFailed
      setEdit((e) => e && { ...e, draft: value, saving: false, error: message })
      setLiveMessage(message)
      return
    }
    setLiveMessage("")
    const next = move ? nextEditable(row.id, colId, move) : undefined
    if (next) startEdit(next.row, next.colId)
    else { setEdit(null); focusCell(row.id, colId) }
  }
  const onCellKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>, row: Row<typeof features, T>, colId: string, isFirst: boolean) => {
    if (edit && edit.rowId === row.id && edit.colId === colId) return
    if (getSubRows && isFirst && row.subRows.length > 0) {
      if (e.key === "ArrowRight" && !row.getIsExpanded()) { e.preventDefault(); row.toggleExpanded(true); return }
      if (e.key === "ArrowLeft" && row.getIsExpanded()) { e.preventDefault(); row.toggleExpanded(false); return }
    }
    if (!gridMode) return
    if ((e.key === "Enter" || e.key === "F2") && e.target === e.currentTarget) {
      if (canEditCell(defOf(colId), row.original)) { e.preventDefault(); startEdit(row, colId) }
      return
    }
    const ri = visibleRows.findIndex((r) => r.id === row.id)
    const ci = navCols.indexOf(colId)
    let nr = ri
    let nc = ci
    if (e.key === "ArrowUp") nr--
    else if (e.key === "ArrowDown") nr++
    else if (e.key === "ArrowLeft") nc--
    else if (e.key === "ArrowRight") nc++
    else if (e.key === "Home") nc = 0
    else if (e.key === "End") nc = navCols.length - 1
    else return
    e.preventDefault()
    nr = Math.max(0, Math.min(visibleRows.length - 1, nr))
    nc = Math.max(0, Math.min(navCols.length - 1, nc))
    const target = visibleRows[nr]
    const targetCol = navCols[nc]
    if (!target || !targetCol) return
    setActive({ rowId: target.id, colId: targetCol })
    focusCell(target.id, targetCol)
  }

  // ── đổi độ rộng cột ──
  const resizeTo = (colId: string, width: number) =>
    setColumnSizing((s) => ({ ...s, [colId]: Math.round(Math.max(minColumnWidth, Math.min(maxColumnWidth, width))) }))
  const startResize = (e: React.PointerEvent<HTMLElement>, colId: string, startSize: number) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const dir = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1
    const move = (ev: PointerEvent) => resizeTo(colId, startSize + (ev.clientX - startX) * dir)
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up) }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const expandToggle = (row: Row<typeof features, T>, controls?: string) => {
    const open = row.getIsExpanded()
    return (
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? controls : undefined}
        aria-label={open ? labels.gridCollapseRow : labels.gridExpandRow}
        onClick={(e) => { e.stopPropagation(); row.toggleExpanded() }}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight aria-hidden className={cn("size-4 transition-transform", open && "rotate-90")} />
      </button>
    )
  }

  return (
    <div data-slot="data-grid" className={cn("flex w-full min-w-0 flex-col gap-3", className)} {...rest}>
      {(searchable || showColumnFilterToggle || densityToggle || columnMenu || toolbar || exportable) && (
        <div data-slot="data-grid-toolbar" className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-48 flex-1 sm:max-w-xs">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search" className="pl-9" value={server ? searchText : globalFilter}
                placeholder={typeof searchable === "string" ? searchable : labels.gridSearch}
                aria-label={labels.gridSearchLabel}
                onChange={(e) => {
                  if (server) setSearchText(e.target.value)
                  else { setGlobalFilter(e.target.value); resetPage() }
                }}
              />
            </div>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}><X /> {labels.gridResetFilters}</Button>
            )}
            {showColumnFilterToggle && filterableColumns.length > 0 && (
              <Button variant={filtersOpen ? "secondary" : "outline"} size="sm" aria-pressed={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
                <Filter /> {labels.gridFilters}{colFilters.length > 0 ? ` (${colFilters.length})` : ""}
              </Button>
            )}
            {densityToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" aria-label={labels.gridDensity}><Rows3 /> {densityLabel[density]}</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{labels.gridDensity}</DropdownMenuLabel>
                  {(Object.keys(densityLabel) as DataGridDensity[]).map((d) => (
                    <DropdownMenuItem key={d} aria-current={d === density ? "true" : undefined} className={cn(d === density && "font-semibold text-primary")} onSelect={() => setDensity(d)}>{densityLabel[d]}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {columnMenu && hideable.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" aria-label={labels.gridColumnsLabel}><Columns3 /> {labels.gridColumns}</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>{labels.gridVisibleColumns}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideable.map((c) => {
                    const checked = c.getIsVisible()
                    return (
                      <DropdownMenuItem key={c.id} role="menuitemcheckbox" aria-checked={checked} onSelect={(e) => { e.preventDefault(); c.toggleVisibility(!checked) }}>
                        <span aria-hidden className={cn("flex size-4 items-center justify-center rounded-[4px] border", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")}>{checked && <span className="text-micro leading-none">✓</span>}</span>
                        {typeof c.columnDef.header === "string" ? c.columnDef.header : c.id}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {exportable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" aria-label={labels.gridExportLabel}><Download /> {labels.gridExport}</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{selectedCount > 0 ? labels.gridExportSelected(selectedCount) : labels.gridExportRows(exportCount)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {exportFormats.includes("csv") && <DropdownMenuItem onSelect={() => void runExport("csv")}>{labels.gridExportCsv}</DropdownMenuItem>}
                  {exportFormats.includes("xls") && <DropdownMenuItem onSelect={() => void runExport("xls")}>{labels.gridExportXls}</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {toolbar}
          </div>
        </div>
      )}

      {selectable && selectedCount > 0 && (
        <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-accent px-3 py-2 text-body">
          <span>{labels.gridSelected(selectedCount)}</span>
          {!server && pageAllSelected && selectedCount < filteredCount && (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => table.toggleAllRowsSelected(true)}>{labels.gridSelectAllRows(filteredCount)}</Button>
          )}
          <Button variant="link" size="sm" className="ml-auto h-auto p-0" onClick={() => table.resetRowSelection(true)}>{labels.gridClearSelection}</Button>
        </div>
      )}

      <div
        data-slot="data-grid-scroll"
        ref={scrollRef}
        onScroll={virt ? (e) => { const top = e.currentTarget.scrollTop; setScroll((s) => (s.top === top ? s : { ...s, top })) } : undefined}
        className="relative w-full overflow-auto rounded-lg border bg-card"
        style={maxHeight !== undefined ? { maxHeight } : undefined}
        // vùng cuộn được cần focus được để dùng bàn phím
        tabIndex={0}
        role="region"
        aria-label={labels.gridScrollable(ariaLabel)}
      >
        <table
          aria-label={ariaLabel} aria-busy={loading || undefined} aria-rowcount={filteredCount} role={gridMode ? "grid" : undefined}
          className="w-full caption-bottom border-separate border-spacing-0 text-body"
          style={{
            minWidth: visibleColumns.reduce((s, c) => s + c.getSize(), (selectable ? 44 : 0) + (renderExpanded ? 44 : 0) + (rowActions ? 80 : 0)),
            ...(resizableColumns ? { tableLayout: "fixed" as const } : {}),
          }}
        >
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {selectable && (
                  <th scope="col" className="sticky left-0 z-[2] h-[34px] w-11 border-b bg-secondary px-3 text-left align-middle" style={{ width: 44 }}>
                    <Checkbox
                      aria-label={labels.gridSelectPage}
                      checked={pageAllSelected ? true : pageSomeSelected ? "indeterminate" : false}
                      onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
                      disabled={loading || rows.length === 0}
                    />
                  </th>
                )}
                {renderExpanded && <th scope="col" className="h-[34px] w-11 border-b bg-secondary" style={{ width: 44 }}><span className="sr-only">{labels.gridExpandRow}</span></th>}
                {group.headers.map((header) => {
                  const column = header.column
                  const def = columns.find((c) => c.id === column.id)
                  const sorted = column.getIsSorted()
                  const canSort = column.getCanSort()
                  const align = def?.align ?? "start"
                  const label = def?.header ?? column.id
                  const size = column.getSize()
                  return (
                    <th
                      key={header.id} scope="col"
                      aria-sort={canSort ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                      className={cn("h-[34px] border-b bg-secondary px-3.5 align-middle text-label font-bold tracking-[0.05em] whitespace-nowrap text-subtle-foreground uppercase", alignClass[align], resizableColumns && "relative")}
                      style={{ width: size, ...pinStyle(column) }}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={column.getToggleSortingHandler()}
                          className={cn("-mx-1.5 inline-flex min-h-8 items-center gap-1.5 rounded-sm px-1.5 uppercase outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", sorted && "text-foreground", align === "end" && "flex-row-reverse")}
                        >
                          <span>{label}</span>
                          {sorted === "asc" ? <ArrowUp aria-hidden className="size-3.5" /> : sorted === "desc" ? <ArrowDown aria-hidden className="size-3.5" /> : <ChevronsUpDown aria-hidden className="size-3.5 opacity-50" />}
                          <span className="sr-only">{sorted === "asc" ? labels.gridSortedAsc : sorted === "desc" ? labels.gridSortedDesc : labels.gridSortHint}</span>
                        </button>
                      ) : label}
                      {resizableColumns && (
                        <div
                          role="separator" tabIndex={0} aria-orientation="vertical"
                          aria-label={labels.gridResizeColumn(label)}
                          aria-valuenow={size} aria-valuemin={minColumnWidth} aria-valuemax={maxColumnWidth}
                          onPointerDown={(e) => startResize(e, column.id, size)}
                          onDoubleClick={() => column.resetSize()}
                          onKeyDown={(e) => {
                            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
                            e.preventDefault()
                            resizeTo(column.id, size + (e.key === "ArrowRight" ? resizeStep : -resizeStep))
                          }}
                          className="absolute inset-y-0 end-0 z-[1] w-2 cursor-col-resize touch-none select-none outline-none after:absolute after:inset-y-2 after:end-0 after:w-px after:bg-border hover:after:w-0.5 hover:after:bg-primary focus-visible:after:inset-y-0 focus-visible:after:w-0.5 focus-visible:after:bg-ring"
                        />
                      )}
                    </th>
                  )
                })}
                {rowActions && <th scope="col" className="sticky right-0 z-[2] h-[34px] border-b bg-secondary px-3.5 text-right align-middle text-label font-bold tracking-[0.05em] whitespace-nowrap text-subtle-foreground uppercase" style={{ width: 80 }}>{actionsLabel}</th>}
              </tr>
            ))}
            {showFilterRow && (
              <tr>
                {selectable && <th aria-hidden className="sticky left-0 z-[2] border-b bg-secondary" />}
                {renderExpanded && <th aria-hidden className="border-b bg-secondary" />}
                {visibleColumns.map((column) => {
                  const def = columns.find((c) => c.id === column.id)
                  const value = (column.getFilterValue() as string | undefined) ?? ""
                  return (
                    <th key={column.id} className="border-b bg-secondary px-2 py-1.5 font-normal" style={pinStyle(column)}>
                      {def?.filter === "text" && (
                        <Input
                          className="h-7 text-xs" value={server ? (filterDraft[column.id] ?? value) : value} placeholder={labels.gridFilterPlaceholder} aria-label={labels.gridFilterBy(def.header)}
                          onChange={(e) => {
                            const v = e.target.value
                            if (server) setFilterDraft((d) => ({ ...d, [column.id]: v }))
                            else { column.setFilterValue(v || undefined); resetPage() }
                          }}
                        />
                      )}
                      {def?.filter && typeof def.filter === "object" && (
                        <Select value={value || "__all"} onValueChange={(v) => { column.setFilterValue(v === "__all" ? undefined : v); resetPage() }}>
                          <SelectTrigger className="h-7 text-xs" aria-label={labels.gridFilterBy(def.header)}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all">{labels.gridFilterAll}</SelectItem>
                            {def.filter.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </th>
                  )
                })}
                {rowActions && <th aria-hidden className="sticky right-0 border-b bg-secondary" />}
              </tr>
            )}
          </thead>
          <tbody className={cn(dimRows && "opacity-50 transition-opacity")}>
            {showSkeleton ? (
              Array.from({ length: Math.min(initialPageSize, 6) }, (_, i) => (
                <tr key={i} aria-hidden>
                  <td colSpan={colSpan} className={cn("border-b px-3.5", tableSoftBorder, cellPad)}><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={colSpan}>{emptyState ?? <EmptyState title={labels.noData} description={activeFilters > 0 ? labels.gridEmptyFiltered : undefined} />}</td></tr>
            ) : <>
              {padTop > 0 && <tr aria-hidden style={{ height: padTop }}><td colSpan={colSpan} /></tr>}
              {visibleRows.map((row) => {
              const selected = row.getIsSelected()
              const detailId = `${baseId}-detail-${row.id}`
              return (
                <React.Fragment key={row.id}>
                <tr
                  style={virt ? { height: virt.rowHeight } : undefined}
                  data-state={selected ? "selected" : undefined}
                  aria-selected={selectable ? selected : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn("group transition-colors hover:bg-secondary data-[state=selected]:bg-accent", onRowClick && "cursor-pointer")}
                >
                  {selectable && (
                    <td className={cn("sticky left-0 z-[1] border-b bg-card px-3", tableSoftBorder, "group-hover:bg-secondary group-data-[state=selected]:bg-accent", cellPad)} onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={labels.gridSelectRow(row.index + 1)} checked={selected} onCheckedChange={(v) => row.toggleSelected(v === true)} />
                    </td>
                  )}
                  {renderExpanded && (
                    <td className={cn("border-b px-2", tableSoftBorder, cellPad)}>{expandToggle(row, detailId)}</td>
                  )}
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const colId = cell.column.id
                    const def = defOf(colId)
                    const pinned = cell.column.getIsPinned()
                    const editable = canEditCell(def, row.original)
                    const editing = edit && edit.rowId === row.id && edit.colId === colId ? edit : null
                    const isActive = gridMode && activeCell?.rowId === row.id && activeCell.colId === colId
                    const tree = getSubRows && cellIndex === 0
                    const errorId = `${baseId}-error-${row.id}-${colId}`
                    let content: React.ReactNode = <FlexRender cell={cell} />
                    if (editing && def) {
                      const editorProps: DataGridEditorProps<T> = {
                        row: row.original, value: editing.draft, saving: editing.saving, error: editing.error,
                        onChange: (v) => setEdit((e) => e && { ...e, draft: v, error: null }),
                        commit: (v) => void commitEdit(row, colId, v === undefined ? editing.draft : v),
                        cancel: cancelEdit,
                      }
                      content = (
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            // bỏ qua phím từ nội dung nằm trong portal (ví dụ danh sách của Select)
                            if (!e.currentTarget.contains(e.target as Node)) return
                            e.stopPropagation()
                            if (e.key === "Enter") { e.preventDefault(); void commitEdit(row, colId, editing.draft) }
                            else if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
                            else if (e.key === "Tab") { e.preventDefault(); void commitEdit(row, colId, editing.draft, e.shiftKey ? -1 : 1) }
                          }}
                        >
                          <div className="min-w-0 flex-1">{def.editor ? def.editor(editorProps) : <DefaultEditor def={def} props={editorProps} label={labels.gridEditCell(def.header)} errorId={errorId} />}</div>
                          {editing.saving && <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                        </div>
                      )
                    }
                    if (tree) {
                      content = (
                        <div className="flex items-center gap-1" style={{ paddingInlineStart: row.depth * 20 }}>
                          {row.subRows.length > 0 ? expandToggle(row) : <span aria-hidden className="inline-block size-6 shrink-0" />}
                          <div className="min-w-0 flex-1">{content}</div>
                        </div>
                      )
                    }
                    return (
                      <td
                        key={cell.id}
                        data-row-id={row.id}
                        data-col-id={colId}
                        role={gridMode ? "gridcell" : undefined}
                        tabIndex={gridMode ? (isActive ? 0 : -1) : undefined}
                        aria-busy={editing?.saving || undefined}
                        onFocus={gridMode ? () => { if (!isActive) setActive({ rowId: row.id, colId }) } : undefined}
                        onDoubleClick={editable && !editing ? () => startEdit(row, colId) : undefined}
                        onKeyDown={gridMode || tree ? (e) => onCellKeyDown(e, row, colId, cellIndex === 0) : undefined}
                        className={cn(
                          "border-b px-3.5 align-middle", tableSoftBorder, cellPad, alignClass[def?.align ?? "start"],
                          pinned && "bg-card group-hover:bg-secondary group-data-[state=selected]:bg-accent",
                          gridMode && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                          editing && "py-1",
                        )}
                        style={pinStyle(cell.column)}
                      >
                        {content}
                        {editing?.error && <p id={errorId} className="mt-1 text-xs text-destructive">{editing.error}</p>}
                      </td>
                    )
                  })}
                  {rowActions && (
                    <td className={cn("sticky right-0 z-[1] border-b bg-card px-3.5 text-right " + tableSoftBorder + " group-hover:bg-secondary group-data-[state=selected]:bg-accent", cellPad)} onClick={(e) => e.stopPropagation()}>{rowActions(row.original)}</td>
                  )}
                </tr>
                {renderExpanded && row.getIsExpanded() && (
                  <tr id={detailId} data-slot="data-grid-detail">
                    <td colSpan={colSpan} className={cn("border-b bg-secondary/40 px-3.5 py-3", tableSoftBorder)}>{renderExpanded(row.original)}</td>
                  </tr>
                )}
                </React.Fragment>
              )
            })}
              {padBottom > 0 && <tr aria-hidden style={{ height: padBottom }}><td colSpan={colSpan} /></tr>}
            </>}
          </tbody>
        </table>
      </div>
      {gridMode && <div aria-live="polite" className="sr-only">{liveMessage}</div>}

      <div data-slot="data-grid-footer" className="flex flex-col items-center gap-3 text-body sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-3 text-muted-foreground">
          <span aria-live="polite">{filteredCount === 0 ? labels.gridRows(0) : paginate ? labels.gridRange(pagination.pageIndex * pagination.pageSize + 1, Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount), filteredCount) : labels.gridRows(filteredCount)}</span>
          {paginate && <div className="flex items-center gap-2">
            <span aria-hidden>{labels.gridPerPage}</span>
            <Select value={String(pagination.pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-[4.5rem]" aria-label={labels.gridPageSize}><SelectValue /></SelectTrigger>
              <SelectContent>{pageSizeOptions.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>}
        </div>
        {paginate && <Pagination page={pagination.pageIndex + 1} pageCount={pageCount} onPageChange={(p) => table.setPageIndex(p - 1)} />}
      </div>
    </div>
  )
}
