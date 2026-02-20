/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ShareService } from './share.service';
import { TrackShareDto } from './dto/track-share.dto';
import { GetShareStatsDto } from './dto/get-share-stats.dto';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('track')
  async trackShare(@Request() req: any, @Body() trackShareDto: TrackShareDto) {
    const userId = req.user?.id;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    return this.shareService.trackShare({
      ...trackShareDto,
      userId,
      userAgent,
      ipAddress,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getShareStats(
    @Request() req: any,
    @Query() getShareStatsDto: GetShareStatsDto,
  ) {
    const userId = req.user?.id;

    return this.shareService.getShareStats(userId, getShareStatsDto);
  }

  @Get('trending')
  async getTrendingShared(
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('limit') limit?: number,
  ) {
    return this.shareService.getTrendingShared(type, period, limit);
  }
}
