import Link from "next/link";
import type { CtaBlock, BlockTone } from "@/lib/blocks/types";
import { BlockShell } from "@/components/shared/block-shell";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

function invertedOutlineClass(tone?: BlockTone) {
  if (tone === "primary") {
    return "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";
  }
  if (tone === "secondary") {
    return "border-secondary-foreground/40 bg-transparent text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground";
  }
  return undefined;
}

export function CtaBlockView({ id, tone, width, size, data }: CtaBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {data.title}
        </h2>
        <p className="text-base leading-relaxed opacity-80 text-pretty sm:text-lg">
          {data.description}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            nativeButton={false}
            render={<Link href={data.primaryCta.href} />}
            size="lg"
            variant={tone === "primary" ? "secondary" : "default"}
          >
            {data.primaryCta.label}
          </Button>
          {data.secondaryCta ? (
            <Button
              nativeButton={false}
              render={<Link href={data.secondaryCta.href} />}
              variant="outline"
              size="lg"
              className={cn(invertedOutlineClass(tone))}
            >
              {data.secondaryCta.label}
            </Button>
          ) : null}
        </div>
      </div>
    </BlockShell>
  );
}
