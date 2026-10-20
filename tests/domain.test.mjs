import { requestSchema, offerSchema } from "../src/validation.js";
import test from "node:test";
import assert from "node:assert/strict";
import {
  compare,
  transition,
  makeRepair,
  metrics,
  cleanExpiry,
} from "../src/domain.js";
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
function fixture() {
  const r = makeRepair(input, 1000);
  r.offers = [
    {
      id: "a",
      model: r.model,
      part: r.part,
      spec: r.spec,
      status: "Offered",
      code: "ABCD12345678",
    },
  ];
  return r;
}
test("exact label comparison permits only case and whitespace normalization", () => {
  const r = fixture(),
    o = r.offers[0];
  assert.equal(compare(r, { ...o, part: " kb-14-b " }).level, "match");
  assert.equal(compare(r, { ...o, part: "KB14B" }).level, "mismatch");
  assert.equal(compare(r, { ...o, spec: "" }).level, "unknown");
  assert.equal(
    compare(r, { ...o, model: "Laptop 14 revision C" }).fields[0].state,
    "mismatch",
  );
});
test("mismatched and missing labels cannot be reserved even with inspection", () => {
  for (const part of ["WRONG", ""]) {
    const r = fixture();
    r.offers[0].part = part;
    assert.throws(() =>
      transition(
        r,
        {
          action: "reserve",
          offerId: "a",
          inspected: true,
          note: "Physically checked all labels",
        },
        2000,
      ),
    );
    assert.equal(r.status, "Waiting for part");
  }
});
test("reserve requires inspection and single allocation", () => {
  const r = fixture();
  assert.throws(() =>
    transition(
      r,
      { action: "reserve", offerId: "a", note: "This is a sufficient note" },
      2000,
    ),
  );
  transition(
    r,
    {
      action: "reserve",
      offerId: "a",
      inspected: true,
      note: "Physically checked labels and condition",
    },
    2000,
  );
  assert.equal(r.status, "Reserved");
  assert.equal(r.reservedUntil, 2000 + 48 * 3600000);
  assert.throws(() =>
    transition(
      r,
      {
        action: "reserve",
        offerId: "a",
        inspected: true,
        note: "Another reservation must fail",
      },
      2001,
    ),
  );
});
test("handover code and owner-confirmed test gate the completed repair", () => {
  const r = fixture();
  transition(
    r,
    {
      action: "reserve",
      offerId: "a",
      inspected: true,
      note: "Labels, connector and condition checked",
    },
    2000,
  );
  assert.throws(() =>
    transition(
      r,
      { action: "receive", code: "wrong", note: "Part received at desk" },
      3000,
    ),
  );
  transition(
    r,
    {
      action: "receive",
      code: "ABCD12345678",
      note: "Part received and physical condition checked",
    },
    3000,
  );
  assert.throws(() =>
    transition(
      r,
      {
        action: "complete",
        outcome: "Repaired",
        test: "All keyboard keys tested over several minutes",
      },
      4000,
    ),
  );
  assert.equal(metrics([r]).repaired, 0);
  transition(
    r,
    {
      action: "complete",
      outcome: "Repaired",
      test: "All keyboard keys tested over several minutes",
      ownerConfirmed: true,
    },
    4000,
  );
  assert.equal(metrics([r]).repaired, 1);
});
test("failed repairs stay unresolved and can reopen for another part", () => {
  const r = fixture();
  r.status = "Received";
  transition(
    r,
    {
      action: "complete",
      outcome: "Not repaired",
      test: "The replacement was received but the original fault remains",
    },
    2000,
  );
  assert.equal(metrics([r]).repaired, 0);
  assert.equal(metrics([r]).unresolved, 1);
  transition(
    r,
    { action: "reopen", note: "Reassessed the underlying assembly fault" },
    3000,
  );
  assert.equal(r.status, "Waiting for part");
  assert.equal(r.outcome, null);
});
test("expired reservations reopen and cannot accept late handover", () => {
  const r = fixture();
  transition(
    r,
    {
      action: "reserve",
      offerId: "a",
      inspected: true,
      note: "Inspected labels connector and condition",
    },
    2000,
  );
  const after = r.reservedUntil + 1;
  cleanExpiry(r, after);
  assert.equal(r.status, "Waiting for part");
  assert.equal(r.offers[0].status, "Expired");
  assert.throws(() =>
    transition(
      r,
      {
        action: "receive",
        code: "ABCD12345678",
        note: "Attempt after the deadline",
      },
      after,
    ),
  );
});
test("strict schemas reject unsupported categories, injected fields and excess length", () => {
  assert.equal(
    requestSchema.safeParse({ ...input, category: "Battery" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...input, diagnosed: false }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...input, title: "x".repeat(91) }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...input, admin: true }).success,
    false,
  );
  assert.equal(
    offerSchema.safeParse({
      alias: "Donor",
      model: "",
      part: "",
      spec: "",
      note: "Part label is unreadable.",
      condition: "Untested",
      consent: true,
    }).success,
    true,
  );
});
