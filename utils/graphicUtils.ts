import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from '@google/genai';
import { ExtractedGraphicItem } from '../types';
import { callGeminiWithIntelligentFallback } from '../services/geminiService';

// Setup pdfjs worker dynamically to always match installed API version
if (typeof window !== 'undefined') {
  try {
    const pdfVersion = pdfjsLib.version || '6.2.108';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Cannot set pdfjs workerSrc:', e);
  }
}

/**
 * Lấy kích thước ảnh từ Data URL
 */
export const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number; aspectRatio: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width || 600;
      const height = img.naturalHeight || img.height || 400;
      resolve({
        width,
        height,
        aspectRatio: width / (height || 1)
      });
    };
    img.onerror = () => {
      resolve({ width: 600, height: 400, aspectRatio: 1.5 });
    };
    img.src = dataUrl;
  });
};

/**
 * Bóc tách tất cả các hình ảnh / đối tượng đồ họa nhúng trong tệp Word (.docx)
 */
export const extractImagesFromDocx = async (file: File): Promise<ExtractedGraphicItem[]> => {
  const graphics: ExtractedGraphicItem[] = [];
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Tìm các tệp trong thư mục word/media/
    const mediaFiles = Object.keys(zip.files).filter(path => 
      path.startsWith('word/media/') && 
      /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(path)
    );

    // Trích xuất văn bản document.xml để quét các câu chỉ dẫn hình ảnh
    let docxText = '';
    try {
      const docXmlEntry = zip.file('word/document.xml');
      if (docXmlEntry) {
        const rawXml = await docXmlEntry.async('text');
        docxText = rawXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      }
    } catch (e) {
      console.warn('Không thể đọc word/document.xml:', e);
    }

    // Tìm danh sách các chỉ dẫn hình ảnh trong file Word (VD: "Quan sát Hình 1.1", "Hình a", "Hình 1")
    const foundDirectives = docxText ? (docxText.match(/(?:quan sát\s+)?(?:các\s+)?(?:hình|hinh)\s+(?:\d+(?:\.\d+)?|[a-zA-Z]|\d+[a-zA-Z])/gi) || []) : [];

    let count = 1;
    for (const mediaPath of mediaFiles) {
      const zipEntry = zip.files[mediaPath];
      if (zipEntry && !zipEntry.dir) {
        const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png';
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                         ext === 'webp' ? 'image/webp' :
                         ext === 'gif' ? 'image/gif' :
                         ext === 'svg' ? 'image/svg+xml' : 'image/png';
        
        const base64Data = await zipEntry.async('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        const dims = await getImageDimensions(dataUrl);
        const fileNameOnly = mediaPath.split('/').pop() || `image_${count}`;

        const matchedDirective = foundDirectives[count - 1] || `Hình ${count}`;
        const figureLabel = matchedDirective.replace(/^quan\s+sát\s+/i, '').replace(/^các\s+/i, '').trim();

        graphics.push({
          id: `HINH_${count}`,
          sourceFileName: file.name,
          title: `${figureLabel || `Hình ${count}`}: Đồ họa trích từ ${file.name}`,
          caption: `Đối tượng đồ họa "${fileNameOnly}" từ tài liệu Word đính kèm`,
          figureLabel: figureLabel || `Hình ${count}`,
          matchedDirectives: [matchedDirective, `Quan sát ${figureLabel}`, figureLabel],
          dataUrl,
          mimeType,
          width: dims.width,
          height: dims.height,
          aspectRatio: dims.aspectRatio,
          origin: 'attachment_docx',
          isCleanedBackground: false,
          cleanMode: 'none',
        });
        count++;
      }
    }
  } catch (error) {
    console.error('Lỗi khi bóc tách hình ảnh từ file Word:', error);
  }
  return graphics;
};

/**
 * Render các trang của tệp PDF thành ảnh Canvas độ nét cao
 */
export const renderPdfPagesToImages = async (file: File, maxPages = 6): Promise<{ pageNumber: number; dataUrl: string; width: number; height: number }[]> => {
  const pages: { pageNumber: number; dataUrl: string; width: number; height: number }[] = [];
  try {
    const pdfVersion = pdfjsLib.version || '6.2.108';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = Math.min(pdfDoc.numPages, maxPages);

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.8 }); // Scale 1.8x for sharp diagrams

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        await page.render(renderContext as any).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        pages.push({
          pageNumber: pageNum,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });
      }
    }
  } catch (err) {
    console.error('Lỗi render PDF sang ảnh:', err);
  }
  return pages;
};

