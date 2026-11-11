// Serves ./public: the showcase at http://localhost:4300/ and the registry at /r/<item>.json for `shadcn add`.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const port = Number(process.env.PORT ?? 4300);
const types = {
  ".json": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const path = normalize(join(root, pathname.endsWith("/") ? `${pathname}index.html` : pathname));
  if (!path.startsWith(root) || !existsSync(path) || statSync(path).isDirectory()) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream", "access-control-allow-origin": "*" });
  createReadStream(path).pipe(res);
}).listen(port, () => console.log(`RIS Kit: http://localhost:${port}/  (registry: /r/registry.json)`));
