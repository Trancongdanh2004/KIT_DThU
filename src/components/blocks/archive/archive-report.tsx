import * as React from "react"
import { MoveHorizontal, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, Recharts, type ChartConfig } from "@/components/ui/chart"
import { DataTable, type Column } from "@/components/blocks/shell/data-table"
import { ArchiveSelect, ArchiveStat, type ArchiveSelectProps } from "./archive-shared"
import type { ArchiveStatus } from "./archive-lists"

export interface ArchiveReportMenuItem { id: string; code?: string; label: string }
/** `colorIndex` pins a datum to one --chart-N slot so the same entity keeps its colour across charts. */
export type ArchiveBarDatum = { label: string; value: number; colorIndex?: number }
export interface ArchiveKpi { label: string; value: React.ReactNode; hint?: React.ReactNode }
export interface ArchiveReportTableRow { id: string; name: string; sub?: string; status?: ArchiveStatus; values: number[] }

export interface ArchiveMultiLineSeries {
  key: string
  label: string
  color: string
}

export type ArchiveChartSpec =
  | { type: "bar"; title: string; data: ArchiveBarDatum[] }
  | { type: "hbar"; title: string; data: ArchiveBarDatum[] }
  | { type: "donut"; title: string; data: ArchiveBarDatum[] }
  | { type: "pie"; title: string; data: ArchiveBarDatum[] }
  | { type: "line"; title: string; data: ArchiveBarDatum[] }
  | {
      type: "multi-line"
      title: string
      data: Record<string, string | number>[]
      categoryKey?: string
      series: ArchiveMultiLineSeries[]
      height?: number
    }

export interface ArchiveReportPageProps {
  kpis: ArchiveKpi[]
  menu: ArchiveReportMenuItem[]
  activeReport: string
  onReportChange?: (id: string) => void
  title: string
  description?: string
  select?: ArchiveSelectProps
  onRefresh?: () => void
  summary?: { label: string; value: number }[]
  charts?: ArchiveChartSpec[]
  chartsLayout?: "grid" | "stacked"
  tableHeaders?: string[]
  tableRows?: ArchiveReportTableRow[]
}

/** Chart colour tokens, same palette as the home chart (--chart-1…6). */
const SERIES_VARS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"]
const SERIES_BG = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-chart-6"]
const VALUE_CONFIG: ChartConfig = { value: { label: "Số lượng", color: SERIES_VARS[0] } }

function wrapLabel(text: string, maxCharsPerLine: number = 14, maxLines: number = 2): string[] {
  if (!text || text.length <= maxCharsPerLine) return [text]
  const words = text.split(" ")
  const lines: string[] = []
  let cur = ""

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (!cur) {
      cur = w
    } else if ((cur + " " + w).length <= maxCharsPerLine) {
      cur += " " + w
    } else {
      lines.push(cur)
      cur = w
      if (lines.length === maxLines - 1) {
        const rest = words.slice(i).join(" ")
        lines.push(rest.length > maxCharsPerLine ? `${rest.slice(0, maxCharsPerLine - 1)}…` : rest)
        cur = ""
        break
      }
    }
  }
  if (cur) lines.push(cur)
  return lines
}

interface HorizontalTickProps {
  x?: number
  y?: number
  payload?: {
    value?: string | number
  }
}

