# iFixit / local

A private workbench for community computer repair: request a diagnosed part, compare donor labels, record a handover and follow through to the repair outcome.

**[Open the working website](https://ifixit-tan.vercel.app/)** · [Research](docs/RESEARCH.md) · [Specification](docs/SPECIFICATION.md) · [Validation](docs/VALIDATION.md)

Independent Neighborhood Hacks 2026 student project. Not affiliated with iFixit, Inc. No existing iFixit branding or code is used. The code is MIT licensed; the license does not grant rights to third-party names or trademarks.

## Use it

1. Create a workbench using a repair shop or club name. It starts empty, with no fictional activity or impact totals.
2. Save your private access file in **Settings & access**. It is a bearer credential, so keep it private. There is no email recovery.
3. Add a diagnosed request for computer memory, a keyboard, a cooling fan or a hinge. Copy the exact model/revision, part number and specification. Keep personal details out of public fields.
4. Share the public request link with known local donors. They submit a real offer and save their separate private receipt.
5. Review the labels and physically inspect the part. Missing or mismatched labels block reservation on the server. A reservation lasts 48 hours.
6. At a staffed handover, obtain the donor's private code and record receipt. Test the repair; record the result and the device owner's confirmation before counting success.

Donors can withdraw pending or reserved offers. Coordinators can release reservations, close unfilled requests and reopen unresolved repairs. Search, stage filters, private exports and chronological history use saved database records.

## Try the demo

Choose **Open demo workbench** on the landing page. Each visitor gets a separate server-backed workbench with three fictional diagnosed repairs and three donor offers: an exact label match, a mismatch, and an incomplete label. Demo labels use DEMO references and are not real compatibility claims. Use the memory request to compare offers, inspect and reserve a part, open the sample donor receipt, record handover and complete a test. Demo records expire after seven days; they never count as evidence of real repairs. Create a separate empty workbench for real use.

## Control your records

Settings support workbench renaming, a fresh 30-day retention window, private access-file export/restore, key rotation, repair-record export, leaving a device and permanent active-database deletion. Rotation invalidates previous coordinator keys; donor keys remain separate. Deletion invalidates the workbench's public request and receipt links. Host backups can retain deleted data temporarily.

This is capability access, not per-person accounts or verified technician identity. Anyone holding a coordinator key can act as that coordinator. Browser local storage is not encrypted. Share public request links rather than access files.

## Architecture

React + esbuild frontend, Cloudflare Worker API and D1 SQLite storage. Vercel serves the public `vercel.app` URL through a fixed upstream proxy. No open proxy or user-controlled upstream is accepted. The API allows browser mutations from its own origin and the explicit configured production `APP_ORIGIN`; it never trusts arbitrary forwarded hosts. The Vercel preview aliases are not authorized mutation origins.

Strict Zod schemas, prepared SQL, request-size limits, hashed 256-bit access keys, per-IP hourly mutation limits, CSP, privacy headers, public-field minimization and revision-based compare-and-swap guard the workflow. An offer is not a safety certification. Compatibility comparison is exact text matching with only case/whitespace normalization. One request has one active reservation; the app does not maintain global part inventory.

The pilot is intended for a small known community, with a competent repairer and staffed handover desk. No batteries, power supplies, medical or other safety-critical equipment. No payment processing, AI diagnosis, identity verification, automatic emails or SMS. No fabricated interviews, users, pilot repairs, waste totals or carbon savings.

## Local development

Node.js 24 is required for the SQLite development adapter.

```sh
npm ci
npm run build
npm test
npm run dev
```

Open `http://localhost:4173`. Local SQLite data, generated assets, build output and environment files are excluded from source control. Production uses the D1 binding `DB`.

## Deploy your own

Create your own D1 database, run `schema.sql`, build, then deploy `dist/worker.js` as an ES module Worker. Bind `DB`, set the exact allowed production `APP_ORIGIN`, enable its workers.dev route and the daily cleanup cron. `wrangler.example.jsonc` contains placeholders. Use a Vercel project with `vercel.json` pointing to **your** Worker, not this project's shared backend. Keep account credentials out of source and browser bundles. No paid upgrade or API key is required by the application. Provider free-tier quotas and account-wide limits apply; a reverse proxy can aggregate IP rate limits for multiple visitors.

## Contributing and security

Read [SECURITY.md](SECURITY.md). Public source can be read and forked; public visibility does not grant write/merge permission. Owner review is the contribution policy. CODEOWNERS records the owner. Activation of the prepared remote branch rules currently requires GitHub account verification; see the current status in docs/VALIDATION.md. CI has read-only contents permission, does not deploy, does not approve PRs, and does not use `pull_request_target`. No auto-merge bot is configured. Review any suggested dependency update before merging.

The 16 automated domain/API tests cover authorization, public/receipt isolation, matching, state transitions, stale revisions, expiry, validation, management controls and the proxy-origin boundary. Browser checks and their limits are recorded in `docs/VALIDATION.md`. Passing tests are evidence for those checks, not a guarantee of complete security or judging scores.

## Research and authorship

Built for Environment & Sustainability. Primary repair-network data motivates the problem; local firsthand evidence and a real partner pilot are still pending. ChatGPT/Codex assisted research, implementation, design and testing. Better Design iOS references and Lumen glass/spacing guidance informed the UI. System fonts are used, with no remote font requests. Open-source dependencies are credited in `THIRD_PARTY_NOTICES.md`.

The 1080p, 4-minute-19-second Hyperframes walkthrough, synthetic English narration, captions, project thumbnail and 15 gallery captures are prepared. The 15 captioned images and thumbnail are saved to the Devpost draft; the complete MP4 is also packaged as a supporting attachment. YouTube verification is still needed for the embedded demo URL. The Devpost entry remains a draft.
