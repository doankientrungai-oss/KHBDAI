import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  X, 
  Check, 
  Sliders, 
  Bookmark, 
  Trash2, 
  Plus, 
  Sparkles, 
  Clock, 
  Star, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { LessonPlanFormData, AttachedFile, ExtractedGraphicItem } from '../types';
import { 
  saveActiveLessonPlanConfig, 
  loadPresetsStorage, 
  savePresetsStorage, 
  deletePresetStorage, 
  clearActiveLessonPlanConfig 
} from '../utils/configStorage';

export interface SavedLessonPlanConfig {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  saveContent?: boolean;
  lessonTitle?: string;
  coreContent?: string;
  customIntegration?: string;
  attachedFiles?: AttachedFile[];
  extractedGraphics?: ExtractedGraphicItem[];
  settings: {
    subject: string;
    grade: string;
    textbook: string;
    duration: string;
    splitPeriods: boolean;
    outputLanguage: string;
    customLanguage: string;
    layoutColumns: string;
    templateType: 'auto' | '2345' | '5512';
    extractGraphics: boolean;
    graphicInsertMode: 'auto' | 'manual';
    includeDigitalCompetence: boolean;
    includeAI2422: boolean;
    includeAI3439?: boolean;
    includeGDQP: boolean;
    includeHSKT: boolean;
    includeSTEM: boolean;
    customIntegration: string;
    includeReinforcementQuestions: boolean;
    includeTeachingMethods: boolean;
    includeGames: boolean;
    includeTimeline: boolean;
    includeInfographic: boolean;
  };
}

export const STORAGE_KEY_SAVED_CONFIG = 'khbd_saved_config';
export const STORAGE_KEY_CONFIG_PRESETS = 'khbd_config_presets';

export const extractConfigSettings = (formData: LessonPlanFormData) => ({
  subject: formData.subject || 'Toán',
  grade: formData.grade || '6',
  textbook: formData.textbook || 'Bộ sách hiện hành',
  duration: formData.duration || '2',
  splitPeriods: Boolean(formData.splitPeriods),
  outputLanguage: formData.outputLanguage || 'Tiếng Việt',
  customLanguage: formData.customLanguage || '',
  layoutColumns: formData.layoutColumns || '1',
  templateType: formData.templateType || 'auto',
  extractGraphics: Boolean(formData.extractGraphics),
  graphicInsertMode: formData.graphicInsertMode || 'auto',
  includeDigitalCompetence: Boolean(formData.includeDigitalCompetence),
  includeAI2422: Boolean(formData.includeAI2422),
  includeAI3439: Boolean(formData.includeAI3439),
  includeGDQP: Boolean(formData.includeGDQP),
  includeHSKT: Boolean(formData.includeHSKT),
  includeSTEM: Boolean(formData.includeSTEM),
  customIntegration: formData.customIntegration || '',
  includeReinforcementQuestions: Boolean(formData.includeReinforcementQuestions),
  includeTeachingMethods: Boolean(formData.includeTeachingMethods),
  includeGames: Boolean(formData.includeGames),
  includeTimeline: Boolean(formData.includeTimeline),
  includeInfographic: Boolean(formData.includeInfographic),
});

export const DEFAULT_PRESETS: SavedLessonPlanConfig[] = [
  {
    id: 'preset-cv5512-standard',
    name: 'Chuẩn CV 5512 (THCS & THPT - Tích hợp NLS + AI)',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    isDefault: false,
    settings: {
      subject: 'Toán',
      grade: '6',
      textbook: 'Bộ sách hiện hành',
      duration: '2',
      splitPeriods: false,
      outputLanguage: 'Tiếng Việt',
      customLanguage: '',
      layoutColumns: '2',
      templateType: '5512',
      extractGraphics: false,
      graphicInsertMode: 'auto',
      includeDigitalCompetence: true,
      includeAI2422: true,
      includeAI3439: true,
      includeGDQP: false,
      includeHSKT: false,
      includeSTEM: false,
      customIntegration: '',
      includeReinforcementQuestions: true,
      includeTeachingMethods: true,
      includeGames: true,
      includeTimeline: false,
      includeInfographic: false,
    }
  },
  {
    id: 'preset-stem-3089',
    name: 'Bài học STEM (CV 3089/BGDĐT - 5 Hoạt động)',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    isDefault: false,
    settings: {
      subject: 'Khoa học tự nhiên',
      grade: '7',
      textbook: 'Bộ sách hiện hành',
      duration: '3',
      splitPeriods: true,
      outputLanguage: 'Tiếng Việt',
      customLanguage: '',
      layoutColumns: '2',
      templateType: '5512',
      extractGraphics: true,
      graphicInsertMode: 'auto',
      includeDigitalCompetence: true,
      includeAI2422: true,
      includeAI3439: true,
      includeGDQP: false,
      includeHSKT: false,
      includeSTEM: true,
      customIntegration: '',
      includeReinforcementQuestions: true,
      includeTeachingMethods: true,
      includeGames: true,
      includeTimeline: true,
      includeInfographic: true,
    }
  },
  {
    id: 'preset-cv2345-primary',
    name: 'Chuẩn Tiểu học (CV 2345/BGDĐT - 35 phút/tiết)',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    isDefault: false,
    settings: {
      subject: 'Toán',
      grade: '4',
      textbook: 'Bộ sách hiện hành',
      duration: '1',
      splitPeriods: false,
      outputLanguage: 'Tiếng Việt',
      customLanguage: '',
      layoutColumns: '2',
      templateType: '2345',
      extractGraphics: false,
      graphicInsertMode: 'auto',
      includeDigitalCompetence: true,
      includeAI2422: true,
      includeAI3439: true,
      includeGDQP: true,
      includeHSKT: false,
      includeSTEM: false,
      customIntegration: '',
      includeReinforcementQuestions: true,
      includeTeachingMethods: false,
      includeGames: true,
      includeTimeline: false,
      includeInfographic: true,
    }
  }
];

