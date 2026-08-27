let loaded = false;
const ZONES = ['hilltop_7356389.js', 'hilltop_7356401.js'];
export const initHilltop = () => {
  if (typeof window === 'undefined' || loaded) return;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;
  const blocked = ['/admin-panel', '/vendor-dashboard', '/checkout', '/cart', '/settings'];
  const path = window.location.pathname;
  if (blocked.some((p) => path.includes(p))) return;
  if (document.querySelector('script[src*="hilltop_"]')) { loaded = true; return; }
  ZONES.forEach((file) => {
    const s = document.createElement('script');
    s.src = `/${file}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => {};
    document.head.appendChild(s);
  });
  loaded = true;
};
