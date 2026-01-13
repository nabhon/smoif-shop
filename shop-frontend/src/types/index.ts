export interface ProductVariant {
  id: number;
  productId: number;
  price: number;
  stockQuantity: number;
  combinationJson: Record<string, string>;
}

export interface ProductVariantResponse {
  id: number;
  productId: number;
  price: string;
  stockQuantity: number;
  combinationJson: string; // JSON string
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  imageUrl?: string;
  variants?: ProductVariant[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  basePrice: string;
  isActive: boolean;
  imageUrl?: string;
  updatedAt: string;
  createdAt: string;
  variants?: ProductVariantResponse[];
}

export interface PaymentConfig {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  isActive: boolean;
}

export interface Order {
  id: number;
  guestName: string;
  guestEmail: string;
  totalAmount: number;
  status: "WAITING_FOR_PAYMENT" | "VERIFYING_SLIP" | "PAID" | "CANCELLED";
  slipImageUrl?: string;
  createdAt: string;
  // items...
}
