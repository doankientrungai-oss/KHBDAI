import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, GraduationCap, BookOpen, Users, Save, X, Check, Sparkles } from 'lucide-react';
import { TeacherInfo } from '../types';

interface TeacherInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherInfo: TeacherInfo;
  onSave: (info: TeacherInfo) => void;
}

export const SUBJECTS_BY_LEVEL: Record<'TH' | 'THCS' | 'THPT', string[]> = {
  TH: [
    'Toán',
    'Tiếng Việt',
    'Tiếng Anh',
    'Ngoại ngữ khác',
    'Đạo đức',
    'Tự nhiên và Xã hội',
    'Lịch sử và Địa lí',
    'Khoa học',
    'Tin học và Công nghệ',
    'Giáo dục thể chất',
    'Âm nhạc',
    'Mĩ thuật',
    'Hoạt động trải nghiệm',
    'Nội dung giáo dục của địa phương',
    'Trí tuệ nhân tạo (AI)',
    'Môn học khác',
    'Tự chọn'
  ],
  THCS: [
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'Ngoại ngữ khác',
    'Khoa học tự nhiên',
    'KHTN (Vật lí)',
    'KHTN (Hóa học)',
    'KHTN (Sinh học)',
    'Lịch sử và Địa lí',
    'Giáo dục công dân',
    'Tin học',
    'Công nghệ',
    'Giáo dục thể chất',
    'Âm nhạc',
    'Mĩ thuật',
    'Hoạt động trải nghiệm, hướng nghiệp',
    'Nội dung giáo dục của địa phương',
    'Trí tuệ nhân tạo (AI)',
    'Môn học khác',
    'Tự chọn'
  ],
  THPT: [
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'Ngoại ngữ khác',
    'Vật lí',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lí',
    'Giáo dục kinh tế và pháp luật',
    'Tin học',
    'Công nghệ',
    'Giáo dục thể chất',
    'Giáo dục quốc phòng và an ninh',
    'Âm nhạc',
    'Mĩ thuật',
    'Hoạt động trải nghiệm, hướng nghiệp',
    'Nội dung giáo dục của địa phương',
    'Chuyên đề học tập',
    'Trí tuệ nhân tạo (AI)',
    'Môn học khác',
    'Tự chọn'
  ]
};

export const GRADES_BY_LEVEL: Record<'TH' | 'THCS' | 'THPT', { value: string; label: string }[]> = {
  TH: [
    { value: '1', label: 'Lớp 1' },
    { value: '2', label: 'Lớp 2' },
    { value: '3', label: 'Lớp 3' },
    { value: '4', label: 'Lớp 4' },
    { value: '5', label: 'Lớp 5' },
  ],
  THCS: [
    { value: '6', label: 'Lớp 6' },
    { value: '7', label: 'Lớp 7' },
    { value: '8', label: 'Lớp 8' },
    { value: '9', label: 'Lớp 9' },
  ],
  THPT: [
    { value: '10', label: 'Lớp 10' },
    { value: '11', label: 'Lớp 11' },
    { value: '12', label: 'Lớp 12' },
  ]
};

export const DEFAULT_TEACHER_INFO: TeacherInfo = {
  managingAgency: 'UBND XÃ ABC',
  schoolName: 'TRƯỜNG THCS XYZ',
  schoolLevel: ['THCS'],
  teacherName: 'ĐOÀN KIÊN TRUNG',
  mainSubject: 'Toán',
  department: 'CNTT'
};

