import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { NumberInput } from "@/components/ui/number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { DemoPage, Example } from "../parts";

const UNITS = [
  { value: "sptt", label: "Khoa Sư phạm Toán - Tin" },
  { value: "kt", label: "Khoa Kinh tế" },
  { value: "nn", label: "Khoa Ngoại ngữ" },
  { value: "cntt", label: "Phòng Công nghệ thông tin" },
  { value: "khcn", label: "Phòng Khoa học và Công nghệ" },
];

export function FormsPage() {
  const [unit, setUnit] = useState<string>();
  const [units, setUnits] = useState<string[]>(["sptt"]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [year, setYear] = useState("2025-2026");

  return (
    <DemoPage
      title="Nhập liệu"
      description="Ô nhập có viền nhạt (--field-border) lúc nghỉ, đậm lên khi rê chuột và có quầng màu khi focus. Không dùng thẻ native."
    >
      <Example title="Ô nhập văn bản" items={["input", "textarea", "field", "label"]} className="block">
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="f-title">Tên công trình</FieldLabel>
            <Input id="f-title" placeholder="Nhập tên công trình" />
            <FieldDescription>Viết đúng như trên bài báo.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel htmlFor="f-doi">DOI</FieldLabel>
            <Input id="f-doi" defaultValue="10.1000/abc" aria-invalid />
            <FieldError>DOI không đúng định dạng</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="f-disabled">Mã cán bộ</FieldLabel>
            <Input id="f-disabled" value="SPTT002" disabled readOnly />
          </Field>
          <Field>
            <FieldLabel htmlFor="f-note">Ghi chú</FieldLabel>
            <Textarea id="f-note" placeholder="Ghi chú thêm…" />
          </Field>
        </FieldGroup>
      </Example>

      <Example title="Chọn giá trị" description="Select cho danh sách ngắn; Combobox/MultiSelect cho danh sách dài cần tìm." items={["select", "combobox", "multi-select"]} className="block">
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>Năm học</FieldLabel>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2023-2024", "2024-2025", "2025-2026", "2026-2027"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Đơn vị</FieldLabel>
            <Combobox options={UNITS} value={unit} onChange={setUnit} placeholder="Chọn đơn vị" aria-label="Đơn vị" />
          </Field>
          <Field>
            <FieldLabel>Nhiều đơn vị</FieldLabel>
            <MultiSelect options={UNITS} value={units} onValueChange={setUnits} aria-label="Nhiều đơn vị" />
          </Field>
        </FieldGroup>
      </Example>

      <Example title="Ngày, số, thẻ" items={["date-picker", "number-input", "tag-input"]} className="block">
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>Ngày công bố</FieldLabel>
            <DatePicker value={date} onChange={setDate} />
          </Field>
          <Field>
            <FieldLabel htmlFor="f-pages">Số trang</FieldLabel>
            <NumberInput id="f-pages" defaultValue={12} min={1} />
          </Field>
          <Field>
            <FieldLabel htmlFor="f-tags">Từ khoá</FieldLabel>
            <TagInput id="f-tags" defaultValue={["giáo dục", "toán học"]} placeholder="Nhập rồi Enter" />
          </Field>
        </FieldGroup>
      </Example>

      <Example title="Lựa chọn" items={["checkbox", "radio-group", "switch", "segmented-control"]}>
        <Label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Tác giả chính
        </Label>
        <RadioGroup defaultValue="trong" className="flex gap-4">
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="trong" /> Trong nước
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="ngoai" /> Quốc tế
          </Label>
        </RadioGroup>
        <Label className="flex items-center gap-2">
          <Switch defaultChecked /> Hiện trên trang công khai
        </Label>
        <SegmentedControl
          defaultValue="mine"
          aria-label="Phạm vi"
          options={[
            { value: "mine", label: "Tôi khai" },
            { value: "named", label: "Có tên tôi" },
            { value: "all", label: "Tất cả" },
          ]}
        />
      </Example>

      <Example title="Tải tệp" items={["file-upload"]} className="block">
        <FileUpload accept=".pdf,.docx" maxSize={10 * 1024 * 1024} description="PDF hoặc DOCX, tối đa 10 MB" />
      </Example>
    </DemoPage>
  );
}
