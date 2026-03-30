import type {
  NotificationPriority,
  NotificationType,
  CollectionStatus,
} from '@prisma/client';

export interface LaunchDropJobPayload {
  dropId: string;
  brandId: string;
}

export interface SyncDropStatusJobPayload {
  dropId: string;
  brandId: string;
  targetStatus?: CollectionStatus;
}

export interface NotificationRecipient {
  userId: string;
  token?: string | null;
  email?: string | null;
}

export interface SendNotificationJobPayload {
  userId: string;
  title: string;
  body: string;
  token?: string | null;
  data?: Record<string, string>;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface SendNotificationBatchJobPayload {
  recipients: NotificationRecipient[];
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface SendEmailJobPayload {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, string>;
}

export interface ProcessOrderJobPayload {
  orderId: string;
  clientId: string;
  brandId: string;
}

export interface TrackViewJobPayload {
  productId: string;
  userId?: string;
}

export interface TrackCollectionViewJobPayload {
  collectionId: string;
  userId?: string;
}

export interface TrackInteractionJobPayload {
  key: string;
  delta?: number;
}
