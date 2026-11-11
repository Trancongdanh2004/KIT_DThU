import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ChoiceSelect } from "@/components/app/choice-select";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { ErrorView } from "@/components/app/ErrorView";
import { FilterBar } from "@/components/app/FilterBar";
import { HintTooltip } from "@/components/app/HintTooltip";
import { IsoDatePicker } from "@/components/app/IsoDatePicker";
import { RowActions } from "@/components/app/RowActions";
import { ServerDataTable } from "@/components/app/ServerDataTable";
import { SessionTakenOverDialog } from "@/components/app/SessionTakenOverDialog";
import { UnsavedChangesGuard } from "@/components/app/UnsavedChangesGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { errorMessage } from "@/lib/errorMessages";
import { DemoPage, Example } from "../parts";

interface Output {
  id: string;
  title: string;
  author: string;
  year: string;
  status: "Draft" | "Pending" | "Approved" | "Returned";
}

const STATUS: Record<Output["status"], { label: string; tone: "secondary" | "info" | "success" | "warning" }> = {
  Draft: { label: "Nháp", tone: "secondary" },
  Pending: { label: "Chờ duyệt", tone: "info" },
  Approved: { label: "Đã duyệt", tone: "success" },
  Returned: { label: "Trả lại", tone: "warning" },
};

const TITLES = [
  "Ứng dụng GeoGebra trong dạy học hình học",
  "Phát triển năng lực tự học của sinh viên",
  "Mô hình học máy dự báo kết quả học tập",
  "Đánh giá chất lượng đào tạo theo chuẩn đầu ra",
  "Chuyển đổi số trong quản lý khoa học",
];
const AUTHORS = ["Nguyễn Văn Anh", "Trần Thị Bích Ngọc", "Lê Minh Tâm", "Phạm Quốc Huy"];
const STATUSES = Object.keys(STATUS) as Output["status"][];
const ROWS: Output[] = Array.from({ length: 37 }, (_, i) => ({
  id: String(i + 1),
  title: `${TITLES[i % TITLES.length]}${i >= TITLES.length ? ` (phần ${Math.floor(i / TITLES.length) + 1})` : ""}`,
  author: AUTHORS[i % AUTHORS.length],
  year: ["2023-2024", "2024-2025", "2025-2026"][i % 3],
  status: STATUSES[i % STATUSES.length],
}));

const YEARS = ["2023-2024", "2024-2025", "2025-2026"].map((y) => ({ value: y, label: y }));
const UNITS = ["Khoa Sư phạm Toán - Tin", "Khoa Kinh tế", "Khoa Ngoại ngữ", "Khoa Nông nghiệp", "Khoa Văn hoá - Du lịch", "Khoa Giáo dục Tiểu học", "Khoa Mầm non", "Khoa Lý luận chính trị", "Phòng KH&CN"].map((u) => ({ value: u, label: u }));

