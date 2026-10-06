
import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { LessonPlanFormData, TeacherInfo, SlideItem } from '../types';
import { AI_FRAMEWORK_BY_GRADE } from '../data/aiEducationFramework';
import { DIGITAL_COMPETENCY_FRAMEWORK, getIndicatorsByLevel, getDigitalLevelByGrade } from '../data/digitalCompetencyFramework';

const NLS_DESCRIPTIONS: Record<string, string> = {
  "CB1": "Cơ bản 1 - Dành riêng cho Lớp 1, Lớp 2, Lớp 3 (Cấp Tiểu học)",
  "CB2": "Cơ bản 2 - Dành riêng cho Lớp 4, Lớp 5 (Cấp Tiểu học)",
  "TC1": "Trung cấp 1 - Dành riêng cho Lớp 6, Lớp 7 (Cấp THCS)",
  "TC2": "Trung cấp 2 - Dành riêng cho Lớp 8, Lớp 9 (Cấp THCS)",
  "NC1": "Nâng cao 1 - Dành riêng cho Lớp 10, Lớp 11, Lớp 12 (Cấp THPT)"
};

const getNLSLevel = (grade: string): 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1' => {
  return getDigitalLevelByGrade(grade).code;
};

const getAllInvalidNLSLevels = (currentLevel: string): string[] => {
  const all = ["CB1", "CB2", "TC1", "TC2", "NC1"];
  return all.filter(l => l !== currentLevel);
};

const getNLSIndicatorsForLevel = (level: 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1', subject: string): string => {
  const indicators = getIndicatorsByLevel(level);
  if (indicators.length === 0) return '';
  
  const formatted = indicators.map(item => `- [${item.code}] (${item.competencyName}): ${item.requirement}`).join('\n');
  return `* DANH MỤC MÃ CHỈ BÁO CHUẨN CẤP ĐỘ [${level}] (THEO CV 3456/BGDĐT-GDPT & TT 02/2025/TT-BGDĐT - BẮT BUỘC DÙNG MÃ CHỨA ${level}):\n${formatted}`;
};

