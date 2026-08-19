import Link from "next/link";
import type { RoutesBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Button } from "@workspace/ui/components/button";

export function RoutesBlockView({ id, tone, width, size, data }: RoutesBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />
      <ul className="grid gap-6 md:grid-cols-3">
        {data.items.map((route) => (
          <li
            key={`${route.from}-${route.to}-${route.date}`}
            className="bg-card overflow-hidden rounded-2xl border border-border shadow-sm"
          >
            <PlaceholderImage {...route.image} rounded="md" className="rounded-none" />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">
                  {route.from} → {route.to}
                </p>
                <span className="text-primary text-sm font-medium">{route.price}</span>
              </div>
              <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="font-medium">Departure</dt>
                  <dd>{route.date}</dd>
                </div>
                <div>
                  <dt className="font-medium">Capacity</dt>
                  <dd>{route.weight}</dd>
                </div>
              </dl>
              <Button
                nativeButton={false}
                render={<Link href="#" />}
                variant="outline"
                className="w-full"
              >
                View journey
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}
