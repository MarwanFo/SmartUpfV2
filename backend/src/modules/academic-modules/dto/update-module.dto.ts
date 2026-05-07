import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleDto } from './create-module.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModuleProgramLinkDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleProgramLinkDto)
  links?: ModuleProgramLinkDto[];
}
