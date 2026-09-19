import { notFound } from "next/navigation";

/**
 * Catch-all inside the (ar) group: unknown paths render the designed Arabic
 * 404 (with multiple root layouts there is no global app/not-found).
 */
export default function CatchAllPage() {
  notFound();
}
