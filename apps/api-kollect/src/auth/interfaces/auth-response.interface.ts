export interface AuthResponseWithToken {
  access_token: string;
  user: {
    id: string;
    kindeId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string;
    avatar?: string;
    isAdmin: boolean;
    isCEO: boolean;
    has_seen_creator_prompt: boolean;
    brand: {
      id: string;
      slug: string;
      name: string;
      isVerified: boolean;
    } | null;
    isClient: boolean;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    fcmToken?: string;
  };
}
