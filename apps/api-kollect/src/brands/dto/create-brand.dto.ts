/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug doit être en minuscules, avec des tirets uniquement',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @IsOptional()
  logo?: Express.Multer.File;

  @IsOptional()
  coverImage?: Express.Multer.File;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Instagram invalide',
  })
  instagram?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^(\+221)?[0-9]{9}$/, {
    message: 'Numéro WhatsApp invalide',
  })
  whatsapp?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;
}