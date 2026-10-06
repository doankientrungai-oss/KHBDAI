import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Search, 
  Check, 
  Copy, 
  PlusCircle, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Cpu, 
  SlidersHorizontal,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { AI_FRAMEWORK_BY_GRADE, AI_EDUCATION_DOMAINS, AICodeItem } from '../data/aiEducationFramework';

interface AICompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string;
  onInsertCode?: (codeText: string) => void;
}

export const AICompetencyModal: React.FC<AICompetencyModalProps> = ({
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

  // Sync with prop when modal opens
  React.useEffect(() => {
    if (selectedGrade && AI_FRAMEWORK_BY_GRADE[selectedGrade]) {
      setCurrentGrade(selectedGrade);
    }
  }, [selectedGrade, isOpen]);

  if (!isOpen) return null;

  const gradeData = AI_FRAMEWORK_BY_GRADE[currentGrade] || AI_FRAMEWORK_BY_GRADE['6'];
  const allCodes = gradeData?.codes || [];

  const filteredCodes = allCodes.filter(item => {
    const matchesDomain = selectedDomain === 'all' || item.domainId === selectedDomain;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.code.toLowerCase().includes(q) ||
      item.topicName.toLowerCase().includes(q) ||
      item.contentTopic.toLowerCase().includes(q) ||
      item.requirement.toLowerCase().includes(q);
    return matchesDomain && matchesSearch;
  });

  const handleCopy = (item: AICodeItem) => {
    const textToCopy = `[${item.code}] ${item.requirement}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(item.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInsert = (item: AICodeItem) => {
    const textToInsert = `[${item.code}] ${item.requirement}`;
    if (onInsertCode) {
      onInsertCode(textToInsert);
      setInsertedCode(item.code);
      setTimeout(() => setInsertedCode(null), 2000);
    }
  };

  const getDomainColor = (domainId: string) => {
    switch (domainId) {
      case 'NLa':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', badge: 'bg-blue-600 text-white', icon: '👤' };
      case 'NLb':
        return { bg: 'bg-purple-50 text-purple-800 border-purple-200', badge: 'bg-purple-600 text-white', icon: '⚖️' };
      case 'NLc':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', badge: 'bg-emerald-600 text-white', icon: '💻' };
      case 'NLd':
        return { bg: 'bg-amber-50 text-amber-900 border-amber-200', badge: 'bg-amber-600 text-white', icon: '🛠️' };
      default:
        return { bg: 'bg-slate-50 text-slate-800 border-slate-200', badge: 'bg-slate-600 text-white', icon: '🤖' };
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
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-4 sm:p-5 text-white flex items-start justify-between relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                <Bot className="w-6 h-6 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    Khung Giáo Dục Trí Tuệ Nhân Tạo (AI)
                  </h3>
                  <span className="bg-purple-500/30 text-purple-100 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-300/30">
                    QĐ 2422/QĐ-BGDĐT
                  </span>
                </div>
                <p className="text-xs text-purple-100/90 font-medium mt-0.5">
                  Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026 của Bộ Giáo dục và Đào tạo
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

          {/* Quick Filter Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-purple-100 space-y-3 shrink-0">
            {/* Grade Selection */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-700 text-xs shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" /> Chọn Khối Lớp:
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCurrentGrade(g)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      currentGrade === g
                        ? 'bg-purple-700 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
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
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
                  }`}
                >
                  Tất cả ({allCodes.length})
                </button>
                {AI_EDUCATION_DOMAINS.map(domain => {
                  const count = allCodes.filter(c => c.domainId === domain.id).length;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer shrink-0 flex items-center gap-1 ${
                        selectedDomain === domain.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
                      }`}
                      title={domain.name}
                    >
                      <span>{domain.id}</span>
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
                  placeholder="Tìm mã YCCĐ, từ khóa..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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
            {/* Grade summary banner */}
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-start gap-2.5 text-xs text-purple-950">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block">Định hướng AI Khối Lớp {currentGrade}:</strong>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{gradeData?.summary}</p>
              </div>
            </div>

            {/* List of Codes */}
            {filteredCodes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Bot className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-600" />
                Không tìm thấy mã YCCĐ nào khớp với từ khóa tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredCodes.map((item) => {
                  const style = getDomainColor(item.domainId);
                  const isCopied = copiedCode === item.code;
                  const isInserted = insertedCode === item.code;

                  return (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-black font-mono ${style.badge}`}>
                            {item.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {item.contentTopic}
                          </span>
                          {item.isExtended && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Mở rộng (MR)
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            ({item.domainId} - {item.topicName})
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleCopy(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép mã và yêu cầu"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Đã chép' : 'Chép mã'}</span>
                          </button>

                          {onInsertCode && (
                            <button
                              type="button"
                              onClick={() => handleInsert(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer shadow-2xs"
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

          {/* Footer Guidelines */}
          <div className="p-3 bg-purple-50/90 border-t border-purple-200 text-[11px] text-purple-950 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                Cấu trúc mã YCCĐ chuẩn: <strong>[Lớp].[Mã chủ đề].[Số thứ tự]</strong> (Ví dụ: <code className="bg-purple-200/80 px-1 py-0.2 rounded font-mono font-bold">6.A1.2</code>, <code className="bg-purple-200/80 px-1 py-0.2 rounded font-mono font-bold">10.C3.1</code>).
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Hoàn tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
