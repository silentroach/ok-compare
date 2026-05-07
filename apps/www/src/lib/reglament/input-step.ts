import type { EditableField, EditableFieldKey } from './schema';

const INTEGER_BASELINE_FIELD_KEYS = [
  'volume',
  'frequency',
] as const satisfies readonly EditableFieldKey[];

const integerBaselineFieldKeys: ReadonlySet<EditableFieldKey> = new Set(
  INTEGER_BASELINE_FIELD_KEYS,
);

export const reglamentNumberInputStep = (
  field: Pick<EditableField, 'key' | 'step'>,
  value: number,
): number => {
  if (field.step !== undefined) {
    return field.step;
  }

  return integerBaselineFieldKeys.has(field.key) && Number.isInteger(value)
    ? 1
    : 0.01;
};