interface ConfigManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormData: LessonPlanFormData;
  onApplyConfig: (settings: Partial<LessonPlanFormData>, name: string) => void;
  onShowToast: (message: string) => void;
}

export const ConfigManagerModal: React.FC<ConfigManagerModalProps> = ({
  isOpen,
  onClose,
  currentFormData,
  onApplyConfig,
  onShowToast
}) => {
  const [presets, setPresets] = useState<SavedLessonPlanConfig[]>([]);
  const [presetName, setPresetName] = useState<string>('');
  const [includeContentInPreset, setIncludeContentInPreset] = useState<boolean>(false);
  const [isDefaultCheckbox, setIsDefaultCheckbox] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'save_new' | 'preset_list'>('preset_list');
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  // Load presets from unified storage (IndexedDB + localStorage)
  useEffect(() => {
    if (!isOpen) return;
    loadPresetsStorage()
      .then((loaded) => {
        setPresets(loaded);
      })
      .catch((e) => {
        console.error('Failed to load presets:', e);
        setPresets(DEFAULT_PRESETS);
      });
  }, [isOpen]);

  // Set default preset name suggestion based on current form
  useEffect(() => {
    if (isOpen) {
      const subj = currentFormData.subject || 'Môn học';
      const gr = currentFormData.grade ? `Lớp ${currentFormData.grade}` : '';
      const cols = currentFormData.layoutColumns === '2' ? '2 Cột' : '1 Cột';
      const stem = currentFormData.includeSTEM ? 'STEM' : '';
      const parts = [subj, gr, cols, stem].filter(Boolean);
      setPresetName(parts.join(' - '));
    }
  }, [isOpen, currentFormData.subject, currentFormData.grade, currentFormData.layoutColumns, currentFormData.includeSTEM]);

  const handleSaveNewPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = presetName.trim();
    if (!trimmedName) return;

    const newConfig: SavedLessonPlanConfig = {
      id: `preset-${Date.now()}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: isDefaultCheckbox,
      saveContent: includeContentInPreset,
      ...(includeContentInPreset ? { lessonTitle: currentFormData.lessonTitle } : {}),
      coreContent: currentFormData.coreContent || '',
      customIntegration: currentFormData.customIntegration || '',
      attachedFiles: currentFormData.attachedFiles ? [...currentFormData.attachedFiles] : [],
      extractedGraphics: currentFormData.extractedGraphics ? [...currentFormData.extractedGraphics] : [],
      settings: extractConfigSettings(currentFormData)
    };

    let updatedPresets = [...presets];
    if (isDefaultCheckbox) {
      updatedPresets = updatedPresets.map(p => ({ ...p, isDefault: false }));
    }
    updatedPresets.unshift(newConfig);

    setPresets(updatedPresets);
    await savePresetsStorage(updatedPresets);

    // Also update current active config via saveActiveLessonPlanConfig
    await saveActiveLessonPlanConfig({
      ...currentFormData,
      ...newConfig.settings,
      coreContent: newConfig.coreContent,
      customIntegration: newConfig.customIntegration,
      attachedFiles: newConfig.attachedFiles,
      extractedGraphics: newConfig.extractedGraphics
    } as LessonPlanFormData);

    const fileCount = newConfig.attachedFiles?.length || 0;
    const fileDesc = fileCount > 0 ? ` cùng ${fileCount} tệp đính kèm` : '';
    onShowToast(`Đã lưu mẫu cấu hình "${trimmedName}" (gồm Nội dung cốt lõi, Tích hợp khác${fileDesc}) thành công!`);
    setActiveTab('preset_list');
    setAppliedPresetId(newConfig.id);
  };

  const handleApply = async (preset: SavedLessonPlanConfig) => {
    const patch: Partial<LessonPlanFormData> = {
      ...preset.settings,
      coreContent: preset.coreContent !== undefined ? preset.coreContent : currentFormData.coreContent,
      customIntegration: preset.customIntegration !== undefined ? preset.customIntegration : currentFormData.customIntegration,
      attachedFiles: preset.attachedFiles !== undefined ? [...preset.attachedFiles] : currentFormData.attachedFiles,
      extractedGraphics: preset.extractedGraphics !== undefined ? [...preset.extractedGraphics] : currentFormData.extractedGraphics,
      ...(preset.lessonTitle ? { lessonTitle: preset.lessonTitle } : {})
    };

    onApplyConfig(patch, preset.name);
    setAppliedPresetId(preset.id);

    // Save as current default config
    await saveActiveLessonPlanConfig({
      ...currentFormData,
      ...patch
    } as LessonPlanFormData);

    const fileCount = preset.attachedFiles?.length || 0;
    const fileMsg = fileCount > 0 ? ` (kèm ${fileCount} tệp đính kèm & nội dung)` : '';
    onShowToast(`Đã áp dụng cấu hình "${preset.name}"${fileMsg}!`);
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    setPresets(updated);
    await savePresetsStorage(updated);

    const def = updated.find(p => p.id === id);
    if (def) {
      localStorage.setItem(STORAGE_KEY_SAVED_CONFIG, JSON.stringify(def.settings));
      onShowToast(`Đã đặt "${def.name}" làm cấu hình mặc định khi mở ứng dụng!`);
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await deletePresetStorage(id);
      setPresets(updated);
      if (appliedPresetId === id) {
        setAppliedPresetId(null);
      }
      onShowToast(`Đã xóa mẫu cấu hình "${name}" thành công!`);
    } catch (err) {
      console.error(err);
      onShowToast(`Lỗi khi xóa mẫu "${name}".`);
    }
  };

  const handleClearActiveSaved = async () => {
    try {
      await clearActiveLessonPlanConfig();
      setAppliedPresetId(null);
      onShowToast('Đã xóa sạch cấu hình đang lưu trong bộ nhớ!');
    } catch (err) {
      console.error(err);
      onShowToast('Lỗi khi xóa cấu hình.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-5 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight uppercase">
                  Quản Lý Cấu Hình Bài Soạn
                </h3>
                <p className="text-orange-100 text-xs font-medium">
                  Lưu, nạp và chuyển đổi linh hoạt các mẫu cấu hình soạn giảng
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-orange-100 bg-orange-50/50 p-1.5 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('preset_list')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'preset_list'
                  ? 'bg-white text-orange-900 shadow-sm border border-orange-200/80 font-black'
                  : 'text-slate-600 hover:text-orange-950 hover:bg-orange-100/50'
              }`}
            >
              <Bookmark className="w-4 h-4 mr-1.5 text-orange-600" />
              <span>Danh sách mẫu đã lưu ({presets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('save_new')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'save_new'
                  ? 'bg-white text-orange-900 shadow-sm border border-orange-200/80 font-black'
                  : 'text-slate-600 hover:text-orange-950 hover:bg-orange-100/50'
              }`}
            >
              <Plus className="w-4 h-4 mr-1.5 text-orange-600" />
              <span>Lưu cấu hình hiện tại thành mẫu mới</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'save_new' ? (
              <form onSubmit={handleSaveNewPreset} className="space-y-4">
                <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Thông tin cấu hình hiện tại sẽ lưu:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-700">
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Môn: <strong className="text-orange-800">{currentFormData.subject}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Lớp: <strong className="text-orange-800">{currentFormData.grade}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Sách: <strong className="text-orange-800">{currentFormData.textbook}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Số tiết: <strong className="text-orange-800">{currentFormData.duration}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Bố cục: <strong className="text-orange-800">{currentFormData.layoutColumns === '2' ? '2 Cột' : '1 Cột'}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-100">
                      Mẫu: <strong className="text-orange-800">{currentFormData.templateType === '2345' ? 'CV 2345' : currentFormData.templateType === '5512' ? 'CV 5512' : 'Tự động'}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentFormData.includeDigitalCompetence && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                        ✓ Năng lực số TT02
                      </span>
                    )}
                    {currentFormData.includeAI2422 && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                        ✓ Trí tuệ nhân tạo QĐ2422
                      </span>
                    )}
                    {currentFormData.includeGDQP && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                        ✓ GDQP&AN TT08
                      </span>
                    )}
                    {currentFormData.includeSTEM && (
                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold">
                        ✓ Bài học STEM
                      </span>
                    )}
                    {currentFormData.includeInfographic && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                        ✓ Infographic/Mindmap
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="presetName" className="block text-xs font-black text-amber-950 uppercase">
                    Tên mẫu cấu hình <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="presetName"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="VD: Toán 6 - 2 Cột CV 5512"
                    required
                    className="w-full px-3.5 py-2.5 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 text-sm font-semibold text-slate-800 bg-white"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={isDefaultCheckbox}
                      onChange={(e) => setIsDefaultCheckbox(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 accent-orange-600"
                    />
                    <span>Đặt mẫu này làm <strong>Cấu hình mặc định</strong> khi mở ứng dụng</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={includeContentInPreset}
                      onChange={(e) => setIncludeContentInPreset(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 accent-orange-600"
                    />
                    <span>Lưu kèm cả Tên bài soạn & Nội dung cốt lõi hiện tại vào mẫu</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preset_list')}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-md transition active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu mẫu cấu hình</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
                  <span>Nhấp vào mẫu để nạp cấu hình ngay vào biểu mẫu:</span>
                  <span className="text-[11px] text-orange-700 font-bold">
                    ⭐ = Cấu hình mặc định
                  </span>
                </div>

                {presets.length === 0 ? (
                  <div className="text-center py-8 bg-orange-50/30 border border-dashed border-orange-200 rounded-xl">
                    <Bookmark className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">Chưa có mẫu cấu hình nào được lưu.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('save_new')}
                      className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                    >
                      + Lưu cấu hình hiện tại ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {presets.map((preset) => {
                      const isApplied = appliedPresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleApply(preset)}
                          className={`group relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isApplied
                              ? 'bg-amber-50/80 border-orange-500 shadow-md ring-2 ring-orange-200/80'
                              : 'bg-white hover:bg-orange-50/40 border-orange-200/90 hover:border-orange-400 shadow-2xs'
                          }`}
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black text-amber-950 group-hover:text-orange-600 transition">
                                {preset.name}
                              </h4>
                              {preset.isDefault && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md shadow-2xs">
                                  <Star className="w-3 h-3 fill-amber-950" />
                                  <span>Mặc định</span>
                                </span>
                              )}
                              {isApplied && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md shadow-2xs">
                                  <Check className="w-3 h-3" />
                                  <span>Đang áp dụng</span>
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 text-[10px] text-slate-600 font-medium">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {preset.settings.subject} - Lớp {preset.settings.grade}
                              </span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {preset.settings.layoutColumns === '2' ? 'Bố cục 2 Cột' : '1 Cột'}
                              </span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {preset.settings.templateType === '2345' ? 'CV 2345' : preset.settings.templateType === '5512' ? 'CV 5512' : 'Tự động'}
                              </span>
                              {preset.settings.includeSTEM && (
                                <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold">
                                  STEM
                                </span>
                              )}
                              {preset.settings.includeDigitalCompetence && (
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                                  NLS TT02
                                </span>
                              )}
                              {preset.settings.includeAI2422 && (
                                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                                  AI QĐ2422
                                </span>
                              )}
                              {preset.attachedFiles && preset.attachedFiles.length > 0 && (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                                  📎 {preset.attachedFiles.length} tệp đính kèm
                                </span>
                              )}
                              {Boolean(preset.coreContent?.trim()) && (
                                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                                  📝 Có nội dung cốt lõi
                                </span>
                              )}
                              {Boolean(preset.customIntegration?.trim()) && (
                                <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md font-bold">
                                  🧩 Có tích hợp khác
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick action buttons on preset card */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleApply(preset)}
                              title="Áp dụng cấu hình này vào bài soạn"
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Áp dụng</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleSetDefault(preset.id, e)}
                              title={preset.isDefault ? 'Đã là cấu hình mặc định' : 'Đặt làm cấu hình mặc định'}
                              className={`p-1.5 rounded-lg border transition ${
                                preset.isDefault
                                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                                  : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-400 hover:text-amber-600'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${preset.isDefault ? 'fill-amber-500 text-amber-600' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(preset.id, preset.name, e)}
                              title="Xóa mẫu này"
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-medium">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Cấu hình lưu an toàn trên trình duyệt</span>
              </div>
              <button
                type="button"
                onClick={handleClearActiveSaved}
                title="Xóa cấu hình đang lưu trong bộ nhớ để bắt đầu lại từ đầu"
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa cấu hình đang lưu</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
