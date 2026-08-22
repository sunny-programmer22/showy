import React, { useState } from 'react';
import { Star, ShoppingCart, ArrowLeft, Store, ShieldCheck, Minus, Plus, Truck, RefreshCw, BadgePercent, Ban } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
  onGoToCart: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onNavigateToShop,
  onGoToCart
}) => {
  const { addToCart, shops, products } = useStore();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const shop = shops.find((s) => s.id === product.shop_id);
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const finalPrice = product.discount_price ?? product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100)
    : 0;

  const related = products.filter(
    (p) => p.id !== product.id && (p.shop_id === product.shop_id || p.category === product.category)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Continue Browsing
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img src={product.images[activeImage] || product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                <BadgePercent className="w-4 h-4" /> -{discountPercent}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${activeImage === i ? 'border-brand-600 ring-2 ring-brand-200' : 'border-slate-200 opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Panel */}
        <div className="space-y-5">
          {/* Shop link */}
          {shop && (
            <button onClick={() => onNavigateToShop(shop.id)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit shadow-sm">
              <Store className="w-3.5 h-3.5 text-brand-600" />
              <span>Visit {shop.name}</span>
              {shop.is_admin_shop && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
              {shop.is_verified && !shop.is_admin_shop && <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />}
            </button>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">{product.title}</h1>

          {/* Rating row */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-300 fill-none'}`} />
              ))}
            </div>
            <span className="font-bold text-slate-800">{product.rating}</span>
            <span className="text-slate-400">· {product.reviews_count} verified reviews</span>
          </div>

          {/* Price block */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900">৳{finalPrice.toLocaleString()}</span>
              {hasDiscount && <span className="text-lg text-slate-400 line-through font-medium">৳{product.price.toLocaleString()}</span>}
              {hasDiscount && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-extrabold rounded-md">SAVE ৳{(product.price - finalPrice).toLocaleString()}</span>}
            </div>
            {!shop?.is_admin_shop && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Vendor receives ৳{(finalPrice * 0.95).toFixed(0)} after automatic 5% platform split
              </p>
            )}
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
              {product.stock > 0 ? (
                product.stock <= 5
                  ? <><span className="text-amber-600 font-bold">⚠ Only {product.stock} left!</span> order fast</>
                  : <>✓ In stock ({product.stock} units available)</>
              ) : <span className="text-rose-600 font-bold">✗ Out of Stock</span>}
            </p>
          </div>

          {/* Quantity + CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-slate-50 transition"><Minus className="w-4 h-4" /></button>
              <span className="px-5 py-3 font-bold text-sm border-x border-slate-200">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={qty >= product.stock}
                className="p-3 hover:bg-slate-50 transition disabled:opacity-30"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md ${
                added ? 'bg-emerald-600 shadow-emerald-100'
                  : product.stock === 0 ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-100 active:scale-[0.98]'}`}>
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button onClick={() => { handleAddToCart(); setTimeout(onGoToCart, 400); }} disabled={product.stock === 0}
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-md disabled:bg-slate-300">
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-white border border-slate-200 rounded-xl">
              <Truck className="w-5 h-5 mx-auto text-brand-600 mb-1" />
              <p className="text-[10px] font-bold text-slate-700">Fast Delivery</p>
              <p className="text-[10px] text-slate-400">Nationwide</p>
            </div>
            <div className="text-center p-3 bg-white border border-slate-200 rounded-xl">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-[10px] font-bold text-slate-700">Genuine Product</p>
              <p className="text-[10px] text-slate-400">Guaranteed</p>
            </div>
            <div className="text-center p-3 bg-white border border-slate-200 rounded-xl">
              {product.is_returnable !== false ? (
                <>
                  <RefreshCw className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <p className="text-[10px] font-bold text-slate-700">7-Day Return</p>
                  <p className="text-[10px] text-slate-400">Easy Policy</p>
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <p className="text-[10px] font-bold text-slate-700">No Returns</p>
                  <p className="text-[10px] text-slate-400">Final Sale</p>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide mb-2">Product Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-md">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-14 space-y-5">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
