/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  Logger,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CollectionsService } from './collections.service';
import type { QueryCollectionsDto } from './dto/query-collections.dto';
import {
  CreateCollectionDto,
  CreateCollectionSchema,
} from './dto/create-collection.dto';
import { UpdateCollectionSchema } from './dto/update-collection.dto';
import type { ActivateTeaserDto } from './dto/activate-teaser.dto';
import { ActivateTeaserSchema } from './dto/activate-teaser.dto';
import { QueryCollectionsSchema } from './dto/query-collections.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard as RolesGuardImport } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UploadService } from '../upload/upload.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { ImageFolder } from '../upload/types/upload.types';
import { z } from 'zod';

@Controller('collections')
@UseGuards(JwtAuthGuard, RolesGuardImport)
export class CollectionsController {
  private readonly logger = new Logger(CollectionsController.name);

  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * 📦 Créer une nouvelle collection avec upload multiple flexible
   * POST /api/collections
   * Supporte N produits avec M images chacun
   */
  // collections.controller.ts

  @Post()
  @Roles('isCEO')
  @UseInterceptors(AnyFilesInterceptor()) // ✅ Accepte tous les fieldnames
  async create(
    @Request() req: any,
    @Body('data') jsonData: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      // 1. Parser JSON
      let collectionData: any;
      try {
        collectionData = JSON.parse(jsonData);
      } catch (parseError) {
        this.logger.error('❌ Erreur de parsing JSON:', parseError);
        throw new BadRequestException('Format JSON invalide');
      }

      // 2. Valider avec Zod
      const dto = CreateCollectionSchema.parse(collectionData);

      this.logger.log(`📦 Création collection: ${dto.name}`);
      this.logger.log(`📁 ${files?.length || 0} fichiers reçus`);
      this.logger.log(`🛍️ ${dto.products.length} produits`);

      // ✅ LOGGING DÉTAILLÉ DES FICHIERS
      if (files && files.length > 0) {
        files.forEach((file) => {
          const sizeKB = Math.round(file.size / 1024);
          const hasBuffer = file.buffer && file.buffer.length > 0;
          this.logger.log(
            `  📎 ${file.fieldname}: ${file.originalname} (${sizeKB}KB, buffer: ${hasBuffer ? '✅' : '❌'})`,
          );
        });
      }

      // 3. Organiser les fichiers
      const organizedFiles = this.organizeFiles(files || []);

      // 4. Upload du média de la collection
      await this.uploadCollectionMedia(dto, organizedFiles);

      // 5. Upload des images des produits
      await this.uploadProductImages(dto, organizedFiles);

      // 6. Créer la collection
      const result = await this.collectionsService.create(req.user.id, dto);

      this.logger.log(`✅ Collection créée: ${result.id}`);
      return result;
    } catch (error: unknown) {
      this.logger.error('❌ Erreur création collection');

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
   * 📂 Organiser les fichiers par type
   * Structure attendue des fieldnames:
   * - "collectionMedia" : média de la collection
   * - "product-{index}-image-{imageIndex}" : images des produits
   */
  private organizeFiles(files: Express.Multer.File[]) {
    const result = {
      collectionMedia: null as Express.Multer.File | null,
      productImages: new Map<number, Express.Multer.File[]>(),
    };

    this.logger.log(`🔍 Organisation de ${files.length} fichier(s)...`);

    for (const file of files) {
      this.logger.log(
        `  - Fichier: "${file.fieldname}" (${file.originalname}, ${Math.round(file.size / 1024)}KB)`,
      );

      if (file.fieldname === 'collectionMedia') {
        result.collectionMedia = file;
        this.logger.log(`    ✓ Assigné comme média de collection`);
      } else if (file.fieldname.startsWith('product-')) {
        // Pattern: product-0-image-0, product-0-image-1, product-1-image-0, etc.
        const match = file.fieldname.match(/product-(\d+)-image-(\d+)/);

        if (match) {
          const productIndex = parseInt(match[1], 10);
          const imageIndex = parseInt(match[2], 10);

          if (!result.productImages.has(productIndex)) {
            result.productImages.set(productIndex, []);
          }

          const images = result.productImages.get(productIndex)!;
          images.push(file);

          this.logger.log(
            `    ✓ Assigné au produit ${productIndex}, image ${imageIndex}`,
          );
        } else {
          this.logger.warn(
            `    ⚠️ Format de fieldname non reconnu: ${file.fieldname}`,
          );
        }
      } else {
        this.logger.warn(`    ⚠️ Fieldname ignoré: ${file.fieldname}`);
      }
    }

    // Afficher le résumé
    this.logger.log(`\n📊 Résumé de l'organisation:`);
    this.logger.log(
      `  - Média collection: ${result.collectionMedia ? '1 fichier' : 'aucun'}`,
    );
    this.logger.log(`  - Produits avec images: ${result.productImages.size}`);

    result.productImages.forEach((images, index) => {
      this.logger.log(`    • Produit ${index}: ${images.length} image(s)`);
    });

    return result;
  }

  /**
   * 📤 Upload le média principal de la collection
   */
  private async uploadCollectionMedia(
    dto: CreateCollectionDto,
    files: {
      collectionMedia: Express.Multer.File | null;
      productImages: Map<number, Express.Multer.File[]>;
    },
  ) {
    const collectionFile = files.collectionMedia;

    if (!collectionFile) {
      this.logger.log('ℹ️ Aucun média de collection fourni');
      return;
    }

    const isVideo = collectionFile.mimetype.startsWith('video/');

    this.logger.log(
      `📤 Upload du média de collection (${isVideo ? 'vidéo' : 'image'})...`,
    );

    if (isVideo) {
      const result = await this.cloudinaryService.uploadVideo(collectionFile, {
        folder: ImageFolder.COLLECTIONS,
      });
      dto.teaserVideo = result.secureUrl;
      this.logger.log(`✅ Vidéo teaser uploadée: ${result.secureUrl}`);
    } else {
      const url =
        await this.uploadService.uploadCollectionCover(collectionFile);
      dto.coverImage = url;
      this.logger.log(`✅ Image de couverture uploadée: ${url}`);
    }
  }

  /**
   * 📤 Upload toutes les images de tous les produits
   */
  // collections.controller.ts - Amélioration de uploadProductImages

  private async uploadProductImages(
    dto: CreateCollectionDto,
    files: { productImages: Map<number, Express.Multer.File[]> },
  ) {
    this.logger.log(
      `\n📤 Upload des images pour ${dto.products.length} produit(s)...`,
    );

    // Vérifier qu'on a reçu des fichiers pour tous les produits
    const totalExpectedImages = dto.products.reduce(
      (sum, p) => sum + (p.images?.length || 0),
      0,
    );
    const totalReceivedFiles = Array.from(files.productImages.values()).reduce(
      (sum, fileArray) => sum + fileArray.length,
      0,
    );

    this.logger.log(
      `📊 Total: ${totalReceivedFiles} fichier(s) reçu(s) pour ${totalExpectedImages} image(s) attendue(s)`,
    );

    for (let i = 0; i < dto.products.length; i++) {
      const product = dto.products[i];
      const productFiles = files.productImages.get(i) || [];

      this.logger.log(
        `\n  📦 Produit ${i + 1}/${dto.products.length}: "${product.name}"`,
      );
      this.logger.log(`  - ${productFiles.length} fichier(s) trouvé(s)`);
      this.logger.log(
        `  - Images attendues dans DTO: ${product.images?.length || 0}`,
      );

      if (productFiles.length > 0) {
        // ✅ VALIDATION AMÉLIORÉE
        const validFiles = productFiles.filter((file) => {
          if (!file.buffer || file.buffer.length === 0) {
            this.logger.warn(`  ⚠️ Fichier vide ignoré: ${file.originalname}`);
            return false;
          }
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            this.logger.warn(
              `  ⚠️ Type MIME invalide ignoré: ${file.originalname} (${file.mimetype})`,
            );
            return false;
          }
          this.logger.log(
            `  ✓ Fichier valide: ${file.originalname} (${Math.round(file.size / 1024)}KB, ${file.mimetype})`,
          );
          return true;
        });

        if (validFiles.length === 0) {
          throw new BadRequestException(
            `Aucun fichier valide fourni pour le produit "${product.name}" (index ${i}). ` +
              `Vérifiez que les fichiers ne sont pas vides et sont des images valides.`,
          );
        }

        try {
          const uploadResults =
            await this.uploadService.uploadProductImages(validFiles);
          product.images = uploadResults.map((result) => result.secureUrl);

          this.logger.log(
            `  ✅ ${product.images.length} image(s) uploadée(s) avec succès`,
          );
        } catch (uploadError) {
          this.logger.error(
            `  ❌ Erreur lors de l'upload des images:`,
            uploadError,
          );
          throw new BadRequestException(
            `Erreur lors de l'upload des images du produit "${product.name}" (index ${i}): ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`,
          );
        }
      } else {
        // Aucun fichier reçu pour ce produit
        this.logger.warn(
          `  ⚠️ Aucun fichier reçu pour le produit "${product.name}" (index ${i})`,
        );

        // Si le produit n'a pas d'images dans le DTO non plus, c'est une erreur
        if (!product.images || product.images.length === 0) {
          throw new BadRequestException(
            `Le produit "${product.name}" (index ${i}) doit avoir au moins une image. ` +
              `Aucun fichier n'a été reçu pour ce produit.`,
          );
        } else {
          // Le produit a des images dans le DTO mais aucun fichier n'a été reçu
          // Cela peut arriver si les images sont déjà des URLs (cas de mise à jour)
          this.logger.log(
            `  ℹ️ Produit avec ${product.images.length} image(s) déjà présentes dans le DTO`,
          );
        }
      }
    }
  }

