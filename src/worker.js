import {
  makeRepair,
  samples,
  compare,
  transition,
  publicRepair,
  ownerRepair,
  cleanExpiry,
} from "./domain.js";
import {
  benchSchema,
  requestSchema,
  offerSchema,
  actionSchema,
  managementSchema,
} from "./validation.js";
import { ASSETS } from "../generated/assets.js";
const DAY = 86400000;
const idPattern = /^[0-9a-f-]{36}$/;
const headers = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
function fail(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  throw e;
}
export const hash = async (x) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const bearer = (req) => {
  const v = req.headers.get("Authorization") || "";
  return /^Bearer [a-f0-9]{64}$/.test(v) ? v.slice(7) : "";
};
async function body(req, schema) {
  if (!req.headers.get("Content-Type")?.startsWith("application/json"))
    fail("Use application/json.", 415);
  if (!req.body) fail("Request body is missing.");
  const reader = req.body.getReader();
  let size = 0;
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16000) {
      await reader.cancel();
      fail("Request is too large.", 413);
    }
    chunks.push(value);
  }
  let parsed;
  try {
    const all = new Uint8Array(size);
    let p = 0;
    for (const c of chunks) {
      all.set(c, p);
      p += c.length;
    }
    parsed = JSON.parse(new TextDecoder().decode(all));
  } catch {
    fail("Send valid JSON.");
  }
  const result = schema.safeParse(parsed);
  if (!result.success)
    fail(
      result.error.issues
        .map((i) => `${i.path.join(".") || "Input"}: ${i.message}`)
        .join("; ")
        .slice(0, 500),
    );
  return result.data;
}
async function rate(env, req, scope, max) {
  const now = Date.now();
  const window = Math.floor(now / 3600000);
  const ip = req.headers.get("CF-Connecting-IP") || "local";
  const key = await hash(`${scope}:${window}:${ip}`);
  const r = await env.DB.prepare(
    "INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
  )
    .bind(key, now + 2 * 3600000)
    .first();
  if (r.count > max)
    fail("Too many requests. Please try again in the next hour.", 429);
}
async function bench(env, id) {
  if (!idPattern.test(id)) fail("Workbench not found.", 404);
  const b = await env.DB.prepare(
    "SELECT id,key_hash,name,demo,created,expires FROM benches WHERE id=?",
  )
    .bind(id)
    .first();
  if (!b) fail("Workbench not found.", 404);
  if (b.expires < Date.now())
    fail(
      "This workbench has expired. Export records before the 30-day pilot ends.",
      410,
    );
  return b;
}
async function owner(req, b) {
  const key = bearer(req);
  if (!key || (await hash(key)) !== b.key_hash)
    fail("Workbench key required. Restore your private access file.", 401);
}
async function repair(env, id) {
  if (!idPattern.test(id)) fail("Request not found.", 404);
  const row = await env.DB.prepare(
    "SELECT id,bench_id,revision,data FROM repairs WHERE id=?",
  )
    .bind(id)
    .first();
  if (!row) fail("Request not found.", 404);
  const b = await bench(env, row.bench_id);
  return { b, row, r: cleanExpiry(JSON.parse(row.data), Date.now()) };
}
async function save(env, row, r) {
  const v = await env.DB.prepare(
    "UPDATE repairs SET data=?,revision=revision+1 WHERE id=? AND revision=?",
  )
    .bind(JSON.stringify(r), row.id, row.revision)
    .run();
  if (v.meta.changes !== 1)
    fail("This request changed in another window. Refresh and try again.", 409);
  return { ...ownerRepair(r), revision: row.revision + 1 };
}
async function addRepair(env, b, r) {
  const v = await env.DB.prepare(
    "INSERT INTO repairs(id,bench_id,data) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM repairs WHERE bench_id=?)<50",
  )
    .bind(r.id, b.id, JSON.stringify(r), b.id)
    .run();
  if (v.meta.changes !== 1)
    fail("Pilot limit: 50 requests per workbench.", 409);
}
async function api(req, env) {
  const u = new URL(req.url),
    p = u.pathname.split("/").filter(Boolean),
    now = Date.now();
  if (req.method === "POST") {
    const origin = req.headers.get("Origin");
    if (origin && origin !== u.origin && origin !== env.APP_ORIGIN)
      fail("Cross-site writes are not allowed.", 403);
    if (req.headers.get("Sec-Fetch-Site") === "cross-site")
      fail("Cross-site writes are not allowed.", 403);
  }
  if (p[1] === "health" && req.method === "GET")
    return json({ status: "ok", version: "2.0.0" });
  if (p[1] === "benches" && p.length === 2 && req.method === "POST") {
    await rate(env, req, "create", 10);
    const input = await body(req, benchSchema),
      key = token();
    const b = {
      id: crypto.randomUUID(),
      name: input.name,
      demo: input.demo,
      created: now,
      expires: now + (input.demo ? 7 : 30) * DAY,
    };
    await env.DB.prepare(
      "INSERT INTO benches(id,key_hash,name,demo,created,expires) VALUES(?,?,?,?,?,?)",
    )
      .bind(b.id, await hash(key), b.name, b.demo ? 1 : 0, b.created, b.expires)
      .run();
    if (b.demo) {
      const rows = samples(now);
      const r = rows[0];
      for (const [i, spec] of [
        r.spec,
        "DDR3 SO-DIMM / 8 GB / 1600",
        "",
      ].entries()) {
        const tk = token();
        r.offers.push({
          id: crypto.randomUUID(),
          alias: ["Repair club donor", "Community donor", "School store"][i],
          model: r.model,
          part: i === 1 ? "DEMO-RAM-8-1600" : r.part,
          spec,
          condition: i === 2 ? "Untested" : "Tested working",
          note: [
            "Example: label transcribed and module tested. Technician must check the physical part.",
            "Example: a different memory generation. This must not be reserved.",
            "Example: label partly unreadable. Ask for complete details.",
          ][i],
          consent: true,
          created: now,
          status: "Offered",
          tokenHash: await hash(tk),
          code: token().slice(0, 12).toUpperCase(),
          demoReceiptKey: tk,
        });
      }
      for (const row of rows) await addRepair(env, b, row);
    }
    return json({ ...b, key }, 201);
  }
  if(p[1]==="benches" && p[3]==="manage" && p.length===4 && req.method==="POST"){
    const b=await bench(env,p[2]); await owner(req,b);await rate(env,req,"manage",30);
    const input=await body(req,managementSchema);
    if(input.action==="rotate"){
      const key=token();const v=await env.DB.prepare("UPDATE benches SET key_hash=? WHERE id=? AND key_hash=?").bind(await hash(key),b.id,b.key_hash).run();
      if(v.meta.changes!==1)fail("Access changed. Restore your latest access file.",409);
      return json({key});
    }
    if(input.action==="delete"){
      if(input.confirmation!==b.name)fail("The workbench name does not match.",409);
      const v=await env.DB.prepare("DELETE FROM benches WHERE id=? AND key_hash=?").bind(b.id,b.key_hash).run();
      if(v.meta.changes!==1)fail("Access changed. Refresh before deleting.",409);
      return json({deleted:true});
    }
    const v=input.action==="rename"?await env.DB.prepare("UPDATE benches SET name=? WHERE id=? AND key_hash=?").bind(input.name,b.id,b.key_hash).run():await env.DB.prepare("UPDATE benches SET expires=? WHERE id=? AND key_hash=?").bind(now+30*DAY,b.id,b.key_hash).run();
    if(v.meta.changes!==1)fail("Access changed. Restore your latest access file.",409);
    return json({updated:true});
  }
  if (p[1] === "benches" && p.length === 3 && req.method === "GET") {
    const b = await bench(env, p[2]);
    await owner(req, b);
    const result = await env.DB.prepare(
      "SELECT revision,data FROM repairs WHERE bench_id=? ORDER BY rowid DESC LIMIT 50",
    )
      .bind(b.id)
      .all();
    const { key_hash, ...safe } = b;
    return json({
      ...safe,
      repairs: result.results.map((x) => ({
        ...ownerRepair(cleanExpiry(JSON.parse(x.data), now)),
        revision: x.revision,
      })),
    });
  }
  if (
    p[1] === "benches" &&
    p[3] === "requests" &&
    p.length === 4 &&
    req.method === "POST"
  ) {
    const b = await bench(env, p[2]);
    await owner(req, b);
    await rate(env, req, "owner", 150);
    const input = await body(req, requestSchema),
      r = makeRepair(input, now);
    await addRepair(env, b, r);
    return json({ ...ownerRepair(r), revision: 0 }, 201);
  }
  if (p[1] === "requests" && p.length === 3 && req.method === "GET") {
    const { b, r } = await repair(env, p[2]);
    return json(publicRepair(r, b));
  }
  if (
    p[1] === "requests" &&
    p[3] === "offers" &&
    p.length === 4 &&
    req.method === "POST"
  ) {
    await rate(env, req, "offer", 30);
    const { b, row, r } = await repair(env, p[2]);
    if (r.status !== "Waiting for part")
      fail("This request is not accepting offers.", 409);
    if (r.offers.length >= 20)
      fail("This request has reached the pilot limit of 20 offers.", 409);
    const input = await body(req, offerSchema),
      key = token(),
      o = {
        ...input,
        id: crypto.randomUUID(),
        created: now,
        status: "Offered",
        tokenHash: await hash(key),
        code: token().slice(0, 12).toUpperCase(),
      };
    r.offers.push(o);
    r.history.push({ at: now, event: "A donor offered a part" });
    await save(env, row, r);
    return json(
      {
        id: o.id,
        key,
        requestId: r.id,
        comparison: compare(r, o),
        demo: !!b.demo,
      },
      201,
    );
  }
  if (
    p[1] === "requests" &&
    p[3] === "action" &&
    p.length === 4 &&
    req.method === "POST"
  ) {
    const { b, row, r } = await repair(env, p[2]);
    await owner(req, b);
    await rate(env, req, "owner", 150);
    const input = await body(req, actionSchema);
    if (input.revision !== row.revision)
      fail("A newer update exists. Refresh and try again.", 409);
    try {
      transition(r, input, now);
    } catch (e) {
      fail(e.message, 409);
    }
    return json(await save(env, row, r));
  }
  if (
    p[1] === "receipts" &&
    p.length === 4 &&
    ["GET", "POST"].includes(req.method)
  ) {
    const { b, row, r } = await repair(env, p[2]);
    const o = r.offers.find((x) => x.id === p[3]);
    const key = bearer(req);
    if (!o || !key || (await hash(key)) !== o.tokenHash)
      fail("Private donor receipt key required.", 401);
    if (req.method === "POST") {
      await rate(env, req, "offer", 30);
      const payload = await body(req, offerSchema.pick({ consent: true }));
      if (!["Offered", "Reserved"].includes(o.status))
        fail("This offer is no longer withdrawable.", 409);
      o.status = "Withdrawn";
      if (r.selected === o.id) {
        r.selected = null;
        r.status = "Waiting for part";
      }
      r.history.push({ at: now, event: "Donor withdrew their offer" });
      await save(env, row, r);
    }
    return json({
      request: publicRepair(r, b),
      offer: {
        id: o.id,
        alias: o.alias,
        status: o.status,
        model: o.model,
        part: o.part,
        spec: o.spec,
        condition: o.condition,
        note: o.note,
        code: o.code,
        review: o.review || "",
        created: o.created,
      },
      comparison: compare(r, o),
    });
  }
  fail("Endpoint not found.", 404);
}
export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url);
      if (url.pathname.startsWith("/api/")) return await api(req, env);
      if (!["GET", "HEAD"].includes(req.method))
        return json({ error: "Method not allowed." }, 405);
      const path = ASSETS[url.pathname]
        ? url.pathname
        : /^\/(r\/[^/]+|receipt\/[^/]+\/[^/]+|bench|research|privacy)?$/.test(
              url.pathname,
            )
          ? "/index.html"
          : null;
      if (!path) return json({ error: "Page not found." }, 404);
      const a = ASSETS[path];
      return new Response(req.method === "HEAD" ? null : a.body, {
        headers: {
          ...headers,
          "Content-Type": a.type,
          "Cache-Control":
            path === "/index.html" ? "no-cache" : "public, max-age=3600",
        },
      });
    } catch (e) {
      if (e.status) return json({ error: e.message }, e.status);
      console.error("iFixit request failed", e.name);
      return json(
        {
          error:
            "The service could not save or load this request. Please retry.",
        },
        500,
      );
    }
  },
  async scheduled(event, env) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM benches WHERE expires<?").bind(Date.now()),
      env.DB.prepare("DELETE FROM limits WHERE expires<?").bind(Date.now()),
    ]);
  },
};
