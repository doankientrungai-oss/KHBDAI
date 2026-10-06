import React, { useState, useRef, useMemo } from 'react';
import { ExtractedGraphicItem } from '../types';
import { ImageEditorModal } from './ImageEditorModal';
import { extractGraphicsFromAttachedFile, extractGraphicFromImageFile, getGoogleImageSearchUrl } from '../utils/graphicUtils';
import { 
  Sparkles, 
  Search, 
  Upload, 
  Crop, 
  Trash2, 
  Copy, 
  PlusCircle, 
  CheckCircle2, 
  ExternalLink, 
  Image as ImageIcon, 
  Layers, 
  HelpCircle,
  FileCode,
  Globe,
  Sliders,
  Loader2,
  X,
  Pin,
  PinOff
} from 'lucide-react';

interface ExtractedGraphicPanelProps {
  graphics: ExtractedGraphicItem[];
  onUpdateGraphics: (graphics: ExtractedGraphicItem[]) => void;
  onInsertToCursor: (graphic: ExtractedGraphicItem) => void;
  lessonTitle: string;
  subject: string;
  grade: string;
  isEditorActive?: boolean;
  userApiKey?: string;
  onClose?: () => void;
  sidebarMode?: 'drawer' | 'pinned';
  onToggleSidebarMode?: () => void;
}

