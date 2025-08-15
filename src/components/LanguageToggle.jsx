import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'vi';

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <span className="text-xl mr-2">
        {currentLanguage === 'vi' ? '🇻🇳' : '🇺🇸'}
      </span>
      <span className="text-sm font-medium">
        {currentLanguage === 'vi' ? 'VI' : 'EN'}
      </span>
    </button>
  );
}

export default LanguageToggle;