import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isDarkMode: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onDeleteSession: (id: string) => void;
  language?: 'ar' | 'en';
  isOpenDesktop?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isDarkMode,
  isOpenMobile,
  onCloseMobile,
  onDeleteSession,
  language = 'ar',
  isOpenDesktop = true,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`flex flex-col justify-between shrink-0 select-none z-40 transition-all duration-300 md:static fixed inset-y-0 left-0 h-full ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          !isOpenMobile && !isOpenDesktop ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-none' : 'md:w-64'
        } ${
          isDarkMode 
            ? 'bg-[#090f1d] border-r border-[#1a253c]' 
            : 'bg-[#ffffff] border-r border-[#e2e8f0]'
        }`} 
        data-purpose="main-sidebar"
      >
        {/* Top Action & Navigation */}
        <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {/* New Chat Button */}
          <button 
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer ${
              isDarkMode 
                ? 'border border-[#223554] bg-[#0d1728] hover:bg-[#15233c] text-slate-200 hover:text-white' 
                : 'border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-slate-800 hover:text-blue-900 shadow-xs'
            }`}
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{language === 'ar' ? 'محادثة جديدة' : 'New chat'}</span>
          </button>

          {/* Sessions List */}
          <div>
            <div className={`px-2 pb-1 text-[11px] font-medium tracking-wider uppercase ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {language === 'ar' ? 'السجل' : 'Recent'}
            </div>
            <nav className="space-y-1 mt-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div key={session.id} className="relative group w-full flex items-center justify-between">
                    <button
                      onClick={() => {
                        onSelectSession(session.id);
                        onCloseMobile();
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        isActive
                          ? isDarkMode
                            ? 'bg-[#182844] text-blue-300 border border-blue-500/20'
                            : 'bg-[#dae2fd] text-[#00236f] border border-blue-300'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-[#131e33]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <svg 
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.8" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="truncate pr-5">
                        {session.title === 'الجلسة الحالية'
                          ? (language === 'ar' ? 'الجلسة الحالية' : 'Current Session')
                          : session.title}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${
                        isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-[#202c46]' : 'text-slate-500 hover:text-red-500 hover:bg-[#dae2fd]'
                      }`}
                      title={language === 'ar' ? 'حذف الجلسة' : 'Delete Session'}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

      </aside>
    </>
  );
};
