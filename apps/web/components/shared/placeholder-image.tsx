import type { PlaceholderImageConfig } from "@/lib/blocks/types";
import { cn } from "@workspace/ui/lib/utils";

interface PlaceholderImageProps extends PlaceholderImageConfig {
  className?: string;
  rounded?: "md" | "lg" | "xl" | "full";
}

export function PlaceholderImage({
  width,
  height,
  label = "Image",
  aspectRatio,
  className,
  rounded = "lg",
}: PlaceholderImageProps) {
  const ratio = aspectRatio ?? `${width}/${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={cn(
        "block h-auto w-full shrink-0",
        rounded === "md" && "rounded-md",
        rounded === "lg" && "rounded-xl",
        rounded === "xl" && "rounded-2xl",
        rounded === "full" && "rounded-full",
        className,
      )}
      style={{ aspectRatio: ratio }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`ph-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--muted)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--border)" stopOpacity="0.95" />
        </linearGradient>
        <pattern
          id={`grid-${width}-${height}`}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M24 0H0V24"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.35"
          />
        </pattern>
      </defs>
      <rect
        width={width}
        height={height}
        fill={`url(#ph-${width}-${height})`}
        rx={rounded === "full" ? height / 2 : 16}
      />
      <rect
        width={width}
        height={height}
        fill={`url(#grid-${width}-${height})`}
        rx={rounded === "full" ? height / 2 : 16}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="var(--muted-foreground)"
        fontSize={Math.min(width, height) * 0.08}
        fontFamily="var(--font-sans, system-ui, sans-serif)"
        fontWeight="600"
      >
        {label}
      </text>
    </svg>
  );
}
