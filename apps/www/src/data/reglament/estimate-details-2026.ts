import type { EstimateDetailDataset } from '@/lib/reglament/detail-schema';
import {
  improvementControlTotals,
  improvementResources,
  improvementWorkItems,
} from '@/data/reglament/estimate-details-2026/improvement';
import {
  landscapingControlTotals,
  landscapingResources,
  landscapingWorkItems,
} from '@/data/reglament/estimate-details-2026/landscaping';
import {
  lightingControlTotals,
  lightingResources,
  lightingWorkItems,
} from '@/data/reglament/estimate-details-2026/lighting';
import {
  securityControlTotals,
  securityResources,
  securityWorkItems,
} from '@/data/reglament/estimate-details-2026/security';
import { estimateDetailSourcePdfs } from '@/data/reglament/estimate-details-2026/shared';
import {
  wasteControlTotals,
  wasteResources,
  wasteWorkItems,
} from '@/data/reglament/estimate-details-2026/waste';

export const estimateDetails2026 = {
  schema_version: '1',
  dataset_id: 'estimate-details-2026',
  title: 'Детальная смета 2026',
  year: 2026,
  source_pdfs: estimateDetailSourcePdfs,
  curation_notes: [
    'Детальные факты извлекаются только из маленьких PDF в apps/www/public/815/regulation/original/; full.pdf для detail-данных не используется.',
    'PDF не парсятся во время runtime или build страницы: этот файл является curated dataset для ручного пополнения.',
    'Каждый будущий work item, resource и control total должен иметь source_refs с PDF, страницей и фрагментом; неоднозначные строки помечаются needs_check.',
  ],
  work_items: [
    ...wasteWorkItems,
    ...securityWorkItems,
    ...lightingWorkItems,
    ...landscapingWorkItems,
    ...improvementWorkItems,
  ],
  resources: [
    ...wasteResources,
    ...securityResources,
    ...lightingResources,
    ...landscapingResources,
    ...improvementResources,
  ],
  control_totals: [
    ...wasteControlTotals,
    ...securityControlTotals,
    ...lightingControlTotals,
    ...landscapingControlTotals,
    ...improvementControlTotals,
  ],
} satisfies EstimateDetailDataset;
