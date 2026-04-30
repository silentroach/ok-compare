export const padNumber = (value: number | string, size = 2): string =>
  String(value).padStart(size, '0');
