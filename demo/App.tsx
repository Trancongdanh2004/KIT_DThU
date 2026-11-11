import { Blocks, BookOpen, Boxes, LayoutTemplate, ListTree, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { AppLayout, type AppLayoutGroup } from "@/components/blocks/app-layout";
import { AccountMenuItems } from "@/components/blocks/auth";
import { ShellIconButton } from "@/components/blocks/shell";
import { toast } from "@/components/ui/toaster";
import { BlocksPage } from "./pages/BlocksPage";
import { CatalogPage } from "./pages/CatalogPage";
import { DataDisplayPage } from "./pages/DataDisplayPage";
import { FormsPage } from "./pages/FormsPage";
import { HomePage } from "./pages/HomePage";
import { OverlaysPage } from "./pages/OverlaysPage";
import { ActionsPage } from "./pages/ActionsPage";
import { RisPage } from "./pages/RisPage";
import { ThemePage } from "./pages/ThemePage";

const NAV: AppLayoutGroup[] = [
  {
    id: "start",
    label: "Bắt đầu",
    icon: <BookOpen />,
    items: [
      { label: "Giới thiệu", to: "/" },
      { label: "Danh mục item", to: "/danh-muc" },
    ],
  },
  { id: "theme", label: "Theme", icon: <Palette />, items: [{ label: "Màu, chữ, bo góc", to: "/theme" }] },
  {
    id: "ui",
    label: "Thành phần",
    icon: <Boxes />,
    items: [
      { label: "Nút và nhãn", to: "/thanh-phan/nut" },
      { label: "Nhập liệu", to: "/thanh-phan/nhap-lieu" },
      { label: "Hộp thoại, thông báo", to: "/thanh-phan/hop-thoai" },
      { label: "Hiển thị dữ liệu", to: "/thanh-phan/du-lieu" },
    ],
  },
  { id: "ris", label: "Component RIS", icon: <Blocks />, items: [{ label: "Dùng chung của RIS", to: "/ris" }] },
  { id: "blocks", label: "Block", icon: <LayoutTemplate />, items: [{ label: "Trang ghép sẵn", to: "/block" }] },
];

const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items.flatMap((i) => ("to" in i ? [[i.to, i.label]] : []))));

const BRAND_MARK = <span className="grid size-9 place-items-center rounded-lg bg-white text-sm font-bold text-primary">RIS</span>;
const BRAND_WIDE = (
  <div className="flex items-center gap-2.5 text-primary min-[993px]:text-white">
    {BRAND_MARK}
    <span className="min-w-0 leading-tight">
      <span className="block truncate text-base font-bold">RIS Kit</span>
      <span className="block truncate text-tiny font-normal text-muted-foreground min-[993px]:text-sidebar-foreground">Bộ giao diện tái sử dụng</span>
    </span>
  </div>
);

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("ris-kit-theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("ris-kit-theme", dark ? "dark" : "light");
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
  }, [dark]);
  return [dark, setDark] as const;
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const contentRef = useRef<HTMLDivElement>(null);
  const route = location.pathname;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="h-dvh">
      <AppLayout
        brand={BRAND_MARK}
        brandWide={BRAND_WIDE}
        nav={NAV}
        route={route}
        onNavigate={(to) => navigate(to)}
        homeRoute="/"
        isKnown={(r) => r in TITLES}
        routeTitle={(r) => TITLES[r]}
        user={{ name: "Người dùng thử", username: "demo", initials: "DT" }}
        searchPlaceholder="Tìm trang…"
        toolbar={
          <ShellIconButton label="Danh mục item" onClick={() => navigate("/danh-muc")}>
            <ListTree />
          </ShellIconButton>
        }
        userMenu={
          <AccountMenuItems
            name="Người dùng thử"
            dark={dark}
            onToggleTheme={() => setDark((d) => !d)}
            onSignOut={() => toast.info("Đây là trang chạy thử, không có đăng xuất")}
          />
        }
      >
        <div
          ref={contentRef}
          className="relative -mx-(--page-bleed-x) -mt-(--page-bleed-t) -mb-(--page-bleed-b) h-[calc(100%+var(--page-bleed-t)+var(--page-bleed-b))] min-w-0 overflow-x-hidden overflow-y-auto px-(--page-bleed-x) pt-(--page-bleed-t) pb-(--page-bleed-b)"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/danh-muc" element={<CatalogPage />} />
            <Route path="/theme" element={<ThemePage />} />
            <Route path="/thanh-phan/nut" element={<ActionsPage />} />
            <Route path="/thanh-phan/nhap-lieu" element={<FormsPage />} />
            <Route path="/thanh-phan/hop-thoai" element={<OverlaysPage />} />
            <Route path="/thanh-phan/du-lieu" element={<DataDisplayPage />} />
            <Route path="/ris" element={<RisPage />} />
            <Route path="/block" element={<BlocksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppLayout>
    </div>
  );
}
