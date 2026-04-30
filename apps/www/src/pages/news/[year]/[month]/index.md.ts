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
  const allArchives = await loadNewsArchives();

  if (!archive) {
    throw new Error(
      `news month archive "${params.year}/${params.month}" not found`,
    );
  }

  const months = allArchives.years.flatMap((item) => item.months);
  const index = months.findIndex((item) => item.id === archive.id);
  const newer = index > 0 ? months[index - 1] : undefined;
  const older =
    index >= 0 && index < months.length - 1 ? months[index + 1] : undefined;

  return new Response(buildNewsMonthMarkdown({ archive, newer, older }), {
    headers: NEWS_MARKDOWN_HEADERS,
  });
};
