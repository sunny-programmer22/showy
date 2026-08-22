const SITE = 'https://showy.jubair.bond';

const setMetaAttr = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, name] = selector.match(/\[(?:name|property)="([^"]+)"\]/) ?? [];
    if (selector.startsWith('meta[name]')) el.name = name;
    else el.setAttribute('property', name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

export interface SeoInput {
  title: string;
  description: string;
  /** Real path, e.g. "/products" — becomes the canonical URL. */
  path: string;
}

/** Updates title, description, canonical and OG/Twitter mirrors for the current route. */
export const setSeo = ({ title, description, path }: SeoInput) => {
  const fullTitle = title.includes('Showy') ? title : `${title} | Showy`;
  document.title = fullTitle;

  // Match GitHub Pages' final URL form (directories end with "/")
  const canonicalPath = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;

  setMetaAttr('meta[name="description"]', 'content', description);
  setMetaAttr('meta[property="og:title"]', 'content', fullTitle);
  setMetaAttr('meta[property="og:description"]', 'content', description);
  setMetaAttr('meta[property="og:url"]', 'content', `${SITE}${canonicalPath}`);
  setMetaAttr('meta[name="twitter:title"]', 'content', fullTitle);
  setMetaAttr('meta[name="twitter:description"]', 'content', description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = `${SITE}${canonicalPath}`;
};

export const SITE_URL = SITE;

/** Injects or replaces a JSON-LD script block. */
export const setJsonLd = (id: string, data: object | null) => {
  document.getElementById(`jsonld-${id}`)?.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = `jsonld-${id}`;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};
