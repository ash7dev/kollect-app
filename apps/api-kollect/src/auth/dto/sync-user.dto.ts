import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncUserDto {
  @IsString()
  @IsNotEmpty()
  kindeId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
