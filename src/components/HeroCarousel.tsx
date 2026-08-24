import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Banner { id: string; image_url: string | null; headline: string; sub: string | null; link: string | null; }

const FALLBACK: Banner[] = [
  { id: 'f1', image_url: null, headline: 'Showy Store', sub: "Bangladesh's Multi-Vendor Marketplace", link: '' },
  { id: 'f2', image_url: null, headline: 'Fresh Drops Weekly', sub: 'Jerseys • Fashion • Gadgets from verified sellers', link: '' },
  { id: 'f3', image_url: null, headline: 'bKash • Nagad • COD', sub: 'Pay your way — nationwide delivery', link: '' },
  { id: 'f4', image_url: null, headline: 'Open Your Own Shop', sub: 'Free storefront • 95% of every sale is yours', link: '' },
];

const GRADS = [
  'linear-gradient(120deg,#4c1d95 0%,#7c3aed 45%,#1e1b4b 100%)',
  'linear-gradient(120deg,#0f766e 0%,#0ea5e9 50%,#1e1b4b 100%)',
  'linear-gradient(120deg,#9d174d 0%,#f43f5e 50%,#312e81 100%)',
  'linear-gradient(120deg,#92400e 0%,#f59e0b 50%,#1e1b4b 100%)',
];

const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<Banner[]>(FALLBACK);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('banners')
      .select('id,image_url,headline,sub,link')
      .eq('is_active', true)
      .order('sort', { ascending: true })
      .then(({ data }) => { if (data && data.length > 0) setSlides(data as Banner[]); }, () => {});
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  useEffect(() => { slides.forEach((s) => { if (s.image_url) { const im = new Image(); im.src = s.image_url; } }); }, [slides]);

  const go = (d: number) => setIdx((i) => (i + d + slides.length) % slides.length);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
        touchX.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={s.id} className="relative w-full h-full shrink-0" style={!s.image_url ? { background: GRADS[i % GRADS.length] } : undefined}>
            {s.image_url && <img src={s.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />}
            {/* Opacity: highest at bottom → lowest at very top */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="absolute bottom-6 left-4 sm:left-8 max-w-md">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 mb-1">
                <Sparkles className="w-3 h-3" /> Showy Store
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow">{s.headline}</h2>
              {s.sub && <p className="text-xs sm:text-sm text-slate-200 mt-1 drop-shadow">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous poster"
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 hover:bg-black/55 text-white transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Next poster"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 hover:bg-black/55 text-white transition">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 right-4 flex gap-1.5">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setIdx(i)} aria-label={`Go to poster ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