export const TeacherInfoModal: React.FC<TeacherInfoModalProps> = ({
  isOpen,
  onClose,
  teacherInfo,
  onSave
}) => {
  const [formData, setFormData] = useState<TeacherInfo>({
    ...teacherInfo,
    schoolLevel: Array.isArray(teacherInfo.schoolLevel) ? teacherInfo.schoolLevel : [teacherInfo.schoolLevel || 'THCS']
  });
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setFormData({
      ...teacherInfo,
      schoolLevel: Array.isArray(teacherInfo.schoolLevel) ? teacherInfo.schoolLevel : [teacherInfo.schoolLevel || 'THCS']
    });
  }, [teacherInfo, isOpen]);

  if (!isOpen) return null;

  const currentLevels = Array.isArray(formData.schoolLevel) ? formData.schoolLevel : ['THCS'];

  const handleToggleLevel = (level: 'TH' | 'THCS' | 'THPT') => {
    let newLevels: ('TH' | 'THCS' | 'THPT')[];
    if (currentLevels.includes(level)) {
      if (currentLevels.length === 1) return; // Keep at least 1 selected
      newLevels = currentLevels.filter(l => l !== level);
    } else {
      newLevels = [...currentLevels, level];
    }

    // Sort order: TH, THCS, THPT
    const order: Record<'TH' | 'THCS' | 'THPT', number> = { TH: 1, THCS: 2, THPT: 3 };
    newLevels.sort((a, b) => order[a] - order[b]);

    const availableSubjects = Array.from(
      new Set(newLevels.flatMap(lvl => SUBJECTS_BY_LEVEL[lvl] || []))
    );

    let newSubject = formData.mainSubject;
    if (!availableSubjects.includes(newSubject)) {
      newSubject = availableSubjects[0] || 'Toán';
    }

    setFormData(prev => ({
      ...prev,
      schoolLevel: newLevels,
      mainSubject: newSubject
    }));
  };

  const availableSubjects = Array.from(
    new Set(currentLevels.flatMap(lvl => SUBJECTS_BY_LEVEL[lvl] || []))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 800);
  };

  const labelClass = "block text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";
  const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-slate-800 text-xs placeholder:text-slate-400";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-orange-950/30 border border-amber-200 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#832e0c] via-orange-600 to-[#6e2309] p-5 text-white relative">
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-400/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  HỒ SƠ CÁ NHÂN
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight mt-0.5">
                  THÔNG TIN GIÁO VIÊN
                </h3>
              </div>
            </div>
            <p className="text-xs text-amber-100/90 mt-2 font-medium">
              Thông tin khai báo tại đây sẽ tự động đồng bộ vào cấu hình bài soạn và mẫu KHBD chuẩn.
            </p>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 1. Cơ quan chủ quản */}
            <div>
              <label className={labelClass}>
                <Building className="w-4 h-4 text-orange-600" />
                <span>Cơ quan chủ quản</span>
              </label>
              <input
                type="text"
                value={formData.managingAgency}
                onChange={(e) => setFormData(prev => ({ ...prev, managingAgency: e.target.value }))}
                placeholder="VD: SỞ GD&ĐT.../ UBND PHƯỜNG/XÃ..."
                required
                className={inputClass}
              />
            </div>

            {/* 2. Tên trường */}
            <div>
              <label className={labelClass}>
                <Building className="w-4 h-4 text-orange-600" />
                <span>Tên Trường</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="VD: TRƯỜNG TH/THCS/THPT..."
                required
                className={inputClass}
              />
            </div>

            {/* 3. Tổ chuyên môn */}
            <div>
              <label className={labelClass}>
                <Users className="w-4 h-4 text-orange-600" />
                <span>Tổ chuyên môn</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="VD: TOÁN - TIN"
                required
                className={inputClass}
              />
            </div>

            {/* 4. Họ tên giáo viên */}
            <div>
              <label className={labelClass}>
                <User className="w-4 h-4 text-orange-600" />
                <span>Họ tên giáo viên</span>
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherName: e.target.value }))}
                placeholder="VD: NGUYỄN VĂN A"
                required
                className={inputClass}
              />
            </div>

            {/* 5. Bộ môn giảng dạy chính */}
            <div>
              <label className={labelClass}>
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>Bộ môn giảng dạy chính</span>
              </label>
              <select
                value={formData.mainSubject}
                onChange={(e) => setFormData(prev => ({ ...prev, mainSubject: e.target.value }))}
                className={inputClass}
              >
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-orange-700 font-semibold mt-1 italic">
                * Danh sách môn học tự động tổng hợp theo các cấp học đã chọn ở dưới.
              </p>
            </div>

            {/* 6. Loại hình trường */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass + " mb-0"}>
                  <GraduationCap className="w-4 h-4 text-orange-600" />
                  <span>Loại hình trường</span>
                </label>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md">
                  Chọn 1 hoặc nhiều cấp (Liên cấp)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'TH', label: 'Cấp 1 (TH)' },
                  { id: 'THCS', label: 'Cấp 2 (THCS)' },
                  { id: 'THPT', label: 'Cấp 3 (THPT)' }
                ].map((item) => {
                  const isSelected = currentLevels.includes(item.id as 'TH' | 'THCS' | 'THPT');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleLevel(item.id as 'TH' | 'THCS' | 'THPT')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-50 border-orange-500 text-orange-950 shadow-xs ring-2 ring-orange-200'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                * Nếu dạy trường liên cấp (VD: TH & THCS), quý thầy/cô bấm chọn cả 2 cấp.
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-orange-700 hover:bg-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-700/20 flex items-center space-x-1.5"
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Lưu thông tin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
