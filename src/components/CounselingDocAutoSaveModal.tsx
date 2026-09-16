import React from 'react';
import {
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  FileText,
  ShieldAlert,
  Clock,
  User,
  X,
  CalendarCheck,
  HelpCircle,
} from 'lucide-react';
import { CaseDocument } from '../types';

export interface CounselingDocAutoSaveModalProps {
  isOpen: boolean;
  document: CaseDocument | null;
  onClose: () => void;
  onConfirmEdit: (doc: CaseDocument) => void;
}

export const CounselingDocAutoSaveModal: React.FC<CounselingDocAutoSaveModalProps> = ({
  isOpen,
  document,
  onClose,
  onConfirmEdit,
}) => {
  if (!isOpen || !document) return null;

  const fields = document.formSpecificFields || {};
  const clientName = document.clientName || '상담 어르신';
  const counselingPurpose =
    fields.counselingPurpose ||
    `${clientName} 어르신 일상생활 자립 유지, 건강 상태 점검 및 맞춤형 재가노인지원서비스 연계를 위한 상담 모니터링`;
  const counselingContent =
    fields.counselingContent ||
    document.socialWorkerOpinion ||
    document.sourceTranscript?.slice(0, 300) ||
    '상담 내용이 연동되었습니다.';
  const nextPlan =
    fields.counselingNextPlan ||
    (document.recommendedServices && document.recommendedServices.length > 0
      ? document.recommendedServices.map((s) => `${s.serviceName}(${s.frequency || '정기'})`).join(' / ')
      : '주 1회 이상 유선/방문 안부확인 지속 및 맞춤형 서비스 연계');

  return (
    <div
      id="modal-counseling-auto-save-guidance"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-counseling-auto-save-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl max-w-2xl w-full border border-stone-300 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto transition-all">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600/60 border border-amber-300/40 flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-4.5 h-4.5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-counseling-auto-save-title" className="text-sm font-bold tracking-tight">
                  상담기록지 자동 연동 & 임시저장 안내
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 shadow-2xs">
                  임시저장 완료
                </span>
              </div>
              <p className="text-[11px] text-amber-100">
                AI 분석 완료 즉시 대상자의 '상담기록지(모니터링기록)' 서식에 자동 연동 및 임시저장되었습니다.
              </p>
            </div>
          </div>
          <button
            id="btn-close-guidance-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 leading-relaxed">
          {/* 1. Main Success Guidance Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-emerald-950 dark:text-emerald-100 text-xs">
                {clientName} 어르신의 '상담 및 모니터링 기록지' 서식에 상담 내용이 안전하게 임시저장되었습니다.
              </p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                상담 대화록에서 추출된 상담 목적, 핵심 면담 내용, 위기도 및 소견이 표준 법정 서식에 실시간으로 매핑되었습니다.
                지금 바로 작성기로 이동하여 확인·수정하시거나, AI 스튜디오에서 분석 결과를 계속 검토하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 2. Document Meta Info Tag Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-semibold">대상자: {clientName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="truncate">
                위기도: <strong className="text-amber-800 dark:text-amber-300">{document.riskLevel || '중위험'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">연동시각: {document.updatedAt?.split(' ')[1] || '방금'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">서식: 7호 모니터링기록</span>
            </div>
          </div>

          {/* 3. Mapped Form Content Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>서식에 자동 연동된 주요 항목 미리보기</span>
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                서식 작성기에서 자유롭게 수정 가능
              </span>
            </div>

            {/* Field 1: Counseling Purpose */}
            <div className="p-3 rounded-xl bg-stone-50/90 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-600" />
                  <span>1. 상담 목적 (counselingPurpose)</span>
                </span>
                <span className="text-[10px] text-stone-500 font-normal">법정 필수 서식 필드</span>
              </div>
              <p className="text-[11px] text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800 font-sans leading-relaxed">
                {counselingPurpose}
              </p>
            </div>

            {/* Field 2: Counseling Content */}
            <div className="p-3 rounded-xl bg-stone-50/90 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span>2. 상담 내용 (counselingContent)</span>
                </span>
                <span className="text-[10px] text-stone-500 font-normal">5개 핵심 영역 구조화 연동</span>
              </div>
              <div className="text-[11px] text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800 font-sans leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line">
                {counselingContent}
              </div>
            </div>

            {/* Field 3: Social Worker Opinion & Next Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 space-y-1">
                <div className="font-bold text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <span>3. 사회복지사 종합 소견</span>
                </div>
                <p className="text-[10px] text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed">
                  {document.socialWorkerOpinion || '어르신의 신체기능 및 복지욕구 사정을 기반으로 한 지속적인 모니터링이 요구됨.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/80 space-y-1">
                <div className="font-bold text-[11px] text-orange-900 dark:text-orange-200 flex items-center gap-1">
                  <span>4. 사후 조치 및 연계 계획</span>
                </div>
                <p className="text-[10px] text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed">
                  {nextPlan}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Tips for user */}
          <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-stone-500 shrink-0" />
            <span>
              서식 작성기에서 추가 작성 및 필드별 수정이 언제든지 가능하며, 상단의 <strong>[서식 작성]</strong> 탭에서도 보관된 서식을 다시 열 수 있습니다.
            </span>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-[#1A1513] border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            id="btn-guidance-stay-ai-studio"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            AI 스튜디오에서 계속 분석 검토
          </button>

          <button
            id="btn-guidance-open-editor"
            type="button"
            onClick={() => onConfirmEdit(document)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-400/40 transition-all active:scale-95"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-200" />
            <span>지금 서식 확인 및 수정하기</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-200 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
