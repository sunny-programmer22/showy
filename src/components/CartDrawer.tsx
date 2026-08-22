import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, shops } = useStore();

  // Group items by shop for multi-vendor clarity
  const itemsByShop = cart.reduce<Record<string, typeof cart>>((acc, item) => {
    const shopId = item.product.shop_id;
    if (!acc[shopId]) acc[shopId] = [];
    acc[shopId].push(item);
    return acc;
  }, {});

  const shippingFee = cartTotal > 5000 || cartTotal === 0 ? 0 : 80;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 animate-fadeIn" />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h2 className="font-extrabold text-lg text-slate-900">Your Cart</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Cart Items grouped by shop */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Your cart is empty</p>
              <p className="text-xs text-slate-400">Browse products and add items to get started!</p>
              <button onClick={onClose} className="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition">
                Start Shopping
              </button>
            </div>
          ) : (
            Object.entries(itemsByShop).map(([shopId, items]) => (
              <div key={shopId} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <Store className="w-3.5 h-3.5" />
                  {shops.find((s) => s.id === shopId)?.name || 'Vendor'}
                </div>
                {items.map(({ product, quantity }) => {
                  const price = product.discount_price ?? product.price;
                  return (
                    <div key={product.id} className="flex gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <img src={product.images[0]} alt={product.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{product.title}</h4>
                        <p className="text-sm font-extrabold text-brand-700 mt-1">৳{price.toLocaleString()}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button onClick={() => updateCartQuantity(product.id, quantity - 1)}
                              className="p-1.5 hover:bg-slate-50 transition"><Minus className="w-3 h-3" /></button>
                            <span className="px-3 text-xs font-bold">{quantity}</span>
                            <button onClick={() => updateCartQuantity(product.id, Math.min(product.stock, quantity + 1))}
                              disabled={quantity >= product.stock}
                              className="p-1.5 hover:bg-slate-50 transition disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeFromCart(product.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-5 space-y-3 bg-white">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold">৳{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : ''}`}>
                  {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total</span><span>৳{(cartTotal + shippingFee).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => { onClose(); onCheckout(); }}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-brand-100 flex items-center justify-center gap-2 active:scale-[0.98]">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              Secure payment via bKash / Nagad OTP verification · COD available
            </p>
          </div>
        )}
      </div>
    </>
  );
};
