import React, { useState } from 'react';
import {
  ArrowLeft, Info, Mail, HelpCircle, ShieldCheck, FileText,
  Store, Percent, Truck, BadgeCheck, Send, Phone, Clock,
  ChevronDown
} from 'lucide-react';
import { toast } from '../components/ui/Toast';

/* ----------------------------- Shared shell ------------------------------ */

interface ShellProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tint?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ icon: Icon, title, subtitle, tint = 'bg-brand-500/10 text-brand-600', onBack, children }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition">
      <ArrowLeft className="w-4 h-4" /> Back
    </button>

    <div className="flex items-center gap-4 mb-8">
      <div className={`p-3.5 rounded-2xl ${tint}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>

    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-7">
    <h2 className="font-extrabold text-slate-900 text-base mb-2 flex items-center gap-2">
      <span className="w-1 h-4 bg-brand-500 rounded-full" aria-hidden="true" />{title}
    </h2>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
  </section>
);

const PlaceholderNote: React.FC = () => (
  <p className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 leading-relaxed">
    One detail remains: replace <span className="underline">[Full Registered Address]</span> with your real
    business address once registered. This template is not legal advice — consider having a lawyer review
    your final Privacy Policy and Terms &amp; Conditions.
  </p>
);

/* -------------------------------- About ---------------------------------- */

export const AboutPage: React.FC<{ onBack: () => void; onNavigate?: (page: string) => void }> = ({ onBack, onNavigate }) => (
  <Shell icon={Info} title="About Showy" subtitle="Bangladesh's multi-vendor marketplace" onBack={onBack}>
    <Section title="Our Mission">
      <p>
        Showy exists to make selling online in Bangladesh effortless. We connect independent merchants
        with shoppers across all 64 districts — giving every seller a beautiful storefront in minutes and
        every buyer a trusted place to discover genuine products.
      </p>
    </Section>

    <div className="grid grid-cols-2 gap-3 mb-8">
      {[
        { icon: Store, label: 'Multi-vendor storefronts', desc: 'Any business can open a shop instantly' },
        { icon: Percent, label: 'Fair 5% commission', desc: 'Sellers keep 95% of every sale' },
        { icon: BadgeCheck, label: 'Verified sellers', desc: 'Shops are reviewed before they sell' },
        { icon: Truck, label: 'Nationwide delivery', desc: 'Cash on delivery everywhere' }
      ].map((f) => (
        <div key={f.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <f.icon className="w-5 h-5 text-brand-600 mb-2" />
          <p className="text-xs font-extrabold text-slate-800">{f.label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
        </div>
      ))}
    </div>

    <Section title="How the Marketplace Works">
      <ol className="list-decimal list-inside space-y-1.5">
        <li>Sellers create a shop and upload products in minutes.</li>
        <li>Buyers pay securely via bKash / Nagad OTP, card, or cash on delivery.</li>
        <li>Every order is split automatically: vendors receive 95%, Showy keeps a 5% platform fee.</li>
        <li>Vendors ship, update status live, and withdraw earnings to bKash / Nagad / bank.</li>
      </ol>
    </Section>

    {onNavigate && (
      <div className="flex flex-wrap gap-3">
        <button onClick={() => onNavigate('shops')} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition">
          Explore Vendor Shops
        </button>
        <button onClick={() => onNavigate('create-shop')} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition">
          Open Your Own Store
        </button>
      </div>
    )}
  </Shell>
);

/* ------------------------------- Contact --------------------------------- */

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Showy support request from ${name || 'a customer'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:siddiknurealam1@gmail.com?subject=${subject}&body=${body}`;
    toast.info('Opening your email app…');
  };

  return (
    <Shell icon={Mail} title="Contact Us" subtitle="We usually reply within 24 hours" tint="bg-emerald-500/10 text-emerald-600" onBack={onBack}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: Mail, label: 'Email', value: 'siddiknurealam1@gmail.com' },
          { icon: Phone, label: 'Hotline', value: '01863875033' },
          { icon: Clock, label: 'Hours', value: 'Sat–Thu, 10am – 7pm' }
        ].map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
            <c.icon className="w-5 h-5 mx-auto text-brand-600 mb-1.5" />
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{c.label}</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5 break-words">{c.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-lg p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Send a Message</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className={inputCls} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" autoComplete="email" className={inputCls} />
        </div>
        <textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" aria-label="Your message" className={`${inputCls} resize-none`} />
        <button type="submit" className="btn-shine w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Send Message
        </button>
      </form>
    </Shell>
  );
};

/* --------------------------------- FAQ ----------------------------------- */

