import { estimate2026 } from '@/data/reglament/estimate-2026';

import {
  calculateEstimate,
  type CalculatedEstimate,
  type CalculatedEstimateRow,
  type EstimateCalculationChanges,
  type EstimateRowChange,
} from './calculate';
import {
  formatReglamentInputNumber,
  formatReglamentAnnualMoney,
  formatReglamentMoney,
  formatReglamentMoneyDelta,
  formatReglamentNumber,
  formatReglamentTariff,
  formatReglamentTariffValue,
  parseReglamentNumberInput,
} from './format';
import {
  EDITABLE_FIELD_KEYS,
  type CostBreakdown,
  type EditableFieldKey,
} from './schema';

export interface ReglamentCalculatorFieldState {
  readonly rowId: string;
  readonly key: EditableFieldKey;
  readonly baseline: boolean | number;
  readonly value: boolean | number | string;
}

type NumberEditableFieldKey = Exclude<EditableFieldKey, 'enabled'>;
type BreakdownFieldKey = keyof CostBreakdown;
type MutableEstimateRowChange = {
  -readonly [Key in keyof EstimateRowChange]?: EstimateRowChange[Key];
};

const FIELD_SELECTOR = '[data-reglament-field]';
const RESET_SELECTOR = '[data-reglament-reset]';
const ROOT_SELECTOR = '[data-reglament-calculator]';
const CURRENT_TARIFF_SELECTOR = '[data-reglament-current-tariff]';
const CURRENT_TARIFF_TONE_SELECTOR = '[data-reglament-current-tariff-tone]';
const CURRENT_ORIGINAL_TARIFF_SELECTOR =
  '[data-reglament-current-original-tariff]';
const CURRENT_TARIFF_ARROW_SELECTOR = '[data-reglament-current-tariff-arrow]';
const OFFICIAL_TARIFF_TEXT = formatReglamentNumber(
  estimate2026.baseline.tariff_per_sotka_month,
);
const TARIFF_ARROW_TEXT = '→';

const EDITABLE_FIELD_KEY_SET: ReadonlySet<string> = new Set(
  EDITABLE_FIELD_KEYS,
);
const NUMBER_EDITABLE_FIELD_KEYS = EDITABLE_FIELD_KEYS.filter(
  (key): key is NumberEditableFieldKey => key !== 'enabled',
);
const NUMBER_EDITABLE_FIELD_KEY_SET: ReadonlySet<string> = new Set(
  NUMBER_EDITABLE_FIELD_KEYS,
);
const BREAKDOWN_FIELD_KEYS = [
  'primary_salary',
  'machinist_salary',
  'fot',
  'machines',
  'materials',
  'contractors',
  'insurance',
  'overhead',
  'profit',
  'usn',
  'income',
  'vat',
  'gross',
] as const satisfies readonly BreakdownFieldKey[];

const isEditableFieldKey = (
  value: string | undefined,
): value is EditableFieldKey =>
  value !== undefined && EDITABLE_FIELD_KEY_SET.has(value);

const isNumberEditableFieldKey = (
  value: EditableFieldKey,
): value is NumberEditableFieldKey => NUMBER_EDITABLE_FIELD_KEY_SET.has(value);

const toFiniteNumber = (
  value: boolean | number | string,
): number | undefined => {
  if (typeof value === 'boolean') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  return parseReglamentNumberInput(value);
};

const toBoolean = (value: boolean | number | string): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
};

const getRowChange = (
  rows: Record<string, MutableEstimateRowChange>,
  rowId: string,
): MutableEstimateRowChange => {
  rows[rowId] ??= {};

  return rows[rowId];
};

const setNumberRowChange = (
  rowChange: MutableEstimateRowChange,
  key: NumberEditableFieldKey,
  value: number,
): void => {
  rowChange[key] = value;
};

export const buildReglamentCalculatorChanges = (
  fields: readonly ReglamentCalculatorFieldState[],
): EstimateCalculationChanges => {
  const rows: Record<string, MutableEstimateRowChange> = {};

  for (const field of fields) {
    if (field.key === 'enabled') {
      const baseline = toBoolean(field.baseline);
      const value = toBoolean(field.value);

      if (baseline !== undefined && value !== undefined && value !== baseline) {
        getRowChange(rows, field.rowId).enabled = value;
      }

      continue;
    }

    if (!isNumberEditableFieldKey(field.key)) {
      continue;
    }

    const baseline = toFiniteNumber(field.baseline);
    const value = toFiniteNumber(field.value);

    if (baseline !== undefined && value !== undefined && value !== baseline) {
      setNumberRowChange(getRowChange(rows, field.rowId), field.key, value);
    }
  }

  return Object.keys(rows).length > 0 ? { rows } : {};
};

