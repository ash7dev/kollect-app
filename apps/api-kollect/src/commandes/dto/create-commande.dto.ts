import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CommandeItemDto {
  @IsString()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  // Optionnels pour les cas sans variante explicite
  @IsString()
  @IsOptional()
  size?: string | null;

  @IsString()
  @IsOptional()
  color?: string | null;
}

export class AdresseLivraisonDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  adresse: string;

  @IsString()
  @IsNotEmpty()
  ville: string;
}

export class CreateCommandeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommandeItemDto)
  items: CommandeItemDto[];

  @ValidateNested()
  @Type(() => AdresseLivraisonDto)
  adresseLivraison: AdresseLivraisonDto;

  @IsString()
  @IsOptional()
  codePromo?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCommandeStatusDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;
}

export class QueryCommandesDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
