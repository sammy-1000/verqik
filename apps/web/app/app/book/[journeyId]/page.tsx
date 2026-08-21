import { AppAuthGuard } from "@/components/app/app-auth-guard";
import { BookJourneyPage } from "@/components/journeys/book-journey-page";

export default async function BookJourneyRoutePage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  return (
    <AppAuthGuard>
      <BookJourneyPage journeyId={journeyId} />
    </AppAuthGuard>
  );
}
