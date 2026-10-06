import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, PhoneCall, CheckCircle2, X, Sparkles, User, ShieldCheck, Heart, ExternalLink, CreditCard, MessageCircle } from 'lucide-react';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'copy' | 'download' | 'limit_reached' | 'general';
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({ isOpen, onClose, reason = 'general' }) => {
  if (!isOpen) return null;

  const getReasonText = () => {
    switch (reason) {
      case 'copy':
        return 'Tính năng "SAO CHÉP" đang bị KHOÁ ở bản DÙNG THỬ.';
      case 'download':
        return 'Tính năng "TẢI FILE WORD" đang bị KHOÁ ở bản DÙNG THỬ.';
      case 'limit_reached':
        return 'Thầy/Cô đã sử dụng HẾT 1/1 LƯỢT trải nghiệm ở bản DÙNG THỬ.';
      default:
        return 'Thầy/Cô đang trải nghiệm BẢN DÙNG THỬ (1 lượt).';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-orange-950/30 border border-amber-200 overflow-hidden my-6"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#832e0c] via-orange-600 to-[#6e2309] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-400/30">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  ĐĂNG KÝ BẢN CHÍNH THỨC
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-0.5">
                  KHBD AI VIP V4.0
                </h3>
              </div>
            </div>

            {/* Alert banner for locked action */}
            <div className="mt-3 bg-black/30 backdrop-blur-md border border-amber-300/40 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-100 font-medium">
              <Lock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-white text-sm">{getReasonText()}</p>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  Kính mời Quý Thầy/Cô đăng ký sử dụng bản chính thức để mở khóa toàn bộ tính năng soạn giảng AI không giới hạn!
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Author Info Card */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shadow-orange-600/20 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider">TÁC GIẢ DỰ ÁN</span>
                      <ShieldCheck className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="text-base font-black text-slate-900">Thầy Giáo: Đoàn Kiên Trung</h4>
                    <p className="text-xs text-orange-700 font-bold">Chuyên gia ứng dụng Trí tuệ Nhân tạo trong Giáo dục</p>
                  </div>
                </div>
              </div>

              {/* Contact info list */}
              <div className="mt-3.5 pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-amber-100">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zalo / SĐT: <strong className="text-emerald-700 font-black">0909629947</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-amber-100">
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Ngân hàng BIDV: <strong className="text-blue-800 font-black">8870889643</strong></span>
                </div>
              </div>
            </div>

            {/* Invitation CTA Call for Teachers */}
            <div className="bg-amber-50 border-2 border-orange-300 rounded-2xl p-4 text-center space-y-2">
              <h4 className="text-sm font-black text-orange-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>LỜI MỜI ĐĂNG KÝ BẢN CHÍNH THỨC DÀNH CHO THẦY CÔ</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Để phục vụ công tác giảng dạy thuận tiện lâu dài, nâng cao hiệu quả soạn giảng Mẫu KHBD Chuẩn BGD&ĐT, kính mời Quý Thầy/Cô đăng ký nâng cấp tài khoản chính thức.
              </p>
            </div>

            {/* VIP Benefits list */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5 ml-1">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Quyền lợi vượt trội bản VIP Chính thức:</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tạo bài dạy KHÔNG GIỚI HẠN:</strong> Thỏa sức tạo bài dạy cho tất cả môn học & cấp học mà không lo hết lượt.</span>
                </li>
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>SAO CHÉP & TẢI FILE WORD (.docx):</strong> Xuất file Word chuẩn định dạng Mẫu KHBD Chuẩn chỉnh sửa cực kỳ dễ dàng.</span>
                </li>
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Đầy đủ tích hợp chuyên sâu:</strong> Năng lực số (TT 02/2025), GDQP&AN, HSKT, Trò chơi khởi động, Mindmap.</span>
                </li>
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hỗ trợ kỹ thuật 24/7:</strong> Tác giả Thầy Đoàn Kiên Trung đồng hành hướng dẫn trực tiếp.</span>
                </li>
              </ul>
            </div>

            {/* Hotline & Contact CTA */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white rounded-2xl p-4 text-center shadow-lg shadow-orange-600/20 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100">
                LIÊN HỆ ĐĂNG KÝ BẢN VIP CHÍNH THỨC NGAY
              </p>
              <div className="flex items-center justify-center space-x-2 text-2xl font-black text-amber-300">
                <PhoneCall className="w-6 h-6 animate-bounce" />
                <a href="tel:0909629947" className="hover:underline tracking-tight">0909629947</a>
              </div>
              <p className="text-[11px] text-orange-100 font-medium">
                (Thầy/Cô vui lòng Gọi điện hoặc Kết bạn Zalo để kích hoạt nhanh)
              </p>
            </div>

            {/* Quick Link Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href="https://zalo.me/0909629947"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-700 hover:bg-orange-500 text-white font-black py-3 rounded-xl shadow-md text-center text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Nhắn Zalo: 0909629947</span>
              </a>
              <a
                href="https://www.facebook.com/kientrungkrn/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-700 hover:bg-orange-500 text-white font-black py-3 rounded-xl shadow-md text-center text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Facebook Tác Giả</span>
              </a>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-orange-700 hover:bg-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