/** X-axis labels sit horizontally on one row and wrap automatically for long text or narrow screens. */
function HorizontalAxisTick({ x, y, payload }: HorizontalTickProps) {
  if (x === undefined || y === undefined || payload?.value === undefined) return null
  const label = String(payload.value)
  const lines = wrapLabel(label, 14, 2)

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={8}
        textAnchor="middle"
        className="fill-muted-foreground text-[10.5px] sm:text-[11px] font-normal select-none pointer-events-none"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

/** Vertical bars with value axis, grid, tooltip and value labels (Recharts). */
export function ArchiveBarChart({ data, label }: { data: ArchiveBarDatum[]; height?: number; label: string }) {
  const hasLongLabels = data.some((d) => d.label.length > 8)
  // Each column needs about 135px (long labels) or 95px (short labels)
  // so horizontal labels never overlap each other
  const colWidth = hasLongLabels ? 135 : 95
  const calculatedMinWidth = data.length * colWidth + 50
  const isScrollable = data.length >= 3

  return (
    <div className="w-full outline-none focus:outline-none">
      {isScrollable && (
        <div className="mb-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground lg:hidden select-none">
          <span>Kéo ngang để xem đầy đủ ({data.length} cột)</span>
          <MoveHorizontal className="size-3.5" aria-hidden="true" />
        </div>
      )}
      <div
        tabIndex={-1}
        className="w-full overflow-x-auto overflow-y-hidden pb-1 touch-pan-x [scrollbar-width:thin] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus-visible:outline-none"
        style={{ outline: "none" }}
      >
        <div
          style={{
            minWidth: `${calculatedMinWidth}px`,
            width: "100%",
            outline: "none",
          }}
          className="outline-none focus:outline-none"
        >
          <ChartContainer
            config={VALUE_CONFIG}
            data={data}
            categoryKey="label"
            aria-label={label}
            className="aspect-auto h-72 sm:h-80 w-full outline-none focus:outline-none"
          >
            <Recharts.BarChart
              data={data}
              barCategoryGap="28%"
              margin={{
                top: 24,
                right: 20,
                left: -6,
                bottom: 14,
              }}
            >
              <Recharts.CartesianGrid vertical={false} />
              <Recharts.XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={48}
                tick={<HorizontalAxisTick />}
              />
              <Recharts.YAxis
                allowDecimals={false}
                domain={[0, (max: number) => Math.max(1, Math.ceil(max * 1.18))]}
                tickLine={false}
                axisLine={false}
                width={45}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
              <Recharts.Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={42}>
                <Recharts.LabelList dataKey="value" position="top" offset={6} className="fill-foreground text-xs font-semibold" />
              </Recharts.Bar>
            </Recharts.BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

/** Horizontal bars with value labels: best for long category names. */
export function ArchiveHBarChart({ data, label }: { data: ArchiveBarDatum[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul aria-label={label} className="grid gap-2.5">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(5rem,9rem)_1fr_3rem] sm:grid-cols-[minmax(6rem,12rem)_1fr_3rem] items-center gap-2.5 sm:gap-3 text-sm">
          <span className="truncate" title={d.label}>{d.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full bg-current text-primary")} style={{ width: `${(d.value / max) * 100}%` }} /></span>
          <span className="text-right font-semibold tabular-nums">{d.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** Donut with total in the centre and a legend (Recharts). */
export function ArchiveDonutChart({ data, label }: { data: ArchiveBarDatum[]; label: string }) {
  const total = data.reduce((n, d) => n + d.value, 0)
  const slot = (d: ArchiveBarDatum, i: number) => (d.colorIndex ?? i) % SERIES_VARS.length
  const config: ChartConfig = Object.fromEntries(data.map((d, i) => [d.label, { label: d.label, color: SERIES_VARS[slot(d, i)] }]))
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative size-40 shrink-0 sm:size-44">
        <ChartContainer config={config} aria-label={label} className="aspect-square size-full">
          <Recharts.PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Recharts.Pie data={total > 0 ? data : [{ label: "", value: 1 }]} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="95%" paddingAngle={total > 0 ? 2 : 0} strokeWidth={0}>
              {total > 0 ? data.map((d, i) => <Recharts.Cell key={d.label} fill={SERIES_VARS[slot(d, i)]} />) : <Recharts.Cell fill="var(--muted)" />}
            </Recharts.Pie>
          </Recharts.PieChart>
        </ChartContainer>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground tabular-nums">{total}</span>
      </div>
      <ul className="grid w-full min-w-0 flex-1 gap-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2.5 shrink-0 rounded-sm", SERIES_BG[slot(d, i)])} />
            <span className="truncate" title={d.label}>{d.label}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums shrink-0">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const RADIAN = Math.PI / 180

interface CustomizedPieLabelProps {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
  value?: number
}

function renderCustomizedPieLabel({ cx, cy, midAngle, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomizedPieLabelProps) {
  // Only show the % inside a slice when it is >= 5% to avoid overlapping text on thin slices.
  if (percent < 0.05 || cx === undefined || cy === undefined || midAngle === undefined) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const pctString = `${(percent * 100).toFixed(1).replace(/\.0$/, "")}%`

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold pointer-events-none select-none"
      style={{
        filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.85))",
        fontWeight: 700,
      }}
    >
      {pctString}
    </text>
  )
}

/** Pie chart (solid) with a legend and percentage labels inside slices (Recharts). */
export function ArchivePieChart({ data, label }: { data: ArchiveBarDatum[]; label: string }) {
  const sortedData = React.useMemo(() => [...data].sort((a, b) => b.value - a.value), [data])
  const total = sortedData.reduce((n, d) => n + d.value, 0)
  const slot = (d: ArchiveBarDatum, i: number) => (d.colorIndex ?? i) % SERIES_VARS.length
  const config: ChartConfig = Object.fromEntries(sortedData.map((d, i) => [d.label, { label: d.label, color: SERIES_VARS[slot(d, i)] }]))
  return (
    <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-center sm:justify-start sm:gap-8 md:gap-12">
      <div className="relative size-48 shrink-0 sm:size-56 md:size-64">
        <ChartContainer config={config} aria-label={label} className="aspect-square size-full">
          <Recharts.PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Recharts.Pie
              data={total > 0 ? sortedData : [{ label: "", value: 1 }]}
              dataKey="value"
              nameKey="label"
              startAngle={90}
              endAngle={-270}
              innerRadius={0}
              outerRadius="95%"
              paddingAngle={total > 0 ? 1 : 0}
              stroke="var(--background)"
              strokeWidth={1.5}
              labelLine={false}
              label={total > 0 ? renderCustomizedPieLabel : undefined}
            >
              {total > 0 ? sortedData.map((d, i) => <Recharts.Cell key={d.label} fill={SERIES_VARS[slot(d, i)]} />) : <Recharts.Cell fill="var(--muted)" />}
            </Recharts.Pie>
          </Recharts.PieChart>
        </ChartContainer>
      </div>
      <ul className="grid w-full min-w-0 flex-1 gap-2 text-sm">
        {sortedData.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1).replace(/\.0$/, "") : "0"
          return (
            <li key={d.label} className="flex items-center gap-2.5">
              <span aria-hidden className={cn("size-3 shrink-0 rounded-sm", SERIES_BG[slot(d, i)])} />
              <span className="font-medium text-foreground truncate" title={d.label}>{d.label}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums text-foreground shrink-0">
                {d.value} <span className="font-normal text-muted-foreground text-xs">({pct}%)</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Trend line with value axis, round markers and value labels (Recharts). */
export function ArchiveLineChart({ data, label, height }: { data: ArchiveBarDatum[]; label: string; height?: number }) {
  const isScrollable = data.length > 7
  const calculatedMinWidth = data.length * 60
  return (
    <div className="w-full">
      {isScrollable && (
        <div className="mb-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground lg:hidden">
          <span>Kéo ngang để xem đầy đủ ({data.length} mốc)</span>
          <MoveHorizontal className="size-3.5" aria-hidden="true" />
        </div>
      )}
      <div
        tabIndex={-1}
        className="w-full overflow-x-auto overflow-y-hidden pb-1 touch-pan-x [scrollbar-width:thin] outline-none focus:outline-none focus-visible:outline-none select-none"
        style={{ outline: "none" }}
      >
        <div style={{ minWidth: isScrollable ? `${calculatedMinWidth}px` : "100%", width: "100%", outline: "none" }}>
          <ChartContainer config={VALUE_CONFIG} data={data} categoryKey="label" aria-label={label} className={cn("aspect-auto w-full outline-none focus:outline-none", height ? `h-[${height}px]` : "h-64 sm:h-72")}>
            <Recharts.LineChart data={data} margin={{ top: 22, right: 20, left: -8, bottom: 8 }}>
              <Recharts.CartesianGrid vertical={false} />
              <Recharts.XAxis dataKey="label" tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} tick={{ fontSize: 11 }} />
              <Recharts.YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(1, Math.ceil(max * 1.15))]} tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Recharts.Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-value)", strokeWidth: 0 }} activeDot={{ r: 6 }}>
                <Recharts.LabelList dataKey="value" position="top" offset={8} className="fill-foreground text-xs font-semibold" />
              </Recharts.Line>
            </Recharts.LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

export function ArchiveMultiLineChart({
  data,
  label,
  categoryKey = "year",
  series,
  height,
}: {
  data: Record<string, string | number>[]
  label: string
  categoryKey?: string
  series: ArchiveMultiLineSeries[]
  height?: number
}) {
  const isScrollable = data.length > 7
  const calculatedMinWidth = data.length * 68
  const config: ChartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  )

  return (
    <div className="w-full outline-none focus:outline-none">
      {isScrollable && (
        <div className="mb-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground lg:hidden select-none">
          <span>Kéo ngang để xem đầy đủ ({data.length} năm)</span>
          <MoveHorizontal className="size-3.5" aria-hidden="true" />
        </div>
      )}
      <div
        tabIndex={-1}
        className="w-full overflow-x-auto overflow-y-hidden pb-1 touch-pan-x [scrollbar-width:thin] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus-visible:outline-none"
        style={{ outline: "none" }}
      >
        <div
          style={{
            minWidth: isScrollable ? `${calculatedMinWidth}px` : "100%",
            width: "100%",
            outline: "none",
          }}
          className="outline-none focus:outline-none"
        >
          <ChartContainer
            config={config}
            data={data}
            categoryKey={categoryKey}
            categoryLabel="Năm"
            aria-label={label}
            className={cn("aspect-auto w-full outline-none focus:outline-none", height ? `h-[${height}px]` : "h-72 md:h-80")}
          >
            <Recharts.LineChart data={data} margin={{ top: 20, left: -8, right: 16, bottom: 8 }}>
              <Recharts.CartesianGrid vertical={false} />
              <Recharts.XAxis
                dataKey={categoryKey}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                padding={{ left: 16, right: 16 }}
                tick={{ fontSize: 11 }}
              />
              <Recharts.YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {series.map((s) => (
                <Recharts.Line
                  key={s.key}
                  type="linear"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: s.color }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </Recharts.LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

function Chart({ spec }: { spec: ArchiveChartSpec }) {
  switch (spec.type) {
    case "bar": return <ArchiveBarChart data={spec.data} label={spec.title} />
    case "hbar": return <ArchiveHBarChart data={spec.data} label={spec.title} />
    case "donut": return <ArchiveDonutChart data={spec.data} label={spec.title} />
    case "pie": return <ArchivePieChart data={spec.data} label={spec.title} />
    case "line": return <ArchiveLineChart data={spec.data} label={spec.title} />
    case "multi-line": return <ArchiveMultiLineChart data={spec.data} label={spec.title} categoryKey={spec.categoryKey} series={spec.series} height={spec.height} />
  }
}

/** Archive reports (báo cáo): KPI tiles, report menu, summary tiles, optional charts and a breakdown table. */
export function ArchiveReportPage({ kpis, menu, activeReport, onReportChange, title, description, select, onRefresh, summary, charts = [], tableHeaders = [], tableRows = [], chartsLayout = "grid" }: ArchiveReportPageProps) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  React.useEffect(() => setPage(1), [activeReport, tableRows.length])
  const hasStatus = tableRows.some((r) => r.status)
  const columns: Column<ArchiveReportTableRow>[] = [
    { key: "name", header: tableHeaders[0] ?? "Tên", cell: (r) => <div><div className="font-medium">{r.name}</div>{r.sub && <div className="font-mono text-caption text-muted-foreground">{r.sub}</div>}</div> },
    ...(hasStatus ? [{ key: "status", header: "Trạng thái", width: 130, cell: (r: ArchiveReportTableRow) => r.status ? <Badge variant={r.status.tone}>{r.status.label}</Badge> : null } satisfies Column<ArchiveReportTableRow>] : []),
    ...tableHeaders.slice(1).map((h, i): Column<ArchiveReportTableRow> => ({ key: `v${i}`, header: h, width: i === 0 ? 110 : 120, align: "right", className: "whitespace-normal", cell: (r) => r.values[i] })),
  ]
  const code = menu.find((m) => m.id === activeReport)?.code
  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="mb-3.5 grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-5">{kpis.map((k) => <ArchiveStat key={k.label} {...k} />)}</div>
      <div className="grid min-h-0 flex-1 items-start gap-3.5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Báo cáo" className="max-h-full self-start overflow-y-auto rounded-[9px] border bg-card p-2 shadow-sm">
          <div className="px-2.5 pt-1 pb-1.5 text-caption font-bold tracking-[0.05em] text-subtle-foreground uppercase">Báo cáo</div>
          <div className="flex flex-col gap-0.5">
            {menu.map((m) => (
              <button key={m.id} type="button" aria-current={m.id === activeReport ? "page" : undefined} onClick={() => onReportChange?.(m.id)}
                className={cn("flex w-full cursor-pointer items-center gap-2 rounded-md border px-2.5 py-[7px] text-left text-control outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring", m.id === activeReport ? "border-[color-mix(in_srgb,var(--primary)_22%,var(--card))] bg-accent font-bold text-primary" : "border-transparent text-foreground")}>
                <span aria-hidden className="min-w-[22px] flex-none font-mono text-label font-normal text-subtle-foreground">{m.code ?? "·"}</span><span className="min-w-0 flex-1 truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <section className="flex h-full min-h-0 min-w-0 flex-col" aria-label={title}>
          <header className="mb-2.5">
            <h2 className="m-0 flex items-center gap-2 text-title font-bold text-foreground">{code && <span className="font-mono text-caption font-bold text-primary">{code}</span>}{title}</h2>
            {description && <p className="m-0 mt-[3px] text-body text-muted-foreground">{description}</p>}
          </header>
          <div className="rounded-lg border bg-card px-2.5 py-[9px] shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {select && <ArchiveSelect width={230} {...select} />}
              {onRefresh && <Button variant="outline" size="toolbar-icon" className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Làm mới" title="Tải lại" onClick={onRefresh}><RefreshCw /></Button>}
            </div>
          </div>
          {summary && <div className="my-3 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">{summary.map((s) => <ArchiveStat key={s.label} label={s.label} value={s.value} />)}</div>}
          {charts.length > 0 && (
            <div className={cn("mb-3 grid gap-3", !summary && "mt-3", chartsLayout === "stacked" ? "grid-cols-1" : (charts.length > 1 && "xl:grid-cols-2"))}>
              {charts.map((c) => (
                <figure key={c.title} className="rounded-lg border bg-card p-3 sm:p-4 min-w-0 overflow-hidden shadow-xs">
                  <figcaption className="mb-3 text-sm font-semibold">{c.title}</figcaption>
                  <Chart spec={c} />
                </figure>
              ))}
            </div>
          )}
          {tableRows.length > 0 && (
            <DataTable<ArchiveReportTableRow> className={cn("min-h-64 shrink-0", !summary && !charts.length && "mt-3")} columns={columns} rows={tableRows.slice((page - 1) * pageSize, page * pageSize)} total={tableRows.length}
              getRowId={(r) => r.id} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1) }} />
          )}
        </section>
      </div>
    </div>
  )
}
