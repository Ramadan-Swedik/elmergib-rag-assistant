import React, { useState } from 'react';
import { Citation } from '../types';

interface RegulationPdfModalProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const RegulationPdfModal: React.FC<RegulationPdfModalProps> = ({
  citation,
  isOpen,
  onClose,
  isDarkMode,
  onShowToast,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  if (!isOpen || !citation) return null;

  const handleDownload = () => {
    onShowToast('جاري تنزيل اللائحة الرسمية لجامعة المرقب (PDF)...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 md:p-6 backdrop-blur-xs">
      <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
        isDarkMode 
          ? 'bg-[#0b1325] border-[#223554] text-slate-100' 
          : 'bg-white border-slate-300 text-slate-900'
      }`}>
        {/* PDF Viewer Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-[#0f1b33] border-[#1e2e4f]' : 'bg-[#f1f5f9] border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              PDF
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-semibold truncate max-w-md font-arabic">
                {citation.documentTitle}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Elmergib_University_Regulations.pdf • Page {citation.pdfPage} of 68
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 bg-black/20 rounded-lg p-0.5 text-xs">
              <button 
                onClick={() => setZoom(Math.max(70, zoom - 10))}
                className="px-2 py-1 rounded hover:bg-white/10"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1 text-[11px]">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(140, zoom + 10))}
                className="px-2 py-1 rounded hover:bg-white/10"
                title="Zoom In"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleDownload}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition ${
                isDarkMode 
                  ? 'border-[#223554] bg-[#162747] hover:bg-[#1e3560] text-blue-200' 
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Download PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden md:inline font-arabic text-[11px]">تحميل</span>
            </button>

            <button 
              onClick={handlePrint}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition ${
                isDarkMode 
                  ? 'border-[#223554] bg-[#162747] hover:bg-[#1e3560] text-blue-200' 
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Print Document"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden md:inline font-arabic text-[11px]">طباعة</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-600/80 transition cursor-pointer"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-900/40">
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className={`w-full max-w-2xl rounded-sm shadow-xl p-8 md:p-12 space-y-6 font-arabic border transition-transform ${
              isDarkMode ? 'bg-[#162137] text-slate-300 border-[#2a3c5a]' : 'bg-white text-slate-900 border-slate-300'
            }`}
            dir="rtl"
          >
            {/* University Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between text-center">
              <div className="text-right text-xs space-y-0.5 font-semibold text-slate-800">
                <p>دولة ليبيا</p>
                <p>وزارة التعليم العالي والبحث العلمي</p>
                <p className="text-blue-900 font-bold">جامعة المرقب - الخمس</p>
                <p className="text-[11px] text-slate-600">إدارة شؤون الدراسة والامتحانات</p>
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-blue-900 flex flex-col items-center justify-center p-1 text-center bg-blue-50/50">
                <span className="text-[8px] font-bold text-blue-900 leading-tight">جامعة المرقب</span>
                <span className="text-[7px] text-slate-600">تأسست 1991</span>
                <span className="text-[7px] text-blue-700 font-bold">ELMERGIB</span>
              </div>

              <div className="text-left text-xs space-y-0.5 text-slate-700 font-mono" dir="ltr">
                <p>Doc Ref: EM-REG-2023</p>
                <p>Date: 2023-01-01</p>
                <p className="text-emerald-700 font-bold">Status: OFFICIAL</p>
              </div>
            </div>

            {/* Decree Header */}
            <div className="text-center space-y-1">
              <h2 className="text-base md:text-lg font-bold text-slate-950">
                لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                الباب الثالث: التسجيل والتحويل ووقف القيد الأكاديمي
              </p>
            </div>

            {/* Extracted Regulation Content */}
            <div className={`p-6 rounded-lg space-y-4 ${
              isDarkMode ? 'bg-[#0f172a]/50 border border-[#2a3c5a]' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-200/20">
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs">
                    {citation.articleReference || `Page ${citation.pdfPage}`}
                  </span>
                  <span>المرجع الموثق</span>
                </h4>
                <span className={`text-[11px] font-sans font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  مقتبس ومعتمد
                </span>
              </div>
              
              <p className={`text-sm md:text-base leading-loose whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                {citation.excerpt}
              </p>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800">
              <div className="text-center space-y-8">
                <p className="font-bold">مسجل عام جامعة المرقب</p>
                <p className="text-slate-500 font-serif italic text-sm">أ.د. عبدالسلام الفرجاني</p>
              </div>

              <div className="w-24 h-24 border-2 border-red-700/60 rounded-full flex flex-col items-center justify-center p-2 text-center text-red-800 rotate-[-12deg] select-none">
                <span className="text-[8px] font-bold">ختم الاعتماد الرسمي</span>
                <span className="text-[7px]">جامعة المرقب - الخمس</span>
                <span className="text-[9px] font-mono font-bold">صادر ومسجل</span>
                <span className="text-[7px]">2023/1/1</span>
              </div>

              <div className="text-center space-y-8">
                <p className="font-bold">رئيس جامعة المرقب</p>
                <p className="text-slate-500 font-serif italic text-sm">أ.د. عمران القيب</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-t ${
          isDarkMode ? 'bg-[#0f1b33] border-[#1e2e4f] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span className="font-arabic">النظام المرجعي المعتمد للوائح جامعة المرقب</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-500 cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