export interface DetectedIllustrationBox {
  title: string;
  figureLabel?: string; // Nhãn chuẩn hóa: "Hình 1.1", "Hình 1.2", "Hình a", "Hình b", "Hình 1", "Hình 2",...
  matchedDirectives?: string[]; // Cụm từ lệnh/chỉ dẫn phát hiện trên trang: ["Quan sát Hình 1.1", "Hình 1.1", "Quan sát hình a, b"]
  caption?: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
  suggestedContext?: string; // Gợi ý hoạt động sư phạm phù hợp
  scientificContent?: string; // Tóm tắt kiến thức / hiện tượng / cấu tạo khoa học
}

/**
 * AI Vision: Phát hiện và phân tích sư phạm chuyên sâu các vùng hình ảnh, sơ đồ, đồ thị minh họa trên trang sách giáo khoa.
 * TỰ ĐỘNG PHÁT HIỆN VÀ BÁM SÁT CÁC CÂU CHỈ DẪN SGK: "Quan sát hình a, b, c", "Quan sát hình 1, 2, 3", "Quan sát hình 1.1, 1.2", "Dựa vào hình X"...
 */
export const detectIllustrationsWithGemini = async (
  dataUrl: string, 
  userApiKey?: string
): Promise<DetectedIllustrationBox[]> => {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
  if (!apiKey) return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const mimeType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const prompt = `Bạn là chuyên gia thẩm định sư phạm và phân tích sách giáo khoa / tài liệu dạy học theo Chương trình GDPT mới.
Hãy quan sát kỹ bức ảnh trang sách giáo khoa / tài liệu học tập này.

NHIỆM VỤ ĐẶC BIỆT CỦA BẠN (QUÉT CHỈ DẪN & BÓC TÁCH VÙNG HÌNH ẢNH TƯƠNG ỨNG):
1. QUÉT TÌM CÁC CÂU LỆNH / CHỈ DẪN QUAN SÁT TRÊN TRANG SÁCH:
   - Phát hiện mọi câu/đoạn văn bản chỉ dẫn học sinh như:
     * "Quan sát hình a, b, c...", "Quan sát các hình a, b..."
     * "Quan sát hình 1, 2, 3...", "Quan sát hình 1, hình 2..."
     * "Quan sát hình 1.1, hình 1.2...", "Dựa vào hình 1.1...", "Từ hình 1.2 hãy..."
     * "Xem hình...", "Hãy chỉ ra trên hình...", "Hình a: ...", "Hình 1: ..."
2. KHOANH VÙNG CHÍNH XÁC (box_2d) CHO TỪNG ĐỐI TƯỢNG HÌNH ẢNH / SƠ ĐỒ / ĐỒ THỊ TƯƠNG ỨNG VỚI CÂU CHỈ DẪN:
   - Nếu câu lệnh là "Quan sát hình a, b, c": Hãy bóc tách riêng từng hình con: Hình a, Hình b, Hình c (mỗi hình 1 box_2d riêng).
   - Nếu trang có các hình độc lập (Hình 1.1, Hình 1.2, Hình 1, Hình 2...): Bóc tách riêng từng hình.
   - Bỏ qua các đoạn văn bản dài thông thường, khung box_2d ôm sát vùng hình vẽ + chú giải/tiêu đề đi liền ngay dưới hình.
3. VỚI MỖI HÌNH ẢNH / SƠ ĐỒ, XÁC ĐỊNH:
   - "figureLabel": Nhãn hình chuẩn xác (Ví dụ: "Hình 1.1", "Hình 1.2", "Hình a", "Hình b", "Hình 1", "Hình 2", "Hình 1a").
   - "matchedDirectives": Mảng các cụm từ lệnh chỉ dẫn có trên trang gắn với hình này (Ví dụ: ["Quan sát Hình 1.1", "Hình 1.1", "Dựa vào Hình 1.1"] hoặc ["Quan sát các Hình a, b", "Hình a"]).
   - "title": Đặt tên chuẩn xác theo SGK (Ví dụ: "Hình 1.1: Sơ đồ cấu tạo tế bào nhân thực", "Hình a: Tế bào động vật").
   - "caption": Mô tả chi tiết nội dung khoa học thể hiện trong hình ảnh (các chi tiết, bộ phận, số liệu, hiện tượng, ký hiệu trên hình).
   - "suggestedContext": Xác định rõ hình ảnh này phục vụ cho hoạt động nào (Khởi động / Khám phá mục... / Luyện tập / Vận dụng).
   - "scientificContent": Tóm tắt 1-2 câu kiến thức trọng tâm học sinh cần rút ra hoặc phân tích khi quan sát hình ảnh này.
   - "box_2d": [ymin, xmin, ymax, xmax] theo hệ tọa độ chuẩn hóa từ 0 đến 1000.

HÃY TRẢ VỀ DUY NHẤT MỘT MẢNG JSON HỢP LỆ THEO CẤU TRÚC:
[
  {
    "figureLabel": "Hình 1.1",
    "matchedDirectives": ["Quan sát Hình 1.1", "Hình 1.1"],
    "title": "Hình 1.1: Tên hình chuẩn xác",
    "caption": "Mô tả chi tiết nội dung khoa học của hình",
    "suggestedContext": "Gợi ý hoạt động sư phạm phù hợp",
    "scientificContent": "Kiến thức trọng tâm từ hình",
    "box_2d": [ymin, xmin, ymax, xmax]
  }
]
Lưu ý: Trả về định dạng JSON thuần túy, không bọc thêm văn bản giải thích.`;

    const responseText = await callGeminiWithIntelligentFallback(
      ai,
      async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt }
            ]
          },
          config: {
            temperature: 0.2,
          }
        });
        return response.text || '';
      },
      { taskName: 'Nhận diện hình ảnh SGK (Vision)' }
    );
    const cleanJson = responseText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const jsonMatch = cleanJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as DetectedIllustrationBox[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(item => 
          Array.isArray(item.box_2d) && 
          item.box_2d.length === 4 &&
          item.box_2d[2] > item.box_2d[0] &&
          item.box_2d[3] > item.box_2d[1]
        );
      }
    }
  } catch (err) {
    console.warn('Lỗi nhận diện hình ảnh bằng Gemini Vision:', err);
  }
  return [];
};

