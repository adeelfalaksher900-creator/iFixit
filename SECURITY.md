# Security boundaries

This is a bounded community-repair pilot, not an identity or safety certification service.

Coordinator and donor receipt access are separate bearer capabilities. A public request ID is not coordinator authorization. The backend checks the owning bench on every coordinator route and checks a donor token against the selected offer on receipt routes. Strict Zod schemas, bound SQLite statements, no cross-origin mutation permission and 16KB request limits guard API inputs. Revision-based compare-and-swap prevents silent lost updates and double reservation within a request.

Public request fields must contain no sensitive information. A donor alias and offer notes are private to that donor and the coordinator. Device-owner confirmation is recorded by the coordinator, not independently signed by the owner. A handover code establishes a workflow event only; it cannot independently prove physical delivery or ownership.

Private access and receipt files are credentials. Local storage is not encrypted. There is no per-person login, key rotation, revocation or forgotten-key recovery. A stolen coordinator file grants that bench's authority until expiry. Do not use this version to store sensitive personal information. Each real bench expires after 30 days; demo benches expire after 7 days. Hosting backups may retain deleted records longer.

Matching is deterministic text comparison, not hardware certification. Actual suitability, condition, ownership, safe handling and repair competence remain human responsibilities. The bounded pilot excludes batteries, power supplies, medical equipment and other safety-critical repairs.

See `docs/VALIDATION.md` for performed tests and untested limits. A clean dependency audit is not proof of absence of vulnerabilities. Report a reproducible defect through the repository's issue tracker without posting private keys or personal records. Test only your own example workbench.
