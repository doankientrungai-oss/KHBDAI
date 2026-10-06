
// FIX: Import React to make React types like `React.Dispatch` and `React.FormEvent` available.
import React from 'react';

export interface TeacherInfo {
  managingAgency: string; // Cơ quan chủ quản (mặc định: "UBND XÃ ABC")
  schoolName: string; // Tên Trường (mặc định: "TRƯỜNG THCS XYZ")
  schoolLevel: ('TH' | 'THCS' | 'THPT')[]; // Loại hình trường (dạy liên cấp: chọn 1 hoặc nhiều cấp)
  teacherName: string; // Họ tên giáo viên (mặc định: "ĐOÀN KIÊN TRUNG")
  mainSubject: string; // Bộ môn giảng dạy chính
  department: string; // Tổ chuyên môn (mặc định: "CNTT")
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'docx' | 'other';
  mimeType: string;
  dataBase64?: string;
  extractedText?: string;
  isLoading?: boolean;
  error?: string;
}

export interface ExtractedGraphicItem {
  id: string;
  sourceFileName: string;
  title: string; // VD: "Hình 1: Sơ đồ chu trình nước"
  caption?: string; // Chú thích chi tiết
  figureLabel?: string; // Nhãn hình SGK (VD: "Hình 1", "Hình 1.1", "Hình a", "Hình b", "Hình 1a")
  matchedDirectives?: string[]; // Các cụm từ chỉ dẫn SGK tương ứng (VD: ["Quan sát hình 1.1", "Hình 1.1", "Quan sát hình a"])
  dataUrl: string; // Base64 data URL
  mimeType?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  origin: 'attachment_docx' | 'attachment_image' | 'attachment_pdf' | 'ai_suggested' | 'web_search' | 'user_upload';
  isCleanedBackground?: boolean;
  cleanMode?: 'none' | 'white' | 'transparent' | 'high_contrast';
  suggestedContext?: string; // Hoạt động đề xuất chèn (VD: "Hoạt động 2.1: Khám phá")
}

export interface LessonPlanFormData {
  lessonTitle: string;
  subject: string;
  grade: string;
  textbook: string;
  duration: string;
  splitPeriods?: boolean; // Tùy chọn "Tách Tiết" (35 phút/tiết Tiểu học, 45 phút/tiết THCS/THPT)
  outputLanguage?: string; // Ngôn ngữ bài soạn: 'Tiếng Việt' | 'Tiếng Anh' | 'Ngôn ngữ khác'
  customLanguage?: string; // Tên ngôn ngữ khác khi chọn 'Ngôn ngữ khác'
  layoutColumns: string;
  templateType: 'auto' | '2345' | '5512'; // 'auto' (Tự động theo Lớp), '2345' (Tiểu học CV 2345), '5512' (THCS/THPT CV 5512)
  coreContent: string;
  customIntegration?: string; // Tùy chọn "Tích hợp nội dung khác"
  attachedFiles?: AttachedFile[]; // Tệp tài liệu nguồn đính kèm (pdf, hình ảnh, docx)
  extractGraphics?: boolean; // Chế độ bóc tách đối tượng đồ họa: Có / Không (Mặc định: Không)
  graphicInsertMode?: 'auto' | 'manual'; // Chế độ chèn đồ họa: Tự động (AI tự chèn vào nội dung liên quan) / Thủ công (chọn vị trí con trỏ)
  extractedGraphics?: ExtractedGraphicItem[]; // Danh sách các đối tượng đồ họa bóc tách được
  includeReinforcementQuestions: boolean;
  includeTeachingMethods: boolean;
  includeGames: boolean;
  includeDigitalCompetence: boolean;
  includeGDQP: boolean;
  includeHSKT: boolean;
  includeTimeline: boolean;
  includeInfographic: boolean;
  includeAI2422: boolean;
  includeAI3439?: boolean;
  includeSTEM: boolean;
}

export interface LessonPlanFormProps {
  formData: LessonPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<LessonPlanFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  clearForm: () => void;
  generationCount?: number;
  maxGenerations?: number;
  userType?: 'official' | 'trial';
  teacherInfo?: TeacherInfo;
  onOpenTeacherInfoModal?: () => void;
  onOpenVipModal?: (reason: 'copy' | 'download' | 'limit_reached' | 'general') => void;
  userApiKey?: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  teacherNotes?: string;
  aiImagePrompt: string;
}

export interface LessonPlanDisplayProps {
  plan: string;
  isLoading: boolean;
  lessonTitle?: string;
  isTrial?: boolean;
  userType?: 'official' | 'trial';
  onOpenVipModal?: (reason: 'copy' | 'download' | 'limit_reached' | 'general') => void;
  formData?: LessonPlanFormData;
  teacherInfo?: TeacherInfo;
  userApiKey?: string;
  extractedGraphics?: ExtractedGraphicItem[];
  onUpdateGraphics?: (graphics: ExtractedGraphicItem[]) => void;
  onUpdatePlan?: (newPlan: string) => void;
}

export interface HeaderProps {
  onLogout?: () => void;
  onResetApiKey?: () => void;
  userType?: 'official' | 'trial';
  generationCount?: number;
  teacherInfo?: TeacherInfo;
  onOpenTeacherInfoModal?: () => void;
  onOpenVipModal?: (reason: 'copy' | 'download' | 'limit_reached' | 'general') => void;
  onOpenGuideModal?: () => void;
  currentUser?: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    status: 'official' | 'trial' | 'blocked';
    role: 'admin' | 'user';
    generationCount: number;
    notes?: string;
  } | null;
  onOpenAdminModal?: () => void;
}

