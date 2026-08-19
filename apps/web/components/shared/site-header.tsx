import Link from "next/link";
import type { LinkItem } from "@/lib/blocks/types";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/landing/theme-toggle";

interface SiteHeaderProps {
  brand: string;
  tagline?: string;
  nav: LinkItem[];
  cta: LinkItem;
}

export function SiteHeader({ brand, tagline, nav, cta }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">{brand}</span>
          {tagline ? (
            <span className="text-muted-foreground hidden text-xs font-medium sm:inline">
              {tagline}
            </span>
          ) : null}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button nativeButton={false} render={<Link href={cta.href} />}>
            {cta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
