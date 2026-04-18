import type { APIRoute } from 'astro';

import { findBaseline, loadAllData } from '@lib/data';
import { buildSettlementMd } from '@lib/markdown';
import type { Settlement } from '@lib/schema';

export const prerender = true;

export async function getStaticPaths() {
  const { settlements, comparisons, ratings } = await loadAllData();
  const shelkovo = findBaseline(settlements);

  return settlements.map((settlement) => ({
    params: { slug: settlement.slug },
    props: {
      settlement,
      comparison: comparisons.get(settlement.slug),
      shelkovo,
      rating: ratings.get(settlement.slug),
    },
  }));
}

interface Props {
  settlement: Settlement;
  comparison?: {
    tariffDelta: number;
    tariffDeltaPercent: number;
    isCheaper: boolean;
  };
  shelkovo?: Settlement;
  rating?: {
    score: number;
    km: number;
    ring: number;
  };
}

export const GET: APIRoute<Props> = async ({ props }) =>
  new Response(buildSettlementMd(props), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
