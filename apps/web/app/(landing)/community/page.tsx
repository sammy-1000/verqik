import type { Metadata } from "next";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getCommunityContent } from "@/lib/blocks/get-landing-content";

export function generateMetadata(): Metadata {
  return {
    title: "Community — Verqik",
    description: "Stories and stats from the Verqik crowdshipping community.",
  };
}

export default function CommunityPage() {
  const { blocks } = getCommunityContent();

  return (
    <main>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
