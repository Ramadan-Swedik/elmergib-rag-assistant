import React from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  onOpenProfile: () => void;
  onToggleMobileSidebar: () => void;
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
  isDesktopSidebarOpen?: boolean;
  onToggleDesktopSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onOpenProfile,
  onToggleMobileSidebar,
  language,
  onToggleLanguage,
  isDesktopSidebarOpen = true,
  onToggleDesktopSidebar,
}) => {
  return (
    <header 
      className={`h-14 border-b px-4 md:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 ${
        isDarkMode 
          ? 'border-[#1b2742] bg-[#0c162b]/95 backdrop-blur text-white' 
          : 'border-[#e2e8f0] bg-white text-slate-900 shadow-2xs'
      }`} 
      data-purpose="chat-header"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className={`p-1.5 rounded-lg md:hidden cursor-pointer ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
          }`}
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Desktop menu button */}
        {onToggleDesktopSidebar && (
          <button
            onClick={onToggleDesktopSidebar}
            className={`p-1.5 rounded-lg hidden md:block cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Toggle sidebar"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Logo Icon */}
        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white rounded-lg p-1 shadow-xs border border-slate-200/50">
          <img src="/logo.png" alt="University Logo" className="w-full h-full object-contain" />
        </div>

        {/* App Title */}
        <div className="flex items-baseline gap-2">
          <h1 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-[#00236f]'}`}>
            {language === 'ar' ? 'المساعد الذكي لجامعة المرقب' : 'Elmergib Smart Assistant'}
          </h1>
          <span className="text-slate-400 text-xs select-none">|</span>
          <span className={`text-xs font-arabic font-medium ${isDarkMode ? 'text-blue-300/90' : 'text-blue-700'}`}>
            {language === 'ar' ? 'Elmergib Smart Assistant' : 'المساعد الذكي'}
          </span>
        </div>
      </div>

      {/* Actions: Language & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLanguage}
          title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
            isDarkMode 
              ? 'bg-[#1b2946] border-[#2b3d63] text-slate-300 hover:text-white hover:border-blue-400' 
              : 'bg-[#eff4ff] border-[#cbd5e1] text-[#00236f] hover:text-blue-800 hover:border-blue-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="uppercase">{language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        <button 
          onClick={onOpenProfile}
          title="Student Profile / الملف الأكاديمي"
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
            isDarkMode 
              ? 'bg-[#1b2946] border-[#2b3d63] text-slate-300 hover:text-white hover:border-blue-400' 
              : 'bg-[#eff4ff] border-[#cbd5e1] text-[#00236f] hover:text-blue-800 hover:border-blue-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
};
