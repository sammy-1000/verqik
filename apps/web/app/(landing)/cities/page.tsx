import type { Metadata } from "next";
import { CitiesPageContent } from "@/components/landing/cities-page";

export const metadata: Metadata = {
  title: "Supported cities — Verqik",
  description: "Browse cities where Verqik crowdshipping is available.",
};

export default function CitiesPage() {
  return (
    <main>
      <CitiesPageContent />
    </main>
  );
}
