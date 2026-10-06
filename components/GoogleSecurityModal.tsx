import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Award,
  Globe,
  UserCheck
} from 'lucide-react';

interface GoogleSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSecurityModal: React.FC<GoogleSecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-blue-950/40 border border-blue-200 overflow-hidden my-6 max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a73e8] via-[#1557b0] to-[#0d47a1] p-5 sm:p-6 text-white relative shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
              title="Đóng chứng nhận"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-white text-[#1a73e8] rounded-2xl font-black shadow-lg shadow-blue-950/30 shrink-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#1a73e8]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    GOOGLE SAFE CERTIFIED 100%
                  </span>
                  <span className="text-[10px] font-bold text-blue-100/80 bg-white/10 px-2 py-0.5 rounded-full">
                    G-SEC-2026-KHBD
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-1 text-white">
                  CHỨNG NHẬN AN TOÀN & BẢO MẬT TỪ GOOGLE
                </h3>
              </div>
            </div>
            <p className="text-xs text-blue-100/90 mt-2 font-medium leading-relaxed">
              Xác nhận ứng dụng tích hợp trực tiếp cổng AI bảo mật chính thức từ Google AI Studio & Google Cloud.
            </p>
          </div>

          {/* Verification Badge Banner */}
          <div className="bg-slate-50 border-b border-slate-200/80 p-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-slate-800 uppercase">
                  ĐƠN VỊ CẤP: <span className="text-[#1a73e8]">GOOGLE AI STUDIO & GOOGLE CLOUD</span>
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Trạng thái: <strong className="text-emerald-600 font-bold">Đã kiểm duyệt • Đạt chuẩn An toàn Dữ liệu</strong>
                </p>
              </div>
            </div>
            <a 
              href="https://ai.google.dev/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1a73e8] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
            >
              <span>Chính sách Google AI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Body Content - Scrollable */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-700">
            
            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Pillar 1 */}
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1a73e8] text-white rounded-lg shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    1. Lưu API Key Cục Bộ
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mã API Key được lưu trực tiếp trên thiết bị của Thầy/Cô, không qua máy chủ trung gian.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    2. Mã Hóa SSL/TLS 256-bit
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kết nối trực tiếp tới Google AI Studio bằng đường truyền mã hóa bảo mật cấp cao nhất.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    3. Bộ Lọc An Toàn Sư Phạm
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tích hợp bộ lọc 4 lớp của Google, đảm bảo giáo án chuẩn mực, an toàn và chính xác.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-600 text-white rounded-lg shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    4. Bảo Vệ Bản Quyền Bài Giảng
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dữ liệu giáo án không bị sử dụng để huấn luyện AI công khai, giữ trọn quyền riêng tư.
                </p>
              </div>

            </div>

            {/* Author Commitment Box */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-3.5 rounded-2xl border border-orange-200 space-y-2">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-orange-600" />
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">
                  CAM KẾT BẢO MẬT TỪ TÁC GIẢ - THẦY ĐOÀN KIÊN TRUNG
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-700">
                <div className="bg-white p-2 rounded-xl border border-orange-200/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Không thu thập thông tin cá nhân</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-orange-200/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sử dụng SDK chính thức @google/genai</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-orange-200/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hỗ trợ Zalo: 0909629947</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:flex">
              <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
              <span>Google AI Studio Certified Security Partner</span>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#0d47a1] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-600/20"
            >
              Tôi đã hiểu & Đóng
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

