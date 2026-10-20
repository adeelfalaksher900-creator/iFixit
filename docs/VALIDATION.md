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

## Live deployment and browser evidence

Cloudflare accepted the production Worker and dedicated D1 binding. The public HTTPS app loaded. The production walkthrough created an isolated example workbench, reviewed a blocked mismatch, reserved a matching fictional part after inspection notes and confirmation, recorded physical handover with the private donor receipt code, and saved an example test plus owner confirmation. Outcomes counted one example repair. These were fictional software checks, not physical repairs.

Further checks on an identical staging build submitted a new donor offer through the public form, reached its private receipt, and removed the receipt key fragment from the address bar. Production access and record files downloaded successfully; the access file restored the same workbench without error. Escape closed the mobile request dialog and returned focus to New request.

Responsive checks used 390px and 768px iframe viewports on an isolated staging origin. At the 390px frame, usable document width and scroll width were both 375px in English and Urdu RTL. The phone detail view's inspected visible buttons were all at least 44px high. The tablet and normal desktop layouts were visually reviewed. This is browser viewport testing, not physical-phone testing. The production framing policy stays DENY; the staging copy permits only its own origin for the viewport harness.

Contrast calculations from final CSS: main text on white 16.37:1, secondary text 6.16:1, green status text on its pale fill 8.81:1. Input borders were strengthened from 2.74:1 to 3.53:1 against white. Native label text remains present. The source design lint reported zero failures; overlay shadows and hexadecimal token padding explain its warnings. A standalone browser design inspector could not run in the local environment, so no inspector certification is claimed.

The browser application is about 279KB JavaScript plus 58KB CSS including the local font before HTTP compression. Validation stays server-side. Content-based asset filenames prevent old cached app files from masking a new deployment. Completed/closed requests retire unused offers; a regression assertion prevents them from remaining in the attention queue. Requests needing review or repair appear first.

## Judging readiness

| Criterion | Evidence prepared | Still needed |
| --- | --- | --- |
| Community Relevance, 25% | Primary-source problem research and bounded local-pilot questions | Creator's firsthand case and actual repairer feedback |
| Impact Potential, 20% | Practical one-desk model and explicit success/failure measures | Pilot results against a real baseline |
| Technical Execution, 20% | Working persistent API, separated access, complete repair loop, 14 passing tests | Physical-device and broader field validation |
| Creativity, 15% | Specific donor/check/handover/outcome workflow and competitor comparison | Judge assessment and real-user feedback |
| Presentation, 10% | Live app, public source, full Devpost draft and technical documentation | Creator-approved 2–6 minute video and final visual assets |
| Accessibility, 10% | Responsive layout, labels, focus, contrast checks, Urdu navigation and RTL | Full translation and assistive-technology sessions |

No percentage score or winning outcome is guaranteed. Draft completion is deliberately separate from final submission.

## Limits of this evidence

No live neighborhood pilot, physical repair, hardware compatibility test, independent owner attestation, screen-reader user session, physical Android/iPhone test, offline operation, heavy load test, exhaustive penetration test or guaranteed judging score is claimed. Full Urdu translation is incomplete. Access files are bearer credentials, with no recovery or revocation beyond expiry in this pilot.

Required final media are pending creator review. Local evidence and enrollment eligibility still need confirmation before final hackathon submission.
