-- CreateTable
CREATE TABLE "city_images" (
    "id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "city_images_city_id_sort_order_idx" ON "city_images"("city_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "city_images_city_id_file_id_key" ON "city_images"("city_id", "file_id");

-- AddForeignKey
ALTER TABLE "city_images" ADD CONSTRAINT "city_images_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_images" ADD CONSTRAINT "city_images_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
