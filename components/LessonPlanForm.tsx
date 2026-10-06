
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonPlanFormData, LessonPlanFormProps, AttachedFile, ExtractedGraphicItem } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';
import { ClearIcon } from './icons/ClearIcon';
import { QuestionIcon } from './icons/QuestionIcon';
import { MethodsIcon } from './icons/MethodsIcon';
import { GamesIcon } from './icons/GamesIcon';
import { DigitalIcon } from './icons/DigitalIcon';
import { Shield, HeartHandshake, Clock, Network, Lock, User, Building, Bot, Atom, Paperclip, X, FileText, FileCode, Image as ImageIcon, CheckCircle2, Loader2, Sparkles, Layers, Sliders, Globe, BookOpen, ShieldCheck, Save, Bookmark, Check, RotateCcw } from 'lucide-react';
import { SUBJECTS_BY_LEVEL, GRADES_BY_LEVEL } from './TeacherInfoModal';
import { processFile, formatFileSize } from '../utils/fileUtils';
import { extractGraphicsFromAttachedFile } from '../utils/graphicUtils';
import { AICompetencyModal } from './AICompetencyModal';
import { DigitalCompetencyModal } from './DigitalCompetencyModal';
import { ConfigManagerModal, extractConfigSettings, STORAGE_KEY_SAVED_CONFIG } from './ConfigManagerModal';
import { 
  saveActiveLessonPlanConfig, 
  saveFormDataAsPreset, 
  clearActiveLessonPlanConfig, 
  loadPresetsStorage 
} from '../utils/configStorage';

