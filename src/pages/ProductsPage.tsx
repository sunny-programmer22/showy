import React, { useMemo, useEffect, useState } from 'react';
import { SearchX, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Product } from '../types';

interface ProductsPageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
}

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export const ProductsPage: React.FC<ProductsPageProps> = ({ onSelectProduct, onNavigateToShop }) => {
  const {
    products, searchQuery, setSearchQuery,
    selectedCategory, selectedShopId, priceRange, isLoading,
    inStockOnly, minRating, sortBy, setSortBy, isLiveMode
  } = useStore() as any;
  const dataLoading = isLoading && products.length === 0;
  const [serverHits, setServerHits] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!isLiveMode || !supabase || searchQuery.trim().length < 2) { setServerHits(null); return; }
    const t = setTimeout(async () => {
      const { data, error } = await (supabase!.rpc as any)('search_products', { q: searchQuery });
      if (!error && data && data.length) setServerHits(data as Product[]);
      else setServerHits(null);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, isLiveMode]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (selectedShopId !== 'all') params.set('shop', selectedShopId);
    if (priceRange[1] !== 50000) params.set('max', String(priceRange[1]));
    if (searchQuery) params.set('q', searchQuery);
    if (inStockOnly) params.set('stock', '1');
    if (minRating) params.set('rating', String(minRating));
    if (sortBy !== 'popular') params.set('sort', sortBy);
    const qs = params.toString();
    const url = qs ? `/products?${qs}` : '/products';
    window.history.replaceState({}, '', url);
  }, [selectedCategory, selectedShopId, priceRange, searchQuery, inStockOnly, minRating, sortBy]);

  const filtered = useMemo(() => {
    let list = serverHits ? [...serverHits] : [...products];

    // Search filter (title, tags, category) — skipped when server search active
    if (!serverHits && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') list = list.filter((p) => p.category === selectedCategory);

    // Shop filter
    if (selectedShopId !== 'all') list = list.filter((p) => p.shop_id === selectedShopId);

    // Price range (uses effective price)
    list = list.filter((p) => (p.discount_price ?? p.price) <= priceRange[1]);

    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (minRating) list = list.filter((p) => p.rating >= minRating);

    // Sorting
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price)); break;
      case 'price-desc': list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price)); break;
      case 'newest': list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => b.reviews_count * b.rating - a.reviews_count * a.rating);
    }

    return list.filter((p) => p.is_active);
  }, [products, serverHits, searchQuery, selectedCategory, selectedShopId, priceRange, sortBy, inStockOnly, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-32">
          <FilterSidebar />
        </aside>

        {/* Catalog */}
        <div className="flex-1 w-full space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                <strong className="text-slate-700">{filtered.length}</strong> product(s) found across all vendor shops
              </p>
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm">
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {filtered.length === 0 && !dataLoading ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300">
              <EmptyState
                icon={searchQuery ? SearchX : PackageSearch}
                title={searchQuery ? `No matches for "${searchQuery}"` : 'No products match these filters'}
                description={
                  searchQuery
                    ? 'Try a different keyword, or clear the search to browse everything.'
                    : 'Try widening your price range or clearing a category/shop filter.'
                }
                actionLabel={searchQuery ? 'Clear search' : undefined}
                onAction={searchQuery ? () => setSearchQuery('') : undefined}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {dataLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filtered.map((p) => (
                    <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
