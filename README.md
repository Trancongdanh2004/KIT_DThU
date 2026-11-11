# RIS Kit

Bộ giao diện của dự án **RIS (CSDL KH&CN – ĐH Đồng Tháp)** được đóng gói thành **registry shadcn** để dùng lại ở các dự án sau.

Kit được xây trên nền [DThU Kit](https://dthu-kit.anhdev99.com) và giữ nguyên mọi tuỳ chỉnh RIS đã làm:

- **Theme riêng của RIS**: `--primary #004998`, chữ `#232338`, sidebar xanh, viền ô nhập nhạt, thêm các token `--brand-*`, `--header-surface`, `--footer-surface`…
- **Component được vá**: nút có bóng nhẹ, ô nhập dùng `--field-border`, card có viền rõ, dialog có padding đúng khi bên trong có form.
- **Component dùng chung của RIS**: thanh lọc một hàng `FilterBar`/`ResponsiveFilterRow`, `PageShell`, `ServerDataTable`, `ConfirmAction`, hộp thoại `SessionTakenOverDialog`, hàm chữ viết tắt `initialsOf`…

## Cấu trúc

```
RIS-Kit/
├─ kit.config.mjs     Danh sách file lấy từ RIS, tên item, phiên bản gói npm
├─ src/               Bản sao các file kit (sinh bởi `npm run sync`, không sửa tay)
├─ demo/              Trang chạy thử (showcase) dựng bằng chính kit
├─ public/            Kết quả build: trang chạy thử (index.html, assets/) + registry (r/*.json)
└─ scripts/
   ├─ sync.mjs        Chép file từ RIS web/src vào src/
   ├─ build.mjs       Sinh public/r/*.json, kiểm tra import và dependency
   └─ serve.mjs       Phục vụ public/ tại http://localhost:4300
```

Cần Node ≥ 20. Chạy `npm install` một lần (gói chỉ dùng cho trang chạy thử; script sync/registry/serve không cần).

## Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run sync` | Chép lại file từ RIS. Nguồn mặc định là `E:/RIS_Danh2/Research-Information-System/web/src`; muốn đổi thì đặt `RIS_SRC=<đường dẫn>`. |
| `npm run build` | Build registry, typecheck rồi build trang chạy thử vào `public/`. Đặt `KIT_BASE_URL=<địa chỉ host>` (mặc định `http://localhost:4300`). Lệnh dừng và báo lỗi nếu file import thứ gì nằm ngoài kit hoặc dùng gói npm chưa khai báo phiên bản. |
| `npm run registry` | Chỉ build registry (`public/r`), không build trang chạy thử. |
| `npm run release` | Chạy `sync` rồi `build`. Dùng mỗi khi giao diện RIS thay đổi. |
| `npm run serve` | Mở trang chạy thử và registry tại http://localhost:4300 (đổi cổng bằng `PORT`). |
| `npm run dev` | Sửa trang chạy thử có tải lại nóng tại http://localhost:5180. |
| `npm run typecheck` | Kiểm kiểu toàn bộ `src/` và `demo/`. |

## Trang chạy thử

`npm run build` rồi `npm run serve`, mở http://localhost:4300. Trang dựng bằng chính khung `AppLayout` của kit, gồm:

- **Giới thiệu**: số lượng item, các bước cài vào dự án mới (có nút sao chép lệnh).
- **Danh mục item**: tìm, lọc theo loại, sao chép lệnh cài từng item (dùng `FilterBar` + `ServerDataTable`).
- **Theme**: mọi token màu đọc trực tiếp từ `theme.css`, thang cỡ chữ, bo góc. Bật chế độ tối ở menu tài khoản góc phải.
- **Thành phần**: nút và nhãn, nhập liệu, hộp thoại và thông báo, hiển thị dữ liệu. Mỗi ví dụ kèm lệnh cài đúng các item đã dùng.
- **Component RIS**: thanh lọc một hàng, bảng phân trang, `RowActions`, `ConfirmAction`, `ChoiceSelect`, `IsoDatePicker`, câu lỗi `ris.*`, chặn rời trang, hộp thoại khoá tab, `ErrorView`.
- **Block**: trang đăng nhập, dashboard, trang lỗi, trang bảo trì.

Vì trang đọc thẳng từ `src/`, sau `npm run release` trang chạy thử cũng cập nhật theo RIS. Khi host thư mục `public/`, cả trang chạy thử và registry dùng chung một địa chỉ.

## Dùng trong dự án mới

### 1. Chuẩn bị dự án

Cần React 19 và Tailwind CSS v4, có thư mục `src/`. Thêm alias `@/*` → `./src/*` vào `tsconfig.json` và bundler (Vite: `resolve.alias`).

Tạo `components.json` ở gốc dự án:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/styles/app.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
}
```

Theme dùng font **Roboto**. Thêm vào `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />
```

Nếu dùng block `faculty`, khai báo kiểu cho CSS module (Vite đã có sẵn trong `vite/client`).

### 2. Cài kit

Bật registry trên máy (`npm run build` rồi `npm run serve` trong `RIS-Kit`) hoặc dùng địa chỉ đã host, rồi chạy trong dự án mới:

```bash
# Toàn bộ kit (theme, app.css, 62 ui, 10 nhóm block, component RIS, lib, hook)
npx shadcn@latest add http://localhost:4300/r/all.json --overwrite

