import { readFile } from 'node:fs/promises';

import type { APIRoute, GetStaticPaths } from 'astro';

import { ESTIMATE_SOURCE_PDFS } from '@/lib/reglament/schema';

export const prerender = true;

const SOURCE_PDFS = ['full', ...ESTIMATE_SOURCE_PDFS] as const;
type SourcePdf = (typeof SOURCE_PDFS)[number];

const sourcePdfSet: ReadonlySet<string> = new Set(SOURCE_PDFS);

const isSourcePdf = (value: string | undefined): value is SourcePdf =>
  value !== undefined && sourcePdfSet.has(value);

const sourcePdfFile = (pdf: SourcePdf): URL =>
  new URL(
    `../../../../../../docs/reglament/original/${pdf}.pdf`,
    import.meta.url,
  );

export const getStaticPaths = (() =>
  SOURCE_PDFS.map((pdf) => ({
    params: { pdf },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  if (!isSourcePdf(params.pdf)) {
    return new Response(null, { status: 404, statusText: 'Not found' });
  }

  const pdf = await readFile(sourcePdfFile(params.pdf));

  return new Response(pdf, {
    headers: {
      'Content-Disposition': `inline; filename="${params.pdf}.pdf"`,
      'Content-Type': 'application/pdf',
    },
  });
};
