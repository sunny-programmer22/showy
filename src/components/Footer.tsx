import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Lock, Percent } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { currentUser, shops } = useStore();
  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast Nationwide Delivery</h4>
              <p className="text-slate-400 mt-0.5">Coverage across all 64 districts in Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Guarantee</h4>
              <p className="text-slate-400 mt-0.5">Verified shops & direct official imports</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">5% Fair Commission Model</h4>
              <p className="text-slate-400 mt-0.5">Transparent payout split for all vendor stores</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Automated bKash / Nagad</h4>
              <p className="text-slate-400 mt-0.5">Instant OTP payment verification engine</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-brand-600 text-white rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">
                Showy
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation Bangladeshi multi-vendor e-commerce platform where any user can start their own digital storefront in minutes.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-2">Supported Payment Gateways</span>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-bkash text-white text-[10px] font-extrabold rounded-md shadow-sm">
                  bKash OTP
                </span>
                <span className="px-2.5 py-1 bg-nagad text-white text-[10px] font-extrabold rounded-md shadow-sm">
                  Nagad PGW
                </span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md border border-slate-700">
                  VISA / Master
                </span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md border border-slate-700">
                  COD
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#/products" className="hover:text-brand-400 transition">Browse Products</a></li>
              <li><a href="#/shops" className="hover:text-brand-400 transition">Explore Vendor Shops</a></li>
              {!userShop && <li><a href="#/create-shop" className="hover:text-brand-400 transition">Open Your Store</a></li>}
              <li><a href="#/track-order" className="hover:text-brand-400 transition">Order Status & Invoice</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">For Shop Owners</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#/vendor-dashboard" className="hover:text-brand-400 transition">Vendor Dashboard</a></li>
              <li><a href="#/upload-product" className="hover:text-brand-400 transition">Upload New Product</a></li>
              <li><a href="#/vendor-dashboard" className="hover:text-brand-400 transition">Withdrawal & Wallet</a></li>
              <li><span className="text-emerald-400 font-semibold">95% Net Revenue Share</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">About the Platform</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              A trusted multi-vendor marketplace connecting verified merchants with buyers across Bangladesh.
            </p>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] text-slate-300">
              <span className="font-bold text-brand-400">5% Auto Split Engine:</span> All vendor sales automatically deduct 5% for platform maintenance and credit 95% to the vendor ledger.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 Showy — Complete Multi-Vendor E-Commerce Platform.</p>
        </div>
      </div>
    </footer>
  );
};
