import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { changeLanguageWithReload } from '../i18n';

/**
 * Hook tùy chỉnh để quản lý việc chuyển đổi ngôn ngữ
 * Cung cấp trạng thái loading và các function helper
 */
export const useLanguageSwitch = () => {
  const { i18n, t } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState(0);
  const currentLanguage = i18n.language || 'vi';

  // Ngôn ngữ được hỗ trợ
  const supportedLanguages = [
    {
      code: 'vi',
      name: t('auto.tieng_viet_2'),
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

  /**
   * Chuyển đổi ngôn ngữ với protection và visual feedback
   */
  const switchLanguage = async (newLanguage, options = {}) => {
    const {
      cooldownMs = 2000,
      showToast = true,
      onStart = null,
      onSuccess = null,
      onError = null
    } = options;
    const now = Date.now();

    // Prevent rapid switching
    if (now - lastChangeTime < cooldownMs || isChanging) {
      console.log(`⚠️ Preventing rapid language switch (cooldown: ${cooldownMs}ms)`);
      return false;
    }

    // Same language check
    if (currentLanguage === newLanguage) {
      console.log(`⚠️ Already using language: ${newLanguage}`);
      return false;
    }
    console.log(`🌐 Initiating language switch: ${currentLanguage} → ${newLanguage}`);
    setIsChanging(true);
    setLastChangeTime(now);

    // Callback on start
    if (onStart) onStart(newLanguage);
    try {
      // Show loading toast nếu enabled
      if (showToast) {
        showLanguageLoadingToast(newLanguage);
      }

      // Trigger language change with reload
      await changeLanguageWithReload(newLanguage);

      // Callback on success
      if (onSuccess) onSuccess(newLanguage);
      return true;
    } catch (error) {
      console.error('❌ Language switch failed:', error);
      setIsChanging(false);

      // Remove loading toast on error
      if (showToast) {
        hideLanguageLoadingToast();
      }

      // Callback on error
      if (onError) onError(error, newLanguage);
      return false;
    }
  };

  /**
   * Toggle giữa 2 ngôn ngữ (VI ↔ EN)
   */
  const toggleLanguage = (options = {}) => {
    const otherLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    return switchLanguage(otherLanguage, options);
  };

  /**
   * Lấy thông tin ngôn ngữ hiện tại
   */
  const getCurrentLanguageInfo = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage);
  };

  /**
   * Lấy thông tin ngôn ngữ khác (cho toggle)
   */
  const getOtherLanguageInfo = () => {
    const otherCode = currentLanguage === 'vi' ? 'en' : 'vi';
    return supportedLanguages.find(lang => lang.code === otherCode);
  };

  /**
   * Check xem ngôn ngữ có được hỗ trợ không
   */
  const isLanguageSupported = langCode => {
    return supportedLanguages.some(lang => lang.code === langCode);
  };
  return {
    // States
    currentLanguage,
    isChanging,
    supportedLanguages,
    // Actions
    switchLanguage,
    toggleLanguage,
    // Helpers
    getCurrentLanguageInfo,
    getOtherLanguageInfo,
    isLanguageSupported,
    // Raw i18n access
    i18n
  };
};

/**
 * Show loading toast khi chuyển ngôn ngữ
 */
const showLanguageLoadingToast = targetLanguage => {
  // Remove existing toast first
  hideLanguageLoadingToast();
  const langNames = {
    vi: i18next.t('auto.tieng_viet_2'),
    en: i18next.t('auto.tieng_anh')
  };
  const toast = document.createElement('div');
  toast.id = 'language-loading-toast';
  toast.className = `
    fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl z-50
    flex items-center space-x-3 transition-all duration-300 transform
    animate-in slide-in-from-right
  `;
  toast.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <div class="flex flex-col">
      <span class="font-medium">${i18next.t('auto.chuyen_sang')} ${langNames[targetLanguage] || targetLanguage}</span>
      <span class="text-xs opacity-90">${i18next.t('auto.vui_long_cho')}</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Auto hide sau 10 giây nếu có lỗi
  setTimeout(() => {
    hideLanguageLoadingToast();
  }, 10000);
};

/**
 * Hide loading toast
 */
const hideLanguageLoadingToast = () => {
  const toast = document.getElementById('language-loading-toast');
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }
};
export default useLanguageSwitch;