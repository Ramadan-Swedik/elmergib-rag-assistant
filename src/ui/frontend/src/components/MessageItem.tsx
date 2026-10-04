import React, { useState } from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isDarkMode: boolean;
  onOpenPdf: (citation: any) => void;
  onShowToast: (msg: string) => void;
  language?: 'ar' | 'en';
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isDarkMode,
  onOpenPdf,
  onShowToast,
  language = 'ar',
}) => {
  const [isCitationExpanded, setIsCitationExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast(language === 'ar' ? 'تم نسخ النص المرجعي إلى الحافظة' : 'Reference text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isRtl = (text: string) => {
    // Detect Arabic script
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  if (message.sender === 'user') {
    const textIsRtl = isRtl(message.content);
    return (
      <article className="flex flex-col items-end max-w-4xl mx-auto space-y-1.5" data-purpose="user-message">
        {/* Metadata / User Tag */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {message.timestamp}
          </span>
          <span className={`font-arabic font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {message.userName || (language === 'ar' ? 'طالب - جامعة المرقب' : 'Student - Elmergib University')}
          </span>
          <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium border ${
            isDarkMode 
              ? 'bg-blue-900/40 text-blue-400 border-blue-700/30' 
              : 'bg-blue-100 text-[#00236f] border-blue-300'
          }`}>
            {message.userRole ? message.userRole : (language === 'ar' ? 'طالب' : 'Student')}
          </span>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
            isDarkMode 
              ? 'bg-[#1e2d4a] border-[#2d426d] text-slate-300' 
              : 'bg-[#dae2fd] border-blue-200 text-[#00236f]'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Message Card */}
        <div 
          dir={textIsRtl ? 'rtl' : 'ltr'}
          className={`font-arabic text-sm leading-relaxed px-5 py-3 rounded-2xl rounded-tr-xs shadow-md max-w-xl transition-all ${
            textIsRtl ? 'text-right' : 'text-left'
          } ${
            isDarkMode 
              ? 'bg-[#0f3466] text-white border border-blue-500/30' 
              : 'bg-[#00236f] text-white border border-blue-800'
          }`}
        >
          {message.content}
        </div>
      </article>
    );
  }

  // Assistant Response
  const isAssistantAr = isRtl(message.content);

  return (
    <article className="max-w-4xl mx-auto flex items-start gap-3" data-purpose="assistant-response">
      {/* Assistant Avatar */}
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
        isDarkMode 
          ? 'bg-[#1b3a6b] border-blue-400/40 text-blue-200' 
          : 'bg-[#1e3a8a] border-blue-600 text-white'
      }`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </div>

      {/* Main Response Content Block */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Assistant Sub-header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-xs ${isAssistantAr ? 'font-arabic' : 'font-sans'} ${isDarkMode ? 'text-slate-200' : 'text-[#0b1c30]'}`}>
              {isAssistantAr ? 'المساعد التنظيمي الذكي' : 'Elmergib Regulatory AI'}
            </span>
            {message.verifiedSource && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${isAssistantAr ? 'font-arabic' : 'font-sans'} ${
                isDarkMode 
                  ? 'text-emerald-400 bg-emerald-950/50 border-emerald-700/40' 
                  : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                {isAssistantAr ? 'مستند رسمي معتمد' : 'Verified Official Document'}
              </span>
            )}
          </div>
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {message.timestamp}
          </span>
        </div>

        {/* Direct Text Explanation */}
        <div className={`rounded-2xl p-4 text-sm leading-relaxed space-y-2 border transition-all ${
          isDarkMode 
            ? 'bg-[#101b30] border-[#1e2e4f] text-slate-200' 
            : 'bg-white border-[#e2e8f0] text-slate-800 shadow-2xs'
        }`}>
          <p className={`${isAssistantAr ? 'font-arabic text-right' : 'font-sans text-left'} ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} font-medium`} dir={isAssistantAr ? 'rtl' : 'ltr'}>
            {message.content}
          </p>

          {message.bulletPoints && message.bulletPoints.length > 0 && (
            <ul className={`list-disc list-inside space-y-1 text-xs ${isAssistantAr ? 'font-arabic pr-1 text-right' : 'font-sans pl-1 text-left'} ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`} dir={isAssistantAr ? 'rtl' : 'ltr'}>
              {message.bulletPoints.map((point, index) => (
                <li key={index} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          )}

          {message.subNote && (
            <p className={`text-xs pt-1 ${isAssistantAr ? 'font-arabic text-right' : 'font-sans text-left'} ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} dir={isAssistantAr ? 'rtl' : 'ltr'}>
              {message.subNote}
            </p>
          )}
        </div>

        {/* Citation / Regulatory Proof Card */}
        {message.citation && (
          <div className={`rounded-xl overflow-hidden shadow-2xs border transition-all ${
            isDarkMode 
              ? 'bg-[#121f38] border-[#24375b]' 
              : 'bg-[#f8f9ff] border-[#dae2fd]'
          }`} data-purpose="citation-card">
            {/* Accordion Citation Header */}
            <button
              onClick={() => setIsCitationExpanded(!isCitationExpanded)}
              className={`w-full px-4 py-2.5 flex items-center justify-between border-b cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'bg-[#162747] border-[#24375b] hover:bg-[#1a2d52]' 
                  : 'bg-[#e5eeff] border-[#dae2fd] hover:bg-[#dce9ff]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="select-none">📖</span>
                <span className="select-none">📌</span>
                <span className={`${isAssistantAr ? 'font-arabic' : 'font-sans'} ${isDarkMode ? 'text-blue-200' : 'text-[#00236f]'}`}>
                  {isAssistantAr ? 'عرض المستند والمصدر المرجعي' : 'View Source Citation'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded border ${
                  isDarkMode 
                    ? 'bg-blue-900/60 text-blue-300 border-blue-500/40' 
                    : 'bg-blue-100 text-[#00236f] border-blue-300'
                }`}>
                  VERIFIED SOURCE
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCitationExpanded ? 'transform rotate-180' : ''
                  } ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {/* Citation Body Information */}
            {isCitationExpanded && (
              <div className="p-4 space-y-3 text-xs">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <div>
                    <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isAssistantAr ? 'اسم الوثيقة الرسمية:' : 'Document Title:'}
                    </span>
                    <strong className={`${isRtl(message.citation.documentTitle) ? 'font-arabic' : 'font-sans'} ${isDarkMode ? 'text-white' : 'text-[#0b1c30]'}`}>
                      {message.citation.documentTitle}
                    </strong>
                  </div>
                  <div className="md:text-right">
                    <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isAssistantAr ? 'تاريخ التوثيق:' : 'Retrieval Date:'}
                    </span>
                    <span className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                      {message.citation.retrievalDate}
                    </span>
                  </div>
                </div>

                {/* Source Extract Box */}
                <div className={`rounded-lg p-3 relative font-sans text-xs border ${
                  isDarkMode 
                    ? 'bg-[#0b1322] border-[#1c2c47] text-slate-300' 
                    : 'bg-white border-[#cbd5e1] text-slate-800'
                }`}>
                  <div className="absolute right-3 top-2.5 text-right font-sans select-none">
                    <span className="text-[10px] text-blue-500 font-medium block">
                      {message.citation.articleReference || 'Article Reference'}
                    </span>
                    <span className={`text-[10px] italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {message.citation.chunkLabel || (isAssistantAr ? 'النص القانوني المعتمد' : 'Verified Legal Text')}
                    </span>
                  </div>
                  <div className={`pr-28 font-arabic leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`} dir="rtl">
                    {message.citation.excerpt}
                  </div>
                </div>

                {/* Verification Action Row */}
                <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-[11px]">
                  <a 
                    href={message.citation.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-500 hover:underline font-mono truncate max-w-[200px]"
                  >
                    {message.citation.sourceUrl}
                  </a>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopyExcerpt(message.citation!.excerpt)}
                      className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDarkMode 
                            ? 'bg-[#1c2d4d] hover:bg-[#253b66] text-slate-200 border-[#2f4675]' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-[#cbd5e1]'
                      }`}
                      title="Copy excerpt"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={isAssistantAr ? 'font-arabic' : 'font-sans'}>
                        {copied ? (isAssistantAr ? 'تم النسخ' : 'Copied') : (isAssistantAr ? 'نسخ النص' : 'Copy Text')}
                      </span>
                    </button>

                    <button 
                      onClick={() => onOpenPdf(message.citation)}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      title="Open Regulation PDF viewer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={isAssistantAr ? 'font-arabic' : 'font-sans'}>
                        {isAssistantAr ? 'PDF فتح اللائحة' : 'Open PDF Regulation'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
