import React from 'react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  studentRole: string;
  onChangeRole: (role: string) => void;
  language?: 'ar' | 'en';
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  studentRole,
  onChangeRole,
  language = 'ar',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all ${
        isDarkMode 
          ? 'bg-[#0e172a] border-[#1e293b] text-slate-100' 
          : 'bg-white border-slate-300 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-[#131f38] border-[#1e293b]' : 'bg-[#eff4ff] border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold font-arabic">
                {language === 'ar' ? 'الملف الأكاديمي الموحد' : 'Unified Academic Profile'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'معرف الطالب لجامعة المرقب' : 'Elmergib University Student ID'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-arabic" dir="rtl">
          {/* Identity card */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isDarkMode ? 'bg-[#111c30] border-[#1e2e4f]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</p>
                <p className="font-bold text-sm">رمضان أسامة صويدق</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {language === 'ar' ? 'قيد نشط ومستمر' : 'Active & Enrolled'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/30 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'رقم القيد الجامعي:' : 'Student ID:'}</span>
                <span className="font-mono font-bold text-blue-400">UG-2023-41829</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الكلية والفرع:' : 'Faculty & Branch:'}</span>
                <span className="font-medium">{language === 'ar' ? 'كلية تقنية المعلومات - الخمس' : 'Faculty of IT - Alkhums'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'القسم العلمي:' : 'Department:'}</span>
                <span className="font-medium">{language === 'ar' ? 'هندسة البرمجيات' : 'Software Engineering'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الفصل الدراسي الحالي:' : 'Current Semester:'}</span>
                <span className="font-medium">{language === 'ar' ? 'ربيع 2026 (الفصل السادس)' : 'Spring 2026 (6th Semester)'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المعدل التراكمي (GPA):' : 'Cumulative GPA:'}</span>
                <span className="font-mono font-bold text-emerald-400">3.42 / 4.00 ({language === 'ar' ? 'جيد جداً' : 'Very Good'})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المرشد الأكاديمي:' : 'Academic Advisor:'}</span>
                <span className="font-medium">{language === 'ar' ? 'د. عبد الرحمن الزليطني' : 'Dr. Abdulrahman Alzlitni'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex justify-end ${
          isDarkMode ? 'bg-[#0a1224] border-[#1e293b]' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-arabic cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
