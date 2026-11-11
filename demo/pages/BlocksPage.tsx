import { useState } from "react";
import { LineChart, LoginPage, StatCard } from "@/components/blocks/dashboard";
import { ErrorPage, MaintenancePage } from "@/components/blocks/system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toaster";
import { CommandLine, DemoPage, addCommand } from "../parts";

const BLOCKS = [
  { id: "login", label: "Đăng nhập", item: "block-dashboard" },
  { id: "dashboard", label: "Dashboard", item: "block-dashboard" },
  { id: "error", label: "Trang lỗi", item: "block-system" },
  { id: "maintenance", label: "Bảo trì", item: "block-system" },
];

/** Full-page blocks are previewed inside a fixed frame instead of taking over the showcase. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="relative h-[640px] overflow-auto rounded-lg border bg-background [&>*]:min-h-full">{children}</div>;
}

export function BlocksPage() {
  const [tab, setTab] = useState(BLOCKS[0].id);
  const current = BLOCKS.find((b) => b.id === tab) ?? BLOCKS[0];

  return (
    <DemoPage title="Block" description="Trang ghép sẵn từ component của kit. Mỗi nhóm block cài bằng một lệnh.">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {BLOCKS.map((b) => (
            <TabsTrigger key={b.id} value={b.id}>
              {b.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <CommandLine command={addCommand([current.item])} className="mt-3" />

        <TabsContent value="login" className="mt-3">
          <Frame>
            <LoginPage
              org="Trường Đại học Đồng Tháp"
              headline="Cơ sở dữ liệu Khoa học và Công nghệ"
              description="Quản lý công trình, đề tài và lý lịch khoa học của cán bộ, giảng viên."
              features={[
                { title: "Kê khai một lần", description: "Dùng lại cho lý lịch và báo cáo" },
                { title: "Duyệt trực tuyến", description: "Theo dõi trạng thái từng hồ sơ" },
              ]}
              footer="© Trường Đại học Đồng Tháp"
              onSubmit={(v) => toast.info(`Đăng nhập thử: ${v.username || "(trống)"}`)}
              onForgot={() => toast.info("Quên mật khẩu")}
            />
          </Frame>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-3 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Công trình đã duyệt" value="1.248" description="Năm học 2025-2026" />
            <StatCard label="Chờ duyệt" value="27" unit="hồ sơ" description="Cần xử lý trong tuần" highlight />
            <StatCard label="Đề tài đang thực hiện" value="64" />
            <StatCard label="Nhà khoa học" value="356" reference="Cập nhật 09/11/2026" />
          </div>
          <LineChart
            labels={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]}
            series={[
              { id: "bai-bao", label: "Bài báo", values: [12, 18, 15, 22, 30, 28, 35, 31, 40, 44, 38, 47] },
              { id: "de-tai", label: "Đề tài", values: [3, 4, 6, 5, 8, 7, 9, 11, 10, 12, 13, 15] },
            ]}
            ariaLabel="Số công trình theo tháng"
          />
        </TabsContent>

        <TabsContent value="error" className="mt-3">
          <Frame>
            <ErrorPage status="404" path="/khcn/cong-trinh/abc" onHome={() => toast.info("Về trang chủ")} onBack={() => toast.info("Quay lại")} />
          </Frame>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-3">
          <Frame>
            <MaintenancePage startsAt="22:00 09/11/2026" endsAt="02:00 10/11/2026" progress={60} email="khcn@dthu.edu.vn" onRetry={() => toast.info("Thử lại")} />
          </Frame>
        </TabsContent>
      </Tabs>
    </DemoPage>
  );
}
