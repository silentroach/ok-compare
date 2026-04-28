import { cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, '..');
const dst = join(root, 'dist', 'legacy');
const src = join(root, 'apps', 'compare', 'dist', 'legacy');

await rm(dst, { recursive: true, force: true });
await cp(src, dst, { recursive: true });
