import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type LocationModifier = '=' | '^~' | '~' | '~*';

type NginxLocation = {
  readonly modifier: LocationModifier | undefined;
  readonly pattern: string;
  readonly block: string;
};

const currentDir = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(currentDir, '../pages');
const nginxConfigPath = join(
  currentDir,
  '../../../../ops/nginx/kpshelkovo-online.conf',
);
const htmlCachePolicy = 'public,max-age=60,stale-while-revalidate=300';

const routeParamExamples: Record<string, string> = {
  month: '05',
  event: 'community-day',
  service: 'water',
  tag: 'gkh',
  year: '2026',
};

const listFiles = (dir: string): readonly string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    return entry.isDirectory() ? listFiles(path) : [path];
  });

const normalizeIndexRoute = (route: string): string => {
  if (route === 'index') {
    return '';
  }

  if (route.endsWith('/index')) {
    return route.slice(0, -'/index'.length);
  }

  return route;
};

const pageRouteFiles = (): readonly string[] =>
  listFiles(pagesDir).map((file) =>
    relative(pagesDir, file).replaceAll('\\', '/'),
  );

const htmlRoutePattern = (routeFile: string): string => {
  const route = normalizeIndexRoute(routeFile.replace(/\.astro$/u, ''));

  return route === '' ? '/' : `/${route}/`;
};

const endpointRoutePattern = (routeFile: string): string =>
  `/${routeFile.replace(/\.ts$/u, '')}`;

const samplePath = (routePattern: string): string =>
  routePattern.replace(
    /\[([^\]]+)\]/gu,
    (_, name: string) => routeParamExamples[name] ?? 'example',
  );

const primaryServerBlock = (config: string): string => {
  const [server] = config.match(/^server \{\n[\s\S]*?^\}/mu) ?? [];

  if (server === undefined) {
    throw new Error('Missing primary nginx server block');
  }

  return server;
};

const unquote = (value: string): string => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const parseLocation = (block: string): NginxLocation | undefined => {
  const [headerLine] = block.split('\n');
  const header = headerLine
    ?.trim()
    .replace(/^location\s+/u, '')
    .replace(/\s+\{$/u, '');

  if (header === undefined || header.startsWith('@')) {
    return undefined;
  }

  const modifierMatch = header.match(/^(=|\^~|~\*|~)\s+(.+)$/u);
  const modifier = modifierMatch?.[1] as LocationModifier | undefined;
  const pattern = unquote(modifierMatch?.[2] ?? header);

  return { modifier, pattern, block };
};

const parseLocations = (server: string): readonly NginxLocation[] =>
  [...server.matchAll(/^ {4}location [\s\S]*?^ {4}\}$/gmu)]
    .map(([block]) => parseLocation(block))
    .filter((location): location is NginxLocation => location !== undefined);

const isPrefixLocation = (location: NginxLocation): boolean =>
  location.modifier === undefined || location.modifier === '^~';

const isRegexLocation = (location: NginxLocation): boolean =>
  location.modifier === '~' || location.modifier === '~*';

const matchesRegexLocation = (location: NginxLocation, path: string): boolean =>
  new RegExp(location.pattern, location.modifier === '~*' ? 'iu' : 'u').test(
    path,
  );

const selectLocation = (
  locations: readonly NginxLocation[],
  path: string,
): NginxLocation => {
  const exact = locations.find(
    (location) => location.modifier === '=' && location.pattern === path,
  );

  if (exact !== undefined) {
    return exact;
  }

  const [prefix] = locations
    .filter(
      (location) =>
        isPrefixLocation(location) && path.startsWith(location.pattern),
    )
    .sort((left, right) => right.pattern.length - left.pattern.length);

  if (prefix?.modifier === '^~') {
    return prefix;
  }

  const regex = locations.find(
    (location) =>
      isRegexLocation(location) && matchesRegexLocation(location, path),
  );

  if (regex !== undefined) {
    return regex;
  }

  if (prefix !== undefined) {
    return prefix;
  }

  throw new Error(`No nginx location matches ${path}`);
};

const hasExplicitCacheControl = (block: string): boolean =>
  /add_header\s+Cache-Control\s+(?:"[^"]+"|\$html_cache_control|[^\s;]+)\s+always;/u.test(
    block,
  );

const hasHtmlCacheControl = (block: string): boolean =>
  block.includes('add_header Cache-Control $html_cache_control always;');

const hasAcceptVary = (block: string): boolean =>
  block.includes('add_header Vary Accept always;');

const negotiatesMarkdownByAccept = (block: string): boolean =>
  block.includes('error_page 418 = @markdown;');

const hasMarkdownType = (block: string): boolean =>
  block.includes('default_type text/markdown;') &&
  block.includes('text/markdown md;');

const hasCalendarType = (block: string): boolean =>
  block.includes('default_type text/calendar;') &&
  block.includes('text/calendar ics;');

const hasLinksetType = (block: string): boolean =>
  block.includes('default_type application/linkset+json;');

const locationLabel = (location: NginxLocation): string =>
  `location ${location.modifier === undefined ? '' : `${location.modifier} `}${location.pattern}`;

