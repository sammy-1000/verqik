import { BrowseJourneysPage } from "@/components/journeys/browse-journeys-page";
import { AppAuthGuard } from "@/components/app/app-auth-guard";

export default function BrowseJourneysRoutePage() {
  return (
    <AppAuthGuard>
      <BrowseJourneysPage />
    </AppAuthGuard>
  );
}
