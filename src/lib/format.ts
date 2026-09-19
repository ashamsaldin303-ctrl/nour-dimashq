/**
 * Arabic numeral + date formatting.
 *
 * DETERMINISTIC BY CONSTRUCTION (manual §4.2 hydration law): digits and
 * thousands separators are converted manually — no ICU variance between
 * server and client. Dates are formatted SERVER-side only and passed as
 * strings. Every formatted number renders inside <bdi class="num">.
 */

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** 118000 -> "١١٨٬٠٠٠" (Arabic-Indic digits, Arabic thousands separator). */
export function arDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]!);
}

/** Whole-dollar USD price -> "١١٨٬٠٠٠" (Arabic-Indic digits, Arabic thousands separator ٬). */
export function formatUsd(n: number): string {
  return n.toLocaleString("en-US").replace(/,/g, "٬").replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]!);
}

/** Arabic plural for listing counts (ICU-like law, manual categories). */
export function countLabel(n: number): string {
  if (n <= 0) return "لا عقارات";
  if (n === 1) return "عقار واحد";
  if (n === 2) return "عقاران";
  if (n >= 3 && n <= 10) return `${arDigits(n)} عقارات`;
  return `${arDigits(n)} عقاراً`;
}

/** Media count: "٥ صور". */
export function photosLabel(n: number): string {
  return `${arDigits(n)} ${n === 1 ? "صورة" : n === 2 ? "صورتان" : "صور"}`;
}

// Damascus (Syria) month names — hand-authored, zero ICU dependency.
const SY_MONTHS = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
] as const;

const p2 = (n: number) => String(n).padStart(2, "0");

/** ISO/UTC date -> "١٩ أيلول ٢٠٢٦" (server-side only; pass result as a string). */
export function formatDateAr(date: Date): string {
  const d = new Date(date);
  return `${arDigits(d.getUTCDate())} ${SY_MONTHS[d.getUTCMonth()]} ${arDigits(d.getUTCFullYear())}`;
}

/** ISO/UTC date -> "١٩/٠٩/٢٠٢٦" (short stamp for cards). */
export function formatDateShortAr(date: Date): string {
  const d = new Date(date);
  return arDigits(`${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`);
}

/** Floor display: 3/5 -> "الطابق ٣ من ٥" · 0/1 -> "طابق أرضي". */
export function floorLabel(floor: number | null, totalFloors: number | null): string | null {
  if (floor === null) return null;
  if (floor === 0) return totalFloors ? `طابق أرضي من ${arDigits(totalFloors)}` : "طابق أرضي";
  return totalFloors
    ? `الطابق ${arDigits(floor)} من ${arDigits(totalFloors)}`
    : `الطابق ${arDigits(floor)}`;
}

/** 165 -> "١٦٥ م²". */
export function areaLabel(areaM2: number): string {
  return `${arDigits(areaM2)} م²`;
}

/** Rooms: 3 -> "٣ غرف" · 1 -> "غرفة واحدة" · 2 -> "غرفتان". */
export function roomsLabel(rooms: number | null): string | null {
  if (rooms === null) return null;
  if (rooms === 1) return "غرفة واحدة";
  if (rooms === 2) return "غرفتان";
  return `${arDigits(rooms)} غرف`;
}

/** Baths: 2 -> "٢ حمّامين"? — keep simple honest: "٢ حمّامات/حمّام". */
export function bathsLabel(baths: number | null): string | null {
  if (baths === null) return null;
  if (baths === 1) return "حمّام واحد";
  if (baths === 2) return "حمّامان";
  return `${arDigits(baths)} حمّامات`;
}

/** Phone display: "963991234567" -> "+٩٦٣ ٩٩١ ٢٣٤ ٥٦٧" (LTR island). */
export function formatPhoneDisplay(digits: string): string {
  const withPlus = digits.startsWith("+") ? digits : `+${digits}`;
  return arDigits(withPlus);
}
