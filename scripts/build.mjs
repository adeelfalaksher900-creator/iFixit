import { build } from "esbuild";
import fs from "node:fs/promises";
await fs.mkdir("dist", { recursive: true });
await fs.mkdir("generated", { recursive: true });
await build({
  entryPoints: ["src/app.jsx"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "dist/app.js",
  loader: { ".woff2": "dataurl" },
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  metafile: true,
}).then((r) => fs.writeFile("dist/meta.json", JSON.stringify(r.metafile)));
const html =
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#164c3b"><meta name="description" content="RepairRelay connects diagnosed repair requests with local spare-part donors. Compare labels, confirm handover, and record the repair outcome."><title>RepairRelay | Keep the repair moving</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><noscript>RepairRelay needs JavaScript for its workbench. Contact your repair coordinator to offer a part in person.</noscript><script type="module" src="/app.js"></script></body></html>';
const assets = {
  "/index.html": { body: html, type: "text/html; charset=utf-8" },
  "/app.js": {
    body: await fs.readFile("dist/app.js", "utf8"),
    type: "text/javascript; charset=utf-8",
  },
  "/app.css": {
    body: await fs.readFile("dist/app.css", "utf8"),
    type: "text/css; charset=utf-8",
  },
  "/favicon.svg": {
    body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#164c3b"/><path d="M9 9h10a5 5 0 0 1 0 10h-4l7 7M9 25V9" fill="none" stroke="white" stroke-width="3"/></svg>',
    type: "image/svg+xml",
  },
};
await fs.writeFile(
  "generated/assets.js",
  "export const ASSETS=" + JSON.stringify(assets) + ";",
);
await build({
  entryPoints: ["src/worker.js"],
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  outfile: "dist/worker.js",
});
await fs.writeFile("dist/index.html", html);
console.log(
  "Built same-origin app and Worker. Worker bytes:",
  (await fs.stat("dist/worker.js")).size,
);
