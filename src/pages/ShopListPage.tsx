import React, { useState } from 'react';
import { Store, Star, ShieldCheck, ArrowRight, Search, PlusCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ShopListPageProps {
  onSelectShop: (shopId: string) => void;
  onNavigate: (page: string) => void;
}

export const ShopListPage: React.FC<ShopListPageProps> = ({ onSelectShop, onNavigate }) => {
  const { shops, products, currentUser } = useStore();
  const [shopQuery, setShopQuery] = useState('');

  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;

  const filteredShops = shops.filter(
    (s) =>
      s.is_active &&
      (s.name.toLowerCase().includes(shopQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(shopQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 p-8 sm:p-12 text-white overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300">
            <Store className="w-4 h-4" />
            <span>Discover Verified Bangladeshi Merchants</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Explore Unique Shops & Storefronts
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Support local vendors, official flagship stores, and handcrafted artisan brands. Every shop operates independently with guaranteed 5% platform commission transparency.
          </p>
          {!userShop && (
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('create-shop')}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your Own Shop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search shops by name..."
            value={shopQuery}
            onChange={(e) => setShopQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredShops.length}</span> Verified Shops
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => {
          const shopProductCount = products.filter((p) => p.shop_id === shop.id).length;

          return (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Banner Image */}
              <div className="relative h-32 w-full bg-slate-800 overflow-hidden">
                <img
                  src={shop.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Flagship Badge */}
                {shop.is_admin_shop && (
                  <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Platform Flagship</span>
                  </div>
                )}
              </div>

              {/* Logo & Info */}
              <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-md shrink-0">
                      <img
                        src={shop.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{shop.rating}</span>
                      <span className="text-slate-400 text-[10px]">({shop.reviews_count})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition flex items-center gap-1.5">
                    <span>{shop.name}</span>
                    {shop.is_verified && (
                      <span title="Verified Merchant" className="inline-flex">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {shop.description}
                  </p>
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">
                    <strong className="text-slate-900">{shopProductCount}</strong> Products Listed
                  </span>
                  <span className="text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Visit Shop <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
