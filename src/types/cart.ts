export interface CartServiceMetadata {
  id: string;
  title: string;
  description: string;
  price?: number;
  discountPrice?: number | null;
  image?: string | null;
  duration?: string | null;
}

export interface CartItemPricing {
  listPrice: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartItem {
  id: string;
  cartId?: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialNotes?: string | null;
  service: CartServiceMetadata;
  pricing: CartItemPricing;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  platformFee: number;
  total: number;
}

export interface CartResponse {
  id: string;
  cartId: string;
  customerId?: string;
  status: 'ACTIVE' | 'CHECKOUT_STARTED' | 'CONVERTED' | 'ABANDONED' | 'EXPIRED';
  currency: string;
  version: number;
  lastActivityAt: string;
  items: CartItem[];
  itemCount: number;
  appliedCoupon?: { code: string; discount: number } | null;
  summary: CartSummary;
}

export interface AddCartItemPayload {
  serviceId: string;
  quantity?: number;
  specialNotes?: string;
}

export interface UpdateCartItemPayload {
  quantity: number;
  expectedVersion?: number;
}

export interface GuestCartItem {
  serviceId: string;
  quantity: number;
  specialNotes?: string;
  serviceData?: CartServiceMetadata;
}

export interface MergeCartPayload {
  items: {
    serviceId: string;
    quantity: number;
    specialNotes?: string;
  }[];
}

export interface CheckoutPayload {
  addressId?: string;
  scheduleMode?: 'NOW' | 'SCHEDULED';
  scheduledDate?: string;
  scheduledTime?: string;
  paymentMethod?: 'CASH' | 'ONLINE' | 'UPI' | 'CARD';
  notes?: string;
  expectedCartVersion?: number;
  idempotencyKey?: string;
}

export interface CheckoutResponse {
  message: string;
  booking: any;
}
