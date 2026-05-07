import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Semester } from '@prisma/client';
import { Type } from 'class-transformer';

export class ModuleProgramLinkDto {
  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsEnum(Semester)
  @IsNotEmpty()
  semester: Semester;

  @IsNumber()
  @Min(1)
  year: number;

  @IsNumber()
  @Min(0.5)
  @Max(40)
  @IsOptional()
  weeklyHours?: number;
}

export class CreateModuleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleProgramLinkDto)
  links: ModuleProgramLinkDto[];

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  credits: number;

  @IsNumber()
  @Min(0)
  coefficient: number;
}
