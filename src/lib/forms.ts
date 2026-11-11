import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { errorMessage, fieldErrors } from "./errorMessages";

/**
 * Chuyển lỗi ProblemDetails `errors: { field: [msg] }` của API vào react-hook-form.
 * Tên trường của API (camelCase, có thể "contributors[0].roleCode") được thử khớp với tên trường
 * của form; trường không khớp được gom thành câu lỗi chung để hiện ở đầu form.
 *
 *   const { setError } = form;
 *   try { await save(values) } catch (e) { setBanner(applyApiErrors(e, setError)) }
 *
 * Trả về câu lỗi chung (rỗng nếu mọi lỗi đã gắn được vào ô).
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields?: readonly string[],
): string {
  const byField = fieldErrors(error);
  const known = knownFields ? new Set(knownFields.map((f) => f.toLowerCase())) : null;
  const orphan: string[] = [];
  for (const [rawName, message] of Object.entries(byField)) {
    const name = normalizeFieldName(rawName);
    if (!name || (known && !known.has(name.toLowerCase()))) {
      orphan.push(message);
      continue;
    }
    setError(name as Path<T>, { type: "server", message });
  }
  if (orphan.length > 0) return orphan.join(" ");
  // Không có lỗi theo trường → dùng câu tiếng Việt theo mã lỗi.
  return Object.keys(byField).length === 0 ? errorMessage(error) : "";
}

/** "Title" → "title"; "Contributors[0].RoleCode" → "contributors.0.roleCode" (đường dẫn của RHF). */
export function normalizeFieldName(name: string): string {
  if (!name || name === "$") return "";
  return name
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toLowerCase() + part.slice(1)))
    .join(".");
}

/* ===== zod: câu thông báo tiếng Việt ===== */

export const MIN_YEAR = 1975;
export const MAX_YEAR = 2100;

/** Chuỗi bắt buộc, đã cắt khoảng trắng: z.object({ title: zRequired("Tên công trình") }) */
export function zRequired(label = "Trường này", max?: number) {
  let s = z.string({ error: `${label} là bắt buộc` }).trim().min(1, `${label} là bắt buộc`);
  if (max) s = s.max(max, `${label} tối đa ${max} ký tự`);
  return s;
}

/** Email hợp lệ; bắt buộc trừ khi truyền { optional: true } (chuỗi rỗng được chấp nhận). */
export function zEmail(opts: { optional?: boolean; label?: string } = {}) {
  const label = opts.label ?? "Email";
  const email = z.string().trim().pipe(z.email({ error: `${label} chưa đúng định dạng` }));
  if (opts.optional) return z.union([z.literal(""), email]);
  return z.string({ error: `${label} là bắt buộc` }).trim().min(1, `${label} là bắt buộc`).pipe(email);
}

/** Năm 1975–2100. Nhận số hoặc chuỗi số (ô nhập), trả về number. */
export function zYear(label = "Năm") {
  return z.coerce
    .number({ error: `${label} phải là số` })
    .int(`${label} phải là số nguyên`)
    .min(MIN_YEAR, `${label} từ ${MIN_YEAR} trở đi`)
    .max(MAX_YEAR, `${label} không quá ${MAX_YEAR}`);
}

/** Năm không bắt buộc: ô trống → undefined. */
export function zOptionalYear(label = "Năm") {
  return z.preprocess((v) => (v === "" || v === null ? undefined : v), zYear(label).optional());
}

/** Số nguyên dương (số trang, tập…); ô trống → undefined. */
export function zOptionalPositiveInt(label = "Giá trị") {
  return z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .number({ error: `${label} phải là số` })
      .int(`${label} phải là số nguyên`)
      .positive(`${label} phải lớn hơn 0`)
      .optional(),
  );
}

/** Ngày dạng yyyy-MM-dd (giá trị input type=date / API); chuỗi rỗng được chấp nhận khi optional. */
export function zIsoDate(label = "Ngày", opts: { optional?: boolean } = {}) {
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} chưa đúng định dạng`);
  return opts.optional ? z.union([z.literal(""), date]) : date;
}
