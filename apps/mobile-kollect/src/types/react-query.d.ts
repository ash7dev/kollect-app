// src/types/react-query.d.ts
import '@tanstack/react-query';

// Étendre les types de React Query pour notre app
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: {
      message: string;
      status?: number;
      code?: string;
    };
  }
}

// Types globaux pour les queries
export interface QueryError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Types pour les meta queries
export interface QueryMeta {
  errorMessage?: string;
  successMessage?: string;
}