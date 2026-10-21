# Contributing to iFixit / local

Contributions are welcome through pull requests. Adeel, **@adeelfalaksher900-creator**, reviews the proposed code and decides whether to merge it. Do not enable auto-merge or request a bot to approve a change.

## Propose a change

1. Fork the public repository into your own account.
2. Clone your fork and create a branch with a descriptive name.
3. Install dependencies with Node.js 24 and `npm ci`.
4. Make a focused change. Preserve the repair workflow, access boundaries and existing design unless your proposal explains a reason to change them.
5. Run `npm run build`, `npm test` and `npm audit --omit=dev --audit-level=high`.
6. Push to your fork and open a pull request against `main` in this repository.
7. Describe the problem, resulting behavior, checks you ran and any remaining limits. Include a screenshot for a visual change, using fictional records.
8. Wait for Adeel's review. Address comments on the same branch. New commits dismiss earlier approvals, so wait for a fresh review.

A fork is your own copy. Opening a pull request does not grant write access or merge permission here.

## Review and merge policy

The active default-branch rules require pull requests, one approving review, Code Owner review and resolved review conversations. They restrict updates/deletion and block force pushes. Only Adeel's user account has a pull-request-only bypass. No bot or app is in the bypass list. Auto-merge is disabled.

Adeel checks the diff, the **Build and verify** result, dependency changes and any workflow changes, then manually merges or rejects the proposal. The current ruleset does not require the CI status check automatically. An owner-authored pull request uses the owner's PR-only exception because an author cannot approve their own pull request.

## Keep private data out

Never commit:

- Passwords, account API tokens or real environment values.
- Workbench access files, donor receipt keys or live handover codes.
- SQLite databases, production exports or personal repair records.
- Hosting credentials or screenshots containing private access details.

Use isolated fictional records for tests. Test only your own workbench. Discuss a reproducible security defect through the process in [SECURITY.md](SECURITY.md), without publishing credentials or personal data.

## Scope and licensing

The pilot covers diagnosed computer memory, keyboard, fan and hinge requests. Labels are text comparisons, not compatibility certification. Human inspection, code-based handover and recorded testing must retain their explicit checks.

Code contributions are under the repository's MIT license. Credit added dependencies and respect third-party names, trademarks and licenses.
