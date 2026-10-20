import { z } from "zod";
const line = (min, max) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine(
      (v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v),
      "Remove control characters",
    );
import { categories } from "./domain.js";
export const requestSchema = z
  .object({
    title: line(4, 90),
    category: z.enum(categories),
    model: line(2, 100),
    part: line(2, 100),
    spec: line(2, 150),
    diagnosis: line(15, 700),
    area: line(2, 80),
    purpose: line(5, 240),
    diagnosed: z.literal(true),
  })
  .strict();
export const offerSchema = z
  .object({
    alias: line(2, 50),
    model: line(0, 100),
    part: line(0, 100),
    spec: line(0, 150),
    condition: z.enum(["Tested working", "Untested"]),
    note: line(10, 500),
    consent: z.literal(true),
  })
  .strict();
export const benchSchema = z
  .object({ name: line(2, 60), demo: z.boolean() })
  .strict();
export const actionSchema = z
  .object({
    action: z.enum([
      "reserve",
      "reject",
      "release",
      "receive",
      "complete",
      "close",
      "reopen",
    ]),
    revision: z.number().int().nonnegative(),
    offerId: z.string().max(60).optional(),
    note: line(0, 700).optional(),
    code: z.string().max(30).optional(),
    inspected: z.boolean().optional(),
    outcome: z.enum(["Repaired", "Not repaired"]).optional(),
    test: z.string().trim().max(700).optional(),
    ownerConfirmed: z.boolean().optional(),
  })
  .strict();

export const managementSchema = z.discriminatedUnion("action",[
 z.object({action:z.literal("rotate")}).strict(),
 z.object({action:z.literal("renew")}).strict(),
 z.object({action:z.literal("rename"),name:line(2,60)}).strict(),
 z.object({action:z.literal("delete"),confirmation:line(2,60)}).strict(),
]);
