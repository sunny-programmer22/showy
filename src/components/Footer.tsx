import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Lock, Percent, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { currentUser, shops } = useStore();
  const userShop = currentUser ? shops.find((s) => s.owner_id === currentUser.id) : null;

  const go = (page: string) => () => {
    if (onNavigate) onNavigate(page);
    else window.location.assign(page === 'home' ? '/' : `/${page}`);
  };

  const NavLink: React.FC<{ label: string; page: string }> = ({ label, page }) => (
    <li>
      <button onClick={go(page)}
        className="group inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
        <span className="relative">
          {label}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand-400 transition-all duration-300 group-hover:w-full" />
        </span>
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
      </button>
    </li>
  );

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-14 pb-8 overflow-hidden">
      {/* Top hairline glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[42rem] h-64 bg-brand-600/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-white/5 text-xs">
          {[
            { icon: Truck, tint: 'bg-brand-500/10 text-brand-400', title: 'Fast Nationwide Delivery', desc: 'Coverage across all 64 districts in Bangladesh' },
            { icon: ShieldCheck, tint: 'bg-emerald-500/10 text-emerald-400', title: '100% Genuine Guarantee', desc: 'Verified shops & direct official imports' },
            { icon: Percent, tint: 'bg-purple-500/10 text-purple-400', title: 'Best Prices Guaranteed', desc: 'Fair deals from verified sellers nationwide' },
            { icon: Lock, tint: 'bg-amber-500/10 text-amber-400', title: 'Automated bKash / Nagad', desc: 'Instant OTP payment verification engine' }
          ].map((f) => (
            <div key={f.title} className="flex items-start space-x-3 group">
              <div className={`p-3 ${f.tint} rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{f.title}</h4>
                <p className="text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 py-12">
          <div className="space-y-4">
            <button onClick={go('home')} className="flex items-center space-x-2 group w-fit">
              <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg shadow-lg shadow-brand-900/40 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Showy
              </span>
            </button>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              The next-generation Bangladeshi multi-vendor e-commerce platform where anyone can launch their own digital storefront in minutes.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider block mb-2">Supported Payment Gateways</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-bkash text-white text-[10px] font-extrabold rounded-md shadow-sm">bKash OTP</span>
                <span className="px-2.5 py-1 bg-nagad text-white text-[10px] font-extrabold rounded-md shadow-sm">Nagad PGW</span>
                <span className="px-2 py-1 bg-slate-800/80 text-slate-300 text-[10px] font-bold rounded-md border border-white/5">VISA / Master</span>
                <span className="px-2 py-1 bg-slate-800/80 text-slate-300 text-[10px] font-bold rounded-md border border-white/5">COD</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <NavLink label="Browse Products" page="products" />
              <NavLink label="Explore Vendor Shops" page="shops" />
              {!userShop && <NavLink label="Open Your Store" page="create-shop" />}
              <NavLink label="My Orders & Invoices" page="orders" />
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">For Shop Owners</h4>
            <ul className="space-y-2.5 text-xs">
              <NavLink label="Vendor Dashboard" page="vendor-dashboard" />
              {!userShop && <NavLink label="Create Your Shop" page="create-shop" />}
              {userShop && <NavLink label="Upload New Product" page="upload-product" />}
              <li><span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold"><Percent className="w-3.5 h-3.5" />Transparent Payouts</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs">
              <NavLink label="About Showy" page="about" />
              <NavLink label="Contact Us" page="contact" />
              <NavLink label="FAQ" page="faq" />
              <NavLink label="Buying Guides" page="guides" />
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">About the Platform</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              A trusted multi-vendor marketplace connecting verified merchants with buyers across Bangladesh.
            </p>
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-brand-400">Fast Payouts:</span>{' '}
              Vendor earnings are settled securely to bKash, Nagad or bank accounts.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>Â© 2026 Showy — Complete Multi-Vendor E-Commerce Platform.</p>
          <div className="flex items-center gap-4">
            <button onClick={go('privacy')} className="hover:text-brand-400 transition-colors">Privacy Policy</button>
            <span aria-hidden="true" className="text-slate-700">Â·</span>
            <button onClick={go('terms')} className="hover:text-brand-400 transition-colors">Terms &amp; Conditions</button>
            <span aria-hidden="true" className="text-slate-700">Â·</span>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
