import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExtractedGraphicItem } from '../types';
import { 
  cleanImageBackground, 
  cropImageByBounds, 
  getImageDimensions,
  detectIllustrationsWithGemini,
  detectIllustrationsByLocalSegmentation 
} from '../utils/graphicUtils';
import { 
  X, 
  Crop, 
  Sparkles, 
  Check, 
  Download, 
  RefreshCw, 
  Type, 
  Maximize2, 
  RotateCcw,
  Sliders,
  ScanEye,
  Info
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphic: ExtractedGraphicItem | null;
  onSave: (updatedGraphic: ExtractedGraphicItem) => void;
  userApiKey?: string;
}

type AspectRatioOption = 'free' | '1:1' | '4:3' | '16:9' | '3:2';
type DragHandle = 'create' | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  graphic,
  onSave,
  userApiKey
}) => {
  if (!isOpen || !graphic) return null;

  const [title, setTitle] = useState(graphic.title);
  const [caption, setCaption] = useState(graphic.caption || '');
  const [currentDataUrl, setCurrentDataUrl] = useState(graphic.dataUrl);
  const [cleanMode, setCleanMode] = useState<'none' | 'white' | 'transparent' | 'high_contrast'>(graphic.cleanMode || 'none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCropping, setIsCropping] = useState(false);

  // Aspect ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');

  // Crop coordinates in percentage of container (0 to 100)
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [realImgSize, setRealImgSize] = useState({ width: 600, height: 400 });

  // Mouse interaction refs
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeHandleRef = useRef<DragHandle>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initCrop: typeof cropRect }>({
    startX: 0,
    startY: 0,
    initCrop: { x: 10, y: 10, w: 80, h: 80 }
  });

  useEffect(() => {
    setTitle(graphic.title);
    setCaption(graphic.caption || '');
    setCurrentDataUrl(graphic.dataUrl);
    setCleanMode(graphic.cleanMode || 'none');
    setIsCropping(false);
    setCropRect({ x: 10, y: 10, w: 80, h: 80 });

    getImageDimensions(graphic.dataUrl).then(dims => {
      setRealImgSize({ width: dims.width, height: dims.height });
    });
  }, [graphic]);

  // Clean background handler
  const handleApplyClean = async (mode: 'white' | 'transparent' | 'high_contrast' | 'original') => {
    setIsProcessing(true);
    setStatusMessage('Đang xử lý tối ưu hình ảnh...');
    try {
      if (mode === 'original') {
        setCurrentDataUrl(graphic.dataUrl);
        setCleanMode('none');
      } else {
        const cleaned = await cleanImageBackground(graphic.dataUrl, mode);
        setCurrentDataUrl(cleaned);
        setCleanMode(mode);
      }
    } catch (err) {
      console.error('Lỗi xử lý làm sạch nền:', err);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // AI Auto-detect Subject / Diagram Region
  const handleAiAutoDetectBox = async () => {
    setIsProcessing(true);
    setStatusMessage('AI đang phân tích và tìm vùng hình ảnh/sơ đồ...');
    try {
      let boxes = await detectIllustrationsWithGemini(currentDataUrl, userApiKey);
      if (!boxes || boxes.length === 0) {
        if (imgRef.current) {
          boxes = detectIllustrationsByLocalSegmentation(imgRef.current);
        }
      }

      if (boxes && boxes.length > 0) {
        const [ymin, xmin, ymax, xmax] = boxes[0].box_2d;
        const newX = Math.max(0, xmin / 10);
        const newY = Math.max(0, ymin / 10);
        const newW = Math.min(100 - newX, (xmax - xmin) / 10);
        const newH = Math.min(100 - newY, (ymax - ymin) / 10);

        setCropRect({
          x: Math.round(newX),
          y: Math.round(newY),
          w: Math.round(newW),
          h: Math.round(newH),
        });
        setIsCropping(true);

        if (boxes[0].title && (!title || title.startsWith('Hình'))) {
          setTitle(boxes[0].title);
        }
      } else {
        // Center 80%
        setCropRect({ x: 10, y: 10, w: 80, h: 80 });
        setIsCropping(true);
      }
    } catch (e) {
      console.error('Lỗi AI nhận diện:', e);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent, handle: DragHandle) => {
    if (!isCropping || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    activeHandleRef.current = handle;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initCrop: { ...cropRect }
    };

    if (handle === 'create') {
      const clickX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const clickY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setCropRect({ x: clickX, y: clickY, w: 2, h: 2 });
      dragStartRef.current.initCrop = { x: clickX, y: clickY, w: 2, h: 2 };
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!activeHandleRef.current || !containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - dragStartRef.current.startX) / cRect.width) * 100;
      const deltaY = ((moveEvent.clientY - dragStartRef.current.startY) / cRect.height) * 100;
      const init = dragStartRef.current.initCrop;

      let next = { ...cropRect };

      if (activeHandleRef.current === 'create') {
        const currX = Math.max(0, Math.min(100, ((moveEvent.clientX - cRect.left) / cRect.width) * 100));
        const currY = Math.max(0, Math.min(100, ((moveEvent.clientY - cRect.top) / cRect.height) * 100));
        const minX = Math.min(init.x, currX);
        const minY = Math.min(init.y, currY);
        const w = Math.abs(currX - init.x);
        const h = Math.abs(currY - init.y);
        next = { x: minX, y: minY, w: Math.max(4, w), h: Math.max(4, h) };
      } else if (activeHandleRef.current === 'move') {
        let newX = Math.max(0, Math.min(100 - init.w, init.x + deltaX));
        let newY = Math.max(0, Math.min(100 - init.h, init.y + deltaY));
        next = { ...init, x: newX, y: newY };
      } else {
        // Handles resizing
        let left = init.x;
        let top = init.y;
        let right = init.x + init.w;
        let bottom = init.y + init.h;

        const h = activeHandleRef.current;
        if (h === 'nw' || h === 'w' || h === 'sw') left = Math.min(right - 5, Math.max(0, init.x + deltaX));
        if (h === 'ne' || h === 'e' || h === 'se') right = Math.max(left + 5, Math.min(100, init.x + init.w + deltaX));
        if (h === 'nw' || h === 'n' || h === 'ne') top = Math.min(bottom - 5, Math.max(0, init.y + deltaY));
        if (h === 'sw' || h === 's' || h === 'se') bottom = Math.max(top + 5, Math.min(100, init.y + init.h + deltaY));

        next = {
          x: left,
          y: top,
          w: right - left,
          h: bottom - top,
        };
      }

      // Constrain aspect ratio if set
      if (aspectRatio !== 'free') {
        let ratioVal = 1;
        if (aspectRatio === '1:1') ratioVal = 1;
        if (aspectRatio === '4:3') ratioVal = 4 / 3;
        if (aspectRatio === '16:9') ratioVal = 16 / 9;
        if (aspectRatio === '3:2') ratioVal = 3 / 2;

        // Convert percentage ratio to pixel ratio
        const imgAspect = (realImgSize.width || 600) / (realImgSize.height || 400);
        const requiredH = (next.w * imgAspect) / ratioVal;
        if (next.y + requiredH <= 100) {
          next.h = requiredH;
        } else {
          next.w = (next.h * ratioVal) / imgAspect;
        }
      }

      setCropRect(next);
    };

    const handleMouseUp = () => {
      activeHandleRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Apply Crop
  const handleApplyCrop = async () => {
    setIsProcessing(true);
    setStatusMessage('Đang thực hiện cắt ảnh...');
    try {
      const img = new Image();
      img.src = currentDataUrl;
      await new Promise((res) => { img.onload = res; });

      const realWidth = img.naturalWidth || img.width;
      const realHeight = img.naturalHeight || img.height;

      const cropArea = {
        x: Math.max(0, (cropRect.x / 100) * realWidth),
        y: Math.max(0, (cropRect.y / 100) * realHeight),
        width: Math.min(realWidth, (cropRect.w / 100) * realWidth),
        height: Math.min(realHeight, (cropRect.h / 100) * realHeight),
      };

      const croppedUrl = await cropImageByBounds(currentDataUrl, cropArea);
      setCurrentDataUrl(croppedUrl);
      const dims = await getImageDimensions(croppedUrl);
      setRealImgSize({ width: dims.width, height: dims.height });
      setIsCropping(false);
      setCropRect({ x: 10, y: 10, w: 80, h: 80 });
    } catch (err) {
      console.error('Lỗi cắt ảnh:', err);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleSave = async () => {
    const dims = await getImageDimensions(currentDataUrl);
    const updated: ExtractedGraphicItem = {
      ...graphic,
      title: title.trim() || graphic.title,
      caption: caption.trim(),
      dataUrl: currentDataUrl,
      width: dims.width,
      height: dims.height,
      aspectRatio: dims.aspectRatio,
      isCleanedBackground: cleanMode !== 'none',
      cleanMode: cleanMode,
    };
    onSave(updated);
    onClose();
  };

  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = currentDataUrl;
    a.download = `${title.replace(/\s+/g, '_') || 'hinh_minh_hoa'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Calculate live crop pixel size
  const liveCropPixels = {
    w: Math.round((cropRect.w / 100) * realImgSize.width),
    h: Math.round((cropRect.h / 100) * realImgSize.height)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                Chỉnh sửa, Cắt chọn & Làm sạch đối tượng đồ họa
              </h3>
              <p className="text-[11px] text-orange-100 font-medium">Nguồn tài liệu: {graphic.sourceFileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-orange-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 custom-scrollbar">
          
          {/* Left: Interactive Canvas / Preview Box */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-900/95 rounded-2xl p-3 border border-slate-800 relative select-none">
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-40 flex flex-col items-center justify-center space-y-2.5 rounded-2xl">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs font-bold text-white tracking-wide">{statusMessage || 'Đang xử lý hình ảnh...'}</span>
              </div>
            )}

            {/* Canvas Container */}
            <div 
              ref={containerRef}
              onMouseDown={(e) => handleMouseDown(e, 'create')}
              className={`relative max-h-[380px] max-w-full flex items-center justify-center rounded-lg overflow-hidden border border-slate-700 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] ${
                isCropping ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              <img
                ref={imgRef}
                src={currentDataUrl}
                alt={title}
                className="max-h-[360px] max-w-full object-contain pointer-events-none"
              />

              {/* Interactive Crop Overlay */}
              {isCropping && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Outer Dimmed Background via Clip or Shadows */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${cropRect.x}%`,
                      top: `${cropRect.y}%`,
                      width: `${cropRect.w}%`,
                      height: `${cropRect.h}%`,
                    }}
                    className="pointer-events-auto border-2 border-orange-400 bg-orange-500/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative transition-shadow"
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  >
                    {/* Center Drag Handle (Move) */}
                    <div className="absolute inset-0 cursor-move flex items-center justify-center">
                      <span className="bg-orange-600/90 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs pointer-events-none opacity-85">
                        Kéo di chuyển vùng
                      </span>
                    </div>

                    {/* Rule of Thirds Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-b border-white/30"></div>
                      <div className="border-r border-white/30"></div>
                      <div className="border-r border-white/30"></div>
                      <div></div>
                    </div>

                    {/* 8 Resize Handles */}
                    {/* Corners */}
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-xs cursor-nwse-resize shadow-xs z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-xs cursor-nesw-resize shadow-xs z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-xs cursor-nesw-resize shadow-xs z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'se')}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-xs cursor-nwse-resize shadow-xs z-10"
                    />

                    {/* Edges */}
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-orange-500 border border-white rounded-xs cursor-ns-resize z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-orange-500 border border-white rounded-xs cursor-ns-resize z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'w')}
                      className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-4 bg-orange-500 border border-white rounded-xs cursor-ew-resize z-10"
                    />
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, 'e')}
                      className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-4 bg-orange-500 border border-white rounded-xs cursor-ew-resize z-10"
                    />

                    {/* Dimension Tag */}
                    <div className="absolute -bottom-6 left-0 bg-slate-900 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {liveCropPixels.w} × {liveCropPixels.h} px
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Crop Controls Toolbar */}
            <div className="mt-3 w-full space-y-2">
              {isCropping ? (
                <div className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-300 font-bold mr-1">Tỷ lệ:</span>
                    {(['free', '1:1', '4:3', '16:9', '3:2'] as AspectRatioOption[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {ratio === 'free' ? 'Tự do' : ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Áp dụng cắt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCropping(false)}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCropping(true);
                      setCropRect({ x: 15, y: 15, w: 70, h: 70 });
                    }}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Crop className="w-3.5 h-3.5 text-orange-200" />
                    <span>Kéo chuột chọn vùng cắt (Crop)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAiAutoDetectBox}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <ScanEye className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Tự động nhận diện hình</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tải ảnh PNG</span>
                  </button>
                </div>
              )}

              {isCropping && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <Info className="w-3 h-3 text-orange-400 shrink-0" />
                  <span>Kéo chuột trên ảnh để vẽ vùng mới, hoặc kéo 8 góc chấm cam để thay đổi kích thước.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls & Metadata */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            
            {/* Background Cleaning Tools */}
            <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
              <h4 className="text-xs font-black uppercase text-orange-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Làm sạch nền & Tối ưu in ấn</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tự động khử nền xám, vết ố vàng từ trang sách scan để khi xuất file Word và in ấn hình ảnh sắc nét, thẩm mỹ nhất.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyClean('white')}
                  className={`p-2.5 rounded-xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                    cleanMode === 'white'
                      ? 'bg-white border-orange-600 text-orange-950 ring-2 ring-orange-200 shadow-sm'
                      : 'bg-white/70 border-slate-200 text-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span>
                    <span>Nền trắng sáng</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Khử nhiễu nền giấy scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyClean('transparent')}
                  className={`p-2.5 rounded-xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                    cleanMode === 'transparent'
                      ? 'bg-white border-orange-600 text-orange-950 ring-2 ring-orange-200 shadow-sm'
                      : 'bg-white/70 border-slate-200 text-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400"></span>
                    <span>Nền trong suốt</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Tách phông đồ họa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyClean('high_contrast')}
                  className={`p-2.5 rounded-xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                    cleanMode === 'high_contrast'
                      ? 'bg-white border-orange-600 text-orange-950 ring-2 ring-orange-200 shadow-sm'
                      : 'bg-white/70 border-slate-200 text-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-900"></span>
                    <span>Tương phản cao</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Sắc nét nét vẽ & chữ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyClean('original')}
                  className={`p-2.5 rounded-xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                    cleanMode === 'none'
                      ? 'bg-white border-orange-600 text-orange-950 ring-2 ring-orange-200 shadow-sm'
                      : 'bg-white/70 border-slate-200 text-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Ảnh gốc</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Khôi phục nguyên bản</span>
                </button>
              </div>
            </div>

            {/* Title & Caption */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-orange-600" />
                  <span>Tiêu đề hình ảnh (Hiển thị trong KHBD)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Hình 1: Sơ đồ chu trình nước..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Chú thích chi tiết (Caption)
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Mô tả nội dung hình ảnh, nguồn hoặc câu hỏi quan sát kèm theo..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lưu & Cập nhật vào bài soạn</span>
          </button>
        </div>

      </div>
    </div>
  );
};
