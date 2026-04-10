/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, GetUser } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AdminService } from './admin.service';
import {
  GetUsersDto,
  UpdateUserRoleDto,
  GetOrdersDto,
  GetReviewsDto,
  ReviewModerationDto,
  BrandVerificationDto,
  GetGlobalStatsDto,
} from './dto/admin.dto';

/**
 * 🛡️ Controller Admin Centralisé
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('isAdmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========================================
  // ANALYTICS & STATISTIQUES (TOP DE PILE)
  // ========================================

  /**
   * 🔥 Top Produits Plateforme
   * GET /admin/analytics/top-products
   */
  @Get('analytics/top-products')
  @HttpCode(HttpStatus.OK)
  async getTopProducts(@Query('limit') limit?: string) {
    return await this.adminService.getTopProducts(limit ? parseInt(limit, 10) : 5);
  }

  /**
   * 📊 Tableau de bord admin (Stats globales)
   * GET /admin/stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getGlobalStats(@Query() query: GetGlobalStatsDto) {
    return await this.adminService.getGlobalStats(query);
  }

  /**
   * 📈 Analytics détaillés (Séries temporelles)
   * GET /admin/analytics
   */
  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  async getAnalytics(
    @Query('period') period: '7days' | '30days' | '90days' = '30days',
  ) {
    return await this.adminService.getAnalytics(period);
  }

  // ========================================
  // GESTION DES UTILISATEURS
  // ========================================

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: GetUsersDto) {
    return await this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    return await this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.updateUserRole(id, updateRoleDto, adminId);
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.deactivateUser(id, adminId);
  }

  @Patch('users/:id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateUser(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.reactivateUser(id, adminId);
  }

  // ========================================
  // GESTION DES COMMANDES GLOBALES
  // ========================================

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  async getAllOrders(@Query() query: GetOrdersDto) {
    return await this.adminService.getAllOrders(query);
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id') id: string) {
    return await this.adminService.getOrderById(id);
  }

  @Patch('orders/:id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmOrder(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.confirmOrder(id, body.notes, adminId);
  }

  @Patch('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.cancelOrder(id, body.reason, adminId);
  }

  // ========================================
  // MODÉRATION DES AVIS
  // ========================================

  @Get('reviews')
  @HttpCode(HttpStatus.OK)
  async getReviews(@Query() query: GetReviewsDto) {
    return await this.adminService.getReviews(query);
  }

  @Patch('reviews/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveReview(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.moderateReview(id, 'approved', adminId);
  }

  @Patch('reviews/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectReview(
    @Param('id') id: string,
    @Body() body: ReviewModerationDto,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.moderateReview(id, 'rejected', adminId, body.reason);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.deleteReview(id, adminId);
  }

  // ========================================
  // GESTION DES MARQUES
  // ========================================

  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async getBrands(@Query() query: GetUsersDto) {
    return await this.adminService.getBrands(query);
  }

  @Patch('brands/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyBrand(
    @Param('id') id: string,
    @Body() body: BrandVerificationDto,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.verifyBrand(id, body, adminId);
  }

  @Patch('brands/:id/unverify')
  @HttpCode(HttpStatus.OK)
  async unverifyBrand(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.unverifyBrand(id, body.reason, adminId);
  }

  @Delete('brands/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBrand(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.deleteBrand(id, adminId);
  }

  @Get('brands/:id/performance')
  @HttpCode(HttpStatus.OK)
  async getBrandPerformance(@Param('id') id: string) {
    return await this.adminService.getBrandPerformance(id);
  }

  // ========================================
  // NOTIFICATIONS ADMIN
  // ========================================

  @Post('notifications/global')
  @HttpCode(HttpStatus.CREATED)
  async sendGlobalNotification(
    @Body() body: { title: string; message: string; data?: any; priority?: any },
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.sendGlobalNotification(body, adminId);
  }

  @Post('notifications/by-role')
  @HttpCode(HttpStatus.CREATED)
  async sendNotificationByRole(
    @Body() body: { role: any; title: string; message: string; data?: any },
    @GetUser('id') adminId: string,
  ) {
    return await this.adminService.sendPushNotificationByRole(body, adminId);
  }

  // ========================================
  // UTILITAIRE
  // ========================================

  @Public()
  @Post('create-admin-simple')
  async createAdminSimple(@Body() body: any) {
    return await this.adminService.createAdminSimple(body);
  }

  // ========================================
  // EXPORTS & SYSTEM
  // ========================================

  @Get('export/:type')
  @HttpCode(HttpStatus.OK)
  async exportData(@Param('type') type: any, @Query('format') format: any, @Query() filters: any) {
    return await this.adminService.exportData(type, format, filters);
  }

  @Get('reports/activity')
  @HttpCode(HttpStatus.OK)
  async getActivityReport(@Query('period') period: any) {
    return await this.adminService.getActivityReport(period);
  }

  @Get('system/metrics')
  @HttpCode(HttpStatus.OK)
  async getSystemMetrics() {
    return await this.adminService.getSystemMetrics();
  }

  @Get('system/queues')
  @HttpCode(HttpStatus.OK)
  async getSystemQueues() {
    return await this.adminService.getSystemQueues();
  }

  @Post('system/queues/retry/:id')
  @HttpCode(HttpStatus.OK)
  async retryDeadletterJob(@Param('id') id: string) {
    return await this.adminService.retryDeadletterJob(id);
  }
}