const buildPrompt = (formData: LessonPlanFormData, teacherInfo?: TeacherInfo): string => {
  const nlsLevel = getNLSLevel(formData.grade);
  const nlsDesc = NLS_DESCRIPTIONS[nlsLevel];
  const invalidLevels = getAllInvalidNLSLevels(nlsLevel);
  const levelIndicators = getNLSIndicatorsForLevel(nlsLevel, formData.subject);

  const levelStr = Array.isArray(teacherInfo?.schoolLevel)
    ? teacherInfo.schoolLevel.join('-')
    : (teacherInfo?.schoolLevel || '');

  const teacherHeader = teacherInfo ? `
THÔNG TIN TRƯỜNG VÀ GIÁO VIÊN SOẠN:
- Cơ quan chủ quản: ${teacherInfo.managingAgency}
- Trường: ${teacherInfo.schoolName} ${levelStr ? `(${levelStr})` : ''}
- Giáo viên thực hiện: ${teacherInfo.teacherName}
- Tổ chuyên môn: ${teacherInfo.department}
  ` : '';

  let digitalCompetenceInstruction = '';
  if (formData.includeDigitalCompetence) {
    digitalCompetenceInstruction = `
========================================================================
TÍCH HỢP NĂNG LỰC SỐ (THEO THÔNG TƯ 02/2025/TT-BGDĐT & CÔNG VĂN 3456/BGDĐT-CNTT)
========================================================================
Đối tượng học sinh: LỚP ${formData.grade}
MỨC ĐỘ NĂNG LỰC SỐ QUY CHUẨN DUY NHẤT ĐƯỢC PHÉP DÙNG: [${nlsLevel}] (${nlsDesc})

⚠️ QUY TẮC BẮT BUỘC VỀ ĐÚNG MÃ CẤP ĐỘ THEO LỚP HỌC (LỚP ${formData.grade} -> BẮT BUỘC DÙNG CẤP ĐỘ ${nlsLevel}):
1. TẤT CẢ các mã chỉ báo Năng lực số xuất hiện trong Mục I (Mục tiêu) và Mục III (Tiến trình dạy học) BẮT BUỘC PHẢI CHỨA CẤP ĐỘ [${nlsLevel}] (dạng [X.Y.${nlsLevel}z], ví dụ: [1.1.${nlsLevel}a], [2.2.${nlsLevel}b]...).
2. NGHIÊM CẤM VI PHẠM SAI CẤP ĐỘ: TUYỆT ĐỐI KHÔNG được sử dụng các mã cấp độ khác (${invalidLevels.map(l => `[${l}]`).join(', ')}) cho Lớp ${formData.grade}.
   - VÍ DỤ CỤ THỂ ĐỂ TRÁNH LỖI:
     + Lớp 8 và Lớp 9 BẮT BUỘC dùng mã cấp độ TC2 (ví dụ: [1.1.TC2a], [2.2.TC2b], [6.1.TC2b], [6.2.TC2a]). TUYỆT ĐỐI KHÔNG dùng mã TC1 như [1.1.TC1a] hay [6.1.TC1b] (vì TC1 chỉ dành riêng cho Lớp 6, 7). Nếu dùng TC1 cho Lớp 8, 9 là SAI HOÀN TOÀN quy định của Bộ GD&ĐT!
     + Lớp 6 và Lớp 7 BẮT BUỘC dùng mã cấp độ TC1 (ví dụ: [1.1.TC1a], [2.1.TC1a], [6.1.TC1b], [6.2.TC1a]). TUYỆT ĐỐI KHÔNG dùng TC2, CB1, CB2, NC1.
     + Lớp 1, 2, 3 BẮT BUỘC dùng mã cấp độ CB1 (ví dụ: [1.1.CB1a], [6.2.CB1a], [6.3.CB1a]). LƯU Ý: Theo Phụ lục CV 3456/BGDĐT-GDPT, Năng lực 6.1 ở Bậc 1 để trống, KHÔNG CÓ mã 6.1.CB1a/b. TUYỆT ĐỐI KHÔNG dùng CB2, TC1, TC2, NC1.
     + Lớp 4, 5 BẮT BUỘC dùng mã cấp độ CB2 (ví dụ: [1.1.CB2a], [6.1.CB2a], [6.2.CB2b]). TUYỆT ĐỐI KHÔNG dùng CB1, TC1, TC2, NC1.
     + Lớp 10, 11, 12 BẮT BUỘC dùng mã cấp độ NC1 (ví dụ: [1.2.NC1b], [6.1.NC1a], [6.2.NC1b]). TUYỆT ĐỐI KHÔNG dùng CB1, CB2, TC1, TC2.

QUY TẮC ƯU TIÊN KHI GIÁO VIÊN YÊU CẦU MÃ NĂNG LỰC SỐ CỤ THỂ:
- NẾU giáo viên có yêu cầu hoặc liệt kê các MÃ NĂNG LỰC SỐ CỤ THỂ trong ô "Nội dung cốt lõi" HOẶC trong "Tệp đính kèm":
  -> BẮT BUỘC ƯU TIÊN TUYỆT ĐỐI VÀ CHỈ SỬ DỤNG ĐÚNG CÁC MÃ ĐƯỢC GIÁO VIÊN YÊU CẦU vào Mục I (Năng lực số) và Mục III (Tiến trình dạy học).
  -> TUYỆT ĐỐI KHÔNG tự ý sinh thêm, không bịa thêm bất kỳ mã nào ngoài danh sách giáo viên đã chỉ định.
- NẾU giáo viên KHÔNG chỉ định mã cụ thể: AI tự động tích hợp linh hoạt 1-3 mã chỉ báo chuẩn xác từ danh mục cấp độ [${nlsLevel}] dưới đây.

YÊU CẦU ĐẶC BIỆT - TĂNG CƯỜNG TÍCH HỢP MIỀN 6 (ỨNG DỤNG TRÍ TUỆ NHÂN TẠO - AI):
- Hãy ĐẶC BIỆT TĂNG CƯỜNG tích hợp các năng lực thuộc Miền 6 (Ứng dụng trí tuệ nhân tạo - AI) ở cấp độ [${nlsLevel}] vào bài dạy (ví dụ: đối với Lớp 1-3 dùng [6.2.CB1a], [6.3.CB1a]; đối với Lớp 4-12 dùng [6.1.${nlsLevel}a], [6.2.${nlsLevel}a]...).

DANH MỤC THAM CHIẾU MÃ CHỈ BÁO CHUẨN XÁC DÀNH RIÊNG CHO LỚP ${formData.grade} (CẤP ĐỘ ${nlsLevel}):
${levelIndicators}

VỊ TRÍ TÍCH HỢP BẮT BUỘC TRONG KẾ HOẠCH BÀI DẠY:
1. Tại Mục I (Mục tiêu): Trong phần "2. Về năng lực", bổ sung mục:
   "Năng lực số (Theo Thông tư 02/2025/TT-BGDĐT & CV 3456/BGDĐT-CNTT - Cấp độ ${nlsLevel}):"
   Ghi rõ từ 1 - 3 mã chỉ báo dạng [X.Y.${nlsLevel}z] kèm nội dung cụ thể đạt được gắn kết với môn ${formData.subject}.
2. Tại Mục III (Tiến trình dạy học):
   Lồng ghép nhiệm vụ sử dụng công cụ số/AI vào ít nhất 1 hoạt động học (Khởi động, Khám phá, Luyện tập hoặc Vận dụng), đính kèm mã chỉ báo [X.Y.${nlsLevel}z] tương ứng trong ngoặc đơn ở phần Mục tiêu hoặc Tổ chức thực hiện.`;
  }

  let gdqpInstruction = '';
  if (formData.includeGDQP) {
    const isPrimary = ['1', '2', '3', '4', '5'].includes(formData.grade);
    const isLowerSecondary = ['6', '7', '8', '9'].includes(formData.grade);
    const isUpperSecondary = ['10', '11', '12'].includes(formData.grade);

    let specificGradeTopic = '';
    let gradeYccdQuality = '';
    let gradeYccdCompetency = '';

    if (formData.grade === '1') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 1 (Điều 3.2a Thông tư 08/2024/TT-BGDĐT): Giáo dục cho học sinh về tình yêu quê hương, yêu hòa bình, yêu Tổ quốc Việt Nam xã hội chủ nghĩa; giới thiệu một số hình ảnh về Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam; một số di tích lịch sử của địa phương.`;
    } else if (formData.grade === '2') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 2 (Điều 3.2a Thông tư 08/2024/TT-BGDĐT): Giáo dục cho học sinh về tinh thần đoàn kết toàn dân tộc, sự hi sinh của các chiến sĩ cách mạng trong kháng chiến chống thực dân Pháp và đế quốc Mỹ; giới thiệu một số hình ảnh cán bộ, chiến sĩ Quân đội Nhân dân Việt Nam, Công an Nhân dân Việt Nam làm nhiệm vụ bảo vệ Tổ quốc và giữ gìn trật tự, an toàn xã hội; giáo dục cho học sinh biết yêu thương, chia sẻ, giúp đỡ và bảo vệ nhau trong học tập.`;
    } else if (formData.grade === '3') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 3 (Điều 3.2a Thông tư 08/2024/TT-BGDĐT): Giáo dục truyền thống chống giặc ngoại xâm của dân tộc; giới thiệu những tấm gương dũng cảm của thiếu niên, nhi đồng, bà Mẹ Việt Nam anh hùng trong sự nghiệp giải phóng dân tộc; những hoạt động, hình ảnh của học sinh tham gia bảo vệ môi trường ở địa phương và nhà trường.`;
    } else if (formData.grade === '4') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 4 (Điều 3.2a Thông tư 08/2024/TT-BGDĐT): Giới thiệu bản đồ hành chính Việt Nam, khẳng định chủ quyền của Việt Nam đối với quần đảo Hoàng Sa và Trường Sa; một số bài hát về biển, đảo Việt Nam; giáo dục ý thức chấp hành các quy định của pháp luật về trật tự, an toàn giao thông.`;
    } else if (formData.grade === '5') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 5 (Điều 3.2a Thông tư 08/2024/TT-BGDĐT): Giới thiệu chủ quyền, quyền chủ quyền biển, đảo của Việt Nam; một số hình ảnh khai thác thủy sản, hải sản và tài nguyên để phát triển kinh tế xã hội, bảo đảm quốc phòng, an ninh; những tấm gương dũng cảm của cán bộ, chiến sĩ Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam trong cứu hộ, cứu nạn.`;
    } else if (formData.grade === '6') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 6 (Điều 3.2b Thông tư 08/2024/TT-BGDĐT): Giới thiệu lịch sử và truyền thống của Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam; địa danh lịch sử gắn với các cuộc kháng chiến chống giặc ngoại xâm của dân tộc; cách đánh mưu trí, sáng tạo của quân và dân ta trong các cuộc kháng chiến chống giặc ngoại xâm.`;
    } else if (formData.grade === '7') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 7 (Điều 3.2b Thông tư 08/2024/TT-BGDĐT): Giới thiệu hoạt động, hình ảnh bảo vệ chủ quyền biển, đảo Việt Nam; một số nội dung về bảo vệ thông tin cá nhân khi tham gia mạng xã hội; quyền tự do tín ngưỡng, tôn giáo theo quy định của pháp luật.`;
    } else if (formData.grade === '8') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 8 (Điều 3.2b Thông tư 08/2024/TT-BGDĐT): Giáo dục lòng tự hào, tự tôn dân tộc và sức mạnh đại đoàn kết toàn dân tộc trong đấu tranh chống giặc ngoại xâm; giới thiệu một số mốc quốc giới; tác hại của tệ nạn xã hội tác động đến mọi mặt của đời sống xã hội; trách nhiệm của học sinh tham gia phòng, chống bạo lực học đường.`;
    } else if (formData.grade === '9') {
      specificGradeTopic = `Chủ đề lồng ghép Lớp 9 (Điều 3.2b Thông tư 08/2024/TT-BGDĐT): Hậu quả của các cuộc chiến tranh xâm lược đối với dân tộc Việt Nam; một số hình ảnh về phát triển kinh tế, xã hội và bảo đảm quốc phòng, an ninh; giới thiệu một số bài hát ca ngợi truyền thống vẻ vang của Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam; trách nhiệm của học sinh tham gia xây dựng và bảo vệ Tổ quốc.`;
    } else if (isUpperSecondary) {
      specificGradeTopic = `Chủ đề lồng ghép Cấp THPT (Lớp ${formData.grade}): Giáo dục lòng yêu nước, niềm tự hào và tự tôn dân tộc; nâng cao nhận thức và ý thức trách nhiệm công dân đối với sự nghiệp xây dựng nền quốc phòng toàn dân và thế trận an ninh nhân dân; hiểu biết về bảo vệ chủ quyền lãnh thổ, an ninh biên giới, biển đảo quốc gia; an ninh phi truyền thống, an toàn thông tin mạng, phòng chống tệ nạn xã hội và tội phạm công nghệ cao; tinh thần sẵn sàng thực hiện nghĩa vụ bảo vệ Tổ quốc.`;
    }

    if (isPrimary) {
      gradeYccdQuality = `Yêu cầu cần đạt về Phẩm chất (Điều 5.1a & Điều 5.2a Thông tư 08/2024/TT-BGDĐT):
- Hình thành nhận thức về tình yêu quê hương, đất nước, yêu hòa bình, yêu Tổ quốc Việt Nam XHCN; biết ơn người có công với cách mạng, với đất nước; yêu thương, chia sẻ, kính trọng thầy cô, giúp đỡ bạn bè.
- Rèn luyện tính kỉ luật, tinh thần đoàn kết, tu dưỡng đạo đức, tác phong nghiêm túc trong học tập và sinh hoạt; có ý thức giữ gìn vệ sinh, rèn luyện thân thể; tự giác chấp hành nội quy trường lớp và quy định pháp luật.`;
      gradeYccdCompetency = `Yêu cầu cần đạt về Năng lực (Điều 5.1b & Điều 5.2a Thông tư 08/2024/TT-BGDĐT):
- Nhận thức về quốc phòng và an ninh ở mức độ đơn giản phù hợp lứa tuổi Tiểu học (nhận biết hình ảnh Quân đội Nhân dân, Công an Nhân dân, di tích lịch sử, biển đảo Hoàng Sa - Trường Sa, an toàn giao thông, bảo vệ môi trường).
- Vận dụng kiến thức, kĩ năng đã học vào cuộc sống hàng ngày (biết tự bảo vệ an toàn bản thân, đoàn kết giúp đỡ bạn bè, bảo vệ môi trường, chấp hành luật giao thông).`;
    } else if (isLowerSecondary) {
      gradeYccdQuality = `Yêu cầu cần đạt về Phẩm chất (Điều 5.1a & Điều 5.2b Thông tư 08/2024/TT-BGDĐT):
- Hình thành, phát triển lòng yêu nước, nhân ái, trung thực, trách nhiệm, chăm chỉ; có lòng tự hào, tự tôn dân tộc, yêu Tổ quốc, yêu đồng bào.
- Nâng cao ý thức, trách nhiệm của người học sinh đối với nhiệm vụ bảo vệ Tổ quốc và giữ gìn an ninh, trật tự, an toàn xã hội; có ý thức tổ chức kỉ luật, tinh thần đoàn kết và tự giác chấp hành pháp luật.`;
      gradeYccdCompetency = `Yêu cầu cần đạt về Năng lực (Điều 5.1b & Điều 5.2b Thông tư 08/2024/TT-BGDĐT):
- Hiểu biết về truyền thống chống giặc ngoại xâm của dân tộc, truyền thống của Quân đội Nhân dân Việt Nam, Công an Nhân dân Việt Nam và Dân quân tự vệ; nhận thức về chủ quyền lãnh thổ, biên giới quốc gia, biển đảo; nhận biết các nguy cơ mất an toàn trên mạng xã hội, tác hại tệ nạn xã hội và phòng chống bạo lực học đường.
- Vận dụng kiến thức, kĩ năng để giải quyết tình huống thực tế (bảo vệ thông tin cá nhân, phòng chống bạo lực học đường, tham gia phong trào toàn dân bảo vệ an ninh Tổ quốc ở nhà trường và địa phương).`;
    } else {
      gradeYccdQuality = `Yêu cầu cần đạt về Phẩm chất (Cấp THPT):
- Phát triển mạnh mẽ lòng yêu nước, tinh thần tự hào, tự tôn dân tộc và ý thức trách nhiệm công dân gương mẫu trong bảo vệ chủ quyền toàn vẹn lãnh thổ, biên giới, biển đảo quốc gia.
- Có bản lĩnh chính trị vững vàng, tinh thần cảnh giác cách mạng, ý thức tổ chức kỷ luật cao và sẵn sàng thực hiện nghĩa vụ quân sự, bảo vệ Tổ quốc.`;
      gradeYccdCompetency = `Yêu cầu cần đạt về Năng lực (Cấp THPT):
- Năng lực nhận thức và phân tích các vấn đề quốc phòng, an ninh, chủ quyền quốc gia, an ninh phi truyền thống và an toàn thông tin mạng.
- Năng lực vận dụng kiến thức vào thực tiễn: tuân thủ pháp luật, phòng chống tội phạm mạng và tệ nạn xã hội, lan tỏa các giá trị tích cực về an ninh trật tự trong cộng đồng.`;
    }

    gdqpInstruction = `
========================================================================
TÍCH HỢP LỒNG GHÉP GIÁO DỤC QUỐC PHÒNG VÀ AN NINH (GDQP&AN)
(BÁM SÁT CHUẨN THÔNG TƯ SỐ 08/2024/TT-BGDĐT NGÀY 15/05/2024 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO)
========================================================================
Hãy thực hiện lồng ghép nội dung Giáo dục Quốc phòng và An ninh (GDQP&AN) vào Kế hoạch bài dạy một cách linh hoạt, thiết thực, phù hợp với đặc điểm tâm sinh lý lứa tuổi học sinh LỚP ${formData.grade} và môn học (${formData.subject}), tuyệt đối không làm thay đổi khung chương trình hay làm quá tải thời lượng của tiết học.

1. NỘI DUNG VÀ CHỦ ĐỀ LỒNG GHÉP TRỌNG TÂM DÀNH CHO LỚP ${formData.grade}:
${specificGradeTopic}

2. YÊU CẦU CẦN ĐẠT (YCCĐ) BẮT BUỘC THEO THÔNG TƯ 08/2024/TT-BGDĐT:
${gradeYccdQuality}
${gradeYccdCompetency}

3. QUY ĐỊNH VỊ TRÍ VÀ CÁCH THỨC TÍCH HỢP BẮT BUỘC TRONG KẾ HOẠCH BÀI DẠY:
- TẠI MỤC I (MỤC TIÊU / YÊU CẦU CẦN ĐẠT):
  + Trong phần "Phẩm chất": Thể hiện rõ Yêu cầu cần đạt về phẩm chất liên quan đến GDQP&AN bám sát Điều 5 Thông tư 08/2024/TT-BGDĐT (như lòng yêu nước, niềm tự hào dân tộc, ý thức tổ chức kỷ luật, trách nhiệm bảo vệ chủ quyền biên giới, biển đảo hoặc giữ gìn an ninh trật tự xã hội).
  + Trong phần "Năng lực": Nêu rõ năng lực nhận thức và vận dụng kiến thức GDQP&AN phù hợp với lứa tuổi học sinh lớp ${formData.grade}.
- TẠI MỤC II (THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU):
  + Bổ sung tài liệu, hình ảnh, bản đồ, video, tranh ảnh lịch sử, tấm gương anh hùng hoặc học liệu số liên quan đến nội dung GDQP&AN được lồng ghép.
- TẠI MỤC III (TIẾN TRÌNH DẠY HỌC):
  + Lồng ghép khéo léo, tự nhiên vào ít nhất 1-2 hoạt động học (Khởi động, Khám phá kiến thức mới, Luyện tập hoặc Vận dụng) thông qua ví dụ liên hệ thực tế, câu hỏi tình huống, tranh ảnh trực quan, bài tập liên môn hoặc câu chuyện giáo dục mà không gượng ép.`;
  }

  let hsktInstruction = '';
  if (formData.includeHSKT) {
    hsktInstruction = `
TÍCH HỢP GIÁO DỤC HÒA NHẬP HỌC SINH KHUYẾT TẬT:
Hãy tích hợp các biện pháp hỗ trợ học sinh khuyết tật vào kế hoạch bài dạy:
- Tại Mục I (Mục tiêu): Bổ sung mục tiêu điều chỉnh đối với học sinh khuyết tật (về kiến thức, kỹ năng phù hợp với khả năng nhận thức của học sinh).
- Tại Mục III (Tiến trình dạy học): Trong phần Tổ chức thực hiện của các hoạt động, nêu rõ biện pháp hỗ trợ, động viên hoặc chuyển giao nhiệm vụ phù hợp cho học sinh khuyết tật (ví dụ: sử dụng phương tiện trực quan, phân công bạn hỗ trợ, giao nhiệm vụ vừa sức).`;
  }

  let ai2422Instruction = '';
  if (formData.includeAI2422 || formData.includeAI3439) {
    const gradeCatalog = AI_FRAMEWORK_BY_GRADE[formData.grade]?.codes || [];
    const gradeSummary = AI_FRAMEWORK_BY_GRADE[formData.grade]?.summary || '';
    const codesListText = gradeCatalog.length > 0 
      ? gradeCatalog.map(c => `- [${c.code}] (${c.domainId} - ${c.contentTopic}): ${c.requirement}`).join('\n')
      : `- [${formData.grade}.A1.2] Nhận biết AI là công cụ hỗ trợ, học sinh chủ động tư duy và chịu trách nhiệm về kết quả học tập môn ${formData.subject}.\n- [${formData.grade}.B2.1] Sử dụng AI an toàn, trung thực, khai báo khi có sử dụng nội dung do AI hỗ trợ.\n- [${formData.grade}.C2.1] Biết sử dụng công cụ AI phù hợp để tìm kiếm thông tin, gợi ý ý tưởng hoặc luyện tập bài tập môn ${formData.subject} và kiểm chứng lại với SGK.`;

    ai2422Instruction = `
TÍCH HỢP GIÁO DỤC TRÍ TUỆ NHÂN TẠO - AI (Theo Quyết định số 2422/QĐ-BGDĐT ngày 18 tháng 8 năm 2026 của Bộ Giáo dục và Đào tạo ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông):
Hãy tích hợp mục tiêu và nội dung Giáo dục AI vào kế hoạch bài dạy một cách linh hoạt, thiết thực, phù hợp với môn học (${formData.subject}), lớp ${formData.grade} và lứa tuổi học sinh:

QUY TẮC ƯU TIÊN TUYỆT ĐỐI KHI GIÁO VIÊN YÊU CẦU MÃ NĂNG LỰC AI CỤ THỂ:
- NẾU giáo viên có yêu cầu hoặc liệt kê các MÃ NĂNG LỰC AI CỤ THỂ trong ô "Nội dung cốt lõi" (phần 1. Nhập nội dung) HOẶC trong "Tệp đính kèm" (Ví dụ: [${formData.grade}.A1.2], [${formData.grade}.C2.1], [${formData.grade}.B2.1],...):
  -> BẮT BUỘC ƯU TIÊN TUYỆT ĐỐI VÀ CHỈ SỬ DỤNG ĐÚNG CÁC MÃ NĂNG LỰC AI MÀ GIÁO VIÊN ĐÃ YÊU CẦU vào Mục I (Năng lực Trí tuệ nhân tạo AI) và Mục III (Tiến trình dạy học).
  -> TUYỆT ĐỐI KHÔNG tự ý sinh thêm, không bịa thêm hoặc thay đổi bất kỳ mã năng lực nào khác ngoài danh sách mã giáo viên đã chỉ định.
- NẾU giáo viên KHÔNG chỉ định mã cụ thể: AI tự động lựa chọn linh hoạt từ 1-3 mã chuẩn trong danh mục YCCĐ chính thức của Lớp ${formData.grade} dưới đây sao cho phù hợp với môn học ${formData.subject}.

I. DANH MỤC MÃ YÊU CẦU CẦN ĐẠT (YCCĐ) CHUẨN CỦA BỘ GD&ĐT DÀNH RIÊNG CHO LỚP ${formData.grade}:
Định hướng trọng tâm Lớp ${formData.grade}: ${gradeSummary}
${codesListText}

II. CẤU TRÚC 4 MẠCH KIẾN THỨC VÀ 4 MIỀN NĂNG LỰC ĐẶC THÙ THEO QĐ 2422/QĐ-BGDĐT:
1. Mạch A (NLa) - Tư duy lấy con người làm trung tâm (Chủ đề A1, A2, A3)
2. Mạch B (NLb) - Đạo đức AI (Chủ đề B1, B2, B3)
3. Mạch C (NLc) - Các kĩ thuật và ứng dụng AI (Chủ đề C1, C2, C3, C4, C5)
4. Mạch D (NLd) - Thiết kế hệ thống AI (Chủ đề D1, D2)

III. QUY ƯỚC MÃ HOÁ YÊU CẦU CẦN ĐẠT (YCCĐ) CHUẨN XÁC:
Cấu trúc mã hoá bắt buộc: [Lớp].[Mã chủ đề].[Số thứ tự] (Ví dụ: [${formData.grade}.A1.2], [${formData.grade}.B2.1], [${formData.grade}.C2.1], [${formData.grade}.C3.1], [${formData.grade}.D1.1]).
* BẮT BUỘC: Mã Lớp PHẢI KHỚP CHÍNH XÁC với lớp học hiện tại (${formData.grade}).

IV. VỊ TRÍ BẮT BUỘC THỂ HIỆN TRONG KẾ HOẠCH BÀI DẠY:
1. Tại Mục I (Mục tiêu / Yêu cầu cần đạt): Trong phần "2. Về năng lực", bổ sung mục:
   "Năng lực Trí tuệ nhân tạo (AI) (Theo Quyết định số 2422/QĐ-BGDĐT):"
   Ghi rõ từ 1 - 3 mã YCCĐ chuẩn dạng [${formData.grade}.[Mã CĐ].[Số TT]] kèm mô tả hành vi cần đạt tương ứng gắn kết chặt chẽ với nội dung bài học môn ${formData.subject}.
2. Tại Mục III (Tiến trình dạy học):
   Lồng ghép linh hoạt ít nhất một hoạt động học tập (ở phần Khởi động, Khám phá, Luyện tập hoặc Vận dụng) có sử dụng/trải nghiệm/phân tích công cụ AI hoặc xử lý tình huống đạo đức AI, đồng thời đính kèm mã YCCĐ AI chuẩn (ví dụ: [${formData.grade}.C2.1]) trong ngoặc đơn ở phần Mục tiêu hoặc Tổ chức thực hiện của hoạt động đó.`;
  }

  let stemInstruction = '';
  if (formData.includeSTEM) {
    stemInstruction = `
THIẾT KẾ BÀI HỌC STEM (Theo Công văn 3089/BGDĐT-GDTrH & CV 908/BGDĐT-GDTH về Hướng dẫn Giáo dục STEM):
Bài dạy này được thiết kế theo mô hình "BÀI HỌC STEM" / "CHỦ ĐỀ STEM". Hãy thiết kế toàn bộ cấu trúc và tiến trình bài dạy chuẩn hóa theo quy trình thiết kế kỹ thuật / nghiên cứu khoa học STEM:
1. Tại Mục I (Mục tiêu): 
   - Bổ sung rõ mục tiêu tích hợp liên môn STEM (S - Khoa học, T - Công nghệ, E - Kỹ thuật, M - Toán học, A - Art/Nghệ thuật nếu có).
   - Nêu rõ "Năng lực đặc thù STEM": Năng lực thiết kế kỹ thuật, tư duy sáng tạo, giải quyết vấn đề thực tiễn, chế tạo, lắp ráp và thử nghiệm sản phẩm.
2. Tại Mục II (Thiết bị dạy học và Học liệu STEM):
   - Nêu chi tiết danh mục vật liệu, dụng cụ, thiết bị chế tạo/thử nghiệm mô hình/sản phẩm STEM cho các nhóm học sinh (ưu tiên vật liệu tái chế, dễ tìm, chi phí thấp, an toàn).
3. Tại Mục III (Tiến trình dạy học) - Áp dụng quy trình 5 hoạt động STEM tiêu chuẩn:
   - Hoạt động 1: XÁC ĐỊNH VẤN ĐỀ / NHIỆM VỤ THIẾT KẾ (Nêu tình huống thực tế, giao nhiệm vụ và xác định tiêu chí sản phẩm STEM cụ thể).
   - Hoạt động 2: NGHIÊN CỨU KIẾN THỨC NỀN VÀ ĐỀ XUẤT GIẢI PHÁP (Học sinh học kiến thức bài học và tìm tòi các giải pháp khả thi).
   - Hoạt động 3: LỰA CHỌN GIẢI PHÁP VÀ THIẾT KẾ SẢN PHẨM (Học sinh vẽ bản thiết kế/sơ đồ, giải thích nguyên lý và phân công chế tạo).
   - Hoạt động 4: CHẾ TẠO SẢN PHẨM, THỬ NGHIỆM VÀ ĐÁNH GIÁ (Học sinh tiến hành lắp ráp, thử nghiệm theo các tiêu chí đã đặt ra và điều chỉnh).
   - Hoạt động 5: CHIA SẺ, THẢO LUẬN VÀ HOÀN THIỆN SẢN PHẨM (Trưng bày sản phẩm, báo cáo thuyết trình, đánh giá đồng đẳng và rút ra kết luận kiến thức).`;
  }

  let customIntegrationInstruction = '';
  if (formData.customIntegration && formData.customIntegration.trim()) {
    customIntegrationInstruction = `
TÍCH HỢP NỘI DUNG KHÁC / THEO YÊU CẦU CÁ NHÂN CỦA GIÁO VIÊN:
Giáo viên có yêu cầu tích hợp nội dung đặc thù sau vào kế hoạch bài dạy:
"${formData.customIntegration.trim()}"

YÊU CẦU THỰC HIỆN BẮT BUỘC DÀNH CHO AI:
1. Đọc và phân tích kỹ yêu cầu tích hợp do giáo viên nhập ở trên.
2. Lồng ghép khéo léo, linh hoạt nội dung tích hợp này vào các phần tương ứng trong Kế hoạch bài dạy:
   - Mục I. Mục tiêu (Thêm vào Mục tiêu Kiến thức, Năng lực đặc thù/phẩm chất phù hợp).
   - Mục II. Thiết bị dạy học và học liệu (Bổ sung tranh ảnh, tài liệu hoặc học liệu liên quan nếu cần).
   - Mục III. Tiến trình dạy học (Tích hợp cụ thể vào Khởi động, Khám phá kiến thức mới, Luyện tập hoặc Vận dụng thực tế).
3. Đảm bảo việc tích hợp diễn ra tự nhiên, thực tiễn, vừa sức với học sinh và không làm sai lệch hay gượng ép nội dung kiến thức cốt lõi của bài học.`;
  }

  const sectionVParts = [];
  if (formData.includeReinforcementQuestions) {
    sectionVParts.push(`1. Gợi ý câu hỏi Củng cố: Soạn bộ câu hỏi trắc nghiệm hoặc tự luận ngắn kèm BÀI GIẢI CHI TIẾT/CÂU TRẢ LỜI ĐẦY ĐỦ.`);
  }
  if (formData.includeTeachingMethods) {
    sectionVParts.push(`2. Gợi ý Phương pháp giảng dạy tích cực: Đề xuất các kỹ thuật dạy học (như KWL, mảnh ghép, khăn trải bàn...) phù hợp nhất với kiến thức bài này.`);
  }
  if (formData.includeGames) {
    sectionVParts.push(`3. Gợi ý cho phần Khởi động: Thiết kế trò chơi hoặc tình huống thực tế sôi nổi, hiệu quả để dẫn dắt học sinh vào bài mới.`);
  }
  if (formData.includeTimeline) {
    sectionVParts.push(`4. Timeline: Thiết kế phần Timeline dùng để TÓM TẮT NỘI DUNG KIẾN THỨC CỦA BÀI HỌC theo dòng thời gian, trục tiến trình, hành trình hoặc các mốc kiến thức trọng tâm (trình bày dạng sơ đồ chữ/trục tiến trình trực quan với các mốc thời gian, giai đoạn hoặc chuỗi bài học). Timeline này giúp giáo viên củng cố kiến thức cho học sinh, giúp học sinh nắm bắt toàn bộ nội dung tiết học một cách hệ thống và hiệu quả nhất.`);
  }
  if (formData.includeInfographic) {
    sectionVParts.push(`5. InfoGraphic/Mindmap: Thiết kế phần InfoGraphic/Mindmap dùng để TÓM TẮT NỘI DUNG KIẾN THỨC CỦA BÀI HỌC theo cấu trúc chi tiết dạng sơ đồ tư duy phân cấp trực quan:
   - TRUNG TÂM (Gốc sơ đồ): Tên bài học.
   - NHÁNH CẤP 1: Các mục/nội dung tương ứng trong phần Hình thành kiến thức mới của bài học.
   - NHÁNH CẤP 2: Các ý chính, khái niệm, từ khóa hoặc công thức cốt lõi cần ghi nhớ dành cho học sinh trong từng mục.
   QUY TẮC BẮT BUỘC VỀ TRÌNH BÀY: KHÔNG sử dụng các ký hiệu đường thẳng hay ký tự vẽ sơ đồ (như ├──, └──, |, --, ┌, └). Hãy ghi trực tiếp bằng VĂN BẢN rõ ràng: "Trung tâm: ...", "Nhánh cấp 1: ...", "Nhánh cấp 2: ..." với thụt đầu dòng phân cấp rõ ràng để giáo viên cả 3 cấp học (Tiểu học, THCS, THPT) đều dễ dàng đọc, triển khai và vẽ lại lên bảng.`);
  }

  const sectionVText = sectionVParts.length > 0 
    ? `V. TƯ LIỆU THAM KHẢO VÀ GỢI Ý DÀNH CHO GIÁO VIÊN
${sectionVParts.join('\n')}`
    : '';

  // Language requirement check
  const selectedLang = formData.outputLanguage || 'Tiếng Việt';
  const customLang = formData.customLanguage?.trim();
  const isSelectedEnglish = selectedLang === 'Tiếng Anh';
  const isSelectedOtherLang = selectedLang === 'Ngôn ngữ khác' || (Boolean(customLang) && selectedLang !== 'Tiếng Việt' && selectedLang !== 'Tiếng Anh');

  const isTiengAnh = formData.subject === 'Tiếng Anh';
  const isNgoaiNguKhac = formData.subject === 'Ngoại ngữ khác';
  const foreignLanguages = ['Tiếng Anh', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Nhật', 'Tiếng Trung', 'Tiếng Hàn', 'Tiếng Nga', 'English', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Russian'];
  const isForeignLanguage = isTiengAnh || isNgoaiNguKhac || 
                           foreignLanguages.some(lang => formData.subject.toLowerCase().includes(lang.toLowerCase())) || 
                           (formData.subject.toLowerCase().includes('tiếng') && !formData.subject.toLowerCase().includes('việt'));

  let languageInstruction = '';
  if (isSelectedEnglish) {
    languageInstruction = `
========================================================================
YÊU CẦU BẮT BUỘC VỀ ĐỒNG BỘ 100% SANG TIẾNG ANH (ENGLISH):
========================================================================
- Giáo viên đã chỉ định NGÔN NGỮ BÀI SOẠN là: TIẾNG ANH (ENGLISH).
- BẠN BẮT BUỘC PHẢI ĐỒNG BỘ 100% TOÀN BỘ NỘI DUNG KẾ HOẠCH BÀI DẠY SANG TIẾNG ANH (ENGLISH).
- TIÊU ĐỀ THÔNG TIN CỐ ĐỊNH PHÍA TRÊN CÙNG: Toàn bộ bảng thông tin đầu trang PHẢI ĐƯỢC THỂ HIỆN BẰNG 100% TIẾNG ANH (ví dụ: "SCHOOL: ...", "DEPARTMENT: ...", "Teacher: ...", "LESSON PLAN: [LESSON TITLE IN ENGLISH]", "Subject/Educational Activity: [Subject in English] - Grade [Grade]", "Duration: [Duration] periods").
- PHẦN KÝ DUYỆT CUỐI BÀI SOẠN: Bảng ký duyệt ở cuối bài dạy PHẢI ĐƯỢC THỂ HIỆN BẰNG 100% TIẾNG ANH (ví dụ: "PRINCIPAL / SCHOOL ADMINISTRATION", "HEAD OF DEPARTMENT", "TEACHER").
- TUYỆT ĐỐI KHÔNG DÙNG TỪ VIẾT TẮT TIẾNG VIỆT (GV, HS): Tuyệt đối KHÔNG sử dụng từ viết tắt tiếng Việt "GV" và "HS". Trong Tiếng Anh, BẮT BUỘC dùng danh xưng chuẩn: "Teacher" (hoặc viết tắt "T") và "Students" (hoặc viết tắt "Ss"), hoặc "Teacher's Activities" và "Students' Activities".
- TẤT CẢ CÁC ĐỀ MỤC & NỘI DUNG PHẢI VIẾT BẰNG 100% TIẾNG ANH:
  + I. OBJECTIVES (1. Knowledge & Skills, 2. Competences, 3. Qualities)
  + II. TEACHING EQUIPMENT AND LEARNING MATERIALS (1. Teacher, 2. Students)
  + III. TEACHING PROCEDURES / LESSON STRUCTURE (Activity 1, Activity 2, Activity 3, Activity 4)
  + Các bước trong từng hoạt động: Step 1: Delivering the task, Step 2: Implementing the task, Step 3: Reporting & Discussion, Step 4: Conclusion & Assessment.
  + Tiêu đề bảng 2 cột: "Teacher & Student Activities" | "Expected Products".
  + IV. ASSESSMENT & REFLECTION / CONCLUSION & HOMEWORK.
  + V. TEACHER'S REFERENCE & SUGGESTIONS (nếu có).
- Tuyệt đối không để sót bất kỳ từ tiếng Việt nào trong toàn bộ bản kế hoạch bài dạy.`;
  } else if (isSelectedOtherLang) {
    const targetLangName = customLang || 'Ngoại ngữ do giáo viên chỉ định';
    languageInstruction = `
========================================================================
YÊU CẦU BẮT BUỘC VỀ ĐỒNG BỘ 100% SANG ${targetLangName.toUpperCase()}:
========================================================================
- Giáo viên đã chỉ định NGÔN NGỮ BÀI SOẠN là: ${targetLangName.toUpperCase()}.
- BẠN BẮT BUỘC PHẢI ĐỒNG BỘ 100% TOÀN BỘ NỘI DUNG KẾ HOẠCH BÀI DẠY SANG ${targetLangName.toUpperCase()}.
- TIÊU ĐỀ THÔNG TIN CỐ ĐỊNH PHÍA TRÊN CÙNG: Toàn bộ bảng thông tin đầu trang PHẢI ĐƯỢC DỊCH VÀ THỂ HIỆN BẰNG 100% ${targetLangName.toUpperCase()} (Tên trường, Tổ chuyên môn, Giáo viên thực hiện, Kế hoạch bài dạy, Tên bài, Môn học, Khối lớp, Thời lượng).
- PHẦN KÝ DUYỆT CUỐI BÀI SOẠN: Bảng ký duyệt ở cuối bài dạy PHẢI ĐƯỢC DỊCH VÀ THỂ HIỆN BẰNG 100% ${targetLangName.toUpperCase()} (Ban Giám hiệu/Hiệu trưởng, Tổ trưởng chuyên môn, Giáo viên soạn bài).
- TUYỆT ĐỐI KHÔNG DÙNG TỪ VIẾT TẮT TIẾNG VIỆT (GV, HS): Tuyệt đối KHÔNG sử dụng từ viết tắt tiếng Việt "GV" và "HS". BẮT BUỘC dùng danh xưng/thuật ngữ tương ứng chuẩn xác trong ${targetLangName.toUpperCase()} cho Giáo viên và Học sinh (ví dụ Tiếng Pháp: Enseignant/Élèves, Tiếng Đức: Lehrer/Schüler, Tiếng Trung: 教师/学生, Tiếng Nhật: 教師/生徒, v.v.).
- TẤT CẢ CÁC ĐỀ MỤC & NỘI DUNG PHẢI VIẾT BẰNG 100% ${targetLangName.toUpperCase()}:
  + Toàn bộ các tiêu đề mục I, II, III, IV, V, tên các hoạt động, 4 bước tổ chức dạy học (Giao nhiệm vụ, Thực hiện, Báo cáo thảo luận, Kết luận), tiêu đề bảng và các cột, câu hỏi phát vấn, phiếu học tập, đáp án sản phẩm, dặn dò... ĐỀU PHẢI ĐƯỢC VIẾT 100% BẰNG ${targetLangName.toUpperCase()}.
- Tuyệt đối không để sót bất kỳ từ tiếng Việt nào trong toàn bộ bản kế hoạch bài dạy.`;
  } else if (isForeignLanguage) {
    if (isTiengAnh) {
      languageInstruction = `
========================================================================
YÊU CẦU BẮT BUỘC VỀ ĐỒNG BỘ 100% SANG TIẾNG ANH (ENGLISH):
========================================================================
- Vì môn học là Tiếng Anh, bạn PHẢI ĐỒNG BỘ 100% TOÀN BỘ NỘI DUNG KẾ HOẠCH BÀI DẠY SANG TIẾNG ANH (ENGLISH).
- TIÊU ĐỀ THÔNG TIN ĐẦU TRANG & BẢNG KÝ DUYỆT CUỐI BÀI: Phải viết hoàn toàn bằng Tiếng Anh (SCHOOL, DEPARTMENT, Teacher, LESSON PLAN, PRINCIPAL, HEAD OF DEPARTMENT, etc.).
- TUYỆT ĐỐI KHÔNG DÙNG "GV", "HS": Dùng "Teacher" / "T" và "Students" / "Ss".
- Tất cả các tiêu đề mục (I, II, III, IV, V), tiêu đề bảng, tiêu đề cột, hoạt động dạy học, sản phẩm dự kiến, kết luận,... PHẢI được viết hoàn toàn bằng Tiếng Anh.
- Tuyệt đối không để lẫn tiếng Việt trong bản kế hoạch bài dạy.`;
    } else {
      languageInstruction = `
========================================================================
YÊU CẦU BẮT BUỘC VỀ ĐỒNG BỘ 100% SANG NGOẠI NGỮ ĐƯỢC CHỌN:
========================================================================
- Vì môn học là Ngoại ngữ khác, bạn cần tự xác định ngôn ngữ giảng dạy dựa trên Tên bài soạn ("${formData.lessonTitle}") và Nội dung cốt lõi của người dùng ("${formData.coreContent}") (Ví dụ: Tiếng Trung Quốc, Tiếng Nhật, Tiếng Pháp, Tiếng Đức, Tiếng Hàn, v.v.).
- Bạn PHẢI ĐỒNG BỘ 100% TOÀN BỘ nội dung kế hoạch bài dạy sang chính NGÔN NGỮ mục tiêu đó.
- Cả tiêu đề thông tin đầu trang và bảng ký duyệt cuối bài phải được dịch sang chính ngôn ngữ đó.
- TUYỆT ĐỐI KHÔNG DÙNG từ viết tắt tiếng Việt "GV" và "HS".
- Tuyệt đối không để lẫn tiếng Việt trong bản kế hoạch bài dạy.`;
    }
  } else {
    // Ngôn ngữ Tiếng Việt (VN TIẾNG VIỆT)
    languageInstruction = `
========================================================================
QUY ĐỊNH VỀ NGÔN NGỮ VÀ BẢO TỒN THUẬT NGỮ (NGÔN NGỮ BÀI SOẠN: TIẾNG VIỆT):
========================================================================
- Ngôn ngữ bài soạn là TIẾNG VIỆT.
- QUY TẮC SỬ DỤNG TỪ VIẾT TẮT SƯ PHẠM: Khi soạn bài bằng Tiếng Việt, ĐƯỢC PHÉP và KHUYẾN KHÍCH sử dụng các từ viết tắt chuẩn mực trong sư phạm Việt Nam: "GV" (Giáo viên) và "HS" (Học sinh) trong nội dung tổ chức hoạt động, các bước 1-4, lời dẫn và bảng biểu để kế hoạch bài dạy ngắn gọn, súc tích, mạch lạc và đúng phong cách sư phạm.
- NGUYÊN TẮC BẢO TOÀN THUẬT NGỮ CHUYÊN MÔN, TÊN RIÊNG & ĐỊA DANH:
  + Đối với các thuật ngữ khoa học, danh từ riêng, tên các nhà khoa học / nhân vật lịch sử / tác gia văn học, địa danh quốc tế, mã gen / ký hiệu sinh học, công thức / ký hiệu hóa học, từ khóa tin học / lập trình (ví dụ: DNA, RNA, NST, ATP, Newton, Einstein, Pythagoras, Mendeleev, Shakespeare, London, New York, Tokyo, CPU, RAM, Python, HTML, CSS, JavaScript, Loop, Function, pH, COVID-19, SARS-CoV-2, v.v.) thuộc phạm vi kiến thức:
  -> BẮT BUỘC GIỮ NGUYÊN từ ngữ/thuật ngữ gốc đó theo đúng chuẩn khoa học quốc tế và sách giáo khoa hiện hành.
  -> TUYỆT ĐỐI KHÔNG tự ý dịch vụng về hoặc phiên âm thô cứng sang Tiếng Việt.`;
  }

  let textbookInstruction = '';
  if (formData.textbook === 'Bộ sách Khác' || formData.textbook.toLowerCase().includes('khác')) {
    textbookInstruction = `
YÊU CẦU VỀ BỘ SÁCH VÀ NỘI DUNG BÀI DẠY:
- Kế hoạch bài dạy này áp dụng cho bộ sách: "Bộ sách Khác" (người dùng tự định nghĩa).
- GHI CHÚ BẮT BUỘC CHO AI: AI phải bám sát nội dung sách giáo khoa hiện hành (Bộ sách Kết nối tri thức với Cuộc sống) HOẶC bám sát theo đúng nội dung giáo viên nhập vào trong ô "Nội dung cốt lõi" ("${formData.coreContent}").
- NGUYÊN TẮC BÁM SÁT TÍNH THỰC TIỄN: TUYỆT ĐỐI KHÔNG sáng tạo quá nhiều nội dung mới xa rời thực tế khiến giáo viên và học sinh khó triển khai trên lớp học thực tế. Các hoạt động dạy học phải vừa sức, tính khả thi cao, dễ thực hiện và gắn liền với thực tế giảng dạy trên lớp.`;
  } else if (formData.subject === 'Tiếng Anh' || formData.textbook === 'Global Success' || formData.textbook.toLowerCase().includes('global success')) {
    textbookInstruction = `
YÊU CẦU VỀ BỘ SÁCH VÀ NỘI DUNG BÀI DẠY:
- Kế hoạch bài dạy này áp dụng cho bộ sách Tiếng Anh: "Global Success".
- GHI CHÚ BẮT BUỘC CHO AI: AI phải bám sát nội dung sách giáo khoa hiện hành (Global Success / Kết nối tri thức với Cuộc sống) HOẶC bám sát theo đúng nội dung giáo viên nhập vào trong ô "Nội dung cốt lõi" ("${formData.coreContent}").
- QUY ĐỊNH TÊN BỘ SÁCH TRONG NỘI DUNG VĂN BẢN: Trong văn bản kế hoạch bài dạy, phần thông tin bộ sách ghi là "Global Success", "Bộ sách hiện hành", "Sách giáo khoa" hoặc "SGK".
- NGUYÊN TẮC BÁM SÁT TÍNH THỰC TIỄN: TUYỆT ĐỐI KHÔNG sáng tạo quá nhiều nội dung mới xa rời thực tế khiến giáo viên và học sinh khó triển khai trên lớp học thực tế. Các hoạt động dạy học phải vừa sức, tính khả thi cao, dễ thực hiện và gắn liền với thực tế giảng dạy trên lớp.`;
  } else {
    textbookInstruction = `
YÊU CẦU BẮT BUỘC VỀ TÊN BỘ SÁCH VÀ NỘI DUNG BÀI DẠY:
- QUY ĐỊNH XUẤT TÊN BỘ SÁCH: Khi sinh nội dung liên quan đến tên bộ sách trong kế hoạch bài dạy (bao gồm tiêu đề, ghi chú, mục tiêu, thiết bị dạy học, tiến trình bài dạy, v.v.), CHỈ ĐƯỢC GHI LÀ "Bộ sách hiện hành", "Sách giáo khoa", hoặc "SGK". TUYỆT ĐỐI KHÔNG ghi rõ tên cụ thể của bất kỳ bộ sách nào (như Kết nối tri thức với cuộc sống, Cánh diều, Chân trời sáng tạo...), vì đã thống nhất toàn quốc dùng chung một bộ sách.
- ĐỊNH NGHĨA DÀNH CHO AI NẮM BẢN CHẤT: AI tự hiểu "Bộ sách hiện hành" / "SGK" là bộ sách Kết nối tri thức với Cuộc sống (có chỉnh lý, bổ sung) áp dụng thống nhất toàn quốc từ năm học 2026 - 2027. Do đó, hãy soạn bài dạy bám sát nội dung, cấu trúc và tinh thần của bộ sách Kết nối tri thức với Cuộc sống phiên bản mới nhất, nhưng trong văn bản xuất ra CHỈ VIẾT LÀ "Bộ sách hiện hành", "Sách giáo khoa" HOẶC "SGK".
- NGUYÊN TẮC BÁM SÁT NỘI DUNG VÀ TÍNH THỰC TIỄN:
  + AI PHẢI bám sát nội dung sách giáo khoa hiện hành (Bộ sách Kết nối tri thức với Cuộc sống) HOẶC bám sát theo đúng nội dung giáo viên nhập vào trong ô "Nội dung cốt lõi" ("${formData.coreContent}").
  + TUYỆT ĐỐI KHÔNG sáng tạo quá nhiều nội dung mới xa rời thực tế khiến giáo viên và học sinh khó triển khai trên lớp học thực tế. Các hoạt động dạy học phải vừa sức, tính khả thi cao, dễ thực hiện và phù hợp với thực tế giảng dạy trên lớp.`;
  }

  let specialSubjectInstruction = '';
  if (['Trí tuệ nhân tạo (AI)', 'Môn học khác', 'Tự chọn', 'Chuyên đề học tập'].includes(formData.subject)) {
    specialSubjectInstruction = `
========================================================================
HƯỚNG DẪN ĐẶC BIỆT CHO MÔN HỌC: "${formData.subject}" (NGƯỜI DÙNG TỰ ĐỊNH NGHĨA / THEO TÀI LIỆU ĐÍNH KÈM):
========================================================================
- Môn học được chọn: "${formData.subject}" - Khối Lớp ${formData.grade}.
- QUY TẮC BẮT BUỘC KHI XÂY DỰNG BÀI DẠY:
  1. AI BẮT BUỘC xây dựng kế hoạch bài dạy bám sát hoàn toàn theo Tên bài soạn ("${formData.lessonTitle}"), Nội dung cốt lõi do giáo viên nhập ("${formData.coreContent}") và nội dung từ Tệp tài liệu đính kèm (PDF, Word, Ảnh SGK) nếu có.
  2. NẾU là môn "Trí tuệ nhân tạo (AI)": Thiết kế mục tiêu (kiến thức, kĩ năng, năng lực AI theo QĐ 2422/QĐ-BGDĐT), thiết bị dạy học và tiến trình dạy học tập trung vào bản chất, công cụ, kĩ thuật và ứng dụng AI thực tế phù hợp với học sinh Lớp ${formData.grade}.
  3. NẾU là môn "Chuyên đề học tập" (Cấp THPT): Thiết kế theo định hướng chuyên đề học tập chuyên sâu của Chương trình GDPT 2018 (Lớp ${formData.grade}), chú trọng đào sâu lý thuyết, dự án thực hành, giải quyết vấn đề thực tiễn và định hướng nghề nghiệp.
  4. NẾU là "Môn học khác" hoặc "Tự chọn": AI linh hoạt xây dựng mục tiêu phẩm chất, năng lực và tiến trình dạy học chuẩn theo Công văn 5512 (hoặc CV 2345 nếu là Tiểu học) phù hợp với lĩnh vực kiến thức mà giáo viên khai báo trong bài soạn và tài liệu đính kèm.`;
  }

  const isPrimaryGrade = ['1', '2', '3', '4', '5'].includes(formData.grade);
  const isPrimaryTemplate = formData.templateType === '2345' || (formData.templateType === 'auto' && isPrimaryGrade);

  const templateTitle = isPrimaryTemplate 
    ? 'KẾ HOẠCH BÀI DẠY CẤP TIỂU HỌC (THEO CÔNG VĂN 2345/BGDĐT)' 
    : 'KẾ HOẠCH BÀI DẠY CẤP THCS & THPT (THEO CÔNG VĂN 5512/BGDĐT)';

  const objectiveInstruction = isPrimaryTemplate
    ? `
YÊU CẦU CHI TIẾT CHO MỤC I. YÊU CẦU CẦN ĐẠT (MỤC TIÊU BÀI HỌC CẤP TIỂU HỌC THƯỜNG QUY):
1. Kiến thức, kĩ năng:
   - Nêu cụ thể kiến thức, kĩ năng cốt lõi học sinh Tiểu học cần đạt được sau bài học theo yêu cầu cần đạt của chương trình môn học/hoạt động giáo dục.
   - NGUYÊN TẮC BẮT BUỘC: NẾU giáo viên có nhập yêu cầu cụ thể hoặc trong tệp tài liệu đính kèm có nêu MỤC TIÊU / YÊU CẦU CẦN ĐẠT VỀ KIẾN THỨC, AI BẮT BUỘC PHẢI TÔN TRỌNG TUYỆT ĐỐI, giữ nguyên vẹn và thể hiện đầy đủ, chính xác các mục tiêu kiến thức này, tuyệt đối không được tự ý cắt xén, thay đổi hay lược bỏ.
2. Về năng lực:
   - Năng lực chung: Nêu các biểu hiện cụ thể vừa sức với lứa tuổi học sinh Tiểu học (Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo).
   - Năng lực đặc thù: Năng lực môn học cần hình thành (Năng lực ngôn ngữ, Toán học, Khám phá tự nhiên và xã hội, Thể chất, Mĩ thuật, Âm nhạc, Tin học - Công nghệ...).
3. Về phẩm chất: Nêu các biểu hiện hành vi, thái độ học tập (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm) gắn liền với bài học của học sinh Tiểu học.

YÊU CẦU CHI TIẾT CHO MỤC II. ĐỒ DÙNG DẠY HỌC (THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU CẤP TIỂU HỌC):
1. Giáo viên: Chuẩn bị Kế hoạch bài dạy, bài trình chiếu, hình ảnh/video trực quan, phiếu học tập, thẻ từ, thẻ câu hỏi, bộ đồ dùng dạy học...
2. Học sinh: Chuẩn bị SGK, vở ghi, đồ dùng học tập cá nhân (bộ đồ dùng Toán/Tiếng Việt, màu vẽ, đất nặn...) tương ứng với môn học.

YÊU CẦU CHI TIẾT CHO MỤC III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (TIẾN TRÌNH DẠY HỌC CẤP TIỂU HỌC - CV 2345):
1. Hoạt động 1: Mở đầu / Khởi động (Kết nối) (3 - 5 phút)
   a) Mục tiêu: Tạo không khí sôi nổi, thu hút sự chú ý, kết nối hiểu biết có sẵn của học sinh vào bài học mới.
   b) Nội dung: Trò chơi ngắn, câu đố, bài hát, quan sát tranh ảnh hoặc câu hỏi khởi động.
   c) Sản phẩm: Câu trả lời của học sinh, không khí học tập hào hứng, tiếp nhận nhiệm vụ.
   d) Tổ chức thực hiện: Hướng dẫn học sinh tham gia sinh động, gần gũi với trẻ em Tiểu học.

2. Hoạt động 2: Hình thành kiến thức mới (Khám phá)
   Phân rã thành từng hoạt động khám phá cụ thể: Hoạt động 2.1: [Tên Nội dung 1], Hoạt động 2.2: [Tên Nội dung 2]...
   Với mỗi hoạt động con (2.1, 2.2,...), phải đầy đủ:
   a) Mục tiêu: Giúp học sinh khám phá, chiếm lĩnh kiến thức/kĩ năng mới.
   b) Nội dung: Nhiệm vụ quan sát tranh, đọc văn bản, thảo luận cặp đôi/nhóm nhỏ, thực hành mẫu.
   c) Sản phẩm: Câu trả lời, thao tác làm việc đúng, phiếu học tập hoàn thành.
   d) Tổ chức thực hiện: Giao nhiệm vụ -> Thực hiện -> Báo cáo, thảo luận -> Kết luận, chốt kiến thức.

3. Hoạt động 3: Luyện tập, thực hành
   a) Mục tiêu: Củng cố kiến thức vừa khám phá, rèn luyện kỹ năng qua bài tập/thao tác thực hành.
   b) Nội dung: Làm các bài tập trong SGK (Bài 1, Bài 2...), thảo luận nhóm, thực hành đồ dùng học tập.
   c) Sản phẩm: Đáp án bài tập, sản phẩm thực hành hoàn thành.
   d) Tổ chức thực hiện: Giao nhiệm vụ -> Học sinh thực hành -> Hướng dẫn, nhận xét -> Chốt đáp án.

4. Hoạt động 4: Vận dụng, trải nghiệm
   a) Mục tiêu: Vận dụng kiến thức vào thực tiễn cuộc sống gia đình, nhà trường và đời sống hàng ngày của học sinh.
   b) Nội dung: Tình huống thực tế, câu hỏi mở rộng, chia sẻ với người thân.
   c) Sản phẩm: Câu trả lời vận dụng, sản phẩm trải nghiệm hoặc ý tưởng cá nhân.
   d) Tổ chức thực hiện: Hướng dẫn học sinh vận dụng sáng tạo.
`
    : `
YÊU CẦU CHI TIẾT CHO MỤC I (MỤC TIÊU CẤP THCS & THPT - CV 5512):
1. Về kiến thức:
   - Nêu cụ thể nội dung kiến thức học sinh cần học trong bài theo yêu cầu cần đạt của nội dung giáo dục/chủ đề tương ứng trong chương trình môn học/hoạt động giáo dục.
   - NGUYÊN TẮC BẮT BUỘC: NẾU giáo viên có nhập yêu cầu cụ thể hoặc trong tệp tài liệu đính kèm có nêu MỤC TIÊU / YÊU CẦU CẦN ĐẠT VỀ KIẾN THỨC, AI BẮT BUỘC PHẢI TÔN TRỌNG TUYỆT ĐỐI, giữ nguyên vẹn và thể hiện đầy đủ, chính xác các mục tiêu kiến thức này vào phần "1. Về kiến thức", tuyệt đối không được tự ý cắt xén, thay đổi hay lược bỏ.
2. Về năng lực: Nêu cụ thể yêu cầu học sinh làm được gì (biểu hiện cụ thể của năng lực chung và năng lực đặc thù môn học cần phát triển) trong hoạt động học để chiếm lĩnh và vận dụng kiến thức theo yêu cầu cần đạt của chương trình môn học/hoạt động giáo dục.
3. Về phẩm chất: Nêu cụ thể yêu cầu về hành vi, thái độ (biểu hiện cụ thể của phẩm chất cần phát triển gắn với nội dung bài dạy) của học sinh trong quá trình thực hiện các nhiệm vụ học tập và vận dụng kiến thức vào cuộc sống.

YÊU CẦU CHI TIẾT CHO MỤC II (THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU):
- Nêu cụ thể các thiết bị dạy học và học liệu được sử dụng trong bài dạy để tổ chức cho học sinh hoạt động nhằm đạt được mục tiêu, yêu cầu của bài dạy.

YÊU CẦU CHI TIẾT CHO MỤC III (TIẾN TRÌNH DẠY HỌC CẤP THCS & THPT - CV 5512):
1. Hoạt động 1: Xác định vấn đề/nhiệm vụ học tập/Mở đầu (Ghi rõ tên thể hiện kết quả hoạt động)
   a) Mục tiêu: Nêu mục tiêu giúp học sinh xác định được vấn đề/nhiệm vụ cụ thể cần giải quyết trong bài học.
   b) Nội dung: Nêu rõ nội dung yêu cầu/nhiệm vụ cụ thể (xử lí tình huống, câu hỏi, bài tập, thí nghiệm, thực hành…).
   c) Sản phẩm: Trình bày cụ thể yêu cầu về nội dung và hình thức của sản phẩm hoạt động.
   d) Tổ chức thực hiện: Giao nhiệm vụ; Thực hiện nhiệm vụ; Báo cáo, thảo luận; Kết luận, nhận định.

2. Hoạt động 2: Hình thành kiến thức mới/giải quyết vấn đề/thực thi nhiệm vụ đặt ra từ Hoạt động 1.
   YÊU CẦU BẮT BUỘC: Các nội dung trong sách giáo khoa phải được trình bày chi tiết theo từng hoạt động học tập cụ thể, phân rã thành từng nội dung riêng biệt: Hoạt động 2.1: [Tên Nội dung 1], Hoạt động 2.2: [Tên Nội dung 2],... Tuyệt đối KHÔNG gộp các nội dung/hoạt động này lại với nhau.
   Với mỗi hoạt động con (2.1, 2.2,...) này, bạn PHẢI triển khai đầy đủ cả 4 mục sau:
   a) Mục tiêu: Giúp học sinh chiếm lĩnh kiến thức mới/giải quyết vấn đề cụ thể của nội dung đó.
   b) Nội dung: Nêu rõ nội dung nhiệm vụ cụ thể làm việc với sách, thiết bị, học liệu liên quan đến nội dung đó.
   c) Sản phẩm: Trình bày kết quả thực hiện nhiệm vụ học tập đầy đủ và chính xác.
   d) Tổ chức thực hiện: Giao nhiệm vụ; Thực hiện nhiệm vụ; Báo cáo, thảo luận; Kết luận, nhận định của riêng nội dung đó.

3. Hoạt động 3: Luyện tập
   a) Mục tiêu: Vận dụng kiến thức và phát triển kĩ năng.
   b) Nội dung: Hệ thống câu hỏi, bài tập, bài thực hành.
   c) Sản phẩm: Đáp án, lời giải, bài thực hành hoàn thành.
   d) Tổ chức thực hiện: Giao nhiệm vụ; Hỗ trợ; Kiểm tra, đánh giá.

4. Hoạt động 4: Vận dụng
   a) Mục tiêu: Phát triển năng lực qua vận dụng kiến thức vào thực tiễn.
   b) Nội dung: Phát hiện/đề xuất vấn đề thực tiễn gắn với bài học.
   c) Sản phẩm: Báo cáo thực hiện ngoài giờ lên lớp.
   d) Tổ chức thực hiện: Giao nhiệm vụ tham gia thực hiện thực tế.
`;

  const isTwoColumn = formData.layoutColumns === '2';

  const layoutInstruction = isTwoColumn
    ? `
YÊU CẦU BẮT BUỘC VỀ ĐỊNH DẠNG 2 CỘT CHO KẾ HOẠCH BÀI DẠY:
Người dùng chọn định dạng Kế hoạch bài dạy 2 CỘT. Vẫn GIỮ NGUYÊN tất cả nội dung và các phần (I, II, III, IV, V).
Chỉ thay đổi phần "Tổ chức thực hiện" của MỌI hoạt động (Hoạt động 1, Hoạt động 2.1, 2.2..., Hoạt động 3, Hoạt động 4) được chia thành BẢNG MARKDOWN 2 CỘT như sau:

Cột 1: "Hoạt động của Giáo viên và Học sinh": Triển khai chi tiết đủ 4 bước tuần tự theo quy chuẩn của Công văn 5512:
  - Bước 1: Chuyển giao nhiệm vụ
  - Bước 2: Thực hiện nhiệm vụ
  - Bước 3: Báo cáo, thảo luận
  - Bước 4: Kết luận, nhận định

Cột 2: "Sản phẩm dự kiến": Thể hiện chi tiết nội dung giải pháp, câu trả lời hoặc sản phẩm học tập dự kiến tương ứng với từng bước tương hỗ bên Cột 1.

CẤU TRÚC BẢNG MARKDOWN DÙNG CHO PHẦN TỔ CHỨC THỰC HIỆN CỦA MỖI HOẠT ĐỘNG:
| Hoạt động của Giáo viên và Học sinh | Sản phẩm dự kiến |
| :--- | :--- |
| **Bước 1: Chuyển giao nhiệm vụ**<br>- GV: [Giao nhiệm vụ, đặt câu hỏi, hướng dẫn cụ thể]<br>- HS: [Tiếp nhận nhiệm vụ, chuẩn bị thực hiện] | [Nội dung giải pháp, câu hỏi, bài tập hoặc yêu cầu giao cho HS tương ứng ở Bước 1] |
| **Bước 2: Thực hiện nhiệm vụ**<br>- GV: [Quan sát, hỗ trợ, gợi mở, quản lý lớp]<br>- HS: [Thực hiện cá nhân/nhóm, thảo luận, tìm giải pháp, ghi kết quả] | [Chi tiết nội dung giải pháp, lời giải, kết quả làm việc, sản phẩm học tập dự kiến tương ứng ở Bước 2] |
| **Bước 3: Báo cáo, thảo luận**<br>- GV: [Chỉ định đại diện báo cáo, điều hành thảo luận]<br>- HS: [Đại diện báo cáo kết quả, các nhóm/HS khác nhận xét, phản biện] | [Nội dung báo cáo, đáp án, sản phẩm thảo luận/phản biện dự kiến tương ứng ở Bước 3] |
| **Bước 4: Kết luận, nhận định**<br>- GV: [Nhận xét thái độ/kết quả, chốt kiến thức chuẩn chính xác]<br>- HS: [Ghi chép kiến thức cốt lõi vào vở] | [Kiến thức chuẩn chính xác, kết luận chính thức, đáp án hoặc sản phẩm học tập chốt lại tương ứng ở Bước 4] |

Lưu ý:
- Trong các ô của bảng Markdown, dùng thẻ <br> để xuống dòng giữa các ý hoặc giữa GV và HS.
`
    : `
YÊU CẦU CHI TIẾT VỀ ĐỊNH DẠNG 1 CỘT (TRUYỀN THỐNG MẶC ĐỊNH):
Mọi hoạt động học tập trong Kế hoạch bài dạy (Hoạt động 1, Hoạt động 2.1, 2.2..., Hoạt động 3, Hoạt động 4) được trình bày đầy đủ, chi tiết tuần tự theo đúng Phụ lục IV - Công văn 5512/BGDĐT:
a) Mục tiêu: [Mô tả cụ thể mục tiêu kiến thức, kỹ năng, năng lực cần đạt của hoạt động]
b) Nội dung: [Mô tả chi tiết nhiệm vụ học tập, hệ thống câu hỏi, bài tập hoặc phiếu học tập giao cho HS]
c) Sản phẩm: [Mô tả chi tiết sản phẩm học tập, câu trả lời, lời giải dự kiến HS phải hoàn thành]
d) Tổ chức thực hiện: Triển khai đầy đủ và chi tiết 4 bước tuần tự theo chuẩn Công văn 5512:

- **Bước 1: Chuyển giao nhiệm vụ**
  + GV: [Mô tả chi tiết lời giao nhiệm vụ, đặt câu hỏi, hướng dẫn cách thức thực hiện]
  + HS: [Mô tả hành động tiếp nhận nhiệm vụ, lắng nghe, chuẩn bị thực hiện]
  + Nhiệm vụ: [Nội dung câu hỏi, bài tập hoặc phiếu học tập giao cho HS tương ứng ở Bước 1]

- **Bước 2: Thực hiện nhiệm vụ**
  + GV: [Mô tả chi tiết sự quan sát, theo dõi, hướng dẫn, hỗ trợ, gợi mở và quản lý lớp học]
  + HS: [Mô tả chi tiết hoạt động làm việc cá nhân hoặc thảo luận nhóm, tìm giải pháp, hoàn thành nhiệm vụ, ghi kết quả]
  + Kết quả / Lời giải dự kiến: [Nội dung giải pháp, lời giải, đáp án hoặc sản phẩm học tập dự kiến tương ứng ở Bước 2]

- **Bước 3: Báo cáo, thảo luận**
  + GV: [Mô tả chi tiết việc điều hành, chỉ định đại diện nhóm/HS báo cáo kết quả]
  + HS: [Mô tả chi tiết việc đại diện báo cáo sản phẩm, các nhóm/HS khác chú ý lắng nghe, nhận xét, bổ sung, phản biện]
  + Nội dung báo cáo / Đáp án thảo luận dự kiến: [Nội dung báo cáo, đáp án, sản phẩm thảo luận/phản biện dự kiến tương ứng ở Bước 3]

- **Bước 4: Kết luận, nhận định**
  + GV: [Mô tả chi tiết việc nhận xét thái độ, kết quả làm việc của HS và CHỐT KIẾN THỨC CHUẨN XÁC]
  + HS: [Mô tả hành động lắng nghe, rút kinh nghiệm và ghi chép kiến thức cốt lõi vào vở]
  + Kết luận, nhận định: [Nội dung kiến thức chuẩn chính xác, kết luận chính thức hoặc sản phẩm học tập chốt lại tương ứng ở Bước 4]
`;

  const systemExpertRole = isPrimaryTemplate
    ? `Bạn là một chuyên gia giáo dục cao cấp Cấp TIỂU HỌC tại Việt Nam. Hãy soạn một KẾ HOẠCH BÀI DẠY (KHBD Tiểu học) CHI TIẾT và CHUYÊN NGHIỆP theo đúng tinh thần CÔNG VĂN 2345/BGDĐT (đánh giá học sinh Tiểu học theo Thông tư 27/2020/TT-BGDĐT).`
    : `Bạn là một chuyên gia giáo dục cao cấp tại Việt Nam. Hãy soạn một KẾ HOẠCH BÀI DẠY (KHBD Trung học) CHI TIẾT và CHUYÊN NGHIỆP theo đúng Phụ lục IV - CÔNG VĂN 5512/BGDĐT.`;

  const periodMinutes = isPrimaryTemplate ? 35 : 45;
  const periodCount = Math.max(1, parseInt(formData.duration, 10) || 1);
  const totalMinutes = periodCount * periodMinutes;

  const schoolNameRaw = teacherInfo?.schoolName ? teacherInfo.schoolName.toUpperCase() : '';
  const departmentRaw = teacherInfo?.department ? teacherInfo.department.toUpperCase() : '';
  const teacherNameHeader = teacherInfo?.teacherName || '...';
  const signatureName = teacherInfo?.teacherName || 'ĐOÀN KIÊN TRUNG';

  let schoolNameHeader = schoolNameRaw ? `TRƯỜNG: ${schoolNameRaw}` : 'TRƯỜNG: ...';
  let departmentHeader = departmentRaw ? `TỔ CHUYÊN MÔN: ${departmentRaw}` : 'TỔ CHUYÊN MÔN: ...';
  let teacherTitleHeader = `Giáo viên thực hiện: ${teacherNameHeader}`;
  let lessonPlanHeader = 'KẾ HOẠCH BÀI DẠY';
  let subjectHeader = `Môn học/Hoạt động giáo dục: ${formData.subject} - Lớp ${formData.grade}`;
  let durationHeaderString = formData.splitPeriods 
    ? `Thời gian thực hiện: ${formData.duration} tiết (${totalMinutes} phút - ${periodMinutes} phút/tiết)`
    : `Thời gian thực hiện: ${formData.duration} tiết`;

  let sigCol1 = 'CHUYÊN MÔN TRƯỜNG';
  let sigCol2 = 'TỔ CHUYÊN MÔN';
  let sigCol3 = 'GIÁO VIÊN SOẠN';

  if (isSelectedEnglish) {
    schoolNameHeader = schoolNameRaw ? `SCHOOL: ${schoolNameRaw}` : 'SCHOOL: ...';
    departmentHeader = departmentRaw ? `DEPARTMENT: ${departmentRaw}` : 'DEPARTMENT: ...';
    teacherTitleHeader = `Teacher: ${teacherNameHeader}`;
    lessonPlanHeader = 'LESSON PLAN';
    subjectHeader = `Subject/Educational Activity: ${formData.subject} - Grade ${formData.grade}`;
    durationHeaderString = formData.splitPeriods
      ? `Duration: ${formData.duration} periods (${totalMinutes} minutes - ${periodMinutes} mins/period)`
      : `Duration: ${formData.duration} periods`;
    sigCol1 = 'PRINCIPAL / SCHOOL ADMINISTRATION';
    sigCol2 = 'HEAD OF DEPARTMENT';
    sigCol3 = 'TEACHER';
  }

  const headerTableBlock = `| ${schoolNameHeader}<br>${departmentHeader}<br>${teacherTitleHeader}<br>${lessonPlanHeader}<br>${formData.lessonTitle.toUpperCase()}<br>${subjectHeader}<br>${durationHeaderString} |
| :---: |`;

  const signatureTableBlock = `| ${sigCol1} | ${sigCol2} | ${sigCol3} |
| :---: | :---: | :---: |
| <br><br><br> | <br><br><br> | <br><br><br>**${signatureName}** |`;

  const splitPeriodsInstruction = formData.splitPeriods
    ? `
========================================================================
YÊU CẦU BẮT BUỘC VỀ SOẠN NỘI DUNG KẾ HOẠCH BÀI DẠY THEO TIẾT (TÙY CHỌN TÁCH TIẾT: ĐANG BẬT):
========================================================================
Giáo viên đã bật tùy chọn "TÁCH TIẾT" cho bài dạy với số lượng: ${formData.duration} tiết.
- Quy chuẩn thời lượng theo quy định của Bộ Giáo dục & Đào tạo:
  * ${isPrimaryTemplate ? 'Cấp TIỂU HỌC: 35 phút / 1 tiết' : 'Cấp THCS & THPT: 45 phút / 1 tiết'}.
- Tổng thời lượng toàn bộ bài dạy: ${totalMinutes} phút (${formData.duration} tiết x ${periodMinutes} phút).

QUY TẮC BẮT BUỘC KHI XÂY DỰNG MỤC III (TIẾN TRÌNH DẠY HỌC):
1. BẮT BUỘC CHIA TIẾN TRÌNH DẠY HỌC THÀNH ĐÚNG ${periodCount} TIẾT HỌC RÕ RÀNG:
   Mục III (${isPrimaryTemplate ? 'CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU' : 'TIẾN TRÌNH DẠY HỌC'}) BẮT BUỘC phải được chia thành từng tiêu đề Tiết học riêng biệt:
${Array.from({ length: periodCount }, (_, i) => `   ### TIẾT ${i + 1} (Thời lượng: ${periodMinutes} phút)`).join('\n')}

