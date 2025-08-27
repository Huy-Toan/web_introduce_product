import {  createContext, useContext  } from 'react';
import { useTranslation } from 'react-i18next';

// Tạo context để chia sẻ function t cho toàn bộ ứng dụng
const TContext = createContext();

// Provider component bao bọc toàn bộ app - GOM useTranslation ở đây
export function TProvider({
  children
}) {
  // SỬ DỤNG useTranslation DUY NHẤT Ở ĐÂY - tất cả components con sẽ nhận được
  const {
    t,
    i18n,
    ready
  } = useTranslation();

  // Đợi i18n ready trước khi render children
  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("auto.loading_translations")}</div>
      </div>;
  }

  // Context value chứa tất cả những gì components cần
  const contextValue = {
    t,
    // Function dịch chính - TẤT CẢ COMPONENTS SẼ DÙNG CÁI NÀY
    i18n,
    // Instance i18n để thay đổi ngôn ngữ
    changeLanguage: i18n.changeLanguage,
    currentLanguage: i18n.language || 'vi'
  };
  return <TContext.Provider value={contextValue}>
      {children}
    </TContext.Provider>;
}

// Hook đơn giản để các components nhận t function
export function useT() {
  const context = useContext(TContext);
  if (!context) {
    throw new Error('useT must be used within a TProvider');
  }
  return context;
}

// Hook cho namespace (giữ lại cho một số components đặc biệt)
export function useTWithNamespace(namespace) {
  const {
    i18n,
    changeLanguage,
    currentLanguage
  } = useT();
  const {
    t
  } = useTranslation(namespace);
  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage
  };
}
export default TContext;