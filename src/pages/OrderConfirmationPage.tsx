import React from 'react';
import { CheckCircle2, Package, Printer, Home, ChevronRight, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { VariantChip } from '../components/ui/VariantChip';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  order?: Order;
  onGoHome: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onGoHome,
  onViewOrders
}) => {
  const { shops } = useStore();

  useEffect(() => {
    if (order) {
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#22c55e', '#f59e0b', '#e2136e']
      });
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">Order not found</h2>
        <p className="text-sm text-slate-500">We couldn't load this order confirmation.</p>
        <button onClick={onGoHome}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Success Hero */}
      <div className="text-center space-y-3 mb-8">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-11 h-11 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Order Confirmed!</h1>
        <p className="text-sm text-slate-500">
          Thank you <strong>{order.customer_name}</strong>! Your order has been placed successfully.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-mono text-sm font-bold tracking-wider">
          <Package className="w-4 h-4 text-brand-400" /> {order.order_number}
        </div>
        {order.transaction_id && order.payment_method !== 'cod' && (
          <p className="text-xs text-slate-500">
            Paid via <strong className="capitalize">{order.payment_method}</strong> · TrxID: <strong className="font-mono">{order.transaction_id}</strong>
          </p>
        )}
        {order.payment_method === 'cod' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 w-fit mx-auto font-semibold">
            💵 Cash on Delivery — please keep ৳{order.total_amount.toLocaleString()} ready
          </p>
        )}
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Invoice</p>
            <p className="font-extrabold text-lg">Showy</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-80">Order Date</p>
            <p className="font-bold text-sm">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Items grouped by shop */}
        <div className="p-6 space-y-5">
          {Object.entries(
            order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
              if (!acc[item.shop_id]) acc[item.shop_id] = [];
              acc[item.shop_id].push(item);
              return acc;
            }, {})
          ).map(([shopId, items]) => {
            const shop = shops.find((s) => s.id === shopId);
            return (
              <div key={shopId} className="space-y-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  Sold by: <span className="text-brand-700 normal-case text-xs">{shop?.name || 'Vendor'}</span>
                </p>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product_image} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1"><VariantChip label={item.variant_label} />{item.product_title}</p>
                      <p className="text-[11px] text-slate-400">৳{item.unit_price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">৳{item.total_price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Totals */}
          <div className="pt-4 border-t border-dashed border-slate-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Items Subtotal</span><span>৳{order.total_amount.toLocaleString()}</span></div>
            <div className="flex justify-between text-slate-600"><span>Delivery</span><span>৳80</span></div>
            <div className="flex justify-between font-extrabold text-base pt-1">
              <span>Total Paid</span><span className="text-emerald-600">৳{(order.total_amount + 80).toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-0.5">
            <p className="font-extrabold text-slate-700 uppercase tracking-wide text-[10px] mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Delivering To
            </p>
            <p className="font-bold text-slate-800">{order.shipping_address.fullName} · {order.shipping_address.phone}</p>
            <p className="text-slate-500 leading-relaxed">
              {order.shipping_address.address}, {order.shipping_address.city}
              {order.shipping_address.postalCode && ` - ${order.shipping_address.postalCode}`}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3 mt-7">
        <button onClick={onViewOrders}
          className="py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
          <Package className="w-4 h-4" /> Track Order
        </button>
        <button onClick={() => window.print()}
          className="py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
        <button onClick={onGoHome}
          className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5">
          <Home className="w-4 h-4" /> Keep Shopping
        </button>
      </div>
    </div>
  );
};
