import React, { useState } from 'react';
import { 
  Sparkles, Check, CheckCheck, ArrowRight, HeartPulse, 
  Smile, Frown, ShieldAlert, Target, FileText, Bot, 
  Layers, CheckCircle2, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import { RealtimeConsultationSummary, extractRealtimeConsultationSummary } from '../utils/aiConsultationMapper';
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

interface AIRealtimeSummaryCardProps {
  transcript: string;
  clientName?: string;
  currentDocumentType: DocumentType;
  onApplyMappedDraftToForm: (docType: DocumentType, mappedData: Record<string, any>) => void;
  onSelectDocumentType?: (type: DocumentType) => void;
}

export const AIRealtimeSummaryCard: React.FC<AIRealtimeSummaryCardProps> = ({
  transcript,
  clientName = '상담 어르신',
  currentDocumentType,
  onApplyMappedDraftToForm,
  onSelectDocumentType,
}) => {
  const [targetDocType, setTargetDocType] = useState<DocumentType>(currentDocumentType || 'intake');
  const [summaryData, setSummaryData] = useState<RealtimeConsultationSummary>(() =>
    extractRealtimeConsultationSummary(transcript, clientName, targetDocType)
  );
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [showMappingDetail, setShowMappingDetail] = useState<boolean>(false);

  // Re-extract whenever transcript or targetDocType changes
  React.useEffect(() => {
    if (transcript) {
      const summary = extractRealtimeConsultationSummary(transcript, clientName, targetDocType);
      setSummaryData(summary);
    }
  }, [transcript, clientName, targetDocType]);

  const handleDocTypeChange = (type: DocumentType) => {
    setTargetDocType(type);
    if (onSelectDocumentType) {
      onSelectDocumentType(type);
    }
  };

  const handleApproveAndApply = () => {
    const mappedPayload = summaryData.mappedFieldsByDocType[targetDocType] || summaryData.mappedFieldsByDocType.intake;
    setIsApproved(true);
    onApplyMappedDraftToForm(targetDocType, mappedPayload);
  };

  const docOptions: Array<{ type: DocumentType; label: string; desc: string }> = [
    { type: 'intake', label: '초기상담면접지', desc: '기본인적·초기욕구·특이사항' },
    { type: 'assessment', label: '종합사정기록지', desc: '신체ADL·정서·주거·위기도' },
    { type: 'service_plan', label: '서비스제공계획서', desc: '장단기목표·16대서비스계획' },
    { type: 'monitoring', label: '상담·모니터링지', desc: '정기상담·반응평가·소견' },
  ];

  return (
    <div className="bg-gradient-to-br from-[#2D221C] via-[#241A16] to-[#1C1512] rounded-2xl border-2 border-amber-500/70 p-5 sm:p-6 text-white shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
      {/* Decorative Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-700/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                ⚡ 실시간 상담 요약 & 초안 자동 매핑 (Live Auto-Mapper)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black">
                INSTANT
              </span>
            </div>
            <p className="text-xs text-stone-300 pt-0.5">
              녹음이 종료되는 즉시 상담 핵심 키워드, 감정 상태, 목표를 요약하여 표준 서식에 자동 매핑합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const summary = extractRealtimeConsultationSummary(transcript, clientName, targetDocType);
            setSummaryData(summary);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-600 text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className="w-3 h-3" />
          <span>요약 새로고침</span>
        </button>
      </div>

      {/* 4 Core Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
        {/* 1. Key Keywords */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-amber-500/30 space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>1. 상담 핵심 키워드</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {summaryData.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-200 border border-amber-400/40 font-semibold"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Client Emotional & Psychological State */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>2. 내담자 감정·심리 상태</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40">
              {summaryData.clientEmotionState.primaryEmotion}
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
            {summaryData.clientEmotionState.description}
          </p>
        </div>

        {/* 3. Consultation Goals */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-teal-500/30 space-y-2">
          <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-teal-400" />
            <span>3. 도출된 상담 목표</span>
          </span>
          <ul className="space-y-1 text-xs text-stone-300">
            {summaryData.consultationGoals.shortTermGoals.slice(0, 2).map((goal, gIdx) => (
              <li key={gIdx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-teal-400 font-bold shrink-0">•</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Client Special Remarks & Urgent Risks */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-orange-500/30 space-y-2">
          <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
            <span>4. 내담자 특이사항 & 긴급 위험요인</span>
          </span>
          <div className="space-y-1 text-xs text-stone-300">
            <p className="line-clamp-2 leading-relaxed">
              <strong className="text-stone-200">위험요인:</strong> {summaryData.clientSpecialRemarks.urgentRisks.join(' / ')}
            </p>
            <p className="line-clamp-1 text-stone-400">
              <strong className="text-stone-300">건강·주거:</strong> {summaryData.clientSpecialRemarks.healthCondition}
            </p>
          </div>
        </div>
      </div>

      {/* Target Document Type Selector & Mapping Matrix */}
      <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-700/80 space-y-3 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-stone-200">
              연동 대상 서식 선택:
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            * 선택한 서식 양식의 필드에 추출 내용이 최적화되어 자동 채워집니다.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {docOptions.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleDocTypeChange(opt.type)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                targetDocType === opt.type
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-xs ring-1 ring-amber-400/50'
                  : 'bg-stone-800/60 border-stone-700/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              <h5 className="text-xs font-bold">{opt.label}</h5>
              <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>

        {/* Mapped Fields Preview Summary */}
        <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-2">
          <div className="flex items-center gap-1 text-[11px] text-amber-300">
            <Bot className="w-3.5 h-3.5" />
            <span>
              [{DOCUMENT_TYPE_LABELS[targetDocType]?.short || '선택 서식'}] 상담목표, 내담자 특이사항, ADL 건강상태, 복지사 소견 6개 핵심 필드 자동 매핑 완료
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMappingDetail((prev) => !prev)}
            className="text-[11px] text-stone-400 hover:text-white underline cursor-pointer"
          >
            {showMappingDetail ? '매핑 세부사항 닫기' : '매핑 세부내역 보기'}
          </button>
        </div>

        {showMappingDetail && (
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 text-xs space-y-1.5 animate-fade-in font-mono text-stone-300">
            <div className="text-[11px] text-amber-400 font-bold">📋 필드 자동 매핑 매트릭스:</div>
            <div>• <strong className="text-stone-200">상담목표</strong> ➔ 서식 [해결목표(장·단기) / shortTermGoals]</div>
            <div>• <strong className="text-stone-200">내담자 특이사항</strong> ➔ 서식 [위기도 판정 근거 / riskRationale]</div>
            <div>• <strong className="text-stone-200">신체건강/ADL</strong> ➔ 서식 [신체기능 상태 / physicalHealthStatus]</div>
            <div>• <strong className="text-stone-200">감정·정서상태</strong> ➔ 서식 [정서·인지 기능 / emotionalCognitiveStatus]</div>
            <div>• <strong className="text-stone-200">주거환경 위험</strong> ➔ 서식 [주거환경 안전 / housingEnvironment]</div>
            <div>• <strong className="text-stone-200">복지사 소견</strong> ➔ 서식 [사회복지사 종합소견 / socialWorkerOpinion]</div>
          </div>
        )}
      </div>

      {/* Main Approval Action Button */}
      <div className="pt-2 relative z-10">
        <button
          type="button"
          onClick={handleApproveAndApply}
          className="w-full py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer ring-2 ring-emerald-400/60 active:scale-[0.99]"
        >
          <CheckCheck className="w-5 h-5 text-emerald-100" />
          <span>
            ⚡ 자동 매핑된 초안 승인 및 서식 즉시 반영하기 ({DOCUMENT_TYPE_LABELS[targetDocType]?.short || '서식'} 바로가기)
          </span>
          <ArrowRight className="w-4 h-4 text-emerald-100" />
        </button>
      </div>
    </div>
  );
};
