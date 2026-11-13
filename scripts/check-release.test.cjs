const assert = require('node:assert/strict');
const { test } = require('node:test');
const { shouldPublish } = require('./check-release.cjs');

const pkg = { name: 'pushmodal', version: '1.1.1' };

test('publishes a new stable version when npm returns 404', async () => {
  const result = await shouldPublish(pkg, async (url) => {
    assert.equal(url, 'https://registry.npmjs.org/pushmodal/1.1.1');
    return new Response(null, { status: 404 });
  });
  assert.equal(result, true);
});

test('skips a version already published to npm', async () => {
  assert.equal(await shouldPublish(pkg, async () => Response.json(pkg)), false);
});

test('fails on registry errors instead of treating them as an unpublished version', async () => {
  await assert.rejects(
    shouldPublish(pkg, async () => new Response(null, { status: 503 })),
    /HTTP 503/
  );
  await assert.rejects(
    shouldPublish(pkg, async () => {
      throw new Error('Network unavailable');
    }),
    /Network unavailable/
  );
});

test('rejects unexpected registry metadata', async () => {
  await assert.rejects(
    shouldPublish(pkg, async () => Response.json({ ...pkg, version: '1.1.0' })),
    /unexpected package metadata/
  );
});

test('rejects prerelease versions and unexpected package names before querying npm', async () => {
  const unexpectedFetch = async () => {
    throw new Error('Registry must not be queried');
  };
  for (const candidate of [
    { ...pkg, version: '2.0.0-next.1' },
    { ...pkg, version: '01.1.1' },
    { ...pkg, version: '1.1.1+build' },
    { ...pkg, name: 'another-package' },
  ]) {
    await assert.rejects(
      shouldPublish(candidate, unexpectedFetch),
      /only publishes stable pushmodal/
    );
  }
});
