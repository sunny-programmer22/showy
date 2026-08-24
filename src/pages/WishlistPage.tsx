import React from 'react';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { EmptyState } from '../components/ui/EmptyState';

interface WishlistPageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
  onNavigate: (page: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onNavigateToShop, onNavigate }) => {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishedProducts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here. We'll remind you when it's back in stock or on sale."
          actionLabel="Browse Products"
          onAction={() => onNavigate('products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" /> My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">{wishedProducts.length} saved item{wishedProducts.length > 1 ? 's' : ''} — we'll notify you on restock</p>
        </div>
        <button
          onClick={() => {
            wishedProducts.forEach((p) => toggleWishlist(p.id));
          }}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {wishedProducts.map((p) => (
          <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          onClick={() => wishedProducts.forEach((p) => addToCart(p, 1))}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Add all to cart
        </button>
        <button onClick={() => onNavigate('products')} className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-sm rounded-xl flex items-center gap-2">
          Continue shopping <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
