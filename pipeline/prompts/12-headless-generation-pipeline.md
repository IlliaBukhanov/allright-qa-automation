# Task 12 — Bonus headless generation pipeline

User request: “Выполни и эту часть. А я только запущу генерацию” (implement the previously discussed bonus so the engineer only needs to launch generation).

Implement a small Node CLI around existing AGENTS.md, QA test generator SKILL.md, historical prompts and framework. Provide natural-language cases for cart navigation, checkout validation and invalid-token API authorization. Generate structured TypeScript via non-interactive Codex CLI, preserve original output and executed output, typecheck and run each case, capture actual result and HTML report. Keep experiments out of maintained CI, avoid additional project dependencies, support reruns after engineer corrections, and document only confirmed validation. Do not fabricate generated outputs, test results or manual corrections.
