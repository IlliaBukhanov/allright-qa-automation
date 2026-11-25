import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cases = [
  { id: '01-cart-navigation', project: 'ui', count: 1, reference: 'pipeline/prompts/04-ui-cart-navigation.md', spec: 'test/ui/cart.spec.ts' },
  { id: '02-checkout-validation', project: 'ui', count: 3, reference: 'pipeline/prompts/07-ui-checkout-validation.md', spec: 'test/ui/checkout-validation.spec.ts' },
  { id: '03-api-authorization', project: 'api', count: 1, reference: 'pipeline/prompts/11-api-negative-cases.md', spec: 'test/api/booking-negative.spec.ts' },
];
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rerun = args.includes('--rerun');
const regenerate = args.includes('--regenerate');
const selectors = args.filter(a => !a.startsWith('--'));
// Additional case files use the same Markdown format, with two metadata lines.
for (const selector of selectors) {
  if (cases.some(c => selector === c.id || selector === `pipeline/cases/${c.id}.md`)) continue;
  const match = /^pipeline\/cases\/([a-z0-9][a-z0-9-]{0,79})\.md$/.exec(selector);
  if (!match || !existsSync(resolve(root, selector))) continue;
  const text = readFileSync(resolve(root, selector), 'utf8');
  const project = /^Project: (ui|api)\s*$/m.exec(text)?.[1];
  const count = Number(/^Expected tests: ([1-9][0-9]?)\s*$/m.exec(text)?.[1]);
  if (project && count) cases.push({ id: match[1], project, count, reference: project === 'ui' ? 'test/ui/cart.spec.ts' : 'test/api/booking-negative.spec.ts', spec: project === 'ui' ? 'test/ui/checkout-validation.spec.ts' : 'test/api/booking-crud.spec.ts' });
}
const selected = selectors.length ? cases.filter(c => selectors.includes(c.id) || selectors.includes(`pipeline/cases/${c.id}.md`)) : cases;
const invalid = args.some(a => a.startsWith('--') && !['--dry-run','--rerun','--regenerate'].includes(a));
if (invalid || selectors.length !== 0 && selected.length !== selectors.length || rerun && regenerate) {
  console.error('Usage: npm run generate:test -- [case ID or pipeline/cases/<id>.md] [--dry-run | --regenerate | --rerun]');
  process.exit(2);
}
const read = p => readFileSync(resolve(root, p), 'utf8');
const write = (p, content) => writeFileSync(resolve(root, p), content, 'utf8');
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const schema = 'pipeline/output-schema.json';
const tsc = resolve(root, 'node_modules/typescript/bin/tsc');
const playwright = resolve(root, 'node_modules/@playwright/test/cli.js');

function prompt(c, output) {
  return `Generate exactly ${c.count} runnable Playwright TypeScript test(s) for the INPUT below.\n` +
    `Use ${c.project} project, output path ${output}; imports must be relative to that path (../../../src/...).\n` +
    `Follow the repository instructions and QA skill embedded below. Inspect ${c.reference}, ${c.spec}, and relevant existing source contracts. Reuse existing page objects, fixtures, types, controllers and native Playwright expect. Use named test.step groups and custom assertion messages where helpful. Use native assertions without automatic Expected/Actual snapshot attachments. Current instructions take precedence over historical prompts/specs; historical references are not extra scope.\n` +
    `This is a read-only generation stage: do not edit any files or run tests; the calling script saves output, executes validation and records run evidence. Return JSON with complete raw TypeScript in code and concise assumptions/limitations in notes. No markdown fences. No skip, fixme, only, conditional test suppression, or weakening expectations. No new dependencies, external commands, secrets, filesystem access, or non-demo endpoints in generated code.\n` +
    `--- BEGIN AGENTS.md ---\n${read("AGENTS.md")}\n--- END AGENTS.md ---\n\n` +
    `--- BEGIN QA SKILL.md ---\n${read(".agents/skills/qa-test-generator/SKILL.md")}\n--- END QA SKILL.md ---\n\n` +
    `INPUT:\n${read(`pipeline/cases/${c.id}.md`)}`;
}

