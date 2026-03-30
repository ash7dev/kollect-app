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

const REDIS_SOCKET_PROTOCOLS = new Set(['redis:', 'rediss:']);

function isRedisSocketUrl(value: string): boolean {
  try {
    return REDIS_SOCKET_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function getRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    if (!isRedisSocketUrl(redisUrl)) {
      throw new Error(
        'REDIS_URL must be a redis:// or rediss:// URL for BullMQ and Redis workers',
      );
    }

    return redisUrl;
  }

  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  if (upstashRestUrl) {
    throw new Error(
      'REDIS_URL is required for BullMQ. UPSTASH_REDIS_REST_URL is an HTTP REST endpoint and cannot be used as a Redis socket connection.',
    );
  }

  throw new Error(
    'REDIS_URL is not defined in environment variables. Set it to a redis:// or rediss:// connection string.',
  );
}

export function buildRedisConnection(redisUrl = getRedisUrl()): RedisConnectionOptions {
  if (!redisUrl) {
    throw new Error(
      'REDIS_URL is not defined in environment variables. Set it to a redis:// or rediss:// connection string.',
    );
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
