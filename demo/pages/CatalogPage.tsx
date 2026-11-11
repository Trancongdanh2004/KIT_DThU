import { Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/app/FilterBar";
import { PageShell } from "@/components/app/PageShell";
import { ServerDataTable } from "@/components/app/ServerDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import { addCommand, itemUrl } from "../parts";
import { ITEMS, TYPE_LABELS, type KitItem } from "../registry";

const TYPE_TONE: Record<string, "default" | "info" | "success" | "warning" | "violet" | "secondary"> = {
  "registry:style": "warning",
  "registry:ui": "info",
  "registry:block": "violet",
  "registry:component": "success",
  "registry:lib": "secondary",
  "registry:hook": "secondary",
};

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const rows = useMemo(() => {
    const q = fold(search.trim());
    return ITEMS.filter((i) => (type === "all" || i.type === type) && (!q || fold(`${i.name} ${i.title}`).includes(q)));
  }, [search, type]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const copy = async (item: KitItem) => {
    try {
      await navigator.clipboard.writeText(addCommand([item.name]));
      toast.success(`Đã sao chép lệnh cài ${item.name}`);
    } catch {
      toast.error("Không sao chép được");
    }
  };

  return (
    <PageShell variant="list">
      <FilterBar
        search={
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm item…"
              aria-label="Tìm item"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        }
        filters={[
          {
            id: "type",
            label: "Loại",
            active: type !== "all",
            selfLabelled: true,
            node: (
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v);
                  setPage(1);
                }}
              >
                <SelectTrigger label="Loại" active={type !== "all"} className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
        ]}
        onReset={() => {
          setSearch("");
          setType("all");
          setPage(1);
        }}
      />
      <ServerDataTable
        label="Danh mục item của RIS Kit"
        columns={[
          { id: "name", header: "Item", width: 220, cell: (r) => <span className="font-semibold">{r.name}</span> },
          { id: "type", header: "Loại", width: 150, cell: (r) => <Badge variant={TYPE_TONE[r.type]}>{TYPE_LABELS[r.type]}</Badge> },
          { id: "url", header: "Địa chỉ", hideBelow: "md", cell: (r) => <code className="font-mono text-meta text-muted-foreground">{itemUrl(r.name)}</code> },
        ]}
        rows={pageRows}
        getRowId={(r) => r.name}
        total={rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        rowActions={(r) => (
          <Button size="icon-sm" variant="ghost" aria-label={`Sao chép lệnh cài ${r.name}`} onClick={() => void copy(r)}>
            <Copy />
          </Button>
        )}
        rowActionsLabel="Sao chép lệnh"
        renderCard={(r) => (
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{r.name}</span>
              <Badge variant={TYPE_TONE[r.type]} className="mt-1">
                {TYPE_LABELS[r.type]}
              </Badge>
            </span>
            <Button size="icon-sm" variant="ghost" aria-label={`Sao chép lệnh cài ${r.name}`} onClick={() => void copy(r)}>
              <Copy />
            </Button>
          </div>
        )}
        emptyTitle="Không có item phù hợp"
      />
    </PageShell>
  );
}
