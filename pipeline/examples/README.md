# Generation evidence

Successful real Windows run on 25 November 2026, 17:52–17:54 UTC. All three cases passed generation, TypeScript validation and targeted Playwright execution. Five generated tests passed, plus two authentication setup runs.

| Input | Result | Original output | Review / corrections |
| --- | --- | --- | --- |
| [01-cart-navigation](../cases/01-cart-navigation.md) | [1 passed](01-cart-navigation/2026-11-25T17-52-04-899Z/RESULT.md) | [Code](01-cart-navigation/2026-11-25T17-52-04-899Z/original.spec.ts.txt) | [Corrections](01-cart-navigation/CORRECTIONS.md) |
| [02-checkout-validation](../cases/02-checkout-validation.md) | [3 passed](02-checkout-validation/2026-11-25T17-52-57-815Z/RESULT.md) | [Code](02-checkout-validation/2026-11-25T17-52-57-815Z/original.spec.ts.txt) | [Corrections](02-checkout-validation/CORRECTIONS.md) |
| [03-api-authorization](../cases/03-api-authorization.md) | [1 passed](03-api-authorization/2026-11-25T17-53-34-623Z/RESULT.md) | [Code](03-api-authorization/2026-11-25T17-53-34-623Z/original.spec.ts.txt) | [Corrections](03-api-authorization/CORRECTIONS.md) |

Saved original and executed code are identical for each recorded successful generation run; no edits preceded those executions. Saved results apply to the recorded source snapshots; rerun current files to validate the current checkout. Earlier failures and corrections are documented separately and selected original evidence was restored from the earlier archive. Raw logs, agent session output and full HTML reports are local diagnostics, excluded from Git. Result JSON and source snapshots are the compact evidence for reviewers. Human approval is not inferred.

The examples reproduce known cases using existing source and prompts; they are not a blind generation benchmark.
