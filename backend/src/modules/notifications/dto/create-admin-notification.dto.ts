import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { NotifType } from '@prisma/client';

export enum TargetScope {
  ALL = 'ALL',
  ROLE = 'ROLE',
  PROGRAM = 'PROGRAM',
  BUILDING = 'BUILDING',
}

export class CreateAdminNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotifType)
  type: NotifType;

  @IsEnum(TargetScope)
  targetScope: TargetScope;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetIds?: string[];
}
