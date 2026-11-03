import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink() {
  return (
    <Link
      href="/"
      className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ChevronLeft className="size-4" aria-hidden />
      Inicio
    </Link>
  );
}
