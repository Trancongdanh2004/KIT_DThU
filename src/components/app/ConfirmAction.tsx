import { cloneElement, useState, type ReactElement, type ReactNode } from "react";
import { ConfirmDialog } from "~/components/ui/alert-dialog";
import { Popconfirm } from "~/components/ui/popconfirm";

export interface ConfirmActionProps {
  /** Phần tử bấm để hỏi xác nhận (Button…). Một phần tử duy nhất. */
  trigger: ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hành động phá huỷ (xoá, khoá…) → nút xác nhận đỏ. */
  destructive?: boolean;
  /** "dialog" (mặc định, hộp thoại giữa màn hình) hoặc "popover" (hộp nhỏ neo vào nút, cho thao tác nhẹ). */
  mode?: "dialog" | "popover";
  /** Trả về Promise → hộp giữ mở và hiện loading đến khi xong; Promise lỗi thì giữ mở. */
  onConfirm: () => void | Promise<unknown>;
  disabled?: boolean;
}

/**
 * Hỏi xác nhận trước khi làm việc không hoàn tác được. Thay cho confirm() của trình duyệt và ConfirmDialog cũ.
 *
 *   <ConfirmAction trigger={<Button variant="destructive">Xoá</Button>}
 *     title="Xoá bản nháp?" description="Không khôi phục được." confirmLabel="Xoá" destructive
 *     onConfirm={() => remove.mutateAsync({ id })} />
 */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  mode = "dialog",
  onConfirm,
  disabled,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);

  if (mode === "popover") {
    return (
      <Popconfirm
        title={title}
        description={description}
        okText={confirmLabel}
        cancelText={cancelLabel}
        okVariant={destructive ? "destructive" : "default"}
        onConfirm={onConfirm}
        disabled={disabled}
      >
        {trigger}
      </Popconfirm>
    );
  }

  const control = cloneElement(trigger, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented && !disabled) setOpen(true);
    },
  });
  return (
    <>
      {control}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={destructive ? "destructive" : "default"}
        onConfirm={onConfirm}
      />
    </>
  );
}
