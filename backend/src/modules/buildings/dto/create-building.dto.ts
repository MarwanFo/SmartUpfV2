import { IsString, IsNotEmpty, IsOptional, IsUrl, IsBoolean, IsNumber } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Le code est obligatoire' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'L\'adresse est obligatoire' })
  address: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'L\'URL du logo doit être valide' })
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  numRooms?: number;
}
