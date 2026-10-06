import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Key, 
  User, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Crown, 
  ShieldCheck, 
  Presentation, 
  Download, 
  PhoneCall, 
  Heart, 
  Layers,
  Settings,
  ChevronRight,
  ExternalLink,
  Facebook
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'intro',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      tag: 'TỔNG QUAN',
      title: '1. Giới thiệu Ứng dụng KHBD AI VIP V4.0',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>KHBD AI VIP V4.0</strong> là giải pháp trí tuệ nhân tạo chuyên biệt dành riêng cho đội ngũ Giáo viên tại Việt Nam, giúp tự động hóa quá trình soạn <strong>Kế hoạch bài dạy (Giáo án)</strong> chuẩn quy định Bộ Giáo dục và Đào tạo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <span className="font-extrabold text-amber-950 block">🏫 Cấp 1 (Tiểu học)</span>
              <span className="text-xs text-slate-600 block">Soạn KHBD theo <strong>Công văn 2345/BGDĐT-GDTH</strong> & đánh giá học sinh theo <strong>Thông tư 27/2020/TT-BGDĐT</strong>.</span>
            </div>
            <div className="bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200 space-y-1">
              <span className="font-extrabold text-orange-950 block">📘 Cấp 2 (THCS) & Cấp 3 (THPT)</span>
              <span className="text-xs text-slate-600 block">Soạn KHBD theo chuẩn <strong>Công văn 5512/BGDĐT-GDTrH</strong> đầy đủ 4 hoạt động bài dạy.</span>
            </div>
          </div>
          <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-semibold leading-relaxed space-y-1.5">
            <div>
              💻 <strong>Tích hợp Năng lực số:</strong> Theo <strong>Thông tư 02/2025/TT-BGDĐT</strong> & <strong>Công văn 3456/BGDĐT-CNTT</strong> chuẩn phân cấp: <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">CB1</code> (Lớp 1-3), <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">CB2</code> (Lớp 4-5), <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">TC1</code> (Lớp 6-7), <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">TC2</code> (Lớp 8-9), <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">NC1</code> (Lớp 10-12).
            </div>
            <div>
              🤖 <strong>Tích hợp Giáo dục AI (Mới nhất):</strong> Theo <strong>Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026</strong> ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông với 4 miền năng lực (NLa, NLb, NLc, NLd) và quy chuẩn mã hoá YCCĐ chuẩn xác: <code className="bg-emerald-100 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]">[Lớp].[Mã chủ đề].[Số thứ tự]</code>.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'login',
      icon: ShieldCheck,
      color: 'from-orange-600 to-amber-600',
      tag: 'ĐĂNG NHẬP',
      title: '2. Đăng nhập & Quyền hạn truy cập',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <ul className="space-y-2">
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Bản VIP Chính thức:</strong>
                <span>Đăng nhập bằng tài khoản Gmail được Thầy Đoàn Kiên Trung cấp phép truy cập chính thức để kích hoạt quyền tạo bài dạy <strong>KHÔNG GIỚI HẠN</strong>, mở khóa toàn bộ tính năng Xuất Word (.docx) và Sao chép nhanh.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Bản Dùng thử (Trial):</strong>
                <span>Nhấn trực tiếp vào nút <strong>"Dùng thử"</strong> tại màn hình đăng nhập để trải nghiệm miễn phí 1 lượt tạo giáo án mẫu đầy đủ tính năng.</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'apikey',
      icon: Key,
      color: 'from-orange-700 to-red-600',
      tag: 'MÃ GOOGLE GEMINI',
      title: '3. Hướng dẫn Cấu hình Mã Google Gemini API Key',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>Ứng dụng vận hành trực tiếp trên mô hình AI thế hệ mới của Google. Thầy cô chỉ cần cấu hình mã API Key miễn phí 1 lần duy nhất:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Nhấn vào nút <strong>"TẠO API KEY"</strong> hoặc truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a> bằng tài khoản Gmail.
            </li>
            <li>Nhấn <strong>"Create API key"</strong> để sao chép chuỗi mã API Key được cấp.</li>
            <li>Dán mã vào ô <strong>"Nhập mã API Key"</strong> trong ứng dụng và nhấn <strong>"LƯU API KEY"</strong>.</li>
          </ol>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mã API Key được lưu bảo mật 100% trên trình duyệt cá nhân của Thầy/Cô và không chia sẻ cho bên thứ ba.</span>
          </div>
        </div>
      )
    },
    {
      id: 'teacher',
      icon: User,
      color: 'from-amber-600 to-orange-700',
      tag: 'HỒ SƠ CÁ NHÂN',
      title: '4. Khai báo Thông tin Giáo viên & Trường dạy',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>Bấm nút <strong>"THÔNG TIN"</strong> trên thanh tiêu đề để cập nhật hồ sơ cá nhân:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">🏢 Cơ quan chủ quản (VD: Sở GD&ĐT / UBND)</li>
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">🏫 Tên trường công tác</li>
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">👥 Tổ chuyên môn phụ trách</li>
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">👤 Họ và tên Giáo viên</li>
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">📚 Bộ môn giảng dạy chính</li>
            <li className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-800">🎓 Cấp học (TH, THCS, THPT hoặc liên cấp)</li>
          </ul>
          <p className="text-xs text-slate-500 italic">Các thông tin này sẽ được AI tự động đưa vào phần thể thức tiêu đề của mọi file giáo án xuất ra.</p>
        </div>
      )
    },
    {
      id: 'config',
      icon: Settings,
      color: 'from-orange-600 to-amber-700',
      tag: 'CẤU HÌNH SOẠN',
      title: '5. Thiết lập Cấu hình Bài dạy & Tùy chọn Mở rộng',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <strong className="text-slate-900 block">A. Thông tin cơ bản & Bộ sách hiện hành:</strong>
            <p>
              Nhập Tên bài dạy, Môn học, Khối lớp, Số tiết dạy, Tùy chọn <strong>"Tách Tiết"</strong> và Bố cục trình bày (1 cột hoặc 2 cột).
            </p>
            <div className="bg-orange-50/90 p-3 rounded-xl border border-orange-200 text-xs text-orange-950 font-medium">
              ✂️ <strong>Tùy chọn Tách Tiết:</strong> Tự động phân chia tiến trình bài dạy thành các Tiết học độc lập với chuẩn thời lượng: <strong>35 phút/tiết</strong> (Cấp Tiểu học) và <strong>45 phút/tiết</strong> (Cấp THCS & THPT), phân bổ thời gian hợp lý cho từng hoạt động.
            </div>
            <div className="bg-blue-50/90 p-3 rounded-xl border border-blue-200 text-xs text-blue-950 font-medium space-y-1">
              <div>🌐 <strong>Tùy chọn Ngôn ngữ bài soạn:</strong> Cho phép Thầy/Cô soạn giáo án theo <strong>Tiếng Việt</strong> (mặc định), <strong>Tiếng Anh</strong>, hoặc <strong>Ngôn ngữ khác</strong> tự nhập.</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-900/90 font-normal">
                <li><strong>Khi soạn Tiếng Việt:</strong> Sử dụng từ viết tắt chuẩn mực sư phạm <code>GV</code> và <code>HS</code>; Các thuật ngữ khoa học, tên riêng, địa danh (DNA, RNA, Newton, London, Python...) giữ nguyên vẹn không dịch.</li>
                <li><strong>Khi soạn Tiếng Anh / Ngôn ngữ khác:</strong> Đồng bộ 100% nội dung sang ngôn ngữ yêu cầu (kể cả bảng thông tin đầu trang và phần ký duyệt cuối bài).</li>
              </ul>
            </div>
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium">
              📖 <strong>Cấu hình Bộ sách:</strong> Mặc định sử dụng <strong>"Bộ sách hiện hành"</strong> (Bộ sách KNTT với Cuộc sống có chỉnh lý, bổ sung áp dụng thống nhất toàn quốc từ 2026-2027); Riêng môn Tiếng Anh dùng bộ sách <strong>"Global Success"</strong>. Ngoài ra Thầy/Cô có thể chọn <strong>"Bộ sách Khác"</strong> để tự định nghĩa trong phần Nội dung cốt lõi.
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <strong className="text-slate-900 block">B. Nội dung cốt lõi & Các tùy chọn nâng cao:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">💻 <strong>Năng lực số:</strong> Tích hợp theo Thông tư 02/2025 & CV 3456/BGDĐT.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">🤖 <strong>Giáo dục AI:</strong> Tích hợp chuẩn Quyết định 2422/QĐ-BGDĐT (mã [Lớp].[Mã CĐ].[STT]).</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">❓ <strong>Câu hỏi củng cố:</strong> Thêm hệ thống câu hỏi kiểm tra đánh giá cuối bài.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">💡 <strong>PPDH tích cực:</strong> Đưa vào các kỹ thuật mảnh ghép, khăn phủ bàn, nhóm.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">🎮 <strong>Trò chơi học tập:</strong> Thiết kế hoạt động khởi động/luyện tập sôi nổi.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">🛡️ <strong>Giáo dục QP-AN:</strong> Tích hợp nội dung Quốc phòng - An ninh.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">♿ <strong>Học sinh khuyết tật:</strong> Phương pháp hỗ trợ HSKT hòa nhập.</div>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200/80 font-medium">🔬 <strong>Bài học STEM:</strong> Quy trình 5 hoạt động theo CV 3089/908/BGDĐT.</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'export',
      icon: Download,
      color: 'from-amber-600 to-orange-600',
      tag: 'XUẤT BÀI DẠY',
      title: '6. Xuất File Word (.docx) chuẩn',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Sau khi AI hoàn thành bài dạy, Thầy/Cô dễ dàng lưu trữ bài dạy về máy tính dưới định dạng chuẩn:
          </p>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Xuất file Word (.docx):</strong> Nhấn nút <strong>"Tải file Word (.docx)"</strong>. File Word giữ nguyên định dạng bảng, phông chữ chuẩn, ma trận 4 hoạt động và căn lề đẹp mắt sẵn sàng in ấn/nộp ban giám hiệu.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'slide',
      icon: Presentation,
      color: 'from-orange-600 to-amber-600',
      tag: 'GỢI Ý SLIDE',
      title: '7. Tạo Slide Bài giảng Powerpoint',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Tính năng độc quyền giúp tự động chuyển đổi bài KHBD thành kịch bản Slide trình chiếu:
          </p>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <Presentation className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Tạo kịch bản Slide tự động:</strong> Nhấn nút <strong>"Tạo gợi ý Slide"</strong> ở góc phải trang xem bài dạy. AI sẽ bóc tách bài KHBD thành kịch bản Slide trình chiếu chi tiết từng trang (Trang tiêu đề, Hoạt động 1, 2, 3, 4, Trò chơi, Củng cố), kèm gợi ý hình ảnh/hiệu ứng giúp Thầy/Cô thiết kế Powerpoint trong vài phút.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'author',
      icon: Heart,
      color: 'from-red-600 to-orange-700',
      tag: 'TÁC GIẢ & HỖ TRỢ',
      title: '8. Thông tin Tác giả & Hỗ trợ Kỹ thuật',
      content: (
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4 rounded-2xl border border-orange-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              AI
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                TÁC GIẢ: <span className="text-orange-700">THẦY ĐOÀN KIÊN TRUNG</span>
              </h4>
              <p className="text-xs text-slate-600 font-semibold">Chuyên gia ứng dụng Trí tuệ Nhân tạo (AI) trong Giáo dục</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
            <div className="bg-white p-3 rounded-xl border border-orange-200/80 shadow-xs flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Zalo / Điện thoại</span>
                <strong className="text-blue-600 font-black text-xs sm:text-sm">0909629947</strong>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-orange-200/80 shadow-xs flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ủng hộ dự án (BIDV)</span>
                <strong className="text-emerald-600 font-black text-xs sm:text-sm">8870889643</strong>
              </div>
            </div>
          </div>

          <a 
            href="https://www.facebook.com/kientrungkrn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-black py-2.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Facebook className="w-4 h-4 text-white fill-white" />
            <span>Theo dõi trang Facebook Tác giả</span>
          </a>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-orange-950/30 border border-amber-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#832e0c] via-orange-600 to-[#6e2309] p-5 sm:p-6 text-white relative shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
              title="Đóng cẩm nang"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-400/30 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  CẨM NANG SỬ DỤNG
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-1">
                  HƯỚNG DẪN CHI TIẾT ỨNG DỤNG KHBD AI VIP V4.0
                </h3>
              </div>
            </div>
            <p className="text-xs text-amber-100/90 mt-2 font-medium">
              Hướng dẫn toàn diện từng tính năng, quy trình tạo giáo án chuẩn Công văn 5512 & thông tin tác giả.
            </p>
          </div>

          {/* Body Content - Scrollable */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {sections.map((sec) => {
              const IconComp = sec.icon;
              return (
                <div key={sec.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3 hover:border-orange-300 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl text-white bg-gradient-to-r ${sec.color} shadow-xs`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                        {sec.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200">
                      {sec.tag}
                    </span>
                  </div>

                  <div>
                    {sec.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
              KHBD AI VIP V4.0 &bull; Đồng hành cùng Thầy Cô
            </p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-700/20"
            >
              Đã hiểu & Đóng Cẩm nang
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
