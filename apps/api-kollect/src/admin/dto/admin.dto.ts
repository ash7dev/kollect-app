import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['isClient', 'isCEO', 'isAdmin'])
  role?: 'isClient' | 'isCEO' | 'isAdmin';

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsEnum(['createdAt', 'email', 'firstName', 'lastName'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class GetBrandsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsEnum(['createdAt', 'name'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateUserRoleDto {
  @IsBoolean()
  isClient: boolean;

  @IsBoolean()
  isCEO: boolean;

  @IsBoolean()
  isAdmin: boolean;
}

export class GetOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['EN_ATTENTE', 'CONFIRMEE', 'LIVREE', 'ANNULEE'])
  status?: 'EN_ATTENTE' | 'CONFIRMEE' | 'LIVREE' | 'ANNULEE';

  @IsOptional()
  @IsEnum(['EN_ATTENTE', 'VALIDEE', 'ECHOUEE', 'REMBOURSEE', 'ANNULEE'])
  paymentStatus?:
    | 'EN_ATTENTE'
    | 'VALIDEE'
    | 'ECHOUEE'
    | 'REMBOURSEE'
    | 'ANNULEE';

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsEnum(['7days', '30days', '90days', 'all'])
  period?: '7days' | '30days' | '90days' | 'all' = '30days';

  @IsOptional()
  @IsEnum(['createdAt', 'total', 'orderNumber'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class GetReviewsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved'])
  status?: 'pending' | 'approved';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsEnum(['true', 'false'])
  verified?: 'true' | 'false';

  @IsOptional()
  @IsEnum(['createdAt', 'rating', 'isApproved'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ReviewModerationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BrandVerificationDto {
  @IsBoolean()
  verified: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetGlobalStatsDto {
  @IsOptional()
  @IsEnum(['7days', '30days', '90days'])
  period?: '7days' | '30days' | '90days' = '30days';
}

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
}

export class SendNotificationByRoleDto extends SendNotificationDto {
  @IsEnum(['isClient', 'isCEO', 'isAdmin'])
  role: 'isClient' | 'isCEO' | 'isAdmin';
}
