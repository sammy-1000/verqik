import { cn } from "@workspace/ui/lib/utils";
import type { BlockSize, BlockTone, BlockWidth } from "@/lib/blocks/types";

const toneStyles: Record<BlockTone, string> = {
  normal: "bg-background text-foreground",
  muted: "bg-muted text-foreground [&_.section-description]:text-foreground/75",
  primary:
    "bg-primary text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_.section-description]:text-primary-foreground/85",
  secondary:
    "bg-secondary text-secondary-foreground [&_.text-muted-foreground]:text-secondary-foreground/70 [&_.section-description]:text-secondary-foreground/85",
};

const widthStyles: Record<BlockWidth, string> = {
  content: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-[1400px]",
};

const sizeStyles: Record<BlockSize, string> = {
  screen: cn(
    "min-h-svh w-full snap-start snap-always py-16",
    "lg:flex lg:min-h-svh lg:items-center lg:py-20",
  ),
  compact: "w-full snap-start py-12 sm:py-14",
  auto: "w-full snap-start py-16 sm:py-20 lg:py-24",
};

interface ContentWidthProps {
  width?: BlockWidth;
  size?: BlockSize;
  className?: string;
  children: React.ReactNode;
}

export function ContentWidth({
  width = "content",
  size = "screen",
  className,
  children,
}: ContentWidthProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widthStyles[width],
        size === "screen" && "lg:flex lg:flex-col lg:justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BlockShellProps {
  id?: string;
  tone?: BlockTone;
  width?: BlockWidth;
  size?: BlockSize;
  className?: string;
  children: React.ReactNode;
}

export function BlockShell({
  id,
  tone = "normal",
  width = "content",
  size = "screen",
  className,
  children,
}: BlockShellProps) {
  return (
    <section
      id={id}
      className={cn(toneStyles[tone], sizeStyles[size], className)}
    >
      <ContentWidth width={width} size={size}>
        {children}
      </ContentWidth>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverted?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 max-w-2xl space-y-3 lg:mb-12",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold tracking-[0.2em] uppercase",
            inverted ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "section-description text-base leading-relaxed text-pretty sm:text-lg",
            inverted ? "text-primary-foreground/85" : "text-foreground/70",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
