-- User profile photo linked to files module
ALTER TABLE "users" ADD COLUMN "profile_photo_file_id" UUID;

CREATE UNIQUE INDEX "users_profile_photo_file_id_key" ON "users"("profile_photo_file_id");

ALTER TABLE "users"
  ADD CONSTRAINT "users_profile_photo_file_id_fkey"
  FOREIGN KEY ("profile_photo_file_id") REFERENCES "files"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Package item photos on delivery requests
CREATE TABLE "delivery_request_item_photos" (
  "id" UUID NOT NULL,
  "delivery_request_id" UUID NOT NULL,
  "file_id" UUID NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "delivery_request_item_photos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "delivery_request_item_photos_delivery_request_id_file_id_key"
  ON "delivery_request_item_photos"("delivery_request_id", "file_id");

ALTER TABLE "delivery_request_item_photos"
  ADD CONSTRAINT "delivery_request_item_photos_delivery_request_id_fkey"
  FOREIGN KEY ("delivery_request_id") REFERENCES "delivery_requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "delivery_request_item_photos"
  ADD CONSTRAINT "delivery_request_item_photos_file_id_fkey"
  FOREIGN KEY ("file_id") REFERENCES "files"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
