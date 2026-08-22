export type UserRole = 'customer' | 'vendor' | 'admin';

export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cod';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type ItemStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: UserRole;
  created_at?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  is_admin_shop: boolean;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  bkash_payout_number?: string;
  nagad_payout_number?: string;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  price: number;
  discount_price?: number;
  stock: number;
  images: string[];
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_active: boolean;
  /** Optional seller choice — when explicitly false, no returns accepted. Undefined/true = 7-day return. */
  is_returnable?: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option_name: string;
  option_value: string;
  /** When null/undefined, the product base price applies. */
  price?: number | null;
  stock: number;
  sort_order: number;
}

export type NewProductVariant = Omit<ProductVariant, 'id' | 'product_id'>;

export const variantLabel = (v: ProductVariant): string =>
  v.option_value ? `${v.option_name}: ${v.option_value}` : v.option_name;

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
}

/** Stable identity for a cart line — same product in two sizes = two lines. */
export const cartItemKey = (item: Pick<CartItem, 'product' | 'variant'>): string =>
  item.variant ? `${item.product.id}:${item.variant.id}` : `${item.product.id}:-`;

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  shop_id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  variant_label?: string | null;
  is_admin_shop: boolean;
  admin_commission_5pct: number;
  vendor_amount_95pct: number;
  status: ItemStatus;
  shop_name: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  total_amount: number;
  platform_fee_total: number;
  discount_amount?: number;
  coupon_code?: string | null;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'failed';
  transaction_id: string;
  overall_status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface VendorWallet {
  shop_id: string;
  shop_name: string;
  total_earnings_95pct: number;
  current_balance: number;
  total_withdrawn: number;
  pending_clearance: number;
}

export interface PayoutRequest {
  id: string;
  shop_id: string;
  shop_name: string;
  amount: number;
  payment_method: 'bkash' | 'nagad' | 'bank';
  account_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

export const couponDiscountFor = (coupon: Coupon, orderAmount: number): number => {
  if (!coupon.is_active) return 0;
  if (orderAmount < coupon.min_order_amount) return 0;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 0;
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) return 0;
  const raw = coupon.discount_type === 'percent'
    ? (orderAmount * coupon.discount_value) / 100
    : coupon.discount_value;
  return Math.min(Math.round(raw), orderAmount);
};
