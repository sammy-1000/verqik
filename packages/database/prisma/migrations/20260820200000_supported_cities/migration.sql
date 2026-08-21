-- CreateEnum
CREATE TYPE "CitySource" AS ENUM ('SEED', 'MANUAL');

-- AlterTable
ALTER TABLE "journeys" ADD COLUMN "origin_city_id" UUID,
ADD COLUMN "destination_city_id" UUID;

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "seed_key" TEXT,
    "name" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "airport_code" CHAR(3),
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_address" TEXT,
    "notes" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "source" "CitySource" NOT NULL DEFAULT 'MANUAL',
    "seed_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_seed_exclusions" (
    "seed_key" TEXT NOT NULL,
    "excluded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "excluded_by_id" UUID,

    CONSTRAINT "city_seed_exclusions_pkey" PRIMARY KEY ("seed_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_seed_key_key" ON "cities"("seed_key");

-- CreateIndex
CREATE INDEX "cities_country_code_enabled_idx" ON "cities"("country_code", "enabled");

-- CreateIndex
CREATE INDEX "cities_enabled_sort_order_idx" ON "cities"("enabled", "sort_order");

-- CreateIndex
CREATE INDEX "journeys_origin_city_id_idx" ON "journeys"("origin_city_id");

-- CreateIndex
CREATE INDEX "journeys_destination_city_id_idx" ON "journeys"("destination_city_id");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_origin_city_id_fkey" FOREIGN KEY ("origin_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_destination_city_id_fkey" FOREIGN KEY ("destination_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
