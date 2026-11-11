import * as React from "react"

export type DocumentSortDir = "asc" | "desc"
export interface DocumentSort { key: string; dir: DocumentSortDir }

export interface UseDocumentListOptions<T> {
  rows: T[]
  /** Text the search box matches against (lower-cased by the hook). */
  searchText: (row: T) => string
  /** One predicate per filter id; the value "all" always skips the predicate. */
  filters?: Record<string, (row: T, value: string) => boolean>
  initialFilters?: Record<string, string>
  /** Quick filter (toggle button) predicates by id. */
  quick?: Record<string, (row: T) => boolean>
  sorters?: Record<string, (a: T, b: T) => number>
  initialSort?: DocumentSort
  initialPageSize?: number
}

export interface DocumentListState<T> {
  search: string
  setSearch: (v: string) => void
  filterValues: Record<string, string>
  setFilter: (id: string, value: string) => void
  activeQuick: string | null
  toggleQuick: (id: string) => void
  sort: DocumentSort | undefined
  toggleSort: (key: string) => void
  page: number
  setPage: (p: number) => void
  pageSize: number
  setPageSize: (n: number) => void
  /** Rows after search/filter/sort, before paging. */
  filtered: T[]
  total: number
  /** Rows of the current page. */
  pageRows: T[]
}

/** Client-side search, filter, sort and paging for a list of documents; keeps list demos and tests honest. */
export function useDocumentList<T>({ rows, searchText, filters = {}, initialFilters = {}, quick = {}, sorters = {}, initialSort, initialPageSize = 20 }: UseDocumentListOptions<T>): DocumentListState<T> {
  const [search, setSearchState] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(initialFilters)
  const [activeQuick, setActiveQuick] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<DocumentSort | undefined>(initialSort)
  const [page, setPageState] = React.useState(1)
  const [pageSize, setPageSizeState] = React.useState(initialPageSize)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let out = rows.filter((r) => {
      if (q && !searchText(r).toLowerCase().includes(q)) return false
      for (const [id, pred] of Object.entries(filters)) {
        const v = filterValues[id]
        if (v && v !== "all" && !pred(r, v)) return false
      }
      if (activeQuick && quick[activeQuick] && !quick[activeQuick]!(r)) return false
      return true
    })
    const cmp = sort ? sorters[sort.key] : undefined
    if (sort && cmp) out = [...out].sort((a, b) => (sort.dir === "asc" ? cmp(a, b) : cmp(b, a)))
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, filterValues, activeQuick, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return {
    search, setSearch: (v) => { setSearchState(v); setPageState(1) },
    filterValues, setFilter: (id, v) => { setFilterValues((s) => ({ ...s, [id]: v })); setPageState(1) },
    activeQuick, toggleQuick: (id) => { setActiveQuick((cur) => (cur === id ? null : id)); setPageState(1) },
    sort, toggleSort: (key) => setSort((cur) => (cur?.key !== key ? { key, dir: "asc" } : cur.dir === "asc" ? { key, dir: "desc" } : undefined)),
    page: safePage, setPage: setPageState, pageSize, setPageSize: (n) => { setPageSizeState(n); setPageState(1) },
    filtered, total: filtered.length, pageRows,
  }
}
