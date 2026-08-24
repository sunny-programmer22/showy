import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Shop, UserProfile, CartItem, Order, PayoutRequest, VendorWallet, OrderItem, PaymentMethod, ProductVariant, NewProductVariant, cartItemKey } from '../types';
import { INITIAL_USERS, INITIAL_SHOPS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import { toast } from '../components/ui/Toast';

interface StoreContextType {
  // Loading / mode
  isLoading: boolean;
  isLiveMode: boolean;

  // Auth & Roles
  users: UserProfile[];
  currentUser: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<'ok' | 'confirm-email'>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Products
  products: Product[];
  variants: ProductVariant[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'rating' | 'reviews_count'>, variants?: NewProductVariant[]) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setProductVariants: (productId: string, variants: NewProductVariant[]) => Promise<void>;

  // Shops
  shops: Shop[];
  createShop: (shopData: Omit<Shop, 'id' | 'created_at' | 'rating' | 'reviews_count'>) => Promise<Shop>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<void>;
  toggleShopActive: (id: string) => Promise<void>;

  // Cart (always local)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  /** Takes a cart line key (`productId` or `productId:variantId`). */
  removeFromCart: (lineKey: string) => void;
  updateCartQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  placeOrder: (shipping: any, paymentMethod: PaymentMethod, transactionId?: string, discount?: { amount: number; code: string }) => Promise<Order>;
  verifyOrderPayment: (orderId: string, paid: boolean) => Promise<void>;
  toggleShopVerified: (shopId: string) => Promise<void>;
  fetchAdminTransactions: () => Promise<any[]>;
  updateOrderStatus: (orderId: string, itemId: string, status: OrderItem['status']) => Promise<void>;

  // Financials & Commission (5% split engine)
  vendorWallets: VendorWallet[];
  payoutRequests: PayoutRequest[];
  requestPayout: (shopId: string, shopName: string, amount: number, method: 'bkash' | 'nagad' | 'bank', accountNum: string) => Promise<void>;
  approvePayout: (requestId: string) => Promise<void>;
  rejectPayout: (requestId: string) => Promise<void>;
  platformAdminEarnings: number;

  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedShopId: string;
  setSelectedShopId: (shopId: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  sortBy: string;
  setSortBy: (v: string) => void;

  // Wishlist & Recently Viewed
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (id: string) => boolean;
  wishlistCount: number;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  loyaltyPoints: number;
  referralCode: string;
  cancelOrder: (orderId: string) => Promise<void>;
  requestReturn: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SHOPS: 'shoptastic_shops',
  PRODUCTS: 'shoptastic_products',
  ORDERS: 'shoptastic_orders',
  PAYOUTS: 'shoptastic_payouts',
  CART: 'shoptastic_cart',
};

const readLS = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const LIVE = isSupabaseConfigured() && supabase !== null;

  /* ------------------------------ STATE ------------------------------ */
  const [isLoading, setIsLoading] = useState(LIVE);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [shops, setShops] = useState<Shop[]>(() =>
    LIVE ? [] : readLS(STORAGE_KEYS.SHOPS, INITIAL_SHOPS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    LIVE ? [] : readLS(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [orders, setOrders] = useState<Order[]>(() =>
    LIVE ? [] : readLS(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() =>
    LIVE ? [] : readLS(STORAGE_KEYS.PAYOUTS, [
      {
        id: 'payout_101',
        shop_id: 'shop_gadget_hub',
        shop_name: 'GadgetHub Bangladesh',
        amount: 3000,
        payment_method: 'bkash',
        account_number: '01811112222',
        status: 'pending',
        notes: 'Monthly sales payout',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ])
  );

  const [cart, setCart] = useState<CartItem[]>(() => readLS(STORAGE_KEYS.CART, []));

  // Filters
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(() => new URLSearchParams(window.location.search).get('cat') ?? 'all');
  const [selectedShopId, setSelectedShopId] = useState(() => new URLSearchParams(window.location.search).get('shop') ?? 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const m = new URLSearchParams(window.location.search).get('max');
    return [0, m ? Number(m) : 50000];
  });
  const [inStockOnly, setInStockOnly] = useState(() => new URLSearchParams(window.location.search).get('stock') === '1');
  const [minRating, setMinRating] = useState(() => Number(new URLSearchParams(window.location.search).get('rating') ?? 0));
  const [sortBy, setSortBy] = useState(() => new URLSearchParams(window.location.search).get('sort') ?? 'popular');

  const [wishlist, setWishlist] = useState<string[]>(() => readLS('showy_wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => readLS('showy_recent', []));
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => readLS('showy_points', 0));
  const [referralCode] = useState<string>(() => {
    const saved = localStorage.getItem('showy_referral_code');
    if (saved) return saved;
    const code = `SHOWY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    localStorage.setItem('showy_referral_code', code);
    return code;
  });

  /* ------------------------- PERSISTENCE (demo) ---------------------- */
  useEffect(() => { if (!LIVE) localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops)); }, [shops, LIVE]);
  useEffect(() => { if (!LIVE) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products, LIVE]);
  useEffect(() => { if (!LIVE) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders, LIVE]);
  useEffect(() => { if (!LIVE) localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payoutRequests)); }, [payoutRequests, LIVE]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('showy_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('showy_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('showy_points', JSON.stringify(loyaltyPoints)); }, [loyaltyPoints]);

  /* --------------------------- DATA LOADERS -------------------------- */

  const loadPublicData = useCallback(async () => {
    if (!LIVE) return;
    try {
      const [s, p, v] = await Promise.all([api.fetchShops(), api.fetchProducts(), api.fetchVariants()]);
      setShops(s);
      setProducts(p);
      setVariants(v);
    } catch (e: any) {
      console.error('Failed to load public data:', e.message);
    }
  }, [LIVE]);

  const loadUserData = useCallback(async (userId: string | null) => {
    if (!LIVE || !userId) {
      setCurrentUser(null);
      setOrders([]);
      setPayoutRequests([]);
      return;
    }
    setIsLoading(true);
    try {
      const profile = await api.fetchProfile(userId);
      setCurrentUser(profile);
      const [o, pay] = await Promise.all([api.fetchOrders(shops), api.fetchPayouts()]);
      setOrders(o);
      setPayoutRequests(
        (pay as any[]).map((r) => ({
          ...r,
          shop_name: shops.find((s) => s.id === r.shop_id)?.name ?? 'Vendor',
          amount: Number(r.amount)
        }))
      );
      if (supabase) {
        try {
          const { data: wl } = await supabase.from('wishlist').select('product_id').eq('user_id', userId);
          if (wl && wl.length) setWishlist((wl as any[]).map((r: any) => r.product_id));
        } catch {}
      }
      if (profile?.role === 'admin') {
        setUsers(await api.fetchProfiles());
      }
    } catch (e: any) {
      console.error('Failed to load user data:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [LIVE, shops]);

  // Initial load + auth listener
  useEffect(() => {
    if (!LIVE) return;
    loadPublicData().then(async () => {
      const user = await api.getSessionUser();
      await loadUserData(user?.id ?? null);
      setIsLoading(false);
    });
    const unsub = api.onAuthChange((userId) => {
      loadUserData(userId);
    });
    return unsub;
  }, [LIVE]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------- AUTH ------------------------------ */

  const signIn = async (email: string, password: string) => {
    await api.authSignIn(email, password); // onAuthChange handles the rest
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<'ok' | 'confirm-email'> => {
    const data = await api.authSignUp(email, password, fullName);
    if (!data.session) return 'confirm-email'; // user must confirm via inbox
    return 'ok';
  };

  const logout = async () => {
    if (LIVE) await api.authSignOut();
    setCurrentUser(null);
    setOrders([]);
    setPayoutRequests([]);
  };

  /* ----------------------------- PRODUCTS ---------------------------- */

  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'rating' | 'reviews_count'>,
    newVariants?: NewProductVariant[]
  ): Promise<Product> => {
    if (LIVE) {
      const created = await api.apiInsertProduct(productData);
      setProducts((prev) => [created, ...prev]);
      if (newVariants && newVariants.length > 0) {
        const saved = await api.apiReplaceVariants(created.id, newVariants);
        setVariants((prev) => [...prev, ...saved]);
      }
      return created;
    }
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 0
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (newVariants && newVariants.length > 0) {
      setVariants((prev) => [
        ...prev,
        ...newVariants.map((v, i) => ({
          ...v,
          sort_order: v.sort_order ?? i,
          product_id: newProduct.id,
          id: `var_${Date.now()}_${i}`
        }))
      ]);
    }
    return newProduct;
  };

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (LIVE) await api.apiUpdateProduct(id, patch);
  };

  /** Replaces a product's whole variant set (seller editor save). */
  const setProductVariants = async (productId: string, next: NewProductVariant[]) => {
    if (LIVE) {
      const saved = await api.apiReplaceVariants(productId, next);
      setVariants((prev) => [...prev.filter((v) => v.product_id !== productId), ...saved]);
      return;
    }
    setVariants((prev) => [
      ...prev.filter((v) => v.product_id !== productId),
      ...next.map((v, i) => ({
        ...v,
        sort_order: v.sort_order ?? i,
        product_id: productId,
        id: `var_${Date.now()}_${i}`
      }))
    ]);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setVariants((prev) => prev.filter((v) => v.product_id !== id));
    if (LIVE) await api.apiDeleteProduct(id);
  };

  /* ------------------------------ SHOPS ------------------------------ */

  const createShop = async (
    shopData: Omit<Shop, 'id' | 'created_at' | 'rating' | 'reviews_count'>
  ): Promise<Shop> => {
    if (LIVE) {
      const created = await api.apiCreateShop(shopData);
      setShops((prev) => [created, ...prev]);
      if (currentUser && currentUser.role === 'customer') {
        setCurrentUser({ ...currentUser, role: 'vendor' });
      }
      return created;
    }
    const newShop: Shop = {
      ...shopData,
      id: `shop_${Date.now()}`,
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 0,
      is_active: true,
      is_verified: true
    };
    setShops((prev) => [newShop, ...prev]);
    if (currentUser && currentUser.role === 'customer') {
      setCurrentUser({ ...currentUser, role: 'vendor' });
    }
    return newShop;
  };

  const updateShop = async (id: string, patch: Partial<Shop>) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    if (LIVE) await api.apiUpdateShop(id, patch);
  };

  const toggleShopActive = async (id: string) => {
    const target = shops.find((s) => s.id === id);
    if (!target) return;
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)));
    if (LIVE) await api.apiUpdateShop(id, { is_active: !target.is_active });
  };

  /* ------------------------------- CART ------------------------------ */

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant | null) => {
    setCart((prev) => {
      const key = cartItemKey({ product, variant });
      const existing = prev.find((item) => cartItemKey(item) === key);
      if (existing) {
        return prev.map((item) =>
          cartItemKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, variant: variant ?? null }];
    });
  };

  const removeFromCart = (lineKey: string) =>
    setCart((prev) => prev.filter((item) => cartItemKey(item) !== lineKey));

  const updateCartQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(lineKey);
    setCart((prev) =>
      prev.map((item) => (cartItemKey(item) === lineKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const lineUnitPrice = (item: CartItem): number =>
    item.variant?.price ?? item.product.discount_price ?? item.product.price;

  const cartTotal = cart.reduce((total, item) => total + lineUnitPrice(item) * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  /* --------------------------- WISHLIST & RECENT --------------------------- */
  const wishlistCount = wishlist.length;
  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback(async (productId: string) => {
    const is = wishlist.includes(productId);
    setWishlist((prev) => (is ? prev.filter((x) => x !== productId) : [...prev, productId]));
    if (LIVE && currentUser && supabase) {
      try {
        if (is) await supabase.from('wishlist').delete().eq('user_id', currentUser.id).eq('product_id', productId);
        else await (supabase.from('wishlist').insert as any)({ user_id: currentUser.id, product_id: productId });
      } catch {}
    }
  }, [wishlist, LIVE, currentUser]);
  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((x) => x !== productId)].slice(0, 10));
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, overall_status: 'cancelled' as any, items: o.items.map((i) => ({ ...i, status: 'pending' as any })) } : o));
    if (LIVE && supabase) await (supabase.from('orders').update as any)({ overall_status: 'cancelled' }).eq('id', orderId);
  }, [LIVE]);

  const requestReturn = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, overall_status: 'return_requested' as any } : o));
    if (LIVE && supabase) await (supabase.from('orders').update as any)({ overall_status: 'return_requested' }).eq('id', orderId);
    toast.success('Return requested — admin will contact you within 24h.');
  }, [LIVE]);

  /* ------------------------------ ORDERS ----------------------------- */

  const placeOrder = async (
    shipping: any,
    paymentMethod: PaymentMethod,
    transactionId?: string,
    discount?: { amount: number; code: string }
  ): Promise<Order> => {
    if (!currentUser) throw new Error('Please sign in to place an order.');

    if (LIVE) {
      const order = await api.apiPlaceOrder(
        currentUser.id,
        shipping.fullName,
        shipping.email,
        shipping.phone,
        shipping,
        cart,
        shops,
        paymentMethod,
        transactionId,
        discount
      );
      setOrders((prev) => [order, ...prev]);

      // Deduct stock locally for instant UI feedback
      cart.forEach((line) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === line.product.id ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p
          )
        );
        if (line.variant) {
          setVariants((prev) =>
            prev.map((v) =>
              v.id === line.variant!.id ? { ...v, stock: Math.max(0, v.stock - line.quantity) } : v
            )
          );
        }
      });

      clearCart();
      const pts = Math.floor(order.total_amount * 0.01);
      if (pts > 0) {
        setLoyaltyPoints((p) => p + pts);
        if (supabase && currentUser) (supabase.from('profiles').update as any)({ loyalty_points: loyaltyPoints + pts }).eq('id', currentUser.id).then(() => {});
      }
      try { (supabase as any)?.functions?.invoke('send-order-email', { body: { to: order.customer_email, order_number: order.order_number, total: order.total_amount, items: order.items } }); } catch {}

      // Refresh wallets so vendor dashboards show the credit instantly
      if (paymentMethod !== 'cod') {
        api.fetchWallets().catch(() => {});
      }
      return order;
    }

    /* -------- DEMO MODE (original local logic) -------- */
    let platformFeeTotal = 0;
    const orderItems: OrderItem[] = cart.map((cartItem, idx) => {
      const itemShop = shops.find((s) => s.id === cartItem.product.shop_id);
      const isAdminShop = itemShop?.is_admin_shop ?? false;
      const unitPrice = cartItem.variant?.price ?? cartItem.product.discount_price ?? cartItem.product.price;
      const totalPrice = unitPrice * cartItem.quantity;
      const adminCommission = isAdminShop ? totalPrice : totalPrice * 0.05;
      const vendorAmount = isAdminShop ? 0 : totalPrice * 0.95;
      if (!isAdminShop) platformFeeTotal += adminCommission;

      return {
        id: `item_${Date.now()}_${idx}`,
        order_id: '',
        shop_id: cartItem.product.shop_id,
        product_id: cartItem.product.id,
        product_title: cartItem.product.title,
        product_image: cartItem.product.images[0] || '',
        unit_price: unitPrice,
        quantity: cartItem.quantity,
        total_price: totalPrice,
        variant_label: cartItem.variant
          ? `${cartItem.variant.option_name}: ${cartItem.variant.option_value}`
          : null,
        is_admin_shop: isAdminShop,
        admin_commission_5pct: adminCommission,
        vendor_amount_95pct: vendorAmount,
        status: 'processing',
        shop_name: itemShop?.name || 'Unknown Vendor'
      };
    });

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_number: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: currentUser.id,
      customer_name: shipping.fullName,
      customer_email: shipping.email,
      customer_phone: shipping.phone,
      shipping_address: shipping,
      total_amount: Math.max(0, cartTotal - (discount?.amount ?? 0)),
      platform_fee_total: platformFeeTotal,
      discount_amount: discount?.amount ?? 0,
      coupon_code: discount?.code.toUpperCase() ?? null,
      payment_method: paymentMethod,
      payment_status: 'pending',
      transaction_id: transactionId || `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      overall_status: 'processing',
      created_at: new Date().toISOString(),
      items: orderItems.map((i) => ({ ...i, order_id: `ord_${Date.now()}` }))
    };

    cart.forEach((line) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === line.product.id ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p
        )
      );
      if (line.variant) {
        setVariants((prev) =>
          prev.map((v) =>
            v.id === line.variant!.id ? { ...v, stock: Math.max(0, v.stock - line.quantity) } : v
          )
        );
      }
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    const _pts = Math.floor(newOrder.total_amount * 0.01);
    if (_pts > 0) setLoyaltyPoints((p) => p + _pts);
    try { (supabase as any)?.functions?.invoke('send-order-email', { body: { to: newOrder.customer_email, order_number: newOrder.order_number, total: newOrder.total_amount, items: newOrder.items } }); } catch {}
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, itemId: string, status: OrderItem['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) =>
        ord.id !== orderId
          ? ord
          : {
              ...ord,
              items: ord.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
              overall_status: status
            }
      )
    );
    if (LIVE) await api.apiUpdateItemStatus(itemId, status, orderId);
  };

  /** Admin confirms/rejects a manual bKash/Nagad payment. */
  const verifyOrderPayment = async (orderId: string, paid: boolean) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: paid ? 'paid' : 'pending' } : o
      )
    );
    if (!LIVE) return;
    await api.apiUpdateOrderPaymentStatus(orderId, paid ? 'paid' : 'pending');
    if (paid) {
      const { error } = await supabase!
        .from('order_items')
        .update({ status: 'processing' })
        .eq('order_id', orderId)
        .eq('status', 'pending');
      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) => (i.status === 'pending' ? { ...i, status: 'processing' as const } : i)),
                  overall_status: o.overall_status === 'shipped' || o.overall_status === 'delivered' ? o.overall_status : 'processing'
                }
              : o
          )
        );
      }
    }
  };

  const toggleShopVerified = async (shopId: string) => {
    const current = shops.find((s) => s.id === shopId)?.is_verified ?? false;
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, is_verified: !current } : s)));
    if (!LIVE) return;
    const { error } = await supabase!.from('shops').update({ is_verified: !current }).eq('id', shopId);
    if (error) throw error;
  };

  const fetchAdminTransactions = async () => {
    const { data, error } = await supabase!
      .from('v_shop_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  };

  /* -------------------- FINANCIALS (wallets & admin) ------------------ */

  const [dbWallets, setDbWallets] = useState<any[]>([]);
  useEffect(() => {
    if (LIVE && currentUser) {
      api.fetchWallets().then(setDbWallets).catch(() => {});
    } else {
      setDbWallets([]);
    }
  }, [LIVE, currentUser, orders]);

  const vendorWallets: VendorWallet[] = shops
    .filter((s) => !s.is_admin_shop)
    .map((shop) => {
      const pendingWithdrawals = payoutRequests
        .filter((pr) => pr.shop_id === shop.id && pr.status === 'pending')
        .reduce((sum, pr) => sum + Number(pr.amount), 0);

      if (LIVE) {
        const w = dbWallets.find((x) => x.shop_id === shop.id);
        return {
          shop_id: shop.id,
          shop_name: shop.name,
          total_earnings_95pct: Number(w?.total_earnings_95pct ?? 0),
          current_balance: Number(w?.current_balance ?? 0),
          total_withdrawn: Number(w?.total_withdrawn ?? 0),
          pending_clearance: pendingWithdrawals
        };
      }

      // Demo-mode computation from local orders
      let totalEarnings95 = 0;
      orders.forEach((ord) => {
        if (ord.payment_status === 'paid') {
          ord.items.forEach((item) => {
            if (item.shop_id === shop.id) totalEarnings95 += item.vendor_amount_95pct;
          });
        }
      });
      const totalWithdrawn = payoutRequests
        .filter((pr) => pr.shop_id === shop.id && (pr.status === 'approved' || pr.status === 'transferred'))
        .reduce((sum, pr) => sum + Number(pr.amount), 0);

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        total_earnings_95pct: totalEarnings95,
        current_balance: Math.max(0, totalEarnings95 - totalWithdrawn - pendingWithdrawals),
        total_withdrawn: totalWithdrawn,
        pending_clearance: pendingWithdrawals
      };
    });

  const platformAdminEarnings = orders
    .filter((ord) => ord.payment_status === 'paid')
    .reduce((sum, ord) => {
      let rev = 0;
      ord.items.forEach((item) => {
        rev += item.is_admin_shop ? item.total_price : item.admin_commission_5pct;
      });
      return sum + rev;
    }, 0);

  /* ------------------------------ PAYOUTS ----------------------------- */

  const requestPayout = async (
    shopId: string,
    _shopName: string,
    amount: number,
    method: 'bkash' | 'nagad' | 'bank',
    accountNum: string
  ) => {
    if (LIVE) {
      await api.apiInsertPayout({ shop_id: shopId, amount, payment_method: method, account_number: accountNum });
      const refreshed = await api.fetchPayouts();
      setPayoutRequests(
        (refreshed as any[]).map((r) => ({
          ...r,
          shop_name: shops.find((s) => s.id === r.shop_id)?.name ?? 'Vendor',
          amount: Number(r.amount)
        }))
      );
      return;
    }
    setPayoutRequests((prev) => [
      {
        id: `payout_${Date.now()}`,
        shop_id: shopId,
        shop_name: _shopName,
        amount,
        payment_method: method,
        account_number: accountNum,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const approvePayout = async (requestId: string) => {
    setPayoutRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'transferred', updated_at: new Date().toISOString() }
          : req
      )
    );
    if (LIVE) {
      await api.apiUpdatePayoutStatus(requestId, 'transferred'); // trigger deducts wallet
      setDbWallets(await api.fetchWallets());
    }
  };

  const rejectPayout = async (requestId: string) => {
    setPayoutRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'rejected', updated_at: new Date().toISOString() }
          : req
      )
    );
    if (LIVE) {
      await api.apiUpdatePayoutStatus(requestId, 'rejected');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        isLiveMode: LIVE,

        users,
        currentUser,
        signIn,
        signUp,
        logout,
        authModalOpen,
        setAuthModalOpen,

        products,
        variants,
        addProduct,
        updateProduct,
        deleteProduct,
        setProductVariants,

        shops,
        createShop,
        updateShop,
        toggleShopActive,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,

        orders,
        placeOrder,
        updateOrderStatus,
        verifyOrderPayment,
        toggleShopVerified,
        fetchAdminTransactions,

        vendorWallets,
        payoutRequests,
        requestPayout,
        approvePayout,
        rejectPayout,
        platformAdminEarnings,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedShopId,
        setSelectedShopId,
        priceRange,
        setPriceRange,
        inStockOnly,
        setInStockOnly,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
        recentlyViewed,
        addRecentlyViewed,
        loyaltyPoints,
        referralCode,
        cancelOrder,
        requestReturn
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
