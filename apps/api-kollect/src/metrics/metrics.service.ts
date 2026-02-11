import { Injectable } from '@nestjs/common';
import client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: client.Registry;
  private readonly ordersCreatedCounter: client.Counter<string>;
  private readonly usersRegisteredCounter: client.Counter<string>;
  private readonly brandFollowCounter: client.Counter<string>;
  private readonly productFavoriteCounter: client.Counter<string>;

  constructor() {
    this.register = new client.Registry();

    client.collectDefaultMetrics({
      register: this.register,
    });

    this.ordersCreatedCounter = new client.Counter({
      name: 'kollect_orders_created_total',
      help: 'Nombre total de commandes creees dans Kollect',
      registers: [this.register],
      labelNames: ['status'],
    });

    this.usersRegisteredCounter = new client.Counter({
      name: 'kollect_users_registered_total',
      help: 'Nombre total d utilisateurs inscrits dans Kollect',
      registers: [this.register],
    });

    this.brandFollowCounter = new client.Counter({
      name: 'kollect_brand_follow_events_total',
      help: 'Nombre total devènements de follow/unfollow de marques par marque',
      registers: [this.register],
      labelNames: ['action', 'brandId'],
    });

    this.productFavoriteCounter = new client.Counter({
      name: 'kollect_product_favorite_events_total',
      help: 'Nombre total devènements de favoris produits (follow/unfollow)',
      registers: [this.register],
      labelNames: ['action'],
    });
  }

  incrementOrdersCreated(status: string = 'EN_ATTENTE'): void {
    this.ordersCreatedCounter.inc({ status });
  }

  incrementUserRegistered(): void {
    this.usersRegisteredCounter.inc();
  }

  incrementBrandFollow(action: 'follow' | 'unfollow', brandId: string): void {
    this.brandFollowCounter.inc({ action, brandId });
  }

  incrementProductFavorite(action: 'follow' | 'unfollow'): void {
    this.productFavoriteCounter.inc({ action });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}
