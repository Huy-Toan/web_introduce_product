import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

// Hook tùy chỉnh cho việc dịch với fallback động
export const useTranslationWithFallback = (namespace = 'common') => {
  const { t, i18n } = useTranslation('common');
  const [fallbackCache, setFallbackCache] = useState({});

  // Hàm dịch sync với fallback từ cache
  const tWithFallback = (key, options = {}) => {
    const translation = t(key, { ...options, fallback: false });

    // Nếu tìm thấy bản dịch thông thường
    if (translation !== key) {
      return translation;
    }

    // Kiểm tra cache fallback
    const cacheKey = `${i18n.language}:${key}`;
    if (fallbackCache[cacheKey]) {
      return fallbackCache[cacheKey];
    }

    // Gọi API dịch động trong background và trả về key tạm thời
    translateTextDynamic(key, i18n.language).then(translatedText => {
      // Lưu vào cache
      setFallbackCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));

      // Cập nhật vào i18n resources
      i18n.addResource(i18n.language, namespace, key, translatedText);
    }).catch(error => {
      console.warn(`Failed to translate key "${key}":`, error);
    });

    // Trả về key gốc trong lần đầu
    return key;
  };

  return { t: tWithFallback, tStatic: t, i18n };
};

// Hàm dịch text động qua API
const translateTextDynamic = async (text, targetLang) => {
  const sourceLang = 'vi';

  // Thử MyMemory API
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );
    const data = await response.json();

    if (data?.responseData?.translatedText &&
        !data.responseData.translatedText.includes('INVALID SOURCE LANGUAGE')) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.warn('MyMemory API failed:', error);
  }

  // Fallback: basic translations
  const basicTranslations = {
    'vi|en': {
      'button': 'Button',
      'text': 'Text',
      'title': 'Title',
      'content': 'Content',
      'image': 'Image',
      'link': 'Link',
      'menu': 'Menu',
      'page': 'Page',
      'section': 'Section',
      'header': 'Header',
      'footer': 'Footer'
    }
  };

  const langPair = `${sourceLang}|${targetLang}`;
  if (basicTranslations[langPair]?.[text.toLowerCase()]) {
    return basicTranslations[langPair][text.toLowerCase()];
  }

  // Trả về text gốc nếu không dịch được
  return text;
};

// Component wrapper để hiển thị trạng thái loading khi dịch
export const TranslatedText = ({
  tKey,
  namespace = 'common',
  fallback,
  className = '',
  ...props
}) => {
  const { t } = useTranslationWithFallback(namespace);
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      setIsLoading(true);
      try {
        const result = await t(tKey);
        setTranslatedText(result);
      } catch (err) {
        console.error(err);
        setTranslatedText(fallback || tKey);
      }
      setIsLoading(false);
    };

    translateText();
  }, [tKey, t, fallback]);

  if (isLoading) {
    return (
      <span className={`inline-block animate-pulse bg-gray-200 rounded ${className}`} {...props}>
        &nbsp;&nbsp;&nbsp;
      </span>
    );
  }

  return (
    <span className={className} {...props}>
      {translatedText}
    </span>
  );
};