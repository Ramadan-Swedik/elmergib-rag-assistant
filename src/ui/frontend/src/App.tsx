import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, Message, Citation } from './types';
import { INITIAL_MESSAGES, findMatchingBylaw } from './data/bylaws';
import { PoCBanner } from './components/PoCBanner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { PrivacyBanner } from './components/PrivacyBanner';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatInput } from './components/ChatInput';
import { RegulationPdfModal } from './components/RegulationPdfModal';
import { StudentProfileModal } from './components/StudentProfileModal';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('elmergib_theme');
    if (saved) return saved === 'dark';
    return true;
  });
  
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('elmergib_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
    return [
      {
        id: `session-${Date.now()}`,
        title: 'جلسة جديدة',
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [],
      }
    ];
  });


  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem('elmergib_active_session');
    if (savedActive) {
      return savedActive;
    }
    const savedSessions = localStorage.getItem('elmergib_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      } catch (e) {}
    }
    return sessions[0].id;
  });
  const [loadingSessionIds, setLoadingSessionIds] = useState<string[]>([]);
  const [activePdfCitation, setActivePdfCitation] = useState<Citation | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [studentRole, setStudentRole] = useState<string>('Student');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync dark class with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('elmergib_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('elmergib_theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, loadingSessionIds]);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('elmergib_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save active session to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('elmergib_active_session', activeSessionId);
    }
  }, [activeSessionId]);
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'جلسة جديدة',
      updatedAt: 'الآن',
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    handleShowToast('تم بدء جلسة استعلام جديدة');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleOpenPdf = (citation: Citation) => {
    setActivePdfCitation(citation);
    setIsPdfModalOpen(true);
  };

  const handleSendMessage = async (text: string, attachmentName?: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fullUserContent = text;
    if (attachmentName) {
      fullUserContent += `\n[مرفق: ${attachmentName}]`;
    }

    const newUserMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: timeString,
      content: fullUserContent,
      userName: studentRole === 'Faculty' ? 'عضو هيئة تدريس - جامعة المرقب' : 'طالب - جامعة المرقب',
      userRole: studentRole,
    };

    // Update session title if it was a new empty session
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const isFirstMessage = session.messages.length === 0;
          return {
            ...session,
            title: isFirstMessage ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : session.title,
            updatedAt: 'Just now',
            messages: [...session.messages, newUserMessage],
          };
        }
        return session;
      });
    });

    setLoadingSessionIds(prev => [...prev, activeSessionId]);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text, language }),
      });
      const result = await response.json();

      const isEnglish = result.language === 'en' || result.is_ar === false;

      const assistantReply: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: result.answer,
        bulletPoints: result.bullet_points || result.bulletPoints,
        subNote: result.abstained 
          ? (result.abstain_reason || (isEnglish ? 'Notice: Outside University Bylaws Scope' : 'تنبيه: خارج نطاق لوائح جامعة المرقب'))
          : (isEnglish ? 'Verified regulatory ruling from Elmergib University archives' : 'مستند رسمي معتمد من أرشيف لوائح جامعة المرقب'),
        verifiedSource: !result.abstained,
        citation: result.citation ? {
          documentTitle: result.citation.document_title || (isEnglish ? 'Elmergib University Higher Education Regulations' : 'لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات'),
          retrievalDate: result.citation.retrieved_at || new Date().toISOString().split('T')[0],
          articleReference: result.citation.article_reference || (result.citation.page_number ? (isEnglish ? `Article Ref • Page ${result.citation.page_number}` : `المادة المعتمدة • صفحة ${result.citation.page_number}`) : (isEnglish ? 'Regulation Ref' : 'المرجع المعتمد')),
          chunkLabel: result.citation.chunk_label || (isEnglish ? 'Official Regulatory Excerpt' : 'النص القانوني المعتمد'),
          excerpt: result.citation.chunk_text || '',
          sourceUrl: result.citation.source_url || 'https://elmergib.edu.ly/regulations',
          pdfPage: result.citation.page_number || 28,
        } : undefined
      };

      setSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantReply],
            };
          }
          return session;
        });
      });
    } catch (error) {
      console.error("API Error", error);
      handleShowToast('Error connecting to backend');
    } finally {
      setLoadingSessionIds(prev => prev.filter(id => id !== activeSessionId));
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans antialiased overflow-hidden select-text ${
      isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8f9ff] text-slate-900'
    }`}>
      {/* Toast alert notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-arabic font-medium shadow-lg animate-bounce flex items-center gap-2">
          <span>ℹ️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BEGIN: PoCNoticeBanner */}
      <PoCBanner isDarkMode={isDarkMode} language={language} />
      {/* END: PoCNoticeBanner */}

      {/* BEGIN: ApplicationLayoutWrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* BEGIN: LeftSidebar */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={(id) => {
            setSessions(prev => prev.filter(s => s.id !== id));
            if (activeSessionId === id) {
              const remaining = sessions.filter(s => s.id !== id);
              if (remaining.length > 0) {
                setActiveSessionId(remaining[0].id);
              } else {
                handleNewChat();
              }
            }
          }}
          isDarkMode={isDarkMode}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          language={language}
          isOpenDesktop={desktopSidebarOpen}
        />
        {/* END: LeftSidebar */}

        {/* BEGIN: MainContentCanvas */}
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative ${
          isDarkMode ? 'bg-[#0b1325]' : 'bg-[#f8f9ff]'
        }`}>
          {/* BEGIN: ContentHeader */}
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
            onToggleDesktopSidebar={() => setDesktopSidebarOpen(prev => !prev)}
            isDesktopSidebarOpen={desktopSidebarOpen}
            language={language}
            onToggleLanguage={() => {
              setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
              handleShowToast(language === 'ar' ? 'Language switched to English' : 'تم التبديل للغة العربية');
            }}
          />
          {/* END: ContentHeader */}

          {/* BEGIN: ConversationStream */}
          <section 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6" 
            data-purpose="chat-scroll-area"
          >
            {currentSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-base font-bold mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar' ? 'مرحباً بك في المساعد التنظيمي لجامعة المرقب' : 'Welcome to the Elmergib University Regulatory Assistant'}
                  </h2>
                  <p className={`text-xs text-slate-400 leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar' 
                      ? 'نظام استرجاع اللوائح الأكاديمية والقرارات الجامعية الرسمية الصادرة عن مجلس جامعة المرقب وإدارة شؤون الطلاب والامتحانات.' 
                      : 'An retrieval system for official academic bylaws and university decisions issued by the Elmergib University Council and Student Affairs.'}
                  </p>
                </div>
              </div>
            ) : (
              currentSession.messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isDarkMode={isDarkMode}
                  onOpenPdf={handleOpenPdf}
                  onShowToast={handleShowToast}
                  language={language}
                />
              ))
            )}

            {/* Loading Indicator */}
            {loadingSessionIds.includes(currentSession.id) && (
              <article className="max-w-4xl mx-auto flex items-start gap-3 animate-pulse">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isDarkMode ? 'bg-[#1b3a6b] border-blue-400/40 text-blue-200' : 'bg-blue-600 text-white'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
                <div className={`p-4 rounded-2xl border text-xs font-arabic flex items-center gap-3 ${
                  isDarkMode ? 'bg-[#101b30] border-[#1e2e4f] text-slate-300' : 'bg-white border-[#cbd5e1] text-slate-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>{language === 'ar' ? 'جاري استرجاع السند القانوني ومطابقة نصوص اللائحة...' : 'Retrieving legal references and matching bylaw articles...'}</span>
                </div>
              </article>
            )}
          </section>
          {/* END: ConversationStream */}

          {/* BEGIN: BottomDockArea */}
          <footer 
            className={`shrink-0 px-4 md:px-8 pb-6 pt-3 transition-colors ${
              isDarkMode 
                ? 'bg-gradient-to-t from-[#090e17] via-[#090e17]/95 to-transparent' 
                : 'bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/95 to-transparent'
            }`} 
            data-purpose="chat-input-container"
          >
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Quick suggestion prompt chips */}
              <QuickPrompts 
                isDarkMode={isDarkMode} 
                onSelectPrompt={(text) => handleSendMessage(text)}
                language={language}
              />

              {/* Security and Privacy Badge Info */}
              <PrivacyBanner isDarkMode={isDarkMode} language={language} />

              {/* Prompt Input Field */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={loadingSessionIds.includes(currentSession.id)}
                isDarkMode={isDarkMode}
                onShowToast={handleShowToast}
                language={language}
              />
            </div>
          </footer>
          {/* END: BottomDockArea */}
        </main>
        {/* END: MainContentCanvas */}
      </div>
      {/* END: ApplicationLayoutWrapper */}

      {/* Regulation PDF Viewer Modal */}
      <RegulationPdfModal
        citation={activePdfCitation}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        isDarkMode={isDarkMode}
        onShowToast={handleShowToast}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isDarkMode={isDarkMode}
        studentRole={studentRole}
        language={language}
        onChangeRole={(role) => {
          setStudentRole(role);
          handleShowToast(`تم تغيير الصفة إلى: ${role === 'Student' ? 'طالب جامعي' : 'عضو هيئة تدريس'}`);
        }}
      />
    </div>
  );
}