const assertLocationHas = (
  route: string,
  predicate: (block: string) => boolean,
  expected: string,
): void => {
  const path = samplePath(route);
  const location = selectLocation(locations, path);

  if (!predicate(location.block)) {
    throw new Error(
      `${path} matched ${locationLabel(location)} without ${expected}`,
    );
  }
};

const nginxServer = primaryServerBlock(readFileSync(nginxConfigPath, 'utf-8'));
const locations = parseLocations(nginxServer);
const routeFiles = pageRouteFiles();

const htmlRoutes = routeFiles
  .filter(
    (routeFile) =>
      routeFile.endsWith('.astro') && routeFile !== '815/compare/404.astro',
  )
  .map(htmlRoutePattern)
  .sort();

const endpointRoutes = routeFiles
  .filter((routeFile) => routeFile.endsWith('.ts'))
  .map(endpointRoutePattern)
  .sort();

const markdownRoutes = endpointRoutes.filter((route) => route.endsWith('.md'));
const feedAndDownloadRoutes = endpointRoutes.filter(
  (route) => route.endsWith('/feed.xml') || route.endsWith('.ics'),
);

const isDiscoveryOrDataRoute = (route: string): boolean =>
  route === '/robots.txt' ||
  route === '/llms.txt' ||
  route === '/llms-full.txt' ||
  route.startsWith('/.well-known/') ||
  /^\/(?:news|status|people|815\/(?:compare|regulation))\/(?:data|openapi|schemas)\//u.test(
    route,
  ) ||
  /^\/(?:news|status|people|815\/(?:compare|regulation))\/\.well-known\//u.test(
    route,
  ) ||
  /^\/(?:news|status|people|815\/(?:compare|regulation))\/llms(?:-full)?\.txt$/u.test(
    route,
  );

const discoveryAndDataRoutes = endpointRoutes.filter(isDiscoveryOrDataRoute);

describe('nginx route cache coverage', () => {
  it('keeps current HTML route families covered by the ADR-002 policy', () => {
    expect(htmlRoutes).toMatchInlineSnapshot(`
      [
        "/",
        "/815/compare/",
        "/815/compare/rating/",
        "/815/compare/settlements/[slug]/",
        "/815/regulation/",
        "/815/regulation/assets/",
        "/815/regulation/services/",
        "/meetings/[slug]/",
        "/news/",
        "/news/[year]/",
        "/news/[year]/[month]/",
        "/news/[year]/[month]/[entry]/",
        "/news/tags/",
        "/news/tags/[tag]/",
        "/people/[slug]/",
        "/status/",
        "/status/[service]/",
        "/status/incidents/[year]/[month]/[entry]/",
      ]
    `);
    expect(nginxServer).toContain(
      `set $html_cache_control ${htmlCachePolicy};`,
    );

    for (const route of htmlRoutes) {
      assertLocationHas(
        route,
        hasHtmlCacheControl,
        'ADR-002 HTML Cache-Control',
      );
    }
  });

  it('marks Accept-negotiated HTML routes as varying by Accept', () => {
    const negotiatedHtmlRoutes = htmlRoutes.filter((route) =>
      negotiatesMarkdownByAccept(
        selectLocation(locations, samplePath(route)).block,
      ),
    );

    expect(negotiatedHtmlRoutes).toMatchInlineSnapshot(`
      [
        "/",
        "/815/compare/",
        "/815/compare/rating/",
        "/815/compare/settlements/[slug]/",
        "/meetings/[slug]/",
        "/news/",
        "/news/[year]/",
        "/news/[year]/[month]/",
        "/news/[year]/[month]/[entry]/",
        "/news/tags/",
        "/news/tags/[tag]/",
        "/status/",
        "/status/[service]/",
        "/status/incidents/[year]/[month]/[entry]/",
      ]
    `);

    for (const route of negotiatedHtmlRoutes) {
      assertLocationHas(route, hasAcceptVary, 'Vary: Accept');
    }
  });

  it('serves generated Markdown endpoints with markdown MIME and explicit cache policy', () => {
    expect(markdownRoutes.length).toBeGreaterThan(0);

    for (const route of markdownRoutes) {
      assertLocationHas(route, hasMarkdownType, 'text/markdown MIME');
      assertLocationHas(
        route,
        hasExplicitCacheControl,
        'explicit Cache-Control',
      );
    }
  });

  it('keeps discovery and data endpoints out of generic fallback cache behavior', () => {
    expect(discoveryAndDataRoutes.length).toBeGreaterThan(0);

    for (const route of discoveryAndDataRoutes) {
      assertLocationHas(
        route,
        hasExplicitCacheControl,
        'explicit Cache-Control',
      );

      if (route.endsWith('/.well-known/api-catalog')) {
        assertLocationHas(
          route,
          hasLinksetType,
          'application/linkset+json MIME',
        );
      }
    }
  });

  it('keeps feed and download endpoints covered by their own cache/MIME rules', () => {
    for (const route of [
      ...feedAndDownloadRoutes,
      '/815/regulation/original/example.pdf',
    ]) {
      assertLocationHas(
        route,
        hasExplicitCacheControl,
        'explicit Cache-Control',
      );

      if (route.endsWith('.ics')) {
        assertLocationHas(route, hasCalendarType, 'text/calendar MIME');
      }
    }
  });
});
