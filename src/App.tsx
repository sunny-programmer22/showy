import React, { Suspense, lazy, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CategoryBar } from './components/CategoryBar';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Toaster } from './components/ui/Toast';
import { ConfirmDialogHost } from './components/ui/ConfirmDialog';
import { BottomNav } from './components/BottomNav';
import { Product, Order } from './types';
import { setSeo, setJsonLd, SITE_URL } from './lib/seo';
import { initPixel } from './lib/pixel';
import logo from './assets/logo.png';

/* ------------------------- Code-split route chunks ------------------------ */
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const ShopListPage = lazy(() =>
  import('./pages/ShopListPage').then((m) => ({ default: m.ShopListPage }))
);
const ShopStorefrontPage = lazy(() =>
  import('./pages/ShopStorefrontPage').then((m) => ({ default: m.ShopStorefrontPage }))
);
const CreateShopPage = lazy(() =>
  import('./pages/CreateShopPage').then((m) => ({ default: m.CreateShopPage }))
);
const UploadProductPage = lazy(() =>
  import('./pages/UploadProductPage').then((m) => ({ default: m.UploadProductPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage }))
);
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const VendorDashboard = lazy(() =>
  import('./pages/VendorDashboard').then((m) => ({ default: m.VendorDashboard }))
);
const AdminPanel = lazy(() =>
  import('./pages/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
/* Trust Pack — five static pages share ONE lazy chunk */
const AboutPage = lazy(() =>
  import('./pages/StaticPages').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/StaticPages').then((m) => ({ default: m.ContactPage }))
);
const FaqPage = lazy(() =>
  import('./pages/StaticPages').then((m) => ({ default: m.FaqPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/StaticPages').then((m) => ({ default: m.PrivacyPage }))
);
const TermsPage = lazy(() =>
  import('./pages/StaticPages').then((m) => ({ default: m.TermsPage }))
);
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/** Route-level Suspense fallback */
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow animate-pulse">
      <img src={logo} alt="" className="w-full h-full object-contain" />
    </div>
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Loading…</p>
  </div>
);

const KNOWN_PAGES = [
  'home', 'products', 'product-detail', 'shops', 'shop-detail', 'create-shop',
  'upload-product', 'checkout', 'order-confirmation', 'orders', 'wishlist', 'settings',
  'vendor-dashboard', 'admin-panel',
  'about', 'contact', 'faq', 'privacy', 'terms'
];

interface RouteState {
  page: string;
  params?: any;
}

/** Real, crawlable URL for each route (Google indexes these individually). */
const pathForRoute = (target: string, params: any = {}): string => {
  if (target === 'product-detail') return `/product/${params.product?.id ?? params.id ?? ''}`;
  if (target === 'shop-detail') return `/shop/${params.shopId ?? ''}`;
  const base =
    target === 'home' ? '/' : `/${target}`;
  if (target === 'upload-product' && params.productId) return `${base}?productId=${params.productId}`;
  if (target === 'order-confirmation' && params.order?.id) return `${base}?id=${params.order.id}`;
  return base;
};

/** Parse "/product/123?..." from the pathname (fresh loads, deep links & 404.html fallback). */
const routeFromLocation = (): RouteState => {
  const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);
  const params: any = {};
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get('id');
  const shopId = qs.get('shopId');
  const productId = qs.get('productId');
  if (id) params.id = id;
  if (shopId) params.shopId = shopId;
  if (productId) params.productId = productId;

  let page = 'home';
  const [first, second] = segments;
  if (first === 'product') {
    page = 'product-detail';
    if (second && !params.id) params.id = second;
  } else if (first === 'shop') {
    page = 'shop-detail';
    if (second && !params.shopId) params.shopId = second;
    page = first;
  }
  return { page, params };
};

const Router: React.FC = () => {
  const { products, shops, orders, cartCount } = useStore();
  const [route, setRoute] = useState<RouteState>(() => routeFromLocation());
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('showy_theme') === 'dark') document.documentElement.classList.add('dark');
    initPixel();
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) { localStorage.setItem('showy_referred_by', ref); }
  }, []);

  const navigate = (target: string, extra?: any) => {
    const params = extra || {};
    const url = pathForRoute(target, params);
    try { window.history.pushState({ page: target, params }, '', url); } catch { /* noop */ }
    setRoute({ page: target, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back / forward support
  useEffect(() => {
    // Seed the very first entry so "back" from home doesn't leave a broken trail
    if (!window.history.state?.page) {
      const r = routeFromLocation();
      window.history.replaceState({ page: r.page, params: r.params }, '', window.location.pathname + window.location.search);
    }

    const handlePop = (e: PopStateEvent) => {
      const s = e.state as RouteState | null;
      if (s && s.page && KNOWN_PAGES.includes(s.page)) {
        setRoute({ page: s.page, params: s.params || {} });
      } else {
        setRoute(routeFromLocation());
      }
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  /* ---------------- Per-route <title>, description & structured data ---------------- */
  const { page, params } = route;
  useEffect(() => {
    const product = params?.product || products.find((p) => p.id === params?.id);
    const shop = shops.find((s) => s.id === params?.shopId);
    switch (page) {
      case 'products': {
        const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
        const catText = cats.length > 0 ? ` Browse ${cats.slice(0, 6).join(', ')} and more.` : '';
        setSeo({
          title: 'All Products — Online Shopping in Bangladesh',
          description: `Buy from verified Bangladeshi sellers with bKash/Nagad OTP or cash on delivery.${catText}`,
          path: '/products'
        });
        setJsonLd('product', null);
        break;
      }
      case 'product-detail':
        if (product) {
          setSeo({
            title: `${product.title} — Buy Online in Bangladesh`,
            description: (product.description || `Buy ${product.title} at the best price in Bangladesh.`).slice(0, 155),
            path: `/product/${product.id}`
          });
          setJsonLd('product', {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            image: product.images.slice(0, 2),
            description: (product.description || '').slice(0, 500),
            category: product.category,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'BDT',
              price: String(product.discount_price ?? product.price),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `${SITE_URL}/product/${product.id}`
            }
          });
        }
        break;
      case 'shop-detail':
        if (shop) {
          setSeo({
            title: `${shop.name} — Verified Seller`,
            description: (shop.description || `Shop ${shop.name} on Showy — verified Bangladeshi seller with nationwide delivery.`).slice(0, 155),
            path: `/shop/${shop.id}`
          });
        }
        break;
      case 'shops':
        setSeo({ title: 'Explore Vendor Shops', description: 'Discover verified independent shops selling on Showy marketplace.', path: '/shops' });
        break;
      case 'about':
        setSeo({ title: 'About Us', description: "Showy is Bangladesh's multi-vendor marketplace — sellers keep 95% of every sale.", path: '/about' });
        break;
      case 'contact':
        setSeo({ title: 'Contact Us', description: 'Reach the Showy support team by email or hotline.', path: '/contact' });
        break;
      case 'faq':
        setSeo({ title: 'FAQ', description: 'Answers about ordering, payments, delivery, returns and selling on Showy.', path: '/faq' });
        break;
      case 'privacy':
        setSeo({ title: 'Privacy Policy', description: 'How Showy collects, uses and protects your personal data.', path: '/privacy' });
        break;
      case 'terms':
        setSeo({ title: 'Terms & Conditions', description: 'The rules governing use of the Showy marketplace.', path: '/terms' });
        break;
      case 'orders':
        setSeo({ title: 'My Orders & Invoices', description: 'Track your Showy orders and print invoices.', path: '/orders' });
        break;
      case 'wishlist':
        setSeo({ title: 'My Wishlist', description: 'Your saved products on Showy — get notified on restock and sale.', path: '/wishlist' });
        break;
      case 'settings':
        setSeo({ title: 'Settings', description: 'Manage your Showy account, address, language and appearance.', path: '/settings' });
        break;
      default:
        setSeo({
          title: 'Showy Store — Online Shopping Bangladesh | Multi-Vendor Marketplace',
          description: 'Shop jerseys, fashion, gadgets & more from verified Bangladeshi sellers on Showy. bKash/Nagad OTP checkout, cash on delivery nationwide. Open your own shop in minutes.',
          path: '/'
        });
    }
  }, [page, params?.id, params?.shopId, products.length, shops.length]);

  const renderPage = () => {
    const { page, params } = route;
    switch (page) {
      case 'home':
        return (
          <HomePage
            onSelectProduct={(p) => navigate('product-detail', { product: p })}
            onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })}
            onNavigate={navigate}
          />
        );

      case 'products':
        return (
          <ProductsPage
            onSelectProduct={(p) => navigate('product-detail', { product: p })}
            onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })}
          />
        );

      case 'product-detail': {
        // Restore from history state, or resolve by id on fresh/deep loads
        const product: Product | undefined =
          params.product ||
          products.find((p) => p.id === params.id) ||
          undefined;

        if (!product) {
          return (
            <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900">Product unavailable</h2>
              <p className="text-sm text-slate-500">This product could not be loaded. It may have been removed.</p>
              <button onClick={() => navigate('products')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition">
                Browse All Products
              </button>
            </div>
          );
        }
        return (
          <ProductDetailPage
            key={product.id}
            product={product}
            onBack={() => window.history.length > 1 ? window.history.back() : navigate('products')}
            onSelectProduct={(p) => navigate('product-detail', { product: p })}
            onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })}
            onGoToCart={() => setCartOpen(true)}
          />
        );
      }

      case 'shops':
        return <ShopListPage onSelectShop={(id) => navigate('shop-detail', { shopId: id })} onNavigate={navigate} />;

      case 'shop-detail':
        return (
          <ShopStorefrontPage
            key={params.shopId || params.id}
            shopId={params.shopId || params.id}
            onBack={() => window.history.length > 1 ? window.history.back() : navigate('shops')}
            onSelectProduct={(p: Product) => navigate('product-detail', { product: p })}
            onNavigateToShop={(id) => navigate('shop-detail', { shopId: id })}
          />
        );

      case 'create-shop':
        return (
          <CreateShopPage
            onBack={() => navigate('home')}
            onCreated={() => navigate('vendor-dashboard')}
          />
        );

      case 'upload-product':
        return <UploadProductPage key={params.productId || 'new'} onBack={() => navigate('vendor-dashboard')} editProductId={params.productId} />;

      case 'checkout':
        return (
          <CheckoutPage
            onBack={() => window.history.length > 1 ? window.history.back() : navigate('products')}
            onOrderPlaced={(order: Order) => navigate('order-confirmation', { order })}
          />
        );

      case 'order-confirmation': {
        const order: Order | undefined =
          params.order ||
          orders.find((o) => o.id === params.id) ||
          undefined;
        return (
          <OrderConfirmationPage
            order={order}
            onGoHome={() => navigate('home')}
            onViewOrders={() => navigate('orders')}
          />
        );
      }

      case 'orders':
        return <OrdersPage onBack={() => navigate('home')} />;

      case 'wishlist':
        return <WishlistPage onSelectProduct={(p) => navigate('product-detail', { product: p })} onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })} onNavigate={navigate} />;

      case 'settings':
        return <SettingsPage />;

      case 'vendor-dashboard':
        return <VendorDashboard onNavigate={navigate} />;

      case 'admin-panel':
        return <AdminPanel onNavigate={navigate} />;

      case 'about':
        return <AboutPage onBack={() => window.history.length > 1 ? window.history.back() : navigate('home')} onNavigate={navigate} />;

      case 'contact':
        return <ContactPage onBack={() => window.history.length > 1 ? window.history.back() : navigate('home')} />;

      case 'faq':
        return <FaqPage onBack={() => window.history.length > 1 ? window.history.back() : navigate('home')} />;

      case 'privacy':
        return <PrivacyPage onBack={() => window.history.length > 1 ? window.history.back() : navigate('home')} />;

      case 'terms':
        return <TermsPage onBack={() => window.history.length > 1 ? window.history.back() : navigate('home')} />;

      default:
        return <HomePage
          onSelectProduct={(p) => navigate('product-detail', { product: p })}
          onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })}
          onNavigate={navigate}
        />;
    }
  };

  // CategoryBar only shows on shopping-related pages
  const showCategoryBar = ['home', 'products'].includes(route.page);

  return (
    /* Bottom padding clears the mobile bottom nav (+ iOS safe area) */
    <div className="min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigate}
        activePage={route.page}
      />
      {showCategoryBar && (
        <CategoryBar onSelectCategory={() => route.page === 'home' && navigate('products')} />
      )}

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />

      {/* Global Drawers & Modals */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => navigate('checkout')} />
      <AuthModal />

      {/* Global feedback & mobile nav */}
      <BottomNav
        activePage={route.page}
        cartCount={cartCount}
        onNavigate={navigate}
        onOpenCart={() => setCartOpen(true)}
      />
      <Toaster />
      <ConfirmDialogHost />
    </div>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <Router />
  </StoreProvider>
);

export default App;
