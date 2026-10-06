import React from 'react';
import { TeacherInfo } from '../types';
import { Building, Network, User, Edit3 } from 'lucide-react';

interface TeacherInfoBarProps {
  teacherInfo: TeacherInfo;
  onOpenTeacherInfoModal: () => void;
}

export const TeacherInfoBar: React.FC<TeacherInfoBarProps> = ({
  teacherInfo,
  onOpenTeacherInfoModal
}) => {
  const levelStr = Array.isArray(teacherInfo.schoolLevel)
    ? teacherInfo.schoolLevel.join('-')
    : (teacherInfo.schoolLevel || 'THCS');

  return (
    <div className="bg-gradient-to-r from-[#4d1704] via-[#692309] to-[#4d1704] border-b border-amber-900/60 text-amber-50 shadow-md">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1500px] py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Order: TRƯỜNG -> TỔ -> GIÁO VIÊN */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* 1. TRƯỜNG */}
          <div className="flex items-center space-x-1.5">
            <Building className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-amber-300/90 font-black uppercase text-[10px] tracking-wider">TRƯỜNG:</span>
            <strong className="text-white font-black truncate max-w-[220px] sm:max-w-[340px]">
              {teacherInfo.schoolName || 'TRƯỜNG THCS XYZ'}
            </strong>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase border border-amber-300">
              {levelStr}
            </span>
          </div>

          <span className="text-amber-500/40 hidden sm:inline">•</span>

          {/* 2. TỔ */}
          <div className="flex items-center space-x-1.5">
            <Network className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-amber-300/90 font-black uppercase text-[10px] tracking-wider">TỔ:</span>
            <strong className="text-white font-black">
              {teacherInfo.department || 'CNTT'}
            </strong>
          </div>

          <span className="text-amber-500/40 hidden sm:inline">•</span>

          {/* 3. GIÁO VIÊN */}
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-amber-300/90 font-black uppercase text-[10px] tracking-wider">GIÁO VIÊN:</span>
            <strong className="text-white font-black">
              {teacherInfo.teacherName || 'ĐOÀN KIÊN TRUNG'}
            </strong>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenTeacherInfoModal}
          className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-orange-700 hover:bg-orange-500 text-white border border-orange-500/50 text-[11px] font-bold transition-all duration-200 ml-auto shrink-0 shadow-sm"
          title="Chỉnh sửa Thông tin giáo viên"
        >
          <Edit3 className="w-3 h-3 text-white" />
          <span>Sửa thông tin</span>
        </button>

      </div>
    </div>
  );
};
