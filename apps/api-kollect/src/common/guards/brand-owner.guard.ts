/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../decorators/roles.decorator';

/**
 * 🔒 Guard pour vérifier que l'utilisateur est propriétaire de la marque
 * 
 * Ce guard vérifie :
 * 1. Que l'utilisateur est authentifié
 * 2. Que l'utilisateur est CEO
 * 3. Que la marque existe
 * 4. Que l'utilisateur est propriétaire de cette marque
 * 
 * Usage dans le controller :
 * @UseGuards(JwtAuthGuard, RolesGuard, BrandOwnerGuard)
 * @Roles('isCEO')
 */
@Injectable()
export class BrandOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    
    // 1. Vérifier que l'utilisateur est authentifié
    if (!user || !user.id) {
      throw new ForbiddenException('Authentification requise');
    }

    // 2. Vérifier que l'utilisateur est CEO
    if (!user.isCEO) {
      throw new ForbiddenException('Accès réservé aux CEO');
    }

    // 3. Récupérer le brandId depuis les paramètres de la route
    // Supporte plusieurs formats : /brands/:id, /brands/:brandId
    const brandId = request.params.id || request.params.brandId;

    if (!brandId) {
      throw new BadRequestException('ID de boutique manquant dans la requête');
    }

    // 4. Vérifier que la marque existe et appartient à l'utilisateur
    const brand = await this.prisma.marque.findUnique({
      where: { id: brandId },
      select: { 
        id: true, 
        userId: true,
        name: true 
      },
    });

    if (!brand) {
      throw new NotFoundException('Boutique non trouvée');
    }

    if (brand.userId !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez accéder qu\'à votre propre boutique'
      );
    }

    // 5. Optionnel : Attacher la marque à la requête pour éviter une requête DB supplémentaire
    request.brand = brand;

    return true;
  }
}