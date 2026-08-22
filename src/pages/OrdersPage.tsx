import React from 'react';
import { Package, CheckCircle2, Truck, Clock, XCircle, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Order, OrderStatus } from '../types';

interface OrdersPageProps {
  onBack: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ onBack }) => {
  const { orders, currentUser, isLoading } = useStore();

  // Customers see their own orders
  const myOrders = currentUser?.role === 'customer'
    ? orders.filter((o) => o.customer_id === currentUser.id)
    : orders; // admin sees all

  // Avoid flashing "no orders" while the session & data resolve
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 !rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order it will appear here with live tracking."
          actionLabel="Start Shopping"
          onAction={onBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Package className="w-7 h-7 text-brand-600" /> My Orders & Tracking
        </h1>
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-brand-600 transition">← Continue Shopping</button>
      </div>

      {myOrders.map((order: Order) => (
        <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Order header */}
          <details open className="group">
            <summary className="cursor-pointer list-none p-5 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${order.overall_status === 'delivered' ? 'bg-emerald-100' : order.overall_status === 'cancelled' ? 'bg-rose-100' : 'bg-brand-50'}`}>
                  <Package className={`w-5 h-5 ${order.overall_status === 'delivered' ? 'text-emerald-600' : order.overall_status === 'cancelled' ? 'text-rose-600' : 'text-brand-600'}`} />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900 font-mono">{order.order_number}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}৳{order.total_amount.toLocaleString()} · <span className="capitalize font-semibold">{order.payment_method}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {order.overall_status !== 'cancelled' && (
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                    order.overall_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.overall_status === 'shipped'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.overall_status === 'processing' && <Clock className="w-3 h-3" />}
                    {order.overall_status}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
              </div>
            </summary>

            <div className="border-t border-slate-100 p-5 space-y-6">
              {/* Live progress tracker */}
              <div className="flex items-start justify-between relative px-2">
                {order.overall_status !== 'cancelled' ? (
                  <>
                    <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0" />
                    <div
                      className="absolute top-4 left-[12%] h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
                      style={{
                        width: `${
                          (STATUS_STEPS.findIndex((s) => s.key === order.overall_status) /
                            (STATUS_STEPS.length - 1)) * 76
                        }%`
                      }}
                    />
                    {STATUS_STEPS.map((step, i) => {
                      const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.overall_status);
                      const done = i <= currentIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 w-20 relative z-10">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            done ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-white border-slate-300 text-slate-300'
                          }`}>
                            <step.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-bold text-center ${done ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="w-full flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                    <XCircle className="w-4 h-4" /> This order was cancelled.
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.product_title}</p>
                      <p className="text-[10px] text-slate-400">Sold by {item.shop_name} · Qty {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-slate-800">৳{item.total_price.toLocaleString()}</p>
                      <p className={`text-[10px] font-bold capitalize ${
                        item.status === 'delivered' ? 'text-emerald-600'
                        : item.status === 'shipped' ? 'text-indigo-600'
                        : 'text-amber-600'
                      }`}>{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wide mb-1">Delivery Address</p>
                  <p className="font-semibold text-slate-800">{order.shipping_address.fullName}</p>
                  <p className="text-slate-500 leading-relaxed">{order.shipping_address.address}, {order.shipping_address.city}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wide mb-1">Payment</p>
                  <p className="font-semibold text-slate-800 capitalize">{order.payment_method} — {order.payment_status}</p>
                  {order.transaction_id && <p className="font-mono text-slate-400">TrxID: {order.transaction_id}</p>}
                </div>
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
};
