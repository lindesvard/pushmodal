const { appendFileSync } = require('node:fs');

async function shouldPublish(pkg, fetchRegistry = fetch) {
  if (pkg.name !== 'pushmodal' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(pkg.version)) {
    throw new Error(
      'The main release workflow only publishes stable pushmodal versions to latest.'
    );
  }

  const response = await fetchRegistry(`https://registry.npmjs.org/pushmodal/${pkg.version}`);
  if (response.status === 404) return true;
  if (!response.ok) throw new Error(`npm registry version check failed: HTTP ${response.status}`);

  const published = await response.json();
  if (published.name !== pkg.name || published.version !== pkg.version) {
    throw new Error('npm registry returned unexpected package metadata.');
  }

  return false;
}

module.exports = { shouldPublish };

if (require.main === module) {
  const pkg = require('../lib/package.json');
  shouldPublish(pkg)
    .then((publish) => {
      console.log(
        `${pkg.name}@${pkg.version}: ${publish ? 'ready to publish to latest' : 'already published; skipping publication'}`
      );
      if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `publish=${publish}\n`);
      }
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
