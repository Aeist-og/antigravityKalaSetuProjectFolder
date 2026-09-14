export interface CartItemProductSummary {
  id?: string;
  titleEn: string;
  titleHi: string;
  craftType?: string;
  primaryImageUrl?: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: CartItemProductSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}
