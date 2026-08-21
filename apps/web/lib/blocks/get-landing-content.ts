import type { LandingPageContent } from "@/lib/blocks/types";
import landingContent from "@/content/landing/page.json";
import communityContent from "@/content/landing/community.json";
import howItWorksContent from "@/content/landing/how-it-works.json";

export function getLandingContent(): LandingPageContent {
  return landingContent as LandingPageContent;
}

export function getCommunityContent(): Pick<LandingPageContent, "blocks"> {
  return communityContent as Pick<LandingPageContent, "blocks">;
}

export function getHowItWorksContent(): Pick<LandingPageContent, "blocks"> {
  return howItWorksContent as Pick<LandingPageContent, "blocks">;
}
