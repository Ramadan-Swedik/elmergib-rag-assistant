import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, attachment?: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
  language?: 'ar' | 'en';
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isDarkMode,
  onShowToast,
  language = 'ar',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && !attachedFile) return;
    if (isLoading) return;

    onSendMessage(trimmed || 'يرجى مراجعة المستند المرفق وفق لوائح جامعة المرقب', attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      onShowToast(`تم إرفاق المستند: ${file.name}`);
    }
  };

  return (
    <div className="space-y-2">
      {/* Attached file chip if any */}
      {attachedFile && (
        <div className="flex items-center gap-2 px-3 py-1 text-xs rounded-lg border w-fit bg-blue-500/10 border-blue-500/30 text-blue-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[11px] truncate max-w-xs">{attachedFile}</span>
          <button 
            onClick={() => setAttachedFile(null)}
            className="hover:text-red-400 ml-1 cursor-pointer"
            title="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input container */}
      <div 
        className={`relative rounded-2xl shadow-lg transition-colors flex items-center p-1.5 pl-3 border ${
          isDarkMode 
            ? 'bg-[#111c30] border-[#203354] focus-within:border-blue-500' 
            : 'bg-white border-[#cbd5e1] focus-within:border-[#00236f] shadow-2xs'
        }`}
      >
        <input 
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'ar' ? 'اسأل عن اللوائح الدراسية، سلم الدرجات، وشروط التخرج...' : 'Ask about university bylaws, grading scales, graduation requirements...'}
          className={`w-full bg-transparent border-0 text-xs md:text-sm placeholder-slate-400 focus:ring-0 focus:outline-none py-3 ${
            isDarkMode ? 'text-slate-200' : 'text-slate-900'
          }`}
          disabled={isLoading}
        />

        <div className="flex items-center gap-1.5 pr-1">
          {/* File input hidden */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.png,.jpg"
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDarkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2b49]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`} 
            title={language === 'ar' ? 'إرفاق مستند' : 'Attach Reference'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button 
            type="button"
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !attachedFile)}
            className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-500' 
                : 'bg-[#00236f] hover:bg-blue-800'
            }`} 
            title="Send Prompt / إرسال"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Micro-footer Text */}
      <div className={`flex items-center justify-between text-[10px] px-2 font-medium ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <span>{language === 'ar' ? 'يعتمد على المصادر الرسمية فقط. يُرجى التحقق دائماً من مرشدك الأكاديمي.' : 'Authorized references only. Always cross-verify with your academic advisor.'}</span>
        <span>RTL & LTR Compliant</span>
      </div>
    </div>
  );
};