function invoke(command, argv, { input, env = process.env, timeout = 600_000, windowsCodex = false } = {}) {
  // On Windows the npm-installed Codex shim is a .cmd. Only fixed, validated relative arguments enter cmd.exe.
  const cmd = windowsCodex ? (process.env.ComSpec || 'cmd.exe') : command;
  const actual = windowsCodex ? ['/d', '/s', '/c', ['codex.cmd', ...argv].join(' ')] : argv;
  const r = spawnSync(cmd, actual, { cwd: root, input, env, encoding: 'utf8', timeout, maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  return { status: r.status, error: r.error?.message ?? null, signal: r.signal, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}
function runStep(dir, summary, name, command, argv, options) {
  console.log(`  ${name}...`);
  const r = invoke(command, argv, options);
  if (r.status !== 0 || r.error) {
    if (r.stdout.trim()) write(`${dir}/${name}.stdout.log`, r.stdout);
    if (r.stderr.trim()) write(`${dir}/${name}.stderr.log`, r.stderr);
  }
  summary.steps[name] = { command: [command, ...argv], exitCode: r.status, error: r.error, signal: r.signal };
  if (r.status !== 0 || r.error) throw new Error(`${name} failed (${r.error ?? r.status ?? r.signal}); see local logs.`);
  return r;
}
function testEnvironment(dir) {
  // Do not pass model/API credentials to generated tests. Keep only runtime/OS essentials.
  const allowed = /^(PATH|Path|HOME|USERPROFILE|SYSTEMROOT|SystemRoot|WINDIR|TEMP|TMP|TMPDIR|LOCALAPPDATA|APPDATA|PROGRAMFILES|ProgramFiles|COMSPEC|ComSpec|PLAYWRIGHT_BROWSERS_PATH|LANG|LC_ALL|CI)$/i;
  return { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.test(key))), PIPELINE_EVIDENCE_DIR: resolve(root, dir), CI: 'true' };
}
function assertResults(dir, c) {
  const report = JSON.parse(read(`${dir}/playwright-results.json`));
  const tests = [];
  function visit(suite) {
    for (const spec of suite.specs ?? []) for (const t of spec.tests ?? []) if (t.projectName === c.project) tests.push({ title: spec.title, status: t.status, expectedStatus: t.expectedStatus, attempts: (t.results ?? []).map(r => r.status) });
    for (const child of suite.suites ?? []) visit(child);
  }
  for (const suite of report.suites ?? []) visit(suite);
  return { tests, pass: tests.length === c.count && tests.every(t => t.status === 'expected' && t.expectedStatus === 'passed' && t.attempts.length > 0 && t.attempts.every(s => s === 'passed')) };
}

function execute(c) {
  const output = `pipeline/generated/${c.project}/${c.id}.spec.ts`;
  const caseDir = `pipeline/examples/${c.id}`;
  const original = `${caseDir}/original.spec.ts.txt`;
  if (dryRun) { console.log(`\n${c.id} -> ${output}\n${prompt(c, output)}`); return true; }
  if (rerun && (!existsSync(resolve(root, output)) || !existsSync(resolve(root, original)))) throw new Error('No generated test and original snapshot to rerun. Generate it first.');
  if (!rerun && !regenerate && existsSync(resolve(root, output))) throw new Error('Generated file already exists. Use --rerun after review or --regenerate to replace it.');
  if (!existsSync(tsc) || !existsSync(playwright)) throw new Error('Install project dependencies with npm ci first.');
  const dir = `${caseDir}/${stamp()}`;
  mkdirSync(resolve(root, dir), { recursive: true });
  mkdirSync(dirname(resolve(root, output)), { recursive: true });
  const summary = { case: c.id, mode: rerun ? 'rerun' : 'generation', output, expectedTestCount: c.count, startedAt: new Date().toISOString(), status: 'NOT_COMPLETED', steps: {}, humanReview: 'Not recorded; see correction notes if supplied by engineer.' };
  copyFileSync(resolve(root, `pipeline/cases/${c.id}.md`), resolve(root, `${dir}/input.md`));
  try {
    if (!rerun) {
      const instruction = prompt(c, output);
      write(`${dir}/prompt.md`, instruction);
      const raw = `${dir}/agent-output.json`;
      runStep(dir, summary, 'generation', 'codex', ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', '--output-schema', schema, '--output-last-message', raw, '-'], { input: instruction, windowsCodex: process.platform === 'win32' });
      const result = JSON.parse(read(raw));
      if (typeof result.code !== 'string' || !result.code.trim() || typeof result.notes !== 'string') throw new Error('Invalid structured agent output');
      write(`${dir}/original.spec.ts.txt`, result.code);
      write(original, result.code);
      write(output, result.code);
      write(`${dir}/agent-notes.md`, result.notes);
    } else copyFileSync(resolve(root, original), resolve(root, `${dir}/original.spec.ts.txt`));
    copyFileSync(resolve(root, output), resolve(root, `${dir}/executed.spec.ts.txt`));
    summary.codeChangedSinceGeneration = read(output) !== read(original);
    const config = `${dir}/tsconfig.json`;
    write(config, JSON.stringify({ extends: '../../../../tsconfig.json', include: ['../../../../src/**/*.ts', '../../../../pipeline/playwright.config.ts', relative(resolve(root, dir), resolve(root, output)).replaceAll('\\', '/')], compilerOptions: { noEmit: true } }, null, 2));
    const env = testEnvironment(dir);
    runStep(dir, summary, 'typecheck', process.execPath, [tsc, '--project', config], { env });
    const target = `${c.id}\\.spec\\.ts$`;
    runStep(dir, summary, 'playwright', process.execPath, [playwright, 'test', '--config', 'pipeline/playwright.config.ts', `--project=${c.project}`, target], { env });
    const check = assertResults(dir, c);
    summary.tests = check.tests;
    if (!check.pass || !existsSync(resolve(root, dir, 'playwright-report/index.html'))) throw new Error('Unexpected test count/status or missing HTML report');
    summary.status = 'PASSED';
  } catch (error) {
    summary.status = 'FAILED'; summary.error = error.message;
    try { summary.tests = assertResults(dir, c).tests; } catch { /* no test report produced */ }
  } finally {
    summary.finishedAt = new Date().toISOString();
    write(`${dir}/result.json`, JSON.stringify(summary, null, 2) + '\n');
    write(`${dir}/RESULT.md`, `# ${c.id} — ${summary.status}\n\nMode: ${summary.mode}\n\n- [Input](input.md)\n- [Machine-readable result](result.json)\n${existsSync(resolve(root, dir, 'original.spec.ts.txt')) ? '- [Original generated code](original.spec.ts.txt)\n' : ''}${existsSync(resolve(root, dir, 'executed.spec.ts.txt')) ? '- [Executed/validated code](executed.spec.ts.txt)\n' : ''}\nExpected scenarios: ${c.count}; reported scenarios: ${summary.tests?.length ?? 0}.\n\n${(summary.tests ?? []).map(t => `- ${t.title}: ${t.status} (${t.attempts.join(', ')})`).join('\n')}\n\nCode changed since generation: ${summary.codeChangedSinceGeneration ?? 'not evaluated'}. Human review: not inferred.\n${summary.error ? `\nFailure: ${summary.error}\n` : ''}`);
    if (!existsSync(resolve(root, caseDir, 'CORRECTIONS.md'))) write(`${caseDir}/CORRECTIONS.md`, '# Engineer review\n\nNot reviewed yet. Record any actual correction, why it was needed, how it was detected, and the corresponding rerun result. If none were needed, record that only after review.\n');
    console.log(`  ${summary.status}: ${dir}/result.json${summary.error ? ` (${summary.error})` : ''}`);
  }
  return summary.status === 'PASSED';
}
let failed = false;
for (const c of selected) {
  console.log(`\n=== ${c.id} ===`);
  try { if (!execute(c)) failed = true; } catch (error) { console.error(error.message); failed = true; }
}
process.exitCode = failed ? 1 : 0;
