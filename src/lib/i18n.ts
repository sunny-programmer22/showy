import { useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'bn';
const KEY = 'showy_lang';
const EVENT = 'showy-lang-change';

type Dict = Record<string, { en: string; bn: string }>;

export const STRINGS: Dict = {
  /* Navigation */
  home: { en: 'Home', bn: 'হোম' },
  browse: { en: 'Browse', bn: 'ব্রাউজ' },
  cart: { en: 'Cart', bn: 'কার্ট' },
  shops: { en: 'Shops', bn: 'শপ' },
  orders: { en: 'Orders', bn: 'অর্ডার' },
  allProducts: { en: 'All Products', bn: 'সব পণ্য' },
  exploreShops: { en: 'Explore Shops', bn: 'শপ দেখুন' },
  myOrders: { en: 'My Orders', bn: 'আমার অর্ডার' },
  openYourShop: { en: 'Open Your Shop', bn: 'আপনার শপ খুলুন' },
  search: { en: 'Search products…', bn: 'পণ্য খুঁজুন…' },
  signIn: { en: 'Sign In', bn: 'লগইন' },
  signOut: { en: 'Sign Out', bn: 'লগ আউট' },

  /* Hero */
  heroTitle1: { en: 'Shop Everything.', bn: 'সবকিছু কিনুন।' },
  heroTitle2: { en: 'Sell Anything.', bn: 'যেকোনো কিছু বিক্রি করুন।' },
  heroTitle3: { en: 'Grow.', bn: 'এগিয়ে যান।' },
  heroSub: {
    en: 'Thousands of products from verified vendors nationwide. Or launch your own store',
    bn: 'সারা দেশের ভেরিফাইড ভেন্ডরদের কাছ থেকে হাজারো পণ্য। অথবা নিজের স্টোর খুলুন'
  },
  startShopping: { en: 'Start Shopping', bn: 'কেনাকাটা শুরু করুন' },
  becomeSeller: { en: 'Become a Seller', bn: 'সেলার হোন' },

  /* Sections */
  featuredProducts: { en: 'Featured Products', bn: 'ফিচার্ড পণ্য' },
  newArrivals: { en: 'New Arrivals', bn: 'নতুন পণ্য' },
  freshDrops: { en: 'Fresh drops from every storefront', bn: 'প্রতিটি দোকানের নতুন সংগ্রহ' },
  popularShops: { en: 'Popular Shops', bn: 'জনপ্রিয় শপ' },
  uniqueStorefronts: { en: 'Explore unique vendor storefronts', bn: 'ইউনিক ভেন্ডর স্টোরফ্রন্ট দেখুন' },
  viewAll: { en: 'View All', bn: 'সব দেখুন' },
  allShops: { en: 'All Shops', bn: 'সব শপ' },

  /* Product detail */
  selectSize: { en: 'Select', bn: 'বেছে নিন' },
  addToCart: { en: 'Add to Cart', bn: 'কার্টে যোগ করুন' },
  addedToCart: { en: 'Added ✓', bn: 'যোগ হয়েছে ✓' },
  buyNow: { en: 'Buy Now', bn: 'এখনই কিনুন' },
  inStock: { en: 'In stock', bn: 'স্টকে আছে' },
  unitsAvailable: { en: 'units available', bn: 'টি ইউনিট আছে' },
  onlyLeft: { en: 'Only', bn: 'মাত্র' },
  orderFast: { en: 'left! Order fast', bn: 'টি বাকি! এখনই অর্ডার করুন' },
  outOfStock: { en: 'Out of Stock', bn: 'স্টক শেষ' },
  descriptionLabel: { en: 'Product Description', bn: 'পণ্যের বিবরণ' },
  reviewsTitle: { en: 'Ratings & Reviews', bn: 'রেটিং ও রিভিউ' },
  writeReview: { en: 'Write a review', bn: 'রিভিউ লিখুন' },
  submitReview: { en: 'Submit Review', bn: 'রিভিউ দিন' },
  noReviewsYet: { en: 'No reviews yet — be the first!', bn: 'এখনও কোনো রিভিউ নেই — আপনিই প্রথম হোন!' },
  visitShop: { en: 'Visit', bn: 'ভিজিট করুন' },

  /* Cart */
  yourCart: { en: 'Your Cart', bn: 'আপনার কার্ট' },
  emptyCart: { en: 'Your cart is empty', bn: 'আপনার কার্ট খালি' },
  browseProducts: { en: 'Browse products and add items!', bn: 'পণ্য দেখে কার্টে যোগ করুন!' },
  startShoppingShort: { en: 'Start Shopping', bn: 'কেনাকাটা করুন' },
  subtotal: { en: 'Subtotal', bn: 'সাবটোটাল' },
  deliveryFee: { en: 'Delivery Fee', bn: 'ডেলিভারি ফি' },
  free: { en: 'FREE', bn: 'ফ্রি' },
  total: { en: 'Total', bn: 'মোট' },
  checkout: { en: 'Proceed to Checkout', bn: 'চেকআউট করুন' },
  quantity: { en: 'Qty', bn: 'পরিমাণ' },

  /* Wishlist & Flash */
  wishlist: { en: 'Wishlist', bn: 'ইচ্ছা তালিকা' },
  flashDeals: { en: 'Flash Deals', bn: 'ফ্ল্যাশ ডিল' },
  recentlyViewed: { en: 'Recently Viewed', bn: 'সম্প্রতি দেখেছেন' },
  limitedTime: { en: 'Limited time', bn: 'সীমিত সময়' },

  /* Settings & Orders */
  settings: { en: 'Settings', bn: 'সেটিংস' },
  darkMode: { en: 'Dark mode', bn: 'ডার্ক মোড' },
  referral: { en: 'Refer & Earn', bn: 'রেফার ও আয়' },
  loyaltyPoints: { en: 'Loyalty Points', bn: 'লয়্যালটি পয়েন্ট' },
  cancelOrder: { en: 'Cancel Order', bn: 'অর্ডার বাতিল' },
  requestReturn: { en: 'Request Return', bn: 'রিটার্ন অনুরোধ' },
  downloadInvoice: { en: 'Download Invoice', bn: 'ইনভয়েস ডাউনলোড' },
  inStockOnly: { en: 'In stock only', bn: 'শুধু স্টকে' },
  followShop: { en: 'Follow', bn: 'ফলো করুন' },
  followingShop: { en: 'Following', bn: 'ফলো করছেন' },
  qaTitle: { en: 'Questions & Answers', bn: 'প্রশ্ন ও উত্তর' },
  askQuestion: { en: 'Ask a question', bn: 'প্রশ্ন করুন' },
  helpful: { en: 'Helpful', bn: 'সহায়ক' },
};

export type StringKey = keyof typeof STRINGS;

const readLang = (): Lang => (localStorage.getItem(KEY) === 'bn' ? 'bn' : 'en');

export const useLang = () => {
  const [lang, setLang] = useState<Lang>(readLang);

  useEffect(() => {
    const sync = () => setLang(readLang());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const setLanguage = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((k: StringKey) => STRINGS[k][readLang()], [lang]);

  return { lang, setLanguage, t, toggleLang: () => setLanguage(readLang() === 'en' ? 'bn' : 'en') };
};