2. PHÂN BỔ HOẠT ĐỘNG VÀ THỜI LƯỢNG CHI TIẾT CHO TỪNG TIẾT:
   - Trong mỗi Tiết học, phải ghi rõ thời lượng (phút) cho từng hoạt động con, và tổng thời gian các hoạt động trong tiết đó BẮT BUỘC cộng lại đúng bằng ${periodMinutes} phút.
   - Ví dụ gợi ý phân bổ tiến trình theo tiết:
     + TIẾT 1 (${periodMinutes} phút):
       * Hoạt động 1: Mở đầu / Khởi động (khoảng 5 - 7 phút)
       * Hoạt động 2 (hoặc phần đầu của Hoạt động 2: Hoạt động 2.1, Hoạt động 2.2,...): Khám phá, chiếm lĩnh kiến thức trọng tâm phần 1 (khoảng 25 - 28 phút)
       * Củng cố, nhận xét ngắn gọn và dặn dò chuẩn bị cho Tiết sau (khoảng 2 - 3 phút)
     ${periodCount > 1 ? `+ TIẾT 2 (${periodMinutes} phút):
       * Khởi động / Kết nối hoặc kiểm tra ngắn bài cũ (khoảng 3 - 5 phút)
       * Hoạt động 2 tiếp theo (Hoạt động 2.3,...) hoặc Hoạt động 3: Luyện tập, thực hành (khoảng 20 - 25 phút)
       * Hoạt động 4: Vận dụng / Trải nghiệm (khoảng 10 - 15 phút)
       * Tổng kết tiết học và dặn dò về nhà (khoảng 2 - 3 phút)` : ''}
     ${periodCount > 2 ? `+ Các Tiết tiếp theo (Tiết 3, Tiết 4...): Phân bổ tiếp tục các mạch kiến thức khám phá, các bài thực hành nâng cao, luyện tập chuyên sâu hoặc dự án học tập, tổng kết bài dạy.` : ''}
