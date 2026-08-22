import { Product, Shop, UserProfile, Order } from '../types';

/* ------------------------------ Categories ------------------------------ */

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: string[];
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    subcategories: ['Mobile Phones', 'Audio', 'Computers', 'Cameras', 'Accessories']
  },
  {
    id: 'cat_fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
    subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Bags & Accessories']
  },
  {
    id: 'cat_home',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Home',
    subcategories: ['Furniture', 'Kitchen', 'Decor', 'Lighting', 'Bedding']
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Care',
    slug: 'beauty',
    icon: 'Sparkles',
    subcategories: ['Skincare', 'Hair Care', 'Fragrance', 'Personal Care']
  },
  {
    id: 'cat_sports',
    name: 'Sports & Fitness',
    slug: 'sports',
    icon: 'Dumbbell',
    subcategories: ['Gym Equipment', 'Outdoor', 'Team Sports', 'Activewear']
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    slug: 'groceries',
    icon: 'ShoppingBag',
    subcategories: ['Staples', 'Snacks', 'Beverages', 'Organic']
  }
];

/* -------------------------------- Users --------------------------------- */

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin',
    email: 'admin@shoptastic.bd',
    full_name: 'Platform Admin',
    phone: '01700000000',
    avatar_url: '',
    role: 'admin',
    created_at: '2026-01-05T10:00:00.000Z'
  },
  {
    id: 'user_vendor',
    email: 'gadgethub@demo.bd',
    full_name: 'Rakib Hasan',
    phone: '01811112222',
    avatar_url: '',
    role: 'vendor',
    created_at: '2026-01-08T10:00:00.000Z'
  },
  {
    id: 'user_customer',
    email: 'customer@demo.bd',
    full_name: 'Tanvir Ahmed',
    phone: '01922223333',
    avatar_url: '',
    role: 'customer',
    created_at: '2026-01-12T10:00:00.000Z'
  }
];

/* -------------------------------- Shops --------------------------------- */

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop_flagship',
    owner_id: 'user_admin',
    name: 'Shoptastic Flagship',
    slug: 'shoptastic-flagship',
    description:
      'The official Shoptastic.bd flagship store — curated electronics, gadgets and lifestyle essentials with warranty and nationwide delivery.',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    is_admin_shop: true,
    is_verified: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 1240,
    bkash_payout_number: '01700000000',
    nagad_payout_number: '01700000000',
    created_at: '2026-01-06T09:00:00.000Z'
  },
  {
    id: 'shop_gadget_hub',
    owner_id: 'user_vendor',
    name: 'GadgetHub Bangladesh',
    slug: 'gadgethub-bangladesh',
    description:
      'Your friendly neighbourhood gadget shop. Authentic audio, wearables and accessories at honest prices — 7-day replacement guarantee.',
    logo_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300',
    banner_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
    is_admin_shop: false,
    is_verified: true,
    is_active: true,
    rating: 4.7,
    reviews_count: 356,
    bkash_payout_number: '01811112222',
    nagad_payout_number: '01811112222',
    created_at: '2026-01-10T09:00:00.000Z'
  }
];