export const ExtractedGraphicPanel: React.FC<ExtractedGraphicPanelProps> = ({
  graphics,
  onUpdateGraphics,
  onInsertToCursor,
  lessonTitle,
  subject,
  grade,
  isEditorActive = false,
  userApiKey,
  onClose,
  sidebarMode = 'drawer',
  onToggleSidebarMode
}) => {
  const [editingGraphic, setEditingGraphic] = useState<ExtractedGraphicItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'suggestions'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Ensure unique graphics list by id
  const uniqueGraphics = useMemo(() => {
    const seen = new Set<string>();
    return (graphics || []).filter(g => {
      if (!g || !g.id || seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });
  }, [graphics]);

  const handleUploadAdditional = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: ExtractedGraphicItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const extracted = await extractGraphicsFromAttachedFile(file, userApiKey);
        if (extracted && extracted.length > 0) {
          extracted.forEach(item => {
            item.origin = 'user_upload';
          });
          newItems.push(...extracted);
        }
      } catch (err) {
        console.warn('Lỗi khi bóc tách tệp tải lên bổ sung:', file.name, err);
        // Fallback for single image file
        if (file.type.startsWith('image/')) {
          try {
            const item = await extractGraphicFromImageFile(file);
            item.origin = 'user_upload';
            item.title = `Hình ${uniqueGraphics.length + newItems.length + 1}: ${file.name.replace(/\.[^/.]+$/, "")}`;
            newItems.push(item);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    if (newItems.length > 0) {
      const combined = [...uniqueGraphics];
      for (const item of newItems) {
        if (!combined.some(c => c.id === item.id)) {
          combined.push(item);
        }
      }
      onUpdateGraphics(combined);
    }
    setIsUploading(false);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleDeleteGraphic = (id: string) => {
    onUpdateGraphics(graphics.filter(g => g.id !== id));
  };

  const handleSaveEditedGraphic = (updated: ExtractedGraphicItem) => {
    onUpdateGraphics(graphics.map(g => g.id === updated.id ? updated : g));
  };

  const handleCopyImage = async (item: ExtractedGraphicItem) => {
    try {
      const response = await fetch(item.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Cannot write blob to clipboard, copying text markdown tag instead:', err);
      navigator.clipboard.writeText(`![${item.title}](${item.id})`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Smart suggestions for Google searches tailored to the subject and topic
  const searchKeywords = [
    `sơ đồ minh họa ${subject} ${grade} ${lessonTitle}`,
    `bản đồ khái niệm ${lessonTitle} ${subject}`,
    `hình ảnh thực hành ${lessonTitle}`,
    `phiếu học tập đồ họa ${lessonTitle}`
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/90 border-l border-amber-200 overflow-hidden text-xs">
      
      {/* Header Panel */}
      <div className="p-3 bg-gradient-to-r from-orange-100/90 to-amber-100/90 border-b border-amber-200 shrink-0 flex items-center justify-between gap-1.5">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-1.5 bg-orange-600 text-white rounded-lg shadow-xs shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-amber-950 uppercase tracking-tight text-[11px] sm:text-[12px] flex items-center gap-1.5 truncate">
              <span>ĐỐI TƯỢNG ĐỒ HỌA</span>
              <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0">
                {uniqueGraphics.length}
              </span>
            </h3>
            <p className="text-[9.5px] text-slate-600 font-medium truncate">
              Bóc tách từ tệp Word, PDF & Ảnh
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Upload new image button */}
          <input
            type="file"
            ref={uploadInputRef}
            onChange={handleUploadAdditional}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="p-1.5 bg-white hover:bg-orange-50 text-orange-700 font-bold rounded-lg border border-orange-300 shadow-2xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer text-[10px]"
            title="Tải thêm ảnh từ máy tính"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Thêm</span>
          </button>

          {/* Toggle Sidebar Mode (Pinned vs Floating Drawer) */}
          {onToggleSidebarMode && (
            <button
              type="button"
              onClick={onToggleSidebarMode}
              className={`p-1.5 rounded-lg border shadow-2xs flex items-center transition-all cursor-pointer text-[10px] ${
                sidebarMode === 'pinned'
                  ? 'bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-white hover:bg-orange-50 text-slate-600 border-slate-300'
              }`}
              title={sidebarMode === 'pinned' ? "Chuyển sang dạng Ngăn kéo nổi (Overlay)" : "Ghim cố định bên cạnh bài soạn"}
            >
              {sidebarMode === 'pinned' ? (
                <Pin className="w-3.5 h-3.5 text-orange-700 fill-orange-700" />
              ) : (
                <PinOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          )}

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Đóng khung đồ họa (Dành 100% không gian cho bài soạn)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-amber-100/50 border-b border-amber-200 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1 px-2 rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-orange-950 shadow-2xs border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3 h-3 text-orange-600" />
          <span>Kho ảnh ({uniqueGraphics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-1 px-2 rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-white text-orange-950 shadow-2xs border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3 h-3 text-sky-600" />
          <span>Gợi ý Google & AI</span>
        </button>
      </div>

      {/* Main Body List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === 'all' ? (
          uniqueGraphics.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {uniqueGraphics.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Thumbnail preview */}
                    <div className="relative h-28 bg-slate-100 border-b border-slate-100 flex items-center justify-center p-1.5 overflow-hidden">
                      <img
                        src={item.dataUrl}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain rounded-md select-none group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Origin tag */}
                      <span className={`absolute top-1.5 left-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ${
                        item.origin === 'attachment_docx' ? 'bg-indigo-600 text-white' :
                        item.origin === 'attachment_image' ? 'bg-sky-600 text-white' :
                        item.origin === 'user_upload' ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'
                      }`}>
                        {item.origin === 'attachment_docx' ? 'Word docx' :
                         item.origin === 'attachment_image' ? 'Ảnh đính kèm' :
                         item.origin === 'user_upload' ? 'Ảnh tải lên' : 'AI gợi ý'}
                      </span>

                      {item.isCleanedBackground && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Đã lọc nền
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-[11px] line-clamp-1" title={item.title}>
                          {item.title}
                        </h4>
                        {item.caption && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5" title={item.caption}>
                            {item.caption}
                          </p>
                        )}
                      </div>

                      {/* Action buttons on card */}
                      <div className="space-y-1.5 pt-1">
                        {/* Primary Insert Button */}
                        <button
                          type="button"
                          onClick={() => onInsertToCursor(item)}
                          className="w-full py-1.5 px-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title={isEditorActive ? "Chèn ảnh vào đúng vị trí con trỏ chuột trong trình soạn thảo" : "Chèn ảnh vào cuối bài dạy"}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{isEditorActive ? 'Chèn vào con trỏ' : 'Chèn vào bài'}</span>
                        </button>

                        {/* Secondary utility buttons */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setEditingGraphic(item)}
                            className="flex-1 py-1 px-1.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-slate-700 font-semibold rounded-md border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="Làm sạch nền và cắt hình"
                          >
                            <Sliders className="w-3 h-3 text-orange-600" />
                            <span>Lọc nền / Cắt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyImage(item)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="Sao chép ảnh"
                          >
                            {copiedId === item.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGraphic(item.id)}
                            className="p-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="Xóa đối tượng đồ họa này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-white border border-dashed border-orange-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[12px]">Chưa có đối tượng đồ họa nào</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Đính kèm tệp Word (.docx) hoặc Ảnh ở khung bên trái khi tạo bài dạy, hoặc bấm &quot;Thêm ảnh&quot; ở trên để bóc tách ngay.
                </p>
              </div>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] rounded-xl shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh từ máy tính</span>
              </button>
            </div>
          )
        ) : (
          /* Tab: Suggestions from Google & AI */
          <div className="space-y-4">
            
            {/* Google Image Search Box */}
            <div className="bg-white border border-sky-200 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-sky-900 font-black text-xs uppercase">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Tìm kiếm hình ảnh trên Google</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Khám phá kho ảnh, sơ đồ, bản đồ và biểu đồ minh họa thực tế cho bài học <strong>&quot;{lessonTitle || 'Bài giảng'}&quot;</strong> trên Google:
              </p>

              <div className="space-y-1.5">
                {searchKeywords.map((kw, i) => (
                  <a
                    key={i}
                    href={getGoogleImageSearchUrl(lessonTitle, subject, grade, kw)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/80 text-sky-950 font-semibold text-[11px] transition-colors group cursor-pointer"
                  >
                    <span className="truncate pr-2">{kw}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Guide on inserting and syncing */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-[11px] text-amber-950 font-medium">
              <h4 className="font-bold flex items-center gap-1.5 text-orange-900 uppercase text-[10px]">
                <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>Hướng dẫn chèn & Xuất Word</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[10px] leading-relaxed">
                <li>Bấm <strong>&quot;Chèn vào bài&quot;</strong> để chèn ngay hình ảnh vào vị trí con trỏ chuột.</li>
                <li>Dùng công cụ <strong>&quot;Lọc nền / Cắt&quot;</strong> để biến nền xám/ố vàng thành nền trắng tinh khôi chuẩn in ấn.</li>
                <li>Khi xuất file <strong>Word (.docx)</strong>, tất cả các hình ảnh đã chèn sẽ tự động được nhúng sắc nét vào đúng vị trí bài dạy kèm chú thích chuẩn mực.</li>
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      {editingGraphic && (
        <ImageEditorModal
          isOpen={Boolean(editingGraphic)}
          onClose={() => setEditingGraphic(null)}
          graphic={editingGraphic}
          onSave={handleSaveEditedGraphic}
          userApiKey={userApiKey}
        />
      )}

    </div>
  );
};
