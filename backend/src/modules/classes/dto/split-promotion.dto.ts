import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class SplitPromotionDto {
  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @IsNumber()
  @IsNotEmpty()
  numGroups: number;
}
