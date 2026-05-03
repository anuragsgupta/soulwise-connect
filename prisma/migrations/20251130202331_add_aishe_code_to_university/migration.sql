/*
  Warnings:

  - A unique constraint covering the columns `[aishe_code]` on the table `universities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."universities" ADD COLUMN     "aishe_code" TEXT,
ADD COLUMN     "contact_first_name" TEXT,
ADD COLUMN     "contact_last_name" TEXT,
ADD COLUMN     "district" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "universities_aishe_code_key" ON "public"."universities"("aishe_code");
