import React from 'react';

interface PoCBannerProps {
  isDarkMode: boolean;
  language?: 'ar' | 'en';
}

export const PoCBanner: React.FC<PoCBannerProps> = ({ isDarkMode, language = 'ar' }) => {
  return (
    <aside 
      className={`w-full px-4 py-1.5 text-xs flex items-center justify-between border-b font-medium z-50 select-none transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-[#fcecd7] text-[#713f12] border-[#fbd38d]/60' 
          : 'bg-[#fef3c7] text-[#78350f] border-[#fde68a]'
      }`} 
      data-purpose="poc-warning-banner"
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[#b45309] shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
        </svg>
        <span className="truncate">
          {language === 'ar' 
            ? 'نسخة بحثية تجريبية: يُرجى الرجوع إلى مسجل الجامعة أو مكتب العميد للقرارات الرسمية.' 
            : 'Research Proof-of-Concept: Consult the official university registrar or dean\'s office for authoritative rulings.'}
        </span>
      </div>
      <span className="text-[11px] font-semibold text-[#92400e]/80 shrink-0 ml-2">PoC-v1.4.2</span>
    </aside>
  );
};
