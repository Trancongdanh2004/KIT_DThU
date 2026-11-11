export type ExportFormat = "csv" | "xls"

/** Một cột để xuất: tiêu đề và hàm lấy giá trị thô của dòng. */
export interface ExportColumn<T> {
  header: string
  value: (row: T) => string | number | boolean | Date | null | undefined
}

/** Chữ hiển thị cho giá trị đúng/sai khi xuất. Mặc định "Có" / "Không" (lấy từ `labels.yes` / `labels.no` của UiProvider). */
export interface ExportLabels {
  yes: string
  no: string
}

const defaultExportLabels: ExportLabels = { yes: "Có", no: "Không" }

const pad = (n: number) => String(n).padStart(2, "0")

/** Định dạng ngày theo kiểu Việt Nam; thêm giờ phút nếu có. */
function formatDate(d: Date): string {
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  return d.getHours() || d.getMinutes() ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date
}

function toText(v: string | number | boolean | Date | null | undefined, labels: ExportLabels): string {
  if (v == null) return ""
  if (v instanceof Date) return formatDate(v)
  if (typeof v === "boolean") return v ? labels.yes : labels.no
  return String(v)
}

/** Ô bắt đầu bằng = + - @ bị Excel hiểu là công thức; thêm dấu nháy đơn để vô hiệu (chống chèn công thức). */
const neutralize = (s: string) => (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s)) ? `'${s}` : s)

const csvCell = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
const htmlCell = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Dựng nội dung CSV (có BOM UTF-8 để Excel đọc đúng tiếng Việt, dòng cách nhau CRLF). */
export function buildCsv<T>(columns: ExportColumn<T>[], rows: T[], labels: ExportLabels = defaultExportLabels): string {
  const lines = [columns.map((c) => csvCell(neutralize(c.header)))]
  for (const r of rows) lines.push(columns.map((c) => csvCell(neutralize(toText(c.value(r), labels)))))
  return "\ufeff" + lines.map((l) => l.join(",")).join("\r\n")
}

/** Dựng bảng HTML mà Excel mở như bảng tính (.xls). Không cần thư viện; số giữ nguyên kiểu số. */
export function buildExcelHtml<T>(columns: ExportColumn<T>[], rows: T[], labels: ExportLabels = defaultExportLabels): string {
  const head = columns.map((c) => `<th>${htmlCell(c.header)}</th>`).join("")
  const body = rows.map((r) => `<tr>${columns.map((c) => {
    const v = c.value(r)
    return typeof v === "number" ? `<td x:num>${v}</td>` : `<td style="mso-number-format:'\\@'">${htmlCell(toText(v, labels))}</td>`
  }).join("")}</tr>`).join("")
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
}

/** Tải một chuỗi về máy dưới dạng tệp. */
export function downloadText(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Xuất các dòng ra tệp CSV hoặc Excel (.xls) và kích hoạt tải về. */
export function exportRows<T>(columns: ExportColumn<T>[], rows: T[], format: ExportFormat, filename = "du-lieu", labels: ExportLabels = defaultExportLabels) {
  if (format === "csv") downloadText(buildCsv(columns, rows, labels), `${filename}.csv`, "text/csv")
  else downloadText(buildExcelHtml(columns, rows, labels), `${filename}.xls`, "application/vnd.ms-excel")
}
