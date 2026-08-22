import React from 'react';
import { Star, ShieldCheck, MapPin, ArrowLeft, Phone, Mail, BadgeCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ShopStorefrontPageProps {
  shopId: string;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: (shopId: string) => void;
}

export const ShopStorefrontPage: React.FC<ShopStorefrontPageProps> = ({
  shopId,
  onBack,
  onSelectProduct,
  onNavigateToShop
}) => {
  const { shops, products } = useStore();
  const shop = shops.find((s) => s.id === shopId);
  const shopProducts = products.filter((p) => p.shop_id === shopId && p.is_active);

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-800">Shop not found</h1>
        <button onClick={onBack} className="mt-4 text-brand-600 font-semibold text-sm">
          Go back to all shops
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Shop Banner */}
      <div className="relative h-56 sm:h-72 w-full bg-slate-900 overflow-hidden">
        <img
          src={shop.banner_url}
          alt={shop.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-3 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl text-xs font-bold text-slate-700 shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Shops</span>
        </button>

        {/* Shop Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex items-end justify-between gap-4">
          <div className="flex items-end space-x-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {shop.name}
                </h1>
                {shop.is_verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-md">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {shop.is_admin_shop && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-extrabold rounded-md">
                    <ShieldCheck className="w-3 h-3" /> Platform Flagship
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-200 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{shop.rating}</span> ({shop.reviews_count} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Dhaka, Bangladesh
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white font-semibold">
              <Phone className="w-3.5 h-3.5" /> Contact Seller
            </span>
            <span className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white font-semibold">
              <Mail className="w-3.5 h-3.5" /> Message
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-1">About this shop</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{shop.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Products from {shop.name}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {shopProducts.length} items available
          </span>
        </div>

        {shopProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 font-medium">This vendor hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {shopProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onNavigateToShop={onNavigateToShop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
