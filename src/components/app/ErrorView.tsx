import { ArrowLeft, House, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Result } from "~/components/ui/result";

export interface ErrorViewProps {
  status: "403" | "404" | "500";
  /** Ghi đè tiêu đề mặc định theo mã lỗi (ví dụ 503 "Hệ thống đang bận"). */
  title?: string;
  description?: string;
  /** Nhãn nút về trang chủ của khu hiện tại. */
  homeLabel?: string;
  onHome?: () => void;
  onBack?: () => void;
  onRetry?: () => void;
}

const TITLES = {
  "404": "Không tìm thấy trang",
  "403": "Bạn chưa có quyền truy cập",
  "500": "Hệ thống đang gặp sự cố",
} as const;

/**
 * Khối lỗi (404/403/500) đặt BÊN TRONG một khung có sẵn (header/footer công khai, shell nội bộ), không chiếm cả trang
 * và không tạo <main> lồng nhau. Lỗi toàn trang dùng ErrorPage của blocks/system (xem root.tsx).
 */
export function ErrorView({ status, title, description, homeLabel = "Về trang chủ", onHome, onBack, onRetry }: ErrorViewProps) {
  return (
    <Result
      status={status}
      headingLevel={1}
      title={title ?? TITLES[status]}
      subTitle={description}
      className="min-h-[50dvh] justify-center"
      extra={
        <>
          {onHome && (
            <Button onClick={onHome}>
              <House />
              {homeLabel}
            </Button>
          )}
          {status === "500" && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw />
              Thử lại
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft />
              Quay lại
            </Button>
          )}
        </>
      }
    />
  );
}
