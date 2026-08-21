-- CreateEnum
CREATE TYPE "TravelPhase" AS ENUM ('SCHEDULED', 'DEPARTED', 'EN_ROUTE', 'LANDED', 'AT_RENDEZVOUS');

-- AlterTable
ALTER TABLE "journeys" ADD COLUMN "travel_phase" "TravelPhase" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN "expected_landing_at" TIMESTAMP(3),
ADD COLUMN "actual_landing_at" TIMESTAMP(3),
ADD COLUMN "rendezvous_address" TEXT,
ADD COLUMN "rendezvous_notes" TEXT,
ADD COLUMN "last_travel_update_at" TIMESTAMP(3),
ADD COLUMN "travel_update_note" TEXT;

-- AlterTable
ALTER TABLE "delivery_requests" ADD COLUMN "pickup_photo_file_id" UUID,
ADD COLUMN "delivery_photo_file_id" UUID,
ADD COLUMN "pickup_rendezvous_address" TEXT,
ADD COLUMN "delivery_rendezvous_address" TEXT;

-- AddForeignKey
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_pickup_photo_file_id_fkey" FOREIGN KEY ("pickup_photo_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_delivery_photo_file_id_fkey" FOREIGN KEY ("delivery_photo_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
