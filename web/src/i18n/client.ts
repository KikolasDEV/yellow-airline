'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import { product } from './product';

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      es: { translation: { ...resources.es.translation, ...product.es } },
      en: { translation: { ...resources.en.translation, ...product.en } },
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
