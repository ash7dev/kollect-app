import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncUserDto {
  @IsString()
  @IsNotEmpty()
  supabaseAccessToken: string;

  @IsString()
  @IsOptional()
  fcmToken?: string | null;
}
