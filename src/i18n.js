import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from './locales/vi/common.json';
import enCommon from './locales/en/common.json';

const resources = {
    vi: { common: viCommon },
    en: { common: enCommon }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'vi',
        fallbackLng: 'vi',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: { escapeValue: false }
    });

export const changeLanguageWithReload = async (lng) => {
    await i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
};

export default i18n;