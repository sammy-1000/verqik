"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { APP_BROWSE_PATH } from "@/lib/app/routes";
import { Button } from "@workspace/ui/components/button";

export function BrowseJourneysButton() {
  return (
    <div className="flex justify-end">
      <Button nativeButton={false} render={<Link href={APP_BROWSE_PATH} />} className="gap-2">
        <Search className="size-4" />
        Browse journeys
      </Button>
    </div>
  );
}
