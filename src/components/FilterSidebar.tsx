import React from 'react';
import { SlidersHorizontal, Store, Star, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INITIAL_CATEGORIES } from '../data/mockData';

export const FilterSidebar: React.FC = () => {
  const {
    shops,
    selectedCategory,
    setSelectedCategory,
    selectedShopId,
    setSelectedShopId,
    priceRange,
    setPriceRange,
    setSearchQuery,
    inStockOnly,
    setInStockOnly,
    minRating,
    setMinRating,
    setSortBy
  } = useStore();

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedShopId('all');
    setPriceRange([0, 50000]);
    setSearchQuery('');
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('popular');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
          <SlidersHorizontal className="w-5 h-5 text-brand-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleResetFilters}
          className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center space-x-1 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
          Category
        </h4>
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Price Range (৳)
          </h4>
          <span className="text-xs font-bold text-slate-700">
            Up to ৳{priceRange[1].toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="30000"
          step="500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-brand-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
          <span>৳0</span>
          <span>৳15,000</span>
          <span>৳30,000+</span>
        </div>
      </div>

      {/* Shop / Vendor Filter */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1">
          <Store className="w-3.5 h-3.5" />
          <span>Filter by Shop</span>
        </h4>
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => setSelectedShopId('all')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
              selectedShopId === 'all'
                ? 'bg-emerald-50 text-emerald-800 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Verified Vendors
          </button>
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => setSelectedShopId(shop.id)}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition ${
                selectedShopId === shop.id
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{shop.name}</span>
              {shop.is_admin_shop && (
                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">
                  Flagship
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
        <span className="text-xs font-bold text-slate-700">In stock only</span>
      </label>

      {/* Customer Rating Filter */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[0, 4, 3].map((stars) => (
            <label
              key={stars}
              className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900"
            >
              <input
                type="radio"
                name="rating_filter"
                checked={minRating === stars}
                onChange={() => setMinRating(stars)}
                className="text-brand-600 focus:ring-brand-500"
              />
              {stars === 0 ? (
                <span className="font-medium">Any rating</span>
              ) : (
                <>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-500 font-medium">& Up</span>
                </>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