3. Mỗi hoạt động trong từng Tiết học vẫn phải tuân thủ nghiêm ngặt đầy đủ cấu trúc chuẩn (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện ${isTwoColumn ? 'theo bảng Markdown 2 cột' : 'theo 4 bước của Công văn ' + (isPrimaryTemplate ? '2345' : '5512')}).`
    : '';

  const structureOutputTemplate = isPrimaryTemplate
    ? `CẤU TRÚC TỔNG THỂ CỦA VĂN BẢN PHẢI TRẢ VỀ (CẤP TIỂU HỌC - CÔNG VĂN 2345):
BẮT BUỘC ĐẶT BẢNG 1 Ô CHỨA ĐÚNG 7 DÒNG CĂN LỀ GIỮA Ở ĐẦU BÀI SOẠN:
${headerTableBlock}

I. YÊU CẦU CẦN ĐẠT (MỤC TIÊU BÀI HỌC)
1. Kiến thức, kĩ năng
2. Về năng lực (Năng lực chung & Năng lực đặc thù ${formData.includeDigitalCompetence ? '& Năng lực số [Mã chỉ báo]' : ''})
3. Về phẩm chất

II. ĐỒ DÙNG DẠY HỌC (THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU)
1. Giáo viên: ...
2. Học sinh: ...

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (TIẾN TRÌNH DẠY HỌC)
${formData.splitPeriods ? `(ĐƯỢC CHIA TÁCH THÀNH ${periodCount} TIẾT: TIẾT 1 (${periodMinutes} phút), TIẾT 2 (${periodMinutes} phút)...)` : `1. Hoạt động 1: Mở đầu / Khởi động (Kết nối)
2. Hoạt động 2: Hình thành kiến thức mới (Khám phá) (Hoạt động 2.1, Hoạt động 2.2...)
3. Hoạt động 3: Luyện tập, thực hành
4. Hoạt động 4: Vận dụng, trải nghiệm`}

