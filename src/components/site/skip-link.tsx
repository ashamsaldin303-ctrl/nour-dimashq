/** Skip link — first focusable element on every page (AC-28 on `/`). */
export function SkipLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="skip-link">
      {label}
    </a>
  );
}
