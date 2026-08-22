import React, { useState } from 'react';
import { Package, ArrowLeft, Plus, X, ImagePlus, Save, Tag, Loader2, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { uploadImage } from '../lib/api';
import { toast } from '../components/ui/Toast';
import { NewProductVariant } from '../types';

interface UploadProductPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const UploadProductPage: React.FC<UploadProductPageProps> = ({ onBack }) => {
  const { currentUser, shops, addProduct } = useStore();
  const myShop = shops.find((s) => s.owner_id === currentUser?.id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: INITIAL_CATEGORIES[0].slug,
    subcategory: INITIAL_CATEGORIES[0].subcategories[0],
    price: '',
    discount_price: '',
    stock: '10',
    is_featured: false,
    is_returnable: true
  });

  interface VariantRow { value: string; price: string; stock: string; }
  const [optionName, setOptionName] = useState('Size');
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const [images, setImages] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedCat = INITIAL_CATEGORIES.find((c) => c.slug === form.category);

  if (!myShop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">No shop found for your account</h1>
        <p className="text-sm text-slate-500">You need to create a shop first before uploading products.</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition">
          Go Back Home
        </button>
      </div>
    );
  }

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleImageFile = async (file: File, index: number) => {
    if (!currentUser) return;
    try {
      const url = await uploadImage(file, currentUser.id);
      setImages((prev) => prev.map((x, j) => (j === index ? url : x)));
    } catch (e: any) {
      toast.error(`Image upload failed: ${e.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      toast.error('Product title and regular price are required.');
      return;
    }
    setBusy(true);
    try {
      const newVariants: NewProductVariant[] = variantRows
        .filter((r) => r.value.trim() !== '')
        .map((r, i) => ({
          option_name: optionName.trim() || 'Size',
          option_value: r.value.trim(),
          price: r.price.trim() === '' ? null : Number(r.price),
          stock: r.stock.trim() === '' ? 0 : Math.max(0, Number(r.stock)),
          sort_order: i
        }));

      await addProduct({
        shop_id: myShop.id,
        title: form.title.trim(),
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        tags,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : undefined,
        stock: Number(form.stock),
        images: images.filter((img) => img.trim() !== ''),
        is_featured: form.is_featured,
        is_returnable: form.is_returnable,
        is_active: true
      }, newVariants);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onBack();
      }, 1600);
    } catch (err: any) {
      toast.error(`Could not publish product: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelCls = 'text-xs font-bold text-slate-700 uppercase tracking-wide';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="space-y-1.5 mb-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Package className="w-8 h-8 text-brand-600" /> Upload New Product
        </h1>
        <p className="text-sm text-slate-500">
          Listing to shop: <strong className="text-emerald-700">{myShop.name}</strong>
          {myShop.is_admin_shop ? (
            <span className="ml-1 text-purple-700">(Flagship — you keep 100%)</span>
          ) : (
            <span className="ml-1 text-emerald-700">(95% net revenue share)</span>
          )}
        </p>
      </div>

      {success && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-pulse">
          <Save className="w-4 h-4" /> Product published to the marketplace! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-lg p-7 space-y-6">
        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Basic Information</h3>

          <div className="space-y-1">
            <label className={labelCls}>Product Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Wireless Gaming Mouse RGB Pro" className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe features, materials, warranty..." className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Category</label>
              <select value={form.category}
                onChange={(e) => {
                  const cat = INITIAL_CATEGORIES.find((c) => c.slug === e.target.value);
                  setForm({ ...form, category: e.target.value, subcategory: cat?.subcategories[0] || '' });
                }}
                className={inputCls}>
                {INITIAL_CATEGORIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Subcategory</label>
              <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className={inputCls}>
                {selectedCat?.subcategories.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Pricing & Inventory</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Regular Price (৳) *</label>
              <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={`${labelCls} text-rose-600`}>Sale Price (৳)</label>
              <input type="number" min="0" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} placeholder="1999" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Stock Qty</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
            </div>
          </div>

          {form.price !== '' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <p className="font-bold text-slate-600 uppercase tracking-wide text-[10px] mb-1">Your Earnings Preview (per unit)</p>
              {!myShop.is_admin_shop ? (
                <>
                  <div className="flex justify-between text-slate-600"><span>Sale Price</span><span>৳{Number(form.discount_price || form.price).toLocaleString()}</span></div>
                  <div className="flex justify-between text-rose-600"><span>Platform Commission (5%)</span><span>-৳{(Number(form.discount_price || form.price) * 0.05).toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200"><span>Your Net Earnings</span><span>৳{(Number(form.discount_price || form.price) * 0.95).toFixed(2)}</span></div>
                </>
              ) : (
                <div className="flex justify-between font-bold text-purple-700"><span>You Keep (Admin Store — No Fee)</span><span>৳{Number(form.discount_price || form.price).toLocaleString()}</span></div>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer w-fit">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 accent-brand-600" />
            Feature this product on homepage
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer w-fit">
            <input type="checkbox" checked={form.is_returnable} onChange={(e) => setForm({ ...form, is_returnable: e.target.checked })}
              className="w-4 h-4 accent-emerald-600" />
            Accept returns (shows a 7-day return badge — uncheck for final sale)
          </label>
        </section>

        {/* Size / Variant Options */}
        <section className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-brand-600" /> Size / Variant Options <span className="normal-case font-medium text-slate-400 text-[11px]">(optional)</span>
          </h3>
          <p className="text-xs text-slate-500 -mt-1">
            Selling apparel or shoes? Add options like S / M / L, each with its own stock and optional price. Buyers must pick one before adding to cart.
          </p>

          {variantRows.length > 0 && (
            <div className="grid grid-cols-[7rem_1fr] sm:grid-cols-[9rem_1fr_1fr_1fr_auto] gap-2 items-center">
              <input type="text" value={optionName} onChange={(e) => setOptionName(e.target.value)}
                placeholder="Option name" aria-label="Option name (e.g. Size)"
                className={`${inputCls} py-2 text-xs font-bold`} />
              {variantRows.map((row, i) => (
                <React.Fragment key={i}>
                  {/* On mobile the option-name cell only renders on the first row */}
                  {i > 0 && <span className="sm:hidden" aria-hidden="true" />}
                  <input type="text" value={row.value}
                    onChange={(e) => setVariantRows(variantRows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
                    placeholder={i === 0 ? 'Value (e.g. M)' : 'Value'} aria-label={`Option ${i + 1} value`}
                    className={`${inputCls} py-2`} />
                  <div className="col-span-2 grid grid-cols-2 gap-2 sm:contents">
                    <input type="number" min="0" step="0.01" value={row.price}
                      onChange={(e) => setVariantRows(variantRows.map((r, j) => (j === i ? { ...r, price: e.target.value } : r)))}
                      placeholder="Price ৳ (blank = base)" aria-label={`Option ${i + 1} price override`}
                      className={`${inputCls} py-2`} />
                    <input type="number" min="0" value={row.stock}
                      onChange={(e) => setVariantRows(variantRows.map((r, j) => (j === i ? { ...r, stock: e.target.value } : r)))}
                      placeholder="Stock qty" aria-label={`Option ${i + 1} stock`}
                      className={`${inputCls} py-2`} />
                  </div>
                  <button type="button" onClick={() => setVariantRows(variantRows.filter((_, j) => j !== i))}
                    aria-label={`Remove option ${i + 1}`}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"><X className="w-4 h-4" /></button>
                </React.Fragment>
              ))}
            </div>
          )}

          <button type="button" onClick={() => setVariantRows([...variantRows, { value: '', price: '', stock: '' }])}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold rounded-lg transition">
            <Plus className="w-3.5 h-3.5" /> Add Option
          </button>
        </section>

        {/* Images — file upload or URL */}
        <section className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Product Images</h3>
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="w-5 h-5 text-slate-300" />}
              </div>
              <input type="url" value={img}
                onChange={(e) => setImages(images.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="Paste image URL…" className={`${inputCls} py-2.5`} />
              <label className="p-2.5 bg-slate-100 hover:bg-slate-200 cursor-pointer rounded-xl transition shrink-0" title="Upload from device">
                <ImagePlus className="w-4 h-4 text-slate-600" />
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], i)} />
              </label>
              {images.length > 1 && (
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"><X className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setImages([...images, ''])}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition">
            <Plus className="w-3.5 h-3.5" /> Add Another Image
          </button>
        </section>

        {/* Tags */}
        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Search Tags</h3>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Type tag & press Enter" className={`${inputCls} py-2.5`} />
            <button type="button" onClick={handleAddTag}
              className="px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition shrink-0"><Tag className="w-4 h-4" /></button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold rounded-full">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">Cancel</button>
          <button type="submit" disabled={busy}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-brand-100 flex items-center justify-center gap-2">
            {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>) : (<><Plus className="w-4 h-4" /> Publish Product</>)}
          </button>
        </div>
      </form>
    </div>
  );
};