IV. ĐỊNH HƯỚNG ĐÁNH GIÁ VÀ ĐIỀU CHỈNH SAU BÀI DẠY
1. Đánh giá học sinh (theo Thông tư 27/2020/TT-BGDĐT)
2. Điều chỉnh sau bài dạy

${sectionVText}

BẮT BUỘC KẾT THÚC BẰNG BẢNG 3 CỘT KÝ TÊN CĂN LỀ GIỮA:
${signatureTableBlock}`
    : `CẤU TRÚC TỔNG THỂ CỦA VĂN BẢN PHẢI TRẢ VỀ (CẤP THCS & THPT - CÔNG VĂN 5512):
BẮT BUỘC ĐẶT BẢNG 1 Ô CHỨA ĐÚNG 7 DÒNG CĂN LỀ GIỮA Ở ĐẦU BÀI SOẠN:
${headerTableBlock}

I. MỤC TIÊU
1. Về kiến thức
2. Về năng lực
3. Về phẩm chất

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU

III. TIẾN TRÌNH DẠY HỌC
${formData.splitPeriods ? `(ĐƯỢC CHIA TÁCH THÀNH ${periodCount} TIẾT: TIẾT 1 (${periodMinutes} phút), TIẾT 2 (${periodMinutes} phút)...)` : `1. Hoạt động 1: Xác định vấn đề/nhiệm vụ học tập/Mở đầu
2. Hoạt động 2: Hình thành kiến thức mới
3. Hoạt động 3: Luyện tập
4. Hoạt động 4: Vận dụng`}

