import { LessonPlanFormData, AttachedFile, ExtractedGraphicItem } from '../types';
import { SavedLessonPlanConfig, DEFAULT_PRESETS } from '../components/ConfigManagerModal';

const DB_NAME = 'KHBD_STORAGE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'configurations';

export const ACTIVE_CONFIG_KEY = 'khbd_active_saved_config';
export const PRESETS_KEY = 'khbd_saved_presets';
export const LOCAL_STORAGE_FALLBACK_KEY = 'khbd_saved_config';
export const LOCAL_STORAGE_PRESETS_KEY = 'khbd_config_presets';

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const idbGet = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB get error, falling back:', err);
    return null;
  }
};

const idbSet = async (key: string, value: any): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB set error:', err);
  }
};

const idbDelete = async (key: string): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }
};

/**
 * Trích xuất toàn bộ cấu hình bài soạn bao gồm:
 * - Các tham số định dạng, môn, lớp, sách, số tiết, ngôn ngữ, bố cục, các mục tích hợp
 * - Tệp đính kèm (attachedFiles)
 * - Đối tượng đồ họa trích xuất (extractedGraphics)
 * - Nội dung cốt lõi (coreContent)
 * - Tích hợp nội dung khác (customIntegration)
 */
export const extractFullConfigData = (formData: LessonPlanFormData): Partial<LessonPlanFormData> => {
  return {
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
    
    // Các tùy chọn tích hợp
    includeDigitalCompetence: Boolean(formData.includeDigitalCompetence),
    includeAI2422: Boolean(formData.includeAI2422),
    includeAI3439: Boolean(formData.includeAI3439),
    includeGDQP: Boolean(formData.includeGDQP),
    includeHSKT: Boolean(formData.includeHSKT),
    includeSTEM: Boolean(formData.includeSTEM),
    includeReinforcementQuestions: Boolean(formData.includeReinforcementQuestions),
    includeTeachingMethods: Boolean(formData.includeTeachingMethods),
    includeGames: Boolean(formData.includeGames),
    includeTimeline: Boolean(formData.includeTimeline),
    includeInfographic: Boolean(formData.includeInfographic),

    // Các phần nội dung người dùng yêu cầu tái sử dụng
    lessonTitle: formData.lessonTitle || '',
    coreContent: formData.coreContent || '',
    customIntegration: formData.customIntegration || '',
    attachedFiles: formData.attachedFiles ? [...formData.attachedFiles] : [],
    extractedGraphics: formData.extractedGraphics ? [...formData.extractedGraphics] : []
  };
};

/**
 * Lưu đầy đủ cấu hình bài soạn vào IndexedDB (hỗ trợ tệp dung lượng lớn)
 * đồng thời đồng bộ vào localStorage bản rút gọn nếu có thể.
 */
export const saveActiveLessonPlanConfig = async (formData: LessonPlanFormData): Promise<void> => {
  const fullConfig = extractFullConfigData(formData);

  // 1. Lưu vào IndexedDB (không bị giới hạn 5MB của localStorage)
  await idbSet(ACTIVE_CONFIG_KEY, fullConfig);

  // 2. Thử lưu vào localStorage (nếu dữ liệu tệp nhỏ thì lưu đầy đủ, nếu quá lớn thì lưu không kèm base64 nặng)
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(fullConfig));
  } catch (quotaError) {
    console.warn('LocalStorage quota exceeded for full files, storing text-only copy in localStorage:', quotaError);
    try {
      const lightweightConfig = {
        ...fullConfig,
        attachedFiles: (fullConfig.attachedFiles || []).map((f: AttachedFile) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          mimeType: f.mimeType,
          extractedText: f.extractedText
        }))
      };
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(lightweightConfig));
    } catch (_) {
      // IndexedDB đã lưu an toàn
    }
  }
};

/**
 * Tải cấu hình bài soạn đã lưu gần nhất (ưu tiên IndexedDB để lấy đủ tệp và nội dung)
 */
export const loadActiveLessonPlanConfig = async (): Promise<Partial<LessonPlanFormData> | null> => {
  // 1. Thử lấy từ IndexedDB trước
  const idbConfig = await idbGet<Partial<LessonPlanFormData>>(ACTIVE_CONFIG_KEY);
  if (idbConfig && typeof idbConfig === 'object') {
    return idbConfig;
  }

  // 2. Fallback sang localStorage nếu IndexedDB chưa có
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse localStorage fallback config:', e);
  }

  return null;
};

/**
 * Xóa cấu hình đang lưu trong cả IndexedDB và localStorage (để khi tải lại không bị lặp lại cấu hình cũ)
 */
