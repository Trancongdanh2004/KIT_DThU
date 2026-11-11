import { BookOpen, CircleCheck, FileText, Inbox, Send, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Result } from "@/components/ui/result";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { Stepper } from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { DemoPage, Example } from "../parts";

const STEPS = [
  { id: "draft", label: "Khai báo", description: "Giảng viên nhập" },
  { id: "confirm", label: "Xác nhận", description: "Đồng tác giả" },
  { id: "approve", label: "Duyệt", description: "Phòng KH&CN" },
  { id: "public", label: "Công khai" },
];

export function DataDisplayPage() {
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(3);

  return (
    <DemoPage title="Hiển thị dữ liệu" description="Chỉ số, danh sách mô tả, tiến trình, trạng thái rỗng và tab.">
      <Example title="StatTile" items={["stat-tile"]} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Công trình" value="1.248" delta={12.5} deltaLabel="so với năm trước" icon={<BookOpen />} />
        <StatTile label="Nhà khoa học" value="356" delta={3.1} icon={<Users />} />
        <StatTile label="Chờ duyệt" value="27" delta={-8} goodDirection="down" icon={<FileText />} />
        <StatTile label="Đang tải" value="" loading />
      </Example>

      <Example title="Stepper" items={["stepper"]} className="block">
        <Stepper steps={STEPS} activeStep={step} onStepChange={setStep} clickable />
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title="DescriptionList" items={["description-list"]} className="block">
          <DescriptionList columns={2}>
            <DescriptionItem term="Họ tên">Nguyễn Văn Anh</DescriptionItem>
            <DescriptionItem term="Mã cán bộ">SPTT002</DescriptionItem>
            <DescriptionItem term="Đơn vị">Khoa Sư phạm Toán - Tin</DescriptionItem>
            <DescriptionItem term="Học vị">Tiến sĩ</DescriptionItem>
            <DescriptionItem term="Hướng nghiên cứu" span>
              Giáo dục toán học, ứng dụng CNTT trong dạy học
            </DescriptionItem>
          </DescriptionList>
        </Example>
        <Example title="Timeline" items={["timeline"]} className="block">
          <Timeline>
            <TimelineItem title="Đã duyệt" time="09/11/2026 10:24" status="success" icon={<CircleCheck />} description="Phòng KH&CN duyệt hồ sơ" />
            <TimelineItem title="Gửi duyệt" time="08/11/2026 16:02" status="primary" icon={<Send />} />
            <TimelineItem title="Tạo nháp" time="08/11/2026 15:40" />
          </Timeline>
        </Example>
      </div>

      <Example title="Progress và Skeleton" items={["progress", "skeleton"]} className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Progress value={72} />
          <Progress value={45} tone="success" />
          <Progress value={30} tone="warning" striped />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Example>

      <Example title="Tabs" items={["tabs"]} className="block">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="authors">Tác giả</TabsTrigger>
            <TabsTrigger value="files">Minh chứng</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="pt-3 text-body">Nội dung tab Thông tin.</TabsContent>
          <TabsContent value="authors" className="pt-3 text-body">Nội dung tab Tác giả.</TabsContent>
          <TabsContent value="files" className="pt-3 text-body">Nội dung tab Minh chứng.</TabsContent>
        </Tabs>
        <Tabs defaultValue="a" className="mt-4">
          <TabsList variant="line">
            <TabsTrigger value="a">Kiểu line</TabsTrigger>
            <TabsTrigger value="b">Tab thứ hai</TabsTrigger>
          </TabsList>
        </Tabs>
      </Example>

      <Example title="Phân trang" items={["pagination"]}>
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title="EmptyState" items={["empty-state"]} className="block">
          <EmptyState icon={<Inbox />} title="Chưa có công trình" description="Công trình bạn khai sẽ hiện ở đây." action={<Button size="sm">Khai công trình</Button>} />
        </Example>
        <Example title="Result" items={["result"]} className="block">
          <Result status="success" title="Gửi duyệt thành công" subTitle="Phòng KH&CN sẽ xem xét trong 3 ngày làm việc." />
        </Example>
      </div>
    </DemoPage>
  );
}
