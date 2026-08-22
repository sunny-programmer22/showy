import React from 'react';
import {
  Store, ArrowRight, ShieldCheck, Sparkles, Truck, BadgePercent,
  ShoppingBag, TrendingUp, LayoutDashboard
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Product } from '../types';
import poster from '../assets/poster.jpg';

interface HomePageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct, onNavigateToShop, onNavigate }) => {
  const { products, shops, currentUser, isLoading } = useStore();

  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;
  const dataLoading = isLoading && products.length === 0;

  const featured = products.filter((p) => p.is_featured && p.is_active).slice(0, 4);
  const newest = [...products].filter((p) => p.is_active).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);
  const activeShops = shops.filter((s) => s.is_active);

  return (
    <div className="space-y-14 pb-16">
      {/* ===== HERO with Poster ===== */}
      <section className="relative bg-slate-950 overflow-hidden">
        {/* Poster as background */}
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/20" />
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-brand-600/25 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-xl space-y-7">
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 glass-dark border border-white/15 rounded-full text-[11px] font-bold text-amber-300 shadow-soft">
              <Sparkles className="w-3.5 h-3.5" />
              Bangladesh's Multi-Vendor Marketplace
            </div>

            <h1 className="animate-fade-up delay-75 text-[2.6rem] leading-[1.05] sm:text-6xl font-extrabold text-white">
              Shop Everything.
              <span className="block text-gradient pb-1">Sell Anything.</span>
            </h1>

            <p className="animate-fade-up delay-150 text-sm sm:text-base text-slate-300 leading-relaxed">
              Thousands of products from verified vendors nationwide. Or launch your own store in 2 minutes — keep <strong className="text-emerald-400">95% of every sale</strong>, pay only a flat 5% platform fee.
            </p>

            <div className="animate-fade-up delay-225 flex flex-wrap gap-3.5 pt-1">
              <button onClick={() => onNavigate('products')}
                className="btn-shine px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-cta flex items-center gap-2 active:scale-95">
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </button>
              {userShop ? (
                <button onClick={() => onNavigate('vendor-dashboard')}
                  className="px-7 py-3.5 glass-dark border border-emerald-400/30 text-emerald-300 hover:text-white hover:border-emerald-300/60 font-extrabold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 active:scale-95">
                  <LayoutDashboard className="w-4 h-4" /> My Shop Panel
                </button>
              ) : (
                <button onClick={() => onNavigate('create-shop')}
                  className="px-7 py-3.5 glass-dark border border-white/25 text-white font-extrabold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 flex items-center gap-2 active:scale-95">
                  <Store className="w-4 h-4" /> Open Your Shop
                </button>
              )}
            </div>

            {/* Trust stats */}
            <div className="animate-fade-up delay-300 flex items-center gap-7 pt-4 text-white/90">
              {[
                { value: `${activeShops.length}+`, label: 'Verified Shops' },
                { value: `${products.length}+`, label: 'Products' },
                { value: '64', label: 'Districts Served' }
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold font-display">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade into page background */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50/95 to-transparent" />
      </section>

      {/* ===== Feature strip ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Standard & express options nationwide', color: 'bg-blue-50 text-blue-600' },
            { icon: BadgePercent, title: 'Automated bKash / Nagad', desc: 'SMS OTP payment — zero manual steps', color: 'bg-bkash/10 text-bkash' },
            { icon: ShieldCheck, title: 'Buyer Protection', desc: 'Verified merchants & genuine goods', color: 'bg-emerald-50 text-emerald-600' }
          ].map((f) => (
            <div key={f.title} className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200/70 p-5 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${f.color} transition-transform duration-300 group-hover:scale-110`}><f.icon className="w-6 h-6" /></div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Hand-picked highlights from our marketplace</p>
          </div>
          <button onClick={() => onNavigate('products')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
          ))}
        </div>
      </section>

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
              Become a Seller <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </section>
      )}

      {/* ===== New Arrivals ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">New Arrivals</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fresh drops from every storefront</p>
          </div>
          <button onClick={() => onNavigate('products')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
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
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Popular Shops</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore unique vendor storefronts</p>
          </div>
          <button onClick={() => onNavigate('shops')} className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            All Shops <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
};
