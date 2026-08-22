import React, { useMemo } from 'react';
import { SearchX, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ProductsPageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: (shopId: string) => void;
}

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export const ProductsPage: React.FC<ProductsPageProps> = ({ onSelectProduct, onNavigateToShop }) => {
  const {
    products, searchQuery, setSearchQuery,
    selectedCategory, selectedShopId, priceRange
  } = useStore();
  const [sortBy, setSortBy] = React.useState<SortKey>('popular');

  const filtered = useMemo(() => {
    let list = [...products];

    // Search filter (title, tags, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') list = list.filter((p) => p.category === selectedCategory);

    // Shop filter
    if (selectedShopId !== 'all') list = list.filter((p) => p.shop_id === selectedShopId);

    // Price range (uses effective price)
    list = list.filter((p) => (p.discount_price ?? p.price) <= priceRange[1]);

    // Sorting
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price)); break;
      case 'price-desc': list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price)); break;
      case 'newest': list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => b.reviews_count * b.rating - a.reviews_count * a.rating);
    }

    return list.filter((p) => p.is_active);
  }, [products, searchQuery, selectedCategory, selectedShopId, priceRange, sortBy]);

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

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
              {searchQuery ? (
                <>
                  <SearchX className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600">No matches for "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-extrabold text-brand-600 hover:underline">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <PackageSearch className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600">No products match these filters</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onNavigateToShop={onNavigateToShop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
