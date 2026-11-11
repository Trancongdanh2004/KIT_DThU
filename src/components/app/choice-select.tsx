import type * as React from "react";
import { Combobox } from "~/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export interface ChoiceSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Radix Select không nhận giá trị rỗng cho mục chọn, nên mục "không chọn" dùng giá trị này rồi đổi về "". */
const EMPTY = "__empty__";
/** Quá ngưỡng này thì chuyển sang Combobox có ô tìm kiếm. */
const SEARCH_THRESHOLD = 8;

interface ChoiceSelectProps {
  options: ChoiceSelectOption[];
  /** Giá trị đang chọn; "" hoặc undefined = chưa chọn. */
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Thêm mục đầu danh sách có giá trị "" (vd. "(Không có)", "Tất cả"). */
  emptyLabel?: string;
  /** Ép dùng Combobox tìm kiếm được; mặc định tự bật khi nhiều hơn 8 mục. */
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  onBlur?: () => void;
  /** Ref của nút mở (để RHF focus vào ô lỗi đầu tiên). */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Ô chọn của kit: Select (Radix) cho danh sách ngắn, Combobox cho danh sách dài.
 * Gắn trong form RHF qua FormField + FormControl (id, aria-invalid, aria-describedby truyền xuống nút mở).
 */
export function ChoiceSelect({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
  searchable,
  disabled,
  id,
  name,
  className,
  onBlur,
  ref,
  ...aria
}: ChoiceSelectProps) {
  if (searchable ?? options.length > SEARCH_THRESHOLD) {
    const all = emptyLabel !== undefined ? [{ value: "", label: emptyLabel }, ...options] : options;
    return (
      <Combobox
        options={all}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        id={id}
        className={className}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
      />
    );
  }
  return (
    <Select
      value={value ? value : emptyLabel !== undefined ? EMPTY : ""}
      onValueChange={(v) => onChange(v === EMPTY ? "" : v)}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger ref={ref} id={id} className={className} onBlur={onBlur} {...aria}>
        <SelectValue placeholder={placeholder ?? "Chọn…"} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel !== undefined && <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
