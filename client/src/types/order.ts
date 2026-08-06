// TypeScript types for Orders
export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'ready' | 'completed';
  createdAt: string;
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: number; // PKR
}
