/**
 * Office identity — [TO-OBTAIN] env slots (brief §7, AC-27).
 * Rendered by server components only. Unset slots render as
 * "يُستكمل قبل الإطلاق" neutral markers; filling them is launch-blocking
 * (CONTENT.md register documents the swap path).
 */

export const office = {
  nameAr: "مكتب نور دمشق العقاري",
  cityAr: "دمشق",
  /** [TO-OBTAIN] رقم الترخيص */
  license: process.env.OFFICE_LICENSE ?? null,
  /** [TO-OBTAIN] اسم المؤسس */
  founderName: process.env.FOUNDER_NAME ?? null,
  /** [TO-OBTAIN] هاتف أرضي 011 */
  landline: process.env.LANDLINE_011 ?? null,
  /** [TO-OBTAIN] عنوان المكتب */
  address: process.env.OFFICE_ADDRESS ?? null,
} as const;

export const TO_OBTAIN_NOTE = "يُستكمل قبل الإطلاق";
