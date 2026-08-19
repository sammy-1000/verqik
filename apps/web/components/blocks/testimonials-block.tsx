import type { TestimonialsBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

export function TestimonialsBlockView({
  id,
  tone,
  width,
  size,
  data,
}: TestimonialsBlock) {
  const inverted = tone === "primary" || tone === "secondary";

  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        align="center"
        inverted={inverted}
      />
      <ul className="grid gap-6 lg:grid-cols-3">
        {data.items.map((item) => (
          <li
            key={item.name}
            className="bg-background/60 flex h-full flex-col gap-4 rounded-2xl border border-border/60 p-6 shadow-sm backdrop-blur-sm"
          >
            <blockquote className="text-sm leading-relaxed text-pretty">
              “{item.quote}”
            </blockquote>
            <div className="mt-auto flex items-center gap-3">
              <PlaceholderImage {...item.avatar} rounded="full" className="size-12" />
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs opacity-70">{item.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}
