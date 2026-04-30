import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const target = process.argv[2];

if (!target) {
  throw new Error('Missing compare build directory');
}

const dir = resolve(process.cwd(), target);
const files = await readdir(dir);
const maps = files
  .filter((name) => /^sitemap-\d+\.xml$/.test(name))
  .sort((a, b) => Number(a.slice(8, -4)) - Number(b.slice(8, -4)));

if (maps.length === 0) {
  process.exit(0);
}

const items = (
  await Promise.all(
    maps.map(async (name) => {
      const xml = await readFile(join(dir, name), 'utf8');
      return xml.match(/<url>.*?<\/url>/g) ?? [];
    }),
  )
).flat();

const first = await readFile(join(dir, maps[0]), 'utf8');
const body = first.replace(/<url>.*?<\/url>/g, '');
const sitemap = body.replace('</urlset>', `${items.join('')}</urlset>`);

await writeFile(join(dir, 'sitemap.xml'), sitemap);
await Promise.all([
  rm(join(dir, 'sitemap-index.xml'), { force: true }),
  rm(join(dir, 'sitemap-index.xml.br'), { force: true }),
  rm(join(dir, 'sitemap-index.xml.gz'), { force: true }),
  ...maps.map((name) => rm(join(dir, name), { force: true })),
  ...maps.flatMap((name) => [
    rm(join(dir, `${name}.br`), { force: true }),
    rm(join(dir, `${name}.gz`), { force: true }),
  ]),
]);
