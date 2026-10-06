import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { GuideModal } from './GuideModal';
import { GoogleSecurityModal } from './GoogleSecurityModal';
import { signInWithGoogle, AppUser } from '../services/firebaseService';

interface LoginProps {
  onLogin: (token: string, userType: 'official' | 'trial') => void;
  onGoogleLoginSuccess?: (user: AppUser) => void;
  onOpenGuideModal?: () => void;
  onOpenGoogleSecurityModal?: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  onGoogleLoginSuccess,
  onOpenGuideModal, 
  onOpenGoogleSecurityModal 
}) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLocalGuideOpen, setIsLocalGuideOpen] = useState(false);
  const [isLocalSecurityOpen, setIsLocalSecurityOpen] = useState(false);

  const handleOpenGuide = () => {
    if (onOpenGuideModal) {
      onOpenGuideModal();
    } else {
      setIsLocalGuideOpen(true);
    }
  };

  const handleOpenSecurity = () => {
    if (onOpenGoogleSecurityModal) {
      onOpenGoogleSecurityModal();
    } else {
      setIsLocalSecurityOpen(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(false);
    setErrorMessage('');
    try {
      const appUser = await signInWithGoogle();
      if (onGoogleLoginSuccess) {
        onGoogleLoginSuccess(appUser);
      } else {
        // Fallback
        onLogin('GoogleAuth', appUser.status === 'official' ? 'official' : 'trial');
      }
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập Gmail:", err);
      setError(true);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('popup-closed-by-user')) {
        setErrorMessage('Thầy/Cô đã đóng cửa sổ đăng nhập Google. Vui lòng bấm thử lại.');
      } else {
        setErrorMessage('Không thể đăng nhập bằng tài khoản Google. Vui lòng thử lại.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleTrialLogin = () => {
    onLogin('Demo', 'trial');
  };

  return (
    <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-orange-950/10 border border-amber-100 overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#832e0c] via-orange-600 to-[#6e2309] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L100 0 L100 100 Z" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl mb-4 border border-white/30 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-amber-300" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">KHBD AI VIP V4.0</h1>
              <p className="text-amber-200 text-xs sm:text-sm font-extrabold mt-1.5 opacity-95 uppercase tracking-wide">
                ỨNG DỤNG AI SOẠN KẾ HOẠCH BÀI DẠY TỰ ĐỘNG
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 pb-0">
            {/* Google Security Certification Command Button */}
            <button
              type="button"
              onClick={handleOpenSecurity}
              className="w-full mb-5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 hover:from-blue-100 hover:to-slate-100 text-[#1a73e8] font-black py-3 rounded-2xl border border-blue-200/90 shadow-xs transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-wider group"
            >
              <ShieldCheck className="w-4 h-4 text-[#1a73e8] group-hover:scale-110 transition-transform" />
              <span>Chứng nhận an toàn bảo mật từ Google</span>
            </button>

            {/* MAIN ACTION: SIGN IN WITH GMAIL / GOOGLE */}
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 font-black py-3.5 px-4 rounded-2xl border-2 border-slate-300 hover:border-orange-500 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-3 text-sm uppercase tracking-wide group disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
                    <span>Đang kết nối Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Đăng nhập bằng Gmail (Google)</span>
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  Hoặc
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Quick Trial Access Button */}
              <button
                type="button"
                onClick={handleTrialLogin}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-md border border-amber-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 uppercase tracking-tight"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Trải nghiệm Dùng thử nhanh</span>
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage || 'Đăng nhập không thành công! Vui lòng thử lại.'}</span>
                </motion.div>
              )}

              {/* Guide / Manual Button */}
              <button
                type="button"
                onClick={handleOpenGuide}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-2xl border border-slate-200 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
              >
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>Tìm hiểu ứng dụng & Hướng dẫn</span>
              </button>
            </div>
          </div>

          {/* Author Info at the bottom of card */}
          <div className="mt-8 p-6 bg-slate-50/90 border-t border-slate-100 text-center">
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider leading-relaxed">
              Tác giả: <strong className="text-orange-700 font-extrabold">Thầy Đoàn Kiên Trung</strong>
            </p>
            <p className="text-slate-500 text-[11px] font-medium mt-1">
              Chuyên gia ứng dụng AI trong Giáo dục &bull; Zalo: <strong className="text-slate-700 font-bold">0909629947</strong>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2026 AI Education System &bull; Quản trị bảo mật Google
        </p>
      </motion.div>

      <GuideModal 
        isOpen={isLocalGuideOpen} 
        onClose={() => setIsLocalGuideOpen(false)} 
      />

      <GoogleSecurityModal
        isOpen={isLocalSecurityOpen}
        onClose={() => setIsLocalSecurityOpen(false)}
      />
    </div>
  );
};

export default Login;
