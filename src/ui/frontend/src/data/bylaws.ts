import { BylawArticle, Message } from '../types';

export const ELMERGIB_BYLAWS: BylawArticle[] = [
  {
    id: 'art-21',
    articleNumber: 21,
    titleAr: 'إيقاف القيد الفصلي والسنوي',
    titleEn: 'Suspension of Enrollment (Semester/Annual)',
    category: 'نظام الدراسة والتسجيل',
    contentAr: 'وفقاً للمادة (21) من لائحة تنظيم شؤون الدراسة والامتحانات بجامعة المرقب:',
    contentEn: 'According to Article (21) of Elmergib University Study and Examination Bylaws:',
    bulletPointsAr: [
      'يجوز للطالب التقدم بطلب إيقاف القيد الفصلي قبل نهاية الأسبوع الرابع من بدء الدراسة.',
      'يجب تقديم عذر رسمي معتمد تقبله الكلية المختصة ومسجل الكلية.',
      'لا تحسب فترة الإيقاف المعتمدة ضمن المدة القانونية القصوى المقررة للحصول على الدرجة الجامعية.'
    ],
    keywords: ['21', 'ايقاف', 'إيقاف', 'قيد', 'تجميد', 'وقف القيد', 'suspend', 'stop enrollment', 'freeze', 'article 21'],
  },
  {
    id: 'art-18',
    articleNumber: 18,
    titleAr: 'إسقاط وإضافة المواد الدراسية',
    titleEn: 'Add and Drop Courses Policy',
    category: 'التسجيل الأكاديمي',
    contentAr: 'وفقاً للمادة (18) المنظمة لعملية التنزيل والحذف والإضافة بجامعة المرقب:',
    contentEn: 'According to Article (18) governing course registration, adding and dropping at Elmergib University:',
    bulletPointsAr: [
      'تمنح فترة أسبوعين من بداية كل فصل دراسي لإجراء عمليات الحذف والإضافة بالتنسيق مع المرشد الأكاديمي.',
      'لا يجوز أن يقل العبء الدراسي بعد الإسقاط عن الحد الأدنى (12 وحدة دراسية) إلا بموافقة عميد الكلية.',
      'يُرصد تقدير (W - منسحب) للمقررات المنسحب منها بعد انقضاء المهلة الرسمية ولا تدخل في حساب المعدل التراكمي.'
    ],
    keywords: ['18', 'إسقاط', 'اسقاط', 'حذف', 'إضافة', 'اضافة', 'تنريل', 'تنزيل', 'add', 'drop', 'withdraw', 'article 18'],
  },
  {
    id: 'art-27',
    articleNumber: 27,
    titleAr: 'نسبة الحضور والغياب والحرمان من الامتحانات',
    titleEn: 'Attendance, Absence and Exam Barring Regulations',
    category: 'الامتحانات والانضباط',
    contentAr: 'وفقاً للمادة (27) بخصوص الانضباط الأكاديمي ونسب الحضور بجامعة المرقب:',
    contentEn: 'According to Article (27) regarding academic discipline and attendance limits at Elmergib University:',
    bulletPointsAr: [
      'يلتزم الطالب بحضور ما لا يقل عن 75% من المحاضرات والدروس المعملية المعتمدة لكل مقرر دراسي.',
      'يُحرم الطالب من دخول الامتحان النهائي ويرصد له تقدير (محروم / 0) إذا تجاوزت نسبة غيابه 25% دون عذر مقبول.',
      'الأعذار المرضية يجب أن تصادق عليها اللجنة الطبية المعتمدة التابعة لجامعة المرقب خلال أسبوع من تاريخ الغياب.'
    ],
    keywords: ['27', 'غياب', 'حرمان', 'حضور', 'نسبة', 'امتحان', 'محاضرات', 'attendance', 'absence', 'barred', 'exam', 'article 27'],
  },
  {
    id: 'art-34',
    articleNumber: 34,
    titleAr: 'نظام الدرجات واحتساب المعدل التراكمي (GPA)',
    titleEn: 'Grading Scales and GPA Calculation',
    category: 'التقييم والنتائج',
    contentAr: 'وفقاً للمادة (34) المحددة لسلم الدرجات والتقديرات المعتمد بكليات جامعة المرقب:',
    contentEn: 'According to Article (34) establishing the official grade distribution and grading scale at Elmergib University:',
    bulletPointsAr: [
      'ممتاز: 85% فما فوق (نقاط 4.00)، جيد جداً: 75% إلى أقل من 85% (نقاط 3.00 - 3.75).',
      'جيد: 65% إلى أقل من 75% (نقاط 2.00 - 2.75)، مقبول: 50% إلى أقل من 65% (نقاط 1.00 - 1.75).',
      'راسب: أقل من 50%، ويشترط لنيل الدرجة الجامعية ألا يقل المعدل التراكمي العام عن (2.00 / جيد) في بعض التخصصات الهندسية و (مقبول) في باقي الكليات.'
    ],
    keywords: ['34', 'درجات', 'معدل', 'تراكمي', 'تقدير', 'ممتاز', 'نقاط', 'gpa', 'grades', 'scale', 'article 34'],
  },
  {
    id: 'art-52',
    articleNumber: 52,
    titleAr: 'متطلبات التخرج ومشروع التخرج النهائي',
    titleEn: 'Graduation Requirements & Senior Capstone Project',
    category: 'التخرج والشهادات',
    contentAr: 'وفقاً للمادة (52) من اللائحة التنفيذية لمتطلبات منح الإجازة الجامعية الأولى بجامعة المرقب:',
    contentEn: 'According to Article (52) regarding conditions for awarding the first university degree at Elmergib University:',
    bulletPointsAr: [
      'استيفاء كافة المقررات الدراسية والوحدات المعتمدة المقررة في الخطة الدراسية لكل قسم علمي بنجاح.',
      'إنجاز مشروع التخرج ومناقشته علناً أمام لجنة التحكيم المعتمدة والحصول على درجة لا تقل عن 60%.',
      'تسوية جميع الالتزامات الإدارية وإخلاء الطرف من مكتبة الكلية والمعامل والمخازن والأقسام الداخلية.'
    ],
    keywords: ['52', 'تخرج', 'مشروع', 'متطلبات', 'شهادة', 'مناقشة', 'graduation', 'project', 'capstone', 'degree', 'article 52'],
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-user-1',
    sender: 'user',
    timestamp: '11:38 PM',
    content: 'ما هي شروط وإجراءات إيقاف القيد الفصلي وفق المادة 21؟',
    userName: 'طالب - جامعة المرقب',
    userRole: 'Student',
  },
  {
    id: 'msg-assistant-1',
    sender: 'assistant',
    timestamp: '11:38 PM',
    content: 'وفقاً للمادة (21) من لائحة تنظيم شؤون الدراسة والامتحانات بجامعة المرقب:',
    bulletPoints: [
      'يجوز للطالب التقدم بطلب إيقاف القيد الفصلي قبل نهاية الأسبوع الرابع من بدء الدراسة.',
      'يجب تقديم عذر رسمي معتمد تقبله الكلية المختصة ومسجل الكلية.',
      'لا تحسب فترة الإيقاف المعتمدة ضمن المدة القانونية القصوى المقررة للحصول على الدرجة الجامعية.'
    ],
    subNote: '.This is a placeholder answer',
    verifiedSource: true,
    citation: {
      documentTitle: 'University Regulations / لائحة تنظيم شؤون التعليم العالي والجامعات',
      documentTitleEn: 'University Regulations / Higher Education & University Affairs Bylaw',
      retrievalDate: '2023-01-01',
      articleReference: 'Article Reference',
      chunkLabel: 'Placeholder chunk',
      excerpt: '"المادة (21): يحق للطالب وقف قيده لفصل دراسي واحد بقرار من عميد الكلية بناءً على طلب مبرر يقدمه الطالب خلال المدة المحددة..."',
      sourceUrl: 'http://example.com/doc',
      pdfPage: 21,
    }
  }
];

export function findMatchingBylaw(query: string): BylawArticle {
  const normalized = query.toLowerCase();
  for (const article of ELMERGIB_BYLAWS) {
    if (article.keywords.some(k => normalized.includes(k.toLowerCase()))) {
      return article;
    }
  }
  // Default to Article 21
  return ELMERGIB_BYLAWS[0];
}
