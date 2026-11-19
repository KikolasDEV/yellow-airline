'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguagePersistence() {
  const { i18n } = useTranslation();
  useEffect(() => {
    try {
      const language = localStorage.getItem('yellow-airline-language');
      if (language === 'es' || language === 'en') void i18n.changeLanguage(language);
    } catch { /* Storage may be unavailable in private browsing. */ }
    const save = (language: string) => {
      document.documentElement.lang = language;
      try { localStorage.setItem('yellow-airline-language', language); } catch { /* Optional preference. */ }
    };
    i18n.on('languageChanged', save);
    return () => { i18n.off('languageChanged', save); };
  }, [i18n]);
  return null;
}
