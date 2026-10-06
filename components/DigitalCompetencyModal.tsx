import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Check, 
  Copy, 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Info,
  ShieldCheck,
  Cpu,
  Share2,
  Database,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { 
  DIGITAL_COMPETENCY_FRAMEWORK, 
  DIGITAL_COMPETENCY_INDICATORS, 
  LEVEL_MAPPING, 
  DOMAINS_LIST,
  DigitalIndicatorItem,
  getDigitalLevelByGrade
} from '../data/digitalCompetencyFramework';

interface DigitalCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string;
  onInsertCode?: (codeText: string) => void;
}

export const DigitalCompetencyModal: React.FC<DigitalCompetencyModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  onInsertCode
}) => {
  const [currentGrade, setCurrentGrade] = useState<string>(selectedGrade || '6');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [insertedCode, setInsertedCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedGrade) {
      setCurrentGrade(selectedGrade);
    }
  }, [selectedGrade, isOpen]);

  if (!isOpen) return null;

  const currentLevelInfo = getDigitalLevelByGrade(currentGrade);
  const levelCode = currentLevelInfo.code;

  // Lọc chỉ báo chỉ theo đúng Bậc của lớp đã chọn để tránh nhầm lẫn mã năng lực
  const indicatorsForCurrentLevel = DIGITAL_COMPETENCY_INDICATORS.filter(
    item => item.levelCode === levelCode
  );

  const filteredIndicators = indicatorsForCurrentLevel.filter(item => {
    const matchesDomain = selectedDomain === 'all' || item.domainCode === selectedDomain;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.code.toLowerCase().includes(q) ||
      item.competencyName.toLowerCase().includes(q) ||
      item.domainName.toLowerCase().includes(q) ||
      item.requirement.toLowerCase().includes(q);
    return matchesDomain && matchesSearch;
  });

  const handleCopy = (item: DigitalIndicatorItem) => {
    const textToCopy = `[${item.code}] ${item.requirement}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(item.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInsert = (item: DigitalIndicatorItem) => {
    const textToInsert = `[${item.code}] ${item.requirement}`;
    if (onInsertCode) {
      onInsertCode(textToInsert);
      setInsertedCode(item.code);
      setTimeout(() => setInsertedCode(null), 2000);
    }
  };

  const getDomainBadge = (domainCode: string) => {
    switch (domainCode) {
      case '1':
        return { badge: 'bg-blue-600 text-white', icon: <Database className="w-3.5 h-3.5" />, color: 'blue' };
      case '2':
        return { badge: 'bg-emerald-600 text-white', icon: <Share2 className="w-3.5 h-3.5" />, color: 'emerald' };
      case '3':
        return { badge: 'bg-purple-600 text-white', icon: <FileCode className="w-3.5 h-3.5" />, color: 'purple' };
      case '4':
        return { badge: 'bg-rose-600 text-white', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'rose' };
      case '5':
        return { badge: 'bg-amber-600 text-white', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'amber' };
      case '6':
        return { badge: 'bg-cyan-600 text-white', icon: <Cpu className="w-3.5 h-3.5" />, color: 'cyan' };
      default:
        return { badge: 'bg-slate-600 text-white', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'slate' };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-teal-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-4 sm:p-5 text-white flex items-start justify-between relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-teal-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    Khung Năng Lực Số Học Sinh Phổ Thông
                  </h3>
                  <span className="bg-teal-500/30 text-teal-100 text-[11px] font-bold px-2 py-0.5 rounded-full border border-teal-300/30">
                    CV 3456/BGDĐT-GDPT
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    TT 02/2025/TT-BGDĐT
                  </span>
                </div>
                <p className="text-xs text-teal-100/90 font-medium mt-0.5">
                  Quy chuẩn 6 Miền năng lực & 5 Bậc trình độ (CB1, CB2, TC1, TC2, NC1) - Tránh nhầm lẫn mã năng lực
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-teal-100 space-y-3 shrink-0">
            {/* Grade Selection */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-700 text-xs shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Chọn Khối Lớp:
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCurrentGrade(g)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      currentGrade === g
                        ? 'bg-teal-700 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-teal-50 border border-slate-200'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Tabs + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
              <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer shrink-0 ${
                    selectedDomain === 'all'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
                  }`}
                >
                  Tất cả ({indicatorsForCurrentLevel.length})
                </button>
                {DOMAINS_LIST.map(domain => {
                  const count = indicatorsForCurrentLevel.filter(c => c.domainCode === domain.code).length;
                  return (
                    <button
                      key={domain.code}
                      type="button"
                      onClick={() => setSelectedDomain(domain.code)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer shrink-0 flex items-center gap-1 ${
                        selectedDomain === domain.code
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
                      }`}
                      title={domain.name}
                    >
                      <span>M{domain.code}</span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã NLS, từ khóa..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {/* Level Alert Banner */}
            <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 flex items-start justify-between gap-3 text-xs text-teal-950 shadow-xs">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="font-black text-teal-950 text-sm">
                      Khối Lớp {currentGrade} — Mã Cấp độ chuẩn: [{levelCode}] ({currentLevelInfo.name})
                    </strong>
                    <span className="bg-teal-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      {currentLevelInfo.sourceLevel}
                    </span>
                    <span className="bg-teal-200 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {currentLevelInfo.gradeRange} ({currentLevelInfo.schoolLevel})
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    Theo <strong>Thông tư 02/2025/TT-BGDĐT</strong> (đối chiếu qua CV 3456/BGDĐT-GDPT), Lớp {currentGrade} chỉ áp dụng các mã chứa ký hiệu <strong>{levelCode}</strong>. Hệ thống tự động lọc chính xác và ngăn ngừa tuyệt đối việc nhầm lẫn giữa các khối lớp!
                  </p>
                  {selectedDomain === '6' && levelCode === 'CB1' && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Lưu ý:</strong> Theo Phụ lục CV 3456/BGDĐT-GDPT, Năng lực 6.1 ở Bậc 1 (Lớp 1-3) để trống. Học sinh Lớp {currentGrade} học và áp dụng các mã năng lực AI thuộc <strong>6.2</strong> và <strong>6.3</strong>.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List of Indicators */}
            {filteredIndicators.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600" />
                Không tìm thấy mã năng lực số nào khớp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredIndicators.map((item) => {
                  const badgeInfo = getDomainBadge(item.domainCode);
                  const isCopied = copiedCode === item.code;
                  const isInserted = insertedCode === item.code;

                  return (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-black font-mono shadow-2xs ${badgeInfo.badge}`}>
                            {item.code}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                            {item.sourceLevel} • {item.levelCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {item.competencyName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            (Miền {item.domainCode}: {item.domainName})
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleCopy(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép mã và chỉ báo NLS"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Đã chép' : 'Chép mã'}</span>
                          </button>

                          {onInsertCode && (
                            <button
                              type="button"
                              onClick={() => handleInsert(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white transition-colors cursor-pointer shadow-2xs"
                              title="Chèn mã này vào ô Nội dung cốt lõi của bài dạy"
                            >
                              {isInserted ? <Check className="w-3.5 h-3.5 text-white" /> : <PlusCircle className="w-3.5 h-3.5" />}
                              <span>{isInserted ? 'Đã chèn' : 'Chọn chèn'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {item.requirement}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-teal-50 border-t border-teal-200 text-[11px] text-teal-950 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                Cấu trúc mã NLS chuẩn: <strong>[Mã Miền].[Mã NLTP].[Bậc][Chỉ báo]</strong> (Ví dụ: <code className="bg-teal-200/80 px-1 py-0.2 rounded font-mono font-bold">1.1.TC1a</code>, <code className="bg-teal-200/80 px-1 py-0.2 rounded font-mono font-bold">6.1.TC2b</code>, <code className="bg-teal-200/80 px-1 py-0.2 rounded font-mono font-bold">6.1.NC1a</code>).
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Hoàn tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
