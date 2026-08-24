import React, { useState, useEffect, useMemo } from 'react';
import { Star, ShoppingCart, ArrowLeft, Store, ShieldCheck, Minus, Plus, Truck, RefreshCw, BadgePercent, Ban, Heart, MessageCircle, Users, HelpCircle, ImagePlus, ThumbsUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLang } from '../lib/i18n';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import * as api from '../lib/api';
import type { ProductReview } from '../lib/api';
import { supabase } from '../lib/supabase';
import { trackViewContent, trackAddToCart } from '../lib/pixel';
import { toast } from '../components/ui/Toast';

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
  const { addToCart, shops, products, variants, currentUser, isLiveMode, setAuthModalOpen, addRecentlyViewed } = useStore();
  const { t } = useLang();
  const [qty, setQty] = useState(1);

  useEffect(() => { addRecentlyViewed(product.id); trackViewContent(product.id, product.discount_price ?? product.price); }, [product.id, addRecentlyViewed, product.discount_price, product.price]);
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

  /* ------------------------- Size / variant logic ------------------------- */
  const productVariants = useMemo(
    () =>
      variants
        .filter((v) => v.product_id === product.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [variants, product.id]
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant = productVariants.find((v) => v.id === selectedVariantId) ?? null;

  // Re-select a sensible default whenever the product (or its variants) change
  useEffect(() => {
    setSelectedVariantId(productVariants.find((v) => v.stock > 0)?.id ?? null);
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, productVariants.map((v) => v.id).join('|')]);

  // Keep quantity within stock of whichever option is selected
  useEffect(() => {
    setQty((q) => Math.max(1, Math.min(q, Math.max(1, selectedVariant?.stock ?? product.stock))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantId]);

  /* ------------------------------ Reviews -------------------------------- */
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const myReview = currentUser ? reviews.find((r) => r.user_id === currentUser.id) : undefined;
  const [followed, setFollowed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('showy_followed') || '[]').includes(shop?.id); } catch { return false; }
  });
  const [qaList, setQaList] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(`showy_qa_${product.id}`) || '[]'); } catch { return []; }
  });
  const [qaQuestion, setQaQuestion] = useState('');
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('showy_helpful') || '{}'); } catch { return {}; }
  });
  const [reviewImageUrl, setReviewImageUrl] = useState('');
  const [reviewImageUploading, setReviewImageUploading] = useState(false);

  useEffect(() => {
    if (!isLiveMode) return;
    api.fetchReviews(product.id).then(setReviews).catch(() => {});
  }, [product.id, isLiveMode]);

  const submitReview = async () => {
    if (!currentUser) return;
    setSavingReview(true);
    try {
      const saved = await api.apiUpsertReview(
        product.id,
        currentUser.id,
        currentUser.full_name || 'Customer',
        myRating,
        myComment.trim()
      );
      setReviews((prev) => [saved, ...prev.filter((r) => r.user_id !== saved.user_id)]);
      toast.success(myReview ? 'Your review was updated!' : 'Thanks for your review!');
    } catch (e: any) {
      toast.error(`Could not save review: ${e.message}`);
    } finally {
      setSavingReview(false);
    }
  };
  const toggleFollow = () => {
    if (!shop) return;
    const list: string[] = JSON.parse(localStorage.getItem('showy_followed') || '[]');
    const is = list.includes(shop.id);
    const next = is ? list.filter((id) => id !== shop.id) : [...list, shop.id];
    localStorage.setItem('showy_followed', JSON.stringify(next));
    setFollowed(!is);
    toast.success(is ? `Unfollowed ${shop.name}` : `Following ${shop.name} — you'll be notified of new products`);
  };
  const submitQuestion = () => {
    if (!qaQuestion.trim()) return;
    const entry = { id: Date.now().toString(), question: qaQuestion.trim(), answer: '', created_at: new Date().toISOString(), user_name: currentUser?.full_name || 'Guest' };
    const next = [entry, ...qaList];
    setQaList(next);
    localStorage.setItem(`showy_qa_${product.id}`, JSON.stringify(next));
    setQaQuestion('');
    toast.success('Question submitted — seller will answer soon');
  };
  const toggleHelpful = (reviewId: string) => {
    const cur = helpfulMap[reviewId] || 0;
    const next = { ...helpfulMap, [reviewId]: cur ? 0 : 1 };
    setHelpfulMap(next);
    localStorage.setItem('showy_helpful', JSON.stringify(next));
  };
  const handleReviewImage = async (file: File) => {
    if (!supabase) { toast.error('Storage not configured'); return; }
    setReviewImageUploading(true);
    const path = `reviews/${product.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast.error(error.message); setReviewImageUploading(false); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    setReviewImageUrl(data.publicUrl);
    setReviewImageUploading(false);
    toast.success('Photo uploaded — will attach to review');
  };

  const effectivePrice = selectedVariant?.price ?? finalPrice;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const needsSelection = productVariants.length > 0 && !selectedVariant;

  const handleAddToCart = () => {
    if (needsSelection || effectiveStock === 0) return;
    addToCart(product, qty, selectedVariant);
    trackAddToCart(product.id, effectivePrice * qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <li><a href="/" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo({ top: 0 }); }} className="hover:text-brand-600 transition">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/products" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/products'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo({ top: 0 }); }} className="hover:text-brand-600 transition capitalize">{product.category}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-600 truncate max-w-[240px]">{product.title}</li>
        </ol>
      </nav>

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
                <button key={i} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1} of ${product.images.length}`}
                  aria-current={activeImage === i}
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
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => onNavigateToShop(shop.id)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit shadow-sm">
                <Store className="w-3.5 h-3.5 text-brand-600" />
                <span>Visit {shop.name}</span>
                {shop.is_admin_shop && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                {shop.is_verified && !shop.is_admin_shop && <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />}
              </button>
              <button onClick={toggleFollow} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1 ${followed ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <Users className="w-3 h-3" /> {followed ? t('followingShop') : t('followShop')}
              </button>
            </div>
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

          {/* Variant selector */}
          {productVariants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Select {productVariants[0]?.option_name ?? 'Size'}
                <span aria-hidden="true" className="text-rose-500"> *</span>
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Choose ${productVariants[0]?.option_name ?? 'size'}`}>
                {productVariants.map((v) => {
                  const out = v.stock === 0;
                  const active = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={out}
                      aria-pressed={active}
                      aria-label={`${v.option_value}${out ? ', out of stock' : ''}`}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition ${
                        out
                          ? 'border-slate-200 bg-slate-50 text-slate-300 line-through cursor-not-allowed'
                          : active
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-2 ring-brand-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600'
                      }`}
                    >
                      {v.option_value}
                      {!out && v.price != null && (
                        <span className={`ml-1.5 text-[10px] font-extrabold ${active ? 'text-brand-500' : 'text-slate-400'}`}>
                          ৳{v.price.toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {needsSelection && (
                <p className="text-[11px] font-semibold text-amber-600">Please choose an option before adding to cart.</p>
              )}
            </div>
          )}

          {/* Price block */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900">৳{effectivePrice.toLocaleString()}</span>
              {effectivePrice < product.price && (
                <>
                  <span className="text-lg text-slate-400 line-through font-medium">৳{product.price.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-extrabold rounded-md">SAVE ৳{(product.price - effectivePrice).toLocaleString()}</span>
                </>
              )}
            </div>
            {!shop?.is_admin_shop && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Direct support from the seller
              </p>
            )}
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
              {effectiveStock > 0 ? (
                effectiveStock <= 5
                  ? <><span className="text-amber-600 font-bold">⚠ Only {effectiveStock} left!</span> order fast</>
                  : <>✓ In stock ({effectiveStock} units available)</>
              ) : <span className="text-rose-600 font-bold">✗ Out of Stock</span>}
            </p>
          </div>

          {/* Quantity + CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="p-3 hover:bg-slate-50 transition"><Minus className="w-4 h-4" /></button>
              <span className="px-5 py-3 font-bold text-sm border-x border-slate-200">{qty}</span>
              <button onClick={() => setQty(Math.min(effectiveStock, qty + 1))} disabled={qty >= effectiveStock}
                aria-label="Increase quantity" className="p-3 hover:bg-slate-50 transition disabled:opacity-30"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={needsSelection || effectiveStock === 0}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md ${
                added ? 'bg-emerald-600 shadow-emerald-100'
                  : needsSelection || effectiveStock === 0 ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-100 active:scale-[0.98]'}`}>
              <ShoppingCart className="w-4 h-4" />
              {added ? t('addedToCart') : t('addToCart')}
            </button>
            <button onClick={() => { handleAddToCart(); setTimeout(onGoToCart, 400); }} disabled={needsSelection || effectiveStock === 0}
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow-md disabled:bg-slate-300">
              {t('buyNow')}
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

      {/* Ratings & Reviews */}
      <section className="mt-12 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Ratings &amp; Reviews</h2>
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="font-extrabold text-slate-800">{product.rating}</span>
            <span className="text-slate-400">({product.reviews_count})</span>
          </div>
        </div>

        {currentUser && isLiveMode ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 mb-5">
            <p className="text-xs font-bold text-slate-700">{myReview ? 'Update your review' : 'Write a review'}</p>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setMyRating(i + 1)}
                  aria-label={`${i + 1} star${i ? 's' : ''}`}
                  className="p-0.5 transition hover:scale-110">
                  <Star className={`w-6 h-6 ${i < myRating ? 'text-amber-400 fill-current' : 'text-slate-300 fill-none'}`} />
                </button>
              ))}
            </div>
            <textarea rows={3} value={myComment} onChange={(e) => setMyComment(e.target.value)}
              placeholder={myReview?.comment || 'Share your experience with this product…'}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <ImagePlus className="w-3.5 h-3.5" /> {reviewImageUploading ? 'Uploading…' : 'Add photo'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReviewImage(e.target.files[0])} />
              </label>
              {reviewImageUrl && <img src={reviewImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border" />}
            </div>
            <button onClick={submitReview} disabled={savingReview}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition">
              {savingReview ? 'Saving…' : myReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        ) : (
          !isLiveMode ? null : (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-5 mb-5 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">Sign in to rate this product and write a review.</p>
              <button onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition shrink-0">
                Sign In
              </button>
            </div>
          )
        )}

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-xs font-extrabold text-slate-800">{r.user_name || 'Customer'}</p>
                  <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(r.rating) ? 'text-amber-400 fill-current' : 'text-slate-300 fill-none'}`} />
                  ))}
                </div>
                {r.comment && <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{r.comment}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => toggleHelpful(r.id)} className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${helpfulMap[r.id] ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    <ThumbsUp className="w-3 h-3" /> {t('helpful')} {helpfulMap[r.id] ? '· 1' : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          isLiveMode && <p className="text-xs text-slate-400">No reviews yet — be the first to review this product.</p>
        )}
      </section>

      {/* Q&A */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-brand-600" /> {t('qaTitle')}</h2>
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2">
            <input value={qaQuestion} onChange={(e) => setQaQuestion(e.target.value)} placeholder={t('askQuestion')} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button onClick={submitQuestion} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">Ask</button>
          </div>
          {qaList.length === 0 ? <p className="text-xs text-slate-400">No questions yet — be the first to ask about this product.</p> : (
            <div className="space-y-3">
              {qaList.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-slate-400" />{q.question}</p>
                  <p className="text-xs text-slate-500 mt-1">— {q.user_name} · {new Date(q.created_at).toLocaleDateString()}</p>
                  {q.answer ? <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2">Seller: {q.answer}</p> : <p className="mt-1 text-xs text-slate-400">Awaiting seller answer…</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
