export interface RedisConnectionOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db?: number;
  tls?: Record<string, never>;
  maxRetriesPerRequest: null;
  enableReadyCheck: boolean;
}

export function buildRedisConnection(redisUrl?: string): RedisConnectionOptions {
  if (!redisUrl) {
    throw new Error('REDIS_URL is not defined in environment variables');
  }

  const parsed = new URL(redisUrl);
  const dbFromPath = parsed.pathname.replace('/', '');
  const db = dbFromPath ? Number(dbFromPath) : 0;

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db: Number.isNaN(db) ? 0 : db,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
