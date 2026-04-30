import type { APIRoute, GetStaticPaths } from 'astro';

import { loadNewsArchives, loadNewsMonth } from '../../../../lib/news/load';
import {
  buildNewsMonthMarkdown,
  NEWS_MARKDOWN_HEADERS,
} from '../../../../lib/news/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const archives = await loadNewsArchives();

  return archives.years.flatMap((item) =>
    item.months.map((month) => ({
      params: {
        year: String(month.year),
        month: String(month.month).padStart(2, '0'),
      },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const year = Number(params.year);
  const month = Number(params.month);
  const archive = await loadNewsMonth(year, month);

  if (!archive) {
    throw new Error(
      `news month archive "${params.year}/${params.month}" not found`,
    );
  }

  return new Response(buildNewsMonthMarkdown({ archive }), {
    headers: NEWS_MARKDOWN_HEADERS,
  });
};
