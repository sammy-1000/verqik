"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateJourneyDialog } from "@/components/journeys/create-journey-dialog";
import { isVerifiedForTravel } from "@/lib/app/get-app-blocks";
import type { UserProfile } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";

export function CreateJourneyBlock({ user }: { user: UserProfile }) {
  const canPublish = isVerifiedForTravel(user);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!canPublish}
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Plus className="size-4" />
          New travel
        </Button>
      </div>
      <CreateJourneyDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
