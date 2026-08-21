import Link from "next/link";
import type { HeroBlock, PlaceholderImageConfig } from "@/lib/blocks/types";
import { BlockShell } from "@/components/shared/block-shell";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Button } from "@workspace/ui/components/button";

function HeroImage({ image }: { image: PlaceholderImageConfig }) {
  if (image.src) {
    return (
      <div className="flex items-end justify-center lg:justify-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt ?? image.label ?? "Hero illustration"}
          width={image.width}
          height={image.height}
          className="h-auto w-full max-w-md object-contain object-bottom sm:max-w-lg lg:max-w-xl"
        />
      </div>
    );
  }

  return <PlaceholderImage {...image} className="shadow-sm ring-1 ring-border/60" />;
}

export function HeroBlockView({ id, tone, width, size, data }: HeroBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <div className="space-y-6">
          {data.eyebrow ? (
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
              {data.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
            {data.description}
          </p>

          {data.badges?.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.badges.map((badge) => (
                <li
                  key={badge}
                  className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button nativeButton={false} render={<Link href={data.primaryCta.href} />} size="lg">
              {data.primaryCta.label}
            </Button>
            {data.secondaryCta ? (
              <Button
                nativeButton={false}
                render={<Link href={data.secondaryCta.href} />}
                variant="outline"
                size="lg"
              >
                {data.secondaryCta.label}
              </Button>
            ) : null}
          </div>
        </div>

        <HeroImage image={data.image} />
      </div>
    </BlockShell>
  );
}
