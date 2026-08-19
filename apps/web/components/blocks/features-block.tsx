import {
  BadgeCheck,
  Camera,
  Globe,
  MessagesSquare,
  Scale,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { FeaturesBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  "badge-check": BadgeCheck,
  messages: MessagesSquare,
  globe: Globe,
  camera: Camera,
  scale: Scale,
};

export function FeaturesBlockView({ id, tone, width, size, data }: FeaturesBlock) {
  return (
    <BlockShell id={id} tone={tone} width={width} size={size}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => {
          const Icon = iconMap[item.icon] ?? Shield;
          return (
            <li
              key={item.title}
              className="bg-card text-card-foreground space-y-3 rounded-2xl border border-border p-6 shadow-sm"
            >
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <Icon className="text-foreground size-5" aria-hidden />
              </div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </li>
          );
        })}
      </ul>
    </BlockShell>
  );
}
