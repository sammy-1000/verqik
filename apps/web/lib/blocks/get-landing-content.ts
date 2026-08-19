import type { LandingPageContent } from "@/lib/blocks/types";
import landingContent from "@/content/landing/page.json";

export function getLandingContent(): LandingPageContent {
  return landingContent as LandingPageContent;
}