IV. KẾT LUẬN VÀ DẶN DÒ

${sectionVText}

BẮT BUỘC KẾT THÚC BẰNG BẢNG 3 CỘT KÝ TÊN CĂN LỀ GIỮA:
${signatureTableBlock}`;

  const coreContentInstruction = formData.coreContent && formData.coreContent.trim()
    ? `
========================================================================
[NỘI DUNG CỐT LÕI VÀ YÊU CẦU CỤ THỂ DO GIÁO VIÊN NHẬP (PHẦN 1)]:
========================================================================
"${formData.coreContent.trim()}"

QUY TẮC BẮT BUỘC KHI XỬ LÝ NỘI DUNG DO GIÁO VIÊN NHẬP:
1. NGUYÊN TẮC TÔN TRỌNG TUYỆT ĐỐI MỤC TIÊU VỀ KIẾN THỨC:
   - NẾU trong nội dung giáo viên nhập ở trên có chứa MỤC TIÊU VỀ KIẾN THỨC / YÊU CẦU CẦN ĐẠT VỀ KIẾN THỨC (hoặc kiến thức, kĩ năng cần đạt):
   -> AI BẮT BUỘC PHẢI TÔN TRỌNG TUYỆT ĐỐI, GIỮ NGUYÊN VẸN VÀ ĐƯA ĐẦY ĐỦ TOÀN BỘ CÁC MỤC TIÊU NÀY vào phần "1. Về kiến thức" (đối với THCS/THPT) hoặc "1. Kiến thức, kĩ năng" (đối với Tiểu học) trong Mục I (Mục tiêu / Yêu cầu cần đạt).
   -> TUYỆT ĐỐI KHÔNG tự ý thay thế, cắt xén, lược bỏ hay làm sai lệch mục tiêu kiến thức do giáo viên đã chỉ định.
   -> Đồng thời, toàn bộ các hoạt động trong Mục III (Tiến trình dạy học) PHẢI được thiết kế bám sát để giúp học sinh đạt được chính xác các mục tiêu kiến thức này.
2. Bám sát toàn bộ các mục kiến thức trọng tâm, dàn ý, tiến trình hoặc yêu cầu cụ thể mà giáo viên đã cung cấp để biên soạn bài dạy.
3. NGUYÊN TẮC ƯU TIÊN TUYỆT ĐỐI VỀ MÃ NĂNG LỰC (NĂNG LỰC SỐ VÀ NĂNG LỰC AI):
   - Nếu trong nội dung giáo viên nhập ở trên có yêu cầu hoặc chứa các MÃ NĂNG LỰC CỤ THỂ (bao gồm mã Năng lực số theo CV 3456 ví dụ 1.1.${nlsLevel}a, 6.1.${nlsLevel}b,... hoặc mã Năng lực AI theo QĐ 2422 ví dụ ${formData.grade}.A1.1, ${formData.grade}.C2.1,...):
   -> AI BẮT BUỘC PHẢI ƯU TIÊN TUYỆT ĐỐI VÀ CHỈ SỬ DỤNG ĐÚNG NHỮNG MÃ NĂNG LỰC MÀ GIÁO VIÊN ĐÃ YÊU CẦU trong cả Mục I (Mục tiêu năng lực) và Mục III (Tiến trình dạy học).
   -> TUYỆT ĐỐI KHÔNG tự ý tạo thêm hoặc chèn thêm bất kỳ mã năng lực nào khác ngoài các mã giáo viên đã yêu cầu.`
    : '';

  return `
${systemExpertRole}

${coreContentInstruction}
${layoutInstruction}
${languageInstruction}
${textbookInstruction}
${specialSubjectInstruction}
${objectiveInstruction}
${digitalCompetenceInstruction}
${gdqpInstruction}
${hsktInstruction}
${ai2422Instruction}
${stemInstruction}
${customIntegrationInstruction}
${splitPeriodsInstruction}

${teacherHeader}

YÊU CẦU CỰC KỲ QUAN TRỌNG VỀ ĐỊNH DẠNG CÔNG THỨC VÀ KÝ HIỆU (TOÁN HỌC, VẬT LÝ, HÓA HỌC, KHOA HỌC TỰ NHIÊN, CÔNG NGHỆ...):
LƯU Ý BẮT BUỘC: Áp dụng các quy tắc định dạng công thức chuẩn hóa dưới đây cho TOÀN BỘ nội dung Kế hoạch bài dạy từ Phần I đến Phần V (gồm Mục tiêu, Thiết bị, Tiến trình các hoạt động, Dặn dò và Phụ lục/Sơ đồ/Timeline...), áp dụng trong cả Kế hoạch bài dạy 1 CỘT và 2 CỘT (cả Cột 1 "Hoạt động của GV và HS" và Cột 2 "Sản phẩm dự kiến"):

0. QUY ĐỊNH CHUẨN HÓA KÝ HIỆU & CÔNG THỨC THEO CHƯƠNG TRÌNH GDPT VIỆT NAM:
   - Với các kí hiệu, công thức phải sử dụng đúng chuẩn Cấp học, Lớp học, Môn học quy ước hiện hành đúng chuẩn Chương trình giáo dục ở Việt Nam quy định (Chương trình GDPT 2018 hiện hành).

1. NGUYÊN TẮC ƯU TIÊN TUYỆT ĐỐI SỬ DỤNG UNICODE THUẦN TÚY CHO CÁC KÝ HIỆU & BIỂU THỨC ĐƠN GIẢN:
   - Tất cả các ký hiệu toán học phổ thông, quan hệ tập hợp, so sánh, lũy thừa đơn giản, chỉ số dưới, đơn vị đo và độ BẮT BUỘC viết TRỰC TIẾP bằng ký tự UNICODE chuẩn trong văn bản.
   - TUYỆT ĐỐI KHÔNG bọc các ký hiệu đơn giản này trong dấu '$' (nghiêm cấm viết dạng '$∈$', '$∉$', '($∈$)', '$M ∈ d$', '$A \in d$').
   - HÃY VIẾT THẲNG DẠNG UNICODE SẠCH SẼ:
     + Ký hiệu thuộc, không thuộc, tập hợp: 'kí hiệu thuộc (∈), không thuộc (∉)', 'M ∈ d', 'N ∉ d', 'A ∈ d, B ∈ d, C ∉ d', 'x ∈ ℝ', 'n ∈ ℕ', 'A ⊂ B', 'A ∩ B', 'A ∪ B', '∅'...
     + Ký hiệu so sánh & phép tính: '≤', '≥', '≠', '≈', '±', '×', '÷', '∞', '∥', '⟂', 'a = b', 'x ≤ 5', 'x ≥ 0', 'x ≠ 0'...
     + Lũy thừa và chỉ số dưới đơn giản: 'x²', 'x³', 'aⁿ', '10⁻³', '10⁶', 'x₁', 'x₂', 'y₀', 'uₙ', 'H₂O', 'CO₂', 'CaCO₃', 'H₂SO₄', '30°', '90°', '15 cm', '20 m²', '12 m³', '50 kg'...
   - Quy ước cấp 1 (Tiểu học - TH): Các phép toán nhân dùng dấu x hoặc ×, phép toán chia dùng dấu hai chấm :

2. CHỈ SỬ DỤNG LATEX TRONG DÒNG ($...$) KHI CÔNG THỨC CÓ CẤU TRÚC PHỨC TẠP:
   - Chỉ dùng LaTeX khi biểu thức có cấu trúc nhiều tầng phức tạp mà Unicode không thể hiển thị đẹp:
     + Phân số: $\\frac{a+b}{c+d}$, $\\dfrac{1}{2}$
     + Căn thức nhiều tầng: $\\sqrt{x^2+1}$, $\\sqrt{\\frac{a}{b}}$, $\\sqrt[3]{x}$
     + Hệ phương trình: $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$
     + Tích phân, tổng, giới hạn: $\\int_{0}^{1} x^2 \\, dx$, $\\sum_{i=1}^{n} i$, $\\lim_{x \\to 0} \\frac{\\sin x}{x}$
     + Ma trận, định thức: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
   - NGUYÊN TẮC AN TOÀN LATEX:
     + LUÔN LUÔN đóng cặp dấu '$' cân bằng hoàn chỉnh (mỗi công thức phức tạp là '$công_thức$').
     + TUYỆT ĐỐI KHÔNG để lọt chữ tiếng Việt có dấu vào trong cặp '$...$'.
     + KHÔNG sử dụng '$$...$$', '\\[...\\]' hoặc '\\begin{aligned}...\\end{aligned}'. Chỉ dùng LaTeX trong dòng dạng '$...$'.

3. QUY TRÌNH VẼ NÉT VÀ QUY ƯỚC HÌNH HỌC:
   - Tam giác viết dưới dạng ΔABC; các điểm viết A, B, C; đoạn thẳng AB; đường thẳng a; tia Ox; hai đường thẳng song song viết AB ∥ CD; vuông góc viết AB ⟂ CD.
   - ĐẶC BIỆT DÀNH CHO GÓC: Ký hiệu góc LUÔN LUÔN sử dụng LaTeX biểu diễn dạng $\\widehat{A}$, $\\widehat{B}$, $\\widehat{ABC}$ hoặc viết góc A, góc B, góc ABC (TUYỆT ĐỐI KHÔNG dùng ký hiệu ∠A hoặc ∠ABC).
   - Ký hiệu vectơ: sử dụng LaTeX biểu diễn dạng $\\vec{a}$, $\\vec{u}$, $\\overrightarrow{AB}$.

4. QUY CÁCH TRÌNH BÀY LỜI GIẢI & CHỨNG MINH:
   - Mỗi bước biến đổi trình bày trên một dòng riêng nếu cần để bảo đảm rõ ràng.
   - TUYỆT ĐỐI KHÔNG sử dụng ký hiệu ⇒ trong lời giải mà thay bằng từ "Suy ra". Ví dụ: "Suy ra AB = CD".
   - Các ghi chú như (gt), (cmt), (đpcm), (đối đỉnh), (so le trong)... được đặt BÊN NGOÀI công thức/biểu thức toán học.

5. QUY ĐỊNH BẮT BUỘC VỀ SỐ MŨ (LŨY THỪA) TRONG CÔNG THỨC:
   - TUYỆT ĐỐI KHÔNG xuất công thức hay biểu thức số mũ dưới dạng chữ thô mụ như 'a^x', 'a^-x', '10^-3', '10^-6'.
   - Tất cả biểu thức chứa số mũ (lũy thừa) PHẢI dùng ký tự chỉ số trên (Unicode superscript): x², x³, aⁿ, aˣ, a⁻ˣ, 10⁻³, 10⁻⁶, m², cm³... thể hiện rõ số mũ x hay số mũ âm -x.
   - Hoặc nếu là công thức toán phức tạp trong dòng: '$a^{x+1}$', '$e^{-x^2}$'... (luôn bọc số mũ trong dấu '{...}').

