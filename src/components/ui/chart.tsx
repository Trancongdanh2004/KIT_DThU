import * as React from "react"
import * as Recharts from "recharts"
import { cn } from "@/lib/utils"
import { useUiConfig } from "@/lib/ui-config"

/**
 * Toàn bộ API của recharts (AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialBarChart, Area, Bar, XAxis...)
 * được xuất lại dưới không gian tên `Recharts` để tránh trùng tên với các block (ví dụ `LineChart`).
 * Dùng: `<Recharts.BarChart>`.
 */
export { Recharts }

/** Cấu hình một chuỗi dữ liệu của biểu đồ. */
export interface ChartSeriesConfig {
  /** Nhãn hiển thị trong chú giải và tooltip. */
  label?: React.ReactNode
  /** Biểu tượng thay cho chấm màu trong chú giải / tooltip. */
  icon?: React.ComponentType
  /**
   * Màu của chuỗi (bất kỳ giá trị CSS nào, nên là biến theme). Mặc định lần lượt là
   * `var(--chart-1, var(--primary))` ... `var(--chart-5, ...)`; có thể dùng `var(--chart-N)` trực tiếp.
   */
  color?: string
}
/** Khoá = `dataKey` của chuỗi (hoặc tên danh mục với Pie). Màu được gán thành biến CSS `--color-<khoá>`. */
export type ChartConfig = Record<string, ChartSeriesConfig>

const FALLBACK_COLORS = [
  "var(--chart-1, var(--primary))",
  "var(--chart-2, var(--info, var(--primary)))",
  "var(--chart-3, var(--success, var(--primary)))",
  "var(--chart-4, var(--warning, var(--primary)))",
  "var(--chart-5, var(--destructive, var(--primary)))",
]

/** Màu mặc định thứ `index` (lặp vòng sau 5 màu). */
export function chartColor(index: number): string {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? "var(--primary)"
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)
function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("Các thành phần Chart* phải nằm trong <ChartContainer>")
  return ctx
}

export interface ChartContainerProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Cấu hình nhãn / màu cho từng chuỗi. */
  config: ChartConfig
  /** Một biểu đồ recharts (ví dụ `<Recharts.BarChart>`); được bọc sẵn trong ResponsiveContainer. */
  children: React.ComponentProps<typeof Recharts.ResponsiveContainer>["children"]
  /** Nhãn truy cập của cả biểu đồ (bắt buộc cho trình đọc màn hình). */
  "aria-label": string
  /**
   * Dữ liệu dùng để dựng bảng ẩn thay thế cho trình đọc màn hình (cùng dữ liệu truyền vào biểu đồ).
   * Cần kèm `categoryKey`.
   */
  data?: Record<string, unknown>[]
  /** Khoá của trục danh mục trong `data` (ví dụ "month"). */
  categoryKey?: string
  /** Nhãn cột danh mục trong bảng thay thế. @default Danh mục */
  categoryLabel?: string
  /** Tỉ lệ rộng/cao. Mặc định 16/9 (aspect-video) nếu `className` không đặt chiều cao (h-*) hay aspect-*. */
  aspect?: number
}

/**
 * Khung biểu đồ kiểu shadcn: responsive, gán màu từng chuỗi thành biến CSS `--color-<khoá>`, tô kiểu trục / lưới theo theme
 * và kèm bảng dữ liệu ẩn (`sr-only`, `aria-label`) cho trình đọc màn hình.
 */
