import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Settings, Plus,
  TrendingUp, DollarSign, Boxes, Clock, Send, Store as StoreIcon,
  BadgePercent, CheckCircle2, Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toast } from '../components/ui/Toast';
import { confirmDialog } from '../components/ui/ConfirmDialog';

interface VendorDashboardProps {
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'products' | 'orders' | 'wallet' | 'settings';

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser, shops, products, orders,
    updateProduct, deleteProduct, updateOrderStatus,
    vendorWallets, payoutRequests, requestPayout, updateShop
  } = useStore();

  const [tab, setTab] = useState<Tab>('overview');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [busyPayout, setBusyPayout] = useState(false);

  const myShop = shops.find((s) => s.owner_id === currentUser?.id);

  if (!myShop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <StoreIcon className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">You don't own a shop yet</h1>
        <p className="text-sm text-slate-500">Create your shop to access the vendor management dashboard.</p>
        <button onClick={() => onNavigate('create-shop')} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition">
          Create My Shop
        </button>
      </div>
    );
  }

  const myProducts = products.filter((p) => p.shop_id === myShop.id);
  const myOrders = orders.filter((o) => o.items.some((i) => i.shop_id === myShop.id));
  const wallet = vendorWallets.find((w) => w.shop_id === myShop.id);

  const totalSales = myProducts.reduce((sum, p) => sum + (p.discount_price ?? p.price), 0);
  const pendingOrders = myOrders.filter((o) => o.overall_status !== 'delivered').length;

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'My Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'wallet', label: 'Earnings & Payout', icon: Wallet },
    { key: 'settings', label: 'Shop Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-4">
          <img src={myShop.logo_url} alt="" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Vendor Dashboard</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{myShop.name}</h1>
          </div>
        </div>
        <button onClick={() => onNavigate('upload-product')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-brand-100">
          <Plus className="w-4 h-4" /> Upload New Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              tab === t.key ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: myProducts.length, icon: Boxes, color: 'bg-blue-50 text-blue-600' },
              { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600' },
              { label: 'Gross Revenue', value: `৳${(((wallet?.total_earnings_95pct ?? 0) / 0.95)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
              { label: 'Net Balance (95%)', value: `৳${(wallet?.current_balance ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' }
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Commission explainer */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex items-center gap-4 shadow-lg">
            <BadgePercent className="w-9 h-9 text-amber-300 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-extrabold text-sm mb-0.5">Automatic Revenue Split — Active</p>
              Every paid order instantly credits <strong className="text-emerald-400">95% to your wallet</strong> while a flat
              <strong className="text-amber-300"> 5% platform fee</strong> supports hosting & maintenance. No hidden charges.
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="space-y-4">
          {myProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No products yet</p>
              <button onClick={() => onNavigate('upload-product')}
                className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-lg">Upload First Product</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Product</th>
                    <th className="text-left px-4 py-3 font-bold">Price</th>
                    <th className="text-left px-4 py-3 font-bold">Stock</th>
                    <th className="text-left px-4 py-3 font-bold">Status</th>
                    <th className="text-right px-5 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <span className="font-bold text-slate-800 line-clamp-1 max-w-[240px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-800">৳{(p.discount_price ?? p.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <input type="number" min={0} value={p.stock}
                          onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) }).catch((err) => toast.error(`Update failed: ${err.message}`))}
                          className={`w-20 px-2 py-1.5 rounded-lg border text-center font-bold ${p.stock <= 5 ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200'}`} />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => updateProduct(p.id, { is_active: !p.is_active }).catch((err) => toast.error(`Update failed: ${err.message}`))}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                          {p.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={async () => {
                            const ok = await confirmDialog({
                              title: 'Delete this product?',
                              message: `"${p.title}" will be permanently removed from your shop.`,
                              confirmText: 'Delete Product',
                              danger: true
                            });
                            if (!ok) return;
                            deleteProduct(p.id)
                              .then(() => toast.success('Product deleted.'))
                              .catch((err) => toast.error(`Delete failed: ${err.message}`));
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold text-[11px]">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No orders received yet</p>
            </div>
          ) : (
            myOrders.map((order) =>
              order.items.filter((i) => i.shop_id === myShop.id).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <img src={item.product_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.product_title} × {item.quantity}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{order.order_number} · {order.customer_name} ({order.customer_phone})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">৳{item.total_price.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 font-bold">You receive: ৳{item.vendor_amount_95pct.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-auto">Fulfillment:</span>
                    {(['processing', 'shipped', 'delivered'] as const).map((st) => (
                      <button key={st} onClick={() => updateOrderStatus(order.id, item.id, st).catch((err) => toast.error(`Status update failed: ${err.message}`))}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition ${
                          item.status === st ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* WALLET */}
      {tab === 'wallet' && wallet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Available for Withdrawal</p>
              <p className="text-4xl font-extrabold mt-1">৳{wallet.current_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
                <div><p className="opacity-75 font-semibold">Lifetime Earnings (95%)</p><p className="font-extrabold mt-0.5">৳{wallet.total_earnings_95pct.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div>
                <div><p className="opacity-75 font-semibold">Pending Requests</p><p className="font-extrabold mt-0.5">৳{wallet.pending_clearance.toLocaleString()}</p></div>
                <div><p className="opacity-75 font-semibold">Total Withdrawn</p><p className="font-extrabold mt-0.5">৳{wallet.total_withdrawn.toLocaleString()}</p></div>
              </div>
            </div>

            {/* Withdraw form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-sm">Request Payout</h3>
              <input type="number" min={1} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Amount (max ৳${wallet.current_balance.toFixed(0)})`}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize">
                <option value="bkash">bKash — {(myShop.bkash_payout_number ?? 'not set')}</option>
                <option value="nagad">Nagad — {(myShop.nagad_payout_number ?? 'not set')}</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <button onClick={async () => {
                  const amt = Number(payoutAmount);
                  if (!amt || amt <= 0 || amt > wallet.current_balance) return toast.error('Enter a valid amount within your balance.');
                  setBusyPayout(true);
                  try {
                    await requestPayout(myShop.id, myShop.name, amt, payoutMethod, payoutMethod === 'bkash' ? (myShop.bkash_payout_number ?? '') : payoutMethod === 'nagad' ? (myShop.nagad_payout_number ?? '') : 'Bank Acc.');
                    setPayoutAmount('');
                    toast.success('Withdrawal request submitted! Admin will transfer it shortly.');
                  } catch (e: any) {
                    toast.error(`Payout request failed: ${e.message}`);
                  } finally {
                    setBusyPayout(false);
                  }
                }}
                disabled={busyPayout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2">
                {busyPayout ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Send className="w-4 h-4" /> Submit Withdrawal Request</>)}
              </button>
            </div>
          </div>

          {/* Payout history */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100"><h3 className="font-extrabold text-slate-900 text-sm">Payout History</h3></div>
            {payoutRequests.filter((pr) => pr.shop_id === myShop.id).length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 font-medium">No withdrawal requests yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {payoutRequests.filter((pr) => pr.shop_id === myShop.id).map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between p-4 text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800">৳{pr.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{pr.payment_method} · {new Date(pr.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      pr.status === 'transferred' ? 'bg-emerald-100 text-emerald-700'
                      : pr.status === 'pending' ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'}`}>
                      {pr.status === 'transferred' && <CheckCircle2 className="inline w-3 h-3 mr-0.5" />}{pr.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <ShopSettingsForm
          shop={myShop}
          onSave={async (data) => {
            try {
              await updateShop(myShop.id, data);
              toast.success('Shop settings saved!');
            } catch (e: any) {
              toast.error(`Save failed: ${e.message}`);
            }
          }}
        />
      )}
    </div>
  );
};

/* ---------- Shop Settings sub-component ---------- */
const ShopSettingsForm: React.FC<{ shop: any; onSave: (data: any) => Promise<void> }> = ({ shop, onSave }) => {
  const [form, setForm] = useState({
    name: shop.name,
    description: shop.description,
    logo_url: shop.logo_url,
    banner_url: shop.banner_url,
    bkash_payout_number: shop.bkash_payout_number ?? '',
    nagad_payout_number: shop.nagad_payout_number ?? ''
  });
  const [saving, setSaving] = useState(false);

  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Shop Name</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Logo URL</label>
          <input className={inputCls} value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 uppercase">Banner URL</label>
        <input className={inputCls} value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 uppercase">Description</label>
        <textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-bkash uppercase">bKash Payout #</label>
          <input className={inputCls} value={form.bkash_payout_number} onChange={(e) => setForm({ ...form, bkash_payout_number: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-nagad uppercase">Nagad Payout #</label>
          <input className={inputCls} value={form.nagad_payout_number} onChange={(e) => setForm({ ...form, nagad_payout_number: e.target.value })} />
        </div>
      </div>
      <button onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
        disabled={saving}
        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition flex items-center gap-2">
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
      </button>
    </div>
  );
};
