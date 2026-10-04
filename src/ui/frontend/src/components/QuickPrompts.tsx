import React from 'react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isDarkMode: boolean;
  language?: 'ar' | 'en';
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, isDarkMode, language = 'ar' }) => {
  const prompts = [
    { 
      label: language === 'ar' ? 'شروط إيقاف القيد (مادة 21)' : 'Suspension conditions (Art. 21)', 
      text: language === 'ar' 
        ? 'ما هي شروط وإجراءات إيقاف القيد الفصلي وفق المادة 21؟' 
        : 'What are the official conditions and procedures for enrollment suspension under Article 21?' 
    },
    { 
      label: language === 'ar' ? 'سلم الدرجات والمعدل (مادة 34)' : 'Grading system (Art. 34)', 
      text: language === 'ar' 
        ? 'كيف يتم احتساب المعدل التراكمي وسلم الدرجات وفق المادة 34؟' 
        : 'How is the GPA and grading scale calculated according to Article 34?' 
    },
    { 
      label: language === 'ar' ? 'ضوابط الحذف والإضافة (مادة 18)' : 'Drop/Add policy (Art. 18)', 
      text: language === 'ar' 
        ? 'ما هي ضوابط ومواعيد إسقاط وإضافة المواد وفق المادة 18؟' 
        : 'What are the rules and deadlines for adding and dropping courses under Article 18?' 
    },
    { 
      label: language === 'ar' ? 'نسبة الحضور والحرمان (مادة 27)' : 'Attendance & Barring (Art. 27)', 
      text: language === 'ar' 
        ? 'ما هي نسبة الغياب المسموح بها وحالات الحرمان من الامتحانات وفق المادة 27؟' 
        : 'What is the maximum allowed absence percentage and barring rules under Article 27?' 
    },
    { 
      label: language === 'ar' ? 'متطلبات التخرج (مادة 52)' : 'Graduation reqs (Art. 52)', 
      text: language === 'ar' 
        ? 'ما هي شروط مشروع التخرج ومتطلبات نيل الدرجة الجامعية وفق المادة 52؟' 
        : 'What are the graduation requirements and senior project criteria under Article 52?' 
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
      <span className={`text-[11px] font-medium shrink-0 flex items-center gap-1 ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <span className="text-blue-500">⚡</span>
        <span className={language === 'ar' ? 'font-arabic' : ''}>{language === 'ar' ? 'استفسارات شائعة:' : 'Quick Prompts:'}</span>
      </span>
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p.text)}
          className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-arabic ${
            isDarkMode
              ? 'bg-[#101b30] border-[#223554] text-slate-300 hover:text-white hover:border-blue-400 hover:bg-[#162747]'
              : 'bg-white border-[#cbd5e1] text-[#00236f] hover:bg-[#eff4ff] hover:border-blue-400 shadow-2xs'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};
