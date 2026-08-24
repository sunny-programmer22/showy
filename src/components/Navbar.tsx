import React, { useState } from 'react';
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
    setAuthModalOpen
  } = useStore();
  const { lang, toggleLang, t } = useLang();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Check if current user already owns a shop
  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;

  const q = searchQuery.trim().toLowerCase();
  const autoProducts = q.length >= 2 ? products.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 5) : [];
  const autoShops = q.length >= 2 ? shops.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3) : [];
  const hasAutocomplete = showAutocomplete && q.length >= 2 && (autoProducts.length > 0 || autoShops.length > 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAutocomplete(false);
    onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-900/5 shadow-soft">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-700 to-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        <span>
          Multi-Vendor Marketplace
          <span className="hidden sm:inline"> • Create Your Own Shop Today!</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
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
                className="w-full pl-10 pr-20 py-2 bg-slate-100/90 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/60 text-sm rounded-full border border-slate-200/70 shadow-inner transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full transition"
            >
              Search
            </button>
            {hasAutocomplete && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-lift overflow-hidden z-50 max-h-[360px] overflow-y-auto">
                {autoProducts.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1">Products</p>
                    {autoProducts.map((p) => (
                      <button key={p.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('product-detail', { product: p }); setShowAutocomplete(false); }}
                        className="w-full text-left flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-xl transition">
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
                  <div className="p-2 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1">Shops</p>
                    {autoShops.map((s) => (
                      <button key={s.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onNavigate('shop-detail', { shopId: s.id }); setShowAutocomplete(false); }}
                        className="w-full text-left flex items-center gap-2 px-2 py-2 hover:bg-emerald-50 rounded-xl transition">
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
              onClick={toggleLang}
              aria-label="Switch language"
              title="English / বাংলা"
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-extrabold text-slate-700 transition shrink-0"
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
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
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
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lift border border-slate-200/60 py-1.5 z-50 text-xs animate-pop-in origin-top-right">
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

            <button onClick={() => onNavigate('wishlist')} className="relative p-1.5 sm:p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition" title="Wishlist" aria-label="Wishlist">
              <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[18px] px-1 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass border-b border-slate-200/60 px-4 pt-2 pb-4 space-y-3 text-sm animate-fade-up shadow-soft">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products or shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm rounded-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
    </header>
  );
};
