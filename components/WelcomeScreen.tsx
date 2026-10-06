import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown, ArrowRight, Sun } from 'lucide-react';

interface WelcomeScreenProps {
  userType: 'official' | 'trial';
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userType, onComplete }) => {
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onComplete]);

  // SVG Progress circle calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / 10) * circumference;

  return (
    <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center p-4 font-sans selection:bg-orange-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-950/15 border border-amber-100 overflow-hidden text-center">
          
          {/* Header section with warm gradient */}
          <div className="bg-gradient-to-br from-[#832e0c] via-orange-600 to-[#6e2309] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="50" fill="white" />
              </svg>
            </div>

            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center border border-white/30 shadow-xl mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-amber-300" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white"
            >
              Đăng nhập thành công!
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold text-amber-200"
            >
              {userType === 'official' ? (
                <>
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>BẢN CHÍNH THỨC (VIP)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>BẢN DÙNG THỬ (TRIAL)</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Main Greeting Content */}
          <div className="p-8 sm:p-10 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-r from-amber-50/80 via-orange-50 to-amber-50/80 p-6 rounded-3xl border border-amber-200/80 shadow-xs relative"
            >
              <div className="flex justify-center mb-2 text-amber-500">
                <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 uppercase tracking-tight mb-2">
                Lời chúc gửi tới Thầy/Cô
              </h2>
              <p className="text-slate-700 text-sm sm:text-base font-semibold leading-relaxed">
                Kính chúc Thầy/Cô có một ngày làm việc thật <span className="text-orange-700 font-bold">vui vẻ</span>, <span className="text-orange-700 font-bold">tràn đầy năng lượng</span> và <span className="text-orange-700 font-bold">hiệu quả</span>! 💐
              </p>
            </motion.div>

            {/* Countdown timer animation & message */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      className="text-orange-100"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="text-orange-600 transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-orange-700">
                    {countdown}
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-500">
                Tự động chuyển đến giao diện <strong className="text-orange-700">Cấu hình API Key</strong> sau <span className="text-orange-700 font-black">{countdown}</span> giây...
              </p>

              {/* Immediate continue button */}
              <button
                type="button"
                onClick={onComplete}
                className="w-full mt-3 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-700/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 uppercase tracking-tight"
              >
                <span>Tiếp tục ngay ({countdown}s)</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Footer author note */}
          <div className="p-5 bg-slate-50/90 border-t border-slate-100 text-center">
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Tác giả: <strong className="text-orange-700 font-extrabold">Thầy Đoàn Kiên Trung</strong>
            </p>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">
              Chuyên gia ứng dụng AI trong Giáo dục &bull; Zalo: <strong className="text-slate-700 font-bold">0909629947</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