export const clearActiveLessonPlanConfig = async (): Promise<void> => {
  await idbDelete(ACTIVE_CONFIG_KEY);
  try {
    localStorage.removeItem(LOCAL_STORAGE_FALLBACK_KEY);
    localStorage.removeItem('khbd_last_saved_time');
  } catch (e) {
    console.warn('Error clearing active config from localStorage:', e);
  }
};

/**
 * Lưu danh sách mẫu cấu hình vào IndexedDB và localStorage đồng bộ
 */
export const savePresetsStorage = async (presets: SavedLessonPlanConfig[]): Promise<void> => {
  await idbSet(PRESETS_KEY, presets);
  try {
    localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
  } catch (err) {
    console.warn('Could not mirror presets to localStorage, safely saved in IndexedDB:', err);
  }
};

/**
 * Tải danh sách mẫu cấu hình từ IndexedDB hoặc localStorage
 */
export const loadPresetsStorage = async (): Promise<SavedLessonPlanConfig[]> => {
  // 1. Lấy từ IndexedDB
  const idbPresets = await idbGet<SavedLessonPlanConfig[]>(PRESETS_KEY);
  if (idbPresets && Array.isArray(idbPresets)) {
    return idbPresets;
  }

  // 2. Lấy từ localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRESETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse presets from localStorage:', e);
  }

  // Mặc định khởi tạo lần đầu
  return DEFAULT_PRESETS;
};

/**
 * Tự động tạo hoặc cập nhật một mẫu cấu hình vào "Mẫu đã lưu" (Saved Presets)
 * từ formData hiện tại, đồng thời lưu vào Active Config
 */
export const saveFormDataAsPreset = async (
  formData: LessonPlanFormData,
  customName?: string,
  isDefault = false
): Promise<{ newPreset: SavedLessonPlanConfig; allPresets: SavedLessonPlanConfig[] }> => {
  const currentPresets = await loadPresetsStorage();

  // Xác định tên mẫu
  let presetName = (customName || '').trim();
  if (!presetName) {
    if (formData.lessonTitle && formData.lessonTitle.trim()) {
      presetName = formData.lessonTitle.trim();
    } else {
      const cols = formData.layoutColumns === '2' ? '2 Cột' : '1 Cột';
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      presetName = `${formData.subject || 'Bài soạn'} Lớp ${formData.grade || '6'} - ${cols} (${timeStr})`;
    }
  }

  const newPreset: SavedLessonPlanConfig = {
    id: `preset-${Date.now()}`,
    name: presetName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault,
    saveContent: true,
    lessonTitle: formData.lessonTitle || '',
    coreContent: formData.coreContent || '',
    customIntegration: formData.customIntegration || '',
    attachedFiles: formData.attachedFiles ? [...formData.attachedFiles] : [],
    extractedGraphics: formData.extractedGraphics ? [...formData.extractedGraphics] : [],
    settings: {
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
    }
  };

  // Kiểm tra xem đã có mẫu trùng tên chưa: Nếu có thì cập nhật, nếu chưa thì thêm mới vào đầu danh sách
  const existingIndex = currentPresets.findIndex(p => p.name.trim().toLowerCase() === presetName.toLowerCase());
  let updatedPresets: SavedLessonPlanConfig[];
  
  if (existingIndex >= 0) {
    updatedPresets = [...currentPresets];
    updatedPresets[existingIndex] = {
      ...newPreset,
      id: currentPresets[existingIndex].id, // giữ nguyên ID cũ
      createdAt: currentPresets[existingIndex].createdAt,
      updatedAt: new Date().toISOString()
    };
  } else {
    updatedPresets = [newPreset, ...currentPresets];
  }

  // Nếu đặt làm mặc định
  if (isDefault) {
    updatedPresets = updatedPresets.map(p => ({
      ...p,
      isDefault: p.id === newPreset.id
    }));
  }

  // Lưu đồng thời vào danh sách mẫu và cấu hình đang kích hoạt
  await savePresetsStorage(updatedPresets);
  await saveActiveLessonPlanConfig(formData);

  return { newPreset, allPresets: updatedPresets };
};

/**
 * Xóa một mẫu cấu hình khỏi cả IndexedDB và localStorage theo ID
 */
export const deletePresetStorage = async (presetId: string): Promise<SavedLessonPlanConfig[]> => {
  const currentPresets = await loadPresetsStorage();
  const updated = currentPresets.filter(p => p.id !== presetId);
  await savePresetsStorage(updated);
  return updated;
};