function useOutputs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");
  const [author, setAuthor] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = useMemo(
    () =>
      ROWS.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          (year === "all" || r.year === year) &&
          (author === "all" || r.author === author) &&
          r.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search, status, year, author],
  );
  const reset = () => {
    setSearch("");
    setStatus("all");
    setYear("all");
    setAuthor("all");
    setPage(1);
  };
  const on = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  return { search, setSearch: on(setSearch), status, setStatus: on(setStatus), year, setYear: on(setYear), author, setAuthor: on(setAuthor), page, setPage, pageSize, setPageSize: on(setPageSize), rows, reset };
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger label={label} active={value !== "all"} className="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RisPage() {
  const s = useOutputs();
  const [unit, setUnit] = useState<string>();
  const [date, setDate] = useState<string>("2026-11-09");
  const [dirty, setDirty] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const [errorStatus, setErrorStatus] = useState<"403" | "404" | "500">("404");

  return (
    <DemoPage title="Component RIS" description="Component dùng chung do RIS viết thêm trên nền kit.">
      <Example
        title="FilterBar + ServerDataTable + RowActions"
        description="Thanh lọc luôn một hàng: thu hẹp cửa sổ để thấy bộ lọc cuối chuyển vào drawer “Bộ lọc nâng cao”. Bảng có khung chờ, trạng thái rỗng, cột thao tác ghim phải và phân trang."
        items={["filter-bar", "server-data-table", "row-actions"]}
        className="block min-w-0"
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <FilterBar
            search={
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput placeholder="Tìm công trình…" aria-label="Tìm công trình" value={s.search} onChange={(e) => s.setSearch(e.target.value)} />
              </InputGroup>
            }
            filters={[
              { id: "status", label: "Trạng thái", active: s.status !== "all", selfLabelled: true, node: <FilterSelect label="Trạng thái" value={s.status} onChange={s.setStatus} options={STATUSES.map((v) => ({ value: v, label: STATUS[v].label }))} /> },
              { id: "year", label: "Năm học", active: s.year !== "all", selfLabelled: true, node: <FilterSelect label="Năm học" value={s.year} onChange={s.setYear} options={YEARS} /> },
              { id: "author", label: "Tác giả", active: s.author !== "all", selfLabelled: true, node: <FilterSelect label="Tác giả" value={s.author} onChange={s.setAuthor} options={AUTHORS.map((a) => ({ value: a, label: a }))} /> },
            ]}
            actions={<Button size="toolbar">Khai công trình</Button>}
            onReset={s.reset}
          />
          <ServerDataTable
            label="Danh sách công trình mẫu"
            columns={[
              { id: "title", header: "Tên công trình", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { id: "author", header: "Tác giả", width: 170, hideBelow: "md", cell: (r) => r.author },
              { id: "year", header: "Năm học", width: 110, hideBelow: "lg", cell: (r) => r.year },
              { id: "status", header: "Trạng thái", width: 120, cell: (r) => <Badge variant={STATUS[r.status].tone} dot>{STATUS[r.status].label}</Badge> },
            ]}
            rows={s.rows.slice((s.page - 1) * s.pageSize, s.page * s.pageSize)}
            getRowId={(r) => r.id}
            total={s.rows.length}
            page={s.page}
            pageSize={s.pageSize}
            onPageChange={s.setPage}
            onPageSizeChange={s.setPageSize}
            minWidthClass="min-w-[640px]"
            rowActionsWidth={120}
            rowActions={(r) => (
              <RowActions
                label={r.title}
                actions={[
                  { key: "view", label: "Xem", icon: <Eye />, onSelect: () => toast.info(`Xem: ${r.title}`) },
                  r.status !== "Approved" && { key: "edit", label: "Sửa", icon: <Pencil />, onSelect: () => toast.info(`Sửa: ${r.title}`) },
                  { key: "delete", label: "Xoá", icon: <Trash2 />, destructive: true, confirm: { title: "Xoá công trình này?", description: r.title, confirmLabel: "Xoá", onConfirm: () => void toast.success("Đã xoá (giả lập)") } },
                ]}
              />
            )}
            emptyTitle="Không có công trình phù hợp"
          />
        </div>
      </Example>

      <Example title="ConfirmAction" description="Bọc một nút để hỏi lại trước khi làm; dạng hộp thoại hoặc popover." items={["confirm-action"]}>
        <ConfirmAction trigger={<Button variant="destructive">Xoá (hộp thoại)</Button>} title="Xoá hồ sơ?" description="Không thể hoàn tác." confirmLabel="Xoá" destructive onConfirm={() => void toast.success("Đã xoá")} />
        <ConfirmAction mode="popover" trigger={<Button variant="outline">Gửi duyệt (popover)</Button>} title="Gửi hồ sơ đi duyệt?" confirmLabel="Gửi" onConfirm={() => void toast.success("Đã gửi duyệt")} />
      </Example>

      <Example title="ChoiceSelect, IsoDatePicker, HintTooltip" description="ChoiceSelect tự dùng Select khi ít lựa chọn và Combobox (có tìm) khi nhiều; IsoDatePicker nhận/trả chuỗi yyyy-MM-dd." items={["choice-select", "iso-date-picker", "hint-tooltip"]} className="block">
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>Năm học (ít lựa chọn)</FieldLabel>
            <ChoiceSelect options={YEARS} value={undefined} onChange={(v) => toast.info(v)} placeholder="Chọn năm học" aria-label="Năm học" />
          </Field>
          <Field>
            <FieldLabel>Đơn vị (nhiều lựa chọn)</FieldLabel>
            <ChoiceSelect options={UNITS} value={unit} onChange={setUnit} placeholder="Chọn đơn vị" aria-label="Đơn vị" />
          </Field>
          <Field>
            <FieldLabel>Ngày (ISO: {date || "trống"})</FieldLabel>
            <IsoDatePicker value={date} onChange={setDate} clearable aria-label="Ngày" />
          </Field>
        </FieldGroup>
        <div className="mt-4">
          <HintTooltip hint="Bạn cần quyền duyệt để làm việc này">
            <Button disabled>Duyệt (rê chuột để xem lý do)</Button>
          </HintTooltip>
        </div>
      </Example>

      <Example title="error-messages" description="Đổi mã lỗi ris.* của API thành câu tiếng Việt." items={["error-messages"]} className="flex-col items-stretch">
        {["ris.version_conflict", "ris.forbidden", "ris.academic_year_locked", "ris.self_approval"].map((code) => (
          <div key={code} className="flex flex-wrap items-baseline gap-2 text-body">
            <code className="font-mono text-meta text-muted-foreground">{code}</code>
            <span>→ {errorMessage({ code })}</span>
          </div>
        ))}
      </Example>

      <Example title="UnsavedChangesGuard" description="Bật công tắc rồi bấm sang trang khác ở menu trái: hệ thống hỏi lại trước khi rời trang." items={["unsaved-changes-guard"]}>
        <Label className="flex items-center gap-2">
          <Switch checked={dirty} onCheckedChange={setDirty} /> Có thay đổi chưa lưu
        </Label>
        <UnsavedChangesGuard isDirty={() => dirty} />
      </Example>

      <Example title="SessionTakenOverDialog" description="Khoá tab khi tài khoản khác đăng nhập ở tab bên cạnh (dùng chung cookie)." items={["session-taken-over-dialog"]}>
        <Button variant="outline" onClick={() => setTakenOver(true)}>
          Mô phỏng tài khoản khác đăng nhập
        </Button>
        <SessionTakenOverDialog
          key={takenOver ? "open" : "closed"}
          account={takenOver ? { fullName: "Trưởng khoa Sư phạm Toán - Tin", email: "truongkhoa@ris.test" } : null}
          onSignOut={async () => {
            setTakenOver(false);
            toast.info("Trang thật sẽ chuyển về trang đăng nhập");
          }}
        />
      </Example>

      <Example title="ErrorView" items={["error-view"]} className="block">
        <div className="mb-3 flex gap-2">
          {(["403", "404", "500"] as const).map((c) => (
            <Button key={c} size="sm" variant={errorStatus === c ? "default" : "outline"} onClick={() => setErrorStatus(c)}>
              {c}
            </Button>
          ))}
        </div>
        <ErrorView status={errorStatus} onHome={() => toast.info("Về trang chủ")} onBack={() => toast.info("Quay lại")} onRetry={() => toast.info("Thử lại")} />
      </Example>
    </DemoPage>
  );
}
