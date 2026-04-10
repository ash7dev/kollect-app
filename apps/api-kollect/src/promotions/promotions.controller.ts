/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard as RolesGuardImport } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateAutoPromotionSchema,
  CreatePromoCodeSchema,
  QueryPromotionsSchema,
  TogglePromotionSchema,
  UpdatePromotionSchema,
  ValidatePromoCodeSchema,
  type CreateAutoPromotionDto,
  type CreatePromoCodeDto,
  type QueryPromotionsDto,
  type TogglePromotionDto,
  type UpdatePromotionDto,
  type ValidatePromoCodeDto,
} from './dto/promotions.dto';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuardImport)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * 🛒 Client valide un code promo au checkout
   * GET /api/promotions/validate?code=X&subtotal=10000&brandId=123 (or brandSlug=xyz)
   */
  @Get('validate')
  async validate(
    @Request() req: any,
    @Query('code') code: string,
    @Query('subtotal') subtotalStr: string,
    @Query('brandId') brandId?: string,
    @Query('brandSlug') brandSlug?: string,
  ) {
    const subtotal = parseInt(subtotalStr || '0', 10);
    return this.promotionsService.validatePromoCodeClient(code, subtotal, brandId, brandSlug, req.user?.id);
  }

  /**
   * 🏪 CEO crée une promotion automatique
   * POST /api/promotions/auto
   */
  @Post('auto')
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(CreateAutoPromotionSchema))
  async createAuto(
    @Request() req: any,
    @Body() dto: CreateAutoPromotionDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.promotionsService.createAutoPromotion(req.user.id, dto);
  }

  /**
   * 🏪 CEO crée un code promo (manuel)
   * POST /api/promotions/code
   */
  @Post('code')
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(CreatePromoCodeSchema))
  async createCode(
    @Request() req: any,
    @Body() dto: CreatePromoCodeDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.promotionsService.createPromoCode(req.user.id, dto);
  }

  /**
   * 🏪 CEO liste ses promotions (Dashboard)
   * GET /api/promotions
   */
  @Get()
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(QueryPromotionsSchema))
  async findAll(
    @Request() req: any,
    @Query() query: QueryPromotionsDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.promotionsService.getMyPromotions(req.user.id, query);
  }

  /**
   * 🏪 CEO active/désactive une promotion
   * PATCH /api/promotions/:id/toggle
   */
  @Patch(':id/toggle')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async toggle(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: TogglePromotionDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.promotionsService.togglePromotion(req.user.id, id, dto);
  }

  /**
   * 🏪 CEO met à jour une promotion
   * PATCH /api/promotions/:id
   */
  @Patch(':id')
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(UpdatePromotionSchema))
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.promotionsService.updatePromotion(req.user.id, id, dto);
  }

  /**
   * 🏪 CEO supprime une promotion
   * DELETE /api/promotions/:id
   */
  @Delete(':id')
  @Roles('isCEO')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    await this.promotionsService.deletePromotion(req.user.id, id);
    return;
  }
}
