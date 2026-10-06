import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Users, 
  Shield, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Search, 
  UserCheck, 
  UserX, 
  RotateCcw, 
  Trash2, 
  PlusCircle, 
  Crown, 
  Mail, 
  Calendar, 
  Clock, 
  AlertCircle,
  FileEdit,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AppUser, 
  UserStatus, 
  UserRole,
  ADMIN_EMAIL,
  subscribeToAllUsers,
  updateUserStatus,
  updateUserRole,
  resetUserGenerationCount,
  deleteUserRecord,
  preApproveEmail
} from '../services/firebaseService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail = ''
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form for pre-approving a new email
  const [showPreApproveForm, setShowPreApproveForm] = useState<boolean>(false);
  const [preEmail, setPreEmail] = useState<string>('');
  const [preStatus, setPreStatus] = useState<UserStatus>('official');
  const [preNotes, setPreNotes] = useState<string>('');
  const [isSubmittingPre, setIsSubmittingPre] = useState<boolean>(false);

  // Edit notes state
  const [editingNotesUid, setEditingNotesUid] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const unsubscribe = subscribeToAllUsers(
      (userList) => {
        setUsers(userList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Lỗi tải danh sách người dùng:", error);
        setIsLoading(false);
        showFeedback("Không thể kết nối danh sách người dùng. Vui lòng kiểm tra quyền quản trị.", "error");
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.notes && u.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const official = users.filter(u => u.status === 'official').length;
    const trial = users.filter(u => u.status === 'trial').length;
    const blocked = users.filter(u => u.status === 'blocked').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    return { total, official, trial, blocked, adminCount };
  }, [users]);

  const handleSetStatus = async (user: AppUser, newStatus: UserStatus) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && newStatus === 'blocked') {
      showFeedback("Không thể khóa tài khoản Quản trị viên trưởng!", "error");
      return;
    }

    try {
      await updateUserStatus(user.uid, newStatus);
      const statusLabel = newStatus === 'official' 
        ? 'CẤP PHÉP TRUY CẬP (CHÍNH THỨC)' 
        : newStatus === 'trial' 
        ? 'DÙNG THỬ' 
        : 'KHÓA TRUY CẬP';
      showFeedback(`Đã chuyển ${user.email} sang: ${statusLabel}`, "success");
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi cập nhật trạng thái người dùng.", "error");
    }
  };

  const handleToggleAdminRole = async (user: AppUser) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showFeedback("Tài khoản Quản trị viên trưởng luôn giữ quyền Admin!", "error");
      return;
    }

    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(user.uid, newRole);
      showFeedback(`Đã ${newRole === 'admin' ? 'gán quyền Quản trị viên' : 'hạ xuống Người dùng thường'} cho ${user.email}`);
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi thay đổi phân quyền quản trị.", "error");
    }
  };

  const handleResetGeneration = async (user: AppUser) => {
    try {
      await resetUserGenerationCount(user.uid);
      showFeedback(`Đã đặt lại lượt dùng về 0 cho ${user.email}`);
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi khi reset lượt dùng.", "error");
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showFeedback("Không thể xóa tài khoản Quản trị viên trưởng!", "error");
      return;
    }

    try {
      await deleteUserRecord(user.uid);
      showFeedback(`Đã xóa người dùng ${user.email} khỏi hệ thống.`);
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi xóa người dùng.", "error");
    }
  };

  const handleSaveNotes = async (uid: string) => {
    try {
      const user = users.find(u => u.uid === uid);
      if (user) {
        await updateUserStatus(uid, user.status, editingNotesText);
        showFeedback("Đã cập nhật ghi chú thành công!");
      }
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi cập nhật ghi chú.", "error");
    } finally {
      setEditingNotesUid(null);
    }
  };

  const handlePreApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = preEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showFeedback("Vui lòng nhập địa chỉ Gmail hợp lệ!", "error");
      return;
    }

    setIsSubmittingPre(true);
    try {
      await preApproveEmail(clean, preStatus, preNotes.trim());
      showFeedback(`Đã cấp phép trước cho ${clean} (${preStatus === 'official' ? 'Cấp phép truy cập' : preStatus === 'trial' ? 'Dùng thử' : 'Khóa'})`);
      setPreEmail('');
      setPreNotes('');
      setShowPreApproveForm(false);
    } catch (e) {
      console.error(e);
      showFeedback("Lỗi cấp phép trước cho email.", "error");
    } finally {
      setIsSubmittingPre(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-amber-200/80 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#6e2309] via-orange-700 to-[#6e2309] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md border border-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">
                  QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN TRUY CẬP
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 text-[10px] font-black uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-orange-200 font-medium">
                Quản lý cấp phép truy cập, khóa tài khoản hoặc cấp quyền dùng thử cho giáo viên đăng nhập Gmail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-orange-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng cửa sổ quản trị"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback alert toast */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
                actionMessage.type === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-rose-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
              <button 
                onClick={() => setActionMessage(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Metric Cards */}
        <div className="p-6 pb-4 bg-orange-50/50 border-b border-orange-100 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            
            {/* Total Users */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Official Access */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Cấp phép truy cập</p>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.official}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Trial */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Dùng thử</p>
                <p className="text-2xl font-black text-amber-600 mt-0.5">{stats.trial}</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Blocked */}
            <div className="bg-white p-3.5 rounded-2xl border border-red-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Đã khóa</p>
                <p className="text-2xl font-black text-red-600 mt-0.5">{stats.blocked}</p>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Action Row: Search & Pre-approve toggle */}
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Gmail, tên Thầy/Cô, ghi chú..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('official')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'official'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Cấp phép ({stats.official})
              </button>
              <button
                onClick={() => setStatusFilter('trial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'trial'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Dùng thử ({stats.trial})
              </button>
              <button
                onClick={() => setStatusFilter('blocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'blocked'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                }`}
              >
                Đã khóa ({stats.blocked})
              </button>
            </div>

            {/* Pre-approve Toggle Button */}
            <button
              onClick={() => setShowPreApproveForm(!showPreApproveForm)}
              className="w-full md:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showPreApproveForm ? 'Đóng form thêm' : 'Cấp phép trước Gmail'}</span>
            </button>
          </div>

          {/* Pre-approve expand form */}
          {showPreApproveForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handlePreApproveSubmit}
              className="mt-3 p-4 bg-white rounded-2xl border border-orange-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Địa chỉ Gmail của Giáo viên
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={preEmail}
                    onChange={(e) => setPreEmail(e.target.value)}
                    placeholder="VD: giaovien.toan@gmail.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Quyền cấp sẵn
                </label>
                <select
                  value={preStatus}
                  onChange={(e) => setPreStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="official">🟢 Cấp phép truy cập (Chính thức)</option>
                  <option value="trial">🟡 Dùng thử</option>
                  <option value="blocked">🔴 Khóa</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={preNotes}
                  onChange={(e) => setPreNotes(e.target.value)}
                  placeholder="VD: Đã kích hoạt gói năm..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  disabled={isSubmittingPre}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
                >
                  {isSubmittingPre ? 'Lưu...' : 'Lưu'}
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* User List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
              <p className="text-xs font-bold uppercase tracking-wider">Đang tải danh sách người dùng từ hệ thống...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Không tìm thấy người dùng nào phù hợp</p>
              <p className="text-xs text-slate-400">Thầy/Cô có thể đổi từ khóa tìm kiếm hoặc bấm &quot;Cấp phép trước Gmail&quot; ở trên.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const isMasterAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const isCurrentLogged = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                const isEditingNotes = editingNotesUid === user.uid;

                return (
                  <div
                    key={user.uid}
                    className={`bg-white rounded-2xl border p-4 sm:p-4.5 transition-all shadow-xs hover:shadow-md ${
                      user.status === 'blocked'
                        ? 'border-red-200 bg-red-50/20'
                        : user.status === 'official'
                        ? 'border-emerald-200/90'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: User identity & stats */}
                      <div className="flex items-start space-x-3.5 min-w-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-11 h-11 rounded-full border-2 border-orange-200 object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm shadow-inner mt-0.5">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900 truncate">
                              {user.displayName || 'Giáo viên'}
                            </span>
                            
                            {/* Badges */}
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                                <Crown className="w-3 h-3 text-slate-950" />
                                {isMasterAdmin ? 'Tác giả & Admin' : 'Admin'}
                              </span>
                            )}

                            {isCurrentLogged && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                                Tài khoản của bạn
                              </span>
                            )}

                            {/* Status Pill */}
                            {user.status === 'official' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Cấp phép truy cập
                              </span>
                            ) : user.status === 'trial' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                Dùng thử ({user.generationCount || 0} lượt)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase">
                                <Lock className="w-3 h-3 text-red-600" />
                                Đã khóa
                              </span>
                            )}
                          </div>

                          {/* Email & metadata */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                            <span className="font-mono text-slate-700 font-bold">{user.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Lượt tạo: <strong className="text-slate-800">{user.generationCount || 0}</strong>
                            </span>
                            {user.createdAt && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Notes field */}
                          <div className="mt-2 text-xs">
                            {isEditingNotes ? (
                              <div className="flex items-center gap-2 max-w-lg">
                                <input
                                  type="text"
                                  value={editingNotesText}
                                  onChange={(e) => setEditingNotesText(e.target.value)}
                                  placeholder="Nhập ghi chú cho giáo viên này..."
                                  className="flex-1 px-2.5 py-1 text-xs border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-orange-50/40"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveNotes(user.uid)}
                                  className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => setEditingNotesUid(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <span className="text-slate-400 font-medium text-[11px]">Ghi chú:</span>
                                <span className="text-[11px] font-semibold text-slate-700 italic">
                                  {user.notes || '(Chưa có ghi chú)'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingNotesUid(user.uid);
                                    setEditingNotesText(user.notes || '');
                                  }}
                                  className="text-orange-600 hover:text-orange-700 p-0.5"
                                  title="Sửa ghi chú"
                                >
                                  <FileEdit className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons Group */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* 1. Grant Official Access */}
                        {user.status !== 'official' ? (
                          <button
                            onClick={() => handleSetStatus(user, 'official')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                            title="Cấp phép truy cập chính thức (không giới hạn lượt dùng)"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Cấp phép</span>
                          </button>
                        ) : null}

                        {/* 2. Switch to Trial */}
                        {user.status !== 'trial' ? (
                          <button
                            onClick={() => handleSetStatus(user, 'trial')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95 border border-amber-300"
                            title="Chuyển về trạng thái dùng thử"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Dùng thử</span>
                          </button>
                        ) : null}

                        {/* 3. Lock/Block */}
                        {user.status !== 'blocked' && !isMasterAdmin ? (
                          <button
                            onClick={() => handleSetStatus(user, 'blocked')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                            title="Khóa quyền truy cập của tài khoản này"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Khóa</span>
                          </button>
                        ) : null}

                        {/* Reset Generation Count */}
                        {user.status === 'trial' && (user.generationCount > 0) && (
                          <button
                            onClick={() => handleResetGeneration(user)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                            title="Đặt lại số lượt tạo bài dạy về 0"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                            <span>Reset lượt</span>
                          </button>
                        )}

                        {/* Admin Role Toggle */}
                        {!isMasterAdmin && (
                          <button
                            onClick={() => handleToggleAdminRole(user)}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              user.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={user.role === 'admin' ? 'Hạ quyền quản trị' : 'Gán quyền quản trị viên'}
                          >
                            <Shield className={`w-3.5 h-3.5 ${user.role === 'admin' ? 'text-amber-700' : 'text-slate-400'}`} />
                            <span>{user.role === 'admin' ? 'Bỏ Admin' : 'Thêm Admin'}</span>
                          </button>
                        )}

                        {/* Delete User */}
                        {!isMasterAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa người dùng khỏi hệ thống"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Phân quyền thời gian thực qua Firebase Firestore & Google Auth</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Tác giả: <strong>Thầy Đoàn Kiên Trung</strong></span>
            <span>&bull;</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
            >
              Đóng
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
