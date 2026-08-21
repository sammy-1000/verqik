import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

const LOGO_SRC = "/icons/logo_horizontal.svg";
const LOGO_ASPECT = 210 / 80;

interface BrandLogoProps {
  href?: string;
  className?: string;
  /** Logo height in pixels */
  height?: number;
  tagline?: string;
}

export function BrandLogo({
  href = "/",
  className,
  height = 32,
  tagline,
}: BrandLogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center gap-2.5", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Verqik"
        width={width}
        height={height}
        className="h-8 w-auto max-w-[140px] object-contain sm:h-9 sm:max-w-[160px]"
      />
      {tagline ? (
        <span className="text-muted-foreground hidden text-xs font-medium sm:inline">
          {tagline}
        </span>
      ) : null}
    </Link>
  );
}
