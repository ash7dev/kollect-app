/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandsService, BrandStats } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import { Roles, GetUser } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateBrandResponse } from './types/brand.types';
import { UPLOAD_CONSTANTS } from '../upload/types/upload.types';

// Interface pour les filtres de recherche
// Les valeurs viennent des query params (?isActive=true&isVerified=true)
// et sont donc des strings ici; la conversion en boolean est faite dans le service.
interface BrandFilters {
  isActive?: string;
  isVerified?: string;
  search?: string;
}

/**
 * 🏪 Contrôleur des boutiques (Marques)
 * 
 * Architecture de sécurité :
 * - Routes publiques : @Public() decorator
 * - Routes CEO : @Roles('isCEO') + JwtAuthGuard
 * - Routes propriétaire : @UseGuards(BrandOwnerGuard) supplémentaire
 */
@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  // ========================================
  // ROUTES PUBLIQUES (sans authentification)
  // ========================================

  /**
   * 📋 Lister toutes les boutiques actives
   * GET /brands
   * Public - Accessible à tous
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: BrandFilters) {
    return await this.brandsService.findAll(filters);
  }

  /**
   * 🔍 Récupérer une boutique par son slug (page publique)
   * GET /brands/slug/:slug
   * Public - Page vitrine de la marque
   */
  @Public()
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(@Param('slug') slug: string) {
    return await this.brandsService.findBySlug(slug);
  }

  /**
   * 🔍 Récupérer une boutique par son id (page publique)
   * GET /brands/public/:id
   * Public - utile pour les liens de partage quand on n'a pas le slug
   */
  @Public()
  @Get('public/:id')
  @HttpCode(HttpStatus.OK)
  async findPublicById(@Param('id') id: string) {
    return await this.brandsService.findPublicById(id);
  }

  // ========================================
  // ROUTES CEO UNIQUEMENT
  // ========================================

  /**
   * 🏪 Créer une nouvelle boutique
   * POST /brands
   * Nécessite : JWT + Rôle CEO
   * Limitation : Un CEO ne peut avoir qu'une seule boutique
   * 
   * Body (multipart/form-data) :
   * - name: string (required)
   * - slug: string (required)
   * - bio: string (optional)
   * - description: string (optional)
   * - logo: file (optional, max 5MB)
   * - website, instagram, facebook, twitter, tiktok: string (optional)
   */
  @Post()
  @Roles('isCEO')
  @UseInterceptors(FileInterceptor('logo'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetUser('id') userId: string,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: UPLOAD_CONSTANTS.MAX_IMAGE_SIZE,
          }),
          new FileTypeValidator({
            fileType: new RegExp(
              UPLOAD_CONSTANTS.ALLOWED_IMAGE_MIMETYPES.join('|'),
            ),
          }),
        ],
        fileIsRequired: false, // Le logo est optionnel
      }),
    )
    logo?: Express.Multer.File,
  ): Promise<CreateBrandResponse> {
    // Si un fichier est téléchargé, on l'ajoute au DTO
    if (logo) {
      createBrandDto.logo = logo;
    }

    return await this.brandsService.create(userId, createBrandDto);
  }

  /**
   * 🏠 Récupérer MA boutique (Dashboard CEO)
   * GET /brands/my-brand
   * Nécessite : JWT + Rôle CEO
   * Retourne la boutique du CEO connecté avec ses stats
   */
  @Get('my-brand')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async findMyBrand(@GetUser('id') userId: string) {
    return await this.brandsService.findMyBrand(userId);
  }

  // ========================================
  // ROUTES CEO + PROPRIÉTAIRE DE LA MARQUE
  // ========================================

  /**
   * ✏️ Mettre à jour MA boutique
   * PATCH /brands/:id
   * Nécessite : JWT + Rôle CEO + Propriétaire de la marque
   * 
   * Body (multipart/form-data) :
   * - Tous les champs sont optionnels
   * - logo: file | null | '' (file = remplacer, null/'' = supprimer, absent = conserver)
   * 
   * Gestion intelligente du logo :
   * - Si logo = file → Upload nouveau + suppression ancien
   * - Si logo = '' ou null → Suppression du logo actuel
   * - Si logo absent → Pas de modification
   */
  @Patch(':id')
  @Roles('isCEO')
  @UseGuards(BrandOwnerGuard)
  @UseInterceptors(FileInterceptor('logo'))
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser('id') userId: string,
    @Param('id') brandId: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: UPLOAD_CONSTANTS.MAX_IMAGE_SIZE,
          }),
          new FileTypeValidator({
            fileType: new RegExp(
              UPLOAD_CONSTANTS.ALLOWED_IMAGE_MIMETYPES.join('|'),
            ),
          }),
        ],
        fileIsRequired: false, // Le logo est optionnel lors de l'update
      }),
    )
    logo?: Express.Multer.File,
  ) {
    // Gestion intelligente du logo
    if (logo) {
      // Nouveau fichier uploadé → remplacement
      updateBrandDto.logo = logo;
    } else if (updateBrandDto.logo === '' || updateBrandDto.logo === 'null') {
      // Suppression demandée (via form data string)
      updateBrandDto.logo = null;
    }
    // Si ni logo file ni suppression demandée → pas de modification (undefined)

    return await this.brandsService.update(userId, brandId, updateBrandDto);
  }

  /**
   * 🗑️ Désactiver MA boutique (Soft Delete)
   * DELETE /brands/:id/deactivate
   * Nécessite : JWT + Rôle CEO + Propriétaire
   * La boutique reste en BDD mais n'est plus visible publiquement
   */
  @Delete(':id/deactivate')
  @Roles('isCEO')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.brandsService.deactivate(userId, id);
  }

  /**
   * 🔄 Réactiver MA boutique
   * PATCH /brands/:id/reactivate
   * Nécessite : JWT + Rôle CEO + Propriétaire
   */
  @Patch(':id/reactivate')
  @Roles('isCEO')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async reactivate(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.brandsService.reactivate(userId, id);
  }


  // ========================================
  // ROUTES ADMIN (à implémenter)
  // ========================================

  /**
   * 🛡️ Vérifier une marque (Admin uniquement)
   * PATCH /brands/:id/verify
   * Nécessite : JWT + Rôle Admin
   * 
   * Permet à un admin de marquer une boutique comme "vérifiée"
   * (badge de confiance sur la plateforme)
   */
  @Patch(':id/verify')
  @Roles('isAdmin')
  @HttpCode(HttpStatus.OK)
  async verifyBrand(@Param('id') id: string) {
    // TODO: Implémenter la logique de vérification
    // Cette méthode devrait :
    // 1. Vérifier que l'utilisateur est admin
    // 2. Mettre à jour isVerified = true
    // 3. Potentiellement notifier le CEO

    return {
      message: 'Fonctionnalité de vérification à implémenter',
      brandId: id,
    };
  }

  /**
 * 📊 Récupérer les statistiques de MA boutique
 * GET /brands/:id/stats
 */
  @Get(':id/stats')
  @Roles('isCEO')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async getStats(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Query('period') period: '7days' | '30days' | '90days' = '30days',
  ): Promise<BrandStats & {
    period: '7days' | '30days' | '90days';
    ordersThisPeriod: number;
    ordersChange: number;
    followersChange: number;
    conversionRate: number;
    revenueThisPeriod: number;
    revenueChange: number;
    viewsThisPeriod: number;
  }> {
    return await this.brandsService.getStats(userId, id, period);
  }

  /**
   * 📈 Récupérer les données de ventes par période
   * GET /brands/:id/sales-data?period=7days
   */
  @Get(':id/sales-data')
  @Roles('isCEO')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async getSalesData(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Query('period') period: '7days' | '30days' | '90days' = '7days',
  ) {
    return await this.brandsService.getSalesData(userId, id, period);
  }
  /**
   * 🗑️ Supprimer définitivement une marque (Admin uniquement)
   * DELETE /brands/:id/force-delete
   * Nécessite : JWT + Rôle Admin
   * 
   * Suppression définitive en BDD (Hard Delete)
   * À utiliser avec précaution
   */
  @Delete(':id/force-delete')
  @Roles('isAdmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forceDelete(@Param('id') id: string) {
    // TODO: Implémenter la suppression définitive
    // Attention : gérer les contraintes de clés étrangères

    return {
      message: 'Fonctionnalité de suppression définitive à implémenter',
      brandId: id,
    };
  }
}
