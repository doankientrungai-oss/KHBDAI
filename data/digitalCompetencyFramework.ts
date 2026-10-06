/**
 * TÊN FILE: digitalCompetencyFramework.ts
 * MÔ TẢ: Khung Năng lực số chuẩn hoá dành cho học sinh từ Lớp 1 đến Lớp 12
 * NGUỒN: Thông tư 02/2025/TT-BGDĐT (đối chiếu qua Công văn 3456/BGDĐT-GDPT)
 * CẤU TRÚC: 6 Miền năng lực, 23 Năng lực thành phần, 5 Bậc trình độ (CB1, CB2, TC1, TC2, NC1)
 */

export interface DigitalDomain {
  code: string;
  name: string;
  description: string;
}

export interface DigitalCompetency {
  code: string;
  domainCode: string;
  name: string;
  description: string;
}

export interface DigitalLevel {
  code: 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1';
  name: string;
  levelIndex: number;
  gradeRange: string;
  grades: number[];
  sourceLevel: 'Bậc 1' | 'Bậc 2' | 'Bậc 3' | 'Bậc 4' | 'Bậc 5';
  schoolLevel: 'Tiểu học' | 'THCS' | 'THPT';
  description: string;
}

export interface DigitalIndicatorItem {
  code: string; // VD: "1.1.CB1a", "2.1.TC1a", "6.1.NC1a"
  topicId: string; // VD: "1.1"
  topicName: string;
  topicDescription: string;
  domainId: string; // VD: "1"
  domainName: string;
  levelCode: 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1';
  levelName: string;
  gradeRange: string;
  sourceLevel: string; // VD: "Bậc 1"
  grades: number[];
  indicator: string; // VD: "a", "b", "c", "d"
  contentTopic: string;
  requirement: string;
  sourceDocument: string;
  verified: boolean;

  // Thuộc tính tương thích ngược (aliases)
  domainCode: string;
  competencyCode: string;
  competencyName: string;
  competencyDescription: string;
  achievementRequirement: string;
}

export const DIGITAL_FRAMEWORK_METADATA = {
  title: "Bộ mã năng lực số lớp 1 đến lớp 12",
  version: "1.0",
  language: "vi-VN",
  source: "Thông tư 02/2025/TT-BGDĐT (đối chiếu qua Công văn 3456/BGDĐT-GDPT)"
};

export const DIGITAL_DOMAINS: Record<string, string> = {
  "1": "Khai thác dữ liệu và thông tin",
  "2": "Giao tiếp và hợp tác trong môi trường số",
  "3": "Sáng tạo nội dung số",
  "4": "An toàn",
  "5": "Giải quyết vấn đề",
  "6": "Ứng dụng trí tuệ nhân tạo"
};

export const DOMAINS_LIST: DigitalDomain[] = [
  { 
    code: '1', 
    name: 'Khai thác dữ liệu và thông tin', 
    description: 'Duyệt, tìm kiếm, lọc, đánh giá và quản lý dữ liệu, thông tin và nội dung số' 
  },
  { 
    code: '2', 
    name: 'Giao tiếp và hợp tác trong môi trường số', 
    description: 'Tương tác, chia sẻ, cộng tác, ứng xử chuẩn mực và quản lý danh tính số' 
  },
  { 
    code: '3', 
    name: 'Sáng tạo nội dung số', 
    description: 'Phát triển, chỉnh sửa, tích hợp nội dung số, bản quyền và lập trình' 
  },
  { 
    code: '4', 
    name: 'An toàn', 
    description: 'Bảo vệ thiết bị, dữ liệu cá nhân, quyền riêng tư, an sinh số và môi trường' 
  },
  { 
    code: '5', 
    name: 'Giải quyết vấn đề', 
    description: 'Xử lý sự cố kỹ thuật, lựa chọn giải pháp công nghệ, sáng tạo số và cải thiện NLS' 
  },
  { 
    code: '6', 
    name: 'Ứng dụng trí tuệ nhân tạo', 
    description: 'Hiểu biết về AI/GenAI, sử dụng AI có trách nhiệm và đánh giá các công cụ AI' 
  }
];

export const DIGITAL_COMPETENCIES: Record<string, { domainCode: string; name: string; description: string }> = {
  // Miền 1: Khai thác dữ liệu và thông tin
  "1.1": {
    domainCode: "1",
    name: "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số",
    description: "Xác định được nhu cầu thông tin, tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số, truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm."
  },
  "1.2": {
    domainCode: "1",
    name: "Đánh giá dữ liệu, thông tin và nội dung số",
    description: "Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số."
  },
  "1.3": {
    domainCode: "1",
    name: "Quản lý dữ liệu, thông tin và nội dung số",
    description: "Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc."
  },

  // Miền 2: Giao tiếp và hợp tác trong môi trường số
  "2.1": {
    domainCode: "2",
    name: "Tương tác thông qua công nghệ số",
    description: "Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể."
  },
  "2.2": {
    domainCode: "2",
    name: "Chia sẻ thông tin và nội dung thông qua công nghệ số",
    description: "Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết về thực hành trích dẫn và ghi chú nguồn."
  },
  "2.3": {
    domainCode: "2",
    name: "Sử dụng công nghệ số để thực hiện trách nhiệm công dân",
    description: "Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp."
  },
  "2.4": {
    domainCode: "2",
    name: "Hợp tác thông qua công nghệ số",
    description: "Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức."
  },
  "2.5": {
    domainCode: "2",
    name: "Quy tắc ứng xử trên mạng",
    description: "Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số. Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức được sự đa dạng về văn hóa và thế hệ trong môi trường số."
  },
  "2.6": {
    domainCode: "2",
    name: "Quản lý danh tính số",
    description: "Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số."
  },

  // Miền 3: Sáng tạo nội dung số
  "3.1": {
    domainCode: "3",
    name: "Phát triển nội dung số",
    description: "Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số."
  },
  "3.2": {
    domainCode: "3",
    name: "Tích hợp và tạo lập lại nội dung số",
    description: "Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp."
  },
  "3.3": {
    domainCode: "3",
    name: "Thực thi bản quyền và giấy phép",
    description: "Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số."
  },
  "3.4": {
    domainCode: "3",
    name: "Lập trình",
    description: "Lập kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể."
  },

  // Miền 4: An toàn
  "4.1": {
    domainCode: "4",
    name: "Bảo vệ thiết bị",
    description: "Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư."
  },
  "4.2": {
    domainCode: "4",
    name: "Bảo vệ dữ liệu cá nhân và quyền riêng tư",
    description: "Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng \"Chính sách Quyền riêng tư\" để thông báo phương thức sử dụng dữ liệu cá nhân."
  },
  "4.3": {
    domainCode: "4",
    name: "Bảo vệ sức khỏe và an sinh số",
    description: "Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
  },
  "4.4": {
    domainCode: "4",
    name: "Bảo vệ môi trường",
    description: "Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường."
  },

  // Miền 5: Giải quyết vấn đề
  "5.1": {
    domainCode: "5",
    name: "Giải quyết các vấn đề kỹ thuật",
    description: "Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn)."
  },
  "5.2": {
    domainCode: "5",
    name: "Xác định nhu cầu và giải pháp công nghệ",
    description: "Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận)."
  },
  "5.3": {
    domainCode: "5",
    name: "Sử dụng sáng tạo công nghệ số",
    description: "Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số."
  },
  "5.4": {
    domainCode: "5",
    name: "Xác định các vấn đề cần cải thiện về năng lực số",
    description: "Hiểu được năng lực số của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển năng lực số của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số."
  },

  // Miền 6: Ứng dụng trí tuệ nhân tạo (AI)
  "6.1": {
    domainCode: "6",
    name: "Hiểu biết về AI (trong đó có Gen AI)",
    description: "Hiểu được cách AI ảnh hưởng đến cuộc sống hằng ngày và vai trò của AI trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI."
  },
  "6.2": {
    domainCode: "6",
    name: "Sử dụng AI có đạo đức và trách nhiệm",
    description: "Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày."
  },
  "6.3": {
    domainCode: "6",
    name: "Đánh giá các công cụ AI",
    description: "Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động."
  }
};

