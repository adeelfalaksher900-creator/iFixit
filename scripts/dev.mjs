import http from "node:http";
import worker from "../dist/worker.js";
import { database } from "./db.mjs";
const DB = database("local.sqlite");
http
  .createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      ...(!["GET", "HEAD"].includes(req.method)
        ? { body: Buffer.concat(chunks) }
        : {}),
    });
    const r = await worker.fetch(request, { DB });
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  })
  .listen(4173, "0.0.0.0", () =>
    console.log("RepairRelay http://localhost:4173"),
  );
