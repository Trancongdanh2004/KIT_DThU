import type { ReactNode } from "react";
import { PageHead } from "@/components/blocks/shell";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  /** `head` (mặc định): có thẻ PageHead — trang form/chi tiết. `list`: màn danh sách của kit, không thẻ đầu trang (tên trang đã nằm ở thanh trên/tab; h1 ẩn do InternalLayout cấp). */
  variant?: "head" | "list";
  /** Bắt buộc với `head`; `list` bỏ qua. */
  title?: ReactNode;
  description?: ReactNode;
  /** Nút hành động góc phải của đầu trang. */
  actions?: ReactNode;
  /** Nội dung đặt trước tiêu đề (nút quay lại…). */
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Khung chuẩn của trang khu nội bộ theo kiểu màn danh sách của DThU Kit: PageHead (viền, tiêu đề, ghi chú, hành động)
 * rồi các khối nội dung cách nhau 6px. `h1` ẩn của trang do InternalLayout cấp; PageHead là tiêu đề nhìn thấy (h2).
 * `variant="list"` bỏ PageHead như màn danh sách của kit: nút hành động chuyển vào thanh công cụ của danh sách.
 * Trang có bảng: để `DataTable`/`ServerDataTable` là khối cuối để nó giãn hết chiều cao còn lại.
 */
export function PageShell({ variant = "head", title, description, actions, leading, className, children }: PageShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", variant === "list" ? "h-full min-h-[32rem] *:shrink-0" : "min-h-full", className)}>
      {variant === "head" && <PageHead title={title} description={description} actions={actions} leading={leading} />}
      {children}
    </div>
  );
}