export const calculateReglamentCalculatorState = (
  fields: readonly ReglamentCalculatorFieldState[],
): CalculatedEstimate =>
  calculateEstimate(estimate2026, buildReglamentCalculatorChanges(fields));

const isReglamentCalculatorFieldDirty = (
  field: ReglamentCalculatorFieldState,
): boolean => {
  if (field.key === 'enabled') {
    const baseline = toBoolean(field.baseline);
    const value = toBoolean(field.value);

    return baseline !== undefined && value !== undefined && value !== baseline;
  }

  if (!isNumberEditableFieldKey(field.key)) {
    return false;
  }

  const baseline = toFiniteNumber(field.baseline);
  const value = toFiniteNumber(field.value);

  return baseline !== undefined && (value === undefined || value !== baseline);
};

const deltaTone = (value: number): 'negative' | 'positive' | 'zero' => {
  if (value < 0) {
    return 'negative';
  }

  if (value > 0) {
    return 'positive';
  }

  return 'zero';
};

const setText = (root: ParentNode, selector: string, value: string): void => {
  root.querySelectorAll(selector).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.textContent = value;
    }
  });
};

const setDeltaText = (
  root: ParentNode,
  selector: string,
  value: number,
): void => {
  root.querySelectorAll(selector).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.textContent = formatReglamentMoneyDelta(value);
      node.dataset.reglamentDeltaTone = deltaTone(value);
    }
  });
};

const setCurrentTariffText = (
  root: ParentNode,
  result: CalculatedEstimate,
): void => {
  const tone = deltaTone(result.delta_tariff_per_sotka_month);
  const isBaseline = tone === 'zero';

  setText(
    root,
    CURRENT_TARIFF_SELECTOR,
    formatReglamentTariff(result.tariff_per_sotka_month),
  );
  root.querySelectorAll(CURRENT_TARIFF_TONE_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    if (isBaseline) {
      delete node.dataset.reglamentDeltaTone;
      return;
    }

    node.dataset.reglamentDeltaTone = tone;
  });
  root.querySelectorAll(CURRENT_ORIGINAL_TARIFF_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.textContent = OFFICIAL_TARIFF_TEXT;
      node.hidden = isBaseline;
    }
  });
  root.querySelectorAll(CURRENT_TARIFF_ARROW_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.textContent = TARIFF_ARROW_TEXT;
      node.hidden = isBaseline;
    }
  });
};

const setMatchingText = (
  root: ParentNode,
  selector: string,
  attr: string,
  id: string,
  value: string,
): void => {
  root.querySelectorAll(selector).forEach((node) => {
    if (node instanceof HTMLElement && node.getAttribute(attr) === id) {
      node.textContent = value;
    }
  });
};

const setMatchingDeltaText = (
  root: ParentNode,
  selector: string,
  attr: string,
  id: string,
  value: number,
): void => {
  root.querySelectorAll(selector).forEach((node) => {
    if (node instanceof HTMLElement && node.getAttribute(attr) === id) {
      node.textContent = formatReglamentMoneyDelta(value);
      node.dataset.reglamentDeltaTone = deltaTone(value);
    }
  });
};

const setMatchingRowTariffText = (
  root: ParentNode,
  row: CalculatedEstimateRow,
): void => {
  root.querySelectorAll('[data-reglament-row-tariff]').forEach((node) => {
    if (
      node instanceof HTMLElement &&
      node.getAttribute('data-reglament-row-tariff') === row.id
    ) {
      node.textContent = formatReglamentTariffValue(row.tariff_per_sotka_month);
      const tone = deltaTone(row.delta_tariff_per_sotka_month);

      if (tone === 'zero') {
        delete node.dataset.reglamentDeltaTone;
        return;
      }

      node.dataset.reglamentDeltaTone = tone;
    }
  });
};

const setMatchingBreakdownText = (
  root: ParentNode,
  rowId: string,
  field: BreakdownFieldKey,
  value: string,
): void => {
  root
    .querySelectorAll(
      '[data-reglament-row-breakdown][data-reglament-breakdown-field]',
    )
    .forEach((node) => {
      if (
        node instanceof HTMLElement &&
        node.getAttribute('data-reglament-row-breakdown') === rowId &&
        node.getAttribute('data-reglament-breakdown-field') === field
      ) {
        node.textContent = value;
      }
    });
};

const renderRow = (root: ParentNode, row: CalculatedEstimateRow): void => {
  setMatchingText(
    root,
    '[data-reglament-row-annual]',
    'data-reglament-row-annual',
    row.id,
    formatReglamentAnnualMoney(row.annual_gross),
  );
  setMatchingRowTariffText(root, row);
  BREAKDOWN_FIELD_KEYS.forEach((field) =>
    setMatchingBreakdownText(
      root,
      row.id,
      field,
      formatReglamentMoney(row.breakdown[field]),
    ),
  );

  row.children?.forEach((child) => renderRow(root, child));
};

