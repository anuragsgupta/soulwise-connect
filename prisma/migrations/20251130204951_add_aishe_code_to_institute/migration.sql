/*
  Warnings:

  - A unique constraint covering the columns `[aishe_code]` on the table `institutes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."institutes" ADD COLUMN     "aishe_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "institutes_aishe_code_key" ON "public"."institutes"("aishe_code");
