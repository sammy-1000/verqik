import type { Metadata } from "next";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getHowItWorksContent } from "@/lib/blocks/get-landing-content";

export function generateMetadata(): Metadata {
  return {
    title: "How it works — Verqik",
    description: "Learn how crowdshipping works on Verqik in three simple steps.",
  };
}

export default function HowItWorksPage() {
  const { blocks } = getHowItWorksContent();

  return (
    <main>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
