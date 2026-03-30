/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import client from 'prom-client';
import { Request } from 'express';

export interface RequestLabels {
  method: string;
  route: string;
  status_code: string;
  user_id?: string;
}

@Injectable()
export class MetricsService {
  private readonly register: client.Registry;
  private readonly ordersCreatedCounter: client.Counter<string>;
  private readonly usersRegisteredCounter: client.Counter<string>;
  private readonly brandFollowCounter: client.Counter<string>;
  private readonly productFavoriteCounter: client.Counter<string>;
  private readonly brandOrdersProcessedCounter: client.Counter<string>;
  private readonly httpRequestDuration: client.Histogram<string>;
  private readonly httpRequestTotal: client.Counter<string>;
  private readonly dbQueryDuration: client.Histogram<string>;
  private readonly cacheHitRate: client.Gauge<string>;

  constructor() {
    this.register = new client.Registry();

    client.collectDefaultMetrics({
      register: this.register,
    });

    // Métriques HTTP
    this.httpRequestDuration = new client.Histogram({
      name: 'kollect_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      registers: [this.register],
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'kollect_http_requests_total',
      help: 'Total number of HTTP requests',
      registers: [this.register],
      labelNames: ['method', 'route', 'status_code'],
    });

    // Métriques base de données
    this.dbQueryDuration = new client.Histogram({
      name: 'kollect_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      registers: [this.register],
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    });

    // Métriques cache
    this.cacheHitRate = new client.Gauge({
      name: 'kollect_cache_hit_rate',
      help: 'Cache hit rate percentage',
      registers: [this.register],
      labelNames: ['cache_type'],
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

    this.brandOrdersProcessedCounter = new client.Counter({
      name: 'kollect_brand_orders_processed_total',
      help: 'Nombre total de traitements post-commande par marque',
      registers: [this.register],
      labelNames: ['brandId'],
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

  incrementBrandOrderProcessed(brandId: string): void {
    this.brandOrdersProcessedCounter.inc({ brandId });
  }

  // Méthodes HTTP
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const labels = { method, route, status_code: statusCode.toString() };
    this.httpRequestDuration.observe(labels, duration / 1000); // Convert ms to seconds
    this.httpRequestTotal.inc(labels);
  }

  // Métriques base de données
  recordDbQuery(operation: string, table: string, duration: number): void {
    this.dbQueryDuration.observe({ operation, table }, duration / 1000);
  }

  // Métriques cache
  setCacheHitRate(cacheType: string, hitRate: number): void {
    this.cacheHitRate.set({ cache_type: cacheType }, hitRate);
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}
