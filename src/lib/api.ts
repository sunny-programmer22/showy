import { supabase } from './supabase';
import {
  Product,
  Shop,
  UserProfile,
  CartItem,
  Order,
  OrderItem,
  PaymentMethod,
  ShippingAddress,
  PayoutRequest
} from '../types';

const requireClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }
  return supabase;
};

const n = (v: unknown): number => Number(v ?? 0);

/* -------------------------------- Auth ---------------------------------- */

export const getSessionUser = async () => {
  const sb = requireClient();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
};

export const onAuthChange = (cb: (userId: string | null) => void) => {
  const sb = requireClient();
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id ?? null);
  });
  return () => data.subscription.unsubscribe();
};

export const authSignIn = async (email: string, password: string) => {
  const sb = requireClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
};

export const authSignUp = async (email: string, password: string, fullName: string) => {
  const sb = requireClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw new Error(error.message);
  return data;
};

export const authSignOut = async () => {
  const sb = requireClient();
  const { error } = await sb.auth.signOut();
  if (error) throw new Error(error.message);
};

/* ------------------------------- Profiles ------------------------------- */

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  const sb = requireClient();
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return (data as UserProfile) ?? null;
};

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  const sb = requireClient();
  const { data, error } = await sb.from('profiles').select('*').order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as UserProfile[];
};

/* -------------------------------- Shops --------------------------------- */

export const fetchShops = async (): Promise<Shop[]> => {
  const sb = requireClient();
  const { data, error } = await sb.from('shops').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((s) => ({
    ...s,
    rating: n(s.rating),
    reviews_count: n(s.reviews_count),
    description: s.description ?? ''
  }));
};

export const apiCreateShop = async (
  shopData: Omit<Shop, 'id' | 'created_at' | 'rating' | 'reviews_count'>
): Promise<Shop> => {
  const sb = requireClient();
  const { data, error } = await sb.from('shops').insert(shopData).select().single();
  if (error) throw new Error(error.message);
  return { ...(data as any), rating: n((data as any).rating), reviews_count: n((data as any).reviews_count) };
};

export const apiUpdateShop = async (id: string, patch: Partial<Shop>) => {
  const sb = requireClient();
  const { error } = await sb.from('shops').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
};

/* ------------------------------- Products ------------------------------- */

export const fetchProducts = async (): Promise<Product[]> => {
  const sb = requireClient();
  const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((p) => ({
    ...p,
    price: n(p.price),
    discount_price: p.discount_price === null ? undefined : n(p.discount_price),
    stock: n(p.stock),
    rating: n(p.rating),
    reviews_count: n(p.reviews_count),
    tags: p.tags ?? [],
    images: p.images ?? [],
    subcategory: p.subcategory ?? '',
    description: p.description ?? ''
  }));
};

export const apiInsertProduct = async (
  productData: Omit<Product, 'id' | 'created_at' | 'rating' | 'reviews_count'>
): Promise<Product> => {
  const sb = requireClient();
  const { data, error } = await sb.from('products').insert(productData).select().single();
  if (error) throw new Error(error.message);
  return {
    ...(data as any),
    price: n((data as any).price),
    discount_price: (data as any).discount_price === null ? undefined : n((data as any).discount_price),
    stock: n((data as any).stock),
    rating: n((data as any).rating),
    reviews_count: n((data as any).reviews_count)
  };
};

export const apiUpdateProduct = async (id: string, patch: Partial<Product>) => {
  const sb = requireClient();
  const { error } = await sb.from('products').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
};

