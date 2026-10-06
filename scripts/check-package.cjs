const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');

for (const [entry, blocked] of [
  ['.', ['@base-ui/']],
  ['./base-ui', ['@radix-ui/']],
  ['./core', ['@radix-ui/', '@base-ui/']],
]) {
  const files = pkg.exports[entry];
  for (const file of Object.values(files)) {
    assert.ok(existsSync(path.join(root, file)), `Missing ${file}`);
  }
  for (const format of ['require', 'import']) {
    const source = readFileSync(path.join(root, files[format]), 'utf8');
    assert.match(source, /["']use client["']/, `Missing client directive: ${entry} (${format})`);
    for (const dependency of blocked) {
      assert.ok(!source.includes(dependency), `${entry} bundles ${dependency}`);
    }
  }
  const declarations = readFileSync(path.join(root, files.types), 'utf8');
  for (const dependency of blocked) {
    assert.ok(!declarations.includes(dependency), `${entry} types reference ${dependency}`);
  }

  // Simulate absent optional peers even when both are installed for development.
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
    const assert = require('node:assert/strict');
    const Module = require('node:module');
    const load = Module._load;
    const blocked = ${JSON.stringify(blocked)};
    Module._load = function (id, ...args) {
      if (blocked.some((prefix) => id.startsWith(prefix))) {
        throw new Error('Optional peer should not be loaded: ' + id);
      }
      return load.call(this, id, ...args);
    };
    const api = require(${JSON.stringify(path.join(root, files.require))});
    const Wrapper = ({ children }) => children;
    const modals = { Example: () => null };
    const instance = api.createPushModal({ modals, Wrapper });
    assert.equal(typeof instance.pushModal, 'function');
    assert.equal(typeof api.createResponsiveWrapper, 'function');
  `,
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
}
console.log('All entry points preserve client directives and isolate optional UI peers.');
