import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

const plugins = [tailwindcss()];
const site = 'https://kpshelkovo.online';
const comparePort = Number(process.env.COMPARE_DEV_PROXY_PORT ?? '4322');
const compareTarget = `http://localhost:${comparePort}`;

function fromCompare(ref: string | undefined): boolean {
  return Boolean(ref && ref.includes('/compare'));
}

function compare(url: string | undefined): boolean {
  return Boolean(url && /^\/compare(?:\/|$)/.test(url));
}

function asset(url: string | undefined): boolean {
  return Boolean(url && /^\/(?:@vite|@id|@fs|src|node_modules)\//.test(url));
}

function proxy(): Plugin {
  return {
    name: 'compare-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url;
        const forward =
          compare(url) || (asset(url) && fromCompare(req.headers.referer));

        if (!forward) {
          next();
          return;
        }

        try {
          const headers = new Headers();

          for (const [key, val] of Object.entries(req.headers)) {
            if (!val || key === 'host' || key === 'connection') continue;
            if (Array.isArray(val)) {
              for (const item of val) headers.append(key, item);
            } else {
              headers.set(key, val);
            }
          }

          const out = await fetch(new URL(url ?? '/', compareTarget), {
            method: req.method,
            headers,
            redirect: 'manual',
          });

          res.statusCode = out.status;

          for (const [key, val] of out.headers.entries()) {
            if (key === 'connection' || key === 'transfer-encoding') continue;
            res.setHeader(key, val);
          }

          if (req.method === 'HEAD') {
            res.end();
            return;
          }

          const body = Buffer.from(await out.arrayBuffer());
          res.end(body);
        } catch (err) {
          next(err as Error);
        }
      });
    },
  };
}

export default defineConfig({
  output: 'static',
  site,
  cacheDir: '../../node_modules/.astro/www',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  outDir: 'dist/site',
  srcDir: 'src',
  publicDir: 'public',
  vite: {
    plugins: [...plugins, proxy()],
  },
  integrations: [
    sitemap({
      customSitemaps: [`${site}/compare/sitemap.xml`],
      filter(page) {
        return !/\/404(?:\/|\.html)?$/.test(page);
      },
    }),
  ],
  build: {
    format: 'directory',
    assets: 'static',
  },
});
