import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import { CycleType } from '@prisma/client';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CycleType)
  @IsNotEmpty()
  cycle: CycleType;

  @IsInt()
  @Min(1)
  duration: number;

  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsString()
  @IsOptional()
  coordinatorId?: string;

  @IsBoolean()
  @IsOptional()
  hasPFA?: boolean;

  @IsInt()
  @IsOptional()
  pfaYear?: number;

  @IsEnum(['S1', 'S2'])
  @IsOptional()
  pfaSemester?: any;

  @IsBoolean()
  @IsOptional()
  hasPFE?: boolean;

  @IsInt()
  @IsOptional()
  pfeYear?: number;

  @IsEnum(['S1', 'S2'])
  @IsOptional()
  pfeSemester?: any;
}
