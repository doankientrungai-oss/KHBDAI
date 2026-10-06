import React, { useState, useEffect } from 'react';
import { Presentation, X, Download, Copy, Check, Sparkles, Image, BookOpen, HeartHandshake, Loader2, RefreshCw, Palette, FileText, ChevronDown } from 'lucide-react';
import { SlideItem, LessonPlanFormData, TeacherInfo } from '../types';
import { generateSlideOutline } from '../services/geminiService';
import * as docx from 'docx';
import saveAs from 'file-saver';
import { MathText } from './MathText';
import { parseMathTokens, formatMathForWord } from '../utils/mathUtils';
import { exportSlidesToPptx, PPTX_THEMES, PptxTheme } from '../utils/pptxExportUtils';

interface SlideSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  lessonTitle: string;
  formData?: LessonPlanFormData;
  teacherInfo?: TeacherInfo;
  userApiKey?: string;
  isTrial?: boolean;
  onOpenVipModal?: (reason: 'copy' | 'download' | 'limit_reached' | 'general') => void;
}

export const SlideSuggestionModal: React.FC<SlideSuggestionModalProps> = ({
  isOpen,
  onClose,
  plan,
  lessonTitle,
  formData,
  teacherInfo,
  userApiKey,
  isTrial = true,
  onOpenVipModal
}) => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedSlideIndex, setCopiedSlideIndex] = useState<number | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<boolean>(false);
  const [isExportingWord, setIsExportingWord] = useState<boolean>(false);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('orange');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);

  // Key tracking the lesson plan and lesson info that generated the current slides
  const lastGeneratedPlanKeyRef = React.useRef<string>('');

  // Compute a unique signature of the current lesson plan and metadata
  const currentPlanKey = React.useMemo(() => {
    if (!plan || !plan.trim()) return '';
    const safeTitle = lessonTitle || formData?.lessonTitle || '';
    const safeSubject = formData?.subject || '';
    const safeGrade = formData?.grade || '';
    const safeIncludeInfographic = formData?.includeInfographic ? 'info1' : 'info0';
    return `${safeTitle}::${safeSubject}::${safeGrade}::${safeIncludeInfographic}::${plan.trim()}`;
  }, [plan, lessonTitle, formData?.lessonTitle, formData?.subject, formData?.grade, formData?.includeInfographic]);

  // When plan changes (e.g. after clicking "BẮT ĐẦU TẠO BÀI DẠY" and getting a new plan result),
  // reset previous slides so stale slides are never shown.
  useEffect(() => {
    if (currentPlanKey && lastGeneratedPlanKeyRef.current && currentPlanKey !== lastGeneratedPlanKeyRef.current) {
      setSlides([]);
      setError(null);
    }
  }, [currentPlanKey]);

  // Auto-generate slides when modal is open and plan is new or slides are empty
  useEffect(() => {
    if (isOpen && plan && plan.trim() && !isLoading) {
      const isNewPlan = Boolean(currentPlanKey && currentPlanKey !== lastGeneratedPlanKeyRef.current);
      if (slides.length === 0 || isNewPlan) {
        loadSlideSuggestions();
      }
    }
  }, [isOpen, plan, currentPlanKey]);

  const loadSlideSuggestions = async () => {
    if (!plan || !plan.trim()) return;
    setIsLoading(true);
    setError(null);
    setSlides([]);
    try {
      const generatedSlides = await generateSlideOutline(plan, formData, teacherInfo, userApiKey);
      setSlides(generatedSlides);
      const safeTitle = lessonTitle || formData?.lessonTitle || '';
      const safeSubject = formData?.subject || '';
      const safeGrade = formData?.grade || '';
      const safeIncludeInfographic = formData?.includeInfographic ? 'info1' : 'info0';
      lastGeneratedPlanKeyRef.current = `${safeTitle}::${safeSubject}::${safeGrade}::${safeIncludeInfographic}::${plan.trim()}`;
    } catch (err: any) {
      console.error("Failed to load slide suggestions:", err);
      setError(err.message || "Không thể tạo gợi ý Slide bài giảng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = (promptText: string, index: number) => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPromptIndex(index);
      setTimeout(() => setCopiedPromptIndex(null), 2000);
    }).catch(err => console.error("Copy prompt failed:", err));
  };

  const handleCopySingleSlide = (slide: SlideItem, index: number) => {
    const points = slide.bulletPoints ? slide.bulletPoints.map(p => `  • ${p}`).join('\n') : '';
    const notes = slide.teacherNotes ? `\n  [Ghi chú: ${slide.teacherNotes}]` : '';
    const prompt = slide.aiImagePrompt ? `\n  [Prompt AI: ${slide.aiImagePrompt}]` : '';
    const text = `SLIDE ${slide.slideNumber}: ${slide.title}\n${slide.subtitle ? slide.subtitle + '\n' : ''}${points}${notes}${prompt}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSlideIndex(index);
      setTimeout(() => setCopiedSlideIndex(null), 2000);
    });
  };

  const handleCopyAllSlides = () => {
    if (isTrial && onOpenVipModal) {
      onOpenVipModal('copy');
      return;
    }

    const fullText = slides.map(s => {
      const points = s.bulletPoints ? s.bulletPoints.map(p => `  • ${p}`).join('\n') : '';
      const notes = s.teacherNotes ? `  [Ghi chú: ${s.teacherNotes}]` : '';
      const prompt = s.aiImagePrompt ? `  [Prompt AI Footer: ${s.aiImagePrompt}]` : '';
      return `--- SLIDE ${s.slideNumber}: ${s.title} ---\n${s.subtitle ? s.subtitle + '\n' : ''}${points}\n${notes}\n${prompt}`;
    }).join('\n\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setCopyAllStatus(true);
      setTimeout(() => setCopyAllStatus(false), 2000);
    });
  };

  /**
   * XUẤT FILE POWERPOINT (.PPTX) CHUẨN ĐỊNH DẠNG SƯ PHẠM
   */
  const handleExportPptx = async (themeKey: string = selectedTheme) => {
    if (isTrial && onOpenVipModal) {
      onOpenVipModal('download');
      return;
    }

    if (slides.length === 0) return;

    setIsExportingPptx(true);
    setIsThemeMenuOpen(false);
    try {
      await exportSlidesToPptx(
        slides,
        lessonTitle || formData?.lessonTitle || 'Kế hoạch bài dạy',
        formData,
        teacherInfo,
        themeKey,
        formData?.extractedGraphics || []
      );
    } catch (err: any) {
      console.error("Export PPTX error:", err);
      alert("Đã có lỗi xảy ra khi tạo file PowerPoint: " + (err?.message || "Vui lòng thử lại."));
    } finally {
      setIsExportingPptx(false);
    }
  };

  /**
   * XUẤT FILE WORD (.DOCX) DẠNG NGANG (LANDSCAPE)
   */
  const handleExportWordLandscape = async () => {
    if (isTrial && onOpenVipModal) {
      onOpenVipModal('download');
      return;
    }

    if (slides.length === 0) return;

    setIsExportingWord(true);
    try {
      const {
        Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, PageOrientation, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType
      } = docx;

      const docChildren: any[] = [];
      const FONT_FAMILY = "Times New Roman";

      slides.forEach((slide, index) => {
        if (index > 0) {
          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Tag Slide Header
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `SLIDE ${slide.slideNumber}: ${formatMathForWord(slide.title).toUpperCase()}`,
                bold: true,
                size: 32, // 16pt
                font: FONT_FAMILY,
                color: "1E3A8A" // Dark Blue
              })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 100, after: 120 }
          })
        );

        if (slide.subtitle) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: formatMathForWord(slide.subtitle),
                  italics: true,
                  bold: true,
                  size: 26, // 13pt
                  font: FONT_FAMILY,
                  color: "C2410C" // Orange
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { before: 0, after: 200 }
            })
          );
        }

        // Bullet Points Content
        if (slide.bulletPoints && slide.bulletPoints.length > 0) {
          slide.bulletPoints.forEach(point => {
            const cleanPoint = point.replace(/^[\s•\-\*]+/, '').trim();
            if (cleanPoint) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "•  ",
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                      color: "2563EB"
                    }),
                    new TextRun({
                      text: formatMathForWord(cleanPoint),
                      size: 26, // 13pt
                      font: FONT_FAMILY,
                      color: "1E293B"
                    })
                  ],
                  spacing: { before: 60, after: 100, line: 300 },
                  indent: { left: 360 }
                })
              );
            }
          });
        }

        // Teacher Notes
        if (slide.teacherNotes) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "💡 Ghi chú hoạt động giảng dạy: ",
                  bold: true,
                  italics: true,
                  size: 22, // 11pt
                  font: FONT_FAMILY,
                  color: "047857"
                }),
                new TextRun({
                  text: formatMathForWord(slide.teacherNotes),
                  italics: true,
                  size: 22,
                  font: FONT_FAMILY,
                  color: "065F46"
                })
              ],
              spacing: { before: 200, after: 200 }
            })
          );
        }

        // AI Image Prompt Box in Footer Section of Page
        if (slide.aiImagePrompt) {
          docChildren.push(
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "🖼️ GỢI Ý PROMPT AI TẠO ẢNH:",
                              bold: true,
                              size: 20, // 10pt
                              font: FONT_FAMILY,
                              color: "C2410C"
                            })
                          ],
                          spacing: { before: 40, after: 40 }
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: formatMathForWord(slide.aiImagePrompt),
                              italics: true,
                              size: 20, // 10pt
                              font: FONT_FAMILY,
                              color: "475569"
                            })
                          ],
                          spacing: { before: 40, after: 40 }
                        })
                      ],
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      shading: {
                        type: ShadingType.CLEAR,
                        fill: "FFF7ED" // Light Amber fill
                      }
                    })
                  ]
                })
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6, color: "FDBA74" },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: "FDBA74" },
                left: { style: BorderStyle.SINGLE, size: 6, color: "FDBA74" },
                right: { style: BorderStyle.SINGLE, size: 6, color: "FDBA74" }
              }
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: PageOrientation.LANDSCAPE,
                },
                margin: {
                  top: 1000,
                  bottom: 1000,
                  left: 1200,
                  right: 1200
                }
              }
            },
            children: docChildren
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const safeTitle = lessonTitle ? lessonTitle.replace(/[\\/:*?"<>|]/g, '').trim() : "Slide_Bai_Giang";
      saveAs(blob, `Goi_y_Slide_${safeTitle}.docx`);
    } catch (err) {
      console.error("Export slides Word error:", err);
    } finally {
      setIsExportingWord(false);
    }
  };

  if (!isOpen) return null;

  const currentThemeObj = PPTX_THEMES[selectedTheme] || PPTX_THEMES.orange;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-6 py-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <Presentation className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2">
                GỢI Ý NỘI DUNG BÀI GIẢNG & THIẾT KẾ SLIDE PPTX
              </h2>
              <p className="text-xs text-orange-100/90 font-medium flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Tự động tạo bài giảng PowerPoint (.pptx) chuẩn 16:9 sắc nét, chuyên nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        {!isLoading && slides.length > 0 && (
          <div className="bg-orange-50/80 border-b border-orange-200/60 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Tổng số Slide: <strong className="text-orange-600 text-sm font-black">{slides.length}</strong> slide</span>
            </div>

            <div className="flex items-center space-x-2.5 flex-wrap">
              {/* Regenerate Slides Button */}
              <button
                type="button"
                onClick={() => loadSlideSuggestions()}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-orange-50 text-orange-800 border border-orange-200 hover:border-orange-300 text-xs font-bold rounded-xl shadow-xs transition-all duration-200 disabled:opacity-50"
                title="Tạo lại gợi ý Slide theo kế hoạch bài dạy mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">TẠO LẠI SLIDE</span>
              </button>

              {/* Theme Picker Dropdown for PPTX */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-sm transition-all duration-200"
                  title="Chọn chủ đề màu sắc cho file PowerPoint"
                >
                  <Palette className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline">Màu Slide:</span>
                  <span className="font-extrabold text-orange-700">{currentThemeObj.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Chọn bảng màu PowerPoint
                    </div>
                    {Object.values(PPTX_THEMES).map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(th.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-orange-50/80 transition-colors ${
                          selectedTheme === th.id ? 'bg-orange-50 text-orange-700 font-black' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: `#${th.primaryColor}` }}
                          />
                          <span>{th.name}</span>
                        </div>
                        {selectedTheme === th.id && <Check className="w-4 h-4 text-orange-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy All */}
              <button
                type="button"
                onClick={handleCopyAllSlides}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all duration-200"
              >
                {copyAllStatus ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-white" />}
                <span className="hidden sm:inline">{copyAllStatus ? "ĐÃ SAO CHÉP" : "SAO CHÉP"}</span>
              </button>

              {/* Export Word */}
              <button
                type="button"
                onClick={handleExportWordLandscape}
                disabled={isExportingWord}
                className="flex items-center space-x-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
                title="Tải file Word dạng ngang"
              >
                {isExportingWord ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <FileText className="w-4 h-4 text-white" />}
                <span className="hidden md:inline">TẢI FILE WORD</span>
              </button>

              {/* PRIMARY PPTX DOWNLOAD BUTTON */}
              <button
                type="button"
                onClick={() => handleExportPptx(selectedTheme)}
                disabled={isExportingPptx}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-600/30 transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {isExportingPptx ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Presentation className="w-4 h-4 text-amber-200" />
                )}
                <span>TẢI FILE POWERPOINT (.PPTX)</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/60 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-orange-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  ĐANG PHÂN TÍCH KHBD & TỰ ĐỘNG THIẾT KẾ SLIDE POWERPOINT
                </h3>
                <p className="text-xs font-semibold text-slate-500 max-w-md">
                  Hệ thống đang chuẩn bị nội dung từng slide, bố cục trang bìa, các hoạt động bài giảng, ghi chú sư phạm và gợi ý hình ảnh minh họa...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <p className="text-sm font-semibold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200 max-w-lg">
                {error}
              </p>
              <button
                type="button"
                onClick={loadSlideSuggestions}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>THỬ LẠI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Banner Recommendation */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 rounded-2xl border border-orange-200/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-600 text-white rounded-xl shadow-sm">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-orange-950 uppercase tracking-tight">
                      Sẵn sàng tải file PowerPoint (.pptx) trình chiếu
                    </h4>
                    <p className="text-[11px] font-medium text-slate-600">
                      Slide PPTX tập trung nội dung trình chiếu trực quan, thoáng đẹp; phần Ghi chú hoạt động sư phạm được lưu trong mục Notes của PowerPoint và file Word.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportPptx(selectedTheme)}
                  disabled={isExportingPptx}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-1.5"
                >
                  {isExportingPptx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>TẢI PPTX NGAY</span>
                </button>
              </div>

              {slides.map((slide, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === slides.length - 1;

                return (
                  <div 
                    key={idx}
                    className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden ${
                      isFirst 
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50/30 to-white' 
                        : isLast 
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Slide Top Banner */}
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                          isFirst 
                            ? 'bg-blue-600 text-white' 
                            : isLast 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-orange-600 text-white'
                        }`}>
                          SLIDE {slide.slideNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {isFirst ? 'Trang đầu: Giới thiệu & Bìa bài giảng' : isLast ? 'Trang cuối: Lời Cảm ơn & Dặn dò' : 'Nội dung hoạt động bài giảng'}
                        </span>
                      </div>

                      {/* Quick copy single slide */}
                      <button
                        type="button"
                        onClick={() => handleCopySingleSlide(slide, idx)}
                        className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center space-x-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                        title="Sao chép nội dung slide này"
                      >
                        {copiedSlideIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép slide</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Chép slide</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Slide Content Box */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-snug">
                          <MathText text={slide.title} />
                        </h3>
                        {slide.subtitle && (
                          <p className="text-sm font-bold text-orange-600 mt-1">
                            <MathText text={slide.subtitle} />
                          </p>
                        )}
                      </div>

                      {/* Bullet points */}
                      {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                            NỘI DUNG TRÌNH CHIẾU TRÊN SLIDE:
                          </p>
                          <ul className="space-y-2">
                            {slide.bulletPoints.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start space-x-2.5 text-sm text-slate-800 font-medium leading-relaxed">
                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5"></span>
                                <span><MathText text={pt} /></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Teacher notes */}
                      {slide.teacherNotes && (
                        <div className="text-xs font-medium text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 flex items-start space-x-2">
                          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Ghi chú hoạt động sư phạm (Presenter Notes):</strong> <MathText text={slide.teacherNotes} /></span>
                        </div>
                      )}

                      {/* Footer AI Image Prompt Box */}
                      {slide.aiImagePrompt && (
                        <div className="mt-4 pt-3 border-t border-orange-100/80">
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3.5 rounded-xl border border-orange-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-start space-x-2.5">
                              <Image className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-black uppercase text-orange-900 tracking-tight">
                                  GỢI Ý PROMPT AI TẠO ẢNH MINH HỌA:
                                </p>
                                <p className="text-xs font-medium text-slate-700 italic mt-0.5 leading-relaxed">
                                  "{slide.aiImagePrompt}"
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(slide.aiImagePrompt, idx)}
                              className="self-end md:self-center shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-orange-700 hover:bg-orange-500 rounded-lg text-[11px] font-bold text-white shadow-sm transition-all duration-200"
                            >
                              {copiedPromptIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span className="text-emerald-200 font-extrabold">ĐÃ SAO CHÉP</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-white" />
                                  <span>SAO CHÉP PROMPT</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <p className="text-xs font-semibold text-slate-500">
            Tải file PowerPoint (.pptx) để chỉnh sửa trong Microsoft PowerPoint hoặc nhập trực tiếp vào Canva, Google Slides, Gamma.
          </p>
          <div className="flex items-center space-x-2.5">
            {!isLoading && slides.length > 0 && (
              <button
                type="button"
                onClick={() => handleExportPptx(selectedTheme)}
                disabled={isExportingPptx}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl transition-all duration-200 shadow-sm flex items-center space-x-1.5"
              >
                {isExportingPptx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                <span>TẢI PPTX</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-sm"
            >
              ĐÓNG
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


