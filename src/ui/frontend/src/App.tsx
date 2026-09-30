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

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-current',
      title: 'الجلسة الحالية',
      updatedAt: '11:38 PM',
      messages: INITIAL_MESSAGES,
    },
    {
      id: 'session-2',
      title: 'حساب المعدل التراكمي وسلم الدرجات',
      updatedAt: 'Yesterday',
      messages: [
        {
          id: 'prev-user-1',
          sender: 'user',
          timestamp: '02:15 PM',
          content: 'كيف يتم توزيع الدرجات والمعدل التراكمي في كليات جامعة المرقب؟',
          userName: 'طالب - جامعة المرقب',
          userRole: 'Student',
        },
        {
          id: 'prev-asst-1',
          sender: 'assistant',
          timestamp: '02:15 PM',
          content: 'وفقاً للمادة (34) المحددة لسلم الدرجات والتقديرات المعتمد بكليات جامعة المرقب:',
          bulletPoints: [
            'ممتاز: 85% فما فوق (نقاط 4.00)، جيد جداً: 75% إلى أقل من 85% (نقاط 3.00 - 3.75).',
            'جيد: 65% إلى أقل من 75% (نقاط 2.00 - 2.75)، مقبول: 50% إلى أقل من 65% (نقاط 1.00 - 1.75).',
            'راسب: أقل من 50%، ويشترط لنيل الدرجة الجامعية ألا يقل المعدل التراكمي العام عن (2.00 / جيد) في بعض التخصصات الهندسية و (مقبول) في باقي الكليات.'
          ],
          verifiedSource: true,
          citation: {
            documentTitle: 'University Regulations / لائحة تنظيم شؤون التعليم العالي والجامعات',
            retrievalDate: '2023-01-01',
            articleReference: 'Article Reference',
            chunkLabel: 'Grading scale chunk',
            excerpt: '"المادة (34): يعتمد التقدير التراكمي العام لدرجات الطالب بناءً على مجموع النقاط مقسوماً على مجموع الساعات المعتمدة..."',
            sourceUrl: 'http://example.com/doc',
            pdfPage: 34,
          }
        }
      ]
    },
    {
      id: 'session-3',
      title: 'نسبة الغياب والحرمان من الامتحانات',
      updatedAt: 'Sep 24',
      messages: [
        {
          id: 'prev-user-2',
          sender: 'user',
          timestamp: '10:04 AM',
          content: 'ما هي نسبة الغياب التي تؤدي للحرمان من الامتحان النهائي؟',
          userName: 'طالب - جامعة المرقب',
          userRole: 'Student',
        },
        {
          id: 'prev-asst-2',
          sender: 'assistant',
          timestamp: '10:04 AM',
          content: 'وفقاً للمادة (27) بخصوص الانضباط الأكاديمي ونسب الحضور بجامعة المرقب:',
          bulletPoints: [
            'يلتزم الطالب بحضور ما لا يقل عن 75% من المحاضرات والدروس المعملية المعتمدة لكل مقرر دراسي.',
            'يُحرم الطالب من دخول الامتحان النهائي ويرصد له تقدير (محروم / 0) إذا تجاوزت نسبة غيابه 25% دون عذر مقبول.',
            'الأعذار المرضية يجب أن تصادق عليها اللجنة الطبية المعتمدة التابعة لجامعة المرقب خلال أسبوع من تاريخ الغياب.'
          ],
          verifiedSource: true,
          citation: {
            documentTitle: 'University Regulations / لائحة تنظيم شؤون التعليم العالي والجامعات',
            retrievalDate: '2023-01-01',
            articleReference: 'Article Reference',
            chunkLabel: 'Attendance bylaw chunk',
            excerpt: '"المادة (27): يُحظر على الطالب دخول الامتحانات النهائية لأي مقرر تتجاوز نسبة غيابه فيه 25% دون موافقة مجلس الكلية..."',
            sourceUrl: 'http://example.com/doc',
            pdfPage: 27,
          }
        }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-current');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  }, [sessions, activeSessionId, isLoading]);

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

    setIsLoading(true);

    try {
      // Append instruction to force language in backend
      const promptPayload = language === 'en' 
        ? text + '\n\n[System directive: The user has requested English. You MUST respond entirely in English, no Arabic.]'
        : text + '\n\n[System directive: The user has requested Arabic. You MUST respond entirely in Arabic, no English.]';

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptPayload }),
      });
      const result = await response.json();

      const assistantReply: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: result.answer,
        subNote: result.abstained ? (result.abstain_reason || 'تنبيه حدود الاختصاص') : '.This is a verified regulatory ruling from Elmergib University archives',
        verifiedSource: !result.abstained,
        citation: result.citation ? {
          documentTitle: 'Elmergib Regulations',
          retrievalDate: result.citation.retrieved_at || new Date().toISOString().split('T')[0],
          articleReference: result.citation.page_number ? `Page ${result.citation.page_number}` : 'Article Reference',
          chunkLabel: 'Retrieved context',
          excerpt: result.citation.chunk_text || '',
          sourceUrl: result.citation.source_url || '#',
          pdfPage: 1,
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
      setIsLoading(false);
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
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
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
                <div className="pt-2 w-full">
                  <QuickPrompts 
                    isDarkMode={isDarkMode} 
                    onSelectPrompt={(text) => handleSendMessage(text)}
                    language={language}
                  />
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
                />
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
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
                isLoading={isLoading}
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
