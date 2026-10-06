import React from 'react';
import { LogOut, Key, Heart, Sparkles, Crown, UserCheck, User, BookOpen, Shield, ShieldCheck } from 'lucide-react';
import { HeaderProps } from '../types';
import { ADMIN_EMAIL } from '../services/firebaseService';

const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  onResetApiKey, 
  userType = 'trial', 
  generationCount = 0, 
  teacherInfo,
  onOpenTeacherInfoModal,
  onOpenVipModal,
  onOpenGuideModal,
  currentUser,
  onOpenAdminModal
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <header className="bg-gradient-to-r from-[#6e2309] via-[#832e0c] to-[#6e2309] border-b border-orange-950/40 text-white sticky top-0 z-50 shadow-xl shadow-orange-950/20 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1500px] py-3 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Left Section: Branding & Info */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-950/40 border border-amber-300/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight uppercase flex items-center gap-1.5">
                  KHBD <span className="text-amber-300 font-extrabold drop-shadow">AI</span> <span className="text-orange-200 font-light text-base md:text-lg">VIP V4.0</span>
                </h1>
                
                {userType === 'official' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Crown className="w-3 h-3 text-slate-950" />
                    CẤP PHÉP TRUY CẬP
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenVipModal?.('general')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-[10px] font-black border border-amber-400/40 uppercase tracking-widest transition-all"
                  >
                    <UserCheck className="w-3 h-3 text-amber-300" />
                    DÙNG THỬ ({generationCount}/2)
                  </button>
                )}

                {/* Logged in User Pill if available */}
                {currentUser && (
                  <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-orange-200 text-[11px] font-medium border border-orange-500/30">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-amber-300" />
                    )}
                    <span className="max-w-[140px] truncate">{currentUser.email}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] md:text-[12px] font-semibold text-orange-100/90 mt-0.5">
                <span>PHÁT TRIỂN BỞI: <strong className="text-amber-300 font-black">THẦY GIÁO: ĐOÀN KIÊN TRUNG</strong></span>
                <span className="text-orange-300/60 hidden sm:inline">•</span>
                <span className="hidden sm:inline">ZALO: <strong className="text-amber-200 font-bold">0909629947</strong></span>
                <span className="text-orange-300/60 hidden md:inline">•</span>
                <span className="hidden md:inline">BIDV: <strong className="text-amber-200 font-bold">8870889643</strong></span>
              </div>
            </div>
          </div>

          {/* Mobile Admin button if admin */}
          {isAdmin && onOpenAdminModal && (
            <div className="md:hidden shrink-0">
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] shadow-lg border border-amber-300 uppercase tracking-wider"
              >
                <Crown className="w-3 h-3 mr-1 text-slate-950" />
                <span>QUẢN TRỊ</span>
              </button>
            </div>
          )}
        </div>

        {/* Middle/Right Section: Full details on desktop */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2.5 pt-2 md:pt-0 border-t border-orange-800/40 md:border-t-0 flex-wrap">
          
          {/* Admin Management Button (Prominently displayed for Admins) */}
          {isAdmin && onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-lg shadow-amber-950/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border border-amber-200 animate-pulse"
              title="Mở bảng Quản trị người dùng: Cấp phép truy cập / Khóa / Dùng thử"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>QUẢN TRỊ NGƯỜI DÙNG</span>
            </button>
          )}

          {/* Teacher Info Button */}
          {onOpenTeacherInfoModal && (
            <button
              onClick={onOpenTeacherInfoModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-400 text-white font-black text-[11px] uppercase tracking-wider shadow-md shadow-orange-950/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-orange-500/40"
              title="Khai báo Thông tin giáo viên"
            >
              <User className="w-3.5 h-3.5 text-white" />
              <span>THÔNG TIN</span>
            </button>
          )}

          {/* Guide / Manual Button */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[11px] uppercase tracking-wider shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
              title="Cẩm nang hướng dẫn sử dụng ứng dụng"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>HƯỚNG DẪN</span>
            </button>
          )}

          {/* VIP Upgrade CTA if trial */}
          {userType === 'trial' && (
            <button
              onClick={() => onOpenVipModal?.('general')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-400 text-white font-black text-[11px] uppercase tracking-wider shadow-md transition-all duration-200 hover:scale-[1.02] border border-orange-500/40"
            >
              <Crown className="w-3.5 h-3.5 text-white" />
              <span>Đăng ký VIP</span>
            </button>
          )}

          {/* Support button on Desktop */}
          <a 
            href="https://www.facebook.com/kientrungkrn/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden lg:inline-flex items-center px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-[11px] uppercase tracking-wider shadow-md shadow-red-950/60 border border-red-300/50 transition-all hover:scale-[1.03] active:scale-[0.97]"
            title="Theo dõi trang Facebook của tác giả"
          >
            <Heart className="w-3.5 h-3.5 fill-current mr-1 text-white" />
            <span>ỦNG HỘ</span>
          </a>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {onResetApiKey && (
              <button 
                onClick={onResetApiKey}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-xl bg-orange-700/60 hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm transition-all border border-orange-500/40"
                title="Cấu hình lại API Key"
              >
                <Key className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">API Key</span>
              </button>
            )}
            
            {onLogout && (
              <button 
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-xl bg-orange-700/60 hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm transition-all border border-orange-500/40"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
