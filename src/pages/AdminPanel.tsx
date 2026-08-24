import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, TrendingUp, Percent, Store as StoreIcon, Users,
  Package, Wallet, CheckCircle2, XCircle, BadgePercent,
  TicketPercent, ScrollText, Plus, Trash2, Power, ImagePlus, Upload
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';
import { confirmDialog } from '../components/ui/ConfirmDialog';
import * as api from '../lib/api';
import { Coupon } from '../types';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

  type Tab = 'overview' | 'shops' | 'orders' | 'payouts' | 'transactions' | 'banners' | 'coupons' | 'security';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const {
    shops, products, orders, users,
    platformAdminEarnings, toggleShopActive, payoutRequests, approvePayout, rejectPayout, verifyOrderPayment,
    isLiveMode
  } = useStore();

  const [tab, setTab] = useState<Tab>('overview');

  /* ------------------------------ Coupons ------------------------------ */
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    value: '',
    min_amount: '',
    max_discount: '',
    usage_limit: '',
    expires_at: ''
  });

  /* ---------------------------- Audit logs ----------------------------- */
  const [auditLogs, setAuditLogs] = useState<api.AuditLogEntry[]>([]);

  useEffect(() => {
    if (!isLiveMode) return;
    if (tab === 'coupons') {
      api.fetchCoupons().then(setCoupons).catch((e: any) => toast.error(e.message));
    }
    if (tab === 'security') {
      api.fetchAuditLogs().then(setAuditLogs).catch((e: any) => toast.error(e.message));
    }
  }, [tab, isLiveMode]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.value) {
      toast.error('Coupon code and discount value are required.');
      return;
    }
    setCreatingCoupon(true);
    try {
      const created = await api.apiInsertCoupon({
        code: couponForm.code,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.value),
        min_order_amount: couponForm.min_amount ? Number(couponForm.min_amount) : 0,
        max_discount: couponForm.max_discount ? Number(couponForm.max_discount) : null,
        usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
        expires_at: couponForm.expires_at || null
      });
      setCoupons((prev) => [created, ...prev]);
      setCouponForm({ code: '', discount_type: 'percent', value: '', min_amount: '', max_discount: '', usage_limit: '', expires_at: '' });
      toast.success(`Coupon ${created.code} created.`);
    } catch (err: any) {
      toast.error(`Create failed: ${err.message}`);
    } finally {
      setCreatingCoupon(false);
    }
  };

  const adminShop = shops.find((s) => s.is_admin_shop);
  const vendorShops = shops.filter((s) => !s.is_admin_shop);
  const totalGMV = orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);
  const totalCommission = platformAdminEarnings - orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.items.filter((i) => i.is_admin_shop).reduce((s, i) => s + i.total_price, 0), 0);
  const pendingPayouts = payoutRequests.filter((pr) => pr.status === 'pending');
  const pendingPayoutTotal = pendingPayouts.reduce((sum, pr) => sum + pr.amount, 0);
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const aov = paidOrders.length ? Math.round(totalGMV / paidOrders.length) : 0;
  const customerCounts = paidOrders.reduce((acc: Record<string, number>, o) => { acc[o.customer_id] = (acc[o.customer_id] || 0) + 1; return acc; }, {});
  const repeatCustomers = Object.values(customerCounts).filter((c) => c > 1).length;
  const repeatRate = Object.keys(customerCounts).length ? Math.round((repeatCustomers / Object.keys(customerCounts).length) * 100) : 0;

  const { fetchAdminTransactions, toggleShopVerified } = useStore();
  const [txns, setTxns] = useState<any[]>([]);
  const [txnsLoaded, setTxnsLoaded] = useState(false);
  useEffect(() => {
    if (tab === 'transactions' && !txnsLoaded) {
      fetchAdminTransactions()
        .then((d) => { setTxns(d as any[]); setTxnsLoaded(true); })
        .catch((e: Error) => toast.error(`Could not load transactions — did you run patch 007? ${e.message}`));
    }
  }, [tab]);

  const exportTxnsCsv = () => {
    const rows = [['Date','Order','Shop','Product','Qty','Line Total','Commission (5%)','Seller Net (95%)','Method','Ref','Payment']];
    txns.forEach((t) => rows.push([new Date(t.created_at).toLocaleString(), t.order_number, t.shop_name, t.product_title, String(t.quantity), String(t.line_total), String(t.commission), String(t.seller_net), t.payment_method, t.transaction_id || '-', t.payment_status]));
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `showy-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [bannerForm, setBannerForm] = useState({ headline: '', sub: '', link: '', image_url: '', sort: '0' });
  const [savingBanner, setSavingBanner] = useState(false);
  useEffect(() => {
    if (tab === 'banners' && supabase) {
      supabase.from('banners').select('*').order('sort').then(({ data }) => { if (data) setAdminBanners(data as any[]); });
    }
  }, [tab]);
  const handleBannerUpload = async (file: File) => {
    if (!supabase) return;
    const path = `banners/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    setBannerForm((f) => ({ ...f, image_url: data.publicUrl }));
    toast.success('Image uploaded');
  };
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !bannerForm.headline.trim()) { toast.error('Headline required'); return; }
    setSavingBanner(true);
    const { data, error } = await (supabase.from('banners').insert as any)({ headline: bannerForm.headline.trim(), sub: bannerForm.sub.trim(), link: bannerForm.link.trim(), image_url: bannerForm.image_url.trim() || null, sort: Number(bannerForm.sort) || 0 }).select().single();
    setSavingBanner(false);
    if (error) toast.error(error.message);
    else { setAdminBanners((prev) => [...prev, data]); setBannerForm({ headline: '', sub: '', link: '', image_url: '', sort: '0' }); toast.success('Banner added'); }
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Platform Overview', icon: TrendingUp },
    { key: 'shops', label: 'Shop Management', icon: StoreIcon },
    { key: 'orders', label: 'Global Orders', icon: Package },
{ key: 'payouts', label: 'Vendor Payouts', icon: Wallet },
{ key: 'transactions', label: 'Transactions', icon: ScrollText },
{ key: 'banners', label: 'Hero Banners', icon: ImagePlus },
{ key: 'coupons', label: 'Coupons & Promos', icon: TicketPercent },
    { key: 'security', label: 'Security Log', icon: ScrollText }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-2xl border border-purple-200">
            <ShieldAlert className="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600">Super Admin Panel</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Platform Control Center</h1>
          </div>
        </div>
        {adminShop && (
          <button onClick={() => onNavigate('shop-detail')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md">
            Manage Flagship Store â†’
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              tab === t.key ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.key === 'payouts' && pendingPayouts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px]">{pendingPayouts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-2xl p-5 shadow-lg">
              <BadgePercent className="w-6 h-6 opacity-80 mb-3" />
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">My Total Earnings</p>
              <p className="text-2xl font-extrabold mt-0.5">৳{platformAdminEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-[10px] mt-1 opacity-70">100% flagship sales + 5% commission</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-3" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Marketplace GMV</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">৳{totalGMV.toLocaleString()}</p>
              <p className="text-[10px] mt-1 text-slate-400">{orders.filter((o) => o.payment_status === 'paid').length} paid orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <Percent className="w-6 h-6 text-emerald-600 mb-3" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Commission Earned (5%)</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">৳{Math.max(0, totalCommission).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-[10px] mt-1 text-emerald-600 font-bold">Auto-deducted from vendor sales</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <Users className="w-6 h-6 text-amber-600 mb-3" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Active Shops / Products</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{shops.filter((s) => s.is_active).length} / {products.filter((p) => p.is_active).length}</p>
              <p className="text-[10px] mt-1 text-slate-400">{users.length} registered users</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Average Order Value</p>
              <p className="text-lg font-extrabold text-slate-900">৳{aov.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">{paidOrders.length} paid orders</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Repeat Customer Rate</p>
              <p className="text-lg font-extrabold text-slate-900">{repeatRate}%</p>
              <p className="text-[10px] text-slate-400">{repeatCustomers} repeat buyers</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Payouts</p>
              <p className="text-lg font-extrabold text-amber-700">৳{pendingPayoutTotal.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">{pendingPayouts.length} requests</p>
            </div>
          </div>

          {/* Commission engine explainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3 shadow-lg">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><BadgePercent className="w-4 h-4 text-amber-300" /> How your automated profit works</h3>
              <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                <p><strong className="text-white">Third-party sale of ৳1,000:</strong></p>
                <div className="flex justify-between bg-white/5 rounded-lg px-3 py-2"><span>â†’ Your commission (5%)</span><strong className="text-emerald-400">৳50 auto-credited</strong></div>
                <div className="flex justify-between bg-white/5 rounded-lg px-3 py-2"><span>â†’ Vendor receives (95%)</span><strong>৳950 to their wallet</strong></div>
                <p className="pt-1"><strong className="text-white">Your flagship store sale:</strong> you keep <strong className="text-amber-300">100%</strong> — zero commission.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 mb-3">Top Performing Vendors</h3>
              <div className="space-y-2.5">
                {vendorShops.map((shop) => {
                  const earnings = orders
                    .filter((o) => o.payment_status === 'paid')
                    .flatMap((o) => o.items)
                    .filter((i) => i.shop_id === shop.id)
                    .reduce((s, i) => s + i.vendor_amount_95pct, 0);
                  const commission = orders
                    .filter((o) => o.payment_status === 'paid')
                    .flatMap((o) => o.items)
                    .filter((i) => i.shop_id === shop.id)
                    .reduce((s, i) => s + i.admin_commission_5pct, 0);
                  return (
                    <div key={shop.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={shop.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 truncate">{shop.name}</p>
                          <p className="text-[10px] text-slate-400">Your cut: ৳{commission.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-700 shrink-0 ml-2">৳{earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPS */}
      {tab === 'shops' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Shop</th>
                <th className="text-left px-4 py-3 font-bold">Owner</th>
                <th className="text-left px-4 py-3 font-bold">Products</th>
                <th className="text-left px-4 py-3 font-bold">Type</th>
                <th className="text-right px-5 py-3 font-bold">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shops.map((shop) => {
                const owner = users.find((u) => u.id === shop.owner_id);
                const prodCount = products.filter((p) => p.shop_id === shop.id).length;
                return (
                  <tr key={shop.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={shop.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-800">{shop.name}</p>
                          <p className="text-[10px] text-slate-400">/{shop.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{owner?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{prodCount}</td>
                    <td className="px-4 py-3">
                      {shop.is_admin_shop ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-extrabold uppercase">Flagship</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-extrabold uppercase">Vendor</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!shop.is_admin_shop && (
                        <button onClick={() => {
                          if (shop.is_active) {
                            confirmDialog({
                              title: 'Suspend this shop?',
                              message: `"${shop.name}" will disappear from the marketplace until reactivated.`,
                              confirmText: 'Suspend Shop',
                              danger: true
                            }).then((ok) => {
                              if (ok) toggleShopActive(shop.id).catch((err) => toast.error(`Action failed: ${err.message}`));
                            });
                          } else {
                            toggleShopActive(shop.id)
                              .then(() => toast.success(`"${shop.name}" is live again.`))
                              .catch((err) => toast.error(`Action failed: ${err.message}`));
                          }
                        }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition ${
                            shop.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                          }`}>
                          {shop.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {shop.is_active ? 'Active' : 'Suspended'}
                        </button>
                      )}
                      {!shop.is_admin_shop && (
                        <button onClick={() => {
                            confirmDialog({
                              title: shop.is_verified ? 'Remove verified badge?' : 'Mark shop as verified?',
                              message: shop.is_verified
                                ? `"${shop.name}" will lose its Verified badge on the marketplace.`
                                : `"${shop.name}" will display a green Verified badge to all customers.`,
                              confirmText: shop.is_verified ? 'Remove Badge' : 'Verify Shop'
                            }).then((ok) => {
                              if (ok) toggleShopVerified(shop.id).then(() => toast.success(shop.is_verified ? 'Badge removed.' : `${shop.name} is now Verified.`)).catch((err) => toast.error(`Action failed: ${err.message}`));
                            });
                          }}
                          className={`ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition ${
                            shop.is_verified ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}>
                          <ShieldAlert className="w-3 h-3" />
                          {shop.is_verified ? 'Verified' : 'Unverified'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GLOBAL ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
              <div className="min-w-[140px]">
                <p className="font-mono font-extrabold text-slate-900">{order.order_number}</p>
                <p className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="min-w-[140px]">
                <p className="font-bold text-slate-700">{order.customer_name}</p>
                <p className="text-[10px] text-slate-400">{order.customer_phone}</p>
              </div>
              <div className="min-w-[120px]">
                <p className="font-bold capitalize text-slate-700">{order.payment_method} Â· {order.payment_status}</p>
                {order.transaction_id && <p className="text-[10px] font-mono text-slate-400">{order.transaction_id}</p>}
              </div>
              <div className="min-w-[110px]">
                <p className="font-extrabold text-slate-900">৳{order.total_amount.toLocaleString()}</p>
                {order.transaction_id && <p className="text-[9px] font-mono text-slate-400 break-all">{order.transaction_id}</p>}
              </div>
              <div className="min-w-[120px] flex flex-col items-start gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${order.payment_method === 'cod' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                </span>
                {order.payment_status === 'pending' && order.payment_method !== 'cod' ? (
                  <button onClick={() =>
                      verifyOrderPayment(order.id, true)
                        .then(() => toast.success(`Payment verified — items moved to Processing`))
                        .catch((err) => toast.error(err.message))
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold uppercase transition">
                    Verify Paid
                  </button>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{order.payment_status}</span>
                )}
              </div>
              <div className="ml-auto">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  order.overall_status === 'delivered' ? 'bg-emerald-100 text-emerald-700'
                  : order.overall_status === 'shipped' ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-amber-100 text-amber-700'
                }`}>{order.overall_status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYOUTS */}
      {tab === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-900 flex items-center justify-between">
            <span>{pendingPayouts.length} withdrawal request(s) awaiting approval — total ৳{pendingPayoutTotal.toLocaleString()}</span>
          </div>
          {payoutRequests.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No payout requests</p>
            </div>
          ) : (
            payoutRequests.map((pr) => (
              <div key={pr.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <p className="font-extrabold text-base text-slate-900">৳{pr.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{new Date(pr.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">{pr.shop_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{pr.payment_method}: {pr.account_number}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {pr.status === 'pending' ? (
                    <>
                      <button onClick={() => approvePayout(pr.id)
                          .then(() => toast.success('Marked as transferred — vendor wallet settled.'))
                          .catch((err) => toast.error(`Approval failed: ${err.message}`))}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold uppercase transition shadow-sm">
                        Approve & Transfer
                      </button>
                      <button onClick={async () => {
                          const ok = await confirmDialog({
                            title: 'Reject this payout?',
                            message: `৳${pr.amount.toLocaleString()} will be returned to ${pr.shop_name}'s available balance.`,
                            confirmText: 'Reject Request',
                            danger: true
                          });
                          if (!ok) return;
                          try {
                            await rejectPayout(pr.id);
                            toast.success('Request rejected — funds returned to vendor balance.');
                          } catch (err: any) {
                            toast.error(`Rejection failed: ${err.message}`);
                          }
                        }}
                        className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-[10px] font-extrabold uppercase transition">Reject</button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase ${
                      pr.status === 'transferred' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{pr.status}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* TRANSACTIONS LEDGER */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Transaction Ledger</h2>
              <p className="text-xs text-slate-500">Every sold item across all shops — commission & seller earnings. 5% platform / 95% seller.</p>
            </div>
            <button onClick={exportTxnsCsv} disabled={txns.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold uppercase transition">
              Export CSV
            </button>
          </div>
          {txns.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">No transactions yet. They appear here the moment orders are placed.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Date','Order','Shop','Product','Qty','Line Total','Commission (5%)','Seller Net (95%)','Method','Ref','Payment'].map((h) => (
                    <th key={h} className="px-4 py-3 font-extrabold text-slate-600 uppercase text-[10px] whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txns.map((t, i) => (
                    <tr key={i} className="hover:bg-purple-50/30">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{t.order_number}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{t.shop_name}</td>
                      <td className="px-4 py-3 text-slate-700">{t.product_title}{t.quantity > 1 ? ` ×${t.quantity}` : ''}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">{t.line_total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-purple-700 font-bold">{t.commission.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">{t.seller_net.toLocaleString()}</td>
                      <td className="px-4 py-3 uppercase font-bold text-slate-600">{t.payment_method}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-[140px] truncate">{t.transaction_id || '-'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${t.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : t.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{t.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-purple-50/50 border-t-2 border-purple-200 font-extrabold">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-slate-500">Totals ({txns.length} items)</td>
                    <td className="px-4 py-3">{txns.reduce((s, t) => s + Number(t.line_total), 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-purple-700">{txns.reduce((s, t) => s + Number(t.commission), 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-700">{txns.reduce((s, t) => s + Number(t.seller_net), 0).toLocaleString()}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BANNERS */}
      {tab === 'banners' && (
        <div className="space-y-5">
          <form onSubmit={handleCreateBanner} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h3 className="font-extrabold text-sm flex items-center gap-2"><ImagePlus className="w-4 h-4 text-brand-600" /> Add Hero Poster</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={bannerForm.headline} onChange={(e) => setBannerForm({ ...bannerForm, headline: e.target.value })} placeholder="Headline *" className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
              <input value={bannerForm.sub} onChange={(e) => setBannerForm({ ...bannerForm, sub: e.target.value })} placeholder="Sub text" className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
              <input value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder="Link (optional e.g. /products?cat=jersey)" className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
              <input value={bannerForm.sort} onChange={(e) => setBannerForm({ ...bannerForm, sort: e.target.value })} placeholder="Sort order" type="number" className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
              <input value={bannerForm.image_url} onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })} placeholder="Image URL or upload" className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm md:col-span-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
              </label>
              {bannerForm.image_url && <img src={bannerForm.image_url} alt="" className="w-20 h-12 object-cover rounded-lg border" />}
              <button type="submit" disabled={savingBanner} className="ml-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center gap-1"><Plus className="w-3.5 h-3.5" />{savingBanner ? 'Saving…' : 'Add Banner'}</button>
            </div>
          </form>
          {adminBanners.length === 0 ? <p className="text-center text-sm text-slate-400 py-8">No banners yet — add one above. Fallback branded posters show until then.</p> : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3 text-left">Preview</th><th className="px-4 py-3 text-left">Headline</th><th className="px-4 py-3 text-left">Sub</th><th className="px-4 py-3 text-left">Active</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {adminBanners.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{b.image_url ? <img src={b.image_url} alt="" className="w-20 h-12 object-cover rounded-lg" /> : <span className="text-slate-400">gradient</span>}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{b.headline}</td>
                      <td className="px-4 py-3 text-slate-500">{b.sub}</td>
                      <td className="px-4 py-3"><button onClick={async () => { if (!supabase) return; const { error } = await (supabase.from('banners').update as any)({ is_active: !b.is_active }).eq('id', b.id); if (!error) setAdminBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, is_active: !x.is_active } : x)); }} className={`px-2 py-1 rounded-full text-[10px] font-bold ${b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{b.is_active ? 'Active' : 'Hidden'}</button></td>
                      <td className="px-4 py-3 text-right"><button onClick={async () => { const ok = await confirmDialog({ title: 'Delete banner?', message: `Delete "${b.headline}"?`, confirmText: 'Delete', danger: true }); if (!ok || !supabase) return; const { error } = await supabase.from('banners').delete().eq('id', b.id); if (!error) { setAdminBanners((prev) => prev.filter((x) => x.id !== b.id)); toast.success('Deleted'); } else toast.error(error.message); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COUPONS */}
      {tab === 'coupons' && (
        <div className="space-y-5">
          {!isLiveMode ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              Coupons require live Supabase mode. Run supabase-coupons-patch-003.sql first.
            </div>
          ) : (
            <>
              <form onSubmit={handleCreateCoupon} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-600" /> Create Coupon
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input type="text" value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="CODE" aria-label="Coupon code"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <select value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percent' | 'fixed' })}
                    aria-label="Discount type"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="percent">% off</option>
                    <option value="fixed">৳ fixed</option>
                  </select>
                  <input type="number" min="0" step="0.01" value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    placeholder={couponForm.discount_type === 'percent' ? 'Discount %' : 'Discount ৳'} aria-label="Discount value"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="number" min="0" step="0.01" value={couponForm.min_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_amount: e.target.value })}
                    placeholder="Min order ৳" aria-label="Minimum order amount"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="number" min="0" step="0.01" value={couponForm.max_discount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                    placeholder="Max cap ৳ (% only)" aria-label="Maximum discount cap"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="number" min="0" value={couponForm.usage_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                    placeholder="Usage limit" aria-label="Usage limit"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="date" value={couponForm.expires_at}
                    onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                    aria-label="Expiry date"
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <button type="submit" disabled={creatingCoupon}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> {creatingCoupon ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>

              {coupons.length === 0 ? (
                <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <TicketPercent className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No coupons yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
                      <tr>
                        <th className="text-left px-5 py-3 font-bold">Code</th>
                        <th className="text-left px-4 py-3 font-bold">Discount</th>
                        <th className="text-left px-4 py-3 font-bold">Rules</th>
                        <th className="text-left px-4 py-3 font-bold">Used</th>
                        <th className="text-right px-5 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-3">
                            <span className="font-mono font-extrabold text-slate-900">{c.code}</span>
                            {!c.is_active && <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[9px] font-extrabold uppercase">off</span>}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {c.discount_type === 'percent' ? `${c.discount_value}%` : `৳${c.discount_value.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3 text-[10px] text-slate-500 leading-relaxed">
                            min ৳{c.min_order_amount.toLocaleString()}
                            {c.max_discount != null && ` Â· cap ৳${c.max_discount.toLocaleString()}`}
                            {c.usage_limit != null && ` Â· limit ${c.usage_limit}`}
                            {c.expires_at && ` Â· exp ${new Date(c.expires_at).toLocaleDateString('en-GB')}`}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">{c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ''}</td>
                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            <button onClick={() =>
                                api.apiUpdateCoupon(c.id, { is_active: !c.is_active })
                                  .then(() => setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x))))
                                  .catch((err) => toast.error(err.message))
                              }
                              aria-label={`${c.is_active ? 'Disable' : 'Enable'} coupon ${c.code}`}
                              className={`p-2 rounded-lg transition ${c.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                              <Power className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                                const ok = await confirmDialog({
                                  title: `Delete coupon ${c.code}?`,
                                  message: 'Customers will no longer be able to redeem it.',
                                  confirmText: 'Delete Coupon',
                                  danger: true
                                });
                                if (!ok) return;
                                api.apiDeleteCoupon(c.id)
                                  .then(() => { setCoupons((prev) => prev.filter((x) => x.id !== c.id)); toast.success('Coupon deleted.'); })
                                  .catch((err) => toast.error(err.message));
                              }}
                              aria-label={`Delete coupon ${c.code}`}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition ml-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SECURITY LOG */}
      {tab === 'security' && (
        <div className="space-y-3">
          {!isLiveMode ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              Audit logs are available in live Supabase mode.
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <ScrollText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No admin actions logged yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Role changes and sensitive admin actions appear here automatically.</p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3 text-xs">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg font-mono font-extrabold text-[10px]">{log.action}</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-700">
                    {log.target_type ?? '—'}
                    {log.target_id && <span className="font-mono text-slate-400"> #{String(log.target_id).slice(0, 8)}</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-md">
                    {Object.keys(log.details ?? {}).length > 0 ? JSON.stringify(log.details) : 'no details'}
                  </p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <p className="text-[10px] font-semibold text-slate-500">{new Date(log.created_at).toLocaleString('en-GB')}</p>
                  {log.actor_id && <p className="text-[10px] font-mono text-slate-400">actor …{log.actor_id.slice(-6)}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
