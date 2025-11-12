// src/follow/follow.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuiviService } from './suivi.service';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
};

@Controller('api/brands')
export class SuiviController {
  constructor(private readonly suiviService: SuiviService) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followBrand(
    @Param('id') brandId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suiviService.followBrand(req.user.id, brandId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowBrand(
    @Param('id') brandId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suiviService.unfollowBrand(req.user.id, brandId);
  }

  @Get(':id/followers/count')
  async getFollowersCount(@Param('id') brandId: string) {
    const count = await this.suiviService.getBrandFollowersCount(brandId);
    return { count };
  }

  @Get(':id/is-following')
  @UseGuards(JwtAuthGuard)
  async isFollowing(
    @Param('id') brandId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isFollowing = await this.suiviService.isFollowing(
      req.user.id,
      brandId,
    );
    return { isFollowing };
  }
}
