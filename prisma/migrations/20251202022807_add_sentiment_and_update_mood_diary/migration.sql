-- AlterTable
ALTER TABLE "public"."diary_entries" ADD COLUMN     "emotions" TEXT[],
ADD COLUMN     "sentiment" DECIMAL(3,2);

-- AlterTable
ALTER TABLE "public"."mood_check_ins" ADD COLUMN     "activities" TEXT[],
ADD COLUMN     "company" TEXT[],
ADD COLUMN     "emotions" TEXT[],
ADD COLUMN     "sentiment" DECIMAL(3,2);
