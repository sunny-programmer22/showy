import React from 'react';
import { Home, LayoutGrid, ShoppingCart, Store, Package } from 'lucide-react';
import { useLang, StringKey } from '../lib/i18n';

interface BottomNavProps {
  activePage: string;
  cartCount: number;
  onNavigate: (page: string) => void;
  onOpenCart: () => void;
}

interface Tab {
  key: string;
  labelKey: StringKey;
  icon: typeof Home;
  match: string[];
}

const TABS: Tab[] = [
  { key: 'home', labelKey: 'home', icon: Home, match: ['home'] },
  { key: 'products', labelKey: 'browse', icon: LayoutGrid, match: ['products', 'product-detail'] },
  { key: '__cart', labelKey: 'cart', icon: ShoppingCart, match: [] },
  { key: 'shops', labelKey: 'shops', icon: Store, match: ['shops', 'shop-detail'] },
  { key: 'orders', labelKey: 'orders', icon: Package, match: ['orders', 'order-confirmation'] }
];

/** Mobile-only bottom tab bar (desktop keeps the top navbar). */
export const BottomNav: React.FC<BottomNavProps> = ({
  activePage,
  cartCount,
  onNavigate,
  onOpenCart,
}) => {
  const { t } = useLang();
  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-200/70 shadow-[0_-8px_24px_-16px_rgb(15_23_42/0.25)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const { key, labelKey, icon: Icon, match } = tab;
          const label = t(labelKey);
          const isCart = key === '__cart';
          const active = !isCart && match.includes(activePage);
        return (
          <button
            key={key}
            onClick={() => (isCart ? onOpenCart() : onNavigate(key))}
            aria-current={active ? 'page' : undefined}
            aria-label={isCart ? `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}` : label}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="relative">
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm animate-pop-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
          {active && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-brand-500" />
          )}
        </button>
      );
      })}
      </div>
    </nav>
  );
};
