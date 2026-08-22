import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CategoryBar } from './components/CategoryBar';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShopListPage } from './pages/ShopListPage';
import { ShopStorefrontPage } from './pages/ShopStorefrontPage';
import { CreateShopPage } from './pages/CreateShopPage';
import { UploadProductPage } from './pages/UploadProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { Product, Order } from './types';
import logo from './assets/logo.png';

const Router: React.FC = () => {
  const { isLoading } = useStore();
  const [page, setPage] = useState('home');
  const [params, setParams] = useState<any>({});
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = (target: string, extra?: any) => {
    setParams(extra || {});
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
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

      case 'product-detail':
        return (
          <ProductDetailPage
            key={params.product?.id}
            product={params.product}
            onBack={() => navigate('products')}
            onSelectProduct={(p) => navigate('product-detail', { product: p })}
            onNavigateToShop={(shopId) => navigate('shop-detail', { shopId })}
            onGoToCart={() => setCartOpen(true)}
          />
        );

      case 'shops':
        return <ShopListPage onSelectShop={(id) => navigate('shop-detail', { shopId: id })} onNavigate={navigate} />;

      case 'shop-detail':
        return (
          <ShopStorefrontPage
            key={params.shopId}
            shopId={params.shopId}
            onBack={() => navigate('shops')}
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
            onBack={() => navigate('products')}
            onOrderPlaced={(order: Order) => navigate('order-confirmation', { order })}
          />
        );

      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            order={params.order}
            onGoHome={() => navigate('home')}
            onViewOrders={() => navigate('orders')}
          />
        );

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
  const showCategoryBar = ['home', 'products'].includes(page);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow animate-pulse">
            <img src={logo} alt="" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connecting to marketplace…</p>
        </div>
      )}

      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigate}
        activePage={page}
      />
      {showCategoryBar && (
        <CategoryBar onSelectCategory={() => page === 'home' && navigate('products')} />
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => navigate('checkout')} />
      <AuthModal />
    </div>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <Router />
  </StoreProvider>
);

export default App;
