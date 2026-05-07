/*
  Warnings:

  - You are about to drop the column `programId` on the `Module` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Scope" AS ENUM ('GLOBAL', 'BUILDING');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ENROLLED', 'GRADUATED', 'SUSPENDED', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'VACATAIRE', 'VISITING');

-- CreateEnum
CREATE TYPE "ParentRelationship" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('CM', 'TD', 'TP', 'EXAM', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_programId_fkey";

-- AlterTable
ALTER TABLE "Building" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "programId";

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cne" TEXT,
    "cin" TEXT,
    "gender" "Gender",
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "nationality" TEXT DEFAULT 'Marocaine',
    "address" TEXT,
    "city" TEXT,
    "baccalaureateType" TEXT,
    "baccalaureateYear" INTEGER,
    "highSchool" TEXT,
    "enrollmentYear" INTEGER,
    "academicStatus" "StudentStatus" NOT NULL DEFAULT 'ENROLLED',

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cin" TEXT,
    "gender" "Gender",
    "academicTitle" TEXT,
    "speciality" TEXT,
    "department" TEXT,
    "employmentType" "EmploymentType" DEFAULT 'PERMANENT',
    "hireDate" TIMESTAMP(3),
    "officeRoom" TEXT,
    "officeHours" TEXT,
    "researchInterests" TEXT,
    "biography" TEXT,

    CONSTRAINT "ProfessorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cin" TEXT,
    "gender" "Gender",
    "relationship" "ParentRelationship" NOT NULL DEFAULT 'FATHER',
    "profession" TEXT,
    "address" TEXT,
    "city" TEXT,
    "emergencyPhone" TEXT,
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" "SessionType" NOT NULL DEFAULT 'CM',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionIndex" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfessorProfileToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_StudentParents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DepartmentToProfessorProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ModuleToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ModuleToProfessorProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_cne_key" ON "StudentProfile"("cne");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_cin_key" ON "StudentProfile"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorProfile_userId_key" ON "ProfessorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorProfile_cin_key" ON "ProfessorProfile"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_cin_key" ON "ParentProfile"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_studentId_key" ON "Attendance"("sessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfessorProfileToProgram_AB_unique" ON "_ProfessorProfileToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfessorProfileToProgram_B_index" ON "_ProfessorProfileToProgram"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StudentParents_AB_unique" ON "_StudentParents"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentParents_B_index" ON "_StudentParents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentToProfessorProfile_AB_unique" ON "_DepartmentToProfessorProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentToProfessorProfile_B_index" ON "_DepartmentToProfessorProfile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToProgram_AB_unique" ON "_ModuleToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToProgram_B_index" ON "_ModuleToProgram"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToProfessorProfile_AB_unique" ON "_ModuleToProfessorProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToProfessorProfile_B_index" ON "_ModuleToProfessorProfile"("B");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfile" ADD CONSTRAINT "ProfessorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorProfileToProgram" ADD CONSTRAINT "_ProfessorProfileToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "ProfessorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorProfileToProgram" ADD CONSTRAINT "_ProfessorProfileToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentParents" ADD CONSTRAINT "_StudentParents_A_fkey" FOREIGN KEY ("A") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentParents" ADD CONSTRAINT "_StudentParents_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToProfessorProfile" ADD CONSTRAINT "_DepartmentToProfessorProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToProfessorProfile" ADD CONSTRAINT "_DepartmentToProfessorProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "ProfessorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToProgram" ADD CONSTRAINT "_ModuleToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToProgram" ADD CONSTRAINT "_ModuleToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToProfessorProfile" ADD CONSTRAINT "_ModuleToProfessorProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToProfessorProfile" ADD CONSTRAINT "_ModuleToProfessorProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "ProfessorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