export const LEVEL_MAPPING: Record<'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1', DigitalLevel> = {
  "CB1": {
    code: "CB1",
    name: "Cơ bản 1",
    levelIndex: 1,
    gradeRange: "lớp 1–3",
    grades: [1, 2, 3],
    sourceLevel: "Bậc 1",
    schoolLevel: "Tiểu học",
    description: "Dành riêng cho Lớp 1, Lớp 2, Lớp 3 (Cấp Tiểu học - Bậc 1)"
  },
  "CB2": {
    code: "CB2",
    name: "Cơ bản 2",
    levelIndex: 2,
    gradeRange: "lớp 4–5",
    grades: [4, 5],
    sourceLevel: "Bậc 2",
    schoolLevel: "Tiểu học",
    description: "Dành riêng cho Lớp 4, Lớp 5 (Cấp Tiểu học - Bậc 2)"
  },
  "TC1": {
    code: "TC1",
    name: "Trung cấp 1",
    levelIndex: 3,
    gradeRange: "lớp 6–7",
    grades: [6, 7],
    sourceLevel: "Bậc 3",
    schoolLevel: "THCS",
    description: "Dành riêng cho Lớp 6, Lớp 7 (Cấp THCS - Bậc 3)"
  },
  "TC2": {
    code: "TC2",
    name: "Trung cấp 2",
    levelIndex: 4,
    gradeRange: "lớp 8–9",
    grades: [8, 9],
    sourceLevel: "Bậc 4",
    schoolLevel: "THCS",
    description: "Dành riêng cho Lớp 8, Lớp 9 (Cấp THCS - Bậc 4)"
  },
  "NC1": {
    code: "NC1",
    name: "Nâng cao 1",
    levelIndex: 5,
    gradeRange: "lớp 10–12",
    grades: [10, 11, 12],
    sourceLevel: "Bậc 5",
    schoolLevel: "THPT",
    description: "Dành riêng cho Lớp 10, Lớp 11, Lớp 12 (Cấp THPT - Bậc 5)"
  }
};

/**
 * Danh mục chuẩn xác từng chỉ báo Năng lực số lớp 1 đến lớp 12
 * theo Thông tư 02/2025/TT-BGDĐT & Công văn 3456/BGDĐT-GDPT
 */
