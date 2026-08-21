import type { Metadata } from "next";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getLandingContent } from "@/lib/blocks/get-landing-content";

export function generateMetadata(): Metadata {
  const { meta } = getLandingContent();

  return {
    title: meta.title,
    description: meta.description,
  };
}

export default function LandingPage() {
  const content = getLandingContent();

  return (
    <main className="snap-y snap-mandatory">
      {content.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
