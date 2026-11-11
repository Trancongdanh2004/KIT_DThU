import { Copy } from "lucide-react";
import themeCss from "@/styles/theme.css?raw";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CommandLine, DemoPage, addCommand } from "../parts";

interface Token {
  name: string;
  value: string;
}

/** Custom properties of the first `selector { … }` block in theme.css. */
function tokensOf(selector: string): Token[] {
  const start = themeCss.indexOf(`${selector} {`);
  if (start < 0) return [];
  const body = themeCss.slice(themeCss.indexOf("{", start) + 1, themeCss.indexOf("}", start));
  return [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => ({ name: m[1], value: m[2].replace(/\/\*.*?\*\//g, "").trim() }));
}

const isColor = (v: string) => /^(#|rgb|hsl|oklch|color-mix)/.test(v);

const GROUPS: { title: string; description: string; match: (name: string) => boolean }[] = [
  { title: "Màu nền tảng", description: "Nền, chữ, màu chính và các bề mặt.", match: (n) => /^--(background|foreground|card|popover|primary|secondary|muted|subtle|accent|frame)/.test(n) },
  { title: "Trạng thái", description: "Lỗi, cảnh báo, thành công, thông tin.", match: (n) => /^--(destructive|warning|success|info)/.test(n) },
  { title: "Viền và ô nhập", description: "Viền ô nhập được làm nhạt hơn DThU Kit theo yêu cầu của RIS.", match: (n) => /^--(border|input|ring|field)/.test(n) },
  { title: "Sidebar", description: "Thanh menu bên trái của khu nội bộ.", match: (n) => n.startsWith("--sidebar") },
  { title: "Biểu đồ", description: "Thứ tự màu cho chuỗi dữ liệu.", match: (n) => n.startsWith("--chart") },
  { title: "Thương hiệu và bề mặt riêng RIS", description: "Token RIS thêm vào so với DThU Kit.", match: (n) => /^--(brand|header|footer|warm|carousel|date|page)/.test(n) },
];

const TYPE_SCALE = [
  { token: "display", cls: "text-display" },
  { token: "heading", cls: "text-heading" },
  { token: "title", cls: "text-title" },
  { token: "lead", cls: "text-lead" },
  { token: "base", cls: "text-base" },
  { token: "body", cls: "text-body" },
  { token: "meta", cls: "text-meta" },
  { token: "micro", cls: "text-micro" },
];

const RADII = [
  { label: "rounded-sm", cls: "rounded-sm" },
  { label: "rounded-md (ô nhập, nút)", cls: "rounded-md" },
  { label: "rounded-lg", cls: "rounded-lg" },
  { label: "rounded-xl (card)", cls: "rounded-xl" },
  { label: "rounded-full", cls: "rounded-full" },
];

function Swatch({ token }: { token: Token }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`var(${token.name})`);
      toast.success(`Đã sao chép var(${token.name})`);
    } catch {
      toast.error("Không sao chép được");
    }
  };
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border p-2">
      {/* The swatch shows the token itself, so its colour has to come from the variable at runtime. */}
      <span className="size-10 shrink-0 rounded-md border" style={{ background: `var(${token.name})` }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-meta font-semibold">{token.name}</span>
        <span className="block truncate font-mono text-micro text-muted-foreground">{token.value}</span>
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-xs" variant="ghost" aria-label={`Sao chép ${token.name}`} onClick={() => void copy()}>
            <Copy />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sao chép var({token.name})</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ThemePage() {
  const light = tokensOf(":root").filter((t) => isColor(t.value));
  const used = new Set<string>();

  return (
    <DemoPage title="Theme" description="Token đọc trực tiếp từ src/styles/theme.css. Bật chế độ tối ở menu tài khoản (góc phải) để xem bảng màu tối.">
      <Card>
        <CardHeader>
          <CardTitle>Cài theme</CardTitle>
          <CardDescription>Chỉ lấy token màu, font và custom variant <code>dark</code>/<code>coarse</code>; <code>app-css</code> thêm CSS gốc của RIS.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CommandLine command={addCommand(["theme"])} />
          <CommandLine command={`${addCommand(["app-css"])} --overwrite`} />
        </CardContent>
      </Card>

      {GROUPS.map((g) => {
        const tokens = light.filter((t) => !used.has(t.name) && g.match(t.name));
        tokens.forEach((t) => used.add(t.name));
        if (!tokens.length) return null;
        return (
          <Card key={g.title}>
            <CardHeader>
              <CardTitle>{g.title}</CardTitle>
              <CardDescription>{g.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {tokens.map((t) => (
                <Swatch key={t.name} token={t} />
              ))}
            </CardContent>
          </Card>
        );
      })}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thang cỡ chữ</CardTitle>
            <CardDescription>Font Roboto; dùng class <code>text-*</code> thay vì cỡ chữ tự đặt.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {TYPE_SCALE.map((t) => (
              <div key={t.token} className="flex items-baseline gap-3 border-b pb-2 last:border-0">
                <code className="w-28 shrink-0 font-mono text-meta text-muted-foreground">{t.cls}</code>
                <span className={`${t.cls} min-w-0 truncate`}>Cơ sở dữ liệu KH&CN</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bo góc và bóng</CardTitle>
            <CardDescription>Ô nhập và nút bo 6px, card bo 14–16px.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RADII.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2 text-center">
                <span className={`${r.cls} size-16 border-2 border-primary bg-accent`} />
                <code className="font-mono text-micro text-muted-foreground">{r.label}</code>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DemoPage>
  );
}
