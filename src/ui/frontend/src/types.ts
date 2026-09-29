export interface Citation {
  documentTitle: string;
  documentTitleEn?: string;
  retrievalDate: string;
  articleReference: string;
  chunkLabel?: string;
  excerpt: string;
  sourceUrl: string;
  pdfPage?: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  arabicContent?: string;
  bulletPoints?: string[];
  subNote?: string;
  verifiedSource?: boolean;
  citation?: Citation;
  userRole?: string;
  userRoleLabel?: string;
  userName?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

export interface BylawArticle {
  id: string;
  articleNumber: number;
  titleAr: string;
  titleEn: string;
  category: string;
  contentAr: string;
  contentEn: string;
  bulletPointsAr?: string[];
  keywords: string[];
}
