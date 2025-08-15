// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import HttpBackend from 'i18next-http-backend';

// // ✅ Flag để tránh infinite reload loop
// let isManualLanguageChange = false;

// i18n
//     .use(HttpBackend) // tải JSON dịch từ /locales/{lng}/{ns}.json
//     .use(LanguageDetector) // phát hiện từ navigator, query, localStorage...
//     .use(initReactI18next)
//     .init({
//         fallbackLng: 'vi',
//         supportedLngs: ['en', 'vi'],
//         ns: ['common', 'nav', 'home', 'about', 'product', 'news', 'contact', 'banner'],
//         defaultNS: 'common',

//         // ✅ PRELOAD all languages and namespaces
//         preload: ['en', 'vi'],

//         debug: false,
//         interpolation: { escapeValue: false },

//         detection: {
//             order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
//             caches: ['localStorage']
//         },

//         backend: {
//             loadPath: '/locales/{{lng}}/{{ns}}.json',
//             // Add cache busting to ensure fresh translations
//             queryStringParams: { v: new Date().getTime() }
//         },

//         // ✅ Load options
//         load: 'languageOnly', // load 'en' thay vì 'en-US'
//         cleanCode: true,

//         // ✅ Fallback options
//         returnNull: false,
//         returnEmptyString: false,
//         returnObjects: false,

//         // ✅ Namespace fallback
//         fallbackNS: 'common'
//     });

// // ✅ CHỈ reload khi language change là MANUAL và thực sự cần reload
// i18n.on('languageChanged', (lng) => {
//     console.log(`🔄 Language changed to: ${lng}`);

//     if (isManualLanguageChange) {
//         console.log(`🔄 Manual language change detected, preparing reload...`);

//         // Store the new language in localStorage để persist
//         localStorage.setItem('i18nextLng', lng);

//         // Reset flag trước khi reload
//         isManualLanguageChange = false;

//         // Thêm delay để đảm bảo state được update và localStorage được lưu
//         setTimeout(() => {
//             console.log(`🔄 Reloading page for language change...`);
//             window.location.reload();
//         }, 300);
//     } else {
//         console.log(`ℹ️ Auto language detection or programmatic change, no reload needed`);
//     }
// });

// // ✅ Function để trigger manual language change với smooth transition
// export const changeLanguageWithReload = (newLanguage) => {
//     console.log(`🔧 changeLanguageWithReload called with: ${newLanguage}`);
//     console.log(`📍 Current language: ${i18n.language}`);

//     // Nếu ngôn ngữ giống nhau thì không làm gì
//     if (i18n.language === newLanguage) {
//         console.log(`⚠️ Same language, no change needed`);
//         return Promise.resolve();
//     }

//     console.log(`📍 Setting isManualLanguageChange = true`);
//     isManualLanguageChange = true;

//     // Thêm visual feedback với smooth loading
//     document.body.style.opacity = '0.8';
//     document.body.style.pointerEvents = 'none';
//     document.body.style.transition = 'opacity 0.3s ease';

//     console.log(`📍 Calling i18n.changeLanguage(${newLanguage})`);
//     return i18n.changeLanguage(newLanguage);
// };

// // ✅ Function để check xem có đang trong quá trình chuyển đổi ngôn ngữ không
// export const isLanguageChanging = () => isManualLanguageChange;

// export default i18n;