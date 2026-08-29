import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Store, ArrowRight, ShieldCheck, Sparkles,
  ShoppingBag, TrendingUp, LayoutDashboard, Flame, Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLang } from '../lib/i18n';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Product } from '../types';
import HeroCarousel from '../components/HeroCarousel';

interface HomePageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct, onNavigateToShop, onNavigate }) => {
  const { products, shops, currentUser, isLoading, recentlyViewed } = useStore();
  const { t } = useLang();
  const recentlyProducts = recentlyViewed.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4) as Product[];
  const flashProducts = products.filter((p) => p.discount_price && p.is_active).slice(0, 4);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const flashEnd = React.useMemo(() => Date.now() + 24 * 60 * 60 * 1000, []);
  const flashLeft = Math.max(0, flashEnd - now);
  const flashH = String(Math.floor(flashLeft / 3600000)).padStart(2, '0');
  const flashM = String(Math.floor((flashLeft % 3600000) / 60000)).padStart(2, '0');
  const flashS = String(Math.floor((flashLeft % 60000) / 1000)).padStart(2, '0');

  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;
  const dataLoading = isLoading && products.length === 0;

  const featured = products.filter((p) => p.is_featured && p.is_active).slice(0, 4);
  const newest = [...products].filter((p) => p.is_active).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);
  const activeShops = shops.filter((s) => s.is_active);
  const reduce = useReducedMotion();

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 bg-[#FCFCF9]">
      {/* ===== HERO — Editorial Split, Soft Structuralism ===== */}
      <section className="relative bg-[#FDFBF7] border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          {/* Left — Massive Typography */}
          <div className="space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-medium tracking-[0.18em] uppercase text-slate-600 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Bangladesh's Multi-Vendor Marketplace
            </div>

            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tighter leading-[0.9] text-slate-900">
              <span className="block">Shop</span>
              <span className="block text-slate-400">Everything.</span>
              <span className="block">Sell <span className="font-light italic pr-1" style={{ fontFamily: 'Sora, serif' }}>Anything.</span></span>
            </h1>

            <p className="text-[15px] leading-relaxed text-slate-600 max-w-[50ch]">
              {t('heroSub')}. <span className="text-slate-900 font-medium">{activeShops.length}+ verified shops</span> and <span className="text-slate-900 font-medium">{products.length}+ products</span> across 64 districts.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button onClick={() => onNavigate('products')}
                className="group relative inline-flex items-center gap-2 pl-6 pr-2 py-2 bg-slate-900 text-white rounded-full font-medium text-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black active:scale-[0.98]">
                <span>{t('startShopping')}</span>
                <span className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              {userShop ? (
                <button onClick={() => onNavigate('vendor-dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full font-medium text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <LayoutDashboard className="w-4 h-4" /> My Shop Panel
                </button>
              ) : (
                <button onClick={() => onNavigate('create-shop')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full font-medium text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <Store className="w-4 h-4" /> Open Your Shop
                </button>
              )}
            </div>

            <div className="flex items-center gap-6 sm:gap-8 pt-2 border-t border-slate-200/60">
              {[
                { value: `${activeShops.length}+`, label: 'Verified Shops' },
                { value: `${products.length}+`, label: 'Products' },
                { value: '64', label: 'Districts' }
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl sm:text-2xl font-light tracking-tight text-slate-900">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Double-Bezel Bento */}
          <div className="relative lg:pl-4">
            <div className="bg-black/[0.04] p-2 sm:p-3 rounded-[2rem] ring-1 ring-black/5">
              <div className="bg-white rounded-[calc(2rem-0.75rem)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-black/[0.04] aspect-[4/3] sm:aspect-[16/10] relative">
                <HeroCarousel />
              </div>
            </div>
            <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.10)] border border-slate-100 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Buyer Protection</p>
                <p className="text-[11px] text-slate-500">Verified merchants • 64 districts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('featuredProducts')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Hand-picked highlights from our marketplace</p>
          </div>
          <button onClick={() => onNavigate('products')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
          ))}
        </div>
      </motion.section>

      {/* ===== Flash Deals ===== */}
      {flashProducts.length > 0 && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2"><Flame className="w-6 h-6 text-rose-500" /> Flash Deals <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs">Limited time</span></h2>
            <div className="flex items-center gap-1.5 text-sm font-mono font-bold bg-slate-900 text-white px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4" /> {flashH}:{flashM}:{flashS}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {flashProducts.map((p) => (
              <ProductCard key={`flash-${p.id}`} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ===== Vendor CTA banner ===== */}
      {!userShop && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-8 sm:p-12 overflow-hidden shadow-lift">
          <TrendingUp className="absolute right-6 top-6 w-32 h-32 text-white/5 rotate-12" />
          <div className="pointer-events-none absolute -left-10 -bottom-16 w-64 h-64 bg-emerald-400/20 blur-3xl rounded-full" />
          <div className="max-w-lg space-y-3 relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Have something to sell?</h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Join hundreds of independent sellers. Upload products, track orders live, and withdraw earnings to bKash/Nagad anytime — your money, your rules.
            </p>
            <button onClick={() => onNavigate('create-shop')}
              className="btn-shine mt-3 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg flex items-center gap-2 active:scale-95">
              {t('becomeSeller')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </motion.section>
      )}

      {/* ===== New Arrivals ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('newArrivals')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('freshDrops')}</p>
          </div>
          <button onClick={() => onNavigate('products')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {dataLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newest.map((p) => (
                <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
              ))}
        </div>
      </motion.section>

      {/* ===== Shops showcase ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{t('popularShops')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('uniqueStorefronts')}</p>
          </div>
          <button onClick={() => onNavigate('shops')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            {t('allShops')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dataLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-1.5 bg-black/[0.04] rounded-[1.75rem] ring-1 ring-black/5">
                  <div className="bg-white rounded-[calc(1.75rem-0.375rem)] overflow-hidden shadow-sm">
                    <Skeleton className="h-24 rounded-none" />
                    <div className="pt-7 p-5 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ))
            : activeShops.slice(0, 3).map((shop) => (
            <div key={shop.id} onClick={() => onNavigateToShop(shop.id)}
              className="group cursor-pointer p-1.5 bg-black/[0.04] rounded-[1.75rem] ring-1 ring-black/5 hover:bg-black/[0.06] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
              <div className="bg-white rounded-[calc(1.75rem-0.375rem)] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-black/[0.04]">
                <div className="h-24 relative">
                  <img src={shop.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <img src={shop.logo_url} alt="" className="absolute -bottom-5 left-4 w-14 h-14 rounded-xl border-4 border-white object-cover shadow" />
                </div>
                <div className="pt-7 p-5">
                  <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    {shop.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{shop.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ===== Recently Viewed ===== */}
      {recentlyProducts.length > 0 && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Recently Viewed</h2>
            <button onClick={() => onNavigate('products')} className="text-xs font-bold text-brand-600 hover:text-brand-700">Browse more →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recentlyProducts.map((p) => (
              <ProductCard key={`recent-${p.id}`} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ===== SEO content block ===== */}
      <section className="mt-14 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4 text-xs leading-relaxed text-slate-500">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Showy Store — Online Shopping in Bangladesh</h2>
          <p>
            Showy Store is a <strong className="text-slate-600">multi-vendor online marketplace in Bangladesh</strong> where you can
            buy sports jerseys, fashion, electronics, gadgets and more from verified sellers — or{' '}
            <button onClick={() => onNavigate('create-shop')} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">open your own online shop</button>{' '}
            in minutes with simple, transparent fees.
          </p>
          <p>
            We make online shopping in BD simple and safe: pay with <strong className="text-slate-600">bKash or Nagad OTP verification</strong>,
            debit/credit cards, or <strong className="text-slate-600">cash on delivery (COD)</strong> anywhere in the country — Dhaka,
            Chattogram, Khulna, Rajshahi, Rangpur, Gaibandha and all 64 districts, delivered nationwide.
          </p>
          <p>
            Every storefront is reviewed before selling, so you always buy from{' '}
            <button onClick={() => onNavigate('shops')} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">trusted verified shops</button>.
            Questions about orders, payments, delivery times or returns? Check our{' '}
            <button onClick={() => onNavigate('faq')} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">FAQ</button>{' '}
            or browse all{' '}
            <button onClick={() => onNavigate('products')} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">products for sale in Bangladesh</button>.
          </p>
        </div>
      </section>
    </div>
  );
};
