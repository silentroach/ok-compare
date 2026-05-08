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

type ControlTotalSumMismatch = {
  readonly control_total_id: string;
  readonly issue: string;
  readonly declared_total_rub: number | null;
  readonly resources_without_total?: readonly string[];
  readonly resource_total_rub?: number;
  readonly delta_rub?: number;
  readonly tolerance_rub?: number;
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
  it('captures waste details from waste.pdf', () => {
    const wasteRowIds = new Set([
      'waste-operator-service',
      'waste-transfer-from-homes',
    ]);
    const workItems = estimateDetails2026.work_items
      .filter((item) => wasteRowIds.has(item.estimate_row_id))
      .map((item) => ({
        id: item.id,
        estimate_row_id: item.estimate_row_id,
        service_ids: item.service_ids ?? [],
        status: item.status,
      }));
    const resources = estimateDetails2026.resources
      .filter((resource) => wasteRowIds.has(resource.estimate_row_id))
      .map((resource) => ({
        id: resource.id,
        kind: resource.kind,
        cost_bucket: resource.cost_bucket,
        total_rub: resource.total_rub.value,
        status: resource.status,
      }));
    const controlTotals = estimateDetails2026.control_totals
      .filter((controlTotal) => wasteRowIds.has(controlTotal.estimate_row_id))
      .map((controlTotal) => ({
        id: controlTotal.id,
        cost_bucket: controlTotal.cost_bucket,
        source_total_rub: controlTotal.source_total_rub.value,
        aggregate_total_rub: controlTotal.aggregate_total_rub?.value ?? null,
        status: controlTotal.status,
      }));

    expect({ workItems, resources, controlTotals }).toMatchInlineSnapshot(`
      {
        "controlTotals": [
          {
            "aggregate_total_rub": 7623207.58,
            "cost_bucket": "contractors",
            "id": "waste-operator-contractors",
            "source_total_rub": 7623207.58,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 7623207.58,
            "cost_bucket": "income",
            "id": "waste-operator-income",
            "source_total_rub": 7623208,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 8004368,
            "cost_bucket": "gross",
            "id": "waste-operator-gross",
            "source_total_rub": 8004367.96,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 0,
            "cost_bucket": "materials",
            "id": "waste-operator-materials-calculation-conflict",
            "source_total_rub": 7623208,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 3418555.1,
            "cost_bucket": "primary_salary",
            "id": "waste-transfer-primary-salary",
            "source_total_rub": 3418555.1,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 1364107.2,
            "cost_bucket": "machinist_salary",
            "id": "waste-transfer-machinist-salary",
            "source_total_rub": 1364107.2,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 464303.42,
            "cost_bucket": "machines",
            "id": "waste-transfer-machines",
            "source_total_rub": 464303.42,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 1444364.01,
            "cost_bucket": "insurance",
            "id": "waste-transfer-insurance",
            "source_total_rub": 1444364.01,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 3347863.61,
            "cost_bucket": "overhead",
            "id": "waste-transfer-overhead",
            "source_total_rub": 3347863.61,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 1913064.92,
            "cost_bucket": "profit",
            "id": "waste-transfer-profit",
            "source_total_rub": 1913064.92,
            "status": "verified",
          },
          {
            "aggregate_total_rub": null,
            "cost_bucket": "usn",
            "id": "waste-transfer-usn",
            "source_total_rub": 286960,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 12851178,
            "cost_bucket": "gross",
            "id": "waste-transfer-gross",
            "source_total_rub": 12851177.85,
            "status": "needs_check",
          },
        ],
        "resources": [
          {
            "cost_bucket": "contractors",
            "id": "waste-operator-regional-operator-service",
            "kind": "contractor",
            "status": "needs_check",
            "total_rub": 7623207.58,
          },
          {
            "cost_bucket": "materials",
            "id": "waste-operator-materials-calculation-row",
            "kind": "material",
            "status": "needs_check",
            "total_rub": 7623208,
          },
          {
            "cost_bucket": "vat",
            "id": "waste-operator-vat",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 381160.38,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "waste-transfer-worker-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 3418555.1,
          },
          {
            "cost_bucket": "machinist_salary",
            "id": "waste-transfer-machinist-labor",
            "kind": "machinist_labor",
            "status": "verified",
            "total_rub": 1364107.2,
          },
          {
            "cost_bucket": "machines",
            "id": "waste-transfer-gazel-machine",
            "kind": "machine",
            "status": "verified",
            "total_rub": 464303.42,
          },
          {
            "cost_bucket": "insurance",
            "id": "waste-transfer-worker-insurance",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 1032403.64,
          },
          {
            "cost_bucket": "insurance",
            "id": "waste-transfer-machinist-insurance",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 411960.37,
          },
          {
            "cost_bucket": "overhead",
            "id": "waste-transfer-worker-overhead",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 2392988.57,
          },
          {
            "cost_bucket": "overhead",
            "id": "waste-transfer-machinist-overhead",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 954875.04,
          },
          {
            "cost_bucket": "profit",
            "id": "waste-transfer-worker-profit",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 1367422.04,
          },
          {
            "cost_bucket": "profit",
            "id": "waste-transfer-machinist-profit",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 545642.88,
          },
          {
            "cost_bucket": "usn",
            "id": "waste-transfer-usn",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 286960,
          },
          {
            "cost_bucket": "vat",
            "id": "waste-transfer-vat-document",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 597612.91,
          },
          {
            "cost_bucket": "vat",
            "id": "waste-transfer-vat-derived",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 611960.85,
          },
        ],
        "workItems": [
          {
            "estimate_row_id": "waste-operator-service",
            "id": "waste-operator-service",
            "service_ids": [
              "year-round-solid-waste-removal",
            ],
            "status": "verified",
          },
          {
            "estimate_row_id": "waste-transfer-from-homes",
            "id": "waste-transfer-from-homes",
            "service_ids": [
              "year-round-private-bins-cleaning",
              "year-round-solid-waste-removal",
            ],
            "status": "verified",
          },
        ],
      }
    `);
  });

  it('captures security details from security.pdf', () => {
    const securityRowIds = new Set([
      'security-access-control',
      'security-equipment-maintenance',
      'security-dispatch',
    ]);
    const workItems = estimateDetails2026.work_items
      .filter((item) => securityRowIds.has(item.estimate_row_id))
      .map((item) => ({
        id: item.id,
        estimate_row_id: item.estimate_row_id,
        service_ids: item.service_ids ?? [],
        status: item.status,
      }));
    const resources = estimateDetails2026.resources
      .filter((resource) => securityRowIds.has(resource.estimate_row_id))
      .map((resource) => ({
        id: resource.id,
        kind: resource.kind,
        cost_bucket: resource.cost_bucket,
        total_rub: resource.total_rub.value,
        status: resource.status,
      }));
    const controlTotals = estimateDetails2026.control_totals
      .filter((controlTotal) =>
        securityRowIds.has(controlTotal.estimate_row_id),
      )
      .map((controlTotal) => ({
        id: controlTotal.id,
        cost_bucket: controlTotal.cost_bucket,
        source_total_rub: controlTotal.source_total_rub.value,
        aggregate_total_rub: controlTotal.aggregate_total_rub?.value ?? null,
        status: controlTotal.status,
      }));

    expect({ workItems, resources, controlTotals }).toMatchInlineSnapshot(`
      {
        "controlTotals": [
          {
            "aggregate_total_rub": 8640000,
            "cost_bucket": "contractors",
            "id": "security-access-control-contractors",
            "source_total_rub": 8640000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 1008000,
            "cost_bucket": "materials",
            "id": "security-access-control-materials",
            "source_total_rub": 1008000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 65672.38,
            "cost_bucket": "usn",
            "id": "security-access-control-usn",
            "source_total_rub": 65672.38,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 485683.62,
            "cost_bucket": "vat",
            "id": "security-access-control-vat",
            "source_total_rub": 485683.62,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 10199356,
            "cost_bucket": "gross",
            "id": "security-access-control-gross",
            "source_total_rub": 10199356,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 503202.05,
            "cost_bucket": "primary_salary",
            "id": "security-equipment-primary-salary",
            "source_total_rub": 503202.05,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 10000,
            "cost_bucket": "materials",
            "id": "security-equipment-materials",
            "source_total_rub": 10000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 494584.56,
            "cost_bucket": "contractors",
            "id": "security-equipment-contractors",
            "source_total_rub": 494584.56,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 151967.02,
            "cost_bucket": "insurance",
            "id": "security-equipment-insurance",
            "source_total_rub": 151967.02,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 352241.43,
            "cost_bucket": "overhead",
            "id": "security-equipment-overhead",
            "source_total_rub": 352241.43,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 201280.82,
            "cost_bucket": "profit",
            "id": "security-equipment-profit",
            "source_total_rub": 201280.82,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 11662.22,
            "cost_bucket": "usn",
            "id": "security-equipment-usn",
            "source_total_rub": 11662.22,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 86246.9,
            "cost_bucket": "vat",
            "id": "security-equipment-vat",
            "source_total_rub": 86246.9,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 1811185,
            "cost_bucket": "gross",
            "id": "security-equipment-gross",
            "source_total_rub": 1811185,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 1080000,
            "cost_bucket": "primary_salary",
            "id": "security-dispatch-primary-salary",
            "source_total_rub": 1080000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 326160,
            "cost_bucket": "insurance",
            "id": "security-dispatch-insurance",
            "source_total_rub": 326160,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 756000,
            "cost_bucket": "overhead",
            "id": "security-dispatch-overhead",
            "source_total_rub": 756000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 432000,
            "cost_bucket": "profit",
            "id": "security-dispatch-profit",
            "source_total_rub": 432000,
            "status": "verified",
          },
          {
            "aggregate_total_rub": 17658.1,
            "cost_bucket": "usn",
            "id": "security-dispatch-usn",
            "source_total_rub": 17658.1,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 130590.9,
            "cost_bucket": "vat",
            "id": "security-dispatch-vat",
            "source_total_rub": 130590.9,
            "status": "needs_check",
          },
          {
            "aggregate_total_rub": 2742409,
            "cost_bucket": "gross",
            "id": "security-dispatch-gross",
            "source_total_rub": 2742409,
            "status": "needs_check",
          },
        ],
        "resources": [
          {
            "cost_bucket": "contractors",
            "id": "security-access-control-chop-service",
            "kind": "contractor",
            "status": "verified",
            "total_rub": 8640000,
          },
          {
            "cost_bucket": "materials",
            "id": "security-access-control-kpp-materials",
            "kind": "material",
            "status": "verified",
            "total_rub": 1008000,
          },
          {
            "cost_bucket": "usn",
            "id": "security-access-control-usn",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 65672.38,
          },
          {
            "cost_bucket": "vat",
            "id": "security-access-control-vat-derived",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 485683.62,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "security-equipment-video-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 437513.59,
          },
          {
            "cost_bucket": "materials",
            "id": "security-equipment-video-cameras",
            "kind": "material",
            "status": "verified",
            "total_rub": 10000,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "security-equipment-monitor-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 28919.4,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "security-equipment-server-power-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 10516.15,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "security-equipment-skud-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 26252.91,
          },
          {
            "cost_bucket": "contractors",
            "id": "security-equipment-barrier-contractor",
            "kind": "contractor",
            "status": "verified",
            "total_rub": 360000,
          },
          {
            "cost_bucket": "contractors",
            "id": "security-equipment-domilend-contractor",
            "kind": "contractor",
            "status": "verified",
            "total_rub": 134584.56,
          },
          {
            "cost_bucket": "insurance",
            "id": "security-equipment-insurance",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 151967.02,
          },
          {
            "cost_bucket": "overhead",
            "id": "security-equipment-overhead",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 352241.43,
          },
          {
            "cost_bucket": "profit",
            "id": "security-equipment-profit",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 201280.82,
          },
          {
            "cost_bucket": "usn",
            "id": "security-equipment-usn",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 11662.22,
          },
          {
            "cost_bucket": "vat",
            "id": "security-equipment-vat-derived",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 86246.9,
          },
          {
            "cost_bucket": "primary_salary",
            "id": "security-dispatch-labor",
            "kind": "labor",
            "status": "verified",
            "total_rub": 1080000,
          },
          {
            "cost_bucket": "insurance",
            "id": "security-dispatch-insurance",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 326160,
          },
          {
            "cost_bucket": "overhead",
            "id": "security-dispatch-overhead",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 756000,
          },
          {
            "cost_bucket": "profit",
            "id": "security-dispatch-profit",
            "kind": "other_cost",
            "status": "verified",
            "total_rub": 432000,
          },
          {
            "cost_bucket": "usn",
            "id": "security-dispatch-usn",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 17658.1,
          },
          {
            "cost_bucket": "vat",
            "id": "security-dispatch-vat-derived",
            "kind": "other_cost",
            "status": "needs_check",
            "total_rub": 130590.9,
          },
        ],
        "workItems": [
          {
            "estimate_row_id": "security-access-control",
            "id": "security-access-control",
            "service_ids": [
              "year-round-access-control",
            ],
            "status": "verified",
          },
          {
            "estimate_row_id": "security-equipment-maintenance",
            "id": "security-equipment-maintenance",
            "service_ids": [],
            "status": "verified",
          },
          {
            "estimate_row_id": "security-dispatch",
            "id": "security-dispatch",
            "service_ids": [],
            "status": "verified",
          },
        ],
      }
    `);
  });

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
    const sumMismatches: readonly ControlTotalSumMismatch[] =
      estimateDetails2026.control_totals.flatMap(
        (controlTotal): readonly ControlTotalSumMismatch[] => {
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
                  issue: 'sum mismatch',
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
