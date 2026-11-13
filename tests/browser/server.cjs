const { build } = require('esbuild');
const { createServer } = require('node:http');
const path = require('node:path');

build({
  entryPoints: [path.join(__dirname, 'fixture.jsx')],
  bundle: true,
  write: false,
  outfile: 'fixture.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
})
  .then(({ outputFiles }) => {
    const assets = new Map(
      outputFiles.map((file) => ['/' + path.basename(file.path), file.contents])
    );
    createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      const asset = assets.get(url.pathname);
      if (asset) {
        res.setHeader(
          'Content-Type',
          url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript'
        );
        res.end(asset);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(
          '<!doctype html><link rel="stylesheet" href="/fixture.css"><div id="root"></div><script src="/fixture.js"></script>'
        );
      }
    }).listen(4173, '127.0.0.1');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
