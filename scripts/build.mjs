import { build } from "esbuild";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
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
const javascript = await fs.readFile("dist/app.js", "utf8");
const css = await fs.readFile("dist/app.css", "utf8");
const version = createHash("sha256")
  .update(javascript)
  .update(css)
  .digest("hex")
  .slice(0, 12);
const jsPath = `/app-${version}.js`,
  cssPath = `/app-${version}.css`;
const html =
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0066cc"><meta name="description" content="iFixit connects diagnosed repair requests with local spare-part donors. Compare labels, confirm handover, and record the repair outcome."><title>iFixit | Keep the repair moving</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><noscript>iFixit needs JavaScript for its workbench. Contact your repair coordinator to offer a part in person.</noscript><script type="module" src="/app.js"></script></body></html>';
const versionedHtml = html
  .replace("/app.js", jsPath)
  .replace("/app.css", cssPath);
const assets = {
  "/index.html": { body: versionedHtml, type: "text/html; charset=utf-8" },
  [jsPath]: {
    body: javascript,
    type: "text/javascript; charset=utf-8",
  },
  [cssPath]: {
    body: css,
    type: "text/css; charset=utf-8",
  },
  "/favicon.svg": {
    body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0066cc"/><path d="m10 23 9-9M19 7v6h6M7 23l3 3" fill="none" stroke="white" stroke-width="3"/></svg>',
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
await fs.writeFile("dist/index.html", versionedHtml);
console.log(
  "Built same-origin app and Worker. Worker bytes:",
  (await fs.stat("dist/worker.js")).size,
);
