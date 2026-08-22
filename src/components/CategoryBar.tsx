import React from 'react';
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  ShoppingBag,
  Grid
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { useStore } from '../context/StoreContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-4 h-4" />,
  Shirt: <Shirt className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />
};

export const CategoryBar: React.FC<{ onSelectCategory?: (slug: string) => void }> = ({ onSelectCategory }) => {
  const { selectedCategory, setSelectedCategory, products } = useStore();

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    if (onSelectCategory) onSelectCategory(slug);
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {/* All Categories Pill */}
          <button
            onClick={() => handleCategoryClick('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>All Categories</span>
            <span className="ml-1 text-[10px] bg-slate-200/40 px-1.5 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>

          {/* Dynamic Category Pills */}
          {INITIAL_CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{ICON_MAP[cat.icon]}</span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