/**
 * Thuật toán phân tích đồ họa cục bộ trên Canvas (Smart Visual Segmentation Fallback)
 * Tự động tìm các vùng ảnh/sơ đồ có mật độ màu sắc, nét vẽ nổi bật trên trang tài liệu
 */
export const detectIllustrationsByLocalSegmentation = (
  imgElement: HTMLImageElement
): DetectedIllustrationBox[] => {
  const boxes: DetectedIllustrationBox[] = [];
  try {
    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;
    if (width < 50 || height < 50) return [];

    // Phân tích ma trận lưới 20x20
    const canvas = document.createElement('canvas');
    const cols = 40;
    const rows = 40;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(imgElement, 0, 0, cols, rows);
    const imgData = ctx.getImageData(0, 0, cols, rows).data;

    // Tìm các ô có màu sắc hoặc độ tương phản cao (khác màu giấy trắng)
    const grid: boolean[][] = [];
    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const isColoredOrDark = (brightness < 225) || ((max - min) > 25);
        grid[y][x] = isColoredOrDark;
      }
    }

    // Nhóm các cụm ô liền kề (Connected component analysis)
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    let clusterIdx = 1;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x] && !visited[y][x]) {
          // BFS tìm cụm
          let minX = x, maxX = x, minY = y, maxY = y;
          let count = 0;
          const queue: [number, number][] = [[x, y]];
          visited[y][x] = true;

          while (queue.length > 0) {
            const [cx, cy] = queue.shift()!;
            count++;
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            const neighbors: [number, number][] = [
              [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1],
              [cx + 1, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
              }
            }
          }

          const boxWidthFrac = (maxX - minX + 1) / cols;
          const boxHeightFrac = (maxY - minY + 1) / rows;
          // Chỉ lấy các vùng có kích thước đủ lớn để là hình ảnh (không phải 1 chữ cái đơn lẻ)
          if (count >= 6 && boxWidthFrac > 0.12 && boxHeightFrac > 0.08) {
            const ymin = Math.max(0, Math.floor((minY / rows) * 1000) - 15);
            const xmin = Math.max(0, Math.floor((minX / cols) * 1000) - 15);
            const ymax = Math.min(1000, Math.ceil(((maxY + 1) / rows) * 1000) + 15);
            const xmax = Math.min(1000, Math.ceil(((maxX + 1) / cols) * 1000) + 15);

            boxes.push({
              title: `Hình minh họa ${clusterIdx}`,
              caption: `Vùng đồ họa bóc tách tự động`,
              box_2d: [ymin, xmin, ymax, xmax]
            });
            clusterIdx++;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Lỗi phân tích đồ họa cục bộ:', err);
  }
  return boxes;
};

/**
 * Cắt và bóc tách các hình minh họa từ một ảnh trang sách / PDF
 */
