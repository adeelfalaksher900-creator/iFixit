import test from "node:test";
import assert from "node:assert/strict";
import worker from "../dist/worker.js";
import { database } from "../scripts/db.mjs";
const input = {
  title: "Study laptop keyboard",
  category: "Keyboard",
  model: "Laptop 14 revision B",
  part: "KB-14-B",
  spec: "US / non-backlit / 30-pin",
  diagnosis: "A technician diagnosed the keyboard assembly fault.",
  area: "Community repair desk",
  purpose: "Return the laptop for study.",
  diagnosed: true,
};
function harness() {
  const DB = database();
  return {
    DB,
    async call(path, body, key, headers = {}) {
      const req = new Request("https://repair.test/api" + path, {
        method: body ? "POST" : "GET",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(key ? { Authorization: "Bearer " + key } : {}),
          ...headers,
        },
        ...(body
          ? { body: typeof body === "string" ? body : JSON.stringify(body) }
          : {}),
      });
      const res = await worker.fetch(req, { DB });
      return {
        status: res.status,
        headers: res.headers,
        data: await res.json(),
      };
    },
  };
}
async function setup(h) {
  const b = await h.call("/benches", {
    name: "Test repair bench",
    demo: false,
  });
  assert.equal(b.status, 201);
  const r = await h.call(`/benches/${b.data.id}/requests`, input, b.data.key);
  assert.equal(r.status, 201);
  return { b: b.data, r: r.data };
}
test("coordinator isolation, public minimization and receipt isolation", async () => {
  const h = harness(),
    { b, r } = await setup(h);
  const other = (await h.call("/benches", { name: "Other bench", demo: false }))
    .data;
  assert.equal((await h.call("/benches/" + b.id)).status, 401);
  assert.equal((await h.call("/benches/" + b.id, null, other.key)).status, 401);
  assert.equal(
    (
      await h.call(
        `/requests/${r.id}/action`,
        { action: "close", revision: 0, note: "Cross-bench update blocked" },
        other.key,
      )
    ).status,
    401,
  );
  const o = (
    await h.call(`/requests/${r.id}/offers`, {
      alias: "Local donor",
      model: r.model,
      part: r.part,
      spec: r.spec,
      condition: "Tested working",
      note: "Transcribed label and tested device keyboard",
      consent: true,
    })
  ).data;
  assert.ok(o.key);
  const pub = (await h.call("/requests/" + r.id)).data;
  assert.ok(!("offers" in pub));
  assert.ok(!("history" in pub));
  assert.ok(!JSON.stringify(pub).includes("Local donor"));
  assert.equal((await h.call(`/receipts/${r.id}/${o.id}`)).status, 401);
  assert.equal(
    (await h.call(`/receipts/${r.id}/${o.id}`, null, b.key)).status,
    401,
  );
  const receipt = await h.call(`/receipts/${r.id}/${o.id}`, null, o.key);
  assert.equal(receipt.status, 200);
  assert.equal(receipt.data.offer.code.length, 12);
  const owner = (await h.call("/benches/" + b.id, null, b.key)).data;
  assert.ok(!JSON.stringify(owner).includes(o.key));
  assert.ok(!("code" in owner.repairs[0].offers[0]));
  h.DB.close();
});
test("persistent full repair flow, conflicts, bad handover, and no false completion", async () => {
  const h = harness(),
    { b, r } = await setup(h);
  const o = (
    await h.call(`/requests/${r.id}/offers`, {
      alias: "Donor one",
      model: r.model,
      part: r.part,
      spec: r.spec,
      condition: "Tested working",
      note: "Matching part labels inspected by donor",
      consent: true,
    })
  ).data;
  const change = (body) => h.call(`/requests/${r.id}/action`, body, b.key);
  assert.equal(
    (
      await change({
        action: "reserve",
        revision: 0,
        offerId: o.id,
        note: "Checked physical labels and connector",
        inspected: true,
      })
    ).status,
    409,
  );
  let reserve = await change({
    action: "reserve",
    revision: 1,
    offerId: o.id,
    note: "Checked physical labels and connector",
    inspected: true,
  });
  assert.equal(reserve.status, 200);
  assert.equal(
    (
      await change({
        action: "receive",
        revision: 2,
        code: "BAD",
        note: "Part received at staffed desk",
      })
    ).status,
    409,
  );
  const receipt = (await h.call(`/receipts/${r.id}/${o.id}`, null, o.key)).data;
  assert.equal(
    (
      await change({
        action: "receive",
        revision: 2,
        code: receipt.offer.code,
        note: "Part received at staffed desk",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await change({
        action: "complete",
        revision: 3,
        outcome: "Repaired",
        test: "Each keyboard key tested and connector checked",
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await change({
        action: "complete",
        revision: 3,
        outcome: "Repaired",
        test: "Each keyboard key tested and connector checked",
        ownerConfirmed: true,
      })
    ).status,
    200,
  );
  assert.equal(
    (await h.call("/benches/" + b.id, null, b.key)).data.repairs[0].status,
    "Repaired",
  );
  assert.equal(
    (
      await h.call(`/requests/${r.id}/offers`, {
        alias: "Late donor",
        model: r.model,
        part: r.part,
        spec: r.spec,
        condition: "Untested",
        note: "Offer after repair completed",
        consent: true,
      })
    ).status,
    409,
  );
  h.DB.close();
});
test("donor withdrawal releases selected part without coordinator privilege", async () => {
  const h = harness(),
    { b, r } = await setup(h);
  const o = (
    await h.call(`/requests/${r.id}/offers`, {
      alias: "Donor one",
      model: r.model,
      part: r.part,
      spec: r.spec,
      condition: "Untested",
      note: "A label matching part to inspect",
      consent: true,
    })
  ).data;
  await h.call(
    `/requests/${r.id}/action`,
    {
      action: "reserve",
      revision: 1,
      offerId: o.id,
      note: "Verified the actual physical part",
      inspected: true,
    },
    b.key,
  );
  assert.equal(
    (await h.call(`/receipts/${r.id}/${o.id}`, { consent: true }, o.key))
      .status,
    200,
  );
  const fresh = (await h.call("/benches/" + b.id, null, b.key)).data.repairs[0];
  assert.equal(fresh.status, "Waiting for part");
  assert.equal(fresh.offers[0].status, "Withdrawn");
  h.DB.close();
});
test("schema validation, content type, origin, body size and SQL parameter safety", async () => {
  const h = harness();
  assert.equal(
    (await h.call("/benches", { name: "x", demo: false })).status,
    400,
  );
  assert.equal(
    (
      await h.call("/benches", { name: "valid", demo: false }, null, {
        Origin: "https://evil.test",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await h.call("/benches", { name: "valid", demo: false }, null, {
        "Content-Type": "text/plain",
      })
    ).status,
    415,
  );
  assert.equal((await h.call("/benches", "{bad")).status, 400);
  assert.equal(
    (
      await h.call(
        "/benches",
        JSON.stringify({ name: "x".repeat(17000), demo: false }),
      )
    ).status,
    413,
  );
  const { b } = await setup(h);
  const injection = { ...input, title: "'; DROP TABLE benches; --" };
  assert.equal(
    (await h.call(`/benches/${b.id}/requests`, injection, b.key)).status,
    201,
  );
  assert.equal(
    (await h.call("/benches/" + b.id, null, b.key)).data.repairs.length,
    2,
  );
  h.DB.close();
});
test("rate limit and server-side expiry are enforced", async () => {
  const h = harness();
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await h.call("/benches", { name: "Rate test " + i, demo: false }))
        .status,
      201,
    );
  assert.equal(
    (await h.call("/benches", { name: "Eleventh bench", demo: false })).status,
    429,
  );
  const rows = await h.DB.prepare("SELECT id FROM benches LIMIT 1").all();
  await h.DB.prepare("UPDATE benches SET expires=? WHERE id=?")
    .bind(1, rows.results[0].id)
    .run();
  assert.equal((await h.call("/benches/" + rows.results[0].id)).status, 410);
  await worker.scheduled({}, { DB: h.DB });
  assert.equal((await h.call("/benches/" + rows.results[0].id)).status, 404);
  h.DB.close();
});
test("demo fixtures are isolated, marked and mismatch cannot be reserved", async () => {
  const h = harness();
  const b = (await h.call("/benches", { name: "Example bench", demo: true }))
    .data;
  const bench = (await h.call("/benches/" + b.id, null, b.key)).data;
  assert.equal(bench.demo, 1);
  assert.equal(bench.repairs.length, 3);
  const r = bench.repairs.find((r) => r.offers.length);
  assert.equal(r.offers.length, 3);
  const bad = r.offers[1];
  const a = await h.call(
    `/requests/${r.id}/action`,
    {
      action: "reserve",
      revision: 0,
      offerId: bad.id,
      inspected: true,
      note: "Attempt mismatch reservation",
    },
    b.key,
  );
  assert.equal(a.status, 409);
  assert.equal((await h.call("/requests/" + r.id)).data.demo, true);
  h.DB.close();
});
test("static assets carry security policy and unknown endpoints stay 404", async () => {
  const h = harness();
  const res = await worker.fetch(new Request("https://repair.test/"), {
    DB: h.DB,
  });
  assert.equal(res.status, 200);
  assert.match(
    res.headers.get("Content-Security-Policy"),
    /frame-ancestors 'none'/,
  );
  assert.equal(res.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal((await h.call("/missing")).status, 404);
  h.DB.close();
});
