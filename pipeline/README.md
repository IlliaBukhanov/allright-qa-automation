# Bonus — AI-driven test generation

The optional Node.js runner converts a Markdown test case to Playwright TypeScript via non-interactive `codex exec`, using full `AGENTS.md` and `.agents/skills/qa-test-generator/SKILL.md` content plus references to existing code. It records original output, typechecks, executes the selected case in a separate Playwright configuration and validates the expected test count and status. The main regression suite and CI do not run generated experiments.

## Setup

From the repository root, with Node.js 22 and an authenticated Codex CLI:

```bash
npm ci
npx playwright install chromium
npm install -g @openai/codex
codex login
codex --version
```

On Windows PowerShell use `npm.cmd`, `npx.cmd`, and `codex.cmd` if needed. If Codex is already installed and authenticated, skip installation and login.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run generate:test -- --dry-run` | Print prompts without contacting the model |
| `npm run generate:test` | Generate and run all three cases in a fresh checkout without generated files |
| `npm run generate:test -- 01-cart-navigation --regenerate` | Generate a fresh version of one case, replacing current generated source and its top-level original snapshot |
| `npm run rerun:generated` | Validate and execute existing generated source without calling Codex |
| `npm run rerun:generated -- 02-checkout-validation` | Rerun a single case |

The submitted repository includes existing generated outputs. To verify those, use `rerun:generated`; to reproduce generation, use `--regenerate` after preserving evidence (prefer a separate branch). Timestamped evidence folders remain. Additional cases can be placed in `pipeline/cases/<id>.md` with `Project: ui` or `Project: api` and `Expected tests: N` metadata lines; pass the relative Markdown path as the selector.

## Verified examples

See [generation evidence](examples/README.md) for all three inputs, original generated source, actual execution results and corrections. The final run produced five passing tests (plus two setup executions). The earlier run encountered a TypeScript access error and a CLI argument issue; those are documented in the evidence and worklog. No manual edits to final generated code were needed for the recorded execution. Use `rerun:generated` to validate the current runnable files. Saved evidence refers to the recorded source snapshots.

## Reports and safety

Each timestamp directory contains input, original/executed source and result JSON; full prompts are local diagnostics; the local HTML report can be opened with `npx playwright show-report pipeline/examples/<case>/<timestamp>/playwright-report`. Only nonempty subprocess logs from failed stages are written; these and full reports are local diagnostics ignored by Git. Each run writes RESULT.md and result.json; AI_WORKLOG.md is a curated development summary rather than an automatically appended run transcript. Historical published evidence omits local HTML reports, temporary compiler configurations and raw logs. Review evidence for secrets before publishing. The runner launches generated code locally after generation; read-only Codex mode and a filtered test environment are not a security sandbox for generated JavaScript. Use a disposable trusted environment and review code before rerunning; never use production credentials. Model output is nondeterministic; successful results do not prove future runs will pass or that unseen cases will be correct.
