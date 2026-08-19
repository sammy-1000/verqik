import type { StatsBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";

export function StatsBlockView({ id, tone, width, size, data }: StatsBlock) {
  const inverted = tone === "primary" || tone === "secondary";

  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      {data.title ? (
        <SectionHeading title={data.title} align="center" inverted={inverted} />
      ) : null}
      <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.items.map((item) => (
          <div
            key={item.label}
            className="space-y-1 rounded-2xl border border-border/40 bg-background/10 p-5 backdrop-blur-sm"
          >
            <dt className="text-3xl font-semibold tracking-tight">{item.value}</dt>
            <dd className="text-sm font-medium">{item.label}</dd>
            {item.detail ? (
              <dd className="text-xs opacity-70">{item.detail}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </BlockShell>
  );
}