# Hoặc chỉ cài phần cần dùng; phụ thuộc được cài kèm tự động
npx shadcn@latest add http://localhost:4300/r/theme.json http://localhost:4300/r/button.json
npx shadcn@latest add http://localhost:4300/r/filter-bar.json
```

Lưu ý:
- `--overwrite` cho phép ghi đè `src/styles/app.css` (item `app-css`). Nếu chỉ muốn lấy token màu, cài `theme.json` rồi tự `@import "./theme.css";` sau `@import "tailwindcss";`.
- Danh sách mọi item nằm ở `<địa chỉ>/r/registry.json`.

### 3. Host để dùng từ máy khác

```bash
KIT_BASE_URL=https://<tên-miền-hoặc-github-pages> npm run build
```

Sau đó đưa thư mục `public/` lên host tĩnh bất kỳ (GitHub Pages, Netlify, Nginx…). Phải build lại với đúng `KIT_BASE_URL`, vì các item tham chiếu nhau bằng URL tuyệt đối.

## Danh sách item

| Nhóm | Item |
|---|---|
| Theme | `theme` (token màu, font, custom variant `dark`/`coarse`), `app-css` (CSS gốc: thang chữ khu công khai `.public-scale`, hiệu ứng `reveal`, bỏ viền focus của biểu đồ) |
| UI (62) | alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, combobox, command, context-menu, data-grid, data-grid-export, date-picker, description-list, dialog, drawer, dropdown-menu, dropdown-menu-extras, empty-state, field, file-upload, form, hover-card, input, input-group, input-otp, kbd, label, loading-overlay, multi-select, native-select, navigation-menu, number-input, page-header, pagination, popconfirm, popover, progress, radio-group, result, scroll-area, segmented-control, select, separator, sheet, skeleton, spinner, stat-tile, stepper, switch, table, tabs, tag-input, textarea, timeline, toaster, tooltip, tree-view |
| Block | block-admin, block-app-layout, block-archive, block-auth, block-dashboard, block-documents, block-faculty, block-shell, block-system, block-work |
| Component RIS | choice-select, confirm-action, error-view, filter-bar, hint-tooltip, iso-date-picker, page-shell, row-actions, server-data-table, session-taken-over-dialog, unsaved-changes-guard |
| Lib | utils, ui-config, initials, error-messages (câu lỗi tiếng Việt cho mã `ris.*`), forms (gắn lỗi API vào react-hook-form) |
| Hook | use-breakpoint, use-countdown, use-media-query, use-retained, use-debounced-value |
| Gộp | `all`: cài tất cả |

**Không đưa vào kit** vì gắn với API/nghiệp vụ RIS: `lookup-selects`, `StatusBadge`, `api.client`, `query-keys`, `labels`, `AuthProvider`, `useApiMutation`, `useLookups`, `useFeatures`, `usePermissionGuard`. Ảnh thương hiệu trong `public/brand` cũng không có trong kit (không component nào dùng); dự án mới tự chép nếu cần.

## Quy ước khi dùng

Theo cùng quy ước giao diện của RIS:
- dùng component kit, không dùng thẻ native (`<select>`, `<input type=date>`, `<button>`…) trong trang;
- không inline style, không mã màu hex trong `.tsx`; màu lấy từ token của `theme`;
- thanh lọc danh sách nằm trên một hàng, dùng `FilterBar`;
- responsive mobile-first, kiểm ở 375 / 768 / 1280px.

## Cập nhật kit

1. Sửa giao diện trong RIS như bình thường.
2. Trong `RIS-Kit`: `npm run release` (thêm `KIT_BASE_URL=…` nếu đang host). Nếu file mới của RIS cần ví dụ trên trang chạy thử, thêm vào trang tương ứng trong `demo/pages/`.
3. Tăng `version` trong `kit.config.mjs` khi phát hành bản mới; số này ghi vào `meta.version` của từng item.
4. Muốn đưa thêm file vào kit: thêm đường dẫn vào `include` trong `kit.config.mjs`. Nếu file import gói npm mới, khai báo phiên bản ở `packages`; `build` sẽ báo nếu thiếu.
