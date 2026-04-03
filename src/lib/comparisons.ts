import type { Settlement, Infrastructure, ServiceModel, Transparency, ComparisonResult } from './schema';

/**
 * Calculate tariff delta between Shelkovo and another settlement
 * Returns absolute delta, percentage delta, and whether other is cheaper
 */
export function calculateTariffDelta(
  shelkovoTariff: number,
  otherTariff: number
): { delta: number; deltaPercent: number; isCheaper: boolean } {
  const delta = shelkovoTariff - otherTariff;
  const deltaPercent = otherTariff !== 0 ? Math.round((delta / otherTariff) * 100) : 0;
  const isCheaper = otherTariff < shelkovoTariff;

  return { delta, deltaPercent, isCheaper };
}

/**
 * Score an availability status for comparison
 * yes = 2, partial = 1, no = 0, unknown/undefined = 0
 */
function scoreStatus(status: string | undefined): number {
  switch (status) {
    case 'yes': return 2;
    case 'partial': return 1;
    case 'no':
    default:
      return 0;
  }
}

/**
 * Compare two infrastructure objects
 * Returns count of items where other is better/worse than baseline
 * Skips comparison when either side is undefined (unknown)
 */
export function compareInfrastructure(
  baseline: Infrastructure,
  other: Infrastructure
): { betterCount: number; worseCount: number; differences: string[] } {
  let betterCount = 0;
  let worseCount = 0;
  const differences: string[] = [];

  const keys = Object.keys(baseline) as Array<keyof Infrastructure>;

  for (const key of keys) {
    const baselineValue = baseline[key];
    const otherValue = other[key];

    // Skip comparison if either side is undefined (unknown)
    if (baselineValue === undefined || otherValue === undefined) {
      continue;
    }

    const baselineScore = scoreStatus(baselineValue);
    const otherScore = scoreStatus(otherValue);

    if (otherScore > baselineScore) {
      betterCount++;
      differences.push(key);
    } else if (otherScore < baselineScore) {
      worseCount++;
      differences.push(key);
    }
  }

  return { betterCount, worseCount, differences };
}

/**
 * Compare two service model objects
 * Skips comparison when either side is undefined (unknown)
 */
export function compareServices(
  baseline: ServiceModel,
  other: ServiceModel
): { betterCount: number; worseCount: number; differences: string[] } {
  let betterCount = 0;
  let worseCount = 0;
  const differences: string[] = [];

  const keys = Object.keys(baseline) as Array<keyof ServiceModel>;

  for (const key of keys) {
    const baselineValue = baseline[key];
    const otherValue = other[key];

    // Skip comparison if either side is undefined (unknown)
    if (baselineValue === undefined || otherValue === undefined) {
      continue;
    }

    const baselineScore = scoreStatus(baselineValue);
    const otherScore = scoreStatus(otherValue);

    if (otherScore > baselineScore) {
      betterCount++;
      differences.push(key);
    } else if (otherScore < baselineScore) {
      worseCount++;
      differences.push(key);
    }
  }

  return { betterCount, worseCount, differences };
}

/**
 * Compare two transparency objects
 */
export function compareTransparency(
  baseline: Transparency,
  other: Transparency
): { betterCount: number; worseCount: number; differences: string[] } {
  let betterCount = 0;
  let worseCount = 0;
  const differences: string[] = [];

  const keys: Array<keyof Transparency> = [
    'has_public_tariff',
    'has_website',
    'has_phone',
    'has_management_info'
  ];

  for (const key of keys) {
    if (key === 'notes') continue;

    const baselineValue = baseline[key];
    const otherValue = other[key];

    if (otherValue && !baselineValue) {
      betterCount++;
      differences.push(key);
    } else if (!otherValue && baselineValue) {
      worseCount++;
      differences.push(key);
    }
  }

  return { betterCount, worseCount, differences };
}

/**
 * Compare a settlement with Shelkovo baseline
 * Returns complete comparison result
 */
export function compareSettlements(
  baseline: Settlement,
  other: Settlement
): ComparisonResult {
  const tariffDelta = calculateTariffDelta(
    baseline.tariff.normalized_per_sotka_month,
    other.tariff.normalized_per_sotka_month
  );

  const infrastructureDelta = compareInfrastructure(
    baseline.infrastructure,
    other.infrastructure
  );

  const servicesDelta = compareServices(
    baseline.service_model,
    other.service_model
  );

  const transparencyDelta = compareTransparency(
    baseline.transparency,
    other.transparency
  );

  return {
    tariffDelta: tariffDelta.delta,
    tariffDeltaPercent: tariffDelta.deltaPercent,
    isCheaper: tariffDelta.isCheaper,
    infrastructureDelta: {
      betterCount: infrastructureDelta.betterCount,
      worseCount: infrastructureDelta.worseCount
    },
    servicesDelta: {
      betterCount: servicesDelta.betterCount,
      worseCount: servicesDelta.worseCount
    },
    transparencyDelta: {
      betterCount: transparencyDelta.betterCount,
      worseCount: transparencyDelta.worseCount
    }
  };
}
