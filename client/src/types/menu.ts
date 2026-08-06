// TypeScript types for Menu resources
export interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number; // PKR
  imageUrl?: string;
  isFeatured: boolean;
  createdAt: string;
}
