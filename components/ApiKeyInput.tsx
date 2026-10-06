
import React, { useState } from 'react';
import { Key, Save, PlayCircle, ExternalLink, AlertCircle, LogOut, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleSecurityModal } from './GoogleSecurityModal';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  onLogout: () => void;
  onOpenGoogleSecurityModal?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, onLogout, onOpenGoogleSecurityModal }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isLocalSecurityOpen, setIsLocalSecurityOpen] = useState(false);

  const handleOpenSecurity = () => {
    if (onOpenGoogleSecurityModal) {
      onOpenGoogleSecurityModal();
    } else {
      setIsLocalSecurityOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim().length > 15) {
      onSave(apiKey.trim());
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center p-4 font-sans selection:bg-orange-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-orange-950/10 border border-amber-100 overflow-hidden">
          
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#832e0c] via-orange-600 to-[#6e2309] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="50" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl mb-3 border border-white/30 shadow-lg">
                <Key className="w-6 h-6 text-amber-300" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">CẤU HÌNH API KEY</h1>
              <p className="text-amber-200 text-xs sm:text-sm font-extrabold mt-1.5 opacity-95 uppercase tracking-wide">
                CẤU HÌNH MÃ GOOGLE GEMINI AI KEY
              </p>
            </div>
          </div>

          {/* Form Content & Quick Action Buttons */}
          <div className="p-8 pb-6 space-y-4">
            
            {/* Security Warning Notice - Centered and placed above Action Buttons */}
            <div className="w-full bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 text-center text-amber-950 text-[11px] leading-relaxed shadow-xs space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-extrabold text-amber-900 uppercase tracking-tight">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Lưu ý bảo mật</span>
              </div>
              <p className="font-medium text-slate-700">
                Thầy/Cô tuyệt đối không chia sẻ thông tin đăng nhập dưới bất kỳ hình thức nào để đảm bảo an toàn tài khoản và duy trì quyền sử dụng dịch vụ.
              </p>
            </div>

            {/* Action Buttons on same row */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3 px-2 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 uppercase tracking-tight text-[11px] sm:text-xs text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white shrink-0" />
                <span>TẠO API KEY</span>
              </a>

              <a
                href="https://www.youtube.com/watch?v=Sz8-dj-kj8o"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3 px-2 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 uppercase tracking-tight text-[11px] sm:text-xs text-center"
              >
                <PlayCircle className="w-3.5 h-3.5 text-white shrink-0" />
                <span>XEM HƯỚNG DẪN</span>
              </a>
            </div>

            {/* Form Input for API Key */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                  Nhập mã API Key
                </label>
                
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`block w-full pl-4 pr-11 py-3.5 bg-slate-50 border-2 rounded-2xl text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-none transition-all ${
                      error 
                        ? 'border-red-400 bg-red-50 text-red-600' 
                        : 'border-slate-200 focus:border-orange-500 focus:bg-white'
                    }`}
                    placeholder="Dán mã API Key tại đây..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-500 text-xs font-bold flex items-center ml-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Mã API Key chưa đúng hoặc quá ngắn!
                  </motion.p>
                )}
              </div>

              {/* Action 3: Save API Key Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-700/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 uppercase tracking-tight text-sm"
              >
                <Save className="w-4 h-4 text-white" />
                <span>LƯU API KEY</span>
              </button>
            </form>

            {/* Google Security Certification Command Button */}
            <button
              type="button"
              onClick={handleOpenSecurity}
              className="w-full bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 hover:from-blue-100 hover:to-slate-100 text-[#1a73e8] font-black py-3 rounded-2xl border border-blue-200/90 shadow-xs transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-wider group"
            >
              <ShieldCheck className="w-4 h-4 text-[#1a73e8] group-hover:scale-110 transition-transform shrink-0" />
              <span>Chứng nhận an toàn bảo mật từ Google</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>

          </div>

          {/* Author Info at the bottom of card */}
          <div className="p-6 bg-slate-50/90 border-t border-slate-100 text-center">
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider leading-relaxed">
              Tác giả: <strong className="text-orange-700 font-extrabold">Thầy Đoàn Kiên Trung</strong>
            </p>
            <p className="text-slate-500 text-[11px] font-medium mt-1">
              Chuyên gia ứng dụng AI trong Giáo dục &bull; Zalo: <strong className="text-slate-700 font-bold">0909629947</strong>
            </p>
          </div>

        </div>
      </motion.div>

      <GoogleSecurityModal
        isOpen={isLocalSecurityOpen}
        onClose={() => setIsLocalSecurityOpen(false)}
      />
    </div>
  );
};

export default ApiKeyInput;


