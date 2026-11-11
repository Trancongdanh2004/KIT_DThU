// Copies the kit's files from the RIS web app into ./src, replacing what was there.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../kit.config.mjs";

const source = process.env.RIS_SRC ?? config.source;
const out = fileURLToPath(new URL("../src/", import.meta.url));

if (!existsSync(source)) {
  console.error(`RIS source not found: ${source} (set RIS_SRC)`);
  process.exit(1);
}
const missing = config.include.filter((entry) => !existsSync(join(source, entry)));
if (missing.length) {
  console.error(`missing in RIS: ${missing.join(", ")}`);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
for (const entry of config.include) {
  const to = join(out, entry);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(join(source, entry), to, { recursive: true });
}
console.log(`synced ${config.include.length} entries from ${source}`);
