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
    isClient: boolean;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
  };
}
