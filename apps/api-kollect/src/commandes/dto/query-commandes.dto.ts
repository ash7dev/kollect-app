// src/commandes/dto/query-commandes.dto.ts
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCommandesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100) // Limiter à 100 éléments par page pour des raisons de performance
  limit = 10;

  @IsOptional()
  status?: string; // Filtre optionnel par statut
}
