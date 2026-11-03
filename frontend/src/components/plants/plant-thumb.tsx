import Image from "next/image";
import { Sprout } from "lucide-react";
import { cn } from "cn";

export function PlantThumb({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-accent-foreground",
        className
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill unoptimized className="object-cover" />
      ) : (
        <Sprout className="size-1/2" aria-hidden />
      )}
    </span>
  );
}
