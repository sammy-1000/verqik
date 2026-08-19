import type { HowItWorksBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

export function HowItWorksBlockView({
  id,
  tone,
  width,
  size,
  data,
}: HowItWorksBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />
      <ol className="grid gap-8 lg:grid-cols-3">
        {data.steps.map((step) => (
          <li key={step.step} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                {step.step}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
            </div>
            <PlaceholderImage {...step.image} />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </BlockShell>
  );
}
