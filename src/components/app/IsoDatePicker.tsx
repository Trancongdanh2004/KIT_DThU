import { format, isValid, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";

interface IsoDatePickerProps {
  /** Ngày dạng yyyy-MM-dd; "" hoặc null = chưa chọn. */
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Cho xoá ngày đã chọn (ô không bắt buộc). */
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  "aria-label": string;
  className?: string;
}

/** DatePicker của kit cho form lưu ngày dạng chuỗi yyyy-MM-dd (khớp zIsoDate); chọn xong coi như rời ô. */
export function IsoDatePicker({ value, onChange, onBlur, clearable, disabled, placeholder, className, ...rest }: IsoDatePickerProps) {
  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  return (
    <div className="flex items-center gap-1.5">
      <DatePicker
        value={selected}
        onChange={(date) => {
          onChange(date ? format(date, "yyyy-MM-dd") : "");
          onBlur?.();
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        aria-label={rest["aria-label"]}
      />
      {clearable && selected && !disabled && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Xoá ${rest["aria-label"].toLowerCase()}`} onClick={() => { onChange(""); onBlur?.(); }}>
          <X />
        </Button>
      )}
    </div>
  );
}
