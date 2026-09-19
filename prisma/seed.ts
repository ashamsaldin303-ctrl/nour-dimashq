/**
 * Nour Dimashq — seed (M1).
 * ALL DATA IS SAMPLE (marked in CONTENT.md; swap path documented there).
 * Idempotent: upserts by unique ref/slug. Run: bun prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const BUILD_DATE = new Date("2026-09-19T00:00:00Z"); // price ritual stamp = build date
const d = (iso: string) => new Date(iso);

const AGENT = {
  nameAr: "أبو محمد الحلبي", // SAMPLE
  titleAr: "مؤسس المكتب", // SAMPLE
  whatsapp: "963991234567", // SAMPLE — digits only, E.164 without +
  isPrimary: true,
};

type SeedListing = {
  ref: string;
  slug: string;
  type: string;
  status: string;
  priceUsd: number;
  priceSyp?: never;
  negotiable: boolean;
  areaM2: number;
  rooms: number;
  baths: number;
  floor: number;
  totalFloors: number;
  direction: string;
  district: string;
  yearBuilt: number;
  features: string[];
  media: { url: string; kind: "photo"; is_ai: false; room: string }[];
  isSignature: boolean;
  verification: string;
  verificationDate?: Date;
  titleAr: string;
  descAr: string;
  listedDate: Date;
  soldDate?: Date;
};

const LISTINGS: SeedListing[] = [
  {
    ref: "APR-2026-118",
    slug: "apartment-mezze-apr-118",
    type: "apartment",
    status: "available",
    priceUsd: 118000,
    negotiable: true,
    areaM2: 165,
    rooms: 3,
    baths: 2,
    floor: 3,
    totalFloors: 5,
    direction: "غربية",
    district: "al-mezze",
    yearBuilt: 2015,
    features: ["elevator", "generator", "solar", "balcony", "waterTank"],
    media: [
      { url: "placeholder:al-mezze", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم الرئيسية" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الحمّام" },
    ],
    isSignature: true,
    verification: "verified",
    verificationDate: d("2026-09-08T00:00:00Z"),
    titleAr: "شقة ١٦٥م² — المزة، إطلالة شارع رئيسي",
    descAr:
      "شقة في بناء طراز حديث (٢٠١٥) مع مصعد، الطابق الثالث من خمسة. واجهة غربية مع شرفة تطل على شارع رئيسي في المزة.\nثلاث غرف وصالة واسعة وحمّامان ومطبخ مفروش خزائن. اشتراك مولّدة عمارة وطاقة شمسية وخزان مياه.\nالعقار موثّق: فُحص السند مقابل السجل العقاري بتاريخ ٨ أيلول ٢٠٢٦.",
    listedDate: d("2026-09-10T00:00:00Z"),
  },
  {
    ref: "APR-2026-102",
    slug: "apartment-maliki-apr-102",
    type: "apartment",
    status: "available",
    priceUsd: 95000,
    negotiable: true,
    areaM2: 140,
    rooms: 2,
    baths: 2,
    floor: 2,
    totalFloors: 4,
    direction: "شرقية",
    district: "al-maliki",
    yearBuilt: 2010,
    features: ["elevator", "solar", "parking"],
    media: [
      { url: "placeholder:al-maliki", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
    ],
    isSignature: true,
    verification: "deed_checked",
    verificationDate: d("2026-09-01T00:00:00Z"),
    titleAr: "شقة ١٤٠م² — المالكي، حي هادئ",
    descAr:
      "شقة في عمارة ٢٠١٠ بطراز جيد، الطابق الثاني من أربعة مع مصعد، في شارع هادئ داخل المالكي.\nغرفتان وصالة وحمّامان، إضاءة طبيعية جيدة بواجهة شرقية صباحية.\nطاقة شمسية للاشتراك وموقف سيارات مخصص. الاطلاع على سند الملكية تم بتاريخ ١ أيلول ٢٠٢٦.",
    listedDate: d("2026-08-28T00:00:00Z"),
  },
  {
    ref: "VIL-2026-031",
    slug: "villa-abu-rummaneh-vil-031",
    type: "villa",
    status: "available",
    priceUsd: 260000,
    negotiable: true,
    areaM2: 320,
    rooms: 5,
    baths: 3,
    floor: 0,
    totalFloors: 2,
    direction: "جنوبية",
    district: "abu-rummaneh",
    yearBuilt: 2005,
    features: ["generator", "solar", "parking", "waterTank", "balcony"],
    media: [
      { url: "placeholder:abu-rummaneh", kind: "photo", is_ai: false, room: "المدخل" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة الرئيسية" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الحديقة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرف النوم" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "التراس" },
    ],
    isSignature: true,
    verification: "verified",
    verificationDate: d("2026-08-20T00:00:00Z"),
    titleAr: "فيلا ٣٢٠م² — أبو رمانة، حديقة خاصة",
    descAr:
      "فيلا طابقان (بناء ٢٠٠٥) في أهدى شوارع أبو رمانة، حديقة خاصة ومدخل مستقل مع موقف سيارات.\nخمس غرف وصالة مزدوجة وثلاثة حمّامات ومطبخ راكب، واجهة جنوبية وشرفة تراس مطلة على الحديقة.\nمولّدة خاصة وطاقة شمسية وخزانان. العقار موثّق: فُحص السند مقابل السجل العقاري بتاريخ ٢٠ آب ٢٠٢٦.",
    listedDate: d("2026-08-15T00:00:00Z"),
  },
  {
    ref: "APR-2026-090",
    slug: "apartment-mezze-apr-090",
    type: "apartment",
    status: "available",
    priceUsd: 72000,
    negotiable: true,
    areaM2: 110,
    rooms: 2,
    baths: 1,
    floor: 4,
    totalFloors: 6,
    direction: "شرقية",
    district: "al-mezze",
    yearBuilt: 2019,
    features: ["elevator", "solar"],
    media: [
      { url: "placeholder:al-mezze", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
    ],
    isSignature: false,
    verification: "unverified",
    titleAr: "شقة ١١٠م² — المزة، عمارة حديثة",
    descAr:
      "شقة في عمارة حديثة (٢٠١٩) مع مصعد، الطابق الرابع من ستة، قرب ملتقى المزة.\nغرفتان وصالة وحمّام ومطبخ، تشطيب جاهز للسكن، إضاءة شرقية.\nطاقة شمسية للاشتراك. العقار غير موثّق بعد — يمكن طلب التوثيق قبل أي دفعة.",
    listedDate: d("2026-09-12T00:00:00Z"),
  },
  {
    ref: "HOU-2026-044",
    slug: "house-maliki-hou-044",
    type: "house",
    status: "available",
    priceUsd: 145000,
    negotiable: true,
    areaM2: 210,
    rooms: 4,
    baths: 2,
    floor: 0,
    totalFloors: 1,
    direction: "غربية",
    district: "al-maliki",
    yearBuilt: 1975,
    features: ["generator", "solar", "waterTank", "parking"],
    media: [
      { url: "placeholder:al-maliki", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الفناء" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
    ],
    isSignature: true, // 4th signature — see ASSUMPTIONS.md A-3 (brief table marks 3; home section requires 4–6)
    verification: "deed_checked",
    verificationDate: d("2026-08-10T00:00:00Z"),
    titleAr: "بيت دمشقي ٢١٠م² — المالكي، طابق واحد وفناء",
    descAr:
      "بيت دمشقي تقليدي (بناء ١٩٧٥) طابق واحد مع فناء داخلي، في زقاق هادئ داخل المالكي.\nأربع غرف وصالة وحمّامان ومطبخ، جدران حجرية سميكة وسقف عالٍ، واجهة غربية.\nمولّدة وطاقة شمسية وخزان مياه وموقف. الاطلاع على سند الملكية تم بتاريخ ١٠ آب ٢٠٢٦.",
    listedDate: d("2026-08-05T00:00:00Z"),
  },
  {
    ref: "APR-2026-075",
    slug: "apartment-mezze-apr-075",
    type: "apartment",
    status: "reserved",
    priceUsd: 68000,
    negotiable: true,
    areaM2: 95,
    rooms: 2,
    baths: 1,
    floor: 1,
    totalFloors: 5,
    direction: "شمالية",
    district: "al-mezze",
    yearBuilt: 2012,
    features: ["elevator", "waterTank"],
    media: [
      { url: "placeholder:al-mezze", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المطبخ" },
    ],
    isSignature: false,
    verification: "unverified",
    titleAr: "شقة ٩٥م² — المزة، الطابق الأول",
    descAr:
      "شقة الطابق الأول من خمسة مع مصعد، بناء ٢٠١٢، قرب جامع المزة الكبير.\nغرفتان وصالة وحمّام، مناسبة لأسرة صغيرة، إضاءة شمالية معتدلة.\nخزان مياه مشترك. العقار محجوز حالياً — يمكن تسجيل اهتمامك لعقار مشابه.",
    listedDate: d("2026-07-20T00:00:00Z"),
  },
  {
    ref: "APR-2025-211",
    slug: "apartment-maliki-apr-211",
    type: "apartment",
    status: "sold",
    priceUsd: 88000,
    negotiable: true,
    areaM2: 130,
    rooms: 3,
    baths: 2,
    floor: 3,
    totalFloors: 5,
    direction: "غربية",
    district: "al-maliki",
    yearBuilt: 2008,
    features: ["elevator", "generator", "balcony"],
    media: [
      { url: "placeholder:al-maliki", kind: "photo", is_ai: false, room: "الواجهة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "الصالة" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة النوم" },
    ],
    isSignature: false,
    verification: "deed_checked",
    verificationDate: d("2026-05-10T00:00:00Z"),
    titleAr: "شقة ١٣٠م² — المالكي (تم البيع)",
    descAr:
      "شقة الطابق الثالث من خمسة مع مصعد، بناء ٢٠٠٨، ثلاث غرف وصالة وحمّامان وشرفة غربية.\nبيعت بسعر ٨٨٬٠٠٠ دولار بتاريخ ١٤ حزيران ٢٠٢٦ — تُعرض هنا كإثبات مؤرَّخ.\nالاطلاع على سند الملكية كان قد تم بتاريخ ١٠ أيار ٢٠٢٦.",
    listedDate: d("2026-05-01T00:00:00Z"),
    soldDate: d("2026-06-14T00:00:00Z"),
  },
  {
    ref: "OFF-2026-019",
    slug: "office-abu-rummaneh-off-019",
    type: "office",
    status: "available",
    priceUsd: 60000,
    negotiable: true,
    areaM2: 85,
    rooms: 2,
    baths: 1,
    floor: 2,
    totalFloors: 8,
    direction: "شرقية",
    district: "abu-rummaneh",
    yearBuilt: 2016,
    features: ["elevator", "generator", "parking"],
    media: [
      { url: "placeholder:abu-rummaneh", kind: "photo", is_ai: false, room: "المدخل" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "المكتب الرئيسي" },
      { url: "placeholder:generic", kind: "photo", is_ai: false, room: "غرفة الاجتماعات" },
    ],
    isSignature: false,
    verification: "unverified",
    titleAr: "مكتب ٨٥م² — أبو رمانة، مدخل مستقل",
    descAr:
      "مكتب في عمارة إدارية (٢٠١٦)، الطابق الثاني من ثمانية مع مصعد ومدخل مستقل.\nمكتبان وغرفة اجتماعات وحمّام، مناسب لعيادة أو شركة صغيرة، واجهة شرقية على شارع تجاري.\nاشتراك مولّمة وموقف سيارات. العقار غير موثّق بعد — يمكن طلب التوثيق.",
    listedDate: d("2026-08-22T00:00:00Z"),
  },
];

async function main() {
  const agent = await db.agent.upsert({
    where: { id: "agent-abu-mohammed" },
    update: { ...AGENT },
    create: { id: "agent-abu-mohammed", ...AGENT },
  });

  for (const l of LISTINGS) {
    const { media, features, ...rest } = l;
    await db.listing.upsert({
      where: { ref: l.ref },
      update: {},
      create: {
        ...rest,
        priceDate: BUILD_DATE,
        features: features.join(","),
        media: JSON.stringify(media),
        agentId: agent.id,
      },
    });
  }

  const count = await db.listing.count();
  console.log(`Seed complete: ${count} listings (expected 8), agent: ${agent.nameAr}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
