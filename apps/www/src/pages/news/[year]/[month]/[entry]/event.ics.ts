import type { APIRoute, GetStaticPaths } from 'astro';
import { padNumber } from '@shelkovo/format';

import {
  articleEventIcsFilename,
  buildArticleEventIcs,
  hasArticleEvent,
} from '@/lib/news/calendar';
import { loadNewsArticle, loadNewsArticles } from '@/lib/news/load';

export const prerender = true;

export const getStaticPaths = (async () => {
  const articles = await loadNewsArticles();

  return articles.filter(hasArticleEvent).map((item) => ({
    params: {
      year: String(item.year),
      month: padNumber(item.month),
      entry: item.entry,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const year = params.year;
  const month = params.month;
  const entry = params.entry;

  if (!year || !month || !entry) {
    throw new Error('news article event params are required');
  }

  const article = await loadNewsArticle(`${year}/${month}/${entry}`);

  if (!article?.event) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(buildArticleEventIcs(article), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${articleEventIcsFilename(article)}"`,
    },
  });
};
