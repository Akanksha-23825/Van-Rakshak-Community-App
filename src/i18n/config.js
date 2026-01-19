import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: require('./translation/en.json')
  },
  hi: {
    translation: require('./translation/hi.json')
  },
  kn: { 
    translation: require('./translation/ka.json') 
  },
  ta: {
    translation: require('./translation/ta.json')
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;