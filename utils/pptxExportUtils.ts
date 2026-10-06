import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { SlideItem, LessonPlanFormData, TeacherInfo, ExtractedGraphicItem } from '../types';
import { formatMathForWord, convertSimpleMathToUnicode } from './mathUtils';

export interface PptxTheme {
  id: string;
  name: string;
  primaryColor: string;    // e.g. "EA580C"
  secondaryColor: string;  // e.g. "0F172A"
  accentColor: string;     // e.g. "F97316"
  lightBgColor: string;    // e.g. "FFF7ED"
  cardBgColor: string;     // e.g. "FFFFFF"
  textColor: string;       // e.g. "1E293B"
  mutedTextColor: string;  // e.g. "64748B"
  headerBg: string;        // e.g. "FFF1E6"
  noteBoxBg: string;       // e.g. "ECFDF5"
  noteTextColor: string;   // e.g. "065F46"
}

export const PPTX_THEMES: Record<string, PptxTheme> = {
  orange: {
    id: 'orange',
    name: 'Cam Năng Động (Khuyên dùng)',
    primaryColor: 'C2410C',   // Deep Orange
    secondaryColor: '1E293B', // Slate Dark
    accentColor: 'EA580C',    // Orange
    lightBgColor: 'FFFBF7',   // Warm off-white
    cardBgColor: 'FFFFFF',
    textColor: '1E293B',
    mutedTextColor: '64748B',
    headerBg: 'FFEDD5',       // Amber 100
    noteBoxBg: 'F0FDF4',      // Green 50
    noteTextColor: '15803D'    // Green 700
  },
  blue: {
    id: 'blue',
    name: 'Xanh Dương Tri Thức',
    primaryColor: '1E40AF',   // Blue 800
    secondaryColor: '0F172A', // Slate 900
    accentColor: '2563EB',    // Blue 600
    lightBgColor: 'F8FAFC',   // Slate 50
    cardBgColor: 'FFFFFF',
    textColor: '1E293B',
    mutedTextColor: '64748B',
    headerBg: 'DBEAFE',       // Blue 100
    noteBoxBg: 'F0FDF4',
    noteTextColor: '15803D'
  },
  emerald: {
    id: 'emerald',
    name: 'Xanh Lá Tươi Sáng',
    primaryColor: '047857',   // Emerald 700
    secondaryColor: '1E293B',
    accentColor: '059669',    // Emerald 600
    lightBgColor: 'F0FDF4',   // Emerald 50
    cardBgColor: 'FFFFFF',
    textColor: '1E293B',
    mutedTextColor: '64748B',
    headerBg: 'D1FAE5',       // Emerald 100
    noteBoxBg: 'FEF3C7',      // Amber 100
    noteTextColor: 'B45309'    // Amber 700
  },
  indigo: {
    id: 'indigo',
    name: 'Tím Indigo Hiện Đại',
    primaryColor: '4338CA',   // Indigo 700
    secondaryColor: '1E1B4B',
    accentColor: '6366F1',    // Indigo 500
    lightBgColor: 'EEF2FF',   // Indigo 50
    cardBgColor: 'FFFFFF',
    textColor: '1E293B',
    mutedTextColor: '64748B',
    headerBg: 'E0E7FF',       // Indigo 100
    noteBoxBg: 'F0FDF4',
    noteTextColor: '15803D'
  }
};

/**
 * Clean up text for PPTX presentation (Unicode math formatting, removing raw markdown syntax)
 */