export const extractIllustrationsFromPageImage = async (
  dataUrl: string,
  sourceFileName: string,
  pageNumber?: number,
  userApiKey?: string
): Promise<ExtractedGraphicItem[]> => {
  const results: ExtractedGraphicItem[] = [];

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });

    const realWidth = img.naturalWidth || img.width;
    const realHeight = img.naturalHeight || img.height;

    // 1. Thử nhận diện bằng AI Vision
    let detectedBoxes = await detectIllustrationsWithGemini(dataUrl, userApiKey);

    // 2. Nếu AI Vision không trả về hoặc không có API key, dùng thuật toán phân tích đồ họa cục bộ
    if (!detectedBoxes || detectedBoxes.length === 0) {
      detectedBoxes = detectIllustrationsByLocalSegmentation(img);
    }

    // 3. Nếu phát hiện được 1 hoặc nhiều vùng hình ảnh, cắt riêng từng vùng
    if (detectedBoxes.length > 0) {
      let figureIdx = 1;
      for (const box of detectedBoxes) {
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        
        // Chuyển tọa độ 0-1000 sang pixel thực tế kèm margin
        const marginX = Math.round(realWidth * 0.01);
        const marginY = Math.round(realHeight * 0.01);

        const cropX = Math.max(0, Math.round((xmin / 1000) * realWidth) - marginX);
        const cropY = Math.max(0, Math.round((ymin / 1000) * realHeight) - marginY);
        const cropW = Math.min(realWidth - cropX, Math.round(((xmax - xmin) / 1000) * realWidth) + marginX * 2);
        const cropH = Math.min(realHeight - cropY, Math.round(((ymax - ymin) / 1000) * realHeight) + marginY * 2);

        if (cropW > 40 && cropH > 40) {
          const croppedUrl = await cropImageByBounds(dataUrl, {
            x: cropX,
            y: cropY,
            width: cropW,
            height: cropH,
          });

          const dims = await getImageDimensions(croppedUrl);
          const pageSuffix = pageNumber ? ` (Trang ${pageNumber})` : '';

          const detailedCaption = [
            box.caption,
            box.scientificContent ? `[Kiến thức trọng tâm: ${box.scientificContent}]` : ''
          ].filter(Boolean).join(' ');

          const figureLabel = box.figureLabel || (box.title ? box.title.split(/[:\-\–]/)[0].trim() : `Hình ${figureIdx}`);
          const matchedDirectives = box.matchedDirectives && box.matchedDirectives.length > 0 
            ? box.matchedDirectives 
            : [figureLabel, `Quan sát ${figureLabel}`];

          results.push({
            id: `diag_${Date.now()}_${figureIdx}_${Math.random().toString(36).substring(2, 6)}`,
            sourceFileName,
            title: box.title ? `${box.title}${pageSuffix}` : `Hình ${figureIdx}: Minh họa từ ${sourceFileName}${pageSuffix}`,
            caption: detailedCaption || `Hình minh họa trích xuất từ ${sourceFileName}${pageSuffix}`,
            figureLabel,
            matchedDirectives,
            suggestedContext: box.suggestedContext,
            dataUrl: croppedUrl,
            mimeType: 'image/png',
            width: dims.width,
            height: dims.height,
            aspectRatio: dims.aspectRatio,
            origin: sourceFileName.toLowerCase().endsWith('.pdf') ? 'attachment_pdf' : 'attachment_image',
            isCleanedBackground: false,
            cleanMode: 'none',
          });
          figureIdx++;
        }
      }
    }

    // 4. Nếu không tách được vùng con (hoặc đây là ảnh đơn chụp sát một hình vẽ), giữ nguyên ảnh này
    if (results.length === 0) {
      const dims = await getImageDimensions(dataUrl);
      const cleanName = sourceFileName.replace(/\.[^/.]+$/, "");
      const pageSuffix = pageNumber ? ` - Trang ${pageNumber}` : '';

      let singleTitle = `Hình minh họa: ${cleanName}${pageSuffix}`;
      let singleCaption = `Hình ảnh tài liệu "${sourceFileName}"${pageSuffix}`;
      let singleContext: string | undefined;

      // Phân tích nhanh nội dung của ảnh đơn bằng Gemini Vision nếu có API Key
      const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          const mimeType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
          const singlePrompt = `Hãy quan sát hình ảnh học tập/sơ đồ/trang sách này và trả về JSON:
{
  "title": "Tên hình ảnh chuẩn xác theo SGK (ví dụ: Hình 1: ...)",
  "caption": "Mô tả chi tiết nội dung khoa học thể hiện trên hình",
  "suggestedContext": "Hoạt động sư phạm nên chèn (Khởi động / Khám phá mục... / Luyện tập / Vận dụng)"
}`;
          const resText = await callGeminiWithIntelligentFallback(
            ai,
            async (modelName) => {
              const res = await ai.models.generateContent({
                model: modelName,
                contents: {
                  parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: singlePrompt }
                  ]
                },
                config: { temperature: 0.2 }
              });
              return res.text || '';
            },
            { taskName: 'Phân tích hình đơn' }
          );
          const clean = resText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
          const match = clean.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.title) singleTitle = `${parsed.title}${pageSuffix}`;
            if (parsed.caption) singleCaption = parsed.caption;
            if (parsed.suggestedContext) singleContext = parsed.suggestedContext;
          }
        } catch (e) {
          console.warn('Lỗi phân tích hình đơn:', e);
        }
      }

      results.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sourceFileName,
        title: singleTitle,
        caption: singleCaption,
        suggestedContext: singleContext,
        dataUrl,
        mimeType: 'image/png',
        width: dims.width,
        height: dims.height,
        aspectRatio: dims.aspectRatio,
        origin: sourceFileName.toLowerCase().endsWith('.pdf') ? 'attachment_pdf' : 'attachment_image',
        isCleanedBackground: false,
        cleanMode: 'none',
      });
    }
  } catch (err) {
    console.error('Lỗi khi bóc tách hình ảnh từ trang:', err);
  }

  return results;
};

