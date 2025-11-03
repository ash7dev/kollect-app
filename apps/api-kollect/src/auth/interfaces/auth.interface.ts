// Note: Using any to avoid Prisma client dependency in interfaces
// In a real app, you might want to generate types from Prisma schema

export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  kindeId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  avatar?: string | null;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  fcmToken?: string | null;
}
