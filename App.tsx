import React, { useState, useCallback, useEffect } from 'react';
import { LessonPlanFormData, TeacherInfo } from './types';
import { generateLessonPlan } from './services/geminiService';
import Header from './components/Header';
import LessonPlanForm from './components/LessonPlanForm';
import LessonPlanDisplay from './components/LessonPlanDisplay';
import Login from './components/Login';
import ApiKeyInput from './components/ApiKeyInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { VipUpgradeModal } from './components/VipUpgradeModal';
import { TeacherInfoModal, DEFAULT_TEACHER_INFO } from './components/TeacherInfoModal';
import { TeacherInfoBar } from './components/TeacherInfoBar';
import { GuideModal } from './components/GuideModal';
import { GoogleSecurityModal } from './components/GoogleSecurityModal';
import { UserManagementModal } from './components/UserManagementModal';
import { BlockedScreen } from './components/BlockedScreen';
import { loadActiveLessonPlanConfig, clearActiveLessonPlanConfig } from './utils/configStorage';
import { Heart, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { 
  auth, 
  subscribeToUser, 
  logoutUser, 
  incrementUserGenerationCount, 
  AppUser,
  ADMIN_EMAIL
} from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'official' | 'trial'>('trial');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Current Google Firebase User
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>(DEFAULT_TEACHER_INFO);
  const [isTeacherInfoModalOpen, setIsTeacherInfoModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isGoogleSecurityModalOpen, setIsGoogleSecurityModalOpen] = useState<boolean>(false);

  const [generationCount, setGenerationCount] = useState<number>(0);
  const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);
  const [vipModalReason, setVipModalReason] = useState<'copy' | 'download' | 'limit_reached' | 'general'>('general');

  const handleOpenVipModal = useCallback((reason: 'copy' | 'download' | 'limit_reached' | 'general' = 'general') => {
    setVipModalReason(reason);
    setIsVipModalOpen(true);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubscribeUserListener: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // User logged in via Google Auth
        unsubscribeUserListener = subscribeToUser(
          fbUser.uid,
          (userData) => {
            if (userData) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
              
              if (userData.status === 'official') {
                setUserType('official');
              } else if (userData.status === 'trial') {
                setUserType('trial');
                setGenerationCount(userData.generationCount || 0);
              }
            } else {
              // Document not created yet or pending
              setIsAuthenticated(true);
            }
            setIsCheckingAuth(false);
          },
          (err) => {
            console.error("Lỗi đồng bộ người dùng:", err);
            setIsCheckingAuth(false);
          }
        );
      } else {
        // No Google Auth session, check legacy local storage
        if (unsubscribeUserListener) {
          unsubscribeUserListener();
          unsubscribeUserListener = null;
        }
        setCurrentUser(null);
        
        const authStatus = localStorage.getItem('khbd_auth');
        const savedUserType = (localStorage.getItem('khbd_user_type') as 'official' | 'trial') || 'trial';
        if (authStatus === 'true') {
          setIsAuthenticated(true);
          setUserType(savedUserType);
        } else {
          setIsAuthenticated(false);
        }
        setIsCheckingAuth(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserListener) {
        unsubscribeUserListener();
      }
    };
  }, []);

  // Load local configurations & environment API key
  useEffect(() => {
    const defaultEnvApiKey = (typeof process !== 'undefined' ? (process.env.API_KEY || process.env.GEMINI_API_KEY || '') : '') || '';
    const savedApiKey = localStorage.getItem('khbd_api_key');
    const savedGenCount = localStorage.getItem('khbd_gen_count');
    const savedTeacherInfo = localStorage.getItem('khbd_teacher_info');

    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else if (defaultEnvApiKey) {
      setApiKey(defaultEnvApiKey);
    }

    if (savedGenCount) {
      setGenerationCount(parseInt(savedGenCount, 10) || 0);
    }

    if (savedTeacherInfo) {
      try {
        const parsed = JSON.parse(savedTeacherInfo);
        if (typeof parsed.schoolLevel === 'string') {
          parsed.schoolLevel = [parsed.schoolLevel];
        }
        setTeacherInfo(parsed);
        if (parsed.mainSubject) {
          setFormData(prev => ({ ...prev, subject: parsed.mainSubject }));
        }
      } catch (e) {
        console.error("Failed to parse teacher info:", e);
      }
    }

    loadActiveLessonPlanConfig().then((savedConfig) => {
      if (savedConfig) {
        setFormData(prev => ({
          ...prev,
          ...savedConfig
        }));
      }
    }).catch(e => {
      console.warn("Failed to load active lesson plan config:", e);
    });
  }, []);

  const handleLogin = (_token: string, mode: 'official' | 'trial') => {
    setIsAuthenticated(true);
    setUserType(mode);
    setShowWelcome(true);
    localStorage.setItem('khbd_auth', 'true');
    localStorage.setItem('khbd_user_type', mode);
  };

  const handleGoogleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const mode = user.status === 'official' ? 'official' : 'trial';
    setUserType(mode);
    setGenerationCount(user.generationCount || 0);
    setShowWelcome(true);
    localStorage.setItem('khbd_auth', 'true');
    localStorage.setItem('khbd_user_type', mode);
  };

  const handleSaveTeacherInfo = (info: TeacherInfo) => {
    setTeacherInfo(info);
    localStorage.setItem('khbd_teacher_info', JSON.stringify(info));
    setFormData(prev => ({ ...prev, subject: info.mainSubject }));
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('khbd_api_key', key);
  };

  const handleResetApiKey = () => {
    setApiKey('');
    localStorage.removeItem('khbd_api_key');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserType('trial');
    setApiKey('');
    setShowWelcome(false);
    localStorage.removeItem('khbd_auth');
    localStorage.removeItem('khbd_user_type');
    localStorage.removeItem('khbd_api_key');
  };

  const initialFormData: LessonPlanFormData = {
    lessonTitle: '',
    subject: 'Toán',
    grade: '6',
    textbook: 'Bộ sách hiện hành',
    duration: '2',
    splitPeriods: false,
    outputLanguage: 'Tiếng Việt',
    customLanguage: '',
    layoutColumns: '1',
    templateType: 'auto',
    coreContent: '',
    customIntegration: '',
    attachedFiles: [],
    extractGraphics: false,
    graphicInsertMode: 'auto',
    extractedGraphics: [],
    includeReinforcementQuestions: false,
    includeTeachingMethods: false,
    includeGames: false,
    includeDigitalCompetence: true,
    includeGDQP: false,
    includeHSKT: false,
    includeTimeline: false,
    includeInfographic: false,
    includeAI2422: true,
    includeAI3439: true,
    includeSTEM: false,
  };

  const [formData, setFormData] = useState<LessonPlanFormData>(initialFormData);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGeneratePlan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Check blocked status
    if (currentUser?.status === 'blocked') {
      setError('Tài khoản của Thầy/Cô đã bị tạm khóa. Vui lòng liên hệ Thầy Đoàn Kiên Trung (0909629947) để mở khóa.');
      return;
    }

    // Check trial limit (2 free lesson plans for trial users)
    const effectiveUserType = currentUser ? (currentUser.status === 'official' ? 'official' : 'trial') : userType;
    const currentCount = currentUser ? (currentUser.generationCount || 0) : generationCount;

    if (effectiveUserType === 'trial' && currentCount >= 2) {
      handleOpenVipModal('limit_reached');
      setError('Thầy/Cô đã sử dụng hết 2/2 lượt trải nghiệm ở bản DÙNG THỬ. Vui lòng liên hệ Thầy Đoàn Kiên Trung để được cấp phép truy cập bản chính thức!');
      return;
    }

    const hasCoreContentOrFiles = Boolean(formData.coreContent?.trim()) || (formData.attachedFiles && formData.attachedFiles.length > 0);
    if (!hasCoreContentOrFiles || !formData.lessonTitle || !formData.subject) {
      setError('Vui lòng điền Tên bài soạn, Môn học và Nội dung cốt lõi (hoặc đính kèm tệp tài liệu nguồn).');
      return;
    }

    if (formData.outputLanguage === 'Ngôn ngữ khác' && !formData.customLanguage?.trim()) {
      setError('Vui lòng nhập tên Ngôn ngữ bài soạn (VD: Tiếng Pháp, Tiếng Trung, Tiếng Nhật, Tiếng Đức...) trước khi bắt đầu tạo bài dạy.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedPlan('');

    try {
      const plan = await generateLessonPlan(formData, apiKey, teacherInfo);
      setGeneratedPlan(plan);

      // Increment count for trial users
      if (effectiveUserType === 'trial') {
        const newCount = currentCount + 1;
        setGenerationCount(newCount);
        localStorage.setItem('khbd_gen_count', newCount.toString());

        if (currentUser) {
          incrementUserGenerationCount(currentUser.uid, currentCount).catch(console.error);
        }

        if (newCount >= 2) {
          setTimeout(() => {
            handleOpenVipModal('limit_reached');
          }, 1200);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi tạo kế hoạch bài dạy. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, apiKey, teacherInfo, generationCount, userType, currentUser, handleOpenVipModal]);

  const clearAll = useCallback(async () => {
    try {
      await clearActiveLessonPlanConfig();
    } catch (_) {}
    setFormData({
      ...initialFormData,
      subject: teacherInfo?.mainSubject || 'Toán'
    });
    setGeneratedPlan('');
    setError('');
  }, [initialFormData, teacherInfo?.mainSubject]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-orange-50/50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-orange-900 uppercase tracking-widest">Đang tải hệ thống KHBD AI...</p>
      </div>
    );
  }

  // If user is logged in but status is blocked by admin
  if (currentUser && currentUser.status === 'blocked') {
    return (
      <BlockedScreen 
        user={currentUser} 
        onLogout={handleLogout} 
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login 
          onLogin={handleLogin} 
          onGoogleLoginSuccess={handleGoogleLoginSuccess}
          onOpenGuideModal={() => setIsGuideModalOpen(true)} 
          onOpenGoogleSecurityModal={() => setIsGoogleSecurityModalOpen(true)}
        />
        <GuideModal 
          isOpen={isGuideModalOpen} 
          onClose={() => setIsGuideModalOpen(false)} 
        />
        <GoogleSecurityModal
          isOpen={isGoogleSecurityModalOpen}
          onClose={() => setIsGoogleSecurityModalOpen(false)}
        />
      </>
    );
  }

  if (showWelcome) {
    return (
      <WelcomeScreen 
        userType={userType} 
        onComplete={() => setShowWelcome(false)} 
      />
    );
  }

  if (!apiKey) {
    return (
      <>
        <ApiKeyInput 
          onSave={handleSaveApiKey} 
          onLogout={handleLogout} 
          onOpenGoogleSecurityModal={() => setIsGoogleSecurityModalOpen(true)}
        />
        <GoogleSecurityModal
          isOpen={isGoogleSecurityModalOpen}
          onClose={() => setIsGoogleSecurityModalOpen(false)}
        />
      </>
    );
  }

  const effectiveUserType = currentUser ? (currentUser.status === 'official' ? 'official' : 'trial') : userType;
  const effectiveGenerationCount = currentUser ? (currentUser.generationCount || 0) : generationCount;

  return (
    <div className="min-h-screen bg-[#fffcf8] text-slate-800 font-sans selection:bg-orange-100 flex flex-col">
      <Header 
        onLogout={handleLogout} 
        onResetApiKey={handleResetApiKey} 
        userType={effectiveUserType}
        generationCount={effectiveGenerationCount}
        teacherInfo={teacherInfo}
        onOpenTeacherInfoModal={() => setIsTeacherInfoModalOpen(true)}
        onOpenVipModal={handleOpenVipModal}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        currentUser={currentUser}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />
      
      <TeacherInfoBar 
        teacherInfo={teacherInfo}
        onOpenTeacherInfoModal={() => setIsTeacherInfoModalOpen(true)}
      />
      
      <main className="container mx-auto p-4 lg:p-8 max-w-[1500px] flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Configuration Sidebar */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl shadow-orange-950/5 border border-amber-200 border-l-[5px] border-l-orange-600 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-amber-100/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-6 bg-orange-600 rounded-full"></div>
                  <h2 className="text-lg font-black text-amber-950 uppercase tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <span>CẤU HÌNH BÀI SOẠN</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {effectiveUserType === 'official' ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 px-2.5 py-1 bg-emerald-300 border border-emerald-400 rounded-lg shadow-sm">
                      Cấp phép truy cập
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-lg shadow-sm">
                      Dùng thử: {effectiveGenerationCount}/2
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <LessonPlanForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleGeneratePlan}
                  isLoading={isLoading}
                  clearForm={clearAll}
                  generationCount={effectiveGenerationCount}
                  maxGenerations={2}
                  userType={effectiveUserType}
                  teacherInfo={teacherInfo}
                  onOpenTeacherInfoModal={() => setIsTeacherInfoModalOpen(true)}
                  onOpenVipModal={handleOpenVipModal}
                  userApiKey={apiKey}
                />
              </div>
            </div>
          </div>
          
          {/* Result Display Section */}
          <div className="lg:col-span-8 xl:col-span-8 relative lg:self-stretch min-h-[600px] h-[650px] lg:h-auto">
            <div className="lg:absolute lg:inset-0 flex flex-col h-full min-h-0">
              {error && (
                <div className="animate-in fade-in slide-in-from-top-4 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-xl shadow-sm flex flex-col space-y-3 shrink-0 mb-4" role="alert">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                  {error.includes("API Key") && (
                    <button 
                      onClick={() => {
                        setApiKey('');
                        localStorage.removeItem('khbd_api_key');
                        setError('');
                      }}
                      className="self-start text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-tight"
                    >
                      Cấu hình lại API Key
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-h-0 flex flex-col h-full">
                 <LessonPlanDisplay 
                   plan={generatedPlan} 
                   isLoading={isLoading} 
                   lessonTitle={formData.lessonTitle} 
                   isTrial={effectiveUserType === 'trial'}
                   userType={effectiveUserType}
                   onOpenVipModal={handleOpenVipModal}
                   formData={formData}
                   teacherInfo={teacherInfo}
                   userApiKey={apiKey}
                   extractedGraphics={formData.extractedGraphics || []}
                   onUpdateGraphics={(updated) => setFormData(prev => ({ ...prev, extractedGraphics: updated }))}
                   onUpdatePlan={(updatedPlan) => setGeneratedPlan(updatedPlan)}
                 />
              </div>
            </div>
          </div>

        </div>

        {/* Full-width Horizontal Teacher Notes Banner */}
        <div className="mt-8 bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-orange-50/90 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md shadow-orange-600/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-orange-950 font-black text-base uppercase tracking-tight flex items-center gap-2">
                  GHI CHÚ DÀNH CHO GIÁO VIÊN
                </h3>
                <p className="text-xs text-orange-900/80 font-medium">
                  Hướng dẫn rà soát & vận dụng Kế hoạch bài dạy
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto flex-1 text-xs text-orange-950 font-medium">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                <span>Kế hoạch bài dạy được tạo tự động theo Mẫu KHBD Chuẩn BGD&ĐT (CV 5512/3456/2345 & QĐ 2422).</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>Thầy/Cô rà soát và chủ động tinh chỉnh các hoạt động học tập phù hợp thực tế giảng dạy tại đơn vị.</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>Bảo mật 100%: Dữ liệu học liệu và bài dạy chỉ lưu trữ bảo mật trên thiết bị cá nhân của Giáo viên.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TeacherInfoModal
        isOpen={isTeacherInfoModalOpen}
        onClose={() => setIsTeacherInfoModalOpen(false)}
        teacherInfo={teacherInfo}
        onSave={handleSaveTeacherInfo}
      />

      <VipUpgradeModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        reason={vipModalReason}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <GoogleSecurityModal
        isOpen={isGoogleSecurityModalOpen}
        onClose={() => setIsGoogleSecurityModalOpen(false)}
      />

      {/* Admin User Management Modal */}
      <UserManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUserEmail={currentUser?.email || ''}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#6e2309] via-[#832e0c] to-[#6e2309] border-t border-orange-950/40 text-orange-100 py-8 px-6 mt-12 shadow-inner">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md border border-amber-300/30">
              AI
            </div>
            <div>
              <span className="font-black text-white text-base tracking-wide uppercase block">KHBD AI VIP V4.0</span>
              <span className="text-[10px] text-orange-300 font-bold uppercase tracking-wider block">Trí tuệ nhân tạo hỗ trợ giáo dục</span>
            </div>
          </div>

          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-1">
            <p className="font-semibold text-xs md:text-sm text-orange-100">
              Phát triển bởi <a href="https://www.facebook.com/kientrungkrn" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-200 font-black transition-colors underline underline-offset-2">THẦY GIÁO: ĐOÀN KIÊN TRUNG</a> — Zalo: <strong className="text-amber-200 font-bold">0909629947</strong> — BIDV: <strong className="text-amber-200 font-bold">8870889643</strong>
            </p>
            <p className="text-[11px] text-orange-200/80 font-medium">
              Chuyên biệt hóa quy trình soạn KHBD chuẩn cho Giáo viên cả nước &copy; 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsGoogleSecurityModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 rounded-full bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 font-bold text-xs uppercase tracking-wider border border-blue-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Xem Chứng nhận an toàn bảo mật từ Google"
            >
              <ShieldCheck className="w-4 h-4 text-blue-300 mr-1.5" />
              <span>BẢO MẬT GOOGLE</span>
            </button>

            <a 
              href="https://www.facebook.com/kientrungkrn/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-950/80 border border-red-300/50 transition-all hover:scale-[1.03] active:scale-[0.97]"
              title="Theo dõi trang Facebook của tác giả"
            >
              <Heart className="w-4 h-4 fill-current mr-2 text-white" />
              <span>ỦNG HỘ TÁC GIẢ</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
