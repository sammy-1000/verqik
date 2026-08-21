"use client";

import type { AppBlock } from "@/lib/app/types";
import type { UserProfile } from "@/lib/ws/types";
import { WelcomeBlock } from "@/components/app/blocks/welcome-block";
import { MyTravelsPreviewBlock } from "@/components/app/blocks/my-travels-preview-block";
import { PublishJourneyCtaBlock } from "@/components/app/blocks/publish-journey-cta-block";
import { VerificationCtaBlock } from "@/components/app/blocks/verification-cta-block";
import { VerificationBlock } from "@/components/app/blocks/verification-block";
import { VerificationReviewBlock } from "@/components/app/blocks/verification-review-block";
import { CitiesManagementBlock } from "@/components/app/blocks/cities-management-block";
import { AdminUsersBlock } from "@/components/app/blocks/admin-users-block";
import { JourneysSearchBlock } from "@/components/app/blocks/journeys-search-block";
import { BrowseJourneysButton } from "@/components/app/blocks/browse-journeys-button";
import { RecentJourneysBlock } from "@/components/app/blocks/recent-journeys-block";
import { MyRequestsBlock } from "@/components/app/blocks/my-requests-block";
import { CreateJourneyBlock } from "@/components/app/blocks/create-journey-block";
import { MyJourneysBlock } from "@/components/app/blocks/my-journeys-block";
import { IncomingRequestsBlock } from "@/components/app/blocks/incoming-requests-block";

export function AppBlockRenderer({
  block,
  user,
}: {
  block: AppBlock;
  user: UserProfile;
}) {
  switch (block.type) {
    case "welcome":
      return <WelcomeBlock user={user} />;
    case "verification-cta":
      return <VerificationCtaBlock user={user} />;
    case "publish-journey-cta":
      return <PublishJourneyCtaBlock user={user} />;
    case "my-travels-preview":
      return <MyTravelsPreviewBlock />;
    case "verification":
      return <VerificationBlock user={user} block={block} />;
    case "verification-review":
      return <VerificationReviewBlock block={block} />;
    case "cities-management":
      return <CitiesManagementBlock block={block} />;
    case "admin-users":
      return <AdminUsersBlock block={block} />;
    case "journeys-search":
      return <JourneysSearchBlock block={block} />;
    case "recent-journeys":
      return <RecentJourneysBlock />;
    case "browse-journeys-button":
      return <BrowseJourneysButton />;
    case "my-requests":
      return <MyRequestsBlock user={user} />;
    case "create-journey":
      return <CreateJourneyBlock user={user} />;
    case "my-journeys":
      return <MyJourneysBlock user={user} block={block} />;
    case "incoming-requests":
      return <IncomingRequestsBlock user={user} block={block} />;
    default:
      return null;
  }
}
