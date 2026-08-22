import React, { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Truck, ShieldCheck, Check, ChevronRight, UserPlus, Loader2, TicketPercent, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import { toast } from '../components/ui/Toast';
import { VariantChip } from '../components/ui/VariantChip';
import { Order, PaymentMethod, ShippingAddress, Coupon, couponDiscountFor } from '../types';
import * as api from '../lib/api';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderPlaced }) => {
  const { cart, cartTotal, currentUser, placeOrder, setAuthModalOpen } = useStore();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const couponDiscount = appliedCoupon ? couponDiscountFor(appliedCoupon, cartTotal) : 0;

  const [form, setForm] = useState<ShippingAddress>({
    fullName: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    postalCode: '',
    note: ''
  });

  const shippingFee = shippingMethod === 'express' ? 150 : cartTotal > 5000 ? 0 : 80;
  const grandTotal = Math.max(0, cartTotal - couponDiscount) + shippingFee;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponChecking(true);
    try {
      const coupon = await api.validateCouponByCode(code);
      if (!coupon) {
        toast.error(`Coupon "${code.toUpperCase()}" does not exist.`);
        return;
      }
      if (!coupon.is_active || (coupon.expires_at && new Date(coupon.expires_at) < new Date())) {
        toast.error('This coupon is no longer active.');
        return;
      }
      if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
        toast.error('This coupon has reached its usage limit.');
        return;
      }
      if (cartTotal < coupon.min_order_amount) {
        toast.error(`This coupon needs a minimum order of ৳${coupon.min_order_amount.toLocaleString()}.`);
        return;
      }
      setAppliedCoupon(coupon);
      toast.success(`Coupon ${coupon.code} applied!`);
    } catch (e: any) {
      toast.error(e.message || 'Could not validate the coupon.');
    } finally {
      setCouponChecking(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="mx-auto w-16 h-16 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Sign in to complete checkout</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your cart is saved. Create a free account or sign in so we can attach this order to you and enable order tracking.
        </p>
        <div className="flex flex-col gap-2.5 pt-1">
          <button onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-brand-100">
            Sign In / Create Account
          </button>
          <button onClick={onBack} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">
            Keep Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Your cart is empty</h1>
        <button onClick={onBack} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition">
          Browse Products
        </button>
      </div>
    );
  }

  const validateShippingForm = (): boolean => {
    if (!form.fullName.trim() || !/^01\d{9}$/.test(form.phone.replace(/\s/g, '')) || !form.address.trim() || !form.city.trim()) {
      toast.error('Please fill in your full name, valid phone (11-digit starting with 01), address and city.');
      return false;
    }
    return true;
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    if (!validateShippingForm()) return;
    setPaymentMethod(method);
    if (method === 'bkash' || method === 'nagad') {
      // Launch the automated OTP payment gateway flow
      setGatewayOpen(true);
    } else if (method === 'cod') {
      confirmOrder('COD');
    }
  };

  const confirmOrder = async (trxId?: string) => {
    if (placing) return;
    setPlacing(true);
    try {
      const discount =
        appliedCoupon && couponDiscount > 0
          ? { amount: couponDiscount, code: appliedCoupon.code }
          : undefined;
      const order = await placeOrder(form, paymentMethod, trxId, discount);
      onOrderPlaced(order);
    } catch (e: any) {
      toast.error(`Order failed: ${e.message}. Please try again.`);
    } finally {
      setPlacing(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelCls = 'text-xs font-bold text-slate-600 uppercase tracking-wide';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Shopping
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8">Secure Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-xs font-bold">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white"><MapPin className="w-3.5 h-3.5" /> 1. Shipping Info</div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${paymentMethod ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
          <CreditCard className="w-3.5 h-3.5" /> 2. Payment
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" /> 3. Confirmation
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Forms */}
        <div className="lg:col-span-3 space-y-6">
          {/* Delivery Address */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" /> Delivery Address
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Tanvir Ahmed" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Phone Number *</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className={inputCls} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Full Address *</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House / Road / Area..." className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 col-span-2">
                <label className={labelCls}>City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dhaka" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Postal Code</label>
                <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="1213" className={inputCls} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Delivery Note (optional)</label>
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Call before delivery" className={inputCls} />
            </div>
          </section>

          {/* Shipping Method */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" /> Delivery Speed
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-xl border-2 text-left transition ${shippingMethod === 'standard' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="font-extrabold text-sm text-slate-800">Standard</p>
                <p className="text-[11px] text-slate-500 mt-0.5">3–5 business days</p>
                <p className="font-extrabold text-sm text-brand-700 mt-1">{cartTotal > 5000 ? 'FREE' : '৳80'}</p>
              </button>
              <button onClick={() => setShippingMethod('express')}
                className={`p-4 rounded-xl border-2 text-left transition ${shippingMethod === 'express' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="font-extrabold text-sm text-slate-800">Express ⚡</p>
                <p className="text-[11px] text-slate-500 mt-0.5">24–48 hours</p>
                <p className="font-extrabold text-sm text-brand-700 mt-1">৳150</p>
              </button>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" /> Payment Method
            </h2>
            <p className="text-[11px] text-slate-500 -mt-1">Automated OTP verification — no manual transaction needed!</p>

            <div className="space-y-2.5">
              <button onClick={() => handlePaymentSelect('bkash')}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition group
                  border-slate-200 hover:border-bkash hover:bg-bkash/5">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-bkash text-white text-xs font-extrabold rounded-lg">bKash</span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-slate-800">Pay with bKash</span>
                    <span className="block text-[11px] text-slate-500">SMS OTP → PIN → Instant payment</span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-bkash" />
              </button>

              <button onClick={() => handlePaymentSelect('nagad')}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition group
                  border-slate-200 hover:border-nagad hover:bg-nagad/5">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-nagad text-white text-xs font-extrabold rounded-lg">Nagad</span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-slate-800">Pay with Nagad</span>
                    <span className="block text-[11px] text-slate-500">SMS OTP → PIN → Instant payment</span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-nagad" />
              </button>

              <button disabled
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-slate-200 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-extrabold rounded-lg">VISA</span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-slate-800">Debit / Credit Card</span>
                    <span className="block text-[11px] text-slate-400">Coming soon via SSLCommerz</span>
                  </span>
                </div>
              </button>

              <button onClick={() => handlePaymentSelect('cod')}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition group">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-extrabold rounded-lg">COD</span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-slate-800">Cash on Delivery</span>
                    <span className="block text-[11px] text-slate-500">Pay when you receive the parcel</span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <aside className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 sticky top-24">
          <h2 className="font-extrabold text-slate-900 text-lg">Order Summary</h2>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {cart.map((line) => {
              const { product, quantity, variant } = line;
              const unit = variant?.price ?? product.discount_price ?? product.price;
              return (
                <div key={`${product.id}:${variant?.id ?? 'base'}`} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 line-clamp-1"><VariantChip label={variant ? `${variant.option_name}: ${variant.option_value}` : null} />{product.title}</p>
                    <p className="text-[10px] text-slate-400">Qty: {quantity}</p>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 shrink-0">
                    ৳{(unit * quantity).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-2 border-t border-dashed border-slate-200 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery ({shippingMethod})</span>
              <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : ''}>{shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-emerald-600">
                <span className="flex items-center gap-1.5 font-bold">
                  <TicketPercent className="w-4 h-4" /> {appliedCoupon.code}
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} aria-label={`Remove coupon ${appliedCoupon.code}`}
                    className="text-slate-400 hover:text-rose-500 transition"><X className="w-3.5 h-3.5" /></button>
                </span>
                <span className="font-bold">−৳{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span><span>৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {!appliedCoupon && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TicketPercent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="text" value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  placeholder="Coupon code" aria-label="Coupon code"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <button type="button" onClick={handleApplyCoupon} disabled={couponChecking || !couponCode.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shrink-0">
                {couponChecking ? '…' : 'Apply'}
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Payments are processed through official bKash/Nagad PGW with SMS OTP verification.
              Your card/wallet details are never stored by Showy.
            </p>
          </div>
        </aside>
      </div>

      {/* bKash / Nagad Automated Gateway Modal */}
      <PaymentGatewayModal
        isOpen={gatewayOpen}
        method={paymentMethod === 'bkash' ? 'bkash' : paymentMethod === 'nagad' ? 'nagad' : null}
        amount={grandTotal}
        onSuccess={(trxId) => {
          setGatewayOpen(false);
          confirmOrder(trxId);
        }}
        onClose={() => setGatewayOpen(false)}
      />

      {/* Placing-order overlay */}
      {placing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-white text-sm font-bold">Placing your order securely…</p>
        </div>
      )}
    </div>
  );
};
