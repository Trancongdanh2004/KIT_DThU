import registry from "../public/r/registry.json";

export interface KitItem {
  name: string;
  type: string;
  title: string;
}

export const ITEMS: KitItem[] = registry.items;

export const TYPE_LABELS: Record<string, string> = {
  "registry:style": "Theme",
  "registry:ui": "UI",
  "registry:block": "Block",
  "registry:component": "Component RIS",
  "registry:lib": "Thư viện",
  "registry:hook": "Hook",
};

export const countOf = (type: string) => ITEMS.filter((i) => i.type === type && i.name !== "all").length;