const FAQS: { q: string; a: string }[] = [
  { q: 'How do I place an order?', a: 'Browse products, pick your size/options if available, add to cart and proceed to checkout. You can pay via bKash or Nagad OTP verification, card, or cash on delivery.' },
  { q: 'Is cash on delivery available?', a: 'Yes. Select "Cash on Delivery" at checkout and pay the courier when your parcel arrives. A confirmation call may be made before dispatch.' },
  { q: 'How long does delivery take?', a: 'Dhaka deliveries typically arrive in 1–3 working days; outside Dhaka in 2–5 working days. You can follow the live status on your Orders page.' },
  { q: 'What is the return policy?', a: 'Most products include a 7-day return window unless the seller marked them as final sale ("No Returns" badge). Items must be unused and in original packaging.' },
  { q: 'How do I open my own shop?', a: 'Create an account, choose "Create Your Shop", add your shop name, logo and payout numbers. Once created you can upload products immediately from the vendor dashboard.' },
  { q: 'What commission does Showy take?', a: 'A flat 5% platform fee is deducted automatically from each sale through the auto-split engine — you keep 95%. Your flagship/admin store pays nothing.' },
  { q: 'When do I get paid as a seller?', a: 'Earnings appear in your vendor wallet after each paid order. Request a withdrawal anytime to your bKash, Nagad, or bank account from the dashboard wallet tab.' },
  { q: 'Why do some products ask me to choose a size?', a: 'Sellers can define options like S/M/L or colors, each with its own stock and price. The option must be selected before adding that product to the cart.' },
  { q: 'Is my payment information safe?', a: 'Payments are verified directly through bKash/Nagad OTP flows. We never store your mobile wallet PIN or full card details on our servers.' }
];

export const FaqPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell icon={HelpCircle} title="FAQ" subtitle="Quick answers to common questions" tint="bg-purple-500/10 text-purple-600" onBack={onBack}>
    <div className="space-y-3">
      {FAQS.map((f, i) => (
        <details key={i} className="group bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden open:shadow-md transition-shadow">
          <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-5 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
        </details>
      ))}
    </div>
  </Shell>
);

/* -------------------------------- Privacy -------------------------------- */

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell icon={ShieldCheck} title="Privacy Policy" subtitle="Effective date: 22 August 2026" tint="bg-emerald-500/10 text-emerald-600" onBack={onBack}>
    <Section title="1. Who We Are">
      <p>
        Showy ("Showy", "we", "us") operates the showy.jubair.bond marketplace.
        Registered office: [Full Registered Address], Bangladesh. Contact: siddiknurealam1@gmail.com · 01863875033.
      </p>
    </Section>
    <Section title="2. Data We Collect">
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Account data:</strong> name, email, phone number.</li>
        <li><strong>Order data:</strong> shipping addresses, order history, invoices.</li>
        <li><strong>Payment references:</strong> transaction IDs from bKash/Nagad/card gateways. We never store wallet PINs or full card numbers.</li>
        <li><strong>Seller data:</strong> shop details, payout account numbers, product listings.</li>
      </ul>
    </Section>
    <Section title="3. How We Use It">
      <p>To process orders and payments, enable delivery, provide customer support, prevent fraud, and improve the marketplace. Marketing emails are opt-in only.</p>
    </Section>
    <Section title="4. Sharing">
      <p>We share only what is necessary: delivery address with couriers, payout details with financial providers, and disclosures required by Bangladeshi law. We do not sell personal data.</p>
    </Section>
    <Section title="5. Retention & Security">
      <p>Data is stored on encrypted Supabase infrastructure with row-level security and admin audit logging. Order records are retained as required for accounting and dispute resolution.</p>
    </Section>
    <Section title="6. Your Rights">
      <p>You may request access, correction, or deletion of your personal data by emailing siddiknurealam1@gmail.com. Deleting an account removes profile data; completed order records may be retained legally.</p>
    </Section>
    <PlaceholderNote />
  </Shell>
);

/* --------------------------------- Terms ---------------------------------- */

export const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell icon={FileText} title="Terms & Conditions" subtitle="Last updated: 22 August 2026" tint="bg-amber-500/10 text-amber-600" onBack={onBack}>
    <Section title="1. Agreement">
      <p>
        By using Showy (showy.jubair.bond) you agree to these terms with Showy,
        [Full Registered Address], Bangladesh (siddiknurealam1@gmail.com · 01863875033). If you do not agree, please do not use the platform.
      </p>
    </Section>
    <Section title="2. Accounts & Eligibility">
      <p>You must be 18+ (or supervised by a guardian) to purchase. Account holders are responsible for safeguarding credentials and for activity under their account.</p>
    </Section>
    <Section title="3. Marketplace Role">
      <p>Showy is a venue connecting buyers and independent sellers. Sellers are responsible for their listings, accuracy, quality, and fulfilment. Showy facilitates payments, enforces policies, and holds a 5% commission on vendor sales.</p>
    </Section>
    <Section title="4. Payments">
      <p>Prices are in Bangladeshi Taka (৳). Payments are processed via bKash/Nagad OTP, cards, or cash on delivery. Payment confirms the order; a transaction ID is issued for each purchase.</p>
    </Section>
    <Section title="5. Shipping, Returns & Disputes">
      <p>Sellers dispatch per stated timelines. Products carry a 7-day return window unless listed as final sale. Report issues within the window via the Orders page or siddiknurealam1@gmail.com; we mediate disputes between buyers and sellers in good faith.</p>
    </Section>
    <Section title="6. Prohibited Use">
      <p>Listings and behaviour violating Bangladeshi law — counterfeit goods, weapons, drugs, adult content, fraudulent listings, or abuse of other users — are prohibited and removed without notice.</p>
    </Section>
    <Section title="7. Liability">
      <p>The service is provided "as is". To the maximum extent permitted by law, Showy's aggregate liability for any claim is limited to the commission earned on the relevant order. Nothing limits liability that cannot be limited by law.</p>
    </Section>
    <Section title="8. Governing Law & Changes">
      <p>These terms are governed by the laws of Bangladesh, courts of Dhaka having exclusive jurisdiction. We may update these terms; material changes will be announced on the site with a revised effective date.</p>
    </Section>
    <PlaceholderNote />
  </Shell>
);
