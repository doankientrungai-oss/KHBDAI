import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LessonPlanDisplayProps, ExtractedGraphicItem } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { CopyIcon } from './icons/CopyIcon';
import { ExportIcon } from './icons/ExportIcon';
import { 
  Lock, 
  Presentation, 
  Edit3, 
  Eye, 
  Image as ImageIcon, 
  PanelRightClose, 
  PanelRightOpen, 
  ZoomIn, 
  ZoomOut,
  Trash2, 
  Plus, 
  Bold, 
  Heading1, 
  Heading2, 
  Table as TableIcon, 
  Sigma,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  Type,
  Layers
} from 'lucide-react';
import { SlideSuggestionModal } from './SlideSuggestionModal';
import { MathText } from './MathText';
import { ExtractedGraphicPanel } from './ExtractedGraphicPanel';
import { cleanMarkdownOutsideMath, formatMathForWord } from '../utils/mathUtils';
import { dataUrlToUint8Array, parseGraphicReference, parseLineContentSegments, findGraphicItem, ParsedGraphicRef } from '../utils/graphicUtils';
import * as docx from 'docx';
import saveAs from 'file-saver';

export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ 
  plan, 
  isLoading, 
  lessonTitle, 
  isTrial = true, 
  userType = 'trial',
  onOpenVipModal,
  formData,
  teacherInfo,
  userApiKey,
  extractedGraphics = [],
  onUpdateGraphics,
  onUpdatePlan
}) => {
  const actualIsTrial = userType === 'trial';
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isSlideModalOpen, setIsSlideModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');
  const [isGraphicSidebarOpen, setIsGraphicSidebarOpen] = useState<boolean>(false);
  const [sidebarMode, setSidebarMode] = useState<'drawer' | 'pinned'>('drawer');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState<boolean>(false);
  const [activeZoomImage, setActiveZoomImage] = useState<{ src: string; title: string; caption?: string } | null>(null);

  // Editable plan state
  const [editablePlan, setEditablePlan] = useState<string>(plan || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickPickerRef = useRef<HTMLDivElement>(null);

  // Listen to Escape key to exit fullscreen or quick picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQuickPickerOpen) setIsQuickPickerOpen(false);
        else if (activeZoomImage) setActiveZoomImage(null);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, activeZoomImage, isQuickPickerOpen]);

  // Click outside quick picker to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickPickerRef.current && !quickPickerRef.current.contains(e.target as Node)) {
        setIsQuickPickerOpen(false);
      }
    };
    if (isQuickPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isQuickPickerOpen]);

  useEffect(() => {
    setEditablePlan(plan || '');
  }, [plan]);

  useEffect(() => {
    if (isLoading) {
      setIsSlideModalOpen(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  useEffect(() => {
    if (!isLoading && plan && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoading, plan]);

  const currentPlanContent = editablePlan;

  const handlePlanTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditablePlan(val);
    if (onUpdatePlan) {
      onUpdatePlan(val);
    }
  };

  /**
   * Chèn đối tượng đồ họa vào vị trí con trỏ chuột trong trình soạn thảo
   */
  const handleInsertGraphicToCursor = (graphic: ExtractedGraphicItem) => {
    const tag = `\n\n![${graphic.title}](${graphic.id})\n*${graphic.title}${graphic.caption ? ` - ${graphic.caption}` : ''}*\n\n`;

    if (viewMode === 'editor' && textareaRef.current) {
      const textarea = textareaRef.current;
      const startPos = textarea.selectionStart || 0;
      const endPos = textarea.selectionEnd || 0;
      const textBefore = editablePlan.substring(0, startPos);
      const textAfter = editablePlan.substring(endPos);

      const newContent = textBefore + tag + textAfter;
      setEditablePlan(newContent);
      if (onUpdatePlan) onUpdatePlan(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(startPos + tag.length, startPos + tag.length);
      }, 50);
    } else {
      // If currently in preview mode, append or switch to edit mode
      const newContent = editablePlan + tag;
      setEditablePlan(newContent);
      if (onUpdatePlan) onUpdatePlan(newContent);
    }
  };

  /**
   * Helper: Chèn mẫu cú pháp vào con trỏ editor
   */
  const insertSnippet = (snippet: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const startPos = textarea.selectionStart || 0;
      const endPos = textarea.selectionEnd || 0;
      const textBefore = editablePlan.substring(0, startPos);
      const textAfter = editablePlan.substring(endPos);

      const newContent = textBefore + snippet + textAfter;
      setEditablePlan(newContent);
      if (onUpdatePlan) onUpdatePlan(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(startPos + snippet.length, startPos + snippet.length);
      }, 50);
    }
  };

  const cleanPlanText = (text: string) => cleanMarkdownOutsideMath(text);
  const cleanPlanTextForWord = (text: string) => formatMathForWord(text);

  const renderTextWithMath = (text: string) => {
    if (!text) return null;
    return <MathText text={text} />;
  };

  const handleCopy = () => {
    if (actualIsTrial) {
      if (onOpenVipModal) onOpenVipModal('copy');
      return;
    }

    const lines = currentPlanContent.split('\n');
    const cleanedContent = lines
      .map(line => line.startsWith('|') ? line : cleanPlanTextForWord(line))
      .filter(line => line.trim().length > 0)
      .join('\n');
    
    navigator.clipboard.writeText(cleanedContent).then(() => {
      setCopyStatus('copied');
    }).catch(err => console.error('Copy failed:', err));
  };

  /**
   * XUẤT FILE WORD (.DOCX) ĐỒNG BỘ ĐỐI TƯỢNG ĐỒ HỌA VÀ BẢNG BIỂU
   */
  const handleExport = async () => {
    if (actualIsTrial) {
      if (onOpenVipModal) onOpenVipModal('download');
      return;
    }

    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign } = docx;
      const lines = currentPlanContent.split('\n').filter(l => l.trim().length > 0);
      const docChildren: any[] = [];
      const FONT_SIZE = 26; // 13pt
      const FONT_FAMILY = "Times New Roman";
      const LINE_SPACING = 276; // 1.15 line spacing

      let i = 0;
      while (i < lines.length) {
        let line = lines[i].trim();

        // 1. Bảng biểu Markdown
        if (line.startsWith('|')) {
          const tableRowsData: string[][] = [];
          while (i < lines.length && lines[i].trim().startsWith('|')) {
            const rowLine = lines[i].trim();
            if (!rowLine.includes('---')) {
              const cells = rowLine.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
              if (cells.length > 0) tableRowsData.push(cells);
            }
            i++;
          }

          if (tableRowsData.length > 0) {
            const isSingleCellTable = tableRowsData.length === 1 && tableRowsData[0].length === 1;

            if (isSingleCellTable) {
              const cellText = tableRowsData[0][0];
              const cellLines = cellText.split(/<br\s*\/?>|\n/gi).map(l => cleanPlanTextForWord(l)).filter(l => l.length > 0);
              const paragraphs = cellLines.map((lineStr, lineIdx) => {
                const isHeaderLine = lineStr.toUpperCase().includes('KẾ HOẠCH BÀI DẠY') || lineStr.toUpperCase().includes('GIÁO ÁN') || lineIdx === 3 || lineIdx === 4;
                return new Paragraph({
                  children: [new TextRun({ 
                    text: lineStr, 
                    size: isHeaderLine ? FONT_SIZE + 2 : FONT_SIZE, 
                    font: FONT_FAMILY, 
                    bold: isHeaderLine || lineStr.startsWith('Giáo viên thực hiện:')
                  })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 20, after: 20, line: LINE_SPACING },
                });
              });

              docChildren.push(new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: paragraphs,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                      })
                    ]
                  })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                }
              }));
            } else {
              const isSignatureTable = tableRowsData.some(row => 
                row.some(cell => cell.toUpperCase().includes('CHUYÊN MÔN') || cell.toUpperCase().includes('GIÁO VIÊN SOẠN'))
              );
              const docxTableRows: docx.TableRow[] = tableRowsData.map((rowCells, rowIdx) => {
                const isHeader = rowIdx === 0;
                return new TableRow({
                  children: rowCells.map(cellText => {
                    const rawLines = cellText.split(/<br\s*\/?>|\n/gi);
                    const cellLines = isSignatureTable 
                      ? rawLines 
                      : rawLines.filter(l => l.trim().length > 0);
                    
                    const paragraphs: docx.Paragraph[] = [];
                    const linesToProcess = cellLines.length > 0 ? cellLines : [''];

                    for (const lineStr of linesToProcess) {
                      const segments = parseLineContentSegments(lineStr, extractedGraphics);
                      
                      for (const seg of segments) {
                        if (seg.type === 'graphic') {
                          const targetDataUrl = seg.dataUrl || seg.graphic?.dataUrl;
                          if (targetDataUrl) {
                            try {
                              const imageBytes = dataUrlToUint8Array(targetDataUrl);
                              const cellImgWidth = rowCells.length === 2 ? 240 : 160;
                              const ratio = seg.aspectRatio || seg.graphic?.aspectRatio || 1.4;
                              const cellImgHeight = Math.min(220, Math.max(80, Math.round(cellImgWidth / ratio)));

                              paragraphs.push(new Paragraph({
                                children: [
                                  new ImageRun({
                                    data: imageBytes,
                                    transformation: {
                                      width: cellImgWidth,
                                      height: cellImgHeight,
                                    }
                                  })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 80, after: 40 }
                              }));

                              paragraphs.push(new Paragraph({
                                children: [
                                  new TextRun({
                                    text: seg.title || seg.graphic?.title || 'Hình minh họa',
                                    italics: true,
                                    size: FONT_SIZE - 4,
                                    font: FONT_FAMILY,
                                    color: '555555'
                                  })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 0, after: 80 }
                              }));
                            } catch (err) {
                              console.error('Lỗi nhúng ảnh vào ô bảng Word:', err);
                            }
                          } else {
                            paragraphs.push(new Paragraph({
                              children: [
                                new TextRun({
                                  text: `[Hình ảnh: ${seg.title}]`,
                                  italics: true,
                                  size: FONT_SIZE - 4,
                                  font: FONT_FAMILY,
                                  color: '666666'
                                })
                              ],
                              alignment: AlignmentType.CENTER,
                              spacing: { before: 40, after: 40 }
                            }));
                          }
                        } else {
                          const cleanedText = cleanPlanTextForWord(seg.content);
                          if (cleanedText || isSignatureTable) {
                            paragraphs.push(new Paragraph({
                              children: [new TextRun({ 
                                text: cleanedText, 
                                size: FONT_SIZE, 
                                font: FONT_FAMILY, 
                                bold: isHeader || (isSignatureTable && cleanedText.trim().length > 0)
                              })],
                              alignment: (isHeader || isSignatureTable) ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
                              spacing: { before: 0, after: 60, line: LINE_SPACING },
                            }));
                          }
                        }
                      }
                    }

                    return new TableCell({
                      children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun({ text: '', size: FONT_SIZE, font: FONT_FAMILY })] })],
                      width: { size: rowCells.length === 2 ? 50 : Math.floor(100 / rowCells.length), type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.TOP,
                    });
                  })
                });
              });

              docChildren.push(new Table({
                rows: docxTableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                }
              }));
            }
          }
          continue;
        }

        // 2. Dòng thông thường (kiểm tra đối tượng đồ họa / text)
        const lineSegments = parseLineContentSegments(line, extractedGraphics);
        const hasGraphic = lineSegments.some(s => s.type === 'graphic');

        if (hasGraphic) {
          for (const seg of lineSegments) {
            if (seg.type === 'graphic') {
              const targetDataUrl = seg.dataUrl || seg.graphic?.dataUrl;
              if (targetDataUrl) {
                try {
                  const imageBytes = dataUrlToUint8Array(targetDataUrl);
                  const ratio = seg.aspectRatio || seg.graphic?.aspectRatio || 1.4;
                  const imgWidth = Math.min(420, 480);
                  const imgHeight = Math.min(340, Math.max(120, Math.round(imgWidth / ratio)));

                  // Đoạn ảnh căn giữa
                  docChildren.push(new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageBytes,
                        transformation: {
                          width: imgWidth,
                          height: imgHeight,
                        }
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 180, after: 60 }
                  }));

                  // Đoạn chú thích ảnh in nghiêng căn giữa
                  docChildren.push(new Paragraph({
                    children: [
                      new TextRun({
                        text: seg.title || seg.graphic?.title || 'Hình minh họa',
                        italics: true,
                        size: FONT_SIZE - 2,
                        font: FONT_FAMILY,
                        color: '333333'
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 140 }
                  }));
                } catch (imgErr) {
                  console.error('Lỗi nhúng ảnh vào Word:', imgErr);
                }
              } else {
                docChildren.push(new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Hình ảnh minh họa: ${seg.title}]`,
                      italics: true,
                      size: FONT_SIZE - 2,
                      font: FONT_FAMILY,
                      color: '555555'
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 80 }
                }));
              }
            } else {
              const cleanedLine = cleanPlanTextForWord(seg.content);
              if (cleanedLine) {
                const isMainTitle = i === 0 || cleanedLine.toUpperCase().startsWith('KẾ HOẠCH BÀI DẠY');
                const isSection = /^(I|II|III|IV|V|VI)\.\s/.test(cleanedLine);
                const isSubsection = /^\d+\.\s/.test(cleanedLine) || cleanedLine.startsWith('Hoạt động');
                const isItem = /^[a-z]\)\s/.test(cleanedLine);
                const isStep = /^Bước \d+:/.test(cleanedLine);
                const isSignature = cleanedLine.startsWith('Giáo viên soạn');

                const boldKeywords = ['Mục tiêu:', 'Nội dung:', 'Sản phẩm:', 'Tổ chức thực hiện:', 'a) Mục tiêu:', 'b) Nội dung:', 'c) Sản phẩm:', 'd) Tổ chức thực hiện:'];
                const shouldBoldLine = isMainTitle || isSection || isSubsection || isItem || isActivityCheck(cleanedLine) || isStep || isSignature || boldKeywords.some(k => cleanedLine.startsWith(k));

                docChildren.push(new Paragraph({
                  children: [new TextRun({ 
                    text: cleanedLine, 
                    bold: shouldBoldLine,
                    size: isMainTitle ? FONT_SIZE + 4 : FONT_SIZE, font: FONT_FAMILY 
                  })],
                  alignment: isSignature ? AlignmentType.RIGHT : isMainTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
                  spacing: { 
                      before: (isSection || isActivityCheck(cleanedLine)) ? 200 : isSignature ? 400 : 0, 
                      after: 100,
                      line: LINE_SPACING
                  },
                  indent: !isMainTitle && !isSection && !isSubsection && !isItem && !isActivityCheck(cleanedLine) && !isStep && !isSignature ? { firstLine: 400 } : undefined
                }));
              }
            }
          }
        } else {
          // 3. Đoạn văn bản thuần túy
          const cleanedLine = cleanPlanTextForWord(line);
          if (cleanedLine) {
            const isMainTitle = i === 0 || cleanedLine.toUpperCase().startsWith('KẾ HOẠCH BÀI DẠY');
            const isSection = /^(I|II|III|IV|V|VI)\.\s/.test(cleanedLine);
            const isSubsection = /^\d+\.\s/.test(cleanedLine) || cleanedLine.startsWith('Hoạt động');
            const isItem = /^[a-z]\)\s/.test(cleanedLine);
            const isStep = /^Bước \d+:/.test(cleanedLine);
            const isSignature = cleanedLine.startsWith('Giáo viên soạn');

            const boldKeywords = ['Mục tiêu:', 'Nội dung:', 'Sản phẩm:', 'Tổ chức thực hiện:', 'a) Mục tiêu:', 'b) Nội dung:', 'c) Sản phẩm:', 'd) Tổ chức thực hiện:'];
            const shouldBoldLine = isMainTitle || isSection || isSubsection || isItem || isActivityCheck(cleanedLine) || isStep || isSignature || boldKeywords.some(k => cleanedLine.startsWith(k));

            docChildren.push(new Paragraph({
              children: [new TextRun({ 
                text: cleanedLine, 
                bold: shouldBoldLine,
                size: isMainTitle ? FONT_SIZE + 4 : FONT_SIZE, font: FONT_FAMILY 
              })],
              alignment: isSignature ? AlignmentType.RIGHT : isMainTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
              spacing: { 
                  before: (isSection || isActivityCheck(cleanedLine)) ? 200 : isSignature ? 400 : 0, 
                  after: 100,
                  line: LINE_SPACING
              },
              indent: !isMainTitle && !isSection && !isSubsection && !isItem && !isActivityCheck(cleanedLine) && !isStep && !isSignature ? { firstLine: 400 } : undefined
            }));
          }
        }
        i++;
      }

      const doc = new Document({
        sections: [{ 
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } } }, 
          children: docChildren 
        }],
      });

      const blob = await Packer.toBlob(doc);
      const safeTitle = lessonTitle ? lessonTitle.replace(/[\\/:*?"<>|]/g, '').trim() : "";
      const finalFileName = safeTitle ? `${safeTitle}.docx` : `Ke_hoach_bai_day.docx`;
      saveAs(blob, finalFileName);
    } catch (err) { console.error('Export Error:', err); }
  };

  const isActivityCheck = (line: string) => line.startsWith('Hoạt động') || /^(\d+)\.\sHoạt động/.test(line);

  /**
   * RENDERED PLAN PREVIEW (WITH INTEGRATED IMAGES)
   */
  const renderedPlan = useMemo(() => {
    if (!currentPlanContent) return null;
    const lines = currentPlanContent.split('\n').filter(l => l.trim().length > 0);
    const elements: React.ReactNode[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      // 1. Kiểm tra Bảng Markdown
      if (line.startsWith('|')) {
        const tableRows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const rowLine = lines[i].trim();
          if (!rowLine.includes('---')) {
            const cells = rowLine.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (cells.length > 0) tableRows.push(cells);
          }
          i++;
        }

        if (tableRows.length > 0) {
          const isSingleCellTable = tableRows.length === 1 && tableRows[0].length === 1;

          if (isSingleCellTable) {
            const cellText = tableRows[0][0];
            const lineChunks = cellText.split(/<br\s*\/?>|\n/gi).map(c => cleanPlanText(c)).filter(c => c.length > 0);
            elements.push(
              <div key={`table-${i}`} className="my-6 border border-slate-300 rounded-xl p-5 bg-slate-50/70 shadow-sm text-center">
                <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                  {lineChunks.map((chunk, cIdx) => {
                    const isMainTitle = chunk.toUpperCase().includes('KẾ HOẠCH BÀI DẠY') || chunk.toUpperCase().includes('GIÁO ÁN') || cIdx === 3 || cIdx === 4;
                    return (
                      <div 
                        key={cIdx} 
                        className={`text-center w-full leading-relaxed ${
                          isMainTitle 
                            ? "font-black text-blue-900 text-[16px] uppercase tracking-wide my-1" 
                            : "font-semibold text-slate-800 text-[14px]"
                        }`}
                      >
                        {renderTextWithMath(chunk)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            const isSignatureTable = tableRows.some(row => 
              row.some(cell => cell.toUpperCase().includes('CHUYÊN MÔN') || cell.toUpperCase().includes('GIÁO VIÊN SOẠN'))
            );
            elements.push(
              <div key={`table-${i}`} className="my-6 border border-slate-300 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500 rounded-lg">
                <table className="w-full border-collapse bg-white text-[14px]">
                  <thead className="bg-slate-50 border-b border-slate-300">
                    <tr>
                      {tableRows[0].map((cell, idx) => (
                        <th key={idx} className="border-r border-slate-200 last:border-0 p-3 text-center font-bold text-slate-800 uppercase text-[12px] bg-slate-100">
                          {renderTextWithMath(cleanPlanText(cell))}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`border-r border-slate-100 last:border-0 p-3 text-slate-700 align-top leading-[1.4] ${isSignatureTable ? 'text-center font-semibold' : 'text-justify'}`}>
                            {cell.split(/<br\s*\/?>|\n/gi).map((lineChunk, lIdx) => {
                              const cellSegments = parseLineContentSegments(lineChunk, extractedGraphics);
                              const hasCellGraphic = cellSegments.some(s => s.type === 'graphic');

                              if (hasCellGraphic) {
                                return (
                                  <div key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                                    {cellSegments.map((seg, sIdx) => {
                                      if (seg.type === 'graphic') {
                                        const displayDataUrl = seg.dataUrl || seg.graphic?.dataUrl;
                                        const cellImageTitle = seg.title || seg.graphic?.title || 'Hình minh họa';
                                        return (
                                          <div key={`c-img-${sIdx}`} className="my-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col items-center group">
                                            {displayDataUrl ? (
                                              <div className="relative inline-block max-w-full overflow-hidden rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                <img
                                                  src={displayDataUrl}
                                                  alt={cellImageTitle}
                                                  className="max-h-52 max-w-full object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                                                  onClick={() => setActiveZoomImage({ 
                                                    src: displayDataUrl, 
                                                    title: cellImageTitle, 
                                                    caption: seg.caption || seg.graphic?.caption 
                                                  })}
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveZoomImage({ 
                                                    src: displayDataUrl, 
                                                    title: cellImageTitle, 
                                                    caption: seg.caption || seg.graphic?.caption 
                                                  })}
                                                  className="absolute bottom-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                                  title="Phóng to"
                                                >
                                                  <Maximize2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="p-3 bg-slate-100 border border-dashed border-slate-300 rounded-lg text-slate-500 text-[11px]">
                                                <ImageIcon className="w-5 h-5 mx-auto mb-0.5 text-slate-400" />
                                                <span>Đối tượng đồ họa: {cellImageTitle}</span>
                                              </div>
                                            )}
                                            <p className="mt-1 text-[11px] font-semibold italic text-slate-700">
                                              {cellImageTitle}
                                            </p>
                                          </div>
                                        );
                                      }
                                      const cleaned = cleanPlanText(seg.content);
                                      if (!cleaned) return null;
                                      return (
                                        <span key={`c-txt-${sIdx}`} className="inline">
                                          {renderTextWithMath(cleaned)}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              const cleanedChunk = cleanPlanText(lineChunk);
                              if (!cleanedChunk) return <div key={lIdx} className="h-4" />;
                              return (
                                <div key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                                  {renderTextWithMath(cleanedChunk)}
                                </div>
                              );
                            })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
        continue;
      }

      // 2. Dòng thông thường (kiểm tra phân đoạn đồ họa)
      const lineSegments = parseLineContentSegments(line, extractedGraphics);
      const hasGraphic = lineSegments.some(s => s.type === 'graphic');

      if (hasGraphic) {
        elements.push(
          <div key={`line-seg-${i}`} className="my-4 space-y-2">
            {lineSegments.map((seg, sIdx) => {
              if (seg.type === 'graphic') {
                const displayDataUrl = seg.dataUrl || seg.graphic?.dataUrl;
                const imageTitle = seg.title || seg.graphic?.title || 'Hình minh họa bài dạy';

                return (
                  <div key={`img-${i}-${sIdx}`} className="my-4 p-4 bg-orange-50/30 border border-orange-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs group">
                    {displayDataUrl ? (
                      <div className="relative max-w-full overflow-hidden rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <img
                          src={displayDataUrl}
                          alt={imageTitle}
                          className="max-h-80 max-w-full object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                          onClick={() => setActiveZoomImage({ src: displayDataUrl, title: imageTitle, caption: seg.caption || seg.graphic?.caption })}
                        />
                        <button
                          type="button"
                          onClick={() => setActiveZoomImage({ src: displayDataUrl, title: imageTitle, caption: seg.caption || seg.graphic?.caption })}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-xs"
                          title="Phóng to xem chi tiết"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                        <span>Đối tượng đồ họa: {imageTitle}</span>
                      </div>
                    )}
                    <p className="mt-2 text-xs font-bold italic text-slate-700">
                      {imageTitle}
                    </p>
                    {(seg.caption || seg.graphic?.caption) && (
                      <p className="text-[11px] text-slate-500 italic max-w-md mt-0.5">
                        {seg.caption || seg.graphic?.caption}
                      </p>
                    )}
                  </div>
                );
              }

              const trimmedSeg = cleanPlanText(seg.content);
              if (!trimmedSeg) return null;
              return (
                <p key={`txt-${i}-${sIdx}`} className="mb-2 text-slate-800 text-justify leading-[1.5] text-[15px] [text-indent:1.5em]">
                  {renderTextWithMath(trimmedSeg)}
                </p>
              );
            })}
          </div>
        );
        i++;
        continue;
      }

      const trimmedLine = cleanPlanText(line);
      if (trimmedLine) {
        const isSignature = trimmedLine.startsWith('Giáo viên soạn');

        if (i === 0 && (trimmedLine.toUpperCase().includes('KẾ HOẠCH BÀI DẠY') || trimmedLine.toUpperCase().includes('GIÁO ÁN'))) {
          elements.push(<h1 key={i} className="text-xl font-black text-center text-blue-900 mb-8 uppercase tracking-widest border-b-2 border-blue-100 pb-3 leading-tight">{renderTextWithMath(trimmedLine)}</h1>);
        } else if (/^(I|II|III|IV|V|VI)\.\s/.test(trimmedLine)) {
          elements.push(<h2 key={i} className="text-[17px] font-black text-blue-800 mt-8 mb-3 uppercase flex items-center border-l-4 border-blue-600 pl-4 bg-blue-50/40 py-2 leading-none">{renderTextWithMath(trimmedLine)}</h2>);
        } else if (/^\d+\.\s/.test(trimmedLine) || isActivityCheck(trimmedLine)) {
          elements.push(<h3 key={i} className="text-[16px] font-bold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1.5 leading-none">{renderTextWithMath(trimmedLine)}</h3>);
        } else if (/^[a-z]\)\s/.test(trimmedLine) || /^Bước \d+:/.test(trimmedLine)) {
          const boldKeywords = ['Mục tiêu:', 'Nội dung:', 'Sản phẩm:', 'Tổ chức thực hiện:', 'a) Mục tiêu:', 'b) Nội dung:', 'c) Sản phẩm:', 'd) Tổ chức thực hiện:', 'Bước 1:', 'Bước 2:', 'Bước 3:', 'Bước 4:'];
          let matchedKeyword = boldKeywords.find(k => trimmedLine.startsWith(k));
          
          if (matchedKeyword) {
             const keyword = matchedKeyword;
             const rest = trimmedLine.slice(keyword.length);
             elements.push(
               <p key={i} className="mb-2 text-slate-900 text-[15px] leading-[1.5]">
                 <strong className="font-bold text-slate-950 underline decoration-blue-200 decoration-2 underline-offset-2">{keyword}</strong>{renderTextWithMath(rest)}
               </p>
             );
          } else {
             elements.push(<p key={i} className="mb-2 text-slate-900 font-bold text-[15px] column-gap-4 leading-[1.5]">{renderTextWithMath(trimmedLine)}</p>);
          }
        } else if (isSignature) {
          elements.push(
            <div key={i} className="mt-14 text-right text-slate-950 font-bold italic pr-6 leading-relaxed">
              {renderTextWithMath(trimmedLine)}
            </div>
          );
        } else {
          const nlsPattern = /\[\d\.\d\.\w+\d[a-z]?\]/;
          const boldKeywords = ['Mục tiêu:', 'Nội dung:', 'Sản phẩm:', 'Tổ chức thực hiện:', 'Giao nhiệm vụ:', 'Thực hiện nhiệm vụ:', 'Báo cáo, thảo luận:', 'Kết luận, nhận định:', 'Tên bài dạy:'];
          
          let matchedKeyword = boldKeywords.find(k => trimmedLine.startsWith(k));
          
          if (matchedKeyword) {
            const keyword = matchedKeyword;
            const rest = trimmedLine.slice(keyword.length);
            const renderedLine = <><strong className="font-bold text-slate-950 underline decoration-blue-100 decoration-2 underline-offset-2">{keyword}</strong>{renderTextWithMath(rest)}</>;
            elements.push(<p key={i} className="mb-2 text-slate-800 text-justify leading-[1.5] text-[15px] [text-indent:1.5em]">{renderedLine}</p>);
          } else if (nlsPattern.test(trimmedLine)) {
            elements.push(<p key={i} className="mb-3 text-teal-900 bg-teal-50/60 p-3 rounded-lg border border-teal-100 text-justify leading-[1.5] italic text-[14px] shadow-sm">{renderTextWithMath(trimmedLine)}</p>);
          } else {
            elements.push(<p key={i} className="mb-2 text-slate-800 text-justify leading-[1.5] text-[15px] [text-indent:1.5em]">{renderTextWithMath(trimmedLine)}</p>);
          }
        }
      }
      i++;
    }
    return elements;
  }, [currentPlanContent, extractedGraphics]);

  return (
    <div className={`flex flex-col bg-white overflow-hidden transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 shadow-2xl' 
        : 'h-full rounded-2xl shadow-xl shadow-orange-950/5 border border-amber-200 border-l-[5px] border-l-orange-600'
    }`}>
      
      {/* Top Header Controls Bar */}
      <div className="bg-gradient-to-r from-orange-50/90 to-amber-50/90 border-b border-amber-100 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 min-h-[58px]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-5 bg-orange-600 rounded-full shrink-0"></div>
          <h2 className="text-sm sm:text-base font-black text-amber-950 uppercase tracking-tight truncate">
            KẾT QUẢ SOẠN THẢO
          </h2>

          {/* Mode Switcher: Xem / Chỉnh sửa */}
          {!isLoading && currentPlanContent && (
            <div className="flex items-center bg-orange-100/80 p-0.5 rounded-xl border border-orange-200 ml-1">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white text-orange-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chế độ xem trước bài dạy chuẩn in ấn"
              >
                <Eye className="w-3.5 h-3.5 text-orange-600" />
                <span className="hidden sm:inline">Xem bài</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'editor'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chế độ chỉnh sửa văn bản & chèn đồ họa theo vị trí con trỏ"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Soạn thảo / Sửa</span>
              </button>
            </div>
          )}
        </div>
        
        {!isLoading && currentPlanContent && (
          <div className="flex flex-wrap items-center space-x-1 sm:space-x-1.5">
            
            {/* Toggle Graphic Sidebar */}
            <button
              type="button"
              onClick={() => setIsGraphicSidebarOpen(prev => !prev)}
              title={isGraphicSidebarOpen ? "Ẩn khung đồ họa" : "Mở khung đối tượng đồ họa để chọn/chèn hình"}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                isGraphicSidebarOpen
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-orange-50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đồ họa</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isGraphicSidebarOpen ? 'bg-white text-orange-700' : 'bg-orange-600 text-white'
              }`}>
                {extractedGraphics.length}
              </span>
            </button>

            {/* Fullscreen / Focus Mode Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? "Thu nhỏ (Thoát toàn màn hình)" : "Toàn màn hình (Tối đa không gian xem & soạn thảo)"}
              className="p-1.5 bg-white hover:bg-orange-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline">Thu nhỏ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Toàn màn hình</span>
                </>
              )}
            </button>

            {/* Slide Presentation Suggestion */}
            <button
              type="button"
              onClick={() => setIsSlideModalOpen(true)}
              title="Gợi ý nội dung bài giảng & Tạo file PowerPoint (.pptx) chuẩn 16:9"
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black transition-all bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-xs cursor-pointer animate-in fade-in"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">GỢI Ý SLIDE & PPTX</span>
            </button>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              title={actualIsTrial ? "Tính năng Sao chép bị khoá ở bản dùng thử" : "Sao chép bài dạy"}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shadow-xs cursor-pointer ${
                actualIsTrial
                  ? 'bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-400 text-white'
                  : copyStatus === 'copied'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-orange-700 hover:bg-orange-500 text-white'
              }`}
            >
              <CopyIcon />
              <span className="hidden sm:inline">
                {copyStatus === 'copied' ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}
              </span>
              {actualIsTrial && <Lock className="w-3 h-3 text-orange-200 shrink-0 ml-0.5" />}
            </button>

            {/* Export Word (.docx) with graphics sync */}
            <button
              type="button"
              onClick={handleExport}
              title={actualIsTrial ? "Tính năng Tải file Word bị khoá ở bản dùng thử" : "Tải file Word (.docx) kèm đồ họa"}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shadow-md bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-400 text-white cursor-pointer"
            >
              <ExportIcon />
              <span className="hidden sm:inline">TẢI FILE WORD</span>
              {actualIsTrial && <Lock className="w-3 h-3 text-orange-200 shrink-0 ml-0.5" />}
            </button>
          </div>
        )}
      </div>

      <SlideSuggestionModal 
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        plan={currentPlanContent}
        lessonTitle={lessonTitle || formData?.lessonTitle || "Bài học"}
        formData={formData}
        teacherInfo={teacherInfo}
        userApiKey={userApiKey}
        isTrial={actualIsTrial}
        onOpenVipModal={onOpenVipModal}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-hidden flex flex-row bg-slate-100/40 relative min-h-0">
        
        {/* Main Lesson Plan Canvas (Preview or Live Editor) */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 p-8 text-center animate-in fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/10 rounded-full scale-150 animate-pulse"></div>
                <div className="absolute inset-0 bg-orange-500/5 rounded-full scale-125 animate-ping"></div>
                <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl shadow-orange-500/10 border border-orange-100">
                  <svg className="w-16 h-16 text-orange-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3 max-w-md">
                <h2 className="text-orange-600 font-black text-xl sm:text-2xl tracking-tight uppercase leading-none">
                  {formData?.extractGraphics ? "ĐANG SOẠN THẢO VÀ CHÈN ẢNH" : "ĐANG SOẠN THẢO NỘI DUNG"}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] animate-bounce">
                  Thầy/Cô vui lòng đợi trong giây lát !
                </p>
              </div>
            </div>
          ) : currentPlanContent ? (
            viewMode === 'preview' ? (
              /* Preview Mode */
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 custom-scrollbar">
                <div 
                  id="lesson-plan-content" 
                  className="bg-white p-6 sm:p-10 lg:p-14 shadow-xl border border-slate-200 rounded-xl max-w-4xl mx-auto min-h-full font-serif [font-family:'Times_New_Roman',serif] text-[16px] text-slate-900 antialiased selection:bg-orange-100 animate-in fade-in duration-300"
                >
                  {renderedPlan}
                  <div className="mt-20 pt-4 border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-widest">
                    Kết thúc tài liệu học tập
                  </div>
                </div>
              </div>
            ) : (
              /* Editor Mode */
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 p-3 sm:p-4">
                
                {/* Editor Quick Action Toolbar */}
                <div className="bg-white border border-slate-200 rounded-xl p-2 mb-2 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider px-1">Chèn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => insertSnippet('\n\nI. YÊU CẦU CẦN ĐẠT\n1. Kiến thức: \n2. Năng lực: \n3. Phẩm chất: \n')}
                    className="px-2 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-900 rounded-lg transition-colors cursor-pointer"
                  >
                    + Mục I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('\n\n**Hoạt động 1: Khởi động**\na) Mục tiêu: \nb) Nội dung: \nc) Sản phẩm: \nd) Tổ chức thực hiện: \n- Bước 1: Giao nhiệm vụ\n- Bước 2: Thực hiện nhiệm vụ\n- Bước 3: Báo cáo, thảo luận\n- Bước 4: Kết luận, nhận định\n')}
                    className="px-2 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-900 rounded-lg transition-colors cursor-pointer"
                  >
                    + Hoạt động học
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('\n| Hoạt động của GV và HS | Sản phẩm dự kiến |\n| :--- | :--- |\n| **Bước 1:** Giao nhiệm vụ... | Sản phẩm học tập... |\n')}
                    className="px-2 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-900 rounded-lg transition-colors cursor-pointer"
                  >
                    + Bảng 2 cột
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet(' $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ ')}
                    className="px-2 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-900 rounded-lg transition-colors cursor-pointer"
                  >
                    + Công thức Toán ($)
                  </button>

                  {/* Quick Graphic Insertion Dropdown Popover */}
                  {extractedGraphics.length > 0 && (
                    <div className="relative ml-1" ref={quickPickerRef}>
                      <button
                        type="button"
                        onClick={() => setIsQuickPickerOpen(prev => !prev)}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                          isQuickPickerOpen 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs' 
                            : 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100'
                        }`}
                        title="Chọn ảnh bóc tách để chèn ngay tại vị trí con trỏ chuột"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Chèn ảnh SGK ({extractedGraphics.length})</span>
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {isQuickPickerOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white border border-amber-200 rounded-2xl shadow-2xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
                            <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                              <span>Chọn ảnh chèn vào con trỏ</span>
                            </span>
                            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded-full">
                              {extractedGraphics.length} ảnh
                            </span>
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {extractedGraphics.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  handleInsertGraphicToCursor(item);
                                  setIsQuickPickerOpen(false);
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all group"
                              >
                                <img
                                  src={item.dataUrl}
                                  alt={item.title}
                                  className="w-11 h-11 object-contain bg-white rounded-lg border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-[11px] truncate group-hover:text-orange-950">
                                    {item.title}
                                  </p>
                                  {item.caption && (
                                    <p className="text-[9.5px] text-slate-500 truncate italic">
                                      {item.caption}
                                    </p>
                                  )}
                                </div>
                                <Plus className="w-4 h-4 text-orange-600 shrink-0 group-hover:scale-110" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">Đặt con trỏ và click chèn ảnh</span>
                  </div>
                </div>

                {/* Textarea Editor */}
                <textarea
                  ref={textareaRef}
                  value={editablePlan}
                  onChange={handlePlanTextChange}
                  placeholder="Nhập hoặc chỉnh sửa nội dung bài soạn ở đây..."
                  className="flex-1 w-full p-4 bg-white border border-slate-300 rounded-xl font-mono text-[13px] text-slate-900 leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-inner resize-none custom-scrollbar"
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-amber-100/80 group hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-slate-300 group-hover:text-orange-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">CHƯA CÓ DỮ LIỆU</p>
                <p className="text-[9px] font-bold text-slate-300 uppercase">VUI LÒNG ĐIỀN THÔNG TIN BÊN TRÁI ĐỂ BẮT ĐẦU</p>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Mode Graphic Objects Sidebar */}
        {isGraphicSidebarOpen && sidebarMode === 'pinned' && (
          <div className="w-72 sm:w-80 flex-shrink-0 h-full flex flex-col border-l border-amber-200 shadow-md z-10 animate-in slide-in-from-right-4 duration-200">
            <ExtractedGraphicPanel
              graphics={extractedGraphics}
              onUpdateGraphics={onUpdateGraphics || (() => {})}
              onInsertToCursor={handleInsertGraphicToCursor}
              lessonTitle={lessonTitle || formData?.lessonTitle || ''}
              subject={formData?.subject || 'Toán'}
              grade={formData?.grade || '6'}
              isEditorActive={viewMode === 'editor'}
              userApiKey={userApiKey}
              onClose={() => setIsGraphicSidebarOpen(false)}
              sidebarMode={sidebarMode}
              onToggleSidebarMode={() => setSidebarMode(prev => prev === 'drawer' ? 'pinned' : 'drawer')}
            />
          </div>
        )}

        {/* Floating Drawer Mode Graphic Objects Panel (Overlay with zero document squeeze) */}
        {isGraphicSidebarOpen && sidebarMode === 'drawer' && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/25 backdrop-blur-2xs z-20 transition-opacity animate-in fade-in"
              onClick={() => setIsGraphicSidebarOpen(false)}
            />
            {/* Slide-out Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 max-w-[90vw] bg-white shadow-2xl z-30 flex flex-col border-l border-amber-200 animate-in slide-in-from-right duration-250">
              <ExtractedGraphicPanel
                graphics={extractedGraphics}
                onUpdateGraphics={onUpdateGraphics || (() => {})}
                onInsertToCursor={handleInsertGraphicToCursor}
                lessonTitle={lessonTitle || formData?.lessonTitle || ''}
                subject={formData?.subject || 'Toán'}
                grade={formData?.grade || '6'}
                isEditorActive={viewMode === 'editor'}
                userApiKey={userApiKey}
                onClose={() => setIsGraphicSidebarOpen(false)}
                sidebarMode={sidebarMode}
                onToggleSidebarMode={() => setSidebarMode(prev => prev === 'drawer' ? 'pinned' : 'drawer')}
              />
            </div>
          </>
        )}

      </div>

      {/* Lightbox / Zoom Modal */}
      {activeZoomImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveZoomImage(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full p-4 overflow-hidden shadow-2xl flex flex-col space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm">{activeZoomImage.title}</h4>
              <button
                type="button"
                onClick={() => setActiveZoomImage(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden bg-slate-50 rounded-xl p-2">
              <img
                src={activeZoomImage.src}
                alt={activeZoomImage.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
            {activeZoomImage.caption && (
              <p className="text-xs text-slate-600 italic text-center">
                {activeZoomImage.caption}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonPlanDisplay;