export const cleanTextForPptx = (text: string): string => {
  if (!text) return '';
  let cleaned = formatMathForWord(text);
  cleaned = convertSimpleMathToUnicode(cleaned);
  // Remove markdown bold / italics leftover
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1')
                   .replace(/\*(.*?)\*/g, '$1')
                   .replace(/__(.*?)__/g, '$1')
                   .replace(/_(.*?)_/g, '$1')
                   .replace(/`([^`]+)`/g, '$1')
                   .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
                   .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
                   .replace(/\$+/g, '');
  
  // Remove invalid XML 1.0 control characters (ASCII 0-31 except tab 0x09, newline 0x0A, carriage return 0x0D)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Remove zero-width characters and byte order marks
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

  return cleaned.trim();
};

/**
 * Main function to export Slide suggestions to PowerPoint (.pptx)
 */
export const exportSlidesToPptx = async (
  slides: SlideItem[],
  lessonTitle: string,
  formData?: LessonPlanFormData,
  teacherInfo?: TeacherInfo,
  themeKey: string = 'orange',
  graphics: ExtractedGraphicItem[] = []
): Promise<void> => {
  if (!slides || slides.length === 0) {
    throw new Error('Danh sách Slide trống, không thể tạo file PowerPoint.');
  }

  const theme = PPTX_THEMES[themeKey] || PPTX_THEMES.orange;
  const pptx = new PptxGenJS();

  // Clean company name: replace '&' with 'và' to prevent XML invalid token in docProps/app.xml
  const rawSchool = teacherInfo?.schoolName || 'Bộ Giáo Dục và Đào Tạo';
  const safeSchool = cleanTextForPptx(rawSchool).replace(/&/g, 'và');
  const safeAuthor = cleanTextForPptx(teacherInfo?.teacherName || 'Giáo viên');
  const safeTitleMeta = cleanTextForPptx(lessonTitle || 'Kế hoạch bài dạy - Slide bài giảng');
  const safeSubjectMeta = cleanTextForPptx(formData?.subject ? `Môn ${formData.subject} Lớp ${formData.grade}` : 'Bài giảng điện tử');

  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9'; // 16:9 Widescreen (10" x 5.625")
  pptx.author = safeAuthor;
  pptx.company = safeSchool;
  pptx.title = safeTitleMeta;
  pptx.subject = safeSubjectMeta;

  const safeTitle = lessonTitle ? cleanTextForPptx(lessonTitle) : 'BÀI GIẢNG ĐIỆN TỬ';
  const schoolNameUpper = (teacherInfo?.schoolName || 'TRƯỜNG THCS XYZ').toUpperCase();
  const managingAgencyUpper = (teacherInfo?.managingAgency || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO').toUpperCase();
  const teacherNameUpper = (teacherInfo?.teacherName || 'GIÁO VIÊN').toUpperCase();
  const departmentName = teacherInfo?.department || 'Tổ Tự Nhiên';
  const subjectName = formData?.subject || teacherInfo?.mainSubject || 'Toán học';
  const gradeName = formData?.grade ? `Lớp ${formData.grade}` : '';
  const textbookName = formData?.textbook || 'Bộ sách hiện hành';

  // -------------------------------------------------------------
  // SLIDE 1: COVER / TITLE SLIDE (Trang bìa sang trọng, chuẩn sư phạm)
  // -------------------------------------------------------------
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: theme.lightBgColor };

  // Top header decorative shape
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: theme.primaryColor }
  });

  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.15,
    w: '100%',
    h: 0.05,
    fill: { color: theme.accentColor }
  });

  // Top Institutional Info
  coverSlide.addText(
    [
      { text: `${managingAgencyUpper}\n`, options: { fontSize: 11, bold: true, color: theme.mutedTextColor } },
      { text: schoolNameUpper, options: { fontSize: 13, bold: true, color: theme.secondaryColor } }
    ],
    {
      x: 0.8,
      y: 0.45,
      w: 8.4,
      h: 0.8,
      align: 'left',
      fontFace: 'Arial'
    }
  );

  // Subject Badge Pill
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 3.6,
    h: 0.45,
    rectRadius: 0.1,
    fill: { color: theme.primaryColor },
    line: { color: theme.primaryColor, width: 1 }
  });

  coverSlide.addText(
    `MÔN: ${subjectName.toUpperCase()} ${gradeName ? `- ${gradeName.toUpperCase()}` : ''}`,
    {
      x: 0.8,
      y: 1.45,
      w: 3.6,
      h: 0.45,
      align: 'center',
      valign: 'middle',
      fontSize: 12,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    }
  );

  // Central Title Box Card
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 8.4,
    h: 2.1,
    rectRadius: 0.15,
    fill: { color: theme.cardBgColor },
    line: { color: theme.headerBg, width: 2 },
    shadow: { type: 'outer', color: 'CBD5E1', blur: 6, offset: 2, angle: 90 }
  });

  // Title Accent Left Bar
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 2.1,
    w: 0.18,
    h: 2.1,
    fill: { color: theme.primaryColor }
  });

  // Main Lesson Title Text
  coverSlide.addText(
    [
      {
        text: `${safeTitle}\n`,
        options: {
          fontSize: 24,
          bold: true,
          color: theme.primaryColor,
          fontFace: 'Arial'
        }
      },
      {
        text: textbookName ? `Sách giáo khoa: ${textbookName} • Thời lượng: ${formData?.duration || '2'} tiết` : '',
        options: {
          fontSize: 12,
          italic: true,
          color: theme.mutedTextColor,
          fontFace: 'Arial'
        }
      }
    ],
    {
      x: 1.2,
      y: 2.25,
      w: 7.8,
      h: 1.8,
      align: 'left',
      valign: 'middle'
    }
  );

  // Teacher Info Box (Bottom)
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.4,
    w: 8.4,
    h: 0.9,
    rectRadius: 0.1,
    fill: { color: theme.headerBg },
    line: { color: theme.accentColor, width: 1 }
  });

  coverSlide.addText(
    [
      { text: `Giáo viên thực hiện: `, options: { bold: true, color: theme.secondaryColor } },
      { text: `${teacherNameUpper}   |   `, options: { bold: true, color: theme.primaryColor } },
      { text: `Tổ chuyên môn: `, options: { bold: true, color: theme.secondaryColor } },
      { text: `${departmentName}   |   `, options: { color: theme.textColor } },
      { text: `Năm học: `, options: { bold: true, color: theme.secondaryColor } },
      { text: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`, options: { color: theme.textColor } }
    ],
    {
      x: 1.0,
      y: 4.4,
      w: 8.0,
      h: 0.9,
      align: 'center',
      valign: 'middle',
      fontSize: 11,
      fontFace: 'Arial'
    }
  );

  // Presenter notes for slide 1
  const coverNotes = cleanTextForPptx(
    `BÀI GIẢNG ĐIỆN TỬ: ${safeTitle}\nTrường: ${schoolNameUpper}\nGiáo viên: ${teacherNameUpper}\n` +
    (slides[0]?.aiImagePrompt ? `\n[Gợi ý Prompt tạo ảnh AI]: ${slides[0].aiImagePrompt}` : '')
  );
  coverSlide.addNotes(coverNotes);

  // -------------------------------------------------------------
  // SLIDES 2 to N: CONTENT, ACTIVITIES, INFOGRAPHICS & CONCLUSION
  // -------------------------------------------------------------
  for (let i = 1; i < slides.length; i++) {
    const slideItem = slides[i];
    const isLastSlide = i === slides.length - 1;
    const slide = pptx.addSlide();
    slide.background = { color: theme.lightBgColor };

    const slideTitleClean = cleanTextForPptx(slideItem.title);
    const slideSubtitleClean = cleanTextForPptx(slideItem.subtitle || '');
    const isInfographicSlide = slideTitleClean.toLowerCase().includes('infographic') ||
                               slideTitleClean.toLowerCase().includes('mindmap') ||
                               slideTitleClean.toLowerCase().includes('sơ đồ tư duy');

    // ---------------------------------------------------------
    // IF LAST SLIDE: THANK YOU / CLOSING SLIDE
    // ---------------------------------------------------------
    if (isLastSlide && (slideTitleClean.includes('CẢM ƠN') || slideTitleClean.includes('THANK'))) {
      // Top & Bottom decorative bars
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.15, fill: { color: theme.primaryColor }
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 5.475, w: '100%', h: 0.15, fill: { color: theme.accentColor }
      });

      // Thank You Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.0,
        y: 0.8,
        w: 8.0,
        h: 4.0,
        rectRadius: 0.2,
        fill: { color: theme.cardBgColor },
        line: { color: theme.headerBg, width: 2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 8, offset: 3, angle: 90 }
      });

      slide.addText(
        [
          {
            text: `✨ XIN CHÂN THÀNH CẢM ƠN! ✨\n\n`,
            options: {
              fontSize: 26,
              bold: true,
              color: theme.primaryColor,
              fontFace: 'Arial'
            }
          },
          {
            text: slideSubtitleClean || `KÍNH CHÚC QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH\nSỨC KHỎE - HẠNH PHÚC - ĐẠT KẾT QUẢ CAO!`,
            options: {
              fontSize: 16,
              bold: true,
              color: theme.secondaryColor,
              fontFace: 'Arial'
            }
          }
        ],
        {
          x: 1.2,
          y: 1.1,
          w: 7.6,
          h: 2.2,
          align: 'center',
          valign: 'middle'
        }
      );

      // Closing notes/bullets
      if (slideItem.bulletPoints && slideItem.bulletPoints.length > 0) {
        const closingPoints = slideItem.bulletPoints.map(p => ({
          text: `• ${cleanTextForPptx(p)}\n`,
          options: { fontSize: 12, italic: true, color: theme.mutedTextColor }
        }));

        slide.addText(closingPoints, {
          x: 1.5,
          y: 3.3,
          w: 7.0,
          h: 1.2,
          align: 'center',
          fontFace: 'Arial'
        });
      }

      slide.addNotes(
        `Trang kết thúc bài giảng.\n` +
        (slideItem.aiImagePrompt ? `[Gợi ý Prompt AI tạo ảnh]: ${slideItem.aiImagePrompt}` : '')
      );
      continue;
    }

    // ---------------------------------------------------------
    // STANDARD CONTENT & ACTIVITY SLIDES
    // ---------------------------------------------------------

    // Top Header Banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.95,
      fill: { color: theme.headerBg }
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0.95,
      w: '100%',
      h: 0.04,
      fill: { color: theme.primaryColor }
    });

    // Slide Number Badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 0.15,
      w: 1.1,
      h: 0.38,
      rectRadius: 0.08,
      fill: { color: theme.primaryColor }
    });

    slide.addText(`SLIDE ${slideItem.slideNumber || i + 1}`, {
      x: 0.6,
      y: 0.15,
      w: 1.1,
      h: 0.38,
      align: 'center',
      valign: 'middle',
      fontSize: 10,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    // Main Header Title Text
    slide.addText(
      [
        {
          text: slideTitleClean,
          options: {
            fontSize: 15,
            bold: true,
            color: theme.primaryColor,
            fontFace: 'Arial'
          }
        },
        slideSubtitleClean ? {
          text: `\n${slideSubtitleClean}`,
          options: {
            fontSize: 10.5,
            italic: true,
            bold: true,
            color: theme.accentColor,
            fontFace: 'Arial'
          }
        } : { text: '' }
      ],
      {
        x: 1.85,
        y: 0.1,
        w: 7.5,
        h: 0.8,
        align: 'left',
        valign: 'middle'
      }
    );

    // ---------------------------------------------------------
    // LAYOUT LOGIC: IF INFOGRAPHIC / 3-BRANCH MINDMAP SLIDE
    // ---------------------------------------------------------
    if (isInfographicSlide && slideItem.bulletPoints && slideItem.bulletPoints.length >= 2) {
      const branches = slideItem.bulletPoints;
      const numCols = Math.min(branches.length, 3);
      const colWidth = (8.8 - (numCols - 1) * 0.25) / numCols;
      const startX = 0.6;
      const cardY = 1.15;
      const cardH = 3.9;

      branches.slice(0, numCols).forEach((branchText, bIdx) => {
        const xPos = startX + bIdx * (colWidth + 0.25);
        const cleanBranch = cleanTextForPptx(branchText);

        // Branch Card Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: cardY,
          w: colWidth,
          h: cardH,
          rectRadius: 0.12,
          fill: { color: theme.cardBgColor },
          line: { color: theme.accentColor, width: 1.5 },
          shadow: { type: 'outer', color: 'E2E8F0', blur: 4, offset: 2, angle: 90 }
        });

        // Branch Card Header
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: cardY,
          w: colWidth,
          h: 0.45,
          rectRadius: 0.08,
          fill: { color: bIdx === 0 ? theme.primaryColor : bIdx === 1 ? theme.accentColor : theme.secondaryColor }
        });

        slide.addText(`NHÁNH ${bIdx + 1}`, {
          x: xPos,
          y: cardY,
          w: colWidth,
          h: 0.45,
          align: 'center',
          valign: 'middle',
          fontSize: 11,
          bold: true,
          color: 'FFFFFF',
          fontFace: 'Arial'
        });

        // Branch Content
        slide.addText(cleanBranch, {
          x: xPos + 0.15,
          y: cardY + 0.55,
          w: colWidth - 0.3,
          h: cardH - 0.7,
          align: 'left',
          valign: 'top',
          fontSize: 11.5,
          color: theme.textColor,
          fontFace: 'Arial'
        });
      });
    } else {
      // ---------------------------------------------------------
      // STANDARD 1-COLUMN OR 2-COLUMN BULLET POINT CARD
      // ---------------------------------------------------------
      const contentCardH = 3.95;
      const contentCardW = 8.8;

      // Content Card Container
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.15,
        w: contentCardW,
        h: contentCardH,
        rectRadius: 0.12,
        fill: { color: theme.cardBgColor },
        line: { color: 'E2E8F0', width: 1.2 },
        shadow: { type: 'outer', color: 'F1F5F9', blur: 4, offset: 2, angle: 90 }
      });

      // Left Color Accent Pill
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.6,
        y: 1.15,
        w: 0.1,
        h: contentCardH,
        fill: { color: theme.accentColor }
      });

      // Prepare Bullet Points
      if (slideItem.bulletPoints && slideItem.bulletPoints.length > 0) {
        const textRuns: any[] = [];

        slideItem.bulletPoints.forEach((point, pIdx) => {
          const cleanPt = cleanTextForPptx(point.replace(/^[\s•\-\*]+/, ''));
          if (!cleanPt) return;

          // Check if point has a highlighted label like "Nhiệm vụ:", "Sản phẩm:", "Kết luận:", "Bước 1:"
          const labelMatch = cleanPt.match(/^([A-Za-zÀ-ỹ0-9\s]+:)(.*)$/);

          if (labelMatch) {
            textRuns.push({
              text: `• ${labelMatch[1]} `,
              options: {
                bold: true,
                color: theme.primaryColor,
                fontSize: 13,
                fontFace: 'Arial'
              }
            });
            textRuns.push({
              text: `${labelMatch[2].trim()}\n${pIdx < slideItem.bulletPoints.length - 1 ? '\n' : ''}`,
              options: {
                bold: false,
                color: theme.textColor,
                fontSize: 12.5,
                fontFace: 'Arial'
              }
            });
          } else {
            textRuns.push({
              text: `• ${cleanPt}\n${pIdx < slideItem.bulletPoints.length - 1 ? '\n' : ''}`,
              options: {
                bold: false,
                color: theme.textColor,
                fontSize: 12.5,
                fontFace: 'Arial'
              }
            });
          }
        });

        slide.addText(textRuns, {
          x: 0.9,
          y: 1.25,
          w: 8.3,
          h: contentCardH - 0.2,
          align: 'left',
          valign: 'top',
          fontFace: 'Arial'
        });
      } else {
        slide.addText(slideSubtitleClean || 'Nội dung hoạt động đang được cập nhật...', {
          x: 0.9,
          y: 1.4,
          w: 8.2,
          h: 2.0,
          fontSize: 13,
          color: theme.mutedTextColor,
          fontFace: 'Arial'
        });
      }
    }

    // ---------------------------------------------------------
    // FOOTER (School Name, Subject & Slide Number)
    // ---------------------------------------------------------
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 5.2,
      w: 8.8,
      h: 0.02,
      fill: { color: 'E2E8F0' }
    });

    slide.addText(
      `${schoolNameUpper}  •  ${subjectName.toUpperCase()} ${gradeName ? `(${gradeName})` : ''}  •  ${safeTitle}`,
      {
        x: 0.6,
        y: 5.23,
        w: 7.0,
        h: 0.3,
        fontSize: 8.5,
        color: theme.mutedTextColor,
        fontFace: 'Arial'
      }
    );

    slide.addText(`${i + 1} / ${slides.length}`, {
      x: 8.0,
      y: 5.23,
      w: 1.4,
      h: 0.3,
      align: 'right',
      fontSize: 8.5,
      bold: true,
      color: theme.primaryColor,
      fontFace: 'Arial'
    });

    // ---------------------------------------------------------
    // PRESENTER NOTES (Xem trong chế độ trình chiếu PowerPoint)
    // ---------------------------------------------------------
    const presenterNotes = cleanTextForPptx([
      `--- SLIDE ${slideItem.slideNumber || i + 1}: ${slideTitleClean} ---`,
      slideSubtitleClean ? `Mục tiêu/Tiểu đề: ${slideSubtitleClean}` : '',
      slideItem.teacherNotes ? `\n[GHI CHÚ SƯ PHẠM DÀNH CHO GIÁO VIÊN]:\n${slideItem.teacherNotes}` : '',
      slideItem.aiImagePrompt ? `\n[GỢI Ý PROMPT AI TẠO ẢNH / MINH HỌA]:\n${slideItem.aiImagePrompt}` : ''
    ].filter(Boolean).join('\n'));

    slide.addNotes(presenterNotes);
  }

  // ---------------------------------------------------------
  // GENERATE & POST-PROCESS PPTX (Bảo đảm 100% chuẩn OpenXML)
  // ---------------------------------------------------------
  // 1. Xuất dữ liệu nhị phân từ pptxgenjs
  const isNode = typeof window === 'undefined' || !window.document;
  const rawData = await pptx.write({
    outputType: isNode ? 'nodebuffer' : 'blob',
    compression: true
  });

  // 2. Nạp vào JSZip để thẩm định & sửa chữa lỗi XML
  const zip = await JSZip.loadAsync(rawData as any);

  // 3. Sửa lỗi PptxGenJS không encode ký tự đặc biệt (&, v.v.) trong docProps/app.xml
  const appXmlFile = zip.file('docProps/app.xml');
  if (appXmlFile) {
    let appXml = await appXmlFile.async('string');
    // Encode '&' inside <Company>...</Company> if unescaped
    appXml = appXml.replace(/<Company>(.*?)<\/Company>/g, (_match, p1) => {
      const escaped = p1.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
      return `<Company>${escaped}</Company>`;
    });
    zip.file('docProps/app.xml', appXml);
  }

  // 4. Quét sạch tất cả các ký tự điều khiển ASCII bất hợp pháp trong toàn bộ các file XML & rels
  const zipFileKeys = Object.keys(zip.files);
  for (const filename of zipFileKeys) {
    if (filename.endsWith('.xml') || filename.endsWith('.rels')) {
      const fileEntry = zip.file(filename);
      if (fileEntry) {
        const content = await fileEntry.async('string');
        const sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        if (sanitized !== content) {
          zip.file(filename, sanitized);
        }
      }
    }
  }

  // 5. Chuẩn hóa tên file an toàn cho cả Windows và macOS
  const fileCleanName = (safeTitle || 'BaiGiang')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim() || 'Slide_Bai_Giang';
  const downloadFileName = `Slide_BaiGiang_${fileCleanName}.pptx`;

  // 6. Kích hoạt tải file xuống an toàn
  if (!isNode) {
    const finalBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const downloadUrl = window.URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = downloadUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 250);
  }
};
