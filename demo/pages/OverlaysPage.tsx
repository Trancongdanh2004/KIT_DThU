import { CircleAlert, CircleCheck, Info, PanelRight, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popconfirm } from "@/components/ui/popconfirm";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { DemoPage, Example } from "../parts";

export function OverlaysPage() {
  return (
    <DemoPage title="Hộp thoại, thông báo" description="Dialog, Sheet, AlertDialog, Popconfirm, toast và banner. Không dùng alert()/confirm() của trình duyệt.">
      <Example title="Dialog có form" items={["dialog", "field", "input", "textarea"]}>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Mở hộp thoại</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trả lại hồ sơ</DialogTitle>
              <DialogDescription>Người khai sẽ nhận được lý do và sửa lại.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="d-title">Tiêu đề</FieldLabel>
                <Input id="d-title" defaultValue="Thiếu minh chứng" />
              </Field>
              <Field>
                <FieldLabel htmlFor="d-reason">Lý do</FieldLabel>
                <Textarea id="d-reason" placeholder="Nêu rõ cần bổ sung gì…" />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Huỷ</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toast.success("Đã trả lại hồ sơ")}>Gửi</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example title="AlertDialog và Popconfirm" description="Xác nhận hành động khó hoàn tác." items={["alert-dialog", "popconfirm"]}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Xoá công trình</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá công trình này?</AlertDialogTitle>
              <AlertDialogDescription>Công trình và minh chứng đi kèm sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.success("Đã xoá")}>Xoá</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Popconfirm title="Gỡ tác giả này?" description="Có thể thêm lại sau." okVariant="destructive" okText="Gỡ" onConfirm={() => void toast.info("Đã gỡ tác giả")}>
          <Button variant="outline">Popconfirm</Button>
        </Popconfirm>
      </Example>

      <Example title="Sheet" description="Ngăn kéo bên phải cho chi tiết hoặc bộ lọc nâng cao." items={["sheet"]}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <PanelRight /> Mở sheet
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Chi tiết nhà khoa học</SheetTitle>
              <SheetDescription>Thông tin tóm tắt</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 text-body">
              <p>Nguyễn Văn Anh, Khoa Sư phạm Toán - Tin</p>
              <p className="text-muted-foreground">12 công trình, 3 đề tài</p>
            </div>
            <SheetFooter>
              <Button>Xem hồ sơ</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Example>

      <Example title="Toast" items={["toaster"]}>
        <Button variant="outline" onClick={() => toast.success("Đã lưu thay đổi")}>
          <CircleCheck /> Thành công
        </Button>
        <Button variant="outline" onClick={() => toast.info("Có 3 hồ sơ chờ duyệt")}>
          <Info /> Thông tin
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Bạn đã đăng xuất ở tab khác")}>
          <TriangleAlert /> Cảnh báo
        </Button>
        <Button variant="outline" onClick={() => toast.error("Không lưu được, vui lòng thử lại")}>
          <CircleAlert /> Lỗi
        </Button>
      </Example>

      <Example title="Banner (Alert)" items={["alert"]} className="flex-col items-stretch">
        <Alert variant="info">
          <Info />
          <AlertTitle>Năm học 2025-2026 đang mở</AlertTitle>
          <AlertDescription>Hạn kê khai đến 31/07/2026.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CircleCheck />
          <AlertDescription>Hồ sơ đã được duyệt.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <TriangleAlert />
          <AlertDescription>Công trình chưa có năm học, sẽ không vào báo cáo.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>Năm học 2017-2018 đã khoá, không thể duyệt.</AlertDescription>
        </Alert>
      </Example>
    </DemoPage>
  );
}