const renderReglamentCalculator = (
  root: ParentNode,
  result: CalculatedEstimate,
): void => {
  setCurrentTariffText(root, result);
  setText(
    root,
    '[data-reglament-current-annual]',
    formatReglamentAnnualMoney(result.annual_gross),
  );
  setDeltaText(
    root,
    '[data-reglament-current-delta]',
    result.delta_tariff_per_sotka_month,
  );

  for (const section of result.sections) {
    setMatchingText(
      root,
      '[data-reglament-section-tariff]',
      'data-reglament-section-tariff',
      section.id,
      formatReglamentTariff(section.tariff_per_sotka_month),
    );
    setMatchingText(
      root,
      '[data-reglament-section-annual]',
      'data-reglament-section-annual',
      section.id,
      formatReglamentAnnualMoney(section.annual_gross),
    );
    setMatchingDeltaText(
      root,
      '[data-reglament-section-delta]',
      'data-reglament-section-delta',
      section.id,
      section.delta_tariff_per_sotka_month,
    );
    section.rows.forEach((row) => renderRow(root, row));
  }
};

const readReglamentCalculatorField = (
  input: HTMLInputElement,
): ReglamentCalculatorFieldState | undefined => {
  const rowId = input.dataset.reglamentRowId;
  const key = input.dataset.reglamentField;

  if (!rowId || !isEditableFieldKey(key)) {
    return undefined;
  }

  if (key === 'enabled') {
    return {
      rowId,
      key,
      baseline: input.dataset.reglamentBaseline === 'true',
      value: input.checked,
    };
  }

  const baseline = toFiniteNumber(input.dataset.reglamentBaseline ?? '');

  return baseline === undefined
    ? undefined
    : {
        rowId,
        key,
        baseline,
        value: input.value,
      };
};

const readReglamentCalculatorFields = (
  root: ParentNode,
): readonly ReglamentCalculatorFieldState[] =>
  Array.from(root.querySelectorAll(FIELD_SELECTOR)).flatMap((node) => {
    if (!(node instanceof HTMLInputElement)) {
      return [];
    }

    const field = readReglamentCalculatorField(node);

    return field ? [field] : [];
  });

const resetReglamentCalculatorFields = (root: ParentNode): void => {
  root.querySelectorAll(FIELD_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLInputElement)) {
      return;
    }

    if (node.type === 'checkbox') {
      node.checked = node.dataset.reglamentBaseline === 'true';
      return;
    }

    const baseline = toFiniteNumber(node.dataset.reglamentBaseline ?? '');

    node.value =
      baseline === undefined ? '' : formatReglamentInputNumber(baseline);
  });
};

const formatReglamentInput = (input: HTMLInputElement): void => {
  if (input.type === 'checkbox') {
    return;
  }

  const value = toFiniteNumber(input.value);

  if (value !== undefined) {
    input.value = formatReglamentInputNumber(value);
  }
};

const setResetVisibility = (root: ParentNode, isDirty: boolean): void => {
  root.querySelectorAll(RESET_SELECTOR).forEach((node) => {
    if (node instanceof HTMLButtonElement) {
      node.hidden = !isDirty;
    }
  });
};

export const hydrateReglamentCalculator = (root: HTMLElement): void => {
  const render = (): void => {
    const fields = readReglamentCalculatorFields(root);

    renderReglamentCalculator(root, calculateReglamentCalculatorState(fields));
    setResetVisibility(root, fields.some(isReglamentCalculatorFieldDirty));
  };

  if (root.dataset.reglamentCalculatorHydrated === 'true') {
    render();
    return;
  }

  root.dataset.reglamentCalculatorHydrated = 'true';
  root.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement) {
      render();
    }
  });
  root.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      render();
    }
  });
  root.addEventListener(
    'blur',
    (event) => {
      if (event.target instanceof HTMLInputElement) {
        formatReglamentInput(event.target);
      }
    },
    true,
  );
  root.querySelectorAll(RESET_SELECTOR).forEach((node) => {
    if (node instanceof HTMLButtonElement) {
      node.addEventListener('click', () => {
        resetReglamentCalculatorFields(root);
        render();
      });
    }
  });

  render();
};

export const hydrateReglamentCalculators = (scope?: ParentNode): void => {
  const rootScope =
    scope ?? (typeof document === 'undefined' ? undefined : document);

  if (!rootScope) {
    return;
  }

  rootScope.querySelectorAll(ROOT_SELECTOR).forEach((root) => {
    if (root instanceof HTMLElement) {
      hydrateReglamentCalculator(root);
    }
  });
};
