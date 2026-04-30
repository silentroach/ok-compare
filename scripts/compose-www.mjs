import { cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, '..');
const dst = join(root, 'dist', 'www');
const site = join(root, 'apps', 'www', 'dist', 'site');
const cmp = join(root, 'apps', 'compare', 'dist', 'section');

// Generic compose: copies the main site and the compare section.
// New sections (e.g. /news) are picked up automatically from apps/www/dist/site
// and do not require changes here.
await rm(dst, { recursive: true, force: true });
await cp(site, dst, { recursive: true });
await cp(cmp, join(dst, 'compare'), { recursive: true });
