import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

interface GuidesPageProps { onNavigate: (page: string) => void; }

export const GuidesPage: React.FC<GuidesPageProps> = ({ onNavigate }) => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div className="text-center space-y-2">
      <BookOpen className="w-10 h-10 text-brand-600 mx-auto" />
      <h1 className="text-3xl font-extrabold text-slate-900">Showy Buying Guides</h1>
      <p className="text-sm text-slate-500 max-w-2xl mx-auto">Expert tips to help you shop smarter in Bangladesh — from jerseys to gadgets, written for Bangladeshi shoppers.</p>
    </div>

    <div className="grid gap-6">
      {[
        { title: 'How to Choose the Perfect Jersey Size', excerpt: 'Bangladeshi sizing vs international — chest, length, and fit tips for football and cricket jerseys. Avoid returns with our size chart.', href: 'products' },
        { title: 'bKash vs Nagad vs COD — Which Payment Suits You?', excerpt: 'Compare OTP security, fees, and delivery times for online shopping in BD. Learn when COD makes sense.', href: 'faq' },
        { title: 'Spotting Genuine Products from Verified Sellers', excerpt: '5 checks before you buy electronics and fashion online — verification badges, reviews, and return policy.', href: 'shops' },
        { title: 'Nationwide Delivery Explained — 64 Districts', excerpt: 'How Showy delivers from Dhaka to Gaibandha, Rangpur, Chattogram — timelines, tracking, and costs.', href: 'faq' },
      ].map((g) => (
        <div key={g.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <h2 className="font-extrabold text-slate-900">{g.title}</h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{g.excerpt}</p>
          <button onClick={() => onNavigate(g.href)} className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">Read more <ArrowRight className="w-4 h-4" /></button>
        </div>
      ))}
    </div>

    <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
      <h3 className="font-extrabold">Have a question not covered?</h3>
      <p className="text-sm text-slate-300 mt-1">Ask our sellers directly on product pages — Q&A is answered within 24h.</p>
      <button onClick={() => onNavigate('contact')} className="mt-3 px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold">Contact Support</button>
    </div>
  </div>
);
