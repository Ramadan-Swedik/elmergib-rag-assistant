import React from 'react';

interface PrivacyBannerProps {
  isDarkMode: boolean;
  language?: 'ar' | 'en';
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ isDarkMode, language = 'ar' }) => {
  return (
    <div 
      className={`rounded-lg px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 transition-colors duration-200 border ${
        isDarkMode 
          ? 'bg-[#101b30]/80 border-[#1d2d4c] text-slate-300' 
          : 'bg-[#eff4ff] border-[#bfdbfe] text-slate-700'
      }`} 
      data-purpose="privacy-banner"
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className={`text-[11px] leading-normal ${language === 'ar' ? 'font-arabic' : ''}`}>
          <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#00236f]'}`}>
            {language === 'ar' ? 'بنية خصوصية محلية صارمة:' : 'Strict On-Premises Privacy Architecture:'}
          </strong>{' '}
          {language === 'ar' 
            ? 'تتم معالجة جميع الاستعلامات محلياً على خوادم جامعة المرقب. لا يتم مشاركة البيانات مع نماذج خارجية.' 
            : 'All query vector embeddings processed locally on Elmergib servers. No external third-party model sharing.'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pl-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'ar' ? 'الشبكة المحلية: متصل' : 'Local Embeddings: Ready'}
        </span>
      </div>
    </div>
  );
};
