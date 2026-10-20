# Validation evidence

Build and test date: 20 October 2026. These checks apply to this prototype, not to every device or future deployment.

## Automated checks completed

`npm run build` passes. `npm test` passes 14 tests. `npm audit --omit=dev --audit-level=low` reported zero known vulnerabilities in the installed production dependencies.

| Area | Tested behavior |
| --- | --- |
| Matching | Case/whitespace normalization; punctuation preserved; model/revision mismatch and unknown fields block reservation |
| State transitions | Inspection required; one allocation; wrong handover code rejected; receipt required before completion; meaningful test and owner confirmation required for success |
| Failure outcomes | Unsuccessful repair stays unresolved; reopening clears old outcome; expired reservation reopens and cannot receive late handover |
| Authorization | Unauthenticated coordinator read rejected; another bench key rejected for reads/writes; coordinator key rejected for a real donor receipt |
| Privacy | Public output excludes offers/history; coordinator output excludes real receipt keys/codes; one receipt reveals one donor's offer |
| Persistence | Full API creation, offer, reservation, handover, completion and reread from SQLite |
| Concurrency | Stale revision rejected after new offer; no silent overwrite |
| Withdrawal | Donor can withdraw their reserved offer and reopen the request |
| Validation | Unsupported part categories, absent diagnosis, excess lengths, unknown fields, malformed JSON, wrong content type and oversized body rejected |
| Input attacks | Bound SQL stores a SQL-like title as data without damaging the database |
| Abuse and lifecycle | Creation rate limit, expired access denial and cleanup removal |
| Delivery | Restricted CSP, no-referrer policy and correct 404 behavior |

API tests execute the built production Worker with an in-memory SQLite adapter that implements the D1 methods used. They are not a managed-D1 load or race benchmark.

## Live deployment evidence

Cloudflare accepted the Worker upload and D1 binding. The public HTTPS home page and example workbench loaded. A real isolated example workbench persisted its three fictional requests. The UI showed matching, mismatch and missing-detail offers. Mismatch reservation was visibly disabled. A matching offer reserved after inspection notes and confirmation. Further live browser checks are recorded as the review proceeds.

The application bundle is approximately 279KB JavaScript plus 57KB CSS including its local font before HTTP compression. Server-only validation is excluded from the browser bundle. No runtime external font, analytics or AI request is required.

## Limits of this evidence

No live neighborhood pilot, physical repair, hardware compatibility test, independent owner attestation, screen-reader user session, physical Android/iPhone test, offline operation, heavy load test, exhaustive penetration test or guaranteed judging score is claimed. Full Urdu translation is incomplete. Access files are bearer credentials, with no recovery or revocation beyond expiry in this pilot.

Required final media are pending creator review. Local evidence and enrollment eligibility still need confirmation before final hackathon submission.
