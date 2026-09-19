/** Section heading: gold kicker + Kufi H2 + optional lead. */
export function SectionHeading({
  kicker,
  title,
  sub,
  id,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  id?: string;
}) {
  return (
    <div id={id} className="max-w-2xl scroll-mt-24">
      {kicker ? (
        <p className="font-heading text-caption font-bold text-gold-600">{kicker}</p>
      ) : null}
      <h2 className="mt-2 text-h2 font-bold text-stone-900">{title}</h2>
      {sub ? <p className="mt-3 text-lead text-stone-700">{sub}</p> : null}
    </div>
  );
}
