# Extra Notes

- `waste.pdf` has 13 PDF pages. Dataset `source_refs.page` use PDF page numbers, not printed document page numbers 93-105.
- `waste.pdf` pages 1-5 cover `waste-operator-service`; pages 6-13 cover `waste-transfer-from-homes`.
- In `waste.pdf`, the regional-operator amount is bucketed inconsistently: pages 3-4 classify `7 623 207,58` as third-party services, while page 5 classifies rounded `7 623 208` as material resources. The dataset keeps contractor resources and marks the material bucket conflict as `needs_check`.
- For `waste-transfer-from-homes`, page 11 has direct `НДС 5% 597 612,91`, but `estimate-2026` annual gross `12 851 178` reconciles with page 13 income `12 239 217` plus derived 5% VAT `611 960,85`. The dataset marks this gross/VAT reconciliation as `needs_check`.
- `security.pdf` has 13 PDF pages. Dataset `source_refs.page` use PDF page numbers, not printed document page numbers 106-118.
- `security.pdf` page 1 confirms periodic patrol/rounds as part of CHOP access control, but does not provide route length or patrol frequency; do not copy those facts from `full.pdf` into detail data.
- For security rows, page 12 has direct local-calculation `НДС 5% 697 771,79`, but `estimate-2026` annual gross `14 752 949` reconciles with page 13 income `14 050 428` plus derived 5% VAT `702 521,40`. The dataset marks row-level USN/VAT allocations and gross reconciliations as `needs_check`.
