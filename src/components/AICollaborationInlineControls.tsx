import React, { useState } from 'react';
import { 
  Sparkles, Check, CheckCheck, RefreshCw, Undo2, 
  Bot, UserCheck, ShieldCheck, ChevronDown, ChevronUp,
  MessageSquare, Edit3, Eye, ArrowRight
} from 'lucide-react';

interface InlineAIFieldProps {
  id: string;
  label: string;
  fieldKey: string;
  isCollaborationMode: boolean;
  value: string;
  onChange: (val: string) => void;
  confidence?: number;
  aiRationale?: string;
  alternatives?: string[];
  placeholder?: string;
  rows?: number;
  type?: 'textarea' | 'input';
  categoryBadge?: string;
}

/**
 * An inline field component that adapts when 'AI-Human Collaboration Mode' is enabled:
 * - Highlights AI generated content with a distinct border/accent
 * - Provides inline [AI 제안 수락] (Accept suggestion), [수정/보완] (Edit/Refine), [대안 보기] (Alternatives) buttons
 */
export const InlineAICollaborationField: React.FC<InlineAIFieldProps> = ({
  id,
  label,
  fieldKey,
  isCollaborationMode,
  value,
  onChange,
  confidence = 94,
  aiRationale = '상담 대화록 기반 AI 복지 표준 추출',
  alternatives = [],
  placeholder = '',
  rows = 3,
  type = 'textarea',
  categoryBadge = 'AI 초안',
}) => {
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [initialAiDraft] = useState<string>(value);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const handleAccept = () => {
    setIsAccepted(true);
    setStatusToast('✓ AI 제안이 확정되었습니다.');
    setTimeout(() => setStatusToast(null), 2000);
  };

  const handleApplyAlternative = (altText: string) => {
    onChange(altText);
    setIsModified(true);
    setShowAlternatives(false);
    setStatusToast('✨ 대체 문장이 서식에 반영되었습니다.');
    setTimeout(() => setStatusToast(null), 2000);
  };

  const handleRevert = () => {
    onChange(initialAiDraft);
    setIsModified(false);
    setIsAccepted(false);
    setStatusToast('↺ 원래 AI 초안으로 복원되었습니다.');
    setTimeout(() => setStatusToast(null), 2000);
  };

  return (
    <div
      className={`relative transition-all rounded-xl ${
        isCollaborationMode
          ? isAccepted
            ? 'p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-400/80 dark:border-emerald-700/80 shadow-xs'
            : isModified
            ? 'p-3 bg-blue-50/40 dark:bg-blue-950/20 border-2 border-blue-400/80 dark:border-blue-700/80 shadow-xs'
            : 'p-3 bg-amber-50/50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 shadow-xs ring-2 ring-amber-300/40'
          : 'space-y-1'
      }`}
    >
      {/* Field Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
        <label htmlFor={id} className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          <span>{label}</span>
          {isCollaborationMode && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold flex items-center gap-1 ${
              isAccepted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                : isModified
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              {isAccepted ? '검토 완료 (승인)' : isModified ? '복지사 수정 반영' : `${categoryBadge} (${confidence}%)`}
            </span>
          )}
        </label>

        {/* Inline AI Action Controls (Visible in Collaboration Mode) */}
        {isCollaborationMode && (
          <div className="flex items-center gap-1.5">
            {statusToast && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
                {statusToast}
              </span>
            )}

            {!isAccepted && (
              <button
                type="button"
                onClick={handleAccept}
                className="px-2 py-0.8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                title="AI가 작성한 내용을 그대로 수락하고 검토 완료 상태로 표시합니다."
              >
                <Check className="w-3 h-3" />
                <span>AI 제안 수락</span>
              </button>
            )}

            {alternatives && alternatives.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAlternatives((prev) => !prev)}
                className="px-2 py-0.8 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                title="추천 대체 문장 보기"
              >
                <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                <span>대안 문장</span>
                {showAlternatives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {(isModified || isAccepted) && (
              <button
                type="button"
                onClick={handleRevert}
                className="px-1.5 py-0.8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 text-[10px] flex items-center gap-0.5 cursor-pointer"
                title="초기 AI 초안으로 복원"
              >
                <Undo2 className="w-2.5 h-2.5" />
                <span>초기화</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actual Input / Textarea */}
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setIsModified(true);
          }}
          placeholder={placeholder}
          className={`w-full p-2.5 text-xs rounded-lg transition-all focus:outline-none leading-relaxed ${
            isCollaborationMode
              ? isAccepted
                ? 'bg-white dark:bg-[#1E1916] border border-emerald-300 dark:border-emerald-700 text-stone-900 dark:text-stone-100'
                : isModified
                ? 'bg-white dark:bg-[#1E1916] border border-blue-300 dark:border-blue-700 text-stone-900 dark:text-stone-100'
                : 'bg-white dark:bg-[#201A17] border border-amber-300 dark:border-amber-600 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500'
              : 'bg-white dark:bg-[#201A17] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-stone-400'
          }`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setIsModified(true);
          }}
          placeholder={placeholder}
          className={`w-full p-2 text-xs rounded-lg transition-all focus:outline-none ${
            isCollaborationMode
              ? isAccepted
                ? 'bg-white dark:bg-[#1E1916] border border-emerald-300 dark:border-emerald-700 text-stone-900 dark:text-stone-100'
                : isModified
                ? 'bg-white dark:bg-[#1E1916] border border-blue-300 dark:border-blue-700 text-stone-900 dark:text-stone-100'
                : 'bg-white dark:bg-[#201A17] border border-amber-300 dark:border-amber-600 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500'
              : 'bg-white dark:bg-[#201A17] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-stone-400'
          }`}
        />
      )}

      {/* Rationale & Alternatives Box (in Collaboration Mode) */}
      {isCollaborationMode && (
        <div className="mt-1 space-y-1">
          <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-start gap-1.5 bg-amber-50/60 dark:bg-amber-950/30 p-1.5 rounded-lg border border-amber-200/70 dark:border-amber-900/50">
            <Bot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">사정 근거: {aiRationale}</span>
          </div>

          {showAlternatives && alternatives && alternatives.length > 0 && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 space-y-1.5 animate-fade-in">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                💡 추천 대체 문장 (클릭 시 서식에 즉시 반영)
              </span>
              <div className="space-y-1">
                {alternatives.map((alt, aIdx) => (
                  <button
                    key={aIdx}
                    type="button"
                    onClick={() => handleApplyAlternative(alt)}
                    className="w-full text-left p-2 rounded-md bg-white dark:bg-[#251F1C] hover:bg-amber-100 dark:hover:bg-amber-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="leading-snug">{alt}</span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0 ml-2 group-hover:underline">
                      선택 적용
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CollaborationToolbarProps {
  isCollaborationMode: boolean;
  onToggleCollaborationMode: (enabled: boolean) => void;
  onAcceptAll: () => void;
  onOpenFullReviewModal: () => void;
  totalFieldsCount?: number;
}

/**
 * Prominent In-Place Collaboration Control Bar rendered above standard form sheet
 */
export const CollaborationTopBanner: React.FC<CollaborationToolbarProps> = ({
  isCollaborationMode,
  onToggleCollaborationMode,
  onAcceptAll,
  onOpenFullReviewModal,
  totalFieldsCount = 7,
}) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isCollaborationMode
        ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-amber-400 dark:border-amber-600 shadow-sm ring-2 ring-amber-400/30'
        : 'bg-stone-100/90 dark:bg-[#251E1A] border-stone-200 dark:border-stone-800'
    }`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleCollaborationMode(!isCollaborationMode)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer select-none shrink-0 ${
              isCollaborationMode ? 'bg-amber-600 ring-2 ring-amber-400' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                isCollaborationMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                AI-인간 협업 수정 모드 (In-Place Co-Pilot)
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                isCollaborationMode
                  ? 'bg-amber-500 text-stone-950 animate-pulse'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {isCollaborationMode ? '활성화 (ON)' : '비활성 (OFF)'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 pt-0.5 leading-tight">
              {isCollaborationMode
                ? 'AI가 작성한 텍스트 항목이 강조 하이라이트됩니다. 각 항목의 [AI 제안 수락/수정/대안] 버튼으로 간편하게 검토하세요.'
                : '스위치를 켜면 서식 내 AI 초안 문장들을 항목별로 수락·수정·대안 교체할 수 있는 검토 툴이 표시됩니다.'}
            </p>
          </div>
        </div>

        {isCollaborationMode && (
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={onAcceptAll}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              title="모든 AI 초안을 일괄 승인하고 검토 완료 상태로 적용합니다."
            >
              <CheckCheck className="w-4 h-4" />
              <span>전체 AI 제안 일괄 수락</span>
            </button>

            <button
              type="button"
              onClick={onOpenFullReviewModal}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>항목별 전수 검토창 열기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