export const apiDeleteProduct = async (id: string) => {
  const sb = requireClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

/* -------------------------------- Orders -------------------------------- */

export const fetchOrders = async (shops: Shop[]): Promise<Order[]> => {
  const sb = requireClient();
  const { data, error } = await sb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  const orderIds = (data ?? []).map((o: any) => o.id);
  let items: any[] = [];
  if (orderIds.length > 0) {
    const res = await sb.from('order_items').select('*').in('order_id', orderIds);
    if (res.error) throw new Error(res.error.message);
    items = res.data ?? [];
  }

  return ((data ?? []) as any[]).map((o) => ({
    ...o,
    total_amount: n(o.total_amount),
    platform_fee_total: n(o.platform_fee_total),
    items: items
      .filter((i) => i.order_id === o.id)
      .map(
        (i): OrderItem => ({
          ...i,
          unit_price: n(i.unit_price),
          quantity: n(i.quantity),
          total_price: n(i.total_price),
          admin_commission_5pct: n(i.admin_commission_5pct),
          vendor_amount_95pct: n(i.vendor_amount_95pct),
          shop_name: shops.find((s) => s.id === i.shop_id)?.name ?? 'Vendor'
        })
      )
  })) as Order[];
};

export const apiPlaceOrder = async (
  customerId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shipping: ShippingAddress,
  cart: CartItem[],
  shops: Shop[],
  paymentMethod: PaymentMethod,
  transactionId?: string
): Promise<Order> => {
  const sb = requireClient();

  let platformFeeTotal = 0;
  const itemRows = cart.map((cartItem) => {
    const itemShop = shops.find((s) => s.id === cartItem.product.shop_id);
    const isAdminShop = itemShop?.is_admin_shop ?? false;
    const unitPrice = cartItem.product.discount_price ?? cartItem.product.price;
    const totalPrice = unitPrice * cartItem.quantity;
    const adminCommission = isAdminShop ? totalPrice : totalPrice * 0.05;
    const vendorAmount = isAdminShop ? 0 : totalPrice * 0.95;
    if (!isAdminShop) platformFeeTotal += adminCommission;

    return {
      shop_id: cartItem.product.shop_id,
      product_id: cartItem.product.id,
      product_title: cartItem.product.title,
      product_image: cartItem.product.images[0] || '',
      unit_price: unitPrice,
      quantity: cartItem.quantity,
      total_price: totalPrice,
      is_admin_shop: isAdminShop,
      admin_commission_5pct: adminCommission,
      vendor_amount_95pct: vendorAmount,
      status: 'processing'
    };
  });

  const { data: orderRow, error: orderErr } = await sb
    .from('orders')
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shipping,
      total_amount: cart.reduce(
        (t, c) => t + (c.product.discount_price ?? c.product.price) * c.quantity,
        0
      ),
      platform_fee_total: platformFeeTotal,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
      transaction_id: transactionId || null,
      overall_status: 'processing'
    })
    .select()
    .single();
  if (orderErr) throw new Error(orderErr.message);

  const { data: insertedItems, error: itemsErr } = await sb
    .from('order_items')
    .insert(itemRows.map((r) => ({ ...r, order_id: (orderRow as any).id })))
    .select();
  if (itemsErr) throw new Error(itemsErr.message);

  return {
    ...(orderRow as any),
    total_amount: n((orderRow as any).total_amount),
    platform_fee_total: n((orderRow as any).platform_fee_total),
    items: (insertedItems ?? []).map(
      (i: any): OrderItem => ({
        ...i,
        unit_price: n(i.unit_price),
        quantity: n(i.quantity),
        total_price: n(i.total_price),
        admin_commission_5pct: n(i.admin_commission_5pct),
        vendor_amount_95pct: n(i.vendor_amount_95pct),
        shop_name: shops.find((s) => s.id === i.shop_id)?.name ?? 'Vendor'
      })
    )
  } as Order;
};

export const apiUpdateItemStatus = async (
  itemId: string,
  status: OrderItem['status'],
  orderId: string
) => {
  const sb = requireClient();
  const { error } = await sb.from('order_items').update({ status }).eq('id', itemId);
  if (error) throw new Error(error.message);
  // Recalculate parent order's overall_status (RPC may not exist yet — ignore errors)
  const rpcErr = (await sb.rpc('sync_order_overall_status', { p_order_id: orderId })).error;
  if (rpcErr) console.warn('sync_order_overall_status RPC missing:', rpcErr.message);
};

/* ------------------------- Wallets & Payouts ---------------------------- */

export const fetchWallets = async () => {
  const sb = requireClient();
  const { data, error } = await sb.from('vendor_wallets').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const fetchPayouts = async (): Promise<PayoutRequest[]> => {
  const sb = requireClient();
  const { data, error } = await sb
    .from('payout_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((r) => ({ ...r, amount: n(r.amount) }));
};

export const apiInsertPayout = async (payload: {
  shop_id: string;
  amount: number;
  payment_method: 'bkash' | 'nagad' | 'bank';
  account_number: string;
}) => {
  const sb = requireClient();
  const { error } = await sb.from('payout_requests').insert(payload);
  if (error) throw new Error(error.message);
};

export const apiUpdatePayoutStatus = async (
  requestId: string,
  status: PayoutRequest['status']
) => {
  const sb = requireClient();
  const { error } = await sb
    .from('payout_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw new Error(error.message);
};

/* ------------------------------ Storage --------------------------------- */

/** Whitelist of accepted upload types → canonical extension.
 *  The stored path uses THIS extension, never the raw filename. */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    throw new Error('Unsupported image type. Please use JPG, PNG, WebP or GIF.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Maximum size is 5 MB.');
  }
  if (file.size === 0) {
    throw new Error('That file appears to be empty.');
  }

  const sb = requireClient();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};
