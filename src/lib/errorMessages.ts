// ProblemDetails {code} → câu thông báo tiếng Việt dùng chung toàn ứng dụng
// (theo frontend · lớp gọi API: một bảng duy nhất cho mọi màn hình).

export interface ProblemLike {
  code?: string;
  title?: string;
  status?: number;
  /** Máy chủ trả { field: "câu lỗi" }; api.client chuẩn hoá thành mảng nhưng nhiều nơi nhận thẳng thân lỗi nên chấp nhận cả hai. */
  errors?: Record<string, string[] | string>;
  lockoutEnd?: string;
  retryAfterSeconds?: number;
  duplicates?: { id: string; title: string; similarity: number }[];
}

/** "5 phút", "1 phút 30 giây", "40 giây" từ số giây chờ (làm tròn lên theo giây). */
export function waitText(seconds: number): string {
  const total = Math.max(1, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return `${rest} giây`;
  return rest === 0 ? `${minutes} phút` : `${minutes} phút ${rest} giây`;
}

/** Một câu cho mọi lỗi 429: lý do của máy chủ (nếu có) + thời gian chờ theo Retry-After của chính máy chủ. */
function tooManyRequests(p?: ProblemLike): string {
  const reason = p?.title && p.code === "ris.too_many_requests" ? p.title : "Bạn thao tác quá nhanh.";
  return `${reason} Thử lại sau ${p?.retryAfterSeconds ? waitText(p.retryAfterSeconds) : "ít phút"}.`;
}

/** Tài khoản bị khoá tạm: số phút còn lại (làm tròn lên) và giờ mở khoá. */
export function lockoutText(lockoutEnd?: string): string {
  const base = "Tài khoản tạm khoá do nhập sai nhiều lần.";
  const end = lockoutEnd ? new Date(lockoutEnd) : null;
  if (!end || Number.isNaN(end.getTime())) return `${base} Thử lại sau ít phút.`;
  const minutes = Math.max(1, Math.ceil((end.getTime() - Date.now()) / 60_000));
  const at = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).formatToParts(end);
  const part = (type: string) => at.find((x) => x.type === type)?.value ?? "";
  return `${base} Thử lại sau ${minutes} phút (lúc ${part("hour")}:${part("minute")} ${part("day")}/${part("month")}).`;
}

