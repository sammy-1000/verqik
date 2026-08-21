import type { Metadata } from "next";
import { JourneysPageContent } from "@/components/landing/journeys-page";

export const metadata: Metadata = {
  title: "Browse journeys — Verqik",
  description: "Upcoming trips with spare luggage weight available for delivery.",
};

export default function JourneysPage() {
  return (
    <main>
      <JourneysPageContent />
    </main>
  );
}
