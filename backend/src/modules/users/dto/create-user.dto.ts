import { IsString, IsEmail, IsOptional, IsEnum, ValidateNested, IsUUID, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '@prisma/client';

export enum Gender { MALE = 'MALE', FEMALE = 'FEMALE' }
export enum StudentStatus { ENROLLED = 'ENROLLED', GRADUATED = 'GRADUATED', SUSPENDED = 'SUSPENDED', DROPPED_OUT = 'DROPPED_OUT' }
export enum EmploymentType { PERMANENT = 'PERMANENT', VACATAIRE = 'VACATAIRE', VISITING = 'VISITING' }
export enum ParentRelationship { FATHER = 'FATHER', MOTHER = 'MOTHER', GUARDIAN = 'GUARDIAN' }

export class StudentProfileDto {
  @IsString() @IsOptional() cne?: string;
  @IsString() @IsOptional() cin?: string;
  @IsEnum(Gender) @IsOptional() gender?: Gender;
  @IsOptional() @Type(() => Date) birthDate?: Date;
  @IsString() @IsOptional() birthPlace?: string;
  @IsString() @IsOptional() nationality?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() baccalaureateType?: string;
  @IsNumber() @IsOptional() @Type(() => Number) baccalaureateYear?: number;
  @IsString() @IsOptional() highSchool?: string;
  @IsNumber() @IsOptional() @Type(() => Number) enrollmentYear?: number;
  @IsEnum(StudentStatus) @IsOptional() academicStatus?: StudentStatus;
  @IsNumber() @IsOptional() @Type(() => Number) currentLevel?: number;
  @IsUUID() @IsOptional() programId?: string;
  @IsUUID() @IsOptional() buildingId?: string;
}

export class ProfessorProfileDto {
  @IsString() @IsOptional() cin?: string;
  @IsEnum(Gender) @IsOptional() gender?: Gender;
  @IsString() @IsOptional() academicTitle?: string;
  @IsString() @IsOptional() speciality?: string;
  @IsString() @IsOptional() department?: string;
  @IsEnum(EmploymentType) @IsOptional() employmentType?: EmploymentType;
  @IsOptional() @Type(() => Date) hireDate?: Date;
  @IsString() @IsOptional() officeRoom?: string;
  @IsString() @IsOptional() officeHours?: string;
  @IsString() @IsOptional() researchInterests?: string;
  @IsString() @IsOptional() biography?: string;
  @IsOptional() @IsUUID('4', { each: true }) facultyIds?: string[];
  @IsOptional() @IsUUID('4', { each: true }) buildingIds?: string[];
  @IsOptional() @IsUUID('4', { each: true }) departmentIds?: string[];
  @IsOptional() @IsUUID('4', { each: true }) programIds?: string[];
  @IsOptional() @IsUUID('4', { each: true }) moduleIds?: string[];
}

export class ParentProfileDto {
  @IsString() @IsOptional() cin?: string;
  @IsEnum(Gender) @IsOptional() gender?: Gender;
  @IsEnum(ParentRelationship) @IsOptional() relationship?: ParentRelationship;
  @IsString() @IsOptional() profession?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() emergencyPhone?: string;
  @IsBoolean() @IsOptional() isPrimaryContact?: boolean;
  @IsOptional() @IsUUID('4', { each: true }) childrenIds?: string[];
}

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsUUID()
  roleId: string;

  @IsUUID()
  @IsOptional()
  buildingId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StudentProfileDto)
  studentProfile?: StudentProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfessorProfileDto)
  professorProfile?: ProfessorProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParentProfileDto)
  parentProfile?: ParentProfileDto;
}
