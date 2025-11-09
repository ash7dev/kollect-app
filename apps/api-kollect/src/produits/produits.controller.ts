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
   * GET /api/produits/public/random
   */
  @Get('public/random')
  @Public()
  @UsePipes(new ZodValidationPipe(RandomProduitsSchema))
  async findRandom(@Query() query: RandomProduitsDto) {
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
