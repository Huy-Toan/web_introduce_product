import {  useState, useEffect  } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguageWithReload } from '../i18n';
const LanguageSwitcher = ({
  variant = 'select'
}) => {
  const { i18n, t } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState(0);
  const currentLanguage = i18n.language || 'vi';

  // Language options với flag icons
  const languages = [
    {
      code: 'vi',
      name: t('auto.tieng_viet'),
      flag: '🇻🇳',
      shortName: 'VI'
    },
    {
      code: 'en',
      name: t('auto.tieng_anh'),
      flag: '🇺🇸',
      shortName: 'EN'
    }
  ];
  const handleLanguageChange = async newLanguage => {
    const now = Date.now();

    // Prevent rapid clicks (2 second cooldown)
    if (now - lastChangeTime < 2000 || isChanging) {
      console.log(`⚠️ Preventing rapid language change`);
      return;
    }

    // Same language check
    if (currentLanguage === newLanguage) {
      console.log(`⚠️ Same language selected`);
      return;
    }
    console.log(`🌐 Switching language from ${currentLanguage} to ${newLanguage}`);
    setIsChanging(true);
    setLastChangeTime(now);
    try {
      // Show loading feedback
      const loadingToast = document.createElement('div');
      loadingToast.id = 'language-loading-toast';
      loadingToast.className = `
        fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50
        flex items-center space-x-2 transition-all duration-300 transform
      `;
      loadingToast.innerHTML = `
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${t('auto.dang_chuyen_doi_ngon_ngu')}</span>
      `;
      document.body.appendChild(loadingToast);

      // Trigger language change with reload
      await changeLanguageWithReload(newLanguage);
    } catch (error) {
      console.error('❌ Language change failed:', error);
      setIsChanging(false);

      // Remove loading toast on error
      const toast = document.getElementById('language-loading-toast');
      if (toast) toast.remove();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const toast = document.getElementById('language-loading-toast');
      if (toast) toast.remove();
    };
  }, []);

  // Select dropdown variant (mặc định)
  if (variant === 'select') {
    return <div className="relative inline-block">
        <select value={currentLanguage} onChange={e => handleLanguageChange(e.target.value)} disabled={isChanging} className={`
            appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm font-medium text-gray-700 cursor-pointer min-w-[140px]
            ${isChanging ? 'opacity-50 cursor-wait' : 'hover:border-gray-400'}
            transition-all duration-200
          `}>
          {languages.map(lang => <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>)}
        </select>

        {/* Loading overlay */}
        {isChanging && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>}

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>;
  }

  // Button toggle variant
  if (variant === 'toggle') {
    const currentLang = languages.find(lang => lang.code === currentLanguage);
    const otherLang = languages.find(lang => lang.code !== currentLanguage);
    return <button onClick={() => handleLanguageChange(otherLang.code)} disabled={isChanging} className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300
          text-sm font-medium transition-all duration-200
          ${isChanging ? 'opacity-50 cursor-wait bg-gray-100' : 'hover:bg-gray-50 hover:border-gray-400 cursor-pointer bg-white'}
        `} title={`Switch to ${otherLang.name}`}>
        {isChanging ? <>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>{t('auto.dang_chuyen_doi')}</span>
          </> : <>
            <span className="text-xl">{currentLang?.flag}</span>
            <span>{currentLang?.shortName}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xl">{otherLang?.flag}</span>
            <span>{otherLang?.shortName}</span>
          </>}
      </button>;
  }

  // Compact flag variant
  if (variant === 'flags') {
    return <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {languages.map(lang => <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} disabled={isChanging} className={`
              flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium
              transition-all duration-200 min-w-[50px] justify-center
              ${currentLanguage === lang.code ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
              ${isChanging ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            `}>
            {isChanging && currentLanguage !== lang.code ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <>
                <span>{lang.flag}</span>
                <span>{lang.shortName}</span>
              </>}
          </button>)}
      </div>;
  }
  return null;
};
export default LanguageSwitcher;