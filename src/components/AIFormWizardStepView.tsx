import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  HeartPulse,
  Home,
  BrainCircuit,
  CalendarCheck,
  Save,
  Printer,
  Edit3,
  Wand2,
  Plus,
  Trash2,
  AlertTriangle,
  Send,
  Volume2,
  Copy,
  Check,
  Split,
  Eye,
  ArrowRight,
  CheckSquare,
  ShieldCheck,
  Layers,
  FileAudio,
  FileCheck
} from 'lucide-react';
import { CaseDocument, ClientProfile, DocumentType, AIAnalysisResponse, RecommendedService, ConsultationInsight } from '../types';
import { DOCUMENT_TYPE_LABELS, mapAiResponseToDocument } from '../utils/documentTemplates';
import confetti from 'canvas-confetti';

interface AIFormWizardStepViewProps {
  documentType: DocumentType;
  analysisResult: AIAnalysisResponse;
  client?: ClientProfile;
  transcriptText: string;
  workerNotes: string;
  audioUrl?: string | null;
  audioFileName?: string | null;
  onUpdateAnalysisResult: (updated: AIAnalysisResponse) => void;
  onFinishAndSave: (finalDoc: CaseDocument) => void;
  onBackToStudio: () => void;
  onPushInsightToDashboard?: (insight: ConsultationInsight) => void;
}

export const AIFormWizardStepView: React.FC<AIFormWizardStepViewProps> = ({
  documentType,
  analysisResult,
  client,
  transcriptText,
  workerNotes,
  audioUrl,
  audioFileName,
  onUpdateAnalysisResult,
  onFinishAndSave,
  onBackToStudio,
  onPushInsightToDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState<boolean>(true);
  const [isRefiningField, setIsRefiningField] = useState<string | null>(null);
  const [refineToast, setRefineToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Local working state for the AI generated analysis
  const [formData, setFormData] = useState<AIAnalysisResponse>({
    ...analysisResult,
    primaryNeeds: analysisResult.primaryNeeds || [],
    recommendedServices: analysisResult.recommendedServices || [],
    shortTermGoals: analysisResult.shortTermGoals || [],
    longTermGoals: analysisResult.longTermGoals || [],
    executiveSummary: analysisResult.executiveSummary || [],
  });

  const clientName = client?.name || formData.clientName || '어르신';

  const updateField = <K extends keyof AIAnalysisResponse>(key: K, value: AIAnalysisResponse[K]) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateAnalysisResult(updated);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // AI Refine helper for fields
  const handleRefineField = (fieldName: keyof AIAnalysisResponse, currentText: string) => {
    if (!currentText.trim()) return;
    setIsRefiningField(String(fieldName));

    setTimeout(() => {
      // Professional Social Work formalization polish
      let refined = currentText.trim();
      if (!refined.endsWith('.') && !refined.endsWith('음') && !refined.endsWith('함')) {
        refined += ' 상태로 확인됨.';
      }
      refined = refined
        .replace(/어르신이 /g, '대상자는 ')
        .replace(/말씀하심/g, '진술함')
        .replace(/보임/g, '관찰됨')
        .replace(/같음/g, '사정됨')
        .replace(/해야 됨/g, '시급히 요구됨');

      updateField(fieldName, refined as any);
      setIsRefiningField(null);
      setRefineToast(`✨ 전문 사회복지사 표준 문체로 다듬어졌습니다.`);
      setTimeout(() => setRefineToast(null), 3000);
    }, 600);
  };

  // Recommendations Quick Adders
  const handleAddQuickNeed = (need: string) => {
    if (formData.primaryNeeds?.includes(need)) return;
    const updated = [...(formData.primaryNeeds || []), need];
    updateField('primaryNeeds', updated);
  };

  const handleRemoveNeed = (index: number) => {
    const updated = formData.primaryNeeds?.filter((_, i) => i !== index) || [];
    updateField('primaryNeeds', updated);
  };

  const handleAddService = () => {
    const newService: RecommendedService = {
      category: '일상생활지원',
      serviceName: '영양 밑반찬 배달 서비스',
      frequency: '주 2회',
      purpose: '결식 예방 및 영양 상태 개선',
      provider: '재가노인지원센터',
    };
    updateField('recommendedServices', [...(formData.recommendedServices || []), newService]);
  };

  const handleUpdateService = (index: number, key: keyof RecommendedService, value: string) => {
    const updated = [...(formData.recommendedServices || [])];
    updated[index] = { ...updated[index], [key]: value };
    updateField('recommendedServices', updated);
  };

  const handleRemoveService = (index: number) => {
    const updated = formData.recommendedServices?.filter((_, i) => i !== index) || [];
    updateField('recommendedServices', updated);
  };

  // Steps Configuration
  const steps = [
    { id: 1, title: '기본 정보 & 위기도', desc: '인적사항, 사정 위기도, 3줄 핵심 요약', icon: <User className="w-4 h-4" /> },
    { id: 2, title: '신체건강 & ADL/IADL', desc: '만성질환, 복약, 식사영양, 낙상위험', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 3, title: '정서·주거·경제환경', desc: '우울/고립감, 주거안전, 경제수급, 지지망', icon: <Home className="w-4 h-4" /> },
    { id: 4, title: '복지욕구 & 종합소견', desc: '핵심 욕구 도출, 사회복지사 전문 사정 총평', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 5, title: '맞춤 서비스 & 목표(ISP)', desc: '연계 서비스 제공계획, 단기/장기 목표', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 6, title: '최종 서식 승인 & 완성', desc: '10대 법정서식 완본 검토 및 공식 등록', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleCompleteAndSave = () => {
    const finalDoc = mapAiResponseToDocument(
      documentType,
      formData,
      client,
      transcriptText,
      workerNotes
    );

    // Push insight if available
    if (onPushInsightToDashboard) {
      const summary: [string, string, string] = [
        formData.executiveSummary?.[0] || `[신체] ${formData.physicalHealthStatus?.slice(0, 80)}`,
        formData.executiveSummary?.[1] || `[정서] ${formData.emotionalCognitiveStatus?.slice(0, 80)}`,
        formData.executiveSummary?.[2] || `[조치] ${formData.socialWorkerOpinion?.slice(0, 80)}`,
      ];
      onPushInsightToDashboard({
        id: `insight-wizard-${Date.now()}`,
        clientId: client?.id || 'client-1',
        clientName: clientName,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        riskLevel: formData.riskLevel?.includes('고') ? '고위험' : formData.riskLevel?.includes('중') ? '중위험' : '일반',
        threeLineSummary: summary,
        keyIssues: formData.primaryNeeds?.slice(0, 3) || ['식사지원', '낙상예방', '만성질환'],
        recommendedService: formData.recommendedServices?.[0]?.serviceName || '재가노인지원서비스',
        isUrgent: formData.riskLevel?.includes('고') || false,
      });
    }

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setIsSavedSuccess(true);
    setTimeout(() => {
      onFinishAndSave(finalDoc);
    }, 600);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#322721] via-[#2A201B] to-[#1E1713] rounded-2xl p-5 text-white border border-[#52443C] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {DOCUMENT_TYPE_LABELS[documentType]?.short || '사례관리 서식'}
              </span>
              <span className="text-xs text-stone-300">
                대상자: <strong>{clientName}</strong> ({client?.age || '78'}세 / {client?.livingType || '독거'})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-stone-100 mt-0.5">
              AI 초안 단계별 검토 & 맞춤 서식 완성 마법사
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSplitViewOpen(!isSplitViewOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSplitViewOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isSplitViewOpen ? '녹취록 대조창 숨기기' : '녹취록 원문 나란히 보기'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
          >
            녹취실로 돌아가기
          </button>
        </div>
      </div>

      {/* Step Navigation Progress Bar */}
      <div className="bg-white dark:bg-[#1E1916] p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-stone-50 dark:bg-[#251F1C] border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {isDone ? <Check className="w-2.5 h-2.5" /> : step.id}단계
                  </span>
                  <div className={isCurrent ? 'text-amber-600' : isDone ? 'text-emerald-600' : 'text-stone-400'}>
                    {step.icon}
                  </div>
                </div>
                <div className="text-xs font-bold line-clamp-1">{step.title}</div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 truncate mt-0.5">{step.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {refineToast && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{refineToast}</span>
        </div>
      )}

      {/* Main Interactive Stage Grid */}
      <div className={`grid grid-cols-1 ${isSplitViewOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
        {/* Left Side: Transcript & Audio Original Split Reference (5 Cols when open) */}
        {isSplitViewOpen && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-50 dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4 text-amber-600" />
                  <span>상담 녹취 및 원문 대조 창</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {transcriptText.length.toLocaleString()}자
                </span>
              </div>

              {/* Audio Player if available */}
              {audioUrl && (
                <div className="p-3 rounded-xl bg-white dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 truncate">
                    🎧 {audioFileName || '음성 녹음 재생'}
                  </div>
                  <audio src={audioUrl} controls className="w-full h-8 rounded" />
                </div>
              )}

              {/* Worker observation notes */}
              {workerNotes && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Edit3 className="w-3 h-3 text-amber-700" />
                    <span>현장 관찰 메모</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    {workerNotes}
                  </p>
                </div>
              )}

              {/* Transcript Text Viewer */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-stone-500">녹취 전문:</div>
                <div className="bg-white dark:bg-[#251F1C] p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                  {transcriptText || '입력된 녹취록 내용이 없습니다.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Step-by-Step Form Completion Editor (7 Cols or Full) */}
        <div className={`${isSplitViewOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5`}>
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Step 1: Basic Info & Risk Rating */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                      <span>대상자 인적사항 및 사정 위기도 판정</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      상담 내용에서 파악된 인적사항과 AI 종합 위기도 등급을 확인하고 필요 시 수정하세요.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                    Step 1 / 6
                  </span>
                </div>

                {/* Risk Badge Selector */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-3">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    종합 사정 위기도 판정 (재가노인지원 기준)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { level: '고위험군 (집중사례관리)', color: 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200' },
                      { level: '중위험군 (일반사례관리)', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
                      { level: '일반/저위험군 (예방지원)', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => updateField('riskLevel', item.level)}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          formData.riskLevel?.includes(item.level.slice(0, 3))
                            ? `${item.color} ring-2 ring-amber-500 shadow-xs`
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-600 dark:text-stone-400 hover:border-stone-400'
                        }`}
                      >
                        {item.level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Rationale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      위기도 판정 근거 및 핵심 사유
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRefineField('riskRationale', formData.riskRationale || '')}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI 문장 다듬기</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.riskRationale || ''}
                    onChange={(e) => updateField('riskRationale', e.target.value)}
                    placeholder="예: 어르신의 진술 및 상담 기록 분석 결과, 낙상 위험과 식사 결식 우려가 높아 집중사례관리 대상자로 판정함."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* 3-Line Executive Summary */}
                <div className="space-y-2.5 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>3줄 핵심 요약 브리핑 (신체·정서·조치계획)</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {['신체·건강 요약', '정서·욕구 요약', '조치·계획 요약'].map((label, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 w-24 shrink-0 text-center">
                          {label}
                        </span>
                        <input
                          type="text"
                          value={formData.executiveSummary?.[idx] || ''}
                          onChange={(e) => {
                            const updated = [...(formData.executiveSummary || [])];
                            updated[idx] = e.target.value;
                            updateField('executiveSummary', updated);
                          }}
                          className="flex-1 text-xs p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Physical Health & ADL/IADL */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                      <span>신체·건강 및 일상생활수행능력 (ADL / IADL)</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      질환 및 복약 관리, 식사 영양 실태, 보행 및 낙상 위험 요인을 검토하고 수정합니다.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                    Step 2 / 6
                  </span>
                </div>

                {/* Quick Keyword Injector */}
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 text-xs">
                  <span className="font-bold text-stone-600 dark:text-stone-400 mr-1">추천 문구 빠른 삽입:</span>
                  {[
                    '무릎 관절염 및 기립성 어지럼증으로 낙상 위험 상존',
                    '치아 결손으로 인한 저작 곤란 및 불규칙 식습관',
                    '고혈압/당뇨 약물 복약 지도 및 정기 혈압 측정 필요',
                    '보행 지팡이 의존 및 외출 시 부축 필요',
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const current = formData.physicalHealthStatus || '';
                        updateField('physicalHealthStatus', current ? `${current} ${phrase}.` : `${phrase}.`);
                      }}
                      className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-amber-500 hover:bg-amber-50 text-stone-800 dark:text-stone-200 cursor-pointer"
                    >
                      + {phrase.slice(0, 18)}...
                    </button>
                  ))}
                </div>

                {/* Physical Health Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      신체 건강 상태 및 만성질환·복약 실태
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRefineField('physicalHealthStatus', formData.physicalHealthStatus || '')}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI 문장 다듬기</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.physicalHealthStatus || ''}
                    onChange={(e) => updateField('physicalHealthStatus', e.target.value)}
                    placeholder="신체 질환, 통증 부위, 병원 진료 및 약 복용 실태를 입력하세요."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* ADL / IADL Split inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      기본 일상생활수행능력 (ADL: 식사, 세면, 이동 등)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.adlStatus || ''}
                      onChange={(e) => updateField('adlStatus', e.target.value)}
                      placeholder="기본적인 옷 입기, 세면, 식사 자립 여부"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      도구적 일상생활수행능력 (IADL: 취사, 장보기, 청소)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.iadlStatus || ''}
                      onChange={(e) => updateField('iadlStatus', e.target.value)}
                      placeholder="단독 장보기, 청소, 식사준비, 대중교통 이용 가능 여부"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emotional & Housing/Economic */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                      <span>심리·정서 및 주거·경제·사회적 관계망</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      고립감, 우울 척도, 주거 환경 위험(문턱/미끄럼), 소득 수급 및 가족 지지망을 확인합니다.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                    Step 3 / 6
                  </span>
                </div>

                {/* Emotional / Cognitive */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      심리·정서 및 인지 상태 (우울감, 고독감, 수면)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRefineField('emotionalCognitiveStatus', formData.emotionalCognitiveStatus || '')}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI 문장 다듬기</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.emotionalCognitiveStatus || ''}
                    onChange={(e) => updateField('emotionalCognitiveStatus', e.target.value)}
                    placeholder="독거로 인한 외로움, 우울 증상, 인지 지남력 상태를 입력하세요."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                  />
                </div>

                {/* Housing Environment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    주거 환경 및 안전 취약 요소 (화장실, 문턱, 난방, 위생)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.housingEnvironment || ''}
                    onChange={(e) => updateField('housingEnvironment', e.target.value)}
                    placeholder="실내 문턱, 화장실 미끄럼 방지 패드 부재, 조명 조도 등"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                  />
                </div>

                {/* Economic & Social Network Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      경제 상태 및 수급 유형
                    </label>
                    <input
                      type="text"
                      value={formData.economicStatus || ''}
                      onChange={(e) => updateField('economicStatus', e.target.value)}
                      placeholder="기초생활수급자, 차상위계층, 기초연금 등"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      사회적 지지체계 및 가족·이웃 관계망
                    </label>
                    <input
                      type="text"
                      value={formData.socialSupportNetwork || ''}
                      onChange={(e) => updateField('socialSupportNetwork', e.target.value)}
                      placeholder="가족 왕래 드묾, 이웃 통장님과 교류 등"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Primary Needs & Social Worker Opinion */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                      <span>핵심 복지 욕구 도출 및 사회복지사 종합 소견</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      도출된 복지 욕구 태그를 추가/삭제하고, 전문적인 종합 사정 소견을 작성하세요.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                    Step 4 / 6
                  </span>
                </div>

                {/* Primary Needs Tag Cloud */}
                <div className="space-y-2 p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      도출된 핵심 복지 욕구 목록 ({formData.primaryNeeds?.length || 0}건)
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.primaryNeeds?.map((need, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-medium shadow-2xs"
                      >
                        <span>{need}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNeed(idx)}
                          className="hover:text-rose-600 cursor-pointer text-stone-500"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Add Need Tags */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-stone-500 font-semibold">추천 욕구 추가:</span>
                    {[
                      '결식 예방 및 영양 밑반찬 지원',
                      '화장실 낙상예방 안전바 설치',
                      '주 2회 정기 안부전화 및 말벗',
                      '만성질환 병원 동행 서비스',
                      '동절기 난방용품 및 절기후원',
                    ].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddQuickNeed(tag)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Worker Opinion */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>사회복지사 종합 사정 소견 및 개입 방향</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRefineField('socialWorkerOpinion', formData.socialWorkerOpinion || '')}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI 전문 공문서 어조로 다듬기</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={formData.socialWorkerOpinion || ''}
                    onChange={(e) => updateField('socialWorkerOpinion', e.target.value)}
                    placeholder="어르신의 신체·정서·환경적 위험요인을 종합하여 향후 재가노인지원서비스 개입의 필요성과 방향을 기재하세요."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100 leading-relaxed focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Recommended Services & Goals (ISP) */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                      <span>맞춤형 서비스 제공 계획 (ISP) 및 단기/장기 목표</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      연계할 재가노인지원 세부 서비스 목록과 주기, 개입 목표를 설정합니다.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                    Step 5 / 6
                  </span>
                </div>

                {/* Services List Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      제공 및 연계 서비스 목록 ({formData.recommendedServices?.length || 0}개)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>서비스 항목 추가</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.recommendedServices?.map((svc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#251F1C] space-y-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <input
                            type="text"
                            value={svc.serviceName}
                            onChange={(e) => handleUpdateService(idx, 'serviceName', e.target.value)}
                            placeholder="서비스명 (예: 영양 밑반찬 지원)"
                            className="sm:col-span-5 text-xs font-bold p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                          />
                          <input
                            type="text"
                            value={svc.frequency}
                            onChange={(e) => handleUpdateService(idx, 'frequency', e.target.value)}
                            placeholder="주기 (예: 주 2회)"
                            className="sm:col-span-3 text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                          />
                          <input
                            type="text"
                            value={svc.category}
                            onChange={(e) => handleUpdateService(idx, 'category', e.target.value)}
                            placeholder="분류 (예: 일상지원)"
                            className="sm:col-span-3 text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="sm:col-span-1 p-2 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={svc.purpose}
                          onChange={(e) => handleUpdateService(idx, 'purpose', e.target.value)}
                          placeholder="서비스 목적 및 기대효과 (예: 결식 예방 및 영양 상태 개선)"
                          className="w-full text-[11px] p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-700 dark:text-stone-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Short-term / Long-term Goals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      단기 개입 목표 (1~3개월)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.shortTermGoals?.join('\n') || ''}
                      onChange={(e) => updateField('shortTermGoals', e.target.value.split('\n'))}
                      placeholder="1줄당 1개 목표 입력"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      장기 개입 목표 (6개월~1년)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.longTermGoals?.join('\n') || ''}
                      onChange={(e) => updateField('longTermGoals', e.target.value.split('\n'))}
                      placeholder="1줄당 1개 목표 입력"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Final Review & Approval & Save */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">6</span>
                      <span>최종 서식 승인 및 공식 문서 보관함 등록</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      모든 단계에서 검토/수정한 내용으로 10대 법정 서식이 완성되었습니다. 확인 후 저장하세요.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300">
                    완성 준비 완료
                  </span>
                </div>

                {/* Final Document Preview Card */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#251F1C] border-2 border-emerald-300 dark:border-emerald-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                        {clientName} 어르신 {DOCUMENT_TYPE_LABELS[documentType]?.short} 완본
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                      {formData.riskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-[#1E1916] rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold text-stone-500">1. 신체 및 건강 상태</span>
                      <p className="text-stone-800 dark:text-stone-200 line-clamp-3 leading-relaxed">
                        {formData.physicalHealthStatus || '기록 없음'}
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1E1916] rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold text-stone-500">2. 심리·정서 및 주거</span>
                      <p className="text-stone-800 dark:text-stone-200 line-clamp-3 leading-relaxed">
                        {formData.emotionalCognitiveStatus || '기록 없음'}
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1E1916] rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-stone-500">3. 사회복지사 종합 소견</span>
                      <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                        {formData.socialWorkerOpinion || '기록 없음'}
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1E1916] rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-stone-500">4. 제공 서비스 계획 ({formData.recommendedServices?.length || 0}종)</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.recommendedServices?.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                            {s.serviceName} ({s.frequency})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finish Action Banner */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={handleCompleteAndSave}
                    disabled={isSavedSuccess}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    {isSavedSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>서식 작성 완료 및 저장 중...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>서식 최종 완성 및 문서 보관함 / 편집기로 열기</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step Navigation Bottom Controls (Previous / Next Buttons) */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-700 dark:text-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 단계 ({currentStep > 1 ? steps[currentStep - 2].title : '처음'})</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 6))}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>다음 단계 ({steps[currentStep].title})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteAndSave}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>최종 완성 & 저장</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
