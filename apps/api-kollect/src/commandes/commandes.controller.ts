/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandesService } from './commandes.service';
import {
  CreateCommandeDto,
  UpdateCommandeStatusDto,
  QueryCommandesDto,
} from './dto/create-commande.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

interface UserPayload {
  id: string;
  email: string;
  isClient: boolean;
  isCEO: boolean;
  isAdmin: boolean;
}

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  /**
   * POST /api/commandes
   * Créer une nouvelle commande (Client)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createCommandeDto: CreateCommandeDto,
  ) {
    return this.commandesService.createCommande(user.id, createCommandeDto);
  }

  /**
   * GET /api/commandes/me
   * Liste des commandes du client connecté
   */
  @Get('me')
  async getMyCommandes(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryCommandesDto,
  ) {
    return this.commandesService.getCommandesClient(user.id, query);
  }

  /**
   * GET /api/commandes/boutique/me
   * Liste des commandes de la boutique (CEO uniquement)
   */
  @Get('boutique/me')
  @UseGuards(RolesGuard)
  @Roles('isCEO')
  async getBoutiqueCommandes(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryCommandesDto,
  ) {
    return this.commandesService.getCommandesBoutique(user.id, query);
  }

  /**
   * GET /api/commandes/:id
   * Détails d'une commande
   */
  @Get(':id')
  async getCommande(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.commandesService.getCommandeById(id, user.id, user.isCEO);
  }

  /**
   * PATCH /api/commandes/:id/confirmer
   * Confirmer une commande (CEO uniquement)
   */
  @Patch(':id/confirmer')
  @UseGuards(RolesGuard)
  @Roles('isCEO')
  @HttpCode(HttpStatus.OK)
  async confirmerCommande(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCommandeStatusDto,
  ) {
    return this.commandesService.confirmerCommande(id, user.id, dto.notes);
  }

  /**
   * PATCH /api/commandes/:id/annuler
   * Annuler une commande (CEO ou Client)
   */
  @Patch(':id/annuler')
  @HttpCode(HttpStatus.OK)
  annulerCommande(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCommandeStatusDto,
  ) {
    return this.commandesService.annulerCommande(
      id,
      user.id,
      user.isCEO,
      dto.notes,
    );
  }
}
