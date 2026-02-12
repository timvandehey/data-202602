// build.js
import { cp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SRC_DIR = 'src';
const DIST_DIR = 'dist';

async function build() {
  console.log('Cleaning dist directory...');
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR);

  console.log('Copying src to dist...');
  await cp(SRC_DIR, DIST_DIR, { recursive: true });

  console.log('Injecting PWA features into index.html...');
  const indexPath = join(DIST_DIR, 'index.html');
  let html = await readFile(indexPath, 'utf-8');

  // 1. Add manifest link
  html = html.replace(
    '<head>',
    `<head>
    <link rel="manifest" href="manifest.json">`
  );

  // 2. Add Service Worker registration module
  html = html.replace(
    '</body>',
    `    <script type="module" src="sw-register.js"></script>
</body>`
  );

  // 3. Update Title for Prod (optional)
  html = html.replace('Juris.js Counter', 'Juris.js Counter PWA');

  await writeFile(indexPath, html);
  console.log('Build complete!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
