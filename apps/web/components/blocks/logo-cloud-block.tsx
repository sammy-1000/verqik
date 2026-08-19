import type { LogoCloudBlock } from "@/lib/blocks/types";
import { BlockShell } from "@/components/shared/block-shell";
import { SectionHeading } from "@/components/shared/block-shell";

export function LogoCloudBlockView({ id, tone, width, size, data }: LogoCloudBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size ?? "compact"}>
      <div className="space-y-6">
        {data.title ? (
          <SectionHeading title={data.title} align="center" />
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {data.logos.map((logo) => (
            <li
              key={logo.name}
              className="text-muted-foreground text-sm font-semibold tracking-wide uppercase"
            >
              {logo.name}
            </li>
          ))}
        </ul>
      </div>
    </BlockShell>
  );
}
