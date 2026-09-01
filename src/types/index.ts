export * from './database';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number | null;
  size?: string;
  quantity: number;
}

export interface CatalogFilterState {
  search?: string;
  category?: string;
  collection?: string;
  family?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'bestselling';
}

export interface AdminNavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: { title: string; href: string }[];
}
