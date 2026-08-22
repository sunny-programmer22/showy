import React, { useState } from 'react';
import { Star, ShoppingCart, Eye, Store, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigateToShop?: (shopId: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigateToShop,
  onSelectProduct
}) => {
  const { addToCart, shops } = useStore();
  const [added, setAdded] = useState(false);

  const shop = shops.find((s) => s.id === product.shop_id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Admin Flagship Badge */}
        {shop?.is_admin_shop && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Official Flagship</span>
          </div>
        )}

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 bg-white/90 text-slate-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-md hover:bg-white">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Tag */}
          {shop && (
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <Store className="w-3 h-3 text-brand-600" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToShop) onNavigateToShop(shop.id);
                }}
                className="hover:text-brand-600 hover:underline truncate max-w-[180px]"
              >
                {shop.name}
              </button>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-brand-600 transition">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating}</span>
            <span className="text-[11px] text-slate-400">({product.reviews_count})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ৳{(product.discount_price ?? product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-amber-600 block">
                Only {product.stock} left in stock!
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl text-white font-bold transition flex items-center justify-center ${
              added
                ? 'bg-emerald-600'
                : product.stock === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-sm'
            }`}
            title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
