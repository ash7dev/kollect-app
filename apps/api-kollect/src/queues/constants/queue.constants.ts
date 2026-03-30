export const DROPS_QUEUE = 'drops-queue';
export const NOTIFICATIONS_QUEUE = 'notifications-queue';
export const ORDERS_QUEUE = 'orders-queue';
export const ANALYTICS_QUEUE = 'analytics-queue';
export const DEADLETTER_QUEUE = 'deadletter-queue';

export const DROP_JOB_NAMES = {
  LAUNCH: 'launch-drop',
  SYNC_STATUS: 'sync-drop-status',
  FINISH: 'finish-drop',
} as const;

export const NOTIFICATION_JOB_NAMES = {
  SEND_PUSH: 'send-push-notification',
  SEND_PUSH_BATCH: 'send-push-notification-batch',
  SEND_EMAIL: 'send-email',
} as const;

export const ORDER_JOB_NAMES = {
  PROCESS_ORDER: 'process-order',
} as const;

export const ANALYTICS_JOB_NAMES = {
  TRACK_PRODUCT_VIEW: 'track-product-view',
  TRACK_COLLECTION_VIEW: 'track-collection-view',
  TRACK_INTERACTION: 'track-interaction',
  FLUSH: 'flush-analytics',
} as const;

export const ANALYTICS_REDIS_KEYS = {
  PRODUCT_VIEWS: 'analytics:product-views',
  COLLECTION_VIEWS: 'analytics:collection-views',
  INTERACTIONS: 'analytics:interactions',
} as const;

export const ANALYTICS_FLUSH_JOB_ID = 'analytics:flush';

export const buildLaunchDropJobId = (dropId: string) => `drop-${dropId}-launch`;
export const buildSyncDropJobId = (dropId: string) => `drop-${dropId}-sync-status`;
export const buildFinishDropJobId = (dropId: string) => `drop-${dropId}-finish`;
export const buildProcessOrderJobId = (orderId: string) => `order-${orderId}-process`;
