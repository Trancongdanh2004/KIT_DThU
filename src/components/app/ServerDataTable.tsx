import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { DataTable, type Column } from "@/components/blocks/shell";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { EmptyState } from "~/components/ui/empty-state";
import { Pagination } from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { errorMessage } from "~/lib/errorMessages";
import { cn } from "@/lib/utils";

export interface ServerColumn<T> {
  /** Khoá duy nhất của cột. */
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  align?: "start" | "end" | "center";
  /** Độ rộng gợi ý (px hoặc CSS length). Đặt ít nhất một cột có width thì bảng dùng bố cục cố định. */
  width?: number | string;
  /** Class cho cả th và td (nowrap, truncate…). */
  className?: string;
  /** Ẩn cột dưới breakpoint này (mobile-first): "md" = ẩn trên điện thoại, "lg" = ẩn tới khi desktop. */
  hideBelow?: "md" | "lg";
}

export interface ServerDataTableProps<T> {
  /** Nhãn truy cập của bảng (bắt buộc, cũng đặt tên cho vùng phân trang). */
  label: string;
  columns: ServerColumn<T>[];
  /** Dòng của trang hiện tại; undefined khi chưa có dữ liệu. */
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  /** Tổng số bản ghi phía server. */
  total: number;
  /** Trang hiện tại, từ 1. */
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Truyền để hiện ô chọn "Hiện N dòng". */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Lần tải đầu (isLoading của query) → khung chờ. */
  loading?: boolean;
  /** Đang tải lại / chuyển trang (isFetching) → làm mờ bảng, giữ dòng cũ. */
  fetching?: boolean;
  /** Lỗi của query → banner lỗi tiếng Việt có nút "Thử lại". */
  error?: unknown;
  onRetry?: () => void;
  /** Bấm vào dòng (chuột). Luôn kèm một nút trong `rowActions` hoặc link ở ô đầu để bàn phím vào được. */
  onRowClick?: (row: T) => void;
  /** Cột thao tác cuối dòng, ghim phải khi bảng cuộn ngang. */
  rowActions?: (row: T) => ReactNode;
  rowActionsLabel?: string;
  /** Width of the pinned action column (default 80px). */
  rowActionsWidth?: number;
  /** Độ rộng tối thiểu của bảng (class Tailwind), bên dưới đó bảng cuộn ngang trong khung. */
  minWidthClass?: string;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  /** Dưới breakpoint md: mỗi dòng là một thẻ (thay bảng cuộn trong khung), như danh sách di động của kit. Bảng vẫn dùng từ md. */
  renderCard?: (row: T) => ReactNode;
  className?: string;
}

const ALIGN = { start: "left", center: "center", end: "right" } as const;
const HIDE = { md: "max-md:hidden", lg: "max-lg:hidden" } as const;

/**
 * Bảng danh sách phân trang phía server, dựng trên DataTable của DThU Kit (blocks/shell): tiêu đề dính, skeleton,
 * trạng thái rỗng, cột thao tác ghim phải, chân bảng "Hiện N dòng" + phân trang. Thêm: banner lỗi + Thử lại, làm mờ khi
 * chuyển trang. Bảng cuộn ngang trong khung nên trang không bao giờ cuộn ngang.
 */
export function ServerDataTable<T>({
  label,
  columns,
  rows,
  getRowId,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  loading,
  fetching,
  error,
  onRetry,
  onRowClick,
  rowActions,
  rowActionsLabel = "Thao tác",
  rowActionsWidth,
  minWidthClass,
  emptyTitle = "Không có dữ liệu",
  emptyDescription,
  renderCard,
  className,
}: ServerDataTableProps<T>) {
  const hasError = error != null;
  const kitColumns: Column<T>[] = columns.map((c) => ({
    key: c.id,
    header: c.header,
    cell: c.cell,
    width: c.width,
    align: ALIGN[c.align ?? "start"],
    className: cn(c.hideBelow && HIDE[c.hideBelow], c.className),
  }));
  if (rowActions) {
    kitColumns.push({
      key: "__actions",
      header: <span className="sr-only">{rowActionsLabel}</span>,
      width: rowActionsWidth,
      align: "right",
      className: "whitespace-nowrap",
      cell: (row) => rowActions(row),
    });
  }

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-1.5", className)}>
      {hasError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage(error)}</span>
            {onRetry && (
              <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                Thử lại
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      {renderCard && !(hasError && !rows) && (
        <div className={cn("flex flex-col gap-1.5 md:hidden", fetching && !loading && "opacity-60")}>
          {loading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
          ) : (rows ?? []).length === 0 ? (
            <div className="rounded-lg border bg-card p-3">
              <EmptyState title={emptyTitle} description={emptyDescription} />
            </div>
          ) : (
            <ul aria-label={label} className="m-0 flex list-none flex-col gap-1.5 p-0">
              {(rows ?? []).map((row) => (
                <li key={getRowId(row)} className="min-w-0 rounded-lg border bg-card p-3 shadow-sm">
                  {renderCard(row)}
                </li>
              ))}
            </ul>
          )}
          {total > pageSize && (
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-2.5">
              <span className="text-xs text-subtle-foreground">{total} kết quả</span>
              <Pagination page={page} pageCount={Math.ceil(total / pageSize)} onPageChange={onPageChange} />
            </div>
          )}
        </div>
      )}
      {!(hasError && !rows) && (
        <DataTable
          label={label}
          columns={kitColumns}
          rows={rows ?? []}
          getRowId={getRowId}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          showRange
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
          hideFooter={false}
          onRowClick={onRowClick}
          minWidthClass={minWidthClass}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          className={cn("transition-opacity", fetching && !loading && "opacity-60", renderCard && "max-md:hidden")}
        />
      )}
    </div>
  );
}