const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading, 
  clearForm,
  generationCount = 0,
  maxGenerations = 1,
  userType = 'trial',
  teacherInfo,
  onOpenTeacherInfoModal,
  onOpenVipModal,
  userApiKey
}) => {
  const isTrialLimitReached = userType === 'trial' && generationCount >= maxGenerations;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawFilesMapRef = useRef<Map<string, File>>(new Map());
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isNLSModalOpen, setIsNLSModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [presetsCount, setPresetsCount] = useState<number>(0);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    return localStorage.getItem('khbd_last_saved_time') || null;
  });

  // Tự động đếm số lượng mẫu đã lưu
  const refreshPresetsCount = async () => {
    try {
      const list = await loadPresetsStorage();
      setPresetsCount(list.length);
    } catch (_) {}
  };

  useEffect(() => {
    refreshPresetsCount();
  }, [isConfigModalOpen]);

  const handleSaveConfig = async () => {
    try {
      // Lưu vào cấu hình đang kích hoạt đồng thời ĐƯA VÀO "MẪU ĐÃ LƯU"
      const { newPreset, allPresets } = await saveFormDataAsPreset(formData);
      setPresetsCount(allPresets.length);
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('khbd_last_saved_time', nowStr);
      setLastSavedTime(nowStr);
      setIsSavedFeedback(true);
      const filesCount = formData.attachedFiles?.length || 0;
      const fileDesc = filesCount > 0 ? ` (kèm ${filesCount} tệp đính kèm)` : '';
      setToastMessage(`Đã lưu cấu hình bài soạn và thêm vào "Mẫu đã lưu" (${newPreset.name}${fileDesc})!`);
      setTimeout(() => setIsSavedFeedback(false), 2500);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (e) {
      console.error('Lỗi khi lưu cấu hình:', e);
      setToastMessage('Không thể lưu cấu hình vào bộ nhớ trình duyệt.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearActiveLessonPlanConfig();
    } catch (e) {
      console.warn('Lỗi khi xóa cấu hình:', e);
    }
    localStorage.removeItem('khbd_last_saved_time');
    setLastSavedTime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    rawFilesMapRef.current.clear();
    clearForm();
    setToastMessage('Đã làm sạch biểu mẫu và xóa sạch cấu hình lưu trong bộ nhớ!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyConfigPreset = (patch: Partial<LessonPlanFormData>, name: string) => {
    setFormData(prev => ({
      ...prev,
      ...patch
    }));
    if (patch.attachedFiles && patch.attachedFiles.length > 0) {
      patch.attachedFiles.forEach(file => {
        if (!rawFilesMapRef.current.has(file.id)) {
          getFileObject(file, rawFilesMapRef.current);
        }
      });
    }
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('khbd_last_saved_time', nowStr);
    setLastSavedTime(nowStr);
    const fileCount = patch.attachedFiles?.length || 0;
    const fileMsg = fileCount > 0 ? ` (kèm ${fileCount} tệp đính kèm)` : '';
    setToastMessage(`Đã nạp mẫu cấu hình "${name}"${fileMsg} thành công!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInsertAICode = (codeText: string) => {
    setFormData(prev => {
      const current = prev.coreContent ? prev.coreContent.trim() : '';
      const updated = current ? `${current}\n- Yêu cầu mã AI: ${codeText}` : `- Yêu cầu mã AI: ${codeText}`;
      return {
        ...prev,
        coreContent: updated,
        includeAI2422: true
      };
    });
    setActiveTab('text');
  };

  const handleInsertNLSCode = (codeText: string) => {
    setFormData(prev => {
      const current = prev.coreContent ? prev.coreContent.trim() : '';
      const updated = current ? `${current}\n- Yêu cầu mã NLS: ${codeText}` : `- Yêu cầu mã NLS: ${codeText}`;
      return {
        ...prev,
        coreContent: updated,
        includeDigitalCompetence: true
      };
    });
    setActiveTab('text');
  };

  // Helper to retrieve or reconstruct File object
  const getFileObject = (attached: AttachedFile, rawMap: Map<string, File>): File | null => {
    if (rawMap.has(attached.id)) {
      return rawMap.get(attached.id)!;
    }
    if (attached.dataBase64) {
      try {
        const base64Data = attached.dataBase64.includes(',') 
          ? attached.dataBase64.split(',')[1] 
          : attached.dataBase64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], attached.name, { type: attached.mimeType || 'application/octet-stream' });
      } catch (e) {
        console.warn('Cannot reconstruct file from base64:', e);
      }
    }
    return null;
  };

  // Trigger graphics extraction on existing attached files
  const triggerGraphicsExtraction = async (filesToExtract?: AttachedFile[]) => {
    const targetFiles = filesToExtract || formData.attachedFiles || [];
    if (targetFiles.length === 0) return;

    setIsProcessingFiles(true);
    setProcessingStatus('Đang quét và bóc tách đối tượng đồ họa từ các tệp đính kèm...');

    const newExtractedGraphics: ExtractedGraphicItem[] = [];

    for (let i = 0; i < targetFiles.length; i++) {
      const attached = targetFiles[i];
      const fileObj = getFileObject(attached, rawFilesMapRef.current);
      if (!fileObj) continue;

      try {
        setProcessingStatus(`Đang quét đồ họa: ${attached.name} (${i + 1}/${targetFiles.length})...`);
        const extracted = await extractGraphicsFromAttachedFile(fileObj, userApiKey);
        if (extracted && extracted.length > 0) {
          newExtractedGraphics.push(...extracted);
        }
      } catch (err) {
        console.warn('Lỗi bóc tách hình ảnh từ tệp:', attached.name, err);
      }
    }

    setFormData(prev => {
      const existingGraphics = prev.extractedGraphics || [];
      const combinedGraphics = [...existingGraphics];
      for (const g of newExtractedGraphics) {
        if (!combinedGraphics.some(item => item.id === g.id)) {
          combinedGraphics.push(g);
        }
      }
      return {
        ...prev,
        extractGraphics: true,
        extractedGraphics: combinedGraphics
      };
    });

    setIsProcessingFiles(false);
    setProcessingStatus('');
  };

  // Handle switching "Có" / "Không" for graphic extraction
  const handleToggleExtractGraphics = async (enable: boolean) => {
    if (!enable) {
      setFormData(prev => ({ ...prev, extractGraphics: false }));
      return;
    }

    setFormData(prev => ({ ...prev, extractGraphics: true }));

    // Khi chuyển sang "Có", nếu có tệp đính kèm mà chưa có ảnh trích xuất thì bắt đầu bóc tách
    if (formData.attachedFiles && formData.attachedFiles.length > 0) {
      const hasGraphics = formData.extractedGraphics && formData.extractedGraphics.length > 0;
      if (!hasGraphics) {
        await triggerGraphicsExtraction(formData.attachedFiles);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsProcessingFiles(true);
    setProcessingStatus('Đang đọc tệp và trích xuất nội dung văn bản...');
    const newAttachedFiles: AttachedFile[] = [];
    const newExtractedGraphics: ExtractedGraphicItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setProcessingStatus(`Đang đọc nội dung: ${file.name}...`);
      const processed = await processFile(file);
      newAttachedFiles.push(processed);
      rawFilesMapRef.current.set(processed.id, file);

      // Chỉ bóc tách đồ họa khi người dùng đã bật chế độ "Có" (extractGraphics === true)
      if (formData.extractGraphics) {
        try {
          setProcessingStatus(`Đang quét & bóc tách đồ họa từ: ${file.name}...`);
          const extracted = await extractGraphicsFromAttachedFile(file, userApiKey);
          if (extracted && extracted.length > 0) {
            newExtractedGraphics.push(...extracted);
          }
        } catch (err) {
          console.warn('Lỗi bóc tách hình ảnh từ tệp:', file.name, err);
        }
      }
    }

    setFormData(prev => {
      const existingGraphics = prev.extractedGraphics || [];
      const combinedGraphics = [...existingGraphics];
      for (const g of newExtractedGraphics) {
        if (!combinedGraphics.some(item => item.id === g.id)) {
          combinedGraphics.push(g);
        }
      }
      return {
        ...prev,
        attachedFiles: [...(prev.attachedFiles || []), ...newAttachedFiles],
        extractedGraphics: prev.extractGraphics ? combinedGraphics : prev.extractedGraphics,
      };
    });

    setIsProcessingFiles(false);
    setProcessingStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    rawFilesMapRef.current.delete(fileId);
    setFormData(prev => {
      const removedFile = (prev.attachedFiles || []).find(f => f.id === fileId);
      const remainingFiles = (prev.attachedFiles || []).filter(f => f.id !== fileId);
      const remainingGraphics = removedFile 
        ? (prev.extractedGraphics || []).filter(g => g.sourceFileName !== removedFile.name)
        : (prev.extractedGraphics || []);

      return {
        ...prev,
        attachedFiles: remainingFiles,
        extractedGraphics: remainingGraphics
      };
    });
  };

  const teacherLevels: ('TH' | 'THCS' | 'THPT')[] = Array.isArray(teacherInfo?.schoolLevel) && teacherInfo.schoolLevel.length > 0
    ? teacherInfo.schoolLevel
    : ['TH', 'THCS', 'THPT'];

  const filteredSubjects = Array.from(
    new Set(teacherLevels.flatMap(lvl => SUBJECTS_BY_LEVEL[lvl] || []))
  );

  const filteredGrades = teacherLevels.flatMap(lvl => GRADES_BY_LEVEL[lvl] || []);

  useEffect(() => {
    const validGradeValues = filteredGrades.map(g => g.value);
    const isSubjectValid = filteredSubjects.includes(formData.subject);
    const isGradeValid = validGradeValues.includes(formData.grade);

    if (!isSubjectValid || !isGradeValid) {
      const nextSubject = isSubjectValid 
        ? formData.subject 
        : (teacherInfo?.mainSubject && filteredSubjects.includes(teacherInfo.mainSubject) ? teacherInfo.mainSubject : (filteredSubjects[0] || 'Toán'));
      
      let extraUpdates: Partial<typeof formData> = {};
      if (nextSubject === 'Tiếng Anh') {
        extraUpdates.outputLanguage = 'Tiếng Anh';
        extraUpdates.textbook = 'Global Success';
      } else if (nextSubject === 'Ngoại ngữ khác') {
        extraUpdates.outputLanguage = 'Ngôn ngữ khác';
        extraUpdates.textbook = 'Bộ sách Khác';
      }

      setFormData(prev => ({
        ...prev,
        subject: nextSubject,
        grade: isGradeValid ? prev.grade : (validGradeValues[0] || '6'),
        ...extraUpdates
      }));
    }
  }, [teacherInfo?.schoolLevel, teacherInfo?.mainSubject]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        ...(name === 'includeAI2422' || name === 'includeAI3439' ? { includeAI2422: checked, includeAI3439: checked } : {})
      }));
    } else if (name === 'subject') {
      let extraUpdates: Partial<typeof formData> = {};
      if (value === 'Tiếng Anh') {
        extraUpdates = { textbook: 'Global Success', outputLanguage: 'Tiếng Anh' };
      } else if (value === 'Ngoại ngữ khác') {
        extraUpdates = { textbook: 'Bộ sách Khác', outputLanguage: 'Ngôn ngữ khác' };
      } else {
        if (formData.textbook === 'Global Success') {
          extraUpdates.textbook = 'Bộ sách hiện hành';
        }
        if (formData.outputLanguage === 'Tiếng Anh' || (formData.outputLanguage === 'Ngôn ngữ khác' && !formData.customLanguage)) {
          extraUpdates.outputLanguage = 'Tiếng Việt';
        }
      }
      setFormData(prev => ({ ...prev, [name]: value, ...extraUpdates }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const OptionCard = ({ id, name, checked, icon, label, description }: { 
    id: string, name: string, checked: boolean, icon: React.ReactNode, label: string, description: string, colorClass?: string 
  }) => (
    <label 
      htmlFor={id} 
      className={`relative group flex items-start p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        checked 
          ? 'bg-amber-50/70 border-orange-500 shadow-sm ring-2 ring-orange-200/60' 
          : 'bg-orange-50/20 border-orange-200/90 hover:border-orange-400 hover:bg-orange-50/60'
      }`}
    >
      <div className="flex h-5 items-center mt-0.5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition cursor-pointer accent-orange-600"
        />
      </div>
      <div className="ml-2.5 flex-1">
        <div className="flex items-center space-x-1.5">
          <div className={`p-1 rounded-lg ${checked ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'} group-hover:scale-105 transition-transform duration-200`}>
            {icon}
          </div>
          <span className={`text-[12px] font-bold ${checked ? 'text-orange-950' : 'text-amber-950'}`}>
            {label}
          </span>
        </div>
        <p className="text-slate-500 text-[10px] leading-tight font-medium pl-1 mt-0.5">
          {description}
        </p>
      </div>
    </label>
  );

  const labelClass = "block text-[12px] font-black text-amber-950 uppercase tracking-wider mb-1.5 ml-1";

  // Kiểm tra trạng thái sẵn sàng của tệp đính kèm và bóc tách đồ họa
  const hasAttachedFiles = Boolean(formData.attachedFiles && formData.attachedFiles.length > 0);
  const allFilesReady = hasAttachedFiles
    ? (formData.attachedFiles || []).every(file => Boolean(file.extractedText || file.dataBase64))
    : true;

  // Nếu chọn "Có" bóc tách hình ảnh: Chỉ cho phép tạo bài dạy khi không còn đang bóc tách/xử lý và tệp ở trạng thái Sẵn sàng
  const isWaitingForGraphicsOrFiles = isProcessingFiles || (formData.extractGraphics && hasAttachedFiles && !allFilesReady);
  const isCustomLanguageMissing = formData.outputLanguage === 'Ngôn ngữ khác' && !formData.customLanguage?.trim();
  const isSubmitDisabled = isLoading || isWaitingForGraphicsOrFiles || isCustomLanguageMissing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.outputLanguage === 'Ngôn ngữ khác' && !formData.customLanguage?.trim()) {
      alert('Thầy/Cô vui lòng nhập tên Ngôn ngữ bài soạn (VD: Tiếng Pháp, Tiếng Trung, Tiếng Nhật, Tiếng Đức...) trước khi bắt đầu tạo bài dạy!');
      return;
    }
    if (isSubmitDisabled) return;
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-between gap-2 border border-emerald-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Start */}

      <div className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1">
            <label htmlFor="lessonTitle" className="block text-[12px] font-black text-amber-950 uppercase tracking-wider">
              Tên bài soạn <span className="text-orange-600 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              title="Xem danh sách mẫu cấu hình hoặc nạp mẫu cấu hình đã lưu"
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-bold rounded-lg border border-orange-300 hover:border-orange-500 text-[11px] shadow-2xs active:scale-95 transition-all group"
            >
              <Bookmark className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition-transform" />
              <span>Mẫu đã lưu</span>
              {presetsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[10px] font-black">
                  {presetsCount}
                </span>
              )}
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <input
              type="text"
              name="lessonTitle"
              id="lessonTitle"
              value={formData.lessonTitle}
              onChange={handleChange}
              placeholder="VD: Bài 15 – Sự nở vì nhiệt của chất rắn"
              required
              className="w-full pl-9 pr-4 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="subject" className={labelClass}>
              Môn học <span className="text-orange-600 font-bold">*</span>
            </label>
            <select
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800"
            >
              {filteredSubjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="grade" className={labelClass}>Lớp</label>
            <select
              name="grade"
              id="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800"
            >
              {filteredGrades.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="textbook" className={labelClass}>Bộ sách</label>
            <select
              name="textbook"
              id="textbook"
              value={formData.textbook}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800"
            >
              {formData.subject === 'Tiếng Anh' ? (
                <>
                  <option value="Global Success">Global Success</option>
                  <option value="Bộ sách Khác">Bộ sách Khác</option>
                </>
              ) : (
                <>
                  <option value="Bộ sách hiện hành">Bộ sách hiện hành</option>
                  <option value="Bộ sách Khác">Bộ sách Khác</option>
                </>
              )}
            </select>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="duration" className={labelClass}>Số tiết</label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  max="20"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-center bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-slate-800 h-[42px]"
                />
              </div>
              <div>
                <label htmlFor="splitPeriods" className={labelClass}>Tách tiết</label>
                <label 
                  htmlFor="splitPeriods" 
                  className={`w-full inline-flex items-center justify-center gap-1.5 cursor-pointer select-none text-xs font-bold px-2 py-2 rounded-xl border-2 transition-all h-[42px] ${
                    formData.splitPeriods 
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm' 
                      : 'bg-orange-50/80 text-orange-950 border-orange-200 hover:bg-orange-100/90'
                  }`}
                  title="Tự động phân bổ và chia tách tiến trình dạy học theo từng tiết (35 phút/tiết cho Tiểu học, 45 phút/tiết cho THCS & THPT)"
                >
                  <input
                    type="checkbox"
                    name="splitPeriods"
                    id="splitPeriods"
                    checked={formData.splitPeriods || false}
                    onChange={handleChange}
                    className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-600 cursor-pointer"
                  />
                  <span className="whitespace-nowrap">✂️ Tách</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Note/Helper badge for Textbook */}
        {(formData.textbook === 'Global Success' || formData.textbook.includes('Global Success')) && (
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-[11px] text-amber-950 font-medium leading-tight">
            📘 <strong>Global Success:</strong> Bộ sách Tiếng Anh chuẩn thống nhất cho tất cả các khối lớp.
          </div>
        )}
        {(formData.textbook === 'Bộ sách Khác' || formData.textbook.includes('Bộ sách Khác') || formData.textbook.includes('khác')) && (
          <div className="p-2.5 rounded-xl bg-orange-50/90 border border-orange-200 text-[11px] text-orange-950 font-medium leading-tight">
            📝 <strong>Bộ sách Khác:</strong> Thầy/Cô vui lòng định nghĩa chi tiết tên & nội dung bộ sách trong ô <strong>"Nội dung cốt lõi"</strong> bên dưới.
          </div>
        )}
        {['Trí tuệ nhân tạo (AI)', 'Môn học khác', 'Tự chọn', 'Chuyên đề học tập'].includes(formData.subject) && (
          <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-[11px] text-blue-950 font-medium leading-tight">
            💡 <strong>{formData.subject}:</strong> Môn học do người dùng tự định nghĩa. Thầy/Cô hãy nhập chủ đề/mục tiêu tại ô <strong>"Nội dung cốt lõi"</strong> hoặc đính kèm tệp tài liệu để AI biên soạn bài dạy bám sát yêu cầu.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="layoutColumns" className={labelClass}>Số cột KHBD</label>
            <select
              name="layoutColumns"
              id="layoutColumns"
              value={formData.layoutColumns || '1'}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800"
            >
              <option value="1">1 cột (Mặc định)</option>
              <option value="2">2 cột (HĐ & Sản phẩm)</option>
            </select>
          </div>
          <div>
            <label htmlFor="templateType" className={labelClass}>
              Mẫu KHBD Chuẩn
            </label>
            <select
              name="templateType"
              id="templateType"
              value={formData.templateType || 'auto'}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-orange-50/20 border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800"
            >
              <option value="auto">⚡ Tự động theo Lớp</option>
              <option value="2345">🏫 Mẫu KHBD Chuẩn (Tiểu học)</option>
              <option value="5512">📘 Mẫu KHBD Chuẩn (THCS / THPT)</option>
            </select>
          </div>
        </div>

        {/* Dynamic active template badge */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">Áp dụng:</span>
          </div>
          <span className="text-xs font-black text-orange-800 bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200">
            {formData.templateType === '2345' || (formData.templateType === 'auto' && ['1', '2', '3', '4', '5'].includes(formData.grade))
              ? '🏫 Mẫu KHBD Chuẩn (Cấp TIỂU HỌC)'
              : '📘 Mẫu KHBD Chuẩn (THCS & THPT)'}
          </span>
        </div>

        <div>
        <div className="bg-orange-50/40 border border-orange-200/90 rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[12px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
              <span>Nội dung cốt lõi</span>
              <span className="text-orange-600 font-bold">*</span>
            </label>

            {/* Micro status badge */}
            <div className="flex items-center space-x-1.5 text-[10px] font-bold">
              {formData.coreContent?.trim() && (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã nhập nội dung
                </span>
              )}
              {formData.attachedFiles && formData.attachedFiles.length > 0 && (
                <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 flex items-center gap-1">
                  <Paperclip className="w-3 h-3 text-orange-600" />
                  {formData.attachedFiles.length} tệp nguồn
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1 bg-orange-100/70 border border-orange-200 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>1. Nhập nội dung</span>
              {formData.coreContent?.trim() && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5 text-orange-600" />
              <span>2: Đính kèm tệp</span>
              {formData.attachedFiles && formData.attachedFiles.length > 0 ? (
                <span className="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {formData.attachedFiles.length}
                </span>
              ) : null}
            </button>
          </div>

          {/* Tab 1: Textarea for manual text input */}
          {activeTab === 'text' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] font-bold text-slate-500">Nhập kiến thức hoặc dán mã yêu cầu:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsNLSModalOpen(true)}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Mở danh mục mã Năng lực số học sinh theo CV 3456/BGDĐT-GDPT & TT 02/2025/TT-BGDĐT"
                  >
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Tra cứu mã NLS (CV 3456)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAIModalOpen(true)}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Mở danh mục mã YCCĐ Giáo dục Trí tuệ nhân tạo (AI) theo QĐ 2422/QĐ-BGDĐT"
                  >
                    <Bot className="w-3 h-3 text-purple-600" />
                    <span>Tra cứu mã AI (QĐ 2422)</span>
                  </button>
                </div>
              </div>
              <textarea
                name="coreContent"
                id="coreContent"
                rows={3}
                value={formData.coreContent}
                onChange={handleChange}
                placeholder="Nhập các mục chính, kiến thức trọng tâm, dàn ý bài giảng hoặc các mã năng lực số / AI yêu cầu (VD: mã NLS 1.1.TC2a, mã AI 9.A1.1 cho Lớp 9)..."
                required={!formData.attachedFiles || formData.attachedFiles.length === 0}
                className="w-full px-3 py-2 bg-white border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 resize-none text-xs"
              ></textarea>
              <div className="text-[10px] text-amber-900 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/80 leading-tight">
                💡 <em>Mẹo:</em> Nếu Thầy/Cô nhập mục tiêu kiến thức bài học hoặc mã năng lực số (CV 3456) / AI (QĐ 2422) cụ thể tại đây hoặc trong tệp đính kèm, hệ thống sẽ ưu tiên tôn trọng và sử dụng chính xác 100% nội dung này.
              </div>
            </div>
          )}

          {/* Tab 2: Attach documents */}
          {activeTab === 'file' && (
            <div className="space-y-2 pt-0.5">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp" 
                className="hidden" 
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-white border border-orange-200 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-orange-600" />
                    Tệp tài liệu nguồn
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Hỗ trợ (PDF, DOCX, Hình ảnh)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFiles || isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Chọn tệp</span>
                </button>
              </div>

              {isProcessingFiles && (
                <div className="flex items-center space-x-2 text-xs text-orange-800 bg-orange-100/90 p-2.5 rounded-xl border border-orange-300 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                  <span className="font-bold text-[11px] leading-tight">{processingStatus || 'Đang xử lý & bóc tách các hình minh họa từ tệp đính kèm...'}</span>
                </div>
              )}

              {formData.attachedFiles && formData.attachedFiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {formData.attachedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between bg-white border border-orange-200 rounded-xl p-2 shadow-2xs hover:border-orange-400 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          file.type === 'pdf' ? 'bg-rose-100 text-rose-700' :
                          file.type === 'image' ? 'bg-sky-100 text-sky-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {file.type === 'pdf' && <FileText className="w-3.5 h-3.5" />}
                          {file.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                          {file.type === 'docx' && <FileCode className="w-3.5 h-3.5" />}
                          {file.type === 'other' && <Paperclip className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="uppercase text-orange-800 font-black">{file.type}</span>
                            {Boolean(file.extractedText || file.dataBase64) ? (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3 inline text-emerald-600" /> Sẵn sàng
                                </span>
                              </>
                            ) : (
                              <>
                                <span>•</span>
                                <span className="text-amber-700 font-semibold flex items-center gap-0.5 animate-pulse">
                                  <Loader2 className="w-3 h-3 inline animate-spin text-amber-600" /> Đang bóc tách...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tệp đính kèm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 px-3 bg-white border border-dashed border-orange-200 rounded-xl">
                  <Paperclip className="w-5 h-5 text-orange-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-600">Chưa có tệp tài liệu đính kèm nào</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Bấm nút &quot;Chọn tệp đính kèm&quot; ở trên để tải lên bài giảng, sách giáo khoa hoặc đề bài.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Tùy chọn Bóc tách hình ảnh */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-amber-50/70 border-2 border-orange-300/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-600 text-white rounded-lg shadow-xs">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-orange-950 tracking-tight flex items-center gap-1.5">
                  <span>Bóc tách hình ảnh</span>
                  {formData.extractGraphics && (
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      Đang bật
                    </span>
                  )}
                </h4>
              </div>
            </div>

            {/* Toggle Switch Có / Không (Mặc định: Không) */}
            <div className="flex items-center bg-orange-100/80 p-0.5 rounded-xl border border-orange-300">
              <button
                type="button"
                onClick={() => handleToggleExtractGraphics(false)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  !formData.extractGraphics
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => handleToggleExtractGraphics(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  formData.extractGraphics
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Có
              </button>
            </div>
          </div>

          {/* Expanded controls when extractGraphics is active */}
          {formData.extractGraphics && (
            <div className="pt-2 border-t border-orange-200/80 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-[11px] font-bold text-orange-950">
                Chế độ chèn đồ họa vào văn bản KHBD:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label 
                  className={`flex items-center p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    (formData.graphicInsertMode || 'auto') === 'auto'
                      ? 'bg-white border-orange-500 ring-2 ring-orange-200 shadow-xs'
                      : 'bg-white/60 border-orange-200 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="graphicInsertMode"
                    value="auto"
                    checked={(formData.graphicInsertMode || 'auto') === 'auto'}
                    onChange={() => setFormData(prev => ({ ...prev, graphicInsertMode: 'auto' }))}
                    className="h-3.5 w-3.5 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                  />
                  <div className="ml-2">
                    <span className="block text-[11px] font-bold text-orange-950">⚡ Tự động chèn</span>
                  </div>
                </label>

                <label 
                  className={`flex items-center p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.graphicInsertMode === 'manual'
                      ? 'bg-white border-orange-500 ring-2 ring-orange-200 shadow-xs'
                      : 'bg-white/60 border-orange-200 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="graphicInsertMode"
                    value="manual"
                    checked={formData.graphicInsertMode === 'manual'}
                    onChange={() => setFormData(prev => ({ ...prev, graphicInsertMode: 'manual' }))}
                    className="h-3.5 w-3.5 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                  />
                  <div className="ml-2">
                    <span className="block text-[11px] font-bold text-orange-950">✍️ Thủ công</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="pt-1">
          <label className={labelClass}>Tùy chọn nâng cao</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Hàng 1: Tích hợp NLS và Tích hợp giáo dục AI */}
            <OptionCard 
              id="includeDigitalCompetence"
              name="includeDigitalCompetence"
              checked={formData.includeDigitalCompetence}
              icon={<DigitalIcon />}
              label="Tích hợp NLS"
              description="Thông tư 02/2025 & CV3456/BGDĐT"
              colorClass="teal"
            />
            <OptionCard 
              id="includeAI2422"
              name="includeAI2422"
              checked={Boolean(formData.includeAI2422 ?? formData.includeAI3439)}
              icon={<Bot className="w-4.5 h-4.5 text-purple-600" />}
              label="Tích hợp Giáo dục AI"
              description="Khung QĐ 2422/QĐ-BGDĐT"
              colorClass="purple"
            />

            {/* Hàng 2: Tích hợp GDQP&AN và Tích hợp HSKT */}
            <OptionCard 
              id="includeGDQP"
              name="includeGDQP"
              checked={formData.includeGDQP}
              icon={<Shield className="w-4.5 h-4.5 text-emerald-600" />}
              label="Tích hợp GDQP&AN"
              description="Thông tư 08/2024/TT-BGDĐT"
              colorClass="emerald"
            />
            <OptionCard 
              id="includeHSKT"
              name="includeHSKT"
              checked={formData.includeHSKT}
              icon={<HeartHandshake className="w-4.5 h-4.5 text-rose-600" />}
              label="Tích hợp HSKT"
              description="Thông tư 03/2018/TT-BGDĐT"
              colorClass="rose"
            />

            {/* Hàng 3: Khởi động và Củng cố */}
            <OptionCard 
              id="includeGames"
              name="includeGames"
              checked={formData.includeGames}
              icon={<GamesIcon />}
              label="Khởi động"
              description="Sôi nổi"
              colorClass="violet"
            />
            <OptionCard 
              id="includeReinforcementQuestions"
              name="includeReinforcementQuestions"
              checked={formData.includeReinforcementQuestions}
              icon={<QuestionIcon />}
              label="Củng cố"
              description="Bộ câu hỏi"
              colorClass="sky"
            />

            {/* Hàng 4: Phương pháp và Timeline */}
            <OptionCard 
              id="includeTeachingMethods"
              name="includeTeachingMethods"
              checked={formData.includeTeachingMethods}
              icon={<MethodsIcon />}
              label="Phương pháp"
              description="Tích cực"
              colorClass="amber"
            />
            <OptionCard 
              id="includeTimeline"
              name="includeTimeline"
              checked={formData.includeTimeline}
              icon={<Clock className="w-4.5 h-4.5 text-indigo-600" />}
              label="Timeline"
              description="Gợi ý phân bổ thời gian"
              colorClass="indigo"
            />

            {/* Hàng 5: InfoGraphic - Mindmap và Giáo án bài học STEM */}
            <OptionCard 
              id="includeInfographic"
              name="includeInfographic"
              checked={formData.includeInfographic}
              icon={<Network className="w-4.5 h-4.5 text-cyan-600" />}
              label="InfoGraphic - Mindmap"
              description="Khái quát nội dung kiến thức"
              colorClass="cyan"
            />
            <OptionCard 
              id="includeSTEM"
              name="includeSTEM"
              checked={formData.includeSTEM}
              icon={<Atom className="w-4.5 h-4.5 text-emerald-600" />}
              label="Giáo án Bài học STEM"
              description="Quy trình STEM (CV 3089/908)"
              colorClass="emerald"
            />
          </div>
        </div>

        {/* Mục Tích hợp nội dung khác */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="customIntegration" className={labelClass}>
              Tích hợp nội dung khác
            </label>
            {formData.customIntegration?.trim() && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã nhập yêu cầu
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              id="customIntegration"
              name="customIntegration"
              rows={3}
              value={formData.customIntegration || ''}
              onChange={handleChange}
              placeholder="Giáo viên nhập yêu cầu nội dung cần tích hợp vào đây !"
              className="w-full px-3 py-2.5 bg-white border-2 border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 resize-none text-xs leading-relaxed"
            />
            {formData.customIntegration?.trim() && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, customIntegration: '' }))}
                className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 rounded-lg bg-slate-100 hover:bg-rose-50 transition-colors text-[10px] font-bold cursor-pointer"
                title="Xóa nội dung"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
        {/* Tùy chọn Ngôn ngữ bài soạn */}
        <div className="bg-orange-50/60 p-3 rounded-2xl border-2 border-orange-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-600" />
              <span className="tracking-tight uppercase">Ngôn ngữ bài soạn</span>
            </label>
            <span className="text-[11px] text-orange-900 font-bold bg-orange-100/90 px-2 py-0.5 rounded-lg border border-orange-200">
              {formData.outputLanguage === 'Tiếng Anh' ? 'En TIẾNG ANH' : formData.outputLanguage === 'Ngôn ngữ khác' ? `🌐 ${formData.customLanguage?.trim() || 'Ngôn ngữ khác'}` : 'VN TIẾNG VIỆT'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-orange-200">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, outputLanguage: 'Tiếng Việt' }))}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                (formData.outputLanguage || 'Tiếng Việt') === 'Tiếng Việt'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/80'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-tight bg-white/20 px-1 rounded">VN</span>
              <span className="truncate">Tiếng Việt</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, outputLanguage: 'Tiếng Anh' }))}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                formData.outputLanguage === 'Tiếng Anh'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/80'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-tight bg-white/20 px-1 rounded">En</span>
              <span className="truncate">Tiếng Anh</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, outputLanguage: 'Ngôn ngữ khác' }))}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                formData.outputLanguage === 'Ngôn ngữ khác'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/80'
              }`}
            >
              <span>🌐</span>
              <span className="truncate">Khác...</span>
            </button>
          </div>

          {formData.outputLanguage === 'Ngôn ngữ khác' && (
            <div className="pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
              <input
                type="text"
                name="customLanguage"
                value={formData.customLanguage || ''}
                onChange={handleChange}
                placeholder="Nhập tên ngôn ngữ bài soạn (VD: Tiếng Pháp, Tiếng Trung, Tiếng Nhật, Tiếng Đức...)"
                required
                className={`w-full px-3 py-2 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all ${
                  isCustomLanguageMissing 
                    ? 'border-orange-400 focus:border-orange-600 focus:ring-orange-200 bg-orange-50/20' 
                    : 'border-orange-300 focus:border-orange-500 focus:ring-orange-100'
                }`}
                autoFocus
              />
              {isCustomLanguageMissing && (
                <p className="text-[11px] font-bold text-orange-800 flex items-center gap-1 pl-1">
                  <span>⚠️</span>
                  <span>Thầy/Cô vui lòng nhập tên ngôn ngữ để bắt đầu tạo bài dạy</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Thông báo trạng thái khi đang bóc tách đồ họa hoặc chờ tệp sẵn sàng */}
        {isWaitingForGraphicsOrFiles && (
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-900 bg-amber-50 p-2.5 rounded-xl border border-amber-300 shadow-2xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
            <span className="leading-tight text-[11px]">
              {processingStatus || (formData.extractGraphics ? 'Đang bóc tách hình ảnh từ tệp... Thầy/Cô vui lòng đợi tệp ở trạng thái "Sẵn sàng" trước khi bấm tạo bài dạy.' : 'Đang xử lý tệp đính kèm...')}
            </span>
          </div>
        )}

        {isTrialLimitReached ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-2.5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-200/90 text-amber-900 font-black mb-0.5">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <h4 className="text-sm font-black text-amber-950 uppercase tracking-tight">ĐÃ HẾT 1/1 LƯỢT DÙNG THỬ TRẢI NGHIỆM</h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Thầy/Cô đã hoàn thành <strong className="font-black text-orange-700">1/1 lượt trải nghiệm</strong> bản dùng thử. Kính mời Thầy/Cô đăng ký nâng cấp <strong>Bản chính thức</strong> để tiếp tục soạn giảng không giới hạn!
            </p>
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onOpenVipModal?.('limit_reached')}
                className="w-full bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-400 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <span>Đăng ký sử dụng bản chính thức ngay</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isSubmitDisabled}
            title={
              isCustomLanguageMissing 
                ? 'Vui lòng nhập tên Ngôn ngữ bài soạn để bắt đầu tạo bài dạy' 
                : isWaitingForGraphicsOrFiles 
                  ? 'Vui lòng đợi quá trình bóc tách hình ảnh hoàn tất và tệp ở trạng thái Sẵn sàng' 
                  : 'Bắt đầu tạo kế hoạch bài dạy'
            }
            className="relative w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-orange-700/20 hover:shadow-orange-500/35 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>ĐANG SOẠN THẢO...</span>
              </div>
            ) : isWaitingForGraphicsOrFiles ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span className="tracking-wide text-xs sm:text-sm font-bold">
                  {formData.extractGraphics ? 'ĐANG BÓC TÁCH HÌNH ẢNH (VUI LÒNG ĐỢI)...' : 'ĐANG XỬ LÝ TỆP...'}
                </span>
              </div>
            ) : (
              <>
                <GenerateIcon />
                <span className="tracking-wide">BẮT ĐẦU TẠO BÀI DẠY</span>
              </>
            )}
          </button>
        )}
        {/* Phía dưới chỉ để nút LƯU CẤU HÌNH BÀI SOẠN */}
        <button
          type="button"
          onClick={handleSaveConfig}
          disabled={isLoading || isProcessingFiles}
          title="Lưu cấu hình các thông số hiện tại (Môn, Lớp, Bộ sách, Bố cục, Các mục tích hợp) vào trình duyệt"
          className={`w-full flex items-center justify-center px-4 py-2.5 font-black rounded-xl active:scale-[0.98] transition-all duration-200 text-xs shadow-sm border ${
            isSavedFeedback
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-300'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500 shadow-amber-950/10'
          }`}
        >
          {isSavedFeedback ? (
            <>
              <Check className="w-4 h-4 mr-1.5 animate-bounce" />
              <span>ĐÃ LƯU CẤU HÌNH BÀI SOẠN!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              <span>LƯU CẤU HÌNH BÀI SOẠN</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleClearAll}
          disabled={isLoading || isProcessingFiles}
          className="w-full flex items-center justify-center px-6 py-2.5 bg-orange-700 hover:bg-orange-500 text-white font-bold rounded-xl active:scale-[0.98] transition-all duration-200 group text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="group-hover:rotate-90 transition-transform duration-300 mr-1.5">
             <ClearIcon />
          </div>
          <span>XÓA TẤT CẢ (LÀM TRẮNG BIỂU MẪU)</span>
        </button>
      </div>

      {/* Modal Quản lý & Nạp mẫu Cấu hình bài soạn */}
      <ConfigManagerModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentFormData={formData}
        onApplyConfig={handleApplyConfigPreset}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* Modal Tra cứu & Chọn mã Năng lực AI theo QĐ 2422 */}
      <AICompetencyModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        selectedGrade={formData.grade}
        onInsertCode={handleInsertAICode}
      />

      {/* Modal Tra cứu & Chọn mã Năng lực số học sinh theo CV 3456 & TT 02/2025 */}
      <DigitalCompetencyModal
        isOpen={isNLSModalOpen}
        onClose={() => setIsNLSModalOpen(false)}
        selectedGrade={formData.grade}
        onInsertCode={handleInsertNLSCode}
      />
    </form>
  );
};

export default LessonPlanForm;
