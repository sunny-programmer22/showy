import React, { useState } from 'react';
import { Star, ShoppingCart, Eye, Store, ShieldCheck, Heart } from 'lucide-react';
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
  const { addToCart, shops, toggleWishlist, isWishlisted } = useStore();
  const [added, setAdded] = useState(false);
  const wished = isWishlisted(product.id);

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
      className="group bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-1.5 hover:border-brand-200 transition-all duration-300 ease-out flex flex-col cursor-pointer relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg shadow-rose-600/30">
            {discountPercent}% OFF
          </div>
        )}

        {/* Admin Flagship Badge */}
        {shop?.is_admin_shop && (
          <div className="absolute top-3 right-3 glass-dark text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-white/10">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Official Flagship</span>
          </div>
        )}

        {/* Quick View overlay button */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center pb-4 bg-gradient-to-t from-slate-950/40 to-transparent">
          <span className="glass-dark px-4 py-2 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lift border border-white/20">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute ${hasDiscount ? 'top-12' : 'top-3'} left-3 p-2 rounded-full shadow-md border transition ${wished ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/90 border-white text-slate-400 hover:text-rose-500'}`}
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Tag */}
          {shop && (
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <Store className="w-3 h-3 text-brand-500" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToShop) onNavigateToShop(shop.id);
                }}
                className="hover:text-brand-600 truncate max-w-[180px]"
              >
                {shop.name}
              </button>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
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
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
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
            className={`p-2.5 rounded-xl text-white transition-all duration-300 flex items-center justify-center ${
              added
                ? 'bg-emerald-600 scale-105'
                : product.stock === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 active:scale-90 shadow-cta'
            }`}
            title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className={`w-4 h-4 ${added ? 'animate-bounce' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