YÊU CẦU VỀ TRÌNH BÀY:
- KHÔNG sử dụng ký hiệu Markdown (#, ##, **).
- Trình bày theo phân cấp: I, 1, a, gạch đầu dòng.

${structureOutputTemplate}`;
};

/**
 * Danh sách thứ tự ưu tiên các mô hình AI theo chuẩn hệ thống:
 * - Mô hình chính: gemini-3.8-flash
 * - Mô hình phụ: gemini-3.1-flash-lite
 */
export const AI_MODELS_CASCADE = [
  'gemini-3.8-flash',      // Mô hình chính
  'gemini-3.1-flash-lite'  // Mô hình phụ
];

const sleep = (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Tạo độ trễ ngẫu nhiên mượt mà trong khoảng minMs - maxMs
 */
const randomDelay = (minMs: number, maxMs: number): Promise<void> => {
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return sleep(ms);
};

/**
 * Tự động phát hiện trạng thái nghẽn mạng, quá tải (429/500/502/503/504) hoặc chạm hạn mức (Quota / Rate Limit)
 */
const isTransientOrQuotaError = (err: any): boolean => {
  const errMsg = (err?.message || String(err || '')).toLowerCase();
  const status = err?.status || err?.statusCode || 0;
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    errMsg.includes('429') ||
    errMsg.includes('quota') ||
    errMsg.includes('rate limit') ||
    errMsg.includes('resource_exhausted') ||
    errMsg.includes('overloaded') ||
    errMsg.includes('503') ||
    errMsg.includes('500') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('fetch failed') ||
    errMsg.includes('network') ||
    errMsg.includes('timeout') ||
    errMsg.includes('deadline')
  );
};

/**
 * Kiểm tra lỗi cấu hình API Key không hợp lệ
 */
const isInvalidApiKeyError = (err: any): boolean => {
  const errMsg = (err?.message || String(err || '')).toLowerCase();
  return (
    errMsg.includes('api_key_invalid') ||
    errMsg.includes('api key not valid') ||
    errMsg.includes('invalid api key') ||
    errMsg.includes('unauthenticated') ||
    errMsg.includes('permission_denied')
  );
};

/**
 * Cơ chế gọi AI thông minh (Intelligent Fallback & Backoff):
 * - Tự động phát hiện trạng thái quá tải hoặc giới hạn yêu cầu (429 Rate Limit/Quota).
 * - Thiết lập thời gian chờ tối ưu (1.2s - 2.5s) trước khi tự động chuyển tiếp mượt mà sang mô hình phụ tiếp theo.
 * - Cơ chế thử lại chu trình với thuật toán giãn cách thời gian (Exponential Backoff: 3.5s – 7.0s) nếu toàn bộ chuỗi mô hình gặp lúc nghẽn mạng từ Google.
 */
export const callGeminiWithIntelligentFallback = async <T>(
  ai: GoogleGenAI,
  callFn: (modelName: string) => Promise<T>,
  options?: {
    models?: string[];
    maxCycles?: number;
    taskName?: string;
  }
): Promise<T> => {
  const models = options?.models || AI_MODELS_CASCADE;
  const maxCycles = options?.maxCycles || 2;
  const taskName = options?.taskName || 'AI Generation';
  let lastError: any = null;

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];
      try {
        const result = await callFn(modelName);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`[${taskName}] [Chu trình ${cycle}/${maxCycles}] Lỗi với mô hình ${modelName}:`, error?.message || error);

        // Lỗi API Key không hợp lệ -> dừng ngay để người dùng chỉnh sửa
        if (isInvalidApiKeyError(error)) {
          throw new Error("Lỗi API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra cấu hình trong phần cài đặt.");
        }

        // Tự động phát hiện trạng thái quá tải hoặc giới hạn yêu cầu (429 Rate Limit/Quota)
        if (isTransientOrQuotaError(error)) {
          if (i < models.length - 1) {
            console.info(`[${taskName}] Phát hiện trạng thái quá tải hoặc giới hạn yêu cầu (429 Rate Limit/Quota) từ ${modelName}. Thiết lập thời gian chờ tối ưu (1.2s - 2.5s) trước khi tự động chuyển tiếp mượt mà sang mô hình phụ tiếp theo: ${models[i + 1]}...`);
            await randomDelay(1200, 2500);
            continue;
          }
        } else {
          // Các lỗi tạm thời khác nếu còn mô hình phụ tiếp theo
          if (i < models.length - 1) {
            console.info(`[${taskName}] Lỗi từ ${modelName}. Thiết lập thời gian chờ tối ưu (1.2s - 2.5s) trước khi chuyển tiếp sang mô hình ${models[i + 1]}...`);
            await randomDelay(1200, 2500);
            continue;
          }
        }
      }
    }

    // Cơ chế thử lại chu trình với thuật toán giãn cách thời gian (Exponential Backoff: 3.5s – 7.0s) nếu toàn bộ chuỗi mô hình gặp lúc nghẽn mạng từ Google
    if (cycle < maxCycles && isTransientOrQuotaError(lastError)) {
      const backoffMultiplier = Math.pow(1.5, cycle - 1);
      const minBackoff = Math.round(3500 * backoffMultiplier);
      const maxBackoff = Math.round(7000 * backoffMultiplier);
      console.warn(`[${taskName}] Toàn bộ chuỗi ${models.length} mô hình gặp lúc nghẽn mạng từ Google. Thử lại chu trình với thuật toán giãn cách thời gian (Exponential Backoff: ${(minBackoff / 1000).toFixed(1)}s – ${(maxBackoff / 1000).toFixed(1)}s) trước chu trình ${cycle + 1}...`);
      await randomDelay(minBackoff, maxBackoff);
    }
  }

  if (isTransientOrQuotaError(lastError)) {
    throw new Error("Hệ thống máy chủ Gemini đang quá tải hoặc đạt giới hạn lưu lượng (Rate Limit/Quota). Hệ thống đã tự động thử qua toàn bộ các mô hình dự phòng. Vui lòng đợi 1-2 phút rồi thử lại.");
  }

  throw new Error(lastError?.message || "Lỗi kết nối AI hoặc nội dung vi phạm chính sách. Vui lòng thử lại với nội dung khác.");
};

export const generateLessonPlan = async (formData: LessonPlanFormData, userApiKey?: string, teacherInfo?: TeacherInfo): Promise<string> => {
  // Use userApiKey if provided, otherwise fallback to env variable safely
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
  
  if (!apiKey) {
    throw new Error("Thiếu API Key. Vui lòng cấu hình trong phần cài đặt.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const basePrompt = buildPrompt(formData, teacherInfo);

  // Prepare multimodal parts for attached files (PDF, images, docx)
  const parts: any[] = [];

  if (formData.attachedFiles && formData.attachedFiles.length > 0) {
    for (const file of formData.attachedFiles) {
      if ((file.type === 'pdf' || file.type === 'image') && file.dataBase64) {
        const cleanBase64 = file.dataBase64.includes(',') ? file.dataBase64.split(',')[1] : file.dataBase64;
        parts.push({
          inlineData: {
            mimeType: file.mimeType || (file.type === 'pdf' ? 'application/pdf' : 'image/jpeg'),
            data: cleanBase64
          }
        });
      }
    }
  }

  let attachmentPromptSupplement = '';
  if (formData.attachedFiles && formData.attachedFiles.length > 0) {
    const textExtractedFiles = formData.attachedFiles.filter(f => f.extractedText && f.extractedText.trim());
    if (textExtractedFiles.length > 0) {
      attachmentPromptSupplement += `\n\nNỘI DUNG VĂN BẢN ĐÃ BÓC TÁCH TỪ CÁC TỆP TÀI LIỆU NGUỒN ĐÍNH KÈM:\n`;
      for (const file of textExtractedFiles) {
        attachmentPromptSupplement += `\n--- [FILE NGUỒN: ${file.name}] ---\n${file.extractedText}\n--- [KẾT THÚC FILE: ${file.name}] ---\n`;
      }
    }

    const attachedNames = formData.attachedFiles.map(f => f.name).join(', ');
    attachmentPromptSupplement += `\n\n[YÊU CẦU ĐẶC BIỆT VỀ BÓC TÁCH VÀ SỬ DỤNG TÀI LIỆU NGUỒN ĐÍNH KÈM]:
Người dùng đã đính kèm ${formData.attachedFiles.length} tệp tài liệu nguồn (${attachedNames}).
1. NGUYÊN TẮC TÔN TRỌNG TUYỆT ĐỐI MỤC TIÊU KIẾN THỨC TỪ TỆP ĐÍNH KÈM:
   - NẾU trong các tệp tài liệu đính kèm (hoặc phần văn bản bóc tách) có chứa MỤC TIÊU VỀ KIẾN THỨC / YÊU CẦU CẦN ĐẠT VỀ KIẾN THỨC (hoặc các chuẩn kiến thức bài học):
   -> AI BẮT BUỘC PHẢI TÔN TRỌNG TUYỆT ĐỐI, GIỮ NGUYÊN VẸN VÀ TRÍCH XUẤT ĐẦY ĐỦ TOÀN BỘ CÁC MỤC TIÊU KIẾN THỨC NÀY vào phần "1. Về kiến thức" (đối với THCS/THPT) hoặc "1. Kiến thức, kĩ năng" (đối với Tiểu học) trong Mục I.
   -> TUYỆT ĐỐI KHÔNG tự ý thay đổi, cắt xén, bỏ bớt hoặc suy diễn làm sai lệch mục tiêu kiến thức có trong tài liệu đính kèm.
2. Bóc tách, phân tích kỹ toàn bộ nội dung, kiến thức trọng tâm, bảng biểu, hình ảnh, bài tập trong các tệp tài liệu đính kèm (bao gồm file PDF, Hình ảnh và dữ liệu văn bản bóc tách) để tổng hợp, trích xuất và biên soạn Kế hoạch bài dạy đầy đủ, chi tiết và chính xác nhất theo đúng nguồn dữ liệu này.
3. NGUYÊN TẮC ƯU TIÊN VỀ MÃ NĂNG LỰC TRONG TỆP ĐÍNH KÈM (NĂNG LỰC SỐ VÀ NĂNG LỰC AI):
   - Nếu trong các tệp tài liệu đính kèm có nêu hoặc yêu cầu các mã năng lực cụ thể (năng lực số theo CV 3456, năng lực AI theo QĐ 2422):
   -> AI BẮT BUỘC PHẢI ƯU TIÊN TUYỆT ĐỐI VÀ CHỈ SỬ DỤNG ĐÚNG CÁC MÃ NĂNG LỰC ĐƯỢC CHỈ ĐỊNH trong tệp tài liệu đính kèm vào bài soạn, TUYỆT ĐỐI KHÔNG tự ý sinh thêm các mã khác ngoài tài liệu.`;
  }

  // Graphic Objects Integration Instructions
  if (formData.extractGraphics && formData.extractedGraphics && formData.extractedGraphics.length > 0) {
    const graphicsSummary = formData.extractedGraphics.map((g, idx) => {
      const insertCode = `HINH_${idx + 1}`;
      const labelInfo = g.figureLabel ? `\n  - Nhãn hình SGK: "${g.figureLabel}"` : '';
      const directivesInfo = g.matchedDirectives && g.matchedDirectives.length > 0 
        ? `\n  - Cụm từ lệnh/chỉ dẫn phát hiện trong SGK: [${g.matchedDirectives.map(d => `"${d}"`).join(', ')}]` 
        : '';
      const contextInfo = g.suggestedContext ? `\n  - Đề xuất hoạt động sư phạm: "${g.suggestedContext}"` : '';
      return `• [MÃ CHÈN BẮT BUỘC: ${insertCode}] (ID: ${g.id})${labelInfo}${directivesInfo}
  - Tiêu đề hình: "${g.title}"
  - Nội dung khoa học / chi tiết hình vẽ: "${g.caption || ''}"${contextInfo}
  - Nguồn trích xuất: ${g.sourceFileName}`;
    }).join('\n\n');

    if (formData.graphicInsertMode === 'auto') {
      attachmentPromptSupplement += `\n\n========================================================================
[BÓC TÁCH VÀ TỰ ĐỘNG CHÈN ĐỐI TƯỢNG ĐỒ HỌA/HÌNH ẢNH SÁCH GIÁO KHOA VÀO BÀI DẠY]:
========================================================================
Hệ thống đã phân tích, quét chỉ dẫn SGK và bóc tách được ${formData.extractedGraphics.length} đối tượng đồ họa / hình ảnh minh họa từ tài liệu/sách giáo khoa đính kèm:

${graphicsSummary}

QUY TẮC SƯ PHẠM BẮT BUỘC VỀ BÁM SÁT CÂU LỆNH CHỈ DẪN & TỰ ĐỘNG CHÈN HÌNH ẢNH:
1. BÁM SÁT TUYỆT ĐỐI CÁC CÂU LỆNH / CHỈ DẪN SGK ĐỂ CHÈN ĐÚNG VỊ TRÍ:
   - Khi trong bài dạy xuất hiện câu phát vấn, nhiệm vụ học tập chứa cụm từ dạng:
     * "Quan sát hình a, b, c...", "Quan sát các hình a, b..."
     * "Quan sát hình 1, 2, 3...", "Quan sát hình 1, hình 2..."
     * "Quan sát hình 1.1, hình 1.2...", "Quan sát hình 2.1, 2.2..."
     * "Dựa vào hình X...", "Từ hình X hãy...", "Xem hình X..."
   -> BẮT BUỘC TỰ ĐỘNG CHÈN NGAY ảnh minh họa tương ứng \`![Tiêu đề hình](HINH_X)\` ngay sau hoặc ngay dưới câu lệnh phát vấn đó trong cột "Hoạt động của GV - HS" (Bước 1: Chuyển giao nhiệm vụ).

2. XỬ LÝ LỆNH ĐA HÌNH ("quan sát hình a, b, c" hoặc "quan sát hình 1.1 và 1.2"):
   - Khi câu lệnh yêu cầu học sinh quan sát nhiều hình cùng lúc (ví dụ: Hình a, Hình b hoặc Hình 1.1, Hình 1.2):
     -> Bạn PHẢI chèn lần lượt các hình ảnh tương ứng theo đúng thứ tự:
        ![Hình a: ...](HINH_1)
        ![Hình b: ...](HINH_2)
        ![Hình c: ...](HINH_3)
   - Sau đó đặt hệ thống câu hỏi so sánh, đối chiếu, phân tích từng hình cụ thể.

3. TỔ CHỨC HOẠT ĐỘNG HỌC TẬP GẮN LIỀN VỚI HÌNH ẢNH (BẮT BUỘC THEO 4 BƯỚC):
   - **Bước 1: Chuyển giao nhiệm vụ**:
     + GV: Trình chiếu/yêu cầu HS quan sát hình ảnh:
       ![Tên hình ảnh](HINH_X)
     + GV nêu hệ thống câu hỏi/nhiệm vụ gắn liền với các chi tiết, ký hiệu trên hình.
   - **Bước 2: Thực hiện nhiệm vụ**:
     + HS quan sát kỹ các chi tiết trên hình ảnh minh họa, làm việc cá nhân/cặp đôi/nhóm để giải quyết nhiệm vụ.
   - **Bước 3: Báo cáo, thảo luận**:
     + Đại diện HS lên bảng chỉ trực tiếp trên hình ảnh / sơ đồ hoặc trình bày câu trả lời dựa trên hình.
   - **Bước 4: Kết luận, nhận định & Sản phẩm học tập**:
     + Chuẩn hóa chính xác câu trả lời và kiến thức trọng tâm học sinh rút ra được khi quan sát các hình ảnh minh họa.

4. CÚ PHÁP CHÈN BẮT BUỘC:
   - Đặt trên một dòng riêng: \`![Tiêu đề hình ảnh](HINH_X)\` (Ví dụ: \`![Hình 1.1: Cấu tạo tế bào](HINH_1)\`, \`![Hình 1.2: Sơ đồ thí nghiệm](HINH_2)\`...).
   - Trong bảng 2 cột: Đặt trong cột "Nội dung / Hoạt động của GV - HS" tại Bước 1 (Chuyển giao nhiệm vụ).
   - Tuyệt đối không xuất link URL website giả định, không chèn link web thô ngoài danh sách mã HINH_X đã cung cấp.`;
    } else {
      attachmentPromptSupplement += `\n\n[BÓC TÁCH ĐỐI TƯỢNG ĐỒ HỌA - CHẾ ĐỘ THỦ CÔNG]:
Đã bóc tách ${formData.extractedGraphics.length} đối tượng đồ họa từ tài liệu đính kèm. Giáo viên sẽ tự chọn vị trí con trỏ để chèn hình ảnh trong bài dạy. Hãy thiết kế bài soạn có các hoạt động trực quan gắn liền với học liệu hình ảnh minh họa.`;
    }
  }

  const finalPrompt = basePrompt + attachmentPromptSupplement;
  parts.push({ text: finalPrompt });

  const contentsPayload = parts.length > 1 ? { parts } : finalPrompt;

  const resultText = await callGeminiWithIntelligentFallback(
    ai,
    async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contentsPayload,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.7,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            },
            {
              category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            }
          ]
        }
      });
      const text = response.text || '';
      if (!text.trim()) {
        throw new Error(`Mô hình ${modelName} trả về kết quả rỗng`);
      }
      return text;
    },
    { taskName: 'Soạn Kế Hoạch Bài Dạy' }
  );

  return resultText;
};

