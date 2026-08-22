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
const VendorDashboard = lazy(() =>
  import('./pages/VendorDashboard').then((m) => ({ default: m.VendorDashboard }))
);
const AdminPanel = lazy(() =>
  import('./pages/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

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
  'upload-product', 'checkout', 'order-confirmation', 'orders',
  'vendor-dashboard', 'admin-panel'
];

interface RouteState {
  page: string;
  params?: any;
}

/** Parse "#/page?id=..." from the URL (for fresh loads & footer anchor links) */
const routeFromLocation = (): RouteState => {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const page = KNOWN_PAGES.includes(path) ? path : 'home';
  const params: any = {};
  if (query) {
    const qs = new URLSearchParams(query);
    const id = qs.get('id');
    const shopId = qs.get('shopId');
    if (id) params.id = id;
    if (shopId) params.shopId = shopId;
  }
  return { page, params };
};

const Router: React.FC = () => {
  const { products, orders, cartCount } = useStore();
  const [route, setRoute] = useState<RouteState>(() => routeFromLocation());
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = (target: string, extra?: any) => {
    const params = extra || {};
    let url = `#/${target}`;
    if (target === 'product-detail' && params.product?.id) url += `?id=${params.product.id}`;
    if (target === 'shop-detail' && params.shopId) url += `?shopId=${params.shopId}`;
    try { window.history.pushState({ page: target, params }, '', url); } catch { /* noop */ }
    setRoute({ page: target, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back / forward support
  useEffect(() => {
    // Seed the very first entry so "back" from home doesn't leave a broken trail
    if (!window.history.state?.page) {
      const r = routeFromLocation();
      window.history.replaceState({ page: r.page, params: r.params }, '', window.location.hash || '#/home');
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

    const handleHash = () => {
      // Anchor links (e.g. footer "#/products") don't carry history state
      setRoute((prev) => {
        const next = routeFromLocation();
        if (next.page === prev.page && !next.params.id && !next.params.shopId) return prev;
        return next;
      });
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePop);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

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
        return <UploadProductPage onBack={() => navigate('vendor-dashboard')} />;

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

      case 'vendor-dashboard':
        return <VendorDashboard onNavigate={navigate} />;

      case 'admin-panel':
        return <AdminPanel onNavigate={navigate} />;

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