const MESSAGES: Record<string, string | ((p?: ProblemLike) => string)> = {
  "network.error": "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
  "ris.unauthenticated": "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
  "ris.forbidden": "Bạn không có quyền làm việc này.",
  "ris.not_found": "Không tìm thấy dữ liệu, có thể đã bị xoá.",
  "ris.invalid_data": "Dữ liệu chưa hợp lệ. Xem lỗi ở từng ô.",
  "ris.invalid_status": "Không làm được ở trạng thái hiện tại. Tải lại trang để xem trạng thái mới.",
  "ris.locked": "Bản ghi đã khoá, không sửa được.",
  "ris.academic_year_locked": "Năm học đã khoá, không sửa được.",
  "ris.precondition_required": "Thiếu thông tin phiên bản của bản ghi. Tải lại trang rồi thử lại.",
  "ris.version_conflict": "Bản này vừa được sửa ở nơi khác. Tải lại để xem bản mới.",
  "ris.duplicate": "Dữ liệu này đã tồn tại.",
  "ris.invalid_credentials": "Email/mã cán bộ hoặc mật khẩu không đúng.",
  "ris.account_locked": (p) => lockoutText(p?.lockoutEnd),
  "ris.account_disabled": "Tài khoản đã ngừng hoạt động. Liên hệ P.KH&CN nếu cần mở lại.",
  "ris.account_not_activated":
    "Tài khoản chưa kích hoạt. Mở thư kích hoạt hoặc dùng “Quên mật khẩu” để nhận link mới.",
  "ris.invalid_2fa_code": "Mã xác thực không đúng hoặc đã hết hạn.",
  "ris.invalid_token": "Link đã hết hạn hoặc đã được dùng.",
  "ris.too_many_requests": tooManyRequests,
  "ris.doi_lookup_unavailable": "Chưa tra được DOI lúc này. Bạn vẫn nhập tay được.",
  "ris.pdf_unavailable": "Chưa tạo được tệp PDF lúc này. Bạn vẫn tải được bản DOCX.",
  "ris.file_too_large": "Tệp quá dung lượng cho phép.",
  "ris.unsupported_file_type": "Loại tệp không được phép.",
  "ris.duplicate_contributor": "Người này đã có trong danh sách tác giả.",
  "ris.missing_profile": "Hồ sơ chưa đủ thông tin để làm việc này.",
  "ris.email_taken": "Email này đã có tài khoản.",
  "ris.cannot_lock_self": "Không thể tự thao tác trên tài khoản của chính mình.",
  "ris.cannot_change_own_roles": "Không tự đổi vai trò của chính mình.",
  "ris.cannot_escalate_own_role": "Không tự thêm quyền cho vai trò mà bạn đang giữ.",
  "ris.last_admin": "Đây là tài khoản quản trị cuối cùng đang hoạt động; thêm quản trị khác trước.",
  "ris.duplicate_external_person": "Đã có người này trong danh sách chuyên gia ngoài trường (trùng email hoặc ORCID). Chọn người đó thay vì tạo mới.",
  "ris.self_approval": "Bạn có tên trong công trình này nên không tự duyệt hoặc trả lại được.",
  "ris.password_required": "Bạn cần đặt mật khẩu trước khi làm việc này.",
  "ris.staff_code_taken": "Mã cán bộ này đã có tài khoản.",
  "ris.duplicate_staff_code": "Mã cán bộ bị lặp trong tệp.",
  "ris.org_unit_not_found": "Mã đơn vị không có trong danh mục đơn vị.",
  "ris.invalid_email_domain": "Email không đúng miền @dthu.edu.vn.",
  "ris.import_too_many_rows": "Tệp quá số dòng cho phép.",
  "ris.org_unit_has_children": "Ngừng dùng các đơn vị con trước.",
};

export function errorMessage(error: unknown): string {
  const problem = (error ?? {}) as ProblemLike;
  if (problem instanceof Error && !("code" in problem)) return problem.message;
  const code = problem.code ?? (problem.status === 401 ? "ris.unauthenticated" : problem.status === 403 ? "ris.forbidden" : undefined);
  if (code) {
    const entry = MESSAGES[code];
    if (typeof entry === "function") return entry(problem);
    if (entry) return entry;
  }
  // Lỗi HTTP không kèm ProblemDetails (api.client tạo ra code "ris.http_error"): đặt câu theo mã trạng thái.
  if (problem.status === 429) return tooManyRequests(problem);
  if (problem.code === "ris.http_error") {
    const byStatus: Record<number, string> = {
      400: "Yêu cầu không hợp lệ.",
      401: "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
      403: "Bạn không có quyền làm việc này.",
      404: "Không tìm thấy dữ liệu.",
      412: "Dữ liệu vừa được thay đổi ở nơi khác. Tải lại để xem bản mới.",
      428: "Thiếu thông tin phiên bản của bản ghi. Tải lại trang rồi thử lại.",
      409: "Dữ liệu vừa được thay đổi ở nơi khác. Tải lại để xem bản mới.",
      500: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.",
      502: "Máy chủ chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
      503: "Máy chủ chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
      504: "Máy chủ phản hồi quá chậm. Vui lòng thử lại.",
    };
    const text = problem.status ? byStatus[problem.status] : undefined;
    if (text) return text;
  }
  // Gom lỗi theo trường nếu máy chủ trả errors
  if (problem.errors) {
    const parts = Object.values(problem.errors).flat();
    if (parts.length) return parts.join(" ");
  }
  return problem.title ?? "Có lỗi xảy ra. Vui lòng thử lại.";
}

/** Gom câu lỗi theo trường từ ProblemDetails (errors: {field: [msg]}). */
export function fieldErrors(error: unknown): Record<string, string> {
  const problem = (error ?? {}) as ProblemLike;
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(problem.errors ?? {})) {
    out[field] = Array.isArray(messages) ? messages.join(" ") : String(messages);
  }
  return out;
}