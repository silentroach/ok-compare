export const frontmatterScalar = (value: string | number | boolean): string =>
  JSON.stringify(value);

export const frontmatterField = (
  name: string,
  value: string | number | boolean | undefined,
): readonly string[] =>
  value === undefined || value === ''
    ? []
    : [`${name}: ${frontmatterScalar(value)}`];

export const frontmatterArray = (
  name: string,
  values: readonly (string | number | boolean)[],
): readonly string[] =>
  values.length > 0
    ? [`${name}:`, ...values.map((value) => `  - ${frontmatterScalar(value)}`)]
    : [];

export const frontmatterBlock = (
  fields: readonly string[],
): readonly string[] => ['---', ...fields, '---', ''];