/**
 * Trích xuất toàn bộ hình ảnh và các vùng sơ đồ từ file PDF hoặc Image đính kèm
 */
export const extractGraphicsFromAttachedFile = async (
  file: File,
  userApiKey?: string
): Promise<ExtractedGraphicItem[]> => {
  const graphics: ExtractedGraphicItem[] = [];
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
    return extractImagesFromDocx(file);
  }

  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const renderedPages = await renderPdfPagesToImages(file, 6);
      for (const page of renderedPages) {
        const pageGraphics = await extractIllustrationsFromPageImage(
          page.dataUrl,
          file.name,
          page.pageNumber,
          userApiKey
        );
        graphics.push(...pageGraphics);
      }
    } catch (err) {
      console.error('Lỗi xử lý file PDF để bóc tách đồ họa:', err);
    }
    return graphics;
  }

  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileName)) {
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result as string);
        reader.onerror = (err) => rej(err);
        reader.readAsDataURL(file);
      });

      const extracted = await extractIllustrationsFromPageImage(
        dataUrl,
        file.name,
        undefined,
        userApiKey
      );
      graphics.push(...extracted);
    } catch (err) {
      console.error('Lỗi xử lý file hình ảnh để bóc tách đồ họa:', err);
    }
    return graphics;
  }

  return graphics;
};

/**
 * Bóc tách đối tượng đồ họa từ tệp hình ảnh đơn giản (Fallback)
 */
