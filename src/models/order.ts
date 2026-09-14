export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemProductSummary {
  titleEn: string;
  titleHi: string;
  craftType?: string;
  primaryImageUrl?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  artisanId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: OrderItemProductSummary;
  artisanName?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerId: string;
  totalAmount: number;
  shippingAddress?: string;
  paymentMethod?: string;
  items: {
    productId: string;
    artisanId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
