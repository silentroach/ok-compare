import { readFile } from 'node:fs/promises';

import type { APIRoute, GetStaticPaths } from 'astro';

import {
  ESTIMATE_SOURCE_PDFS,
  type EstimateSourcePdf,
} from '@/lib/reglament/schema';

export const prerender = true;

const sourcePdfSet: ReadonlySet<string> = new Set(ESTIMATE_SOURCE_PDFS);

const isEstimateSourcePdf = (
  value: string | undefined,
): value is EstimateSourcePdf => value !== undefined && sourcePdfSet.has(value);

const sourcePdfFile = (pdf: EstimateSourcePdf): URL =>
  new URL(
    `../../../../../../docs/reglament/original/${pdf}.pdf`,
    import.meta.url,
  );

export const getStaticPaths = (() =>
  ESTIMATE_SOURCE_PDFS.map((pdf) => ({
    params: { pdf },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  if (!isEstimateSourcePdf(params.pdf)) {
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
