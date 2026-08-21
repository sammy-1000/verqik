import type { LandingBlock } from "@/lib/blocks/types";
import { HeroBlockView } from "./hero-block";
import { LogoCloudBlockView } from "./logo-cloud-block";
import { StatsBlockView } from "./stats-block";
import { FeaturesBlockView } from "./features-block";
import { HowItWorksBlockView } from "./how-it-works-block";
import { RoutesBlockView } from "./routes-block";
import { TestimonialsBlockView } from "./testimonials-block";
import { CtaBlockView } from "./cta-block";
import { CitiesPreviewBlockView } from "./cities-preview-block";
import { JourneysPreviewBlockView } from "./journeys-preview-block";

export function BlockRenderer({ block }: { block: LandingBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroBlockView {...block} />;
    case "logo-cloud":
      return <LogoCloudBlockView {...block} />;
    case "stats":
      return <StatsBlockView {...block} />;
    case "features":
      return <FeaturesBlockView {...block} />;
    case "how-it-works":
      return <HowItWorksBlockView {...block} />;
    case "routes":
      return <RoutesBlockView {...block} />;
    case "testimonials":
      return <TestimonialsBlockView {...block} />;
    case "cta":
      return <CtaBlockView {...block} />;
    case "cities-preview":
      return <CitiesPreviewBlockView {...block} />;
    case "journeys-preview":
      return <JourneysPreviewBlockView {...block} />;
    default:
      return null;
  }
}