export function ChartContainer({ config, children, className, data, categoryKey, categoryLabel, aspect, style, "aria-label": ariaLabel, ...props }: ChartContainerProps) {
  const { labels } = useUiConfig()
  const keys = Object.keys(config)
  const cssVars = Object.fromEntries(keys.map((k, i) => [`--color-${k}`, config[k]?.color ?? chartColor(i)])) as React.CSSProperties
  const ctx = React.useMemo(() => ({ config }), [config])
  const seriesKeys = data && categoryKey ? keys.filter((k) => data.some((d) => k in d)) : []
  return (
    <ChartContext value={ctx}>
      <div
        data-slot="chart" role="group" aria-label={ariaLabel}
        tabIndex={-1}
        style={{ ...cssVars, ...(aspect ? { aspectRatio: String(aspect) } : null), outline: "none", ...style }}
        className={cn(
          "relative flex w-full justify-center text-xs select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus-visible:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/60 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-none [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-none",
          !aspect && !className?.match(/(^|\s)(h|aspect)-/) && "aspect-video",
          className,
        )}
        {...props}
      >
        <Recharts.ResponsiveContainer width="100%" height="100%" minWidth={0}>{children}</Recharts.ResponsiveContainer>
        {data && categoryKey && (
          <table className="sr-only" aria-label={labels.chartDataTable(String(ariaLabel))}>
            <thead>
              <tr>
                <th scope="col">{categoryLabel ?? labels.chartCategory}</th>
                {seriesKeys.map((k) => <th key={k} scope="col">{config[k]?.label ?? k}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <th scope="row">{String(row[categoryKey] ?? "")}</th>
                  {seriesKeys.map((k) => <td key={k}>{String(row[k] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ChartContext>
  )
}

/** Tooltip của recharts; dùng với `content={<ChartTooltipContent />}`. */
export const ChartTooltip = Recharts.Tooltip
/** Chú giải của recharts; dùng với `content={<ChartLegendContent />}`. */
export const ChartLegend = Recharts.Legend

interface PayloadItem {
  name?: string | number
  dataKey?: string | number | ((...args: never[]) => unknown)
  value?: unknown
  color?: string
  fill?: string
  stroke?: string
  type?: string
  payload?: Record<string, unknown>
}

function itemKey(item: PayloadItem, nameKey?: string): string {
  const raw = (nameKey && (item.payload?.[nameKey] as string | undefined)) ?? item.name ?? (typeof item.dataKey === "string" || typeof item.dataKey === "number" ? item.dataKey : "value")
  return String(raw)
}

export interface ChartTooltipContentProps extends Omit<React.ComponentProps<"div">, "children" | "content"> {
  active?: boolean
  payload?: PayloadItem[]
  label?: React.ReactNode
  /** Ẩn dòng nhãn (tên danh mục) ở đầu tooltip. */
  hideLabel?: boolean
  /** Ẩn chấm màu. */
  hideIndicator?: boolean
  /** Kiểu chỉ báo màu. */
  indicator?: "dot" | "line" | "dashed"
  /** Khoá trong payload dùng làm tên chuỗi (cho Pie: thường là "name"). */
  nameKey?: string
  /** Khoá trong payload dùng làm nhãn đầu tooltip. */
  labelKey?: string
  /** Định dạng nhãn đầu tooltip. */
  labelFormatter?: (label: React.ReactNode, payload: PayloadItem[]) => React.ReactNode
  /** Định dạng giá trị của từng chuỗi. */
  formatter?: (value: unknown, name: string, item: PayloadItem) => React.ReactNode
}

/** Recharts injects internal props (chartWidth, itemSorter, labelStyle...) into custom content components: forward only valid DOM attributes. */
function domProps(props: Record<string, unknown>): React.HTMLAttributes<HTMLElement> {
  return Object.fromEntries(Object.entries(props).filter(([k]) => /^(aria-|data-|on[A-Z])/.test(k) || ["id", "role", "title", "style", "tabIndex"].includes(k))) as React.HTMLAttributes<HTMLElement>
}


/** Nội dung tooltip dùng nhãn / màu từ `ChartConfig`. */
export function ChartTooltipContent({ active, payload, label, className, hideLabel = false, hideIndicator = false, indicator = "dot", nameKey, labelKey, labelFormatter, formatter, ...props }: ChartTooltipContentProps) {
  const { config } = useChart()
  const { locale } = useUiConfig()
  const first = payload?.[0]
  if (!active || !payload || !first) return null
  const firstKey = labelKey ?? itemKey(first, nameKey)
  const headerRaw = labelKey ? (first.payload?.[labelKey] as React.ReactNode) : (config[String(label)]?.label ?? label)
  const header = hideLabel ? null : labelFormatter ? labelFormatter(headerRaw ?? config[firstKey]?.label, payload) : headerRaw
  return (
    <div data-slot="chart-tooltip" className={cn("grid min-w-32 items-start gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-xl", className)} {...domProps(props)}>
      {header != null && header !== "" && <div className="font-medium">{header}</div>}
      <div className="grid gap-1.5">
        {payload.filter((it) => it.type !== "none").map((item, i) => {
          const key = itemKey(item, nameKey)
          const cfg = config[key]
          const color = (item.payload?.fill as string | undefined) ?? item.color ?? item.fill ?? item.stroke
          const Icon = cfg?.icon
          return (
            <div key={`${key}-${i}`} className="flex w-full items-center gap-2">
              {Icon ? <Icon /> : !hideIndicator && (
                <span
                  aria-hidden
                  className={cn("shrink-0 rounded-[2px]", indicator === "dot" ? "size-2.5" : "w-1 self-stretch", indicator === "dashed" && "border-[1.5px] border-dashed bg-transparent")}
                  style={{ backgroundColor: indicator === "dashed" ? "transparent" : color, borderColor: color }}
                />
              )}
              <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                {formatter ? formatter(item.value, key, item) : (
                  <>
                    <span className="text-muted-foreground">{cfg?.label ?? key}</span>
                    {item.value != null && <span className="font-mono font-medium text-foreground tabular-nums">{typeof item.value === "number" ? item.value.toLocaleString(locale) : String(item.value)}</span>}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface ChartLegendContentProps extends Omit<React.ComponentProps<"ul">, "content"> {
  payload?: PayloadItem[]
  verticalAlign?: "top" | "middle" | "bottom"
  /** Ẩn biểu tượng / chấm màu. */
  hideIcon?: boolean
  /** Khoá trong payload dùng làm tên chuỗi (cho Pie: "name"). */
  nameKey?: string
}

/** Nội dung chú giải dùng nhãn / màu từ `ChartConfig`. */
export function ChartLegendContent({ className, payload, verticalAlign = "bottom", hideIcon = false, nameKey, ...props }: ChartLegendContentProps) {
  const { config } = useChart()
  const { labels } = useUiConfig()
  if (!payload?.length) return null
  return (
    <ul data-slot="chart-legend" aria-label={labels.chartLegend} className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", verticalAlign === "top" ? "pb-3" : "pt-3", className)} {...domProps(props)}>
      {payload.filter((it) => it.type !== "none").map((item, i) => {
        const key = itemKey({ ...item, name: item.name ?? (item as { value?: string }).value }, nameKey)
        const cfg = config[key]
        const Icon = cfg?.icon
        return (
          <li key={`${key}-${i}`} className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground">
            {Icon && !hideIcon ? <Icon /> : <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />}
            {cfg?.label ?? key}
          </li>
        )
      })}
    </ul>
  )
}
