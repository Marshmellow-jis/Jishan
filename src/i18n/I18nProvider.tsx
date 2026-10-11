import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import english from './en.json';
import catalogs from './locales.json';

export const languages = [
  { code: 'en', nativeName: 'English', voice: 'en-IN', direction: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी', voice: 'hi-IN', direction: 'ltr' },
  { code: 'bn', nativeName: 'বাংলা', voice: 'bn-IN', direction: 'ltr' },
  { code: 'te', nativeName: 'తెలుగు', voice: 'te-IN', direction: 'ltr' },
  { code: 'mr', nativeName: 'मराठी', voice: 'mr-IN', direction: 'ltr' },
  { code: 'ta', nativeName: 'தமிழ்', voice: 'ta-IN', direction: 'ltr' },
  { code: 'gu', nativeName: 'ગુજરાતી', voice: 'gu-IN', direction: 'ltr' },
  { code: 'ur', nativeName: 'اردو', voice: 'ur-IN', direction: 'rtl' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', voice: 'kn-IN', direction: 'ltr' },
  { code: 'ml', nativeName: 'മലയാളം', voice: 'ml-IN', direction: 'ltr' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', voice: 'pa-IN', direction: 'ltr' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', voice: 'or-IN', direction: 'ltr' },
  { code: 'as', nativeName: 'অসমীয়া', voice: 'as-IN', direction: 'ltr' },
] as const;

export type LanguageCode = typeof languages[number]['code'];
export type MessageKey = keyof typeof english;
type Catalog = Record<string, string>;
const messageCatalogs = catalogs as Record<LanguageCode, Catalog>;
const localeStorageKey = 'agrishield.language.v1';
const easyStorageKey = 'agrishield.easy-view.v1';

interface I18nContextValue {
  language: LanguageCode;
  locale: string;
  direction: 'ltr' | 'rtl';
  easyView: boolean;
  setLanguage: (language: LanguageCode) => void;
  toggleEasyView: () => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(localeStorageKey);
    if (languages.some((item) => item.code === stored)) return stored as LanguageCode;
  } catch { /* Storage may be disabled. */ }
  const preferences = typeof navigator === 'undefined' ? [] : [...(navigator.languages || []), navigator.language];
  for (const preference of preferences) {
    const code = preference.toLowerCase().split(/[-_]/, 1)[0];
    const match = languages.find((item) => item.code === code);
    if (match) return match.code;
  }
  return 'en';
}

function readEasyView(): boolean {
  try {
    const stored = localStorage.getItem(easyStorageKey);
    if (stored === '0') return false;
    if (stored === '1') return true;
  } catch { /* use the accessible default */ }
  return true;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readLanguage);
  const [easyView, setEasyView] = useState<boolean>(readEasyView);
  const definition = languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    document.documentElement.lang = definition.voice;
    document.documentElement.dir = definition.direction;
    document.body.dataset.language = language;
  }, [definition, language]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    try { localStorage.setItem(localeStorageKey, next); } catch { /* selection remains active for this page */ }
    window.speechSynthesis?.cancel();
  }, []);

  const toggleEasyView = useCallback(() => {
    setEasyView((current) => {
      const next = !current;
      try { localStorage.setItem(easyStorageKey, next ? '1' : '0'); } catch { /* selection remains active for this page */ }
      return next;
    });
  }, []);

  const t = useCallback((key: MessageKey, values?: Record<string, string | number>) => {
    const text = messageCatalogs[language]?.[key] || english[key] || key;
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder));
  }, [language]);

  const value = useMemo(() => ({
    language,
    locale: definition.voice,
    direction: definition.direction,
    easyView,
    setLanguage,
    toggleEasyView,
    t,
  }), [language, definition, easyView, setLanguage, toggleEasyView, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider.');
  return context;
}
