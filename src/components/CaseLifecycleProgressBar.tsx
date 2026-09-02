import React from 'react';
import { 
  CheckCircle2, Clock, FileEdit, FileCheck2, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, Award
} from 'lucide-react';
import { CaseDocument } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

interface CaseLifecycleProgressBarProps {
  document: CaseDocument;
  onStatusChange?: (newStatus: '임시저장' | '작성완료' | '결재완료') => void;
  onOpenCollaboration?: () => void;
}

export const CaseLifecycleProgressBar: React.FC<CaseLifecycleProgressBarProps> = ({
  document,
  onStatusChange,
  onOpenCollaboration,
}) => {
  // 5 Stages of the Case Management Lifecycle
  const stages = [
    {
      id: 'step-1-record',
      label: '1. 상담 기록 & 녹취',
      desc: document.sourceTranscript ? '녹음/메모 입력 완료' : '상담 기초 입력',
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'step-2-ai-extract',
      label: '2. AI 자동 사정·추출',
      desc: document.executiveSummary?.length ? '주요 욕구·ADL 도출됨' : 'AI 분석 초안 생성',
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'step-3-co-edit',
      label: '3. 사회복지사 검토·수정',
      desc: document.status === '임시저장' ? '작성 및 항목 보완 중' : '검토 완료',
      isCompleted: document.status === '작성완료' || document.status === '결재완료',
      isActive: document.status === '임시저장',
    },
    {
      id: 'step-4-written',
      label: '4. 서식 작성 완료',
      desc: document.status === '작성완료' ? '결재 상신 대기' : document.status === '결재완료' ? '상신 완료' : '작성 완료 전',
      isCompleted: document.status === '작성완료' || document.status === '결재완료',
      isActive: document.status === '작성완료',
    },
    {
      id: 'step-5-approval',
      label: '5. 최종 결재 & 승인',
      desc: document.status === '결재완료' ? '센터장 최종 결재 승인' : '결재 승인 대기',
      isCompleted: document.status === '결재완료',
      isActive: document.status === '결재완료',
    },
  ];

  const currentStepNumber = document.status === '결재완료' ? 5 : document.status === '작성완료' ? 4 : 3;
  const progressPercent = Math.round((currentStepNumber / 5) * 100);

  return (
    <div className="bg-gradient-to-r from-stone-900 via-[#2A211C] to-[#1E1714] text-white rounded-2xl border border-stone-700/80 p-4 shadow-sm space-y-3.5">
      {/* Top Status & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-200">
                사례관리 문서 진행 단계:
              </span>
              <span className="text-xs font-extrabold text-amber-400">
                [단계 {currentStepNumber}/5] {stages[currentStepNumber - 1].label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                document.status === '결재완료'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : document.status === '작성완료'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              }`}>
                {document.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action button inside progress bar */}
        <div className="flex items-center gap-2">
          {onOpenCollaboration && (
            <button
              type="button"
              onClick={onOpenCollaboration}
              className="px-3 py-1 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AI-인간 협업 수정 모드</span>
            </button>
          )}

          {onStatusChange && (
            <div className="flex items-center rounded-lg border border-stone-700 bg-stone-900/80 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onStatusChange('임시저장')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  document.status === '임시저장' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                임시저장
              </button>
              <button
                type="button"
                onClick={() => onStatusChange('작성완료')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  document.status === '작성완료' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                작성완료
              </button>
              <button
                type="button"
                onClick={() => onStatusChange('결재완료')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  document.status === '결재완료' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                결재완료
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {stages.map((stage, idx) => {
          const isPassed = idx + 1 < currentStepNumber;
          const isCurrent = idx + 1 === currentStepNumber;

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-950/50 border-amber-500/80 shadow-xs ring-1 ring-amber-500/50'
                  : isPassed
                  ? 'bg-stone-800/60 border-emerald-500/40 text-stone-300'
                  : 'bg-stone-900/40 border-stone-800 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isPassed
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-stone-900 font-extrabold animate-pulse'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {isPassed ? '✓' : idx + 1}
                </span>

                {isCurrent && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    현재 단계
                  </span>
                )}
                {isPassed && (
                  <span className="text-[10px] font-medium text-emerald-400">
                    완료
                  </span>
                )}
              </div>

              <div>
                <h4 className={`text-xs font-bold ${
                  isCurrent ? 'text-amber-200' : isPassed ? 'text-stone-200' : 'text-stone-400'
                }`}>
                  {stage.label}
                </h4>
                <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
