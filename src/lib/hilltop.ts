let loaded = false;
export const initHilltop = () => {
  if (typeof window === 'undefined' || loaded) return;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;
  const blocked = ['/admin-panel', '/vendor-dashboard', '/checkout', '/cart', '/settings'];
  const path = window.location.pathname;
  if (blocked.some((p) => path.includes(p))) return;
  if (document.querySelector('script[src*="hilltop_7353953"]')) { loaded = true; return; }
  const s = document.createElement('script');
  s.src = '/hilltop_7353953.js';
  s.async = true;
  s.defer = true;
  s.onload = () => { loaded = true; };
  s.onerror = () => { /* silent — adblock */ };
  document.head.appendChild(s);
  loaded = true;
};
