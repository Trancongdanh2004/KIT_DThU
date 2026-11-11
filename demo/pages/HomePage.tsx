import { ArrowRight, Blocks, Boxes, LayoutTemplate, Palette, Wrench } from "lucide-react";
import { useNavigate } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { CommandLine, DemoPage, KIT_BASE_URL, addCommand } from "../parts";
import { countOf } from "../registry";

const COMPONENTS_JSON = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/styles/app.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
}`;

const FONT_LINK = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />`;

export function HomePage() {
  const navigate = useNavigate();
  const sections = [
    { icon: <Palette />, title: "Theme", text: "Bảng màu, cỡ chữ, bo góc và bóng đổ của RIS.", to: "/theme" },
    { icon: <Boxes />, title: "Thành phần", text: "Nút, ô nhập, hộp thoại, bảng… đã chỉnh theo RIS.", to: "/thanh-phan/nut" },
    { icon: <Blocks />, title: "Component RIS", text: "Thanh lọc một hàng, bảng phân trang server, xác nhận…", to: "/ris" },
    { icon: <LayoutTemplate />, title: "Block", text: "Trang đăng nhập, trang lỗi, dashboard ghép sẵn.", to: "/block" },
  ];

  return (
    <DemoPage
      title="RIS Kit"
      description="Bộ giao diện của CSDL KH&CN – ĐH Đồng Tháp, đóng gói thành registry shadcn để dùng lại."
      actions={<Button onClick={() => navigate("/danh-muc")}>Danh mục item <ArrowRight /></Button>}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="Component UI" value={countOf("registry:ui")} />
        <StatTile label="Nhóm block" value={countOf("registry:block")} />
        <StatTile label="Component RIS" value={countOf("registry:component")} />
        <StatTile label="Thư viện, hook" value={countOf("registry:lib") + countOf("registry:hook")} />
        <StatTile label="Theme, CSS" value={countOf("registry:style")} className="col-span-2 md:col-span-1" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map((s) => (
          <Card key={s.to}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 [&_svg]:size-5 [&_svg]:text-primary">
                {s.icon}
                {s.title}
              </CardTitle>
              <CardDescription>{s.text}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => navigate(s.to)}>
                Xem <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cài vào dự án mới</CardTitle>
          <CardDescription>Dự án cần React 19, Tailwind CSS v4, thư mục <code>src/</code> và alias <code>@/*</code> → <code>./src/*</code>.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-body">
          <div className="flex flex-col gap-2">
            <p><Badge variant="info">Bước 1</Badge> Tạo <code>components.json</code> ở gốc dự án:</p>
            <pre className="overflow-x-auto rounded-md border bg-secondary p-3 font-mono text-meta">{COMPONENTS_JSON}</pre>
          </div>
          <div className="flex flex-col gap-2">
            <p><Badge variant="info">Bước 2</Badge> Thêm font Roboto vào <code>&lt;head&gt;</code>:</p>
            <CommandLine command={FONT_LINK} />
          </div>
          <div className="flex flex-col gap-2">
            <p><Badge variant="info">Bước 3</Badge> Cài toàn bộ kit (ghi đè <code>src/styles/app.css</code>):</p>
            <CommandLine command={`${addCommand(["all"])} --overwrite`} />
            <p className="text-muted-foreground">Hoặc chỉ cài phần cần dùng; các phụ thuộc được kéo theo tự động:</p>
            <CommandLine command={addCommand(["theme", "button", "filter-bar"])} />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Wrench />
        <AlertTitle>Registry đang trỏ tới {KIT_BASE_URL}</AlertTitle>
        <AlertDescription>
          Khi đưa kit lên host khác, build lại bằng <code>KIT_BASE_URL=&lt;địa chỉ&gt; npm run build</code>, vì các item tham chiếu nhau bằng URL tuyệt đối.
          Sau mỗi lần sửa giao diện ở RIS, chạy <code>npm run release</code> để kit và trang này cập nhật theo.
        </AlertDescription>
      </Alert>
    </DemoPage>
  );
}