export const extractGraphicFromImageFile = async (file: File): Promise<ExtractedGraphicItem> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const dims = await getImageDimensions(dataUrl);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");

      resolve({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sourceFileName: file.name,
        title: `Hình minh họa: ${cleanName}`,
        caption: `Hình ảnh tài liệu "${file.name}"`,
        dataUrl,
        mimeType: file.type || 'image/png',
        width: dims.width,
        height: dims.height,
        aspectRatio: dims.aspectRatio,
        origin: 'attachment_image',
        isCleanedBackground: false,
        cleanMode: 'none',
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Làm sạch nền ảnh (Chuyển nền đục, xám, ố vàng sang Nền trắng tinh khiết hoặc Nền trong suốt, tăng tương phản)
 */
export const cleanImageBackground = (
  dataUrl: string, 
  mode: 'white' | 'transparent' | 'high_contrast' | 'original' = 'white',
  threshold: number = 220
): Promise<string> => {
  return new Promise((resolve) => {
    if (mode === 'original') {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        const isNearWhite = brightness > threshold || (brightness > 190 && delta < 25);

        if (mode === 'white') {
          if (isNearWhite) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          } else {
            if (brightness < 120) {
              data[i] = Math.max(0, r - 30);
              data[i + 1] = Math.max(0, g - 30);
              data[i + 2] = Math.max(0, b - 30);
            }
          }
        } else if (mode === 'transparent') {
          if (isNearWhite) {
            data[i + 3] = 0;
          }
        } else if (mode === 'high_contrast') {
          if (brightness > 185) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else if (brightness < 130) {
            data[i] = Math.max(0, Math.floor(r * 0.6));
            data[i + 1] = Math.max(0, Math.floor(g * 0.6));
            data[i + 2] = Math.max(0, Math.floor(b * 0.6));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Cắt ảnh theo vùng chọn (Crop)
 */
export const cropImageByBounds = (
  dataUrl: string,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = Math.max(10, Math.round(cropArea.width));
      const targetHeight = Math.max(10, Math.round(cropArea.height));
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      // Fill white background to avoid black gaps
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.drawImage(
        img,
        Math.max(0, Math.round(cropArea.x)),
        Math.max(0, Math.round(cropArea.y)),
        Math.round(cropArea.width),
        Math.round(cropArea.height),
        0,
        0,
        targetWidth,
        targetHeight
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Tạo URL tìm kiếm hình ảnh minh họa trên Google theo chủ đề bài học
 */
export const getGoogleImageSearchUrl = (
  lessonTitle: string,
  subject: string,
  grade: string,
  customQuery?: string
): string => {
  const baseQuery = customQuery 
    ? `${customQuery} ${subject} ${grade}` 
    : `hình ảnh sơ đồ minh họa ${subject} ${grade} ${lessonTitle}`;
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(baseQuery.trim())}`;
};

/**
 * Chuyển Base64 Data URL thành Uint8Array cho docx ImageRun an toàn
 */
export const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
  if (!dataUrl) return new Uint8Array(0);
  try {
    const base64Index = dataUrl.indexOf(';base64,');
    let base64 = dataUrl;
    if (base64Index !== -1) {
      base64 = dataUrl.substring(base64Index + 8);
    }
    base64 = base64.replace(/[\r\n\s]/g, '');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error('Error converting dataUrl to Uint8Array:', err);
    return new Uint8Array(0);
  }
};

/**
 * Tìm đối tượng đồ họa tương ứng từ chuỗi nhận dạng hoặc tiêu đề
 */
export const findGraphicItem = (
  sourceStr?: string, 
  titleStr?: string, 
  graphics: ExtractedGraphicItem[] = []
): ExtractedGraphicItem | undefined => {
  if (!graphics || graphics.length === 0) return undefined;
  
  const cleanSource = (sourceStr || '').trim();
  const cleanTitle = (titleStr || '').trim();
  const combined = `${cleanSource} ${cleanTitle}`.toLowerCase();

  // 1. Khớp chính xác ID (hoặc không phân biệt hoa thường)
  if (cleanSource) {
    const directMatch = graphics.find(g => 
      g.id === cleanSource || 
      g.id.toLowerCase() === cleanSource.toLowerCase()
    );
    if (directMatch) return directMatch;
  }

  // 2. Khớp trực tiếp mã HINH_X hoặc HINH X (chỉ mục 1-based truyền cho AI trong prompt)
  const hinhNumInSource = cleanSource.match(/(?:hinh|hình|h|img|image|graphic|ảnh|diag)[_\s\-]*(\d+)/i);
  if (hinhNumInSource) {
    const idx = parseInt(hinhNumInSource[1], 10);
    if (idx >= 1 && idx <= graphics.length) {
      return graphics[idx - 1];
    }
  }

  const hinhNumInTitle = cleanTitle.match(/(?:hinh|hình|h|img|image|graphic|ảnh|diag)[_\s\-]*(\d+)/i);
  if (hinhNumInTitle) {
    const idx = parseInt(hinhNumInTitle[1], 10);
    if (idx >= 1 && idx <= graphics.length) {
      return graphics[idx - 1];
    }
  }

  // 3. Khớp theo chữ cái thứ tự: Hình a -> 0, Hình b -> 1, Hình c -> 2...
  const letterMatch = cleanSource.match(/(?:hinh|hình|h|img|image|graphic|ảnh)[_\s\-]*([a-zA-Z])\b/i)
    || cleanTitle.match(/(?:hinh|hình|h|img|image|graphic|ảnh)[_\s\-]*([a-zA-Z])\b/i);
  if (letterMatch) {
    const letter = letterMatch[1].toLowerCase();
    const charCode = letter.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1
    if (charCode >= 0 && charCode < graphics.length) {
      return graphics[charCode];
    }
  }

  // 4. Khớp theo Figure Label chuẩn hóa (VD: "Hình 1.1", "Hình 1.2", "Hình a", "Hình b", "Hình 1", "Hình 2")
  for (const g of graphics) {
    if (g.figureLabel) {
      const fl = g.figureLabel.toLowerCase().trim();
      if (fl && (combined.includes(fl) || cleanSource.toLowerCase() === fl || cleanTitle.toLowerCase() === fl)) {
        return g;
      }
    }
  }

  // 5. Khớp theo các cụm từ chỉ dẫn SGK (matchedDirectives: "Quan sát Hình 1.1", "Quan sát các hình a, b"...)
  for (const g of graphics) {
    if (g.matchedDirectives && g.matchedDirectives.length > 0) {
      for (const d of g.matchedDirectives) {
        const dl = d.toLowerCase().trim();
        if (dl && (combined.includes(dl) || dl.includes(combined))) {
          return g;
        }
      }
    }
  }

  // 6. Khớp dạng mã số thập phân đặc thù (VD: "1.1", "1.2", "2.1")
  const dotNumMatch = combined.match(/\b(\d+\.\d+)\b/);
  if (dotNumMatch) {
    const targetDotNum = dotNumMatch[1];
    const dotGraphic = graphics.find(g => 
      (g.figureLabel && g.figureLabel.includes(targetDotNum)) ||
      g.title.includes(targetDotNum) ||
      g.id.includes(targetDotNum)
    );
    if (dotGraphic) return dotGraphic;
  }

  // 7. Khớp chuẩn hóa loại bỏ ký tự đặc biệt (HINH_1, docx_img_1, img_1...)
  if (cleanSource) {
    const normSource = cleanSource.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normMatch = graphics.find(g => {
      const normId = g.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normId === normSource || normId.includes(normSource) || normSource.includes(normId);
    });
    if (normMatch) return normMatch;
  }

  // 8. Khớp số thứ tự thuần túy (VD: #1, [1], 1 -> ảnh thứ 1)
  const rawNumMatch = cleanSource.match(/\b(\d+)\b/) || cleanTitle.match(/\b(\d+)\b/);
  if (rawNumMatch) {
    const num = parseInt(rawNumMatch[1], 10);
    if (num >= 1 && num <= graphics.length) {
      return graphics[num - 1];
    }
  }

  // 9. Khớp theo tiêu đề hình ảnh
  if (cleanTitle) {
    const titleMatch = graphics.find(g => 
      g.title.toLowerCase().includes(cleanTitle.toLowerCase()) || 
      cleanTitle.toLowerCase().includes(g.title.toLowerCase())
    );
    if (titleMatch) return titleMatch;
  }

  // 10. Nếu chỉ có 1 hình duy nhất trong bài và chuỗi có chứa từ khóa liên quan đến hình ảnh
  if (graphics.length === 1 && /(hình|hinh|ảnh|anh|đồ họa|graphic|img|image|sơ đồ|so do|bản đồ)/i.test(combined)) {
    return graphics[0];
  }

  return undefined;
};

export interface ParsedGraphicRef {
  isGraphic: boolean;
  title: string;
  sourceId: string;
  graphic?: ExtractedGraphicItem;
  dataUrl?: string;
}

/**
 * Phân tích và nhận diện tất cả các dạng định dạng chèn ảnh (Markdown, link, bracket tag, inline)
 */
export const parseGraphicReference = (
  text: string, 
  extractedGraphics: ExtractedGraphicItem[] = []
): ParsedGraphicRef | null => {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Thẻ Markdown ảnh chuẩn: ![Tiêu đề](ID_OR_DATAURL)
  const mdImgMatch = trimmed.match(/^[-*•\s]*(?:\*\*)?!\[(.*?)\]\((.*?)\)(?:\*\*)?$/);
  if (mdImgMatch) {
    const title = mdImgMatch[1].trim();
    const sourceId = mdImgMatch[2].trim();
    const graphic = findGraphicItem(sourceId, title, extractedGraphics);
    const dataUrl = graphic ? graphic.dataUrl : (sourceId.startsWith('data:image/') ? sourceId : undefined);
    return { isGraphic: true, title: title || graphic?.title || 'Hình minh họa', sourceId, graphic, dataUrl };
  }

  // 2. Thẻ Markdown link thông thường: [Tiêu đề](ID_OR_DATAURL) (khi AI quên dấu !)
  const mdLinkMatch = trimmed.match(/^[-*•\s]*(?:\*\*)?\[(.*?)\]\((.*?)\)(?:\*\*)?$/);
  if (mdLinkMatch) {
    const title = mdLinkMatch[1].trim();
    const sourceId = mdLinkMatch[2].trim();
    const graphic = findGraphicItem(sourceId, title, extractedGraphics);
    if (graphic || sourceId.startsWith('data:image/') || /(HINH_|docx_img_|diag_|img_|graphic)/i.test(sourceId) || /(hình|ảnh|đồ họa|sơ đồ)/i.test(title)) {
      const dataUrl = graphic ? graphic.dataUrl : (sourceId.startsWith('data:image/') ? sourceId : undefined);
      return { isGraphic: true, title: title || graphic?.title || 'Hình minh họa', sourceId, graphic, dataUrl };
    }
  }

  // 3. Thẻ vuông định danh: [ID: HINH_1], [Hình ảnh: HINH_1], [Link đồ họa: HINH_1], [Đồ họa: HINH_1]
  const bracketMatch = trimmed.match(/^[-*•\s]*\[(?:ID|Hình ảnh|Đồ họa|Link đồ họa|Đối tượng đồ họa|Hình|Image|Graphic):\s*(.*?)\]$/i);
  if (bracketMatch) {
    const rawVal = bracketMatch[1].trim();
    const graphic = findGraphicItem(rawVal, rawVal, extractedGraphics);
    if (graphic) {
      return { isGraphic: true, title: graphic.title, sourceId: graphic.id, graphic, dataUrl: graphic.dataUrl };
    }
  }

  // 4. Mã ID đứng riêng lẻ trên 1 dòng: HINH_1, docx_img_...
  if (/^(?:HINH_\d+|docx_img_\w+|diag_\w+|img_\w+)$/i.test(trimmed)) {
    const graphic = findGraphicItem(trimmed, '', extractedGraphics);
    if (graphic) {
      return { isGraphic: true, title: graphic.title, sourceId: graphic.id, graphic, dataUrl: graphic.dataUrl };
    }
  }

  // 5. Thẻ ảnh nhúng trong dòng văn bản (inline image)
  const inlineImgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
  if (inlineImgMatch) {
    const title = inlineImgMatch[1].trim();
    const sourceId = inlineImgMatch[2].trim();
    const graphic = findGraphicItem(sourceId, title, extractedGraphics);
    const dataUrl = graphic ? graphic.dataUrl : (sourceId.startsWith('data:image/') ? sourceId : undefined);
    return { isGraphic: true, title: title || graphic?.title || 'Hình minh họa', sourceId, graphic, dataUrl };
  }

  // 6. Thẻ link chứa ID ảnh trong dòng văn bản
  const inlineLinkMatch = trimmed.match(/\[(.*?)\]\((.*?)\)/);
  if (inlineLinkMatch) {
    const title = inlineLinkMatch[1].trim();
    const sourceId = inlineLinkMatch[2].trim();
    const graphic = findGraphicItem(sourceId, title, extractedGraphics);
    if (graphic || /(HINH_|docx_img_|diag_|img_)/i.test(sourceId) || /(hình|ảnh|đồ họa|sơ đồ)/i.test(title)) {
      const dataUrl = graphic ? graphic.dataUrl : (sourceId.startsWith('data:image/') ? sourceId : undefined);
      return { isGraphic: true, title: title || graphic?.title || 'Hình minh họa', sourceId, graphic, dataUrl };
    }
  }

  return null;
};

export type GraphicContentSegment = {
  type: 'graphic';
  title: string;
  sourceId: string;
  graphic?: ExtractedGraphicItem;
  dataUrl?: string;
  caption?: string;
  aspectRatio?: number;
};

export type TextContentSegment = {
  type: 'text';
  content: string;
};

export type LineContentSegment = GraphicContentSegment | TextContentSegment;

/**
 * Phân tích và bóc tách một dòng văn bản thành các phân đoạn Text và Graphic
 * Giúp cả chế độ xem trên Web và File Word xuất ra đồng bộ 100% không bị mất chữ hay sót ảnh.
 */
export const parseLineContentSegments = (
  rawText: string,
  extractedGraphics: ExtractedGraphicItem[] = []
): LineContentSegment[] => {
  if (!rawText) return [];
  const text = rawText.trim();
  if (!text) return [];

  // Match Markdown image tags: ![alt](src) or [alt](src) where src or alt matches graphic or [ID: xxx]
  const imgRegex = /!\[(.*?)\]\((.*?)\)|\[((?:Hình|Ảnh|Đồ họa|HINH_|docx_img_|img_|diag_).*?)\]\((.*?)\)|\[(?:ID|Hình ảnh|Đồ họa|Link đồ họa|Đối tượng đồ họa|Hình|Image|Graphic):\s*(.*?)\]/gi;

  const segments: LineContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = imgRegex.lastIndex;

    // Text before match
    if (matchStart > lastIndex) {
      const precedingText = text.substring(lastIndex, matchStart);
      if (precedingText.trim().length > 0) {
        segments.push({ type: 'text', content: precedingText });
      }
    }

    let title = '';
    let sourceId = '';

    if (match[1] !== undefined && match[2] !== undefined) {
      // ![title](sourceId)
      title = match[1].trim();
      sourceId = match[2].trim();
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // [title](sourceId)
      title = match[3].trim();
      sourceId = match[4].trim();
    } else if (match[5] !== undefined) {
      // [ID: sourceId]
      sourceId = match[5].trim();
      title = sourceId;
    }

    const graphic = findGraphicItem(sourceId, title, extractedGraphics);
    const dataUrl = graphic ? graphic.dataUrl : (sourceId.startsWith('data:image/') ? sourceId : undefined);
    const displayTitle = title || graphic?.title || 'Hình minh họa';
    const displayCaption = graphic?.caption;
    const aspectRatio = graphic?.aspectRatio;

    segments.push({
      type: 'graphic',
      title: displayTitle,
      sourceId,
      graphic,
      dataUrl,
      caption: displayCaption,
      aspectRatio
    });

    lastIndex = matchEnd;
  }

  // Trailing text
  if (lastIndex < text.length) {
    const trailingText = text.substring(lastIndex);
    if (trailingText.trim().length > 0) {
      segments.push({ type: 'text', content: trailingText });
    }
  }

  // Nếu không khớp regex nào, kiểm tra xem toàn bộ dòng có phải là 1 mã hình ảnh độc lập hay không
  if (segments.length === 0) {
    const standaloneRef = parseGraphicReference(text, extractedGraphics);
    if (standaloneRef) {
      segments.push({
        type: 'graphic',
        title: standaloneRef.title,
        sourceId: standaloneRef.sourceId,
        graphic: standaloneRef.graphic,
        dataUrl: standaloneRef.dataUrl || standaloneRef.graphic?.dataUrl,
        caption: standaloneRef.graphic?.caption,
        aspectRatio: standaloneRef.graphic?.aspectRatio
      });
    } else {
      segments.push({ type: 'text', content: text });
    }
  }

  return segments;
};
