import { IsString, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;

  @IsString()
  academicYear: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsUUID()
  programId: string;

  @IsUUID()
  buildingId: string;
}
