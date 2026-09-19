import Link from "next/link";
import { StarMark } from "./mashrabiya";

/**
 * SiteHeader — server component (zero JS). Sticky (z-50 per the z ladder),
 * matte daylight (solid stone, no glass). Active route gets aria-current.
 * Mobile: horizontally scrollable nav row (no drawer JS, keyboard-friendly).
 */

export const NAV_ITEMS = [
  { href: "/ar/listings", key: "listings", label: "العقارات" },
  { href: "/ar/valuation", key: "valuation", label: "كم يساوي عقارك؟" },
  { href: "/ar/verification", key: "verification", label: "عقار موثّق" },
  { href: "/ar/sold", key: "sold", label: "تم البيع" },
  { href: "/ar/about", key: "about", label: "من نحن" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export function SiteHeader({ active }: { active?: NavKey | "home" }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-stone-100">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md py-1"
          aria-label="نور دمشق — الصفحة الرئيسية"
        >
          <StarMark className="size-6 text-gold-600" />
          <span className="font-heading text-title font-bold text-stone-900">نور دمشق</span>
        </Link>

        <nav
          aria-label="التنقل الرئيسي"
          className="no-scrollbar -mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-stone-300/70 text-stone-900"
                    : "text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/en"
          className="hidden min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-bold text-gold-600 transition-colors hover:text-gold-500 sm:flex"
        >
          EN
        </Link>
      </div>
    </header>
  );
}
