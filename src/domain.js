export const categories = ["Memory", "Keyboard", "Cooling fan", "Hinge"];
const norm = (s) => (s || "").trim().replace(/\s+/g, " ").toUpperCase();
export function compare(req, offer) {
  const fields = ["model", "part", "spec"].map((key) => ({
    key,
    wanted: req[key],
    offered: offer[key],
    state: !norm(offer[key])
      ? "unknown"
      : norm(req[key]) === norm(offer[key])
        ? "match"
        : "mismatch",
  }));
  return {
    fields,
    level: fields.some((f) => f.state === "mismatch")
      ? "mismatch"
      : fields.some((f) => f.state === "unknown")
        ? "unknown"
        : "match",
  };
}
export const stages = [
  "Waiting for part",
  "Reserved",
  "Received",
  "Repaired",
  "Not repaired",
  "Closed",
];
export const shortId = (id) => id.slice(0, 6).toUpperCase();
export function cleanExpiry(r, now) {
  if (["Repaired", "Not repaired", "Closed"].includes(r.status)) {
    for (const offer of r.offers) {
      if (offer.status === "Offered") offer.status = "Request finished";
    }
  }
  if (r.status === "Reserved" && r.reservedUntil <= now) {
    const o = r.offers.find((o) => o.id === r.selected);
    if (o) o.status = "Expired";
    r.status = "Waiting for part";
    r.selected = null;
    r.history.push({
      at: now,
      event: "Reservation expired. Request reopened.",
    });
  }
  return r;
}
export function transition(r, a, now) {
  cleanExpiry(r, now);
  const fail = (m) => {
    throw new Error(m);
  };
  const o = r.offers.find((o) => o.id === a.offerId);
  const note = (a.note || "").trim();
  if (a.action === "reserve") {
    if (r.status !== "Waiting for part")
      fail(
        "This request is no longer waiting. Refresh to see its current state.",
      );
    if (!o || o.status !== "Offered") fail("Choose an available offer.");
    if (compare(r, o).level !== "match")
      fail(
        "Every label field must match. Ask the donor for a corrected new offer.",
      );
    if (!a.inspected || note.length < 15)
      fail(
        "Record your label, connector and condition inspection before reserving.",
      );
    o.status = "Reserved";
    o.inspection = note;
    r.selected = o.id;
    r.reservedUntil = now + 48 * 3600_000;
    r.status = "Reserved";
  } else if (a.action === "reject") {
    if (!o || o.status !== "Offered" || note.length < 10)
      fail("Choose a pending offer and explain why it was declined.");
    o.status = "Declined";
    o.review = note;
  } else if (a.action === "release") {
    if (r.status !== "Reserved" || note.length < 10)
      fail("Only a reserved part can be released. Add the reason.");
    r.offers.find((x) => x.id === r.selected).status = "Released";
    r.selected = null;
    r.status = "Waiting for part";
  } else if (a.action === "receive") {
    if (r.status !== "Reserved")
      fail("Reserve a part before recording handover.");
    const selected = r.offers.find((x) => x.id === r.selected);
    if (!a.code || a.code.toUpperCase().replace(/\s/g, "") !== selected.code)
      fail("Handover code does not match the selected donor receipt.");
    if (note.length < 10)
      fail("Record the physical handover and condition check.");
    selected.status = "Received";
    r.status = "Received";
    r.receivedAt = now;
  } else if (a.action === "complete") {
    if (r.status !== "Received") fail("Record the physical handover first.");
    if (!a.outcome || (a.test || "").trim().length < 20)
      fail(
        "Choose an outcome and record what you tested (at least 20 characters).",
      );
    if (a.outcome === "Repaired" && !a.ownerConfirmed)
      fail("Confirm that the device owner accepted the working device.");
    r.status = a.outcome;
    r.outcome = {
      result: a.outcome,
      test: a.test.trim(),
      ownerConfirmed: !!a.ownerConfirmed,
      at: now,
    };
  } else if (a.action === "close") {
    if (r.status !== "Waiting for part" || note.length < 10)
      fail("Only a waiting request can be closed. Add a reason.");
    r.status = "Closed";
  } else if (a.action === "reopen") {
    if (!["Not repaired", "Closed"].includes(r.status) || note.length < 10)
      fail("Add a diagnosis update before reopening.");
    r.status = "Waiting for part";
    r.selected = null;
    r.outcome = null;
  }
  r.history.push({
    at: now,
    event: {
      reserve: "Part reserved after technician check",
      reject: "Offer declined",
      release: "Reservation released",
      receive: "Physical handover recorded",
      complete: `Repair outcome: ${a.outcome}`,
      close: "Request closed",
      reopen: "Request reopened",
    }[a.action],
    note: note || a.test || "",
  });
  return cleanExpiry(r, now);
}
export function metrics(rows) {
  return {
    waiting: rows.filter((r) => r.status === "Waiting for part").length,
    reserved: rows.filter((r) => r.status === "Reserved").length,
    received: rows.filter((r) => r.status === "Received").length,
    repaired: rows.filter((r) => r.status === "Repaired").length,
    unresolved: rows.filter((r) => r.status === "Not repaired").length,
    offers: rows.reduce(
      (n, r) => n + (r.status === "Waiting for part" ? r.offers.filter((o) => o.status === "Offered").length : 0),
      0,
    ),
  };
}
export function publicRepair(r, bench) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    model: r.model,
    part: r.part,
    spec: r.spec,
    diagnosis: r.diagnosis,
    area: r.area,
    purpose: r.purpose,
    status: r.status,
    created: r.created,
    reservedUntil: r.reservedUntil,
    benchName: bench.name,
    demo: !!bench.demo,
  };
}
export function ownerRepair(r) {
  return { ...r, offers: r.offers.map(({ tokenHash, code, ...o }) => o) };
}
export function makeRepair(input, now = Date.now()) {
  return {
    ...input,
    id: crypto.randomUUID(),
    status: "Waiting for part",
    created: now,
    offers: [],
    selected: null,
    history: [{ at: now, event: "Diagnosed request created" }],
  };
}
export function samples(now = Date.now()) {
  const base = { area: "Community collection desk (example)", diagnosed: true };
  return [
    makeRepair(
      {
        ...base,
        title: "Library laptop memory",
        category: "Memory",
        model: "Workshop laptop 14 / revision B",
        part: "DEMO-RAM-8-2400",
        spec: "DDR4 SO-DIMM / 8 GB / 2400",
        diagnosis:
          "Example case: technician isolated the memory module fault. Labels below are fictional fixtures for testing this workflow.",
        purpose: "Return a shared study laptop to use.",
      },
      now,
    ),
    makeRepair(
      {
        ...base,
        title: "A keyboard for the study room",
        category: "Keyboard",
        model: "Workshop laptop 13 / revision A",
        part: "DEMO-KB-13A",
        spec: "US layout / non-backlit / 30-pin",
        diagnosis:
          "Example case: several keys failed the keyboard check. A technician has recorded the required assembly reference.",
        purpose: "Make typing class notes possible again.",
      },
      now,
    ),
    makeRepair(
      {
        ...base,
        title: "Cooling fan for a club laptop",
        category: "Cooling fan",
        model: "Workshop laptop 15 / revision C",
        part: "DEMO-FAN-15C",
        spec: "5 V / 4-pin / revision C",
        diagnosis:
          "Example case: the technician recorded a failed fan. This is sample data, not a repair guide or a real compatibility claim.",
        purpose: "Keep the repair club laptop in service.",
      },
      now,
    ),
  ];
}
