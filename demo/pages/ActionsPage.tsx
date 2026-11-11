import { ChevronDown, Download, FilePlus2, Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { initialsOf } from "@/lib/initials";
import { DemoPage, Example } from "../parts";

const PEOPLE = ["Nguyễn Văn Anh", "Trần Thị Bích Ngọc", "Quản trị viên (đủ mọi quyền)", "Giảng viên Khoa Sư phạm Toán - Tin"];

export function ActionsPage() {
  return (
    <DemoPage title="Nút và nhãn" description="Nút bấm, nhãn trạng thái, menu, gợi ý và avatar.">
      <Example title="Button: kiểu" description="Nút chính có bóng nhẹ và vệt sáng phía trên (bản vá RIS)." items={["button"]}>
        <Button>
          <Plus /> Thêm mới
        </Button>
        <Button variant="outline">Xuất Excel</Button>
        <Button variant="secondary">Phụ</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Liên kết</Button>
        <Button variant="destructive">
          <Trash2 /> Xoá
        </Button>
        <Button disabled>Đang khoá</Button>
      </Example>

      <Example title="Button: kích thước" items={["button"]}>
        <Button size="lg">Lớn</Button>
        <Button>Mặc định</Button>
        <Button size="sm">Nhỏ</Button>
        <Button size="xs" variant="outline">
          Rất nhỏ
        </Button>
        <Button size="toolbar" variant="outline">
          <Download /> Thanh công cụ
        </Button>
        <Button size="icon" variant="outline" aria-label="Sửa">
          <Pencil />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Xoá">
          <Trash2 />
        </Button>
        <Button disabled>
          <Spinner /> Đang lưu…
        </Button>
      </Example>

      <Example title="Badge" description="Nhãn trạng thái; thêm dot để có chấm tròn đầu nhãn." items={["badge"]}>
        <Badge>Mặc định</Badge>
        <Badge variant="secondary">Nháp</Badge>
        <Badge variant="info" dot>
          Chờ duyệt
        </Badge>
        <Badge variant="success" dot>
          Đã duyệt
        </Badge>
        <Badge variant="warning" dot>
          Trả lại
        </Badge>
        <Badge variant="destructive">Từ chối</Badge>
        <Badge variant="violet">Đặc biệt</Badge>
        <Badge variant="outline">Outline</Badge>
      </Example>

      <Example title="Dropdown menu" items={["dropdown-menu", "button"]}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Thao tác <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Công trình</DropdownMenuLabel>
            <DropdownMenuItem>
              <FilePlus2 /> Tạo bản sao
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download /> Tải PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 /> Xoá
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Example>

      <Example title="Tooltip và phím tắt" items={["tooltip", "kbd"]}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Rê chuột vào đây</Button>
          </TooltipTrigger>
          <TooltipContent>Gợi ý ngắn cho nút</TooltipContent>
        </Tooltip>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <span className="text-body text-muted-foreground">mở ô tìm kiếm</span>
      </Example>

      <Example
        title="Avatar và chữ viết tắt"
        description="initialsOf lấy chữ đầu của 2 chữ cuối, bỏ phần trong ngoặc và ký hiệu như “-”."
        items={["avatar", "initials"]}
      >
        {PEOPLE.map((p) => (
          <span key={p} className="flex items-center gap-2 text-body">
            <Avatar>
              <AvatarFallback>{initialsOf(p)}</AvatarFallback>
            </Avatar>
            {p}
          </span>
        ))}
      </Example>
    </DemoPage>
  );
}
