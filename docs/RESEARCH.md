# RepairRelay research and gap analysis

Research checked 19–20 October 2026. Proposed initial setting: one willing local computer repair desk or school repair club. No real partner, interview or pilot has been established in this build.

## Specific problem

A diagnosed repair may remain unfinished because its required part is unavailable or too costly. A donor may hold a useful part without knowing which repair needs it. A general listing often omits revision, connector, condition or outcome. RepairRelay tests whether a coordinator can move a clearly specified part from an offer to a documented repair.

The Open Repair Alliance's 2024 supporting analysis lists 18,921 end-of-life records with a stated barrier: unavailable parts account for 4,676 entries (25%) and expensive parts for 3,362 (18%). This describes its community repair dataset, not all repairs or Pakistan. Repair Café's older analysis of 2021 data also found parts-related reasons in 40% of 525 unsuccessful repairs with recorded reasons. These datasets establish a credible repair barrier; they do not prove local donor supply or product adoption.

Sources:

- [Open Repair Alliance, 2024 supporting data](https://openrepair.org/open-data/insights/2024-report/supporting-data/)
- [Repair Café, 2021 results discussed in April 2022](https://www.repaircafe.org/en/repairmonitor-spare-parts-crucial-for-better-repair/)
- [RepairMonitor 2024 factsheet](https://www.repaircafe.org/wp-content/uploads/2025/04/Factsheet_RepairMonitor_2024_EN.pdf)

## Existing solutions and bounded differentiation

| Existing approach | What it already does | RepairRelay's chosen scope |
| --- | --- | --- |
| [iFixit parts](https://www.ifixit.com/Parts) | Replacement parts and repair information | Local donated-part offers against one diagnosed need |
| [Restarters parts guidance](https://wiki.restarters.net/Spare_parts) | Sourcing, salvage, specifications and part-quality considerations | A field-by-field comparison that preserves uncertainty and requires a technician decision |
| [Restarters/Fixometer](https://wiki.restarters.net/Measuring_impact) | Community repair and recorded device outcomes | A donor receipt and handover event connected to the subsequent outcome |
| General local marketplaces | Broad discovery and seller contact | A narrower form, one request, one reserved offer, explicit failed results and follow-up |

This is a workflow hypothesis. We have not audited every competing platform. No claim of being the first or only parts-matching product is justified.

## Three possible models

| Model | Advantage | Main difficulty | Decision |
| --- | --- | --- | --- |
| Open neighborhood marketplace | Broad reach | Cold start, scams, moderation and inaccurate compatibility | Too broad for this event |
| AI photo diagnosis and part suggestions | Quick demonstration | Unreliable labels, revision differences, safety and hallucinated fits | Excluded |
| Coordinator-led repair desk | Existing technician and donor network, limited scope, observable handover | Manual work and local-partner recruitment | Implemented pilot model |

The repair desk model minimizes the need to build a social network. The coordinator already handles local collection. The software standardizes the information and records the sequence. It cannot create spare parts, guarantee a donor will attend, or replace professional judgement.

## Why the fields matter

Restarters explains that parts differ by device and specification, that used parts may be mislabeled or untested, and that provenance can be uncertain. Our inference is to collect model/revision, exact part reference and specification separately. All three must match before reservation. The system normalizes only case and whitespace. A wrong connector, generation or revision stays a mismatch. Blank fields remain unknown. Even identical strings do not establish electrical or mechanical suitability.

Physical inspection is a coordinator attestation with notes, not an automated verification. Donors receive a private code so a handover can be recorded. The code proves possession of a receipt token within this workflow, not identity, ownership or physical delivery by itself.

## A realistic pilot

Target one willing repairer and ten diagnosed computer repairs over two weeks. Obtain consent before recording any actual case. Limit parts to memory, keyboards, cooling fans and hinges. Record a general staffed collection area and an alias instead of personal identifiers. Do not require a donor to dismantle equipment.

Before using the app, ask:

1. Which three recent repairs waited for a part? What exact assembly was needed?
2. How long did each wait? Was availability, price or uncertainty the main barrier?
3. Where does the repairer source used parts today? Which mismatches recur?
4. Who already holds suitable donor parts? Would they use a request link or prefer coordinator entry?
5. What makes collection trustworthy and workable? Who staffs it?
6. Which test would establish that the repaired device serves its intended use?

Keep findings as dated observations and anonymized notes with consent. Do not write the answers before the conversations happen.

### Measures

| Question | Measure | Definition |
| --- | --- | --- |
| Does a clear request find useful supply? | Time to first inspected usable offer | Request creation to documented technician acceptance |
| Does structure reduce wasted trips? | Mismatch and missing-detail counts | Compare field results, not a guessed AI score |
| Do reservations lead to collection? | Handover / reservation ratio | Report denominator and no-shows, including expired reservations |
| Do collected parts lead to working devices? | Confirmed repairs / received parts | Successful technician test plus device-owner confirmation |
| What remains broken? | Unresolved cases and reasons | Keep unsuccessful outcomes visible |

Baseline the repairer's recent workflow first. A small convenience sample cannot support a population-wide impact estimate. No kilograms or CO2 values should be inferred from a count of offers or repair claims.

## Practical operating model

The pilot is free to donors and device owners. A coordinator runs the desk during existing repair sessions. Donations occur in person, without payments or shipping. The code uses no paid AI or messaging service. A club, school or repair shop could later host its own instance. Local capacity, technician time and donor supply are the constraints. A subscription business or paid marketplace is not necessary to test this model.

## Hackathon fit

Official sources: [Devpost overview](https://neighborhood-hacks-2026.devpost.com/), [resources](https://neighborhood-hacks-2026.devpost.com/resources), [updates](https://neighborhood-hacks-2026.devpost.com/updates), [official rules](https://neighborhoodhacks.org/rules/).

The event requires work created during 16–23 October 2026, disclosure of AI/open-source tools, a project description explaining the real problem, a public repository and a 2–6 minute working demo. The primary track is Environment & Sustainability, with an Education & Access benefit when a study device returns to use. The website is the working prototype; no measured beneficiary impact is claimed.

The published criterion weights are Community Relevance 25%, Impact Potential 20%, Technical Execution 20%, Creativity 15%, Presentation & Clarity 10%, Accessibility 10%. Local evidence remains the largest submission gap. Software checks cannot guarantee a judge's score.

Eligibility requires current high-school or equivalent enrollment. The creator's previously stated gap-year status needs an organizer eligibility decision before final submission. This draft does not attest eligibility or accept final submission terms.

## Remaining uncertainties

- Whether local repairers have enough diagnosed part-waiting cases in these categories.
- Whether reachable donors have the correct parts and will attend collection.
- Whether English technical labels with Urdu navigation are sufficient for intended users.
- Whether a capability-file model is understandable without identity accounts.
- Whether coordinator-reported evidence needs stronger independent owner confirmation.
- Whether running a physical repair desk has the staffing and competence needed for the selected cases.
