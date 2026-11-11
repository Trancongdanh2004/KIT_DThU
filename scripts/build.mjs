// Builds the shadcn registry (public/r/*.json) from ./src.
// KIT_BASE_URL sets where the registry is hosted; item dependencies are absolute URLs under it.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../kit.config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const src = join(root, "src");
const out = join(root, "public", "r");
const base = (process.env.KIT_BASE_URL ?? "http://localhost:4300").replace(/\/+$/, "");
const peers = new Set([...config.peer, "tailwindcss"]);

if (!existsSync(src)) {
  console.error("src/ is empty: run `npm run sync` first");
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [relative(src, join(dir, e.name)).split("\\").join("/")],
  );
const files = walk(src).sort();
const fileSet = new Set(files);

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Item a source file belongs to, and the registry type of the item and of the file. */
function classify(file) {
  const named = config.names[file];
  const stem = basename(file, extname(file));
  const [top, sub, group] = file.split("/");
  if (file === "styles/theme.css") return { item: "theme", type: "registry:style", fileType: "registry:file" };
  if (top === "styles") return { item: named ?? stem, type: "registry:style", fileType: "registry:file" };
  if (top === "components" && sub === "ui") return { item: named ?? stem, type: "registry:ui", fileType: "registry:ui" };
  if (top === "components" && sub === "blocks")
    return { item: `block-${group}`, type: "registry:block", fileType: file.endsWith(".css") ? "registry:file" : "registry:component" };
  if (top === "components" && sub === "app") return { item: named ?? kebab(stem), type: "registry:component", fileType: "registry:component" };
  if (top === "hooks" || stem.startsWith("use-"))
    return { item: named ?? kebab(stem), type: "registry:hook", fileType: "registry:hook" };
  if (top === "lib") return { item: named ?? kebab(stem), type: "registry:lib", fileType: "registry:lib" };
  throw new Error(`no item rule for ${file}`);
}

/** Resolves an import of `from` to a kit file, an npm package, or null when it is out of the kit. */
function resolveImport(from, spec) {
  let target;
  if (spec.startsWith("~/") || spec.startsWith("@/")) target = spec.slice(2);
  else if (spec.startsWith(".")) target = posix.normalize(posix.join(posix.dirname(from), spec));
  else return { pkg: spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0] };
  for (const ext of ["", ".tsx", ".ts", "/index.ts", "/index.tsx"]) {
    if (fileSet.has(target + ext)) return { file: target + ext };
  }
  return null;
}

const IMPORT = /(?:import|export)\s[^'"]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|@import\s+["']([^"']+)["']/gs;

const items = new Map();
const errors = [];

for (const file of files) {
  const { item, type, fileType } = classify(file);
  if (!items.has(item)) items.set(item, { name: item, type, files: [], deps: new Set(), regDeps: new Set() });
  const entry = items.get(item);
  let content = readFileSync(join(src, file), "utf8");

  for (const m of content.matchAll(IMPORT)) {
    const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
    const r = resolveImport(file, spec);
    if (!r) errors.push(`${file}: import "${spec}" is outside the kit`);
    else if (r.pkg) {
      if (peers.has(r.pkg)) continue;
      const range = config.packages[r.pkg];
      if (!range) errors.push(`${file}: package "${r.pkg}" has no version in kit.config.mjs`);
      else entry.deps.add(`${r.pkg}@${range}`);
    } else {
      const dep = classify(r.file).item;
      if (dep !== item) entry.regDeps.add(dep);
    }
  }

  // Consumers only alias `@/`; RIS also uses `~/` for the same folder.
  content = content.replace(/(from\s+|import\s*\(\s*|import\s+)(["'])~\//g, "$1$2@/");
  entry.files.push({ path: file, content, type: fileType, target: file });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const titles = {
  "registry:ui": "UI component",
  "registry:block": "Block",
  "registry:component": "RIS component",
  "registry:lib": "Library",
  "registry:hook": "Hook",
  "registry:style": "Styles",
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const url = (name) => `${base}/r/${name}.json`;
const index = [];

for (const it of [...items.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const json = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: it.name,
    type: it.type,
    title: `${titles[it.type]}: ${it.name}`,
    ...(it.deps.size ? { dependencies: [...it.deps].sort() } : {}),
    ...(it.regDeps.size ? { registryDependencies: [...it.regDeps].sort().map(url) } : {}),
    files: it.files,
    meta: { version: config.version },
  };
  writeFileSync(join(out, `${it.name}.json`), JSON.stringify(json, null, 2));
  index.push({ name: it.name, type: it.type, title: json.title });
}

// One item that installs the whole kit.
const all = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "all",
  type: "registry:block",
  title: "Toàn bộ RIS Kit",
  registryDependencies: index.map((i) => url(i.name)),
  files: [],
  meta: { version: config.version },
};
writeFileSync(join(out, "all.json"), JSON.stringify(all, null, 2));
index.push({ name: "all", type: all.type, title: all.title });

writeFileSync(
  join(out, "registry.json"),
  JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry.json", name: config.name, homepage: config.homepage, items: index }, null, 2),
);

const count = (t) => index.filter((i) => i.type === t).length;
console.log(
  `built ${index.length} items for ${base}: ${count("registry:ui")} ui, ${count("registry:block")} blocks, ` +
    `${count("registry:component")} RIS components, ${count("registry:lib") + count("registry:hook")} lib/hooks, ${count("registry:style")} styles`,
);
