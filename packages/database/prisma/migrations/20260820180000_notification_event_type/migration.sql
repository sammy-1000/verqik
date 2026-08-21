-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "event_type" TEXT NOT NULL DEFAULT 'legacy.manual';

-- CreateIndex
CREATE INDEX "notifications_user_id_event_type_idx" ON "notifications"("user_id", "event_type");
