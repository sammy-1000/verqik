import Link from "next/link";
import type { LandingPageContent } from "@/lib/blocks/types";

type SiteFooterProps = LandingPageContent["footer"];

export function SiteFooter({
  brand,
  description,
  columns,
  legal,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-3">
            <p className="text-lg font-semibold">{brand}</p>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-sm font-medium">{column.title}</p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Crowdshipping powered by real journeys
          </p>
        </div>
      </div>
    </footer>
  );
}
