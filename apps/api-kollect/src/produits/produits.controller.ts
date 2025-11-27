/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProduitsService } from './produits.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard as RolesGuardImport } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UploadService } from '../upload/upload.service';
import { ImageFolder } from '../upload/types/upload.types';
import type { CreateProduitDto } from './dto/create-produit.dto';
import { CreateProduitSchema } from './dto/create-produit.dto';
import type { UpdateProduitDto } from './dto/update-produit.dto';
import { UpdateProduitSchema } from './dto/update-produit.dto';
import type { 
  QueryProduitsDto,
  RandomProduitsDto 
} from './dto/query-produits.dto';
import {
  QueryProduitsSchema,
  RandomProduitsSchema,
} from './dto/query-produits.dto';
import { z } from 'zod';

@Controller('produits')
@UseGuards(JwtAuthGuard, RolesGuardImport)
export class ProduitsController {
  private readonly logger = new Logger(ProduitsController.name);

  constructor(
    private readonly produitsService: ProduitsService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * POST /api/produits
   * Créer un produit avec upload d'images
   */
  @Post()
  @Roles('isCEO')
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Request() req: any,
    @Body('data') jsonData: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      // 1. Parser JSON
      let produitData: any;
      try {
        produitData = JSON.parse(jsonData);
      } catch (parseError) {
        this.logger.error('❌ Erreur de parsing JSON:', parseError);
        throw new BadRequestException('Format JSON invalide');
      }

      // 2. Valider avec Zod
      const dto = CreateProduitSchema.parse(produitData);

      this.logger.log(`📦 Création produit: ${dto.name}`);
      this.logger.log(`📁 ${files?.length || 0} fichiers reçus`);

      // 3. Upload des images si des fichiers sont fournis
      if (files && files.length > 0) {
        const validFiles = files.filter((file) => {
          if (!file.buffer || file.buffer.length === 0) {
            this.logger.warn(`⚠️ Fichier vide ignoré: ${file.originalname}`);
            return false;
          }
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            this.logger.warn(
              `⚠️ Type MIME invalide ignoré: ${file.originalname} (${file.mimetype})`,
            );
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          this.logger.log(`📤 Upload de ${validFiles.length} image(s)...`);
          const uploadResults =
            await this.uploadService.uploadProductImages(validFiles);
          dto.images = uploadResults.map((result) => result.secureUrl);
          this.logger.log(
            `✅ ${dto.images.length} image(s) uploadée(s) avec succès`,
          );
        }
      }

      // 4. Vérifier qu'au moins une image est présente
      if (!dto.images || dto.images.length === 0) {
        throw new BadRequestException(
          'Au moins une image est requise pour le produit',
        );
      }

      // 5. Créer le produit
      const result = await this.produitsService.create(req.user.id, dto);

      this.logger.log(`✅ Produit créé: ${result.id}`);
      return result;
    } catch (error: unknown) {
      this.logger.error('❌ Erreur création produit');

      if (error instanceof Error) {
        this.logger.error(`Message: ${error.message}`);
      } else if (error instanceof z.ZodError) {
        this.logger.error(
          'Erreurs de validation:',
          JSON.stringify(error.errors, null, 2),
        );
        throw new BadRequestException({
          message: 'Données invalides',
          errors: error.errors,
        });
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Erreur lors de la création',
      );
    }
  }