export const generateSlideOutline = async (
  plan: string,
  formData?: LessonPlanFormData,
  teacherInfo?: TeacherInfo,
  userApiKey?: string
): Promise<SlideItem[]> => {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';

  if (!apiKey) {
    throw new Error("Thiếu API Key. Vui lòng cấu hình trong phần cài đặt.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const lessonTitle = formData?.lessonTitle || "Bài học";
  const subject = formData?.subject || "";
  const grade = formData?.grade || "";
  const textbook = formData?.textbook || "";
  const schoolName = teacherInfo?.schoolName || "TRƯỜNG HỌC";
  const teacherName = teacherInfo?.teacherName || "GIÁO VIÊN";
  const department = teacherInfo?.department || "TỔ CHUYÊN MÔN";

  let infographicInstruction = '';
  if (formData?.includeInfographic) {
    infographicInstruction = `
- YÊU CẦU ĐẶC BIỆT KHI BẬT TÙY CHỌN "INFOGRAPHIC - MINDMAP":
  * Trong danh sách các Slide đề xuất, BẮT BUỘC TẠO THÊM 01 SLIDE RIÊNG BIỆT DÀNH CHO TÓM TẮT BÀI HỌC BẰNG INFOGRAPHIC / MINDMAP đặt ngay tại phần Kết luận kiến thức của bài học (hoặc ngay trước/sau phần Luyện tập, thuộc phần tổng kết bài học).
  * Tiêu đề Slide (title): "TÓM TẮT NỘI DUNG BÀI HỌC (INFOGRAPHIC - MINDMAP)".
  * Subtitle: "Sơ đồ tư duy & Trực quan hóa kiến thức trọng tâm bài ${lessonTitle}".
  * bulletPoints: Tóm tắt 3 - 5 nhánh kiến thức chính / sơ đồ tư duy / quy trình tổng quan của bài học ${lessonTitle}.
  * aiImagePrompt: BẮT BUỘC thiết kế một Prompt AI chuyên sâu chi tiết bằng cả Tiếng Việt và Tiếng Anh để tạo ảnh Infographic - Mindmap tóm tắt toàn bộ bài học (ví dụ: "Infographic - Mindmap poster tóm tắt sơ đồ tư duy các nhánh kiến thức trọng tâm bài ${lessonTitle} môn ${subject}... / A modern high-resolution educational Infographic Mindmap poster summarizing key concepts of ${lessonTitle} with colorful branches, vector icons, and clear visual structure").
  * teacherNotes: Hướng dẫn Giáo viên chiếu Slide Infographic - Mindmap này ở phần kết luận để củng cố và chốt kiến thức trực quan cho học sinh.`;
  }

  const prompt = `
Bạn là chuyên gia thiết kế bài giảng điện tử (Slide PowerPoint/Canva) xuất sắc và chuyên nghiệp.
Dựa vào Kế hoạch bài dạy (KHBD) dưới đây, hãy lập danh sách đề xuất các Slide bài giảng chi tiết đầy đủ, đồng bộ hoàn toàn và BÁM SÁT CHI TIẾT THEO "III. TIẾN TRÌNH DẠY HỌC" cùng "IV. KẾT LUẬN VÀ DẶN DÒ".

THÔNG TIN BÀI HỌC:
- Tên bài dạy: ${lessonTitle}
- Môn học: ${subject} - Lớp: ${grade} - Bộ sách: ${textbook}
- Trường: ${schoolName}
- Giáo viên thực hiện: ${teacherName} (Tổ: ${department})

CẤU TRÚC BẮT BUỘC VỀ SỐ LƯỢNG VÀ PHÂN BỔ TRANG SLIDE:

1. TRANG ĐẦU (Slide 1): TRANG GIỚI THIỆU VÀ CHÀO HỎI
   - title: "${schoolName.toUpperCase()} - MÔN ${subject.toUpperCase()} LỚP ${grade}"
   - subtitle: "BÀI DẠY: ${lessonTitle.toUpperCase()}"
   - bulletPoints: ["Giáo viên thực hiện: ${teacherName}", "Tổ chuyên môn: ${department}", "Nhiệt liệt chào mừng Quý Thầy Cô và các em học sinh đến với tiết học!"]
   - aiImagePrompt: "Gợi ý ảnh nền slide chào mừng học sinh sinh động, ấm áp, phong cách minh họa giáo dục 3D tươi sáng / A welcoming bright 3D educational classroom slide background"

2. CÁC TRANG NỘI DUNG (Từ Slide 2 đến Slide N-2): BÁM SÁT CHI TIẾT "III. TIẾN TRÌNH DẠY HỌC"
   QUY TẮC BẮT BUỘC VỀ NỘI DUNG VÀ PHÂN TÁCH SLIDE:
   - TUYỆT ĐỐI BỎ QUA HOÀN TOÀN phần "I. Mục tiêu bài học" và "II. Thiết bị dạy học/Đồ dùng dạy học". Không tạo slide riêng cho 2 phần này.
   - Bám sát từng Hoạt động học tập trong "III. TIẾN TRÌNH DẠY HỌC" (Khởi động, Các hoạt động Khám phá kiến thức mới, Luyện tập/Thực hành, Vận dụng).
   - ĐẶC BIỆT NGHÊM NGẶT - TÁCH BẠCH SLIDE CHO MỖI HOẠT ĐỘNG:
     * Slide "Chuyển giao nhiệm vụ": Nêu rõ nhiệm vụ Giáo viên giao, câu hỏi đặt ra, yêu cầu thảo luận, bài tập hoặc phiếu học tập.
     * Slide "Sản phẩm dự kiến / Kết quả thực hiện": BẮT BUỘC TÁCH SLIDE RIÊNG BIỆT với Slide Chuyển giao nhiệm vụ. Trình bày chi tiết sản phẩm dự kiến học sinh cần hoàn thành, đáp án, kết quả thảo luận hoặc bảng tổng hợp kiến thức.
     * Slide "Kết luận & Nhận định": Trình bày rõ ràng nội dung Giáo viên chốt kiến thức cốt lõi, đánh giá, nhận định và dặn dò lưu ý quan trọng.

3. TRANG "KẾT LUẬN VÀ DẶN DÒ" (Slide N-1): CHI TIẾT THEO MỤC "IV. KẾT LUẬN VÀ DẶN DÒ"
   - title: "KẾT LUẬN VÀ DẶN DÒ"
   - subtitle: "Tóm tắt bài học & Hướng dẫn tự học ở nhà"
   - bulletPoints: Liệt kê các điểm kiến thức chốt toàn bài, nhiệm vụ học tập về nhà, bài tập cần hoàn thành, học liệu/bài mới cần chuẩn bị cho tiết sau.
   - teacherNotes: Nhắc nhở Giáo viên tổng kết tiết học và khen thưởng/động viên học sinh.
   - aiImagePrompt: "Ảnh minh họa cuốn sách mở ra sáng lung linh, đồng hồ bấm giờ học tập và ngôi sao thưởng / 3D illustration of glowing open book and study timer"

4. TRANG CUỐI (Slide N): TRANG CẢM ƠN VÀ CHÀO TẠM BIỆT
   - title: "XIN CHÂN THÀNH CẢM ƠN!"
   - subtitle: "KÍNH CHÚC QUÝ THẦY CÔ SỨC KHỎE - CHÚC CÁC EM HỌC TỐT!"
   - bulletPoints: ["Trân trọng cảm ơn sự theo dõi và hợp tác của Quý Thầy Cô và các em!", "Bài học kết thúc tại đây."]
   - aiImagePrompt: "Gợi ý ảnh cảm ơn kết thúc bài giảng rực rỡ, hoa mây, không khí tích cực / A beautiful thank you presentation slide background with vibrant flowers"

YÊU CẦU ĐẶC BIỆT DÀNH CHO 'aiImagePrompt' Ở CHÂN TRANG (FOOTER):
- Mỗi Slide BẮT BUỘC phải có trường 'aiImagePrompt' mô tả chi tiết bằng cả Tiếng Việt và Tiếng Anh làm gợi ý Prompt AI sinh ảnh nền/ảnh minh họa cho Slide đó.${infographicInstruction}

QUY TẮC CÔNG THỨC TOÁN HỌC, VẬT LÝ, HÓA HỌC & KÝ HIỆU TRÊN SLIDE:
- Ưu tiên sử dụng Unicode cho biểu thức đơn giản (x², x³, H₂O, a₁, ≤, ≥, ≠, ≈, ±, ×, ÷...). KHÔNG chuyển biểu thức đơn giản sang LaTeX.
- Chỉ sử dụng LaTeX trong dòng ($ ... $) khi biểu thức có cấu trúc phức tạp.
- Tam giác viết ΔABC, song song AB ∥ CD, góc biểu diễn bằng LaTeX $\widehat{ABC}$.

NỘI DUNG KHBD CẦN PHÂN TÍCH VÀ ĐỀ XUẤT SLIDE:
${plan.slice(0, 12000)}

ĐỊNH DẠNG ĐẦU RA:
Trả về đúng một mảng JSON các đối tượng Slide (không kèm markdown block hay text ngoài):
[
  {
    "slideNumber": 1,
    "title": "string",
    "subtitle": "string",
    "bulletPoints": ["string"],
    "teacherNotes": "string",
    "aiImagePrompt": "string"
  }
]
`;

  try {
    const slideItems = await callGeminiWithIntelligentFallback(
      ai,
      async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            temperature: 0.6,
            responseMimeType: "application/json"
          }
        });

        const text = response.text || '';
        const cleanedJsonText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJsonText) as SlideItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        throw new Error(`Định dạng JSON slide không hợp lệ từ ${modelName}`);
      },
      { taskName: 'Tạo Gợi Ý Slide Bài Giảng' }
    );

    if (Array.isArray(slideItems) && slideItems.length > 0) {
      return slideItems;
    }
  } catch (err) {
    console.warn('Lỗi sinh đề xuất Slide từ AI, kích hoạt bộ Slide chuẩn sư phạm dự phòng:', err);
  }

  const fallbackSlides: SlideItem[] = [
    {
      slideNumber: 1,
      title: `${schoolName.toUpperCase()} - MÔN ${subject.toUpperCase()} LỚP ${grade}`,
      subtitle: `BÀI DẠY: ${lessonTitle.toUpperCase()}`,
      bulletPoints: [
        `Giáo viên thực hiện: ${teacherName}`,
        `Tổ chuyên môn: ${department}`,
        "Chào mừng Quý Thầy Cô và các em học sinh đến với tiết học hôm nay!"
      ],
      aiImagePrompt: "Ảnh minh họa không gian lớp học hiện đại, đồ họa 3D giáo dục tươi sáng / A bright 3D modern educational classroom scene"
    },
    {
      slideNumber: 2,
      title: "HOẠT ĐỘNG KHỞI ĐỘNG - CHUYỂN GIAO NHIỆM VỤ",
      subtitle: "Tạo không khí sôi nổi và đặt vấn đề vào bài học",
      bulletPoints: [
        "Nhiệm vụ Giáo viên giao: Quan sát hình ảnh / câu hỏi tình huống / trò chơi khởi động.",
        "Yêu cầu học sinh suy nghĩ cá nhân hoặc thảo luận nhanh cặp đôi.",
        "Đặt ra mục tiêu và vấn đề cần giải quyết của bài học mới."
      ],
      teacherNotes: "Dẫn dắt học sinh vào bài học một cách tự nhiên, kích thích sự tò mò.",
      aiImagePrompt: "Hình ảnh nhóm học sinh hào hứng tham gia trò chơi tương tác trực quan / Happy students engaging in an interactive learning activity, 3D render style"
    },
    {
      slideNumber: 3,
      title: "HOẠT ĐỘNG KHỞI ĐỘNG - SẢN PHẨM & KẾT LUẬN",
      subtitle: "Kết quả thực hiện & Dẫn dắt bài mới",
      bulletPoints: [
        "Sản phẩm dự kiến: Câu trả lời ban đầu của học sinh về tình huống/câu hỏi.",
        "Kết luận nhận định của Giáo viên: Nhận xét câu trả lời, chốt ý dẫn dắt chính thức vào tên bài học."
      ],
      teacherNotes: "Khen ngợi tinh thần phát biểu của học sinh và chuyển sang Hoạt động Khám phá.",
      aiImagePrompt: "Hình ảnh bóng đèn phát sáng đại diện cho ý tưởng mới / Glowing lightbulb representing new learning ideas"
    },
    {
      slideNumber: 4,
      title: "KHÁM PHÁ KIẾN THỨC MỚI - CHUYỂN GIAO NHIỆM VỤ",
      subtitle: "Nhiệm vụ học tập trọng tâm",
      bulletPoints: [
        "Nhiệm vụ Giáo viên giao: Đọc SGK, quan sát học liệu/trực quan/video.",
        "Yêu cầu thảo luận nhóm / phân công công việc cụ thể cho từng thành viên.",
        "Hoàn thành các câu hỏi trong phiếu học tập."
      ],
      teacherNotes: "Giáo viên theo dõi, hỗ trợ các nhóm gặp khó khăn.",
      aiImagePrompt: "Hình ảnh các học sinh ngồi theo nhóm thảo luận tích cực / Students in small groups collaborating on a task, 3D illustration"
    },
    {
      slideNumber: 5,
      title: "KHÁM PHÁ KIẾN THỨC MỚI - SẢN PHẨM DỰ KIẾN",
      subtitle: "Kết quả thực hiện nhiệm vụ khám phá",
      bulletPoints: [
        "Sản phẩm dự kiến: Đáp án chi tiết các câu hỏi trong phiếu học tập.",
        "Bảng tổng hợp kết quả thảo luận nhóm / nội dung báo cáo đại diện.",
        "Các sơ đồ, công thức, quy tắc được rút ra từ bài học."
      ],
      teacherNotes: "Cho đại diện nhóm trình bày, các nhóm khác nhận xét, bổ sung.",
      aiImagePrompt: "Hình ảnh sơ đồ tư duy 3D minh họa kiến thức khoa học bài học / A 3D mind map representing core knowledge and concept discovery"
    },
    {
      slideNumber: 6,
      title: "KHÁM PHÁ KIẾN THỨC MỚI - KẾT LUẬN & CHỐT KIẾN THỨC",
      subtitle: "Nội dung nhận định & Kiến thức cốt lõi",
      bulletPoints: [
        "Đánh giá của Giáo viên: Nhận xét quá trình làm việc và chất lượng sản phẩm của học sinh.",
        "Kiến thức cốt lõi chốt lại: Học sinh ghi chép vào vở các định nghĩa, quy tắc, công thức chuẩn xác."
      ],
      teacherNotes: "Chốt kiến thức chuẩn xác và ghi bảng / chiếu slide ghi nhớ.",
      aiImagePrompt: "Hình ảnh biểu tượng tri thức, huy hiệu hoàn thành bài học 3D / 3D knowledge badge and key takeaway illustration"
    },
    {
      slideNumber: 7,
      title: "LUYỆN TẬP & THỰC HÀNH - NHIỆM VỤ VÀ SẢN PHẨM",
      subtitle: "Củng cố và áp dụng trực tiếp kiến thức",
      bulletPoints: [
        "Nhiệm vụ Giáo viên giao: Giải bài tập / câu hỏi trắc nghiệm / bài tập thực hành.",
        "Sản phẩm dự kiến: Lời giải chi tiết, kết quả thực hành đúng chuẩn của học sinh.",
        "Kết luận nhận định: Sửa lỗi sai thường gặp, chốt phương pháp giải nhanh."
      ],
      teacherNotes: "Cử học sinh lên bảng trình bày hoặc chấm xác suất bài tập tại chỗ.",
      aiImagePrompt: "Hình ảnh phiếu học tập, sách vở và các dụng cụ thực hành đầy màu sắc / Bright practice worksheet and colorful learning tools"
    }
  ];

  if (formData?.includeInfographic) {
    fallbackSlides.push({
      slideNumber: 8,
      title: "TÓM TẮT NỘI DUNG BÀI HỌC (INFOGRAPHIC - MINDMAP)",
      subtitle: `Sơ đồ tư duy & Trực quan hóa kiến thức trọng tâm bài ${lessonTitle}`,
      bulletPoints: [
        `Nhánh 1: Các khái niệm cơ bản và quy tắc trọng tâm của bài học ${lessonTitle}.`,
        `Nhánh 2: Phương pháp giải bài tập, ứng dụng thực tiễn môn ${subject}.`,
        "Nhánh 3: Các lưu ý quan trọng, lỗi sai cần tránh khi làm bài."
      ],
      teacherNotes: "Trình chiếu Slide Infographic - Mindmap để học sinh tổng kết, ghi nhớ kiến thức toàn bài một cách hệ thống và trực quan.",
      aiImagePrompt: `Infographic - Mindmap poster tóm tắt sơ đồ tư duy các nhánh kiến thức trọng tâm bài ${lessonTitle} môn ${subject} / A modern high-resolution educational Infographic Mindmap poster summarizing key concepts of ${lessonTitle} with colorful branches, vector icons, and clear visual structure`
    });
  }

  const nextSlideNum = fallbackSlides.length + 1;
  fallbackSlides.push(
    {
      slideNumber: nextSlideNum,
      title: "IV. KẾT LUẬN VÀ DẶN DÒ",
      subtitle: "Tóm tắt bài học & Hướng dẫn tự học ở nhà",
      bulletPoints: [
        "Tóm tắt kết luận: Khái quát lại toàn bộ kiến thức trọng tâm của bài học.",
        "Vận dụng thực tế: Liên hệ bài học với cuộc sống xung quanh.",
        "Hướng dẫn tự học: Hoàn thành bài tập về nhà, chuẩn bị học liệu cho bài học tiếp theo."
      ],
      teacherNotes: "Nhắc nhở học sinh ôn lại kiến thức và ghi chép bài tập về nhà đầy đủ.",
      aiImagePrompt: "Hình ảnh cuốn sách mở ra phát sáng lung linh kèm ngôi sao thưởng / Glowing open book with homework and assignment icons"
    },
    {
      slideNumber: nextSlideNum + 1,
      title: "XIN CHÂN THÀNH CẢM ƠN!",
      subtitle: "KÍNH CHÚC QUÝ THẦY CÔ SỨC KHỎE - CHÚC CÁC EM HỌC TỐT!",
      bulletPoints: [
        "Trân trọng cảm ơn sự theo dõi và hợp tác của Quý Thầy Cô và các em!",
        "Hẹn gặp lại ở các tiết học tiếp theo."
      ],
      aiImagePrompt: "Hình ảnh lời cảm ơn rực rỡ với hoa tươi, ánh sáng ấm áp và trái tim yêu thương / A beautiful thank you slide background with vibrant flowers and warm lights"
    }
  );

  return fallbackSlides;
};
