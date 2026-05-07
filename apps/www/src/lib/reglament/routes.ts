import { canon, withBase } from '../site';
import { ESTIMATE_SOURCE_PDFS, type EstimateSourcePdf } from './schema';

const REGLAMENT_ROOT = '/reglament/';
const REGLAMENT_MARKDOWN = '/reglament/index.md';
const REGLAMENT_FULL_MARKDOWN = '/reglament/full.md';
const REGLAMENT_DATA_ESTIMATE_2026 = '/reglament/data/estimate-2026.json';
const REGLAMENT_DATA_FULL_2026 = '/reglament/data/full-2026.json';
const REGLAMENT_ASSETS = '/reglament/assets/';
const REGLAMENT_SERVICES = '/reglament/services/';
const REGLAMENT_LLMS = '/reglament/llms.txt';
const REGLAMENT_LLMS_FULL = '/reglament/llms-full.txt';
const REGLAMENT_API_CATALOG = '/reglament/.well-known/api-catalog';
const REGLAMENT_SCHEMA = '/reglament/schemas/estimate-2026.schema.json';
const REGLAMENT_OPENAPI = '/reglament/openapi/estimate-2026.openapi.json';
const REGLAMENT_SOURCE_PDF_ROOT = '/reglament/original/';
const REGLAMENT_FULL_SOURCE_PDF = '/reglament/original/full.pdf';

export type ReglamentSourcePdfPath =
  `/reglament/original/${EstimateSourcePdf}.pdf`;
export type ReglamentFullSourcePdfPath = typeof REGLAMENT_FULL_SOURCE_PDF;

export const reglamentSourcePdfPath = (
  pdf: EstimateSourcePdf,
): ReglamentSourcePdfPath => `${REGLAMENT_SOURCE_PDF_ROOT}${pdf}.pdf`;

export const REGLAMENT_SOURCE_PDF_PATHS = ESTIMATE_SOURCE_PDFS.map(
  reglamentSourcePdfPath,
);

export const reglamentFullSourcePdfPath = (): ReglamentFullSourcePdfPath =>
  REGLAMENT_FULL_SOURCE_PDF;

export const REGLAMENT_PUBLIC_PATHS = [
  REGLAMENT_ROOT,
  REGLAMENT_MARKDOWN,
  REGLAMENT_FULL_MARKDOWN,
  REGLAMENT_DATA_ESTIMATE_2026,
  REGLAMENT_DATA_FULL_2026,
  REGLAMENT_ASSETS,
  REGLAMENT_SERVICES,
  REGLAMENT_LLMS,
  REGLAMENT_LLMS_FULL,
  REGLAMENT_SCHEMA,
  REGLAMENT_OPENAPI,
  REGLAMENT_API_CATALOG,
  REGLAMENT_FULL_SOURCE_PDF,
  ...REGLAMENT_SOURCE_PDF_PATHS,
] as const;

export type ReglamentPublicPath = (typeof REGLAMENT_PUBLIC_PATHS)[number];

export const reglamentPath = (): string => REGLAMENT_ROOT;

export const reglamentMarkdownPath = (): string => REGLAMENT_MARKDOWN;

export const reglamentFullMarkdownPath = (): string => REGLAMENT_FULL_MARKDOWN;

export const reglamentEstimate2026DataPath = (): string =>
  REGLAMENT_DATA_ESTIMATE_2026;

export const reglamentFull2026DataPath = (): string => REGLAMENT_DATA_FULL_2026;

export const reglamentAssetsPath = (): string => REGLAMENT_ASSETS;

export const reglamentServicesPath = (): string => REGLAMENT_SERVICES;

export const reglamentLlmsPath = (): string => REGLAMENT_LLMS;

export const reglamentLlmsFullPath = (): string => REGLAMENT_LLMS_FULL;

export const reglamentApiCatalogPath = (): string => REGLAMENT_API_CATALOG;

export const reglamentEstimate2026SchemaPath = (): string => REGLAMENT_SCHEMA;

export const reglamentEstimate2026OpenApiPath = (): string => REGLAMENT_OPENAPI;

export const reglamentSourcePdfUrl = (pdf: EstimateSourcePdf): string =>
  withBase(reglamentSourcePdfPath(pdf));

export const reglamentFullSourcePdfUrl = (): string =>
  withBase(REGLAMENT_FULL_SOURCE_PDF);

export const reglamentUrl = (): string => withBase(REGLAMENT_ROOT);

export const reglamentMarkdownUrl = (): string => withBase(REGLAMENT_MARKDOWN);

export const reglamentFullMarkdownUrl = (): string =>
  withBase(REGLAMENT_FULL_MARKDOWN);

export const reglamentEstimate2026DataUrl = (): string =>
  withBase(REGLAMENT_DATA_ESTIMATE_2026);

export const reglamentFull2026DataUrl = (): string =>
  withBase(REGLAMENT_DATA_FULL_2026);

export const reglamentAssetsUrl = (): string => withBase(REGLAMENT_ASSETS);

export const reglamentServicesUrl = (): string => withBase(REGLAMENT_SERVICES);

export const reglamentLlmsUrl = (): string => withBase(REGLAMENT_LLMS);

export const reglamentLlmsFullUrl = (): string => withBase(REGLAMENT_LLMS_FULL);

export const reglamentApiCatalogUrl = (): string =>
  withBase(REGLAMENT_API_CATALOG);

export const reglamentEstimate2026SchemaUrl = (): string =>
  withBase(REGLAMENT_SCHEMA);

export const reglamentEstimate2026OpenApiUrl = (): string =>
  withBase(REGLAMENT_OPENAPI);

export const reglamentCanonical = (): string => canon(REGLAMENT_ROOT);
