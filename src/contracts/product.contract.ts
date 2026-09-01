import type { Product } from '@/types/database';

export interface ProductCatalogResponseContract {
  success: boolean;
  data: Product[];
  count: number;
  filter?: {
    categoryId?: string;
    collectionId?: string;
    family?: string;
    status?: string;
  };
}

export interface ProductDetailResponseContract {
  success: boolean;
  data: Product | null;
  error?: string;
}

export interface ProductMutationResponseContract {
  success: boolean;
  data?: Product;
  message: string;
  errors?: Record<string, string[]>;
}