  /**
   * GET /api/produits (CEO)
   */
  @Get()
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(QueryProduitsSchema))
  async findAllForCEO(@Request() req: any, @Query() query: QueryProduitsDto) {
    return this.produitsService.findAllForCEO(req.user.id, query);
  }

  /**
   * GET /api/produits/deleted (CEO)
   * Lister les produits soft-deleted de la marque du CEO
   */
  @Get('deleted')
  @Roles('isCEO')
  @UsePipes(new ZodValidationPipe(QueryProduitsSchema))
  async findDeletedForCEO(@Request() req: any, @Query() query: QueryProduitsDto) {
    return this.produitsService.findDeletedForCEO(req.user.id, query);
  }

  /**
   * GET /api/produits/ceo/:id (CEO)
   */
  @Get('ceo/:id')
  @Roles('isCEO')
  async findOneForCEO(@Request() req: any, @Param('id') id: string) {
    return this.produitsService.findOneForCEO(req.user.id, id);
  }

  /**
   * PUT /api/produits/:id
   * Mettre à jour un produit avec upload d'images
   */
  @Put(':id')
  @Roles('isCEO')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body('data') jsonData: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      // 1. Parser JSON
      let produitData: any;
      try {
        produitData = JSON.parse(jsonData);
      } catch (parseError) {
        this.logger.error('❌ Erreur de parsing JSON:', parseError);
        throw new BadRequestException('Format JSON invalide');
      }

      // 2. Valider avec Zod
      const dto = UpdateProduitSchema.parse(produitData);

      this.logger.log(`📝 Mise à jour produit: ${id}`);
      this.logger.log(`📁 ${files?.length || 0} fichiers reçus`);

      // 3. Upload des images si des fichiers sont fournis
      if (files && files.length > 0) {
        const validFiles = files.filter((file) => {
          if (!file.buffer || file.buffer.length === 0) {
            this.logger.warn(`⚠️ Fichier vide ignoré: ${file.originalname}`);
            return false;
          }
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            this.logger.warn(
              `⚠️ Type MIME invalide ignoré: ${file.originalname} (${file.mimetype})`,
            );
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          this.logger.log(`📤 Upload de ${validFiles.length} image(s)...`);
          const uploadResults =
            await this.uploadService.uploadProductImages(validFiles);
          const newImageUrls = uploadResults.map((result) => result.secureUrl);

          // Si des images existent déjà dans le DTO, les fusionner, sinon remplacer
          if (dto.images && dto.images.length > 0) {
            dto.images = [...dto.images, ...newImageUrls];
          } else {
            dto.images = newImageUrls;
          }

          this.logger.log(
            `✅ ${newImageUrls.length} image(s) uploadée(s) avec succès`,
          );
        }
      }

      // 4. Mettre à jour le produit
      const result = await this.produitsService.update(req.user.id, id, dto);

      this.logger.log(`✅ Produit mis à jour: ${result.id}`);
      return result;
    } catch (error: unknown) {
      this.logger.error('❌ Erreur mise à jour produit');

      if (error instanceof Error) {
        this.logger.error(`Message: ${error.message}`);
      } else if (error instanceof z.ZodError) {
        this.logger.error(
          'Erreurs de validation:',
          JSON.stringify(error.errors, null, 2),
        );
        throw new BadRequestException({
          message: 'Données invalides',
          errors: error.errors,
        });
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour',
      );
    }
  }

  /**
   * PATCH /api/produits/:id
   * Mettre à jour partiellement un produit (alias de PUT)
   */
  @Patch(':id')
  @Roles('isCEO')
  @UseInterceptors(AnyFilesInterceptor())
  async patch(
    @Request() req: any,
    @Param('id') id: string,
    @Body('data') jsonData: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.update(req, id, jsonData, files);
  }

  /**
   * DELETE /api/produits/:id
   */
  @Delete(':id')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.produitsService.delete(req.user.id, id);
  }

  /**
   * PATCH /api/produits/:id/restore
   * Restaurer un produit soft-deleted
   */
  @Patch(':id/restore')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async restore(@Request() req: any, @Param('id') id: string) {
    return this.produitsService.restore(req.user.id, id);
  }

  /**
   * 🌟 Produits Featured (Mise en avant)
   * GET /api/produits/featured?limit=10
   */
  @Get('featured')
  @Public()
  async getFeatured(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`🌟 Récupération des produits featured (limit: ${limit})`);
    return this.produitsService.findFeatured(limit);
  }

  /**
   * 🔥 Produits Populaires
   * GET /api/produits/popular?limit=20&days=30
   */
  @Get('popular')
  @Public()
  async getPopular(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    this.logger.log(`🔥 Récupération des produits populaires (limit: ${limit}, days: ${days})`);
    return this.produitsService.findPopular(limit, days);
  }

  /**
   * 🆕 Nouveaux Produits
   * GET /api/produits/new?limit=20&days=14
   */
  @Get('new')
  @Public()
  async getNew(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('days', new DefaultValuePipe(14), ParseIntPipe) days: number,
  ) {
    this.logger.log(`🆕 Récupération des nouveaux produits (limit: ${limit}, days: ${days})`);
    return this.produitsService.findNew(limit, days);
  }

  /**
   * 👤 Recommandations Personnalisées
   * GET /api/produits/personalized?limit=20
   * Authentification requise
   */
  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalized(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`👤 Récupération des recommandations pour ${req.user.id}`);
    return this.produitsService.findPersonalized(req.user.id, limit);
  }

  /**
   * 🔍 Recherche Avancée de Produits
   * GET /api/produits/search
   * Paramètres: query, brandId, collectionId, minPrice, maxPrice, sizes, colors, inStock, page, limit
   */
  @Get('search')
  @Public()
  async search(
    @Query('query') query?: string,
    @Query('brandId') brandId?: string,
    @Query('collectionId') collectionId?: string,
    @Query('minPrice', new DefaultValuePipe(0), ParseIntPipe) minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sizes') sizes?: string, // Format: "S,M,L"
    @Query('colors') colors?: string, // Format: "Noir,Blanc,Rouge"
    @Query('inStock') inStock?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    this.logger.log(`🔍 Recherche de produits: "${query || 'tous'}"`);

    // Parser les tableaux
    const sizesArray = sizes ? sizes.split(',').map(s => s.trim()) : undefined;
    const colorsArray = colors ? colors.split(',').map(c => c.trim()) : undefined;
    const inStockBool = inStock === 'true' || inStock === '1';

   return this.produitsService.searchProducts({
  query,
  brandId,
  collectionId,
  minPrice: minPrice || undefined,
  maxPrice: maxPrice || undefined,  // Fixed: removed parseInt since maxPrice is already a number
  sizes: sizesArray,
  colors: colorsArray,
  inStock: inStockBool,
  page,
  limit,
});
  }

  /**
   * 🏢 Produits d'une Marque (Public)
   * GET /api/produits/brand/:slug?page=1&limit=20&sortBy=recent
   */
  @Get('brand/:slug')
  @Public()
  async getByBrand(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy?: 'recent' | 'popular' | 'price-asc' | 'price-desc',
  ) {
    this.logger.log(`🏢 Récupération des produits de la marque: ${slug}`);
    return this.produitsService.findByBrandPublic(slug, {
      page,
      limit,
      sortBy: sortBy || 'recent',
    });
  }

  /**
   * 📦 Produits d'une Collection (Public)
   * GET /api/produits/collection/:id?limit=10
   */
  @Get('collection/:id')
  @Public()
  async getByCollection(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`📦 Récupération des produits de la collection: ${id}`);
    return this.produitsService.findRandomByCollection(id, limit);
  }

  /**
   * GET /api/produits/public/random
   */
   @Get('public/random')
  @Public()
  findRandom(@Query() query: any) {
    return this.produitsService.findRandom(query);
  }
  /**
   * GET /api/produits/:id (public)
   */
  @Get('public/:id')
  @Public()
  async findOnePublic(@Param('id') id: string) {
    return this.produitsService.findOnePublic(id);
  }
}
