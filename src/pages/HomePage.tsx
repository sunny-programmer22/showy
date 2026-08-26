import React, { useState, useEffect } from 'react';
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

  return (
    <div className="space-y-8 pb-16">
      {/* ===== HERO with Sliding Posters — original aspect, full image at top ===== */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[46vh] sm:max-h-[480px]">
          <HeroCarousel />
          {/* Ambient glow orbs - subtle inside aspect wrapper */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12">
              <div className="max-w-xl space-y-5 sm:space-y-7">
                <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 glass-dark border border-white/15 rounded-full text-[11px] font-bold text-amber-300 shadow-soft">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bangladesh's Multi-Vendor Marketplace
                </div>

                <h1 className="animate-fade-up delay-75 text-[1.9rem] leading-[1.05] sm:text-5xl font-extrabold text-white">
                  {t('heroTitle1')}
                  <span className="block text-gradient pb-1">{t('heroTitle2')}</span>
                </h1>

                <p className="animate-fade-up delay-150 text-xs sm:text-base text-slate-300 leading-relaxed">
                  {t('heroSub')}.
                </p>

                <div className="animate-fade-up delay-225 flex flex-wrap gap-3 pt-1">
                  <button onClick={() => onNavigate('products')}
                    className="btn-shine px-6 py-3 sm:px-7 sm:py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-cta flex items-center gap-2 active:scale-95">
                    <ShoppingBag className="w-4 h-4" /> {t('startShopping')}
                  </button>
                  {userShop ? (
                    <button onClick={() => onNavigate('vendor-dashboard')}
                      className="px-6 py-3 sm:px-7 sm:py-3.5 glass-dark border border-emerald-400/30 text-emerald-300 hover:text-white hover:border-emerald-300/60 font-extrabold text-xs sm:text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 active:scale-95">
                      <LayoutDashboard className="w-4 h-4" /> My Shop Panel
                    </button>
                  ) : (
                    <button onClick={() => onNavigate('create-shop')}
                      className="px-6 py-3 sm:px-7 sm:py-3.5 glass-dark border border-white/25 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 flex items-center gap-2 active:scale-95">
                      <Store className="w-4 h-4" /> Open Your Shop
                    </button>
                  )}
                </div>

                {/* Trust stats - compact on mobile */}
                <div className="animate-fade-up delay-300 flex items-center gap-5 sm:gap-7 pt-2 text-white/90">
                  {[
                    { value: `${activeShops.length}+`, label: 'Verified Shops' },
                    { value: `${products.length}+`, label: 'Products' },
                    { value: '64', label: 'Districts Served' }
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-lg sm:text-2xl font-extrabold font-display">{s.value}</p>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Subtle bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-slate-50/60 to-transparent pointer-events-none" />
      </section>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
      </section>

      {/* ===== Flash Deals ===== */}
      {flashProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
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
        </section>
      )}

      {/* ===== Vendor CTA banner ===== */}
      {!userShop && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </section>
      )}

      {/* ===== New Arrivals ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
      </section>

      {/* ===== Shops showcase ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <Skeleton className="h-24 rounded-none" />
                  <div className="pt-7 p-5 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            : activeShops.slice(0, 3).map((shop) => (
            <div key={shop.id} onClick={() => onNavigateToShop(shop.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="h-24 relative">
                <img src={shop.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          ))}
        </div>
      </section>

      {/* ===== Recently Viewed ===== */}
      {recentlyProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Recently Viewed</h2>
            <button onClick={() => onNavigate('products')} className="text-xs font-bold text-brand-600 hover:text-brand-700">Browse more →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recentlyProducts.map((p) => (
              <ProductCard key={`recent-${p.id}`} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
            ))}
          </div>
        </section>
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
