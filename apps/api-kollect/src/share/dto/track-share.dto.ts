import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ShareType } from '@prisma/client';

export class TrackShareDto {
  @IsEnum(ShareType)
  type: ShareType;

  @IsString()
  targetId: string;

  @IsOptional()
  @IsString()
  platform?: string;
}
