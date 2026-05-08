import { describe, expect, it } from 'vitest';

import { estimate2026 } from '@/data/reglament/estimate-2026';
import { estimateDetails2026 } from '@/data/reglament/estimate-details-2026';
import { fullReglamentDataset2026 } from '@/data/reglament/full-2026';
import type {
  EstimateDetailControlTotal,
  EstimateDetailResource,
  EstimateDetailSourceRef,
} from '@/lib/reglament/detail-schema';
import type { EstimateRow } from '@/lib/reglament/schema';

type DetailFactWithSourceRefs = {
  readonly fact_id: string;
  readonly source_refs: readonly EstimateDetailSourceRef[];
};

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const round2 = (value: number): number => Math.round(value * 100) / 100;

const flattenRows = (rows: readonly EstimateRow[]): readonly EstimateRow[] =>
  rows.flatMap((row) => [row, ...flattenRows(row.children ?? [])]);

const estimateRowIds = new Set(
  flattenRows(estimate2026.sections.flatMap((section) => section.rows)).map(
    (row) => row.id,
  ),
);

const sourcePdfIds = new Set(
  estimateDetails2026.source_pdfs.map((sourcePdf) => sourcePdf.pdf),
);

const serviceIds = new Set(
  fullReglamentDataset2026.services.map((service) => service.id),
);

const resourcesById = new Map(
  estimateDetails2026.resources.map((resource) => [resource.id, resource]),
);

const detailFactsWithSourceRefs = (): readonly DetailFactWithSourceRefs[] => [
  ...estimateDetails2026.work_items.map((item) => ({
    fact_id: `work_items:${item.id}`,
    source_refs: item.source_refs,
  })),
  ...estimateDetails2026.resources.map((resource) => ({
    fact_id: `resources:${resource.id}`,
    source_refs: resource.source_refs,
  })),
  ...estimateDetails2026.control_totals.map((controlTotal) => ({
    fact_id: `control_totals:${controlTotal.id}`,
    source_refs: controlTotal.source_refs,
  })),
];

const resourcesForControlTotal = (
  controlTotal: EstimateDetailControlTotal,
): readonly EstimateDetailResource[] => {
  if (controlTotal.resource_ids) {
    return controlTotal.resource_ids.flatMap((id) => {
      const resource = resourcesById.get(id);

      return resource ? [resource] : [];
    });
  }

  return estimateDetails2026.resources.filter(
    (resource) =>
      resource.estimate_row_id === controlTotal.estimate_row_id &&
      resource.cost_bucket === controlTotal.cost_bucket,
  );
};

describe('estimate details 2026 dataset', () => {
  it('keeps PDF source refs on every detail fact', () => {
    const facts = detailFactsWithSourceRefs();
    const missingRefs = facts
      .filter((fact) => fact.source_refs.length === 0)
      .map((fact) => fact.fact_id);
    const invalidRefs = facts.flatMap((fact) =>
      fact.source_refs.flatMap((ref, sourceRefIndex) => {
        const errors = [
          sourcePdfIds.has(ref.pdf) ? null : 'unknown pdf',
          Number.isInteger(ref.page) && ref.page > 0 ? null : 'invalid page',
          ref.fragment.trim() ? null : 'empty fragment',
        ].filter((error): error is string => error !== null);

        return errors.length > 0
          ? [
              {
                fact_id: fact.fact_id,
                source_ref_index: sourceRefIndex,
                errors,
              },
            ]
          : [];
      }),
    );

    expect({ missingRefs, invalidRefs }).toEqual({
      missingRefs: [],
      invalidRefs: [],
    });
  });

  it('keeps every estimate_row_id backed by estimate-2026', () => {
    const missingRows = [
      ...estimateDetails2026.work_items.map((item) => ({
        fact_id: `work_items:${item.id}`,
        estimate_row_id: item.estimate_row_id,
      })),
      ...estimateDetails2026.resources.map((resource) => ({
        fact_id: `resources:${resource.id}`,
        estimate_row_id: resource.estimate_row_id,
      })),
      ...estimateDetails2026.control_totals.map((controlTotal) => ({
        fact_id: `control_totals:${controlTotal.id}`,
        estimate_row_id: controlTotal.estimate_row_id,
      })),
    ].filter((item) => !estimateRowIds.has(item.estimate_row_id));

    expect(missingRows).toEqual([]);
  });

  it('keeps every service_id backed by full-2026 when present', () => {
    const missingServices = estimateDetails2026.work_items.flatMap((item) =>
      (item.service_ids ?? [])
        .filter((serviceId) => !serviceIds.has(serviceId))
        .map((serviceId) => ({
          work_item_id: item.id,
          service_id: serviceId,
        })),
    );

    expect(missingServices).toEqual([]);
  });

  it('keeps resource sums aligned with control totals within explicit tolerance', () => {
    const missingTolerance = estimateDetails2026.control_totals
      .filter(
        (controlTotal) =>
          controlTotal.tolerance_rub === undefined ||
          !Number.isFinite(controlTotal.tolerance_rub) ||
          controlTotal.tolerance_rub < 0,
      )
      .map((controlTotal) => controlTotal.id);
    const missingResourceIds = estimateDetails2026.control_totals.flatMap(
      (controlTotal) =>
        (controlTotal.resource_ids ?? [])
          .filter((id) => !resourcesById.has(id))
          .map((resourceId) => ({
            control_total_id: controlTotal.id,
            resource_id: resourceId,
          })),
    );
    const sumMismatches = estimateDetails2026.control_totals.flatMap(
      (controlTotal) => {
        if (controlTotal.tolerance_rub === undefined) {
          return [];
        }

        const declaredTotal =
          controlTotal.detail_total_rub?.value ??
          controlTotal.source_total_rub.value;
        const resources = resourcesForControlTotal(controlTotal);
        const resourcesWithoutTotal = resources
          .filter((resource) => resource.total_rub.value === null)
          .map((resource) => resource.id);

        if (declaredTotal === null || resourcesWithoutTotal.length > 0) {
          return [
            {
              control_total_id: controlTotal.id,
              issue: 'missing comparable totals',
              declared_total_rub: declaredTotal,
              resources_without_total: resourcesWithoutTotal,
            },
          ];
        }

        const resourceTotal = round2(
          sum(resources.map((resource) => resource.total_rub.value ?? 0)),
        );
        const delta = round2(resourceTotal - declaredTotal);

        return Math.abs(delta) <= controlTotal.tolerance_rub
          ? []
          : [
              {
                control_total_id: controlTotal.id,
                declared_total_rub: declaredTotal,
                resource_total_rub: resourceTotal,
                delta_rub: delta,
                tolerance_rub: controlTotal.tolerance_rub,
              },
            ];
      },
    );

    expect({ missingTolerance, missingResourceIds, sumMismatches }).toEqual({
      missingTolerance: [],
      missingResourceIds: [],
      sumMismatches: [],
    });
  });
});
