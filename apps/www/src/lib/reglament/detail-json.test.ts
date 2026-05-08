import { describe, expect, it } from 'vitest';

import { estimateDetails2026 } from '@/data/reglament/estimate-details-2026';

import type { EstimateDetailDataset } from './detail-schema';
import { buildPublicEstimateDetails2026Json } from './detail-json';

type PublicDetailFact = Record<string, unknown> & { readonly id: string };

const hasOwn = (value: unknown, key: string): boolean =>
  Boolean(value) &&
  typeof value === 'object' &&
  Object.prototype.hasOwnProperty.call(value, key);

const sourceRefsFromDataset = (dataset: EstimateDetailDataset) => [
  ...dataset.work_items.flatMap((item) => [
    ...item.source_refs,
    ...(item.needs_check?.source_refs ?? []),
  ]),
  ...dataset.resources.flatMap((resource) => [
    ...resource.source_refs,
    ...(resource.needs_check?.source_refs ?? []),
  ]),
  ...dataset.control_totals.flatMap((controlTotal) => [
    ...controlTotal.source_refs,
    ...(controlTotal.needs_check?.source_refs ?? []),
  ]),
];

describe('estimate details public JSON', () => {
  it('omits raw quote when structured quote_items are present', () => {
    const internalStructuredRefs = sourceRefsFromDataset(estimateDetails2026)
      .filter((ref) => ref.quote_items !== undefined)
      .filter((ref) => hasOwn(ref, 'quote'));
    const publicDataset = JSON.parse(
      buildPublicEstimateDetails2026Json(estimateDetails2026),
    ) as EstimateDetailDataset;
    const publicStructuredQuoteLeaks = sourceRefsFromDataset(publicDataset)
      .filter((ref) => ref.quote_items !== undefined)
      .filter((ref) => hasOwn(ref, 'quote'))
      .map((ref) => ({
        pdf: ref.pdf,
        page: ref.page,
        fragment: ref.fragment,
      }));

    expect(internalStructuredRefs.length).toBeGreaterThan(0);
    expect(publicStructuredQuoteLeaks).toEqual([]);
  });

  it('omits verified status fields and keeps non-verified statuses', () => {
    const internalFacts = [
      ...estimateDetails2026.work_items,
      ...estimateDetails2026.resources,
      ...estimateDetails2026.control_totals,
    ];
    const publicDataset = JSON.parse(
      buildPublicEstimateDetails2026Json(estimateDetails2026),
    ) as {
      readonly work_items: readonly PublicDetailFact[];
      readonly resources: readonly PublicDetailFact[];
      readonly control_totals: readonly PublicDetailFact[];
    };
    const publicFactsById = new Map(
      [
        ...publicDataset.work_items,
        ...publicDataset.resources,
        ...publicDataset.control_totals,
      ].map((fact) => [fact.id, fact]),
    );
    const verifiedLeaks = internalFacts
      .filter((fact) => fact.status === 'verified')
      .filter((fact) => {
        const publicFact = publicFactsById.get(fact.id);

        return (
          hasOwn(publicFact, 'status') || hasOwn(publicFact, 'status_label_ru')
        );
      })
      .map((fact) => fact.id);
    const missingNonVerifiedStatuses = internalFacts
      .filter((fact) => fact.status !== 'verified')
      .filter((fact) => {
        const publicFact = publicFactsById.get(fact.id);

        return (
          publicFact?.status !== fact.status ||
          publicFact.status_label_ru !== fact.status_label_ru
        );
      })
      .map((fact) => fact.id);

    expect(internalFacts.some((fact) => fact.status === 'verified')).toBe(true);
    expect(internalFacts.some((fact) => fact.status !== 'verified')).toBe(true);
    expect(verifiedLeaks).toEqual([]);
    expect(missingNonVerifiedStatuses).toEqual([]);
  });
});
