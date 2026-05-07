/*
  Warnings:

  - You are about to drop the column `buildingId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_buildingId_fkey";

-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "buildingId";

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "buildingId" TEXT;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
