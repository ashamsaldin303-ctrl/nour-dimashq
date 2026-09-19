import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { MashrabiyaLayer } from "@/components/site/mashrabiya";
import { Button } from "@/components/ui/button";

/** Designed 404 edge (manual §3.1) — honest, branded, two ways out. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative isolate flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <MashrabiyaLayer />
        <p className="relative font-heading text-caption font-bold text-gold-600">
          <span className="num">٤٠٤</span>
        </p>
        <h1 className="relative mt-2 text-h2 font-bold text-stone-900">هذه الصفحة غير موجودة</h1>
        <p className="relative mt-3 max-w-md text-body text-stone-700">
          ربما بيع العقار أو تغيّر الرابط. تصفّح العقارات المتاحة، أو راسلنا وسنجده لك.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild className="cta-primary h-12 px-6 active:scale-[0.98]">
            <Link href="/ar/listings">تصفّح العقارات</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 border-stone-600/50 px-6 text-stone-900 hover:bg-stone-200 hover:text-stone-900 active:scale-[0.98]"
          >
            <Link href="/">الصفحة الرئيسية</Link>
          </Button>
        </div>
      </main>
      <FooterOffice />
    </>
  );
}
