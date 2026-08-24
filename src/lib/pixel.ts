declare global { interface Window { fbq?: (...args: any[]) => void; _fbq?: any } }

export const initPixel = () => {
  const id = (import.meta as any).env?.VITE_FB_PIXEL_ID as string | undefined;
  if (!id || typeof window === 'undefined' || window.fbq) return;
  (function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      (f.fbq.callMethod ? f.fbq.callMethod.apply(f.fbq, arguments) : f.fbq.queue.push(arguments));
    });
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    const t: any = b.createElement(e); t.async = !0; t.src = v; const s: any = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq!('init', id);
  window.fbq!('track', 'PageView');
};

export const track = (event: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', event, params);
};
export const trackViewContent = (productId: string, value: number) => track('ViewContent', { content_ids: [productId], content_type: 'product', value, currency: 'BDT' });
export const trackAddToCart = (productId: string, value: number) => track('AddToCart', { content_ids: [productId], content_type: 'product', value, currency: 'BDT' });
export const trackPurchase = (orderId: string, value: number) => track('Purchase', { content_ids: [orderId], value, currency: 'BDT' });
