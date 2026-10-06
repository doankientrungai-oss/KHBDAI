import React from 'react';
import { ShieldAlert, LogOut, Phone, MessageSquare, ExternalLink, Mail, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppUser } from '../services/firebaseService';

interface BlockedScreenProps {
  user: AppUser;
  onLogout: () => void;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center p-4 font-sans selection:bg-red-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-red-950/10 border-2 border-red-200 overflow-hidden">
          
          {/* Header Card */}
          <div className="bg-gradient-to-br from-red-700 via-rose-600 to-red-800 p-8 text-center relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="50" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-3 border border-white/30 shadow-lg">
                <ShieldAlert className="w-9 h-9 text-amber-200 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">TÀI KHOẢN ĐANG BỊ KHÓA</h1>
              <p className="text-red-100 text-xs sm:text-sm font-bold mt-1.5 opacity-90 uppercase tracking-wide">
                QUYỀN TRUY CẬP ĐÃ TẠM THỜI BỊ GIỚI HẠN
              </p>
            </div>
          </div>

          {/* User badge */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-red-50/80 border border-red-200/80">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-12 h-12 rounded-full border-2 border-red-300 object-cover shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-lg shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 truncate">{user.displayName || 'Thầy/Cô'}</p>
                <div className="flex items-center space-x-1.5 text-xs text-red-700 font-medium">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-mono">{user.email}</span>
                </div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                  Đã khóa truy cập
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed space-y-2">
              <p className="font-extrabold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span>⚠️</span> Lý do & Hướng dẫn mở khóa:
              </p>
              <p className="text-slate-700">
                Tài khoản Gmail này hiện chưa được kích hoạt bản chính thức hoặc đã bị Quản trị viên tạm khóa.
              </p>
              {user.notes && (
                <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-slate-800 text-[11px] font-medium">
                  <strong className="text-red-700">Ghi chú quản trị:</strong> {user.notes}
                </div>
              )}
              <p className="text-slate-700">
                Để tiếp tục soạn bài dạy theo <strong>Công văn 5512 & 2345</strong>, Thầy/Cô vui lòng liên hệ trực tiếp với tác giả ứng dụng <strong>Thầy Đoàn Kiên Trung</strong> để được hỗ trợ mở khóa và kích hoạt quyền truy cập.
              </p>
            </div>

            {/* Contact Channels */}
            <div className="space-y-2.5">
              <a
                href="https://zalo.me/0909629947"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Nhắn Zalo Thầy Kiên Trung: 0909629947</span>
              </a>

              <a
                href="https://www.facebook.com/kientrungkrn/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-600 hover:to-orange-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Trang Facebook Thầy Kiên Trung</span>
              </a>
            </div>

            {/* Logout button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất / Đổi tài khoản Gmail khác</span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
            KHBD AI VIP V4.0 &bull; Hệ thống phân quyền giáo viên theo Google Account
          </div>
        </div>
      </motion.div>
    </div>
  );
};