const RAW_INDICATOR_DATA: Array<{
  code: string;
  topicId: string;
  levelCode: 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1';
  indicator: string;
  requirement: string;
}> = [
  // ==========================
  // CƠ BẢN 1 (CB1 - Lớp 1, 2, 3)
  // ==========================
  { code: "1.1.CB1a", topicId: "1.1", levelCode: "CB1", indicator: "a", requirement: "Xác định được nhu cầu thông tin, tìm kiếm dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số." },
  { code: "1.1.CB1b", topicId: "1.1", levelCode: "CB1", indicator: "b", requirement: "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng." },
  { code: "1.1.CB1c", topicId: "1.1", levelCode: "CB1", indicator: "c", requirement: "Xác định được các chiến lược tìm kiếm đơn giản." },
  { code: "1.2.CB1a", topicId: "1.2", levelCode: "CB1", indicator: "a", requirement: "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số." },
  { code: "1.3.CB1a", topicId: "1.3", levelCode: "CB1", indicator: "a", requirement: "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số." },
  { code: "1.3.CB1b", topicId: "1.3", levelCode: "CB1", indicator: "b", requirement: "Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc." },
  { code: "2.1.CB1a", topicId: "2.1", levelCode: "CB1", indicator: "a", requirement: "Lựa chọn được các công nghệ số đơn giản để tương tác." },
  { code: "2.1.CB1b", topicId: "2.1", levelCode: "CB1", indicator: "b", requirement: "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể." },
  { code: "2.2.CB1a", topicId: "2.2", levelCode: "CB1", indicator: "a", requirement: "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số." },
  { code: "2.2.CB1b", topicId: "2.2", levelCode: "CB1", indicator: "b", requirement: "Nhận biết được tham chiếu và ghi chú nguồn cơ bản." },
  { code: "2.3.CB1a", topicId: "2.3", levelCode: "CB1", indicator: "a", requirement: "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội." },
  { code: "2.3.CB1b", topicId: "2.3", levelCode: "CB1", indicator: "b", requirement: "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân." },
  { code: "2.4.CB1a", topicId: "2.4", levelCode: "CB1", indicator: "a", requirement: "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình cộng tác." },
  { code: "2.5.CB1a", topicId: "2.5", levelCode: "CB1", indicator: "a", requirement: "Phân biệt được chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.CB1b", topicId: "2.5", levelCode: "CB1", indicator: "b", requirement: "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số." },
  { code: "2.5.CB1c", topicId: "2.5", levelCode: "CB1", indicator: "c", requirement: "Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số." },
  { code: "2.6.CB1a", topicId: "2.6", levelCode: "CB1", indicator: "a", requirement: "Xác định được danh tính số." },
  { code: "2.6.CB1b", topicId: "2.6", levelCode: "CB1", indicator: "b", requirement: "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân." },
  { code: "2.6.CB1c", topicId: "2.6", levelCode: "CB1", indicator: "c", requirement: "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số." },
  { code: "3.1.CB1a", topicId: "3.1", levelCode: "CB1", indicator: "a", requirement: "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản." },
  { code: "3.1.CB1b", topicId: "3.1", levelCode: "CB1", indicator: "b", requirement: "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản." },
  { code: "3.2.CB1a", topicId: "3.2", levelCode: "CB1", indicator: "a", requirement: "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo." },
  { code: "3.3.CB1a", topicId: "3.3", levelCode: "CB1", indicator: "a", requirement: "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số." },
  { code: "3.4.CB1a", topicId: "3.4", levelCode: "CB1", indicator: "a", requirement: "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản." },
  { code: "4.1.CB1a", topicId: "4.1", levelCode: "CB1", indicator: "a", requirement: "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản." },
  { code: "4.1.CB1b", topicId: "4.1", levelCode: "CB1", indicator: "b", requirement: "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số." },
  { code: "4.1.CB1c", topicId: "4.1", levelCode: "CB1", indicator: "c", requirement: "Chọn lựa được các biện pháp an toàn và bảo mật đơn giản." },
  { code: "4.1.CB1d", topicId: "4.1", levelCode: "CB1", indicator: "d", requirement: "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.CB1a", topicId: "4.2", levelCode: "CB1", indicator: "a", requirement: "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.CB1b", topicId: "4.2", levelCode: "CB1", indicator: "b", requirement: "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác." },
  { code: "4.2.CB1c", topicId: "4.2", levelCode: "CB1", indicator: "c", requirement: "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số." },
  { code: "4.3.CB1a", topicId: "4.3", levelCode: "CB1", indicator: "a", requirement: "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số." },
  { code: "4.3.CB1b", topicId: "4.3", levelCode: "CB1", indicator: "b", requirement: "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số." },
  { code: "4.3.CB1c", topicId: "4.3", levelCode: "CB1", indicator: "c", requirement: "Nhận biết được những công nghệ số đơn giản giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.CB1a", topicId: "4.4", levelCode: "CB1", indicator: "a", requirement: "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường." },
  { code: "5.1.CB1a", topicId: "5.1", levelCode: "CB1", indicator: "a", requirement: "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số." },
  { code: "5.1.CB1b", topicId: "5.1", levelCode: "CB1", indicator: "b", requirement: "Xác định được các giải pháp đơn giản để giải quyết chúng." },
  { code: "5.2.CB1a", topicId: "5.2", levelCode: "CB1", indicator: "a", requirement: "Xác định được nhu cầu cá nhân." },
  { code: "5.2.CB1b", topicId: "5.2", levelCode: "CB1", indicator: "b", requirement: "Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.CB1c", topicId: "5.2", levelCode: "CB1", indicator: "c", requirement: "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.CB1a", topicId: "5.3", levelCode: "CB1", indicator: "a", requirement: "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm." },
  { code: "5.3.CB1b", topicId: "5.3", levelCode: "CB1", indicator: "b", requirement: "Thể hiện được sự quan tâm của cá nhân và tập thể đến quá trình xử lý nhận thức đơn giản để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số." },
  { code: "5.4.CB1a", topicId: "5.4", levelCode: "CB1", indicator: "a", requirement: "Nhận ra được năng lực số của tôi cần được cải thiện hoặc cập nhật ở đâu." },
  { code: "5.4.CB1b", topicId: "5.4", levelCode: "CB1", indicator: "b", requirement: "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số." },
  // Lưu ý: Theo Phụ lục CV 3456/BGDĐT-GDPT, Năng lực 6.1 ở Bậc 1 (CB1 - Lớp 1, 2, 3) để trống (không có mã 6.1.CB1a/b).
  { code: "6.2.CB1a", topicId: "6.2", levelCode: "CB1", indicator: "a", requirement: "Nhận diện được các công cụ AI đơn giản." },
  { code: "6.2.CB1b", topicId: "6.2", levelCode: "CB1", indicator: "b", requirement: "Thực hiện được các thao tác cơ bản với các công cụ AI." },
  { code: "6.2.CB1c", topicId: "6.2", levelCode: "CB1", indicator: "c", requirement: "Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI." },
  { code: "6.3.CB1a", topicId: "6.3", levelCode: "CB1", indicator: "a", requirement: "Nhận diện được một số vật dụng/trò chơi thông minh có sử dụng AI." },
  { code: "6.3.CB1b", topicId: "6.3", levelCode: "CB1", indicator: "b", requirement: "Nhớ được rằng không phải mọi thông tin từ máy móc đều đúng." },

  // ==========================
  // CƠ BẢN 2 (CB2 - Lớp 4, 5)
  // ==========================
  { code: "1.1.CB2a", topicId: "1.1", levelCode: "CB2", indicator: "a", requirement: "Xác định được nhu cầu thông tin." },
  { code: "1.1.CB2b", topicId: "1.1", levelCode: "CB2", indicator: "b", requirement: "Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số." },
  { code: "1.1.CB2c", topicId: "1.1", levelCode: "CB2", indicator: "c", requirement: "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng." },
  { code: "1.1.CB2d", topicId: "1.1", levelCode: "CB2", indicator: "d", requirement: "Xác định được các chiến lược tìm kiếm đơn giản." },
  { code: "1.2.CB2a", topicId: "1.2", levelCode: "CB2", indicator: "a", requirement: "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số." },
  { code: "1.3.CB2a", topicId: "1.3", levelCode: "CB2", indicator: "a", requirement: "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số." },
  { code: "1.3.CB2b", topicId: "1.3", levelCode: "CB2", indicator: "b", requirement: "Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc." },
  { code: "2.1.CB2a", topicId: "2.1", levelCode: "CB2", indicator: "a", requirement: "Lựa chọn được các công nghệ số đơn giản để tương tác." },
  { code: "2.1.CB2b", topicId: "2.1", levelCode: "CB2", indicator: "b", requirement: "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể." },
  { code: "2.2.CB2a", topicId: "2.2", levelCode: "CB2", indicator: "a", requirement: "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số." },
  { code: "2.2.CB2b", topicId: "2.2", levelCode: "CB2", indicator: "b", requirement: "Nhận biết được tham chiếu và ghi chú nguồn cơ bản." },
  { code: "2.3.CB2a", topicId: "2.3", levelCode: "CB2", indicator: "a", requirement: "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội." },
  { code: "2.3.CB2b", topicId: "2.3", levelCode: "CB2", indicator: "b", requirement: "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân." },
  { code: "2.4.CB2a", topicId: "2.4", levelCode: "CB2", indicator: "a", requirement: "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác." },
  { code: "2.5.CB2a", topicId: "2.5", levelCode: "CB2", indicator: "a", requirement: "Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.CB2b", topicId: "2.5", levelCode: "CB2", indicator: "b", requirement: "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số." },
  { code: "2.5.CB2c", topicId: "2.5", levelCode: "CB2", indicator: "c", requirement: "Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số." },
  { code: "2.6.CB2a", topicId: "2.6", levelCode: "CB2", indicator: "a", requirement: "Xác định được danh tính số." },
  { code: "2.6.CB2b", topicId: "2.6", levelCode: "CB2", indicator: "b", requirement: "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân." },
  { code: "2.6.CB2c", topicId: "2.6", levelCode: "CB2", indicator: "c", requirement: "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số." },
  { code: "3.1.CB2a", topicId: "3.1", levelCode: "CB2", indicator: "a", requirement: "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản." },
  { code: "3.1.CB2b", topicId: "3.1", levelCode: "CB2", indicator: "b", requirement: "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản." },
  { code: "3.2.CB2a", topicId: "3.2", levelCode: "CB2", indicator: "a", requirement: "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo." },
  { code: "3.3.CB2a", topicId: "3.3", levelCode: "CB2", indicator: "a", requirement: "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số." },
  { code: "3.4.CB2a", topicId: "3.4", levelCode: "CB2", indicator: "a", requirement: "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản." },
  { code: "4.1.CB2a", topicId: "4.1", levelCode: "CB2", indicator: "a", requirement: "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản." },
  { code: "4.1.CB2b", topicId: "4.1", levelCode: "CB2", indicator: "b", requirement: "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số." },
  { code: "4.1.CB2c", topicId: "4.1", levelCode: "CB2", indicator: "c", requirement: "Tuân theo được các biện pháp an toàn và bảo mật đơn giản." },
  { code: "4.1.CB2d", topicId: "4.1", levelCode: "CB2", indicator: "d", requirement: "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.CB2a", topicId: "4.2", levelCode: "CB2", indicator: "a", requirement: "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.CB2b", topicId: "4.2", levelCode: "CB2", indicator: "b", requirement: "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác." },
  { code: "4.2.CB2c", topicId: "4.2", levelCode: "CB2", indicator: "c", requirement: "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số." },
  { code: "4.3.CB2a", topicId: "4.3", levelCode: "CB2", indicator: "a", requirement: "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số." },
  { code: "4.3.CB2b", topicId: "4.3", levelCode: "CB2", indicator: "b", requirement: "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số." },
  { code: "4.3.CB2c", topicId: "4.3", levelCode: "CB2", indicator: "c", requirement: "Nhận biết được những công nghệ số đơn giản giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.CB2a", topicId: "4.4", levelCode: "CB2", indicator: "a", requirement: "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường." },
  { code: "5.1.CB2a", topicId: "5.1", levelCode: "CB2", indicator: "a", requirement: "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số." },
  { code: "5.1.CB2b", topicId: "5.1", levelCode: "CB2", indicator: "b", requirement: "Xác định được các giải pháp đơn giản để giải quyết chúng." },
  { code: "5.2.CB2a", topicId: "5.2", levelCode: "CB2", indicator: "a", requirement: "Xác định được nhu cầu cá nhân." },
  { code: "5.2.CB2b", topicId: "5.2", levelCode: "CB2", indicator: "b", requirement: "Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.CB2c", topicId: "5.2", levelCode: "CB2", indicator: "c", requirement: "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.CB2a", topicId: "5.3", levelCode: "CB2", indicator: "a", requirement: "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm." },
  { code: "5.3.CB2b", topicId: "5.3", levelCode: "CB2", indicator: "b", requirement: "Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số." },
  { code: "5.4.CB2a", topicId: "5.4", levelCode: "CB2", indicator: "a", requirement: "Nhận ra được năng lực số của tôi cần được cải thiện hoặc cập nhật ở đâu." },
  { code: "5.4.CB2b", topicId: "5.4", levelCode: "CB2", indicator: "b", requirement: "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số." },
  { code: "6.1.CB2a", topicId: "6.1", levelCode: "CB2", indicator: "a", requirement: "Xác định được các khái niệm cơ bản của AI." },
  { code: "6.1.CB2b", topicId: "6.1", levelCode: "CB2", indicator: "b", requirement: "Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hàng ngày." },
  { code: "6.2.CB2a", topicId: "6.2", levelCode: "CB2", indicator: "a", requirement: "Áp dụng được các công cụ AI để giải quyết vấn đề đơn giản." },
  { code: "6.2.CB2b", topicId: "6.2", levelCode: "CB2", indicator: "b", requirement: "Tương tác được với các hệ thống AI cơ bản." },
  { code: "6.2.CB2c", topicId: "6.2", levelCode: "CB2", indicator: "c", requirement: "Tuân thủ các quy định pháp luật cơ bản khi sử dụng AI." },
  { code: "6.3.CB2a", topicId: "6.3", levelCode: "CB2", indicator: "a", requirement: "Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá." },
  { code: "6.3.CB2b", topicId: "6.3", levelCode: "CB2", indicator: "b", requirement: "Mô tả được các chức năng chính của hệ thống AI." },

  // ==========================
  // TRUNG CẤP 1 (TC1 - Lớp 6, 7)
  // ==========================
  { code: "1.1.TC1a", topicId: "1.1", levelCode: "TC1", indicator: "a", requirement: "Giải thích được nhu cầu thông tin." },
  { code: "1.1.TC1b", topicId: "1.1", levelCode: "TC1", indicator: "b", requirement: "Thực hiện được rõ ràng và theo quy trình các tìm kiếm để tìm dữ liệu, thông tin và nội dung trong môi trường số." },
  { code: "1.1.TC1c", topicId: "1.1", levelCode: "TC1", indicator: "c", requirement: "Giải thích được cách truy cập và điều hướng các kết quả tìm kiếm." },
  { code: "1.1.TC1d", topicId: "1.1", levelCode: "TC1", indicator: "d", requirement: "Giải thích được rõ ràng và theo quy trình chiến lược tìm kiếm." },
  { code: "1.2.TC1a", topicId: "1.2", levelCode: "TC1", indicator: "a", requirement: "Thực hiện phân tích, so sánh, đánh giá được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số đã được tổ chức rõ ràng." },
  { code: "1.2.TC1b", topicId: "1.2", levelCode: "TC1", indicator: "b", requirement: "Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số được xác định rõ ràng." },
  { code: "1.3.TC1a", topicId: "1.3", levelCode: "TC1", indicator: "a", requirement: "Lựa chọn được dữ liệu, thông tin và nội dung để tổ chức, lưu trữ và truy xuất chúng một cách thường xuyên trong môi trường số." },
  { code: "1.3.TC1b", topicId: "1.3", levelCode: "TC1", indicator: "b", requirement: "Sắp xếp chúng một cách trật tự trong một môi trường có cấu trúc." },
  { code: "2.1.TC1a", topicId: "2.1", levelCode: "TC1", indicator: "a", requirement: "Thực hiện được các tương tác được xác định rõ ràng và thường xuyên với các công nghệ số." },
  { code: "2.1.TC1b", topicId: "2.1", levelCode: "TC1", indicator: "b", requirement: "Lựa chọn được các phương tiện giao tiếp số phù hợp được xác định rõ ràng và phù hợp với quy trình cho một bối cảnh cụ thể." },
  { code: "2.2.TC1a", topicId: "2.2", levelCode: "TC1", indicator: "a", requirement: "Lựa chọn và xác định rõ các công nghệ số phù hợp để trao đổi dữ liệu, thông tin và nội dung số." },
  { code: "2.2.TC1b", topicId: "2.2", levelCode: "TC1", indicator: "b", requirement: "Giải thích với vai trò là người trung gian để chia sẻ thông tin và xác định rõ nội dung thông qua các công nghệ số." },
  { code: "2.2.TC1c", topicId: "2.2", levelCode: "TC1", indicator: "c", requirement: "Minh họa rõ ràng và thường xuyên các phương pháp tham chiếu và ghi chú nguồn." },
  { code: "2.3.TC1a", topicId: "2.3", levelCode: "TC1", indicator: "a", requirement: "Lựa chọn được các dịch vụ số được xác định rõ ràng và phổ biến để tham gia vào xã hội." },
  { code: "2.3.TC1b", topicId: "2.3", levelCode: "TC1", indicator: "b", requirement: "Xác định được các công nghệ số rõ ràng và thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân." },
  { code: "2.4.TC1a", topicId: "2.4", levelCode: "TC1", indicator: "a", requirement: "Lựa chọn được các công cụ và công nghệ số được xác định rõ ràng và thường xuyên cho các quá trình hợp tác." },
  { code: "2.5.TC1a", topicId: "2.5", levelCode: "TC1", indicator: "a", requirement: "Làm rõ được các chuẩn mực và bí quyết hành vi thông thường và được xác định rõ ràng trong khi sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.TC1b", topicId: "2.5", levelCode: "TC1", indicator: "b", requirement: "Thể hiện được các chiến lược giao tiếp thường xuyên và xác định rõ ràng phương thức giao tiếp phù hợp trong môi trường số." },
  { code: "2.5.TC1c", topicId: "2.5", levelCode: "TC1", indicator: "c", requirement: "Mô tả các khía cạnh đa dạng về văn hóa và thế hệ được xác định rõ ràng và thông thường cần xem xét trong môi trường số." },
  { code: "2.6.TC1a", topicId: "2.6", levelCode: "TC1", indicator: "a", requirement: "Phân biệt được một loạt các danh tính số thông thường và được xác định rõ ràng." },
  { code: "2.6.TC1b", topicId: "2.6", levelCode: "TC1", indicator: "b", requirement: "Giải thích được những cách được xác định rõ ràng và thường xuyên để bảo vệ danh tiếng trực tuyến của bản thân." },
  { code: "2.6.TC1c", topicId: "2.6", levelCode: "TC1", indicator: "c", requirement: "Mô tả dữ liệu được xác định rõ ràng mà bạn thường xuyên thu được thông qua các công cụ, môi trường hoặc dịch vụ số." },
  { code: "3.1.TC1a", topicId: "3.1", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được cách tạo và chỉnh sửa nội dung có khái niệm cụ thể và mang tính phổ thông bằng những định dạng rõ ràng, phổ biến." },
  { code: "3.1.TC1b", topicId: "3.1", levelCode: "TC1", indicator: "b", requirement: "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số thông thường và được xác định rõ ràng." },
  { code: "3.2.TC1a", topicId: "3.2", levelCode: "TC1", indicator: "a", requirement: "Giải thích được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục nội dung và thông tin mới được xác định rõ ràng để tạo ra những nội dung và thông tin mới và độc đáo." },
  { code: "3.3.TC1a", topicId: "3.3", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được các quy tắc thông thường và được xác định rõ ràng về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số." },
  { code: "3.4.TC1a", topicId: "3.4", levelCode: "TC1", indicator: "a", requirement: "Liệt kê được các hướng dẫn thông thường và được xác định rõ ràng cho một hệ thống máy tính để giải quyết các vấn đề thường ngày hoặc thực hiện các tác vụ thường ngày." },
  { code: "4.1.TC1a", topicId: "4.1", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được những cách thức cơ bản và phổ biến để bảo vệ thiết bị và nội dung số." },
  { code: "4.1.TC1b", topicId: "4.1", levelCode: "TC1", indicator: "b", requirement: "Phân biệt được những rủi ro và mối đe dọa cơ bản và phổ biến trong môi trường số." },
  { code: "4.1.TC1c", topicId: "4.1", levelCode: "TC1", indicator: "c", requirement: "Chọn lựa được các biện pháp an toàn và bảo mật rõ ràng và thường xuyên." },
  { code: "4.1.TC1d", topicId: "4.1", levelCode: "TC1", indicator: "d", requirement: "Chỉ ra được những cách thức cơ bản và phổ biến để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.TC1a", topicId: "4.2", levelCode: "TC1", indicator: "a", requirement: "Giải thích được các cách thức cơ bản và phổ biến để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.TC1b", topicId: "4.2", levelCode: "TC1", indicator: "b", requirement: "Giải thích được các cách thức cơ bản và phổ biến để sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn." },
  { code: "4.2.TC1c", topicId: "4.2", levelCode: "TC1", indicator: "c", requirement: "Chỉ ra được các tuyên bố cơ bản và phổ biến trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số." },
  { code: "4.3.TC1a", topicId: "4.3", levelCode: "TC1", indicator: "a", requirement: "Giải thích được những cách thức cơ bản và phổ biến để tránh rủi ro và đe dọa đối với sức khỏe thể chất và tinh thần khi sử dụng công nghệ số." },
  { code: "4.3.TC1b", topicId: "4.3", levelCode: "TC1", indicator: "b", requirement: "Lựa chọn được những cách thức cơ bản và phổ biến để bảo vệ bản thân khỏi nguy cơ trong môi trường số." },
  { code: "4.3.TC1c", topicId: "4.3", levelCode: "TC1", indicator: "c", requirement: "Chỉ ra được những công nghệ số cơ bản và phổ biến giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.TC1a", topicId: "4.4", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được những tác động cơ bản và phổ biến của công nghệ số và việc sử dụng công nghệ số đối với môi trường." },
  { code: "5.1.TC1a", topicId: "5.1", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được các vấn đề kỹ thuật thông thường và được xác định rõ ràng khi vận hành thiết bị và sử dụng môi trường số." },
  { code: "5.1.TC1b", topicId: "5.1", levelCode: "TC1", indicator: "b", requirement: "Chọn được các giải pháp được xác định rõ ràng và thông thường cho chúng." },
  { code: "5.2.TC1a", topicId: "5.2", levelCode: "TC1", indicator: "a", requirement: "Chỉ ra được những nhu cầu được xác định rõ ràng và thường xuyên." },
  { code: "5.2.TC1b", topicId: "5.2", levelCode: "TC1", indicator: "b", requirement: "Chọn được các công cụ số thông thường và được xác định rõ ràng cũng như các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.TC1c", topicId: "5.2", levelCode: "TC1", indicator: "c", requirement: "Chọn được những cách thông thường và được xác định rõ ràng để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.TC1a", topicId: "5.3", levelCode: "TC1", indicator: "a", requirement: "Chọn được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức rõ ràng cũng như các quy trình và sản phẩm đổi mới được xác định rõ ràng." },
  { code: "5.3.TC1b", topicId: "5.3", levelCode: "TC1", indicator: "b", requirement: "Gắn kết được cá nhân và tập thể vào một số quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và tình huống có vấn đề thông thường và được xác định rõ ràng trong môi trường số." },
  { code: "5.4.TC1a", topicId: "5.4", levelCode: "TC1", indicator: "a", requirement: "Giải thích được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu." },
  { code: "5.4.TC1b", topicId: "5.4", levelCode: "TC1", indicator: "b", requirement: "Chỉ ra được nơi để tìm kiếm các cơ hội được xác định rõ ràng để phát triển bản thân và cập nhật sự phát triển số." },
  { code: "6.1.TC1a", topicId: "6.1", levelCode: "TC1", indicator: "a", requirement: "Giải thích được nguyên tắc hoạt động cơ bản của AI." },
  { code: "6.1.TC1b", topicId: "6.1", levelCode: "TC1", indicator: "b", requirement: "Diễn giải được các thuật ngữ và khái niệm liên quan đến AI." },
  { code: "6.2.TC1a", topicId: "6.2", levelCode: "TC1", indicator: "a", requirement: "Sử dụng được các công cụ AI trong công việc và học tập hàng ngày." },
  { code: "6.2.TC1b", topicId: "6.2", levelCode: "TC1", indicator: "b", requirement: "Thực hành được các kỹ năng sử dụng AI thông qua các bài tập và dự án nhỏ." },
  { code: "6.2.TC1c", topicId: "6.2", levelCode: "TC1", indicator: "c", requirement: "Xem xét các khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư và bảo mật dữ liệu." },
  { code: "6.3.TC1a", topicId: "6.3", levelCode: "TC1", indicator: "a", requirement: "Giải thích được cách thức hoạt động của các hệ thống AI đơn giản." },
  { code: "6.3.TC1b", topicId: "6.3", levelCode: "TC1", indicator: "b", requirement: "Tóm tắt được các đặc điểm và ứng dụng của hệ thống AI." },

  // ==========================
  // TRUNG CẤP 2 (TC2 - Lớp 8, 9)
  // ==========================
  { code: "1.1.TC2a", topicId: "1.1", levelCode: "TC2", indicator: "a", requirement: "Minh họa được nhu cầu thông tin." },
  { code: "1.1.TC2b", topicId: "1.1", levelCode: "TC2", indicator: "b", requirement: "Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số." },
  { code: "1.1.TC2c", topicId: "1.1", levelCode: "TC2", indicator: "c", requirement: "Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng." },
  { code: "1.1.TC2d", topicId: "1.1", levelCode: "TC2", indicator: "d", requirement: "Tổ chức được các chiến lược tìm kiếm." },
  { code: "1.2.TC2a", topicId: "1.2", levelCode: "TC2", indicator: "a", requirement: "Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số." },
  { code: "1.2.TC2b", topicId: "1.2", levelCode: "TC2", indicator: "b", requirement: "Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số." },
  { code: "1.3.TC2a", topicId: "1.3", levelCode: "TC2", indicator: "a", requirement: "Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất." },
  { code: "1.3.TC2b", topicId: "1.3", levelCode: "TC2", indicator: "b", requirement: "Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc." },
  { code: "2.1.TC2a", topicId: "2.1", levelCode: "TC2", indicator: "a", requirement: "Lựa chọn được nhiều công nghệ số để tương tác." },
  { code: "2.1.TC2b", topicId: "2.1", levelCode: "TC2", indicator: "b", requirement: "Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể." },
  { code: "2.2.TC2a", topicId: "2.2", levelCode: "TC2", indicator: "a", requirement: "Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số." },
  { code: "2.2.TC2b", topicId: "2.2", levelCode: "TC2", indicator: "b", requirement: "Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số." },
  { code: "2.2.TC2c", topicId: "2.2", levelCode: "TC2", indicator: "c", requirement: "Áp dụng được các phương pháp tham chiếu và ghi chú nguồn." },
  { code: "2.3.TC2a", topicId: "2.3", levelCode: "TC2", indicator: "a", requirement: "Lựa chọn được các dịch vụ số để tham gia vào xã hội." },
  { code: "2.3.TC2b", topicId: "2.3", levelCode: "TC2", indicator: "b", requirement: "Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân." },
  { code: "2.4.TC2a", topicId: "2.4", levelCode: "TC2", indicator: "a", requirement: "Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác." },
  { code: "2.5.TC2a", topicId: "2.5", levelCode: "TC2", indicator: "a", requirement: "Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.TC2b", topicId: "2.5", levelCode: "TC2", indicator: "b", requirement: "Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số." },
  { code: "2.5.TC2c", topicId: "2.5", levelCode: "TC2", indicator: "c", requirement: "Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số." },
  { code: "2.6.TC2a", topicId: "2.6", levelCode: "TC2", indicator: "a", requirement: "Hiển thị được nhiều danh tính số cụ thể." },
  { code: "2.6.TC2b", topicId: "2.6", levelCode: "TC2", indicator: "b", requirement: "Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân." },
  { code: "2.6.TC2c", topicId: "2.6", levelCode: "TC2", indicator: "c", requirement: "Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số." },
  { code: "3.1.TC2a", topicId: "3.1", levelCode: "TC2", indicator: "a", requirement: "Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau." },
  { code: "3.1.TC2b", topicId: "3.1", levelCode: "TC2", indicator: "b", requirement: "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số." },
  { code: "3.2.TC2a", topicId: "3.2", levelCode: "TC2", indicator: "a", requirement: "Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo." },
  { code: "3.3.TC2a", topicId: "3.3", levelCode: "TC2", indicator: "a", requirement: "Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số." },
  { code: "3.4.TC2a", topicId: "3.4", levelCode: "TC2", indicator: "a", requirement: "Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể." },
  { code: "4.1.TC2a", topicId: "4.1", levelCode: "TC2", indicator: "a", requirement: "Thiết lập được những cách thức bảo vệ thiết bị và nội dung số." },
  { code: "4.1.TC2b", topicId: "4.1", levelCode: "TC2", indicator: "b", requirement: "Phân biệt được rủi ro và mối đe dọa trong môi trường số." },
  { code: "4.1.TC2c", topicId: "4.1", levelCode: "TC2", indicator: "c", requirement: "Chọn lựa được các biện pháp an toàn và bảo mật." },
  { code: "4.1.TC2d", topicId: "4.1", levelCode: "TC2", indicator: "d", requirement: "Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.TC2a", topicId: "4.2", levelCode: "TC2", indicator: "a", requirement: "Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.TC2b", topicId: "4.2", levelCode: "TC2", indicator: "b", requirement: "Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn." },
  { code: "4.2.TC2c", topicId: "4.2", levelCode: "TC2", indicator: "c", requirement: "Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số." },
  { code: "4.3.TC2a", topicId: "4.3", levelCode: "TC2", indicator: "a", requirement: "Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần." },
  { code: "4.3.TC2b", topicId: "4.3", levelCode: "TC2", indicator: "b", requirement: "Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số." },
  { code: "4.3.TC2c", topicId: "4.3", levelCode: "TC2", indicator: "c", requirement: "Thảo luận về những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.TC2a", topicId: "4.4", levelCode: "TC2", indicator: "a", requirement: "Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số." },
  { code: "5.1.TC2a", topicId: "5.1", levelCode: "TC2", indicator: "a", requirement: "Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số." },
  { code: "5.1.TC2b", topicId: "5.1", levelCode: "TC2", indicator: "b", requirement: "Chọn được giải pháp cho chúng." },
  { code: "5.2.TC2a", topicId: "5.2", levelCode: "TC2", indicator: "a", requirement: "Giải thích nhu cầu cá nhân." },
  { code: "5.2.TC2b", topicId: "5.2", levelCode: "TC2", indicator: "b", requirement: "Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.TC2c", topicId: "5.2", levelCode: "TC2", indicator: "c", requirement: "Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.TC2a", topicId: "5.3", levelCode: "TC2", indicator: "a", requirement: "Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm." },
  { code: "5.3.TC2b", topicId: "5.3", levelCode: "TC2", indicator: "b", requirement: "Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số." },
  { code: "5.4.TC2a", topicId: "5.4", levelCode: "TC2", indicator: "a", requirement: "Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật." },
  { code: "5.4.TC2b", topicId: "5.4", levelCode: "TC2", indicator: "b", requirement: "Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ." },
  { code: "5.4.TC2c", topicId: "5.4", levelCode: "TC2", indicator: "c", requirement: "Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số." },
  { code: "6.1.TC2a", topicId: "6.1", levelCode: "TC2", indicator: "a", requirement: "Áp dụng được các nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản." },
  { code: "6.1.TC2b", topicId: "6.1", levelCode: "TC2", indicator: "b", requirement: "Thực hiện được các thao tác cơ bản trên các công cụ AI." },
  { code: "6.2.TC2a", topicId: "6.2", levelCode: "TC2", indicator: "a", requirement: "Tối ưu hóa việc sử dụng các công cụ AI để đạt hiệu quả cao hơn." },
  { code: "6.2.TC2b", topicId: "6.2", levelCode: "TC2", indicator: "b", requirement: "Quản lý được việc triển khai các công cụ AI trong các dự án nhỏ." },
  { code: "6.2.TC2c", topicId: "6.2", levelCode: "TC2", indicator: "c", requirement: "Bảo vệ được dữ liệu cá nhân và tuân thủ các quy định pháp luật về bảo mật thông tin khi sử dụng AI." },
  { code: "6.3.TC2a", topicId: "6.3", levelCode: "TC2", indicator: "a", requirement: "Phân tích được hiệu quả của hệ thống AI trong việc giải quyết các vấn đề cụ thể." },
  { code: "6.3.TC2b", topicId: "6.3", levelCode: "TC2", indicator: "b", requirement: "So sánh được hiệu suất của các hệ thống AI khác nhau." },

  // ==========================
  // NÂNG CAO 1 (NC1 - Lớp 10, 11, 12)
  // ==========================
  { code: "1.1.NC1a", topicId: "1.1", levelCode: "NC1", indicator: "a", requirement: "Đáp ứng được nhu cầu thông tin." },
  { code: "1.1.NC1b", topicId: "1.1", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số." },
  { code: "1.1.NC1c", topicId: "1.1", levelCode: "NC1", indicator: "c", requirement: "Chỉ cho người khác cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng." },
  { code: "1.1.NC1d", topicId: "1.1", levelCode: "NC1", indicator: "d", requirement: "Tự đề xuất được chiến lược tìm kiếm." },
  { code: "1.2.NC1a", topicId: "1.2", levelCode: "NC1", indicator: "a", requirement: "Thực hiện đánh giá được độ tin cậy và độ tin cậy của các nguồn dữ liệu, thông tin và nội dung số." },
  { code: "1.2.NC1b", topicId: "1.2", levelCode: "NC1", indicator: "b", requirement: "Tiến hành đánh giá được các dữ liệu, thông tin và nội dung số khác nhau." },
  { code: "1.3.NC1a", topicId: "1.3", levelCode: "NC1", indicator: "a", requirement: "Thao tác được thông tin, dữ liệu và nội dung để tổ chức, lưu trữ và truy xuất dễ dàng hơn." },
  { code: "1.3.NC1b", topicId: "1.3", levelCode: "NC1", indicator: "b", requirement: "Triển khai được việc tổ chức và sắp xếp dữ liệu, thông tin và nội dung trong môi trường có cấu trúc." },
  { code: "2.1.NC1a", topicId: "2.1", levelCode: "NC1", indicator: "a", requirement: "Sử dụng được nhiều công nghệ số để tương tác." },
  { code: "2.1.NC1b", topicId: "2.1", levelCode: "NC1", indicator: "b", requirement: "Chỉ được cho người khác thấy phương tiện giao tiếp số nào thích hợp nhất cho một bối cảnh cụ thể." },
  { code: "2.2.NC1a", topicId: "2.2", levelCode: "NC1", indicator: "a", requirement: "Chia sẻ dữ liệu, thông tin và nội dung số thông qua nhiều công cụ số phù hợp." },
  { code: "2.2.NC1b", topicId: "2.2", levelCode: "NC1", indicator: "b", requirement: "Hướng dẫn người khác cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số." },
  { code: "2.2.NC1c", topicId: "2.2", levelCode: "NC1", indicator: "c", requirement: "Áp dụng được nhiều phương pháp tham chiếu và ghi nguồn khác nhau." },
  { code: "2.3.NC1a", topicId: "2.3", levelCode: "NC1", indicator: "a", requirement: "Đề xuất được các dịch vụ số khác nhau để tham gia vào xã hội." },
  { code: "2.3.NC1b", topicId: "2.3", levelCode: "NC1", indicator: "b", requirement: "Sử dụng được các công nghệ số thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân." },
  { code: "2.4.NC1a", topicId: "2.4", levelCode: "NC1", indicator: "a", requirement: "Đề xuất được các công cụ và công nghệ số khác nhau cho các quá trình hợp tác." },
  { code: "2.5.NC1a", topicId: "2.5", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các chuẩn mực hành vi và bí quyết, cách khác nhau khi sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.NC1b", topicId: "2.5", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các chiến lược giao tiếp khác nhau trong môi trường số một cách phù hợp." },
  { code: "2.5.NC1c", topicId: "2.5", levelCode: "NC1", indicator: "c", requirement: "Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau để xem xét trong môi trường số." },
  { code: "2.6.NC1a", topicId: "2.6", levelCode: "NC1", indicator: "a", requirement: "Sử dụng được nhiều danh tính số khác nhau." },
  { code: "2.6.NC1b", topicId: "2.6", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các cách khác nhau để bảo vệ danh tính trực tuyến của bản thân." },
  { code: "2.6.NC1c", topicId: "2.6", levelCode: "NC1", indicator: "c", requirement: "Sử dụng được dữ liệu tạo ra thông qua công cụ, môi trường và một số dịch vụ số." },
  { code: "3.1.NC1a", topicId: "3.1", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau." },
  { code: "3.1.NC1b", topicId: "3.1", levelCode: "NC1", indicator: "b", requirement: "Chỉ ra được những cách thể hiện bản thân thông qua việc tạo ra các phương tiện số." },
  { code: "3.2.NC1a", topicId: "3.2", levelCode: "NC1", indicator: "a", requirement: "Làm việc với các mục nội dung và thông tin mới khác nhau, sửa đổi, tinh chỉnh, cải thiện và tích hợp chúng để tạo ra những mục mới và độc đáo." },
  { code: "3.3.NC1a", topicId: "3.3", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các quy định khác nhau về bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số." },
  { code: "3.4.NC1a", topicId: "3.4", levelCode: "NC1", indicator: "a", requirement: "Tự thao tác được bằng các hướng dẫn dành cho hệ thống máy tính để giải quyết một vấn đề khác hoặc thực hiện các nhiệm vụ khác nhau." },
  { code: "4.1.NC1a", topicId: "4.1", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các cách khác nhau để bảo vệ thiết bị và nội dung số." },
  { code: "4.1.NC1b", topicId: "4.1", levelCode: "NC1", indicator: "b", requirement: "Nhận thức được sự đa dạng của các rủi ro và đe dọa trong môi trường số." },
  { code: "4.1.NC1c", topicId: "4.1", levelCode: "NC1", indicator: "c", requirement: "Áp dụng được các biện pháp an toàn và bảo mật." },
  { code: "4.1.NC1d", topicId: "4.1", levelCode: "NC1", indicator: "d", requirement: "Sử dụng được các cách thức khác nhau để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.NC1a", topicId: "4.2", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các cách thức khác nhau để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.NC1b", topicId: "4.2", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các cách thức đặc thù để chia sẻ dữ liệu cá nhân một cách an toàn." },
  { code: "4.2.NC1c", topicId: "4.2", levelCode: "NC1", indicator: "c", requirement: "Giải thích được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số." },
  { code: "4.3.NC1a", topicId: "4.3", levelCode: "NC1", indicator: "a", requirement: "Trình bày được các cách thức khác nhau để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số." },
  { code: "4.3.NC1b", topicId: "4.3", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các cách thức khác nhau để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số." },
  { code: "4.3.NC1c", topicId: "4.3", levelCode: "NC1", indicator: "c", requirement: "Trình bày được các công nghệ số khác nhau giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.NC1a", topicId: "4.4", levelCode: "NC1", indicator: "a", requirement: "Trình bày được các cách thức khác nhau để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số." },
  { code: "5.1.NC1a", topicId: "5.1", levelCode: "NC1", indicator: "a", requirement: "Đánh giá được các vấn đề kỹ thuật khi sử dụng môi trường số và vận hành các thiết bị số." },
  { code: "5.1.NC1b", topicId: "5.1", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các giải pháp khác nhau cho chúng." },
  { code: "5.2.NC1a", topicId: "5.2", levelCode: "NC1", indicator: "a", requirement: "Đánh giá được nhu cầu cá nhân." },
  { code: "5.2.NC1b", topicId: "5.2", levelCode: "NC1", indicator: "b", requirement: "Áp dụng được các công cụ số khác nhau và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.NC1c", topicId: "5.2", levelCode: "NC1", indicator: "c", requirement: "Sử dụng được các cách khác nhau để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.NC1a", topicId: "5.3", levelCode: "NC1", indicator: "a", requirement: "Áp dụng được các công cụ và công nghệ số khác nhau để tạo ra kiến thức cũng như các quy trình và sản phẩm đổi mới." },
  { code: "5.3.NC1b", topicId: "5.3", levelCode: "NC1", indicator: "b", requirement: "Áp dụng xử lý nhận thức của cá nhân và tập thể để giải quyết các vấn đề khái niệm và tình huống có vấn đề khác nhau trong môi trường số." },
  { code: "5.4.NC1a", topicId: "5.4", levelCode: "NC1", indicator: "a", requirement: "Chứng minh được năng lực số của tôi cần được cải thiện hoặc cập nhật ở đâu." },
  { code: "5.4.NC1b", topicId: "5.4", levelCode: "NC1", indicator: "b", requirement: "Minh họa được những cách khác nhau để hỗ trợ người khác phát triển năng lực số của họ." },
  { code: "5.4.NC1c", topicId: "5.4", levelCode: "NC1", indicator: "c", requirement: "Đề xuất được các cơ hội khác nhau để phát triển bản thân và cập nhật sự phát triển số." },
  { code: "6.1.NC1a", topicId: "6.1", levelCode: "NC1", indicator: "a", requirement: "Phân tích được cách AI hoạt động trong các ứng dụng cụ thể." },
  { code: "6.1.NC1b", topicId: "6.1", levelCode: "NC1", indicator: "b", requirement: "So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu." },
  { code: "6.2.NC1a", topicId: "6.2", levelCode: "NC1", indicator: "a", requirement: "Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể." },
  { code: "6.2.NC1b", topicId: "6.2", levelCode: "NC1", indicator: "b", requirement: "Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể." },
  { code: "6.2.NC1c", topicId: "6.2", levelCode: "NC1", indicator: "c", requirement: "Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI." },
  { code: "6.3.NC1a", topicId: "6.3", levelCode: "NC1", indicator: "a", requirement: "Đánh giá được độ chính xác và tin cậy của các hệ thống AI." },
  { code: "6.3.NC1b", topicId: "6.3", levelCode: "NC1", indicator: "b", requirement: "Xem xét được các kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI." },
];

export const DIGITAL_COMPETENCY_INDICATORS: DigitalIndicatorItem[] = RAW_INDICATOR_DATA.map(item => {
  const domainId = item.code.split('.')[0];
  const competency = DIGITAL_COMPETENCIES[item.topicId] || {
    domainCode: domainId,
    name: `Năng lực ${item.topicId}`,
    description: ''
  };
  const levelInfo = LEVEL_MAPPING[item.levelCode];

  return {
    code: item.code,
    topicId: item.topicId,
    topicName: competency.name,
    topicDescription: competency.description,
    domainId,
    domainName: DIGITAL_DOMAINS[domainId] || `Miền ${domainId}`,
    levelCode: item.levelCode,
    levelName: levelInfo.name,
    gradeRange: levelInfo.gradeRange,
    sourceLevel: levelInfo.sourceLevel,
    grades: levelInfo.grades,
    indicator: item.indicator,
    contentTopic: competency.name,
    requirement: item.requirement,
    sourceDocument: "Thông tư 02/2025/TT-BGDĐT (đối chiếu qua Công văn 3456/BGDĐT-GDPT)",
    verified: true,

    // Aliases
    domainCode: domainId,
    competencyCode: item.topicId,
    competencyName: competency.name,
    competencyDescription: competency.description,
    achievementRequirement: item.requirement
  };
});

/**
 * Định nghĩa cấu trúc Khung Năng Lực Số hoàn chỉnh
 */
export const DIGITAL_COMPETENCY_FRAMEWORK = {
  ...DIGITAL_FRAMEWORK_METADATA,
  domains: DIGITAL_DOMAINS,
  competencies: DIGITAL_COMPETENCIES,
  levelMapping: LEVEL_MAPPING,
  indicators: DIGITAL_COMPETENCY_INDICATORS
};

/**
 * Lấy danh mục chỉ báo theo Bậc (CB1, CB2, TC1, TC2, NC1)
 */
export const getIndicatorsByLevel = (levelCode: 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1'): DigitalIndicatorItem[] => {
  return DIGITAL_COMPETENCY_INDICATORS.filter(item => item.levelCode === levelCode);
};

/**
 * Lấy Bậc Năng lực số chuẩn theo Khối lớp (1-12)
 */
export const getDigitalLevelByGrade = (grade: string | number): DigitalLevel => {
  const g = typeof grade === 'number' ? grade : parseInt(String(grade), 10);
  if (g >= 1 && g <= 3) return LEVEL_MAPPING['CB1'];
  if (g >= 4 && g <= 5) return LEVEL_MAPPING['CB2'];
  if (g >= 6 && g <= 7) return LEVEL_MAPPING['TC1'];
  if (g >= 8 && g <= 9) return LEVEL_MAPPING['TC2'];
  if (g >= 10 && g <= 12) return LEVEL_MAPPING['NC1'];
  return LEVEL_MAPPING['TC1']; // Mặc định THCS
};

/**
 * Lấy danh mục chỉ báo NLS chuẩn xác theo Khối lớp (1-12)
 */
export const getIndicatorsByGrade = (grade: string | number): DigitalIndicatorItem[] => {
  const level = getDigitalLevelByGrade(grade);
  return getIndicatorsByLevel(level.code);
};

/**
 * Kiểm tra xem một mã NLS có hợp lệ với khối lớp đang dạy hay không
 */
export const isValidIndicatorForGrade = (code: string, grade: string | number): boolean => {
  const level = getDigitalLevelByGrade(grade);
  return code.includes(`.${level.code}`);
};
