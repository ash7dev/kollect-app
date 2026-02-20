import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ShareType } from '@prisma/client';

export class GetShareStatsDto {
  @IsOptional()
  @IsEnum(ShareType)
  type?: ShareType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