/* ------------------------------- Products ------------------------------- */

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    shop_id: 'shop_flagship',
    title: 'Wireless Noise-Cancelling Headphones Pro',
    slug: 'wireless-noise-cancelling-headphones-pro',
    description:
      'Immersive sound with hybrid active noise cancellation, 40-hour battery life, plush memory-foam earcups and Bluetooth 5.3 multipoint pairing. Includes carry case and USB-C fast charge.',
    category: 'electronics',
    subcategory: 'Audio',
    tags: ['headphones', 'bluetooth', 'anc'],
    price: 8500,
    discount_price: 6990,
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
    ],
    rating: 4.8,
    reviews_count: 214,
    is_featured: true,
    is_active: true,
    created_at: daysAgo(2)
  },
  {
    id: 'prod_2',
    shop_id: 'shop_flagship',
    title: 'Smart Fitness Watch Ultra',
    slug: 'smart-fitness-watch-ultra',
    description:
      '1.9" AMOLED display, SpO2 + heart-rate monitoring, 100+ sport modes, IP68 water resistance and 14-day battery. Works with both Android and iOS.',
    category: 'electronics',
    subcategory: 'Accessories',
    tags: ['smartwatch', 'fitness', 'wearable'],
    price: 5500,
    discount_price: 4250,
    stock: 4,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    rating: 4.6,
    reviews_count: 189,
    is_featured: true,
    is_active: true,
    created_at: daysAgo(4)
  },
  {
    id: 'prod_3',
    shop_id: 'shop_flagship',
    title: '4K Action Camera Adventure Edition',
    slug: '4k-action-camera-adventure-edition',
    description:
      'Capture every thrill in 4K60 with electronic image stabilization, 40m waterproof case, dual batteries and a full mounting kit for bikes and helmets.',
    category: 'electronics',
    subcategory: 'Cameras',
    tags: ['camera', '4k', 'action'],
    price: 12500,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'],
    rating: 4.5,
    reviews_count: 97,
    is_featured: false,
    is_active: true,
    created_at: daysAgo(6)
  },
  {
    id: 'prod_4',
    shop_id: 'shop_flagship',
    title: 'Minimalist LED Desk Lamp',
    slug: 'minimalist-led-desk-lamp',
    description:
      'Eye-caring flicker-free LED lamp with 3 colour modes, stepless dimming, USB charging port and a sleek aluminium arm — perfect for study and work desks.',
    category: 'home-living',
    subcategory: 'Lighting',
    tags: ['lamp', 'led', 'desk'],
    price: 2200,
    discount_price: 1750,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'],
    rating: 4.4,
    reviews_count: 76,
    is_featured: false,
    is_active: true,
    created_at: daysAgo(8)
  },
  {
    id: 'prod_5',
    shop_id: 'shop_gadget_hub',
    title: 'True Wireless Earbuds AirPods-Style',
    slug: 'true-wireless-earbuds-airpods-style',
    description:
      'Feather-light TWS earbuds with ENC calling, touch controls, low-latency gaming mode and 24-hour total playback with the pocket charging case.',
    category: 'electronics',
    subcategory: 'Audio',
    tags: ['earbuds', 'tws', 'bluetooth'],
    price: 3200,
    discount_price: 2450,
    stock: 3,
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
    rating: 4.3,
    reviews_count: 142,
    is_featured: true,
    is_active: true,
    created_at: daysAgo(3)
  },
  {
    id: 'prod_6',
    shop_id: 'shop_gadget_hub',
    title: 'Classic Cotton T-Shirt (Unisex)',
    slug: 'classic-cotton-t-shirt-unisex',
    description:
      'Premium 180 GSM combed cotton tee. Pre-shrunk, breathable and available in sizes S–XXL. A wardrobe staple that survives countless washes.',
    category: 'fashion',
    subcategory: 'Men',
    tags: ['tshirt', 'cotton', 'unisex'],
    price: 890,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    rating: 4.2,
    reviews_count: 58,
    is_featured: false,
    is_active: true,
    created_at: daysAgo(5)
  },
  {
    id: 'prod_7',
    shop_id: 'shop_gadget_hub',
    title: 'Urban Commuter Backpack 25L',
    slug: 'urban-commuter-backpack-25l',
    description:
      'Water-resistant 25L backpack with padded 15.6" laptop sleeve, USB pass-through charging port, anti-theft back pocket and ergonomic airflow straps.',
    category: 'fashion',
    subcategory: 'Bags & Accessories',
    tags: ['backpack', 'laptop', 'travel'],
    price: 2600,
    discount_price: 1990,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    rating: 4.6,
    reviews_count: 88,
    is_featured: true,
    is_active: true,
    created_at: daysAgo(1)
  },
  {
    id: 'prod_8',
    shop_id: 'shop_gadget_hub',
    title: 'Adjustable Dumbbell Set 20kg',
    slug: 'adjustable-dumbbell-set-20kg',
    description:
      'Space-saving adjustable dumbbell pair (2×10kg) with anti-slip grip and quick-lock collars. Ideal for home strength training.',
    category: 'sports',
    subcategory: 'Gym Equipment',
    tags: ['dumbbell', 'fitness', 'home-gym'],
    price: 7500,
    stock: 0,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
    rating: 4.5,
    reviews_count: 41,
    is_featured: false,
    is_active: true,
    created_at: daysAgo(9)
  }
];

/* -------------------------------- Orders -------------------------------- */

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_seed_1',
    order_number: 'ORD-2026-1042',
    customer_id: 'user_customer',
    customer_name: 'Tanvir Ahmed',
    customer_email: 'customer@demo.bd',
    customer_phone: '01922223333',
    shipping_address: {
      fullName: 'Tanvir Ahmed',
      phone: '01922223333',
      email: 'customer@demo.bd',
      address: 'House 42, Road 7, Dhanmondi',
      city: 'Dhaka',
      postalCode: '1209',
      note: 'Call before delivery'
    },
    total_amount: 9440,
    platform_fee_total: 122.5,
    payment_method: 'bkash',
    payment_status: 'paid',
    transaction_id: 'TXN8H2K4M6A',
    overall_status: 'shipped',
    created_at: daysAgo(2),
    items: [
      {
        id: 'item_seed_1',
        order_id: 'ord_seed_1',
        shop_id: 'shop_flagship',
        product_id: 'prod_1',
        product_title: 'Wireless Noise-Cancelling Headphones Pro',
        product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        unit_price: 6990,
        quantity: 1,
        total_price: 6990,
        is_admin_shop: true,
        admin_commission_5pct: 6990,
        vendor_amount_95pct: 0,
        status: 'processing',
        shop_name: 'Shoptastic Flagship'
      },
      {
        id: 'item_seed_2',
        order_id: 'ord_seed_1',
        shop_id: 'shop_gadget_hub',
        product_id: 'prod_5',
        product_title: 'True Wireless Earbuds AirPods-Style',
        product_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        unit_price: 2450,
        quantity: 1,
        total_price: 2450,
        is_admin_shop: false,
        admin_commission_5pct: 122.5,
        vendor_amount_95pct: 2327.5,
        status: 'shipped',
        shop_name: 'GadgetHub Bangladesh'
      }
    ]
  }
];
