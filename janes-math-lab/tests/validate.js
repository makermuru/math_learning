/* Checks every question generator. Run with: node tests/validate.js
 * Verifies: prompts are present, multiple-choice answers are valid and unique,
 * numeric answers are finite and tidy, no "NaN"/"undefined" text leaks, and
 * each level produces variety (not the same question over and over). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = path.join(__dirname, '..', 'js', 'content.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: 'content.js' });
const { MODULES } = sandbox.window.Content;

const SAMPLES = 400;
let problems = 0;
const fail = (where, msg) => { problems++; console.log(`✗ ${where}: ${msg}`); };

for (const m of MODULES) {
  if (!Array.isArray(m.levels) || m.levels.length !== 4) fail(m.id, 'must have exactly 4 levels');
  if (!m.misconception) fail(m.id, 'missing misconception text');
  m.levels.forEach((gen, i) => {
    const where = `${m.id} L${i + 1}`;
    const seen = new Set();
    for (let s = 0; s < SAMPLES; s++) {
      const q = gen();
      if (!q.prompt || typeof q.prompt !== 'string') fail(where, 'empty prompt');
      if (!q.explain || typeof q.explain !== 'string') fail(where, 'empty explanation');
      if (/NaN|undefined|Infinity/.test(q.prompt + q.explain)) fail(where, `bad text: ${q.prompt}`);
      if (q.kind === 'mc') {
        const set = new Set(q.choices);
        if (q.choices.length < 2) fail(where, `too few choices: ${q.prompt}`);
        if (set.size !== q.choices.length) fail(where, `duplicate choices: ${q.prompt}`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) fail(where, `bad answer index: ${q.prompt}`);
      } else if (q.kind === 'num') {
        if (!Number.isFinite(q.answer)) fail(where, `non-finite answer: ${q.prompt}`);
        if (Math.abs(q.answer * 1000 - Math.round(q.answer * 1000)) > 1e-6) fail(where, `answer has more than 3 decimals: ${q.answer}`);
      } else {
        fail(where, `unknown kind ${q.kind}`);
      }
      seen.add(`${q.prompt} | ${q.visual || ''} | ${q.kind === 'mc' ? q.choices.join('/') : q.answer}`);
    }
    // Variety: a level should produce many distinct prompts.
    if (seen.size < 40) fail(where, `only ${seen.size} distinct prompts in ${SAMPLES} samples`);
    console.log(`  ${where}: ${seen.size} distinct prompts`);
  });
}

console.log(problems ? `\n${problems} problem(s) found.` : '\nAll generators passed.');
process.exit(problems ? 1 : 0);
