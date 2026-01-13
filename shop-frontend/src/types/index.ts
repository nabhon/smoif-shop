export interface ProductVariant {
  id: number;
  product_id: number;
  price: number;
  stock_quantity: number;
  combination_json: Record<string, string>;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  image_url?: string;
  variants?: ProductVariant[];
}

export interface PaymentConfig {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_image_url: string;
  is_active: boolean;
}

export interface Order {
  id: number;
  guest_name: string;
  guest_email: string;
  total_amount: number;
  status: "WAITING_FOR_PAYMENT" | "VERIFYING_SLIP" | "PAID" | "CANCELLED";
  slip_image_url?: string;
  created_at: string;
  // items...
}
