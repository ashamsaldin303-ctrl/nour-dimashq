/**
 * Numerals law (brief §5): every price, area, phone, ref renders inside
 * <bdi class="num"> — LTR isolation + tabular figures inside RTL text.
 */
export function Num({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <bdi className={`num ${className}`.trim()}>{children}</bdi>;
}
