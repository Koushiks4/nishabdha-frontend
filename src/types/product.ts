export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'ARTWORK' | 'MERCHANDISE' | 'CREATOR_KIT';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  basePrice: string;
  compareAtPrice: string | null;
  category: string | null;
  tags: string[];
  orientation: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}