  @Post(':id/activate-teaser')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(ActivateTeaserSchema))
  async activateTeaser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ActivateTeaserDto,
  ) {
    return this.collectionsService.activateTeaser(req.user.id, id, dto);
  }

  @Post(':id/launch')
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async launch(@Request() req: any, @Param('id') id: string) {
    return this.collectionsService.launchCollection(req.user.id, id);
  }

  @Delete(':id')
  @Roles('isCEO')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    this.logger.log(`🗑️ Suppression de la collection: ${id}`);
    await this.collectionsService.remove(req.user.id, id);
    return { success: true, message: 'Collection supprimée avec succès' };
  }

  @Get()
  @Roles('isCEO')
  async findAllForCEO(@Request() req: any, @Query() rawQuery: any) {
    this.logger.log('=== REQUÊTE POUR LISTER LES COLLECTIONS ===');
    this.logger.log(`Utilisateur: ${req.user.id}`);

    try {
      const validatedQuery = QueryCollectionsSchema.parse(rawQuery || {});
      const { includeProducts, ...queryDto } = validatedQuery;

      const result = await this.collectionsService.findAllForCEO(
        req.user.id,
        queryDto,
        includeProducts || false,
      );

      this.logger.log(`✅ ${result.data.length} collections trouvées`);
      return result;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des collections');

      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Paramètres de requête invalides',
          errors: error.errors,
        });
      }

      throw error;
    }
  }

  @Patch(':id')
  @Roles('isCEO')
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ZodValidationPipe(UpdateCollectionSchema))
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const dto = UpdateCollectionSchema.parse(body);

    if (files && files.length > 0) {
      const file = files[0];
      const isVideo = file.mimetype.startsWith('video/');

      if (isVideo) {
        const result = await this.cloudinaryService.uploadVideo(file, {
          folder: ImageFolder.COLLECTIONS,
        });
        dto.teaserVideo = result.secureUrl;
      } else {
        const url = await this.uploadService.uploadCollectionCover(file);
        dto.coverImage = url;
      }
    }

    return this.collectionsService.update(req.user.id, id, dto);
  }

  @Get('public')
  @Public()
  @UsePipes(new ZodValidationPipe(QueryCollectionsSchema))
  async findAllPublic(
    @Query() query: QueryCollectionsDto,
    @Query('includeProducts') includeProducts?: string | boolean,
  ) {
    const include = includeProducts === true || includeProducts === 'true';
    return this.collectionsService.findAllPublic(query, include);
  }

  @Get('public/:id')
  @Public()
  async findOnePublic(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts: string | boolean = false,
  ) {
    const include = includeProducts === true || includeProducts === 'true';
    return this.collectionsService.findOne(id, {
      includeProducts: include,
      isPublic: true,
    });
  }

  @Get(':id')
  @Roles('isCEO')
  async findOneCEO(
    @Request() req: any,
    @Param('id') id: string,
    @Query('includeProducts') includeProducts: string | boolean = false,
  ) {
    const include = includeProducts === true || includeProducts === 'true';
    return this.collectionsService.findOne(id, {
      userId: req.user.id,
      includeProducts: include,
      isPublic: false,
    });
  }
}
