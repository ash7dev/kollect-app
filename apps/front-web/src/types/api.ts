// src/types/api.ts
// Types API partagés — utilisés par les stores et services

export interface BackendUser {
    id: string;
    supabaseId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar?: string;
    phone?: string;
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
    has_seen_creator_prompt: boolean;
    brand: {
        id: string;
        slug: string;
        name: string;
        isVerified: boolean;
    } | null;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export interface AuthResponse {
    user: BackendUser;
    access_token: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
