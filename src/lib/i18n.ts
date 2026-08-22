import { useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'bn';
const KEY = 'showy_lang';
const EVENT = 'showy-lang-change';

type Dict = Record<string, { en: string; bn: string }>;

export const STRINGS: Dict = {
  home: { en: 'Home', bn: 'হোম' },
  browse: { en: 'Browse', bn: 'ব্রাউজ' },
  cart: { en: 'Cart', bn: 'কার্ট' },
  shops: { en: 'Shops', bn: 'শপ' },
  orders: { en: 'Orders', bn: 'অর্ডার' },
  addToCart: { en: 'Add to Cart', bn: 'কার্টে যোগ করুন' },
  addedToCart: { en: 'Added ✓', bn: 'যোগ হয়েছে ✓' },
  buyNow: { en: 'Buy Now', bn: 'এখনই কিনুন' },
  checkout: { en: 'Proceed to Checkout', bn: 'চেকআউট করুন' },
  yourCart: { en: 'Your Cart', bn: 'আপনার কার্ট' },
  search: { en: 'Search products…', bn: 'পণ্য খুঁজুন…' },
  signIn: { en: 'Sign In', bn: 'লগইন' },
  sell: { en: 'Sell', bn: 'বিক্রি' }
};

export type StringKey = keyof typeof STRINGS;

const readLang = (): Lang => (localStorage.getItem(KEY) === 'bn' ? 'bn' : 'en');

export const useLang = () => {
  const [lang, setLang] = useState<Lang>(readLang);

  useEffect(() => {
    const sync = () => setLang(readLang());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const setLanguage = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((k: StringKey) => STRINGS[k][readLang()], [lang]);

  return { lang, setLanguage, t, toggleLang: () => setLanguage(readLang() === 'en' ? 'bn' : 'en') };
};
