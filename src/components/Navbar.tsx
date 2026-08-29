import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import {
  ShoppingBag,
  Search,
  Store,
  PlusCircle,
  User,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Package,
  Settings,
  Heart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLang } from '../lib/i18n';
import logo from '../assets/logo.png';

interface NavbarProps {
  onOpenCart: () => void;
  onNavigate: (page: string, params?: any) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onNavigate, activePage }) => {
  const {
    currentUser,
    logout,
    cartCount,
    wishlistCount,
    products,
    searchQuery,
    setSearchQuery,
    shops,
    setAuthModalOpen,
    isLiveMode
  } = useStore() as any;
  const { lang, toggleLang, t } = useLang();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // Check if current user already owns a shop
  const userShop = currentUser ? shops.find((s: any) => s.owner_id === currentUser.id) : null;

  const q = searchQuery.trim().toLowerCase();
  const [serverAuto, setServerAuto] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!isLiveMode || !supabase || q.length < 2) { setServerAuto(null); return; }
    const t = setTimeout(async () => {
      const { data } = await (supabase!.rpc as any)('search_products', { q });
      if (data && data.length) setServerAuto(data as Product[]);
      else setServerAuto(null);
    }, 300);
    return () => clearTimeout(t);
  }, [q, isLiveMode]);
  const autoProducts = q.length >= 2 ? products.filter((p: Product) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 5) : [];
  const autoShops = q.length >= 2 ? shops.filter((s: any) => s.name.toLowerCase().includes(q)).slice(0, 3) : [];
  const displayProducts = serverAuto ?? autoProducts;
  const hasAutocomplete = showAutocomplete && q.length >= 2 && (displayProducts.length > 0 || autoShops.length > 0);
  useEffect(() => { if (!hasAutocomplete) setActiveIdx(-1); }, [hasAutocomplete]);
  const handleAutocompleteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = displayProducts.length + autoShops.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((prev) => (prev + 1) % total); setShowAutocomplete(true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((prev) => (prev - 1 + total) % total); }
    else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      if (activeIdx < displayProducts.length) { const p = displayProducts[activeIdx]; onNavigate('product-detail', { product: p }); }
      else { const s = autoShops[activeIdx - displayProducts.length]; onNavigate('shop-detail', { shopId: s.id }); }
      setShowAutocomplete(false); setActiveIdx(-1);
    } else if (e.key === 'Escape') { setShowAutocomplete(false); setActiveIdx(-1); (e.target as HTMLInputElement).blur(); }
  };
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsUserDropdownOpen(false); setIsMobileMenuOpen(false); setShowAutocomplete(false); } };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAutocomplete(false);
    onNavigate('products');
  };

  return (
    <>
      <header className="fixed top-4 sm:top-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-[min(1120px,96vw)]">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-left group shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src={logo} alt="Showy Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
                Showy
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mt-0.5 hidden sm:block">
                Multi-Vendor Hub
              </span>
            </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative" onBlur={() => setTimeout(() => setShowAutocomplete(false), 180)}>
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onFocus={() => setShowAutocomplete(true)}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAutocomplete(true); }}
              onKeyDown={handleAutocompleteKeyDown}
              aria-label={t('search')}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={hasAutocomplete}
              aria-controls="search-autocomplete-list"
              aria-activedescendant={activeIdx >= 0 ? `search-option-${activeIdx}` : undefined}
              autoComplete="off"
                className="w-full pl-10 pr-20 py-2 bg-slate-100/90 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/60 text-sm rounded-full border border-slate-200/70 shadow-inner transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full transition"
            >
              Search
            </button>
            {hasAutocomplete && (
              <div id="search-autocomplete-list" role="listbox" className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-lift overflow-hidden z-50 max-h-[360px] overflow-y-auto">
                {displayProducts.length > 0 && (
                  <div className="p-2" role="group" aria-label="Products">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1" aria-hidden="true">Products</p>
                    {displayProducts.map((p: any, i: number) => (
                      <button key={p.id} type="button" role="option" id={`search-option-${i}`} aria-selected={activeIdx === i} onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('product-detail', { product: p }); setShowAutocomplete(false); }}
                        className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded-xl transition ${activeIdx === i ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.title}</p>
                          <p className="text-xs text-slate-500 truncate">৳{(p.discount_price ?? p.price).toLocaleString()} • {p.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {autoShops.length > 0 && (
                  <div className="p-2 border-t border-slate-100" role="group" aria-label="Shops">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1" aria-hidden="true">Shops</p>
                    {autoShops.map((s: any, j: number) => (
                      <button key={s.id} type="button" role="option" id={`search-option-${displayProducts.length + j}`} aria-selected={activeIdx === displayProducts.length + j} onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('shop-detail', { shopId: s.id }); setShowAutocomplete(false); }}
                        className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-xl transition ${activeIdx === displayProducts.length + j ? 'bg-emerald-50' : 'hover:bg-emerald-50'}`}>
                        <img src={s.logo_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setShowAutocomplete(false); onNavigate('products'); }}
                  className="w-full text-center py-2.5 text-xs font-bold text-brand-600 hover:bg-brand-50 border-t border-slate-100">
                  See all results for "{q}" →
                </button>
              </div>
            )}
          </form>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('products')}
              className={`link-underline hover:text-brand-600 transition ${activePage === 'products' ? 'is-active text-brand-600 font-bold' : ''}`}
            >
              All Products
            </button>

            <button
              onClick={() => onNavigate('shops')}
              className={`link-underline flex items-center space-x-1 hover:text-brand-600 transition ${activePage === 'shops' ? 'is-active text-brand-600 font-bold' : ''}`}
            >
              <Store className="w-4 h-4" />
              <span>Explore Shops</span>
            </button>

            {userShop ? (
              <button
                onClick={() => onNavigate('vendor-dashboard')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:-translate-y-px rounded-lg border border-emerald-200/80 transition font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Shop Panel</span>
              </button>
            ) : (
              currentUser && (
                <button
                  onClick={() => onNavigate('create-shop')}
                  className="btn-shine flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-cta transition font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Open Your Shop</span>
                </button>
              )
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-panel')}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:-translate-y-px rounded-lg border border-purple-200/80 transition font-bold"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* User Controls & Cart */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0">
            {/* Language toggle EN / বাং */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label="Switch language"
              title="English / বাংলা"
              className="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-extrabold text-slate-700 transition shrink-0 flex items-center justify-center"
            >
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>

            <button
              onClick={() => onNavigate('settings')}
              aria-label="Settings"
              title="Settings"
              className={`p-2 rounded-xl border transition shrink-0 ${activePage === 'settings' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentUser ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User menu"
                  aria-haspopup="menu"
                  aria-expanded={isUserDropdownOpen}
                  aria-controls="user-menu"
                  className="flex items-center gap-1.5 pl-1 pr-1.5 sm:pl-1.5 sm:pr-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold uppercase ${
                    currentUser.role === 'admin' ? 'bg-purple-600'
                    : currentUser.role === 'vendor' ? 'bg-emerald-600'
                    : 'bg-brand-600'
                  }`}>
                    {(currentUser.full_name || currentUser.email)[0]}
                  </span>
                  <span className="hidden sm:block text-xs font-bold text-slate-700 max-w-[90px] truncate">
                    {currentUser.full_name || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {isUserDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                    <div id="user-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lift border border-slate-200/60 py-1.5 z-50 text-xs animate-pop-in origin-top-right">
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <p className="font-extrabold text-slate-800 truncate">{currentUser.full_name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                          currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'vendor' ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>

                      <button onClick={() => { onNavigate('orders'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-400" /> My Orders
                      </button>

                      <button onClick={() => { onNavigate('settings'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                      </button>

                      {userShop && (
                        <button onClick={() => { onNavigate('vendor-dashboard'); setIsUserDropdownOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 font-semibold text-emerald-700 flex items-center gap-2">
                          <LayoutDashboard className="w-3.5 h-3.5" /> Vendor Dashboard
                        </button>
                      )}

                      {!userShop && (
                        <button onClick={() => { onNavigate('create-shop'); setIsUserDropdownOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-brand-50 font-semibold text-brand-700 flex items-center gap-2">
                          <PlusCircle className="w-3.5 h-3.5" /> Open a Shop
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button onClick={() => { onNavigate('admin-panel'); setIsUserDropdownOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50 font-semibold text-purple-700 flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
                        </button>
                      )}

                      <button onClick={async () => { await logout(); setIsUserDropdownOpen(false); onNavigate('home'); }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 font-semibold text-rose-600 flex items-center gap-2 border-t border-slate-100 mt-1">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest sign-in button */
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-shine flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl transition shadow-cta"
              >
                <User className="w-3.5 h-3.5" /> {t('signIn')}
              </button>
            )}

            <button type="button" onClick={() => onNavigate('wishlist')} className="relative min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition" title="Wishlist" aria-label={`Wishlist, ${wishlistCount} items`}>
              <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[18px] px-1 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Cart, ${cartCount} items`}
              className="relative min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
            >
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation" className="fixed top-[88px] inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 w-auto sm:w-[min(1120px,96vw)] lg:hidden bg-white/85 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] p-4 space-y-3 text-sm shadow-[0_16px_48px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-up">
          <form onSubmit={handleSearchSubmit} className="relative" onBlur={() => setTimeout(() => setShowAutocomplete(false), 180)}>
            <input
              type="text"
              placeholder="Search products or shops..."
              value={searchQuery}
              onFocus={() => setShowAutocomplete(true)}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAutocomplete(true); }}
              onKeyDown={handleAutocompleteKeyDown}
              aria-label="Search products and shops"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={hasAutocomplete}
              aria-controls="search-autocomplete-list-mobile"
              aria-activedescendant={activeIdx >= 0 ? `search-option-mobile-${activeIdx}` : undefined}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
            {hasAutocomplete && (
              <div id="search-autocomplete-list-mobile" role="listbox" className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-lift overflow-hidden z-50 max-h-[320px] overflow-y-auto">
                {displayProducts.length > 0 && (
                  <div className="p-2" role="group" aria-label="Products">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1" aria-hidden="true">Products</p>
                    {displayProducts.map((p: any, i: number) => (
                      <button key={p.id} type="button" role="option" id={`search-option-mobile-${i}`} aria-selected={activeIdx === i} onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('product-detail', { product: p }); setShowAutocomplete(false); setIsMobileMenuOpen(false); }}
                        className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded-xl ${activeIdx === i ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                        <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-sm font-bold text-slate-800 truncate">{p.title}</span>
                      </button>
                    ))}
                  </div>
                )}
                {autoShops.length > 0 && (
                  <div className="p-2 border-t border-slate-100" role="group" aria-label="Shops">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1" aria-hidden="true">Shops</p>
                    {autoShops.map((s: any, j: number) => (
                      <button key={s.id} type="button" role="option" id={`search-option-mobile-${displayProducts.length + j}`} aria-selected={activeIdx === displayProducts.length + j} onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('shop-detail', { shopId: s.id }); setShowAutocomplete(false); setIsMobileMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-2 py-2 hover:bg-emerald-50 rounded-xl">
                        <img src={s.logo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm font-bold text-slate-700 truncate">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100 font-medium">
            {!currentUser && (
              <button
                onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                className="text-left py-2 text-brand-600 font-bold flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In / Create Account
              </button>
            )}
            <button onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-brand-600">
              All Products
            </button>
            <button onClick={() => { onNavigate('shops'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-brand-600 flex items-center gap-2">
              <Store className="w-4 h-4" /> Explore Shops
            </button>
            {currentUser && (
              <button onClick={() => { onNavigate('orders'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-brand-600 flex items-center gap-2">
                <Package className="w-4 h-4" /> My Orders
              </button>
            )}
            {currentUser && (
              <button onClick={() => { onNavigate('settings'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-brand-600 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </button>
            )}
            {userShop ? (
              <button onClick={() => { onNavigate('vendor-dashboard'); setIsMobileMenuOpen(false); }} className="text-left py-2 text-emerald-600 font-bold flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> My Shop Dashboard
              </button>
            ) : (
              currentUser && (
                <button onClick={() => { onNavigate('create-shop'); setIsMobileMenuOpen(false); }} className="text-left py-2 text-brand-600 font-bold flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Create Your Shop
                </button>
              )
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={() => { onNavigate('admin-panel'); setIsMobileMenuOpen(false); }} className="text-left py-2 text-purple-700 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Admin Panel
              </button>
            )}
            {currentUser && (
              <button onClick={async () => { await logout(); setIsMobileMenuOpen(false); onNavigate('home'); }} className="text-left py-2 text-rose-600 font-bold flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
