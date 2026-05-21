export const AREAS = ['river', 'forest', 'park', 'village'] as const;
export type Area = (typeof AREAS)[number];
