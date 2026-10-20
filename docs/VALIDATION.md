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

No live neighborhood pilot, physical repair, hardware compatibility test, independent owner attestation, screen-reader user session, physical Android/iPhone test, offline operation, heavy load test, exhaustive penetration test or guaranteed judging score is claimed. Access files remain bearer credentials. Version 2 adds key rotation and deletion, with no email recovery. The current interface is English-only; earlier RTL checks below describe the prior version.

Required final media are pending creator review. Local evidence and enrollment eligibility still need confirmation before final hackathon submission.

## Version 2 redesign validation — 20 October 2026

- Clean build and all **16 domain/API tests pass**. New cases verify cross-workbench management denial, strict management input, immediate old-key rejection after rotation, rename/public-name consistency, renewal, typed deletion/cascade and unaffected independent workbenches. Proxy tests accept the exact production origin and reject hostile origins, spoofed forwarded hosts and cross-site writes.
- Production dependency audit: **0 known vulnerabilities** at the time checked. This is not an exhaustive security audit.
- Live Vercel browser flow: new empty workbench, diagnosed request, public donor offer, separate private receipt, label comparison, documented inspection, reservation, private-code handover, recorded test and owner-confirmed outcome all completed using explicitly fictional QA records. No real repair or impact is claimed.
- Current landing reviewed on desktop and in a 390px QA frame: usable/scroll width **375/375px**, English, system font. Production retains framing DENY; controlled staging alone allows same-origin viewport inspection.
- Better Design landing-copy check: pass, no blocking comprehension findings. The heuristic does not measure actual user comprehension.
- Public code contains no runtime account tokens or private workbench keys. GitHub Actions uses pinned action revisions, read-only contents, a 10-minute timeout and build/test/production dependency checks. CI does not deploy or merge. Repository protection settings must be verified separately from source.

Glossy navigation and temporary layers trade some paint cost for the creator’s chosen iOS appearance; task forms remain opaque for readability. Mobile checks use browser frames, not physical iPhones. No full WCAG certification, pentest certification or 100% judging score is claimed. Local firsthand problem evidence and eligibility confirmation remain submission gaps.

Final responsive checks of the current QA build verified menu activation by pointer and keyboard, settings navigation, the new access-file reminder, 44px-or-larger inspected phone settings buttons, and equal document/scroll widths at 390px and 768px. Mobile review found a search-icon inset conflict and a hidden refresh icon inherited from the previous stylesheet; both are fixed in the final build. Live owner renaming saved and updated the workbench.

GitHub source checkpoint `4c33d5f7a6cbc2351f452418226ab86e844a311f` passed the public Build and verify workflow (run 39401264195). A remote ruleset is fully prepared for the default branch: restricted updates/deletions, blocked force pushes, owner code review, stale-review dismissal, conversation resolution and required GitHub Actions `check`. Only the existing Repository admin role is on the bypass list; no app was added. **Activation is pending GitHub's Confirm access verification.** The rules must not be represented as active until that step succeeds. Auto-merge was observed disabled in repository General settings. No account-wide app permissions were modified.


## Demo entry and media review — October 20, 2026

The landing page now exposes **Open demo workbench**. A new demo has three fictional repair requests and three offers representing matching, mismatched and incomplete labels. Real workbenches start empty. The 16 tests passed after this change; GitHub CI run [39423659857](https://github.com/adeelfalaksher900-creator/iFixit/actions/runs/39423659857) completed successfully for commit `32d5dfa77df9b6b6c9015d5765346e71a2edd634`.

A fresh live session created a fourth fictional request, submitted a public donor offer, opened its separate receipt, reserved it after a simulated inspection, recorded handover and completed a simulated test with owner confirmation. Outcomes showed one clearly labeled example repair. No real physical repair or beneficiary is claimed.

A Hyperframes edited walkthrough was composed from actual website captures and local Kokoro synthetic narration. The final MP4 is H.264/AAC, 1920 × 1080 at 30 fps, 259.366667 seconds and 7,781 frames. Full-file decode passed with no errors. Hyperframes runtime and layout checks passed, all 50 sampled caption/text contrast checks passed, and an additional 15-sample layout sweep found no issues. A hero frame from each of the 18 scenes was reviewed. These checks do not imply every possible visual or accessibility condition was tested.

All 15 gallery captures have nonempty Devpost captions within 140 characters and are saved in order; the separate AI-generated thumbnail is saved too. The MP4 is prepared for a supporting ZIP attachment. The embedded video URL remains blocked by YouTube account verification. GitHub rulesets were rechecked and remain empty: activation of the prepared owner-controlled main-branch rule still requires account verification. CODEOWNERS and CI are present; no active remote branch-protection claim is made.
