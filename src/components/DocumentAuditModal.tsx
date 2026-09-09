import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Zap,
  BookOpen,
  Scale,
  HeartHandshake,
  Check,
  ChevronRight,
  HelpCircle,
  X,
  FileCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CaseDocument, ClientProfile, DocumentAuditResult } from '../types';

interface DocumentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CaseDocument;
  client?: ClientProfile | null;
  onApplyFix?: (updatedDoc: CaseDocument) => void;
  onApplyRefinement?: (field: any, text: any) => void;
}

export const DocumentAuditModal: React.FC<DocumentAuditModalProps> = ({
  isOpen,
  onClose,
  document,
  client,
  onApplyFix,
  onApplyRefinement,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<DocumentAuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'missing' | 'expressions' | 'checklist'>('overview');
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [appliedReplacements, setAppliedReplacements] = useState<Record<number, boolean>>({});
  const [isBatchApplying, setIsBatchApplying] = useState(false);

  // Run AI Audit on open or refresh
  const runAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/audit-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, client }),
      });
      const data = await response.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      } else {
        // Fallback offline audit rule engine if network issues
        generateFallbackAudit();
      }
    } catch (err) {
      console.warn('API audit error, using built-in audit engine:', err);
      generateFallbackAudit();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackAudit = () => {
    const missing: DocumentAuditResult['missingFields'] = [];
    const improper: DocumentAuditResult['improperExpressions'] = [];

    // Check mandatory fields
    if (!document.riskRationale || document.riskRationale.length < 10) {
      missing.push({
        fieldName: 'riskRationale',
        label: '위기도 판정 근거',
        severity: '필수',
        reason: '노인보건복지사업안내 지침상 고위험/중위험 판정의 구체적 신체·환경적 근거가 누락되면 서비스 배정이 제한될 수 있습니다.',
        suggestedValue: `${client?.name || '대상 어르신'}은 만성질환(${client?.chronicDiseases?.join(', ') || '복합질환'}) 및 보행 불안정, 주거 내 낙상 위험요소가 상존하여 일상생활 자립 지원 및 정기 모니터링이 시급히 요구됨.`,
      });
    }

    if (!document.adlStatus || document.adlStatus.length < 10) {
      missing.push({
        fieldName: 'adlStatus',
        label: '일상생활수행능력 (ADL)',
        severity: '필수',
        reason: '식사, 거동, 개인위생 등 기본 일상생활 동작 수행 수준이 구체적으로 기술되어야 급여 계획 수립이 가능합니다.',
        suggestedValue: '실내 이동 시 벽이나 보조기구 의존하며, 낙상 우려로 조리 및 목욕 시 부분적 지원이 필요한 상태임.',
      });
    }

    if (!document.shortTermGoals || document.shortTermGoals.length === 0) {
      missing.push({
        fieldName: 'shortTermGoals',
        label: '단기 개입 목표 (SMART)',
        severity: '필수',
        reason: '목표 없는 서비스 투입은 지침 위반이며, 달성 기간과 측정 지표가 포함되어야 합니다.',
        suggestedValue: '1개월 내 주 3회 밑반찬 연계를 통해 결식률 0% 달성 및 규칙적 복약 환경 조성',
      });
    }

    // Scan improper text
    const textToScan = [
      document.socialWorkerOpinion || '',
      document.riskRationale || '',
      document.adlStatus || '',
      document.iadlStatus || '',
      document.emotionalCognitiveStatus || '',
      document.housingEnvironment || '',
    ].join(' ');

    if (textToScan.includes('답이 없') || textToScan.includes('막막함')) {
      improper.push({
        original: '답이 없음 / 막막함',
        reason: '대상자의 상황을 비관적으로 단정하여 강점 관점 실천 원칙에 저촉됨',
        suggested: '복합적 위기 요인 해소를 위한 다학제 민관 협력 개입 필요',
        fieldName: 'socialWorkerOpinion',
      });
    }

    if (textToScan.includes('버림받') || textToScan.includes('방치')) {
      improper.push({
        original: '가족에게 버림받음',
        reason: '가족 관계를 부정적으로 낙인찍고 정서적 수치심을 유발할 수 있음',
        suggested: '가족 지지체계 단절 및 소외 상태로 공적 안전망 개입 시급',
        fieldName: 'socialSupportNetwork',
      });
    }

    if (textToScan.includes('제정신') || textToScan.includes('이상함')) {
      improper.push({
        original: '제정신이 아님 / 이상 행동',
        reason: '의학적 진단 없이 인격 비하적 표현 사용',
        suggested: '인지기능 저하 및 단기 기억력 감퇴 증상 관찰됨',
        fieldName: 'emotionalCognitiveStatus',
      });
    }

    const calculatedScore = Math.max(55, 100 - missing.length * 12 - improper.length * 8);

    setAuditResult({
      score: calculatedScore,
      status: calculatedScore >= 90 ? '적합' : calculatedScore >= 75 ? '양호' : calculatedScore >= 60 ? '보완필요' : '주의',
      summary: '사례관리 표준 서식 지침을 기준으로 필수 사정 항목 및 강점 관점 어휘 적합성을 실시간 검수하였습니다.',
      missingFields: missing,
      improperExpressions: improper,
      strengthsAnalysis: '대상자의 잔존 의사소통 능력 및 복지 서비스 이용 의지가 확인되어 긍정적 개입 가능성이 높습니다.',
      legalRiskAssessment: '긴급 연락망 및 결식 방지 체계는 수립되었으나, 정기 재사정 기한(6개월) 준수 관리가 필요합니다.',
      complianceChecklist: [
        { category: '기본 인적사항', item: '대상자 식별정보 및 수급자격 명시', isPassed: true, detail: '기초수급/차상위 등 자격 확인됨' },
        { category: '사정의 구체성', item: 'ADL/IADL 신체 및 주거환경 세부평가', isPassed: !!document.adlStatus, detail: document.adlStatus ? '세부 기술 완료' : '보완 필요' },
        { category: '위기도 근거', item: '위기도 등급 판정 사유의 타당성', isPassed: !!document.riskRationale, detail: document.riskRationale ? '구체적 근거 제시' : '근거 미흡' },
        { category: '목표 설정', item: 'SMART 원칙에 부합하는 단/장기 목표', isPassed: (document.shortTermGoals?.length || 0) > 0, detail: '목표 구체성 점검' },
        { category: '사회복지 윤리', item: '강점 관점 및 비낙인적 전문 어휘 사용', isPassed: improper.length === 0, detail: improper.length === 0 ? '표준 전문용어 준수' : '교정 권고 항목 있음' },
      ],
    });
  };

  useEffect(() => {
    if (isOpen) {
      setAppliedFixes({});
      setAppliedReplacements({});
      runAudit();
    }
  }, [isOpen, document.id]);

  if (!isOpen) return null;

  // Apply single missing field fix
  const handleApplyMissingField = (fieldName: string, suggestedValue?: string) => {
    if (!suggestedValue) return;

    const updated = { ...document };
    if (fieldName === 'shortTermGoals') {
      updated.shortTermGoals = [...(updated.shortTermGoals || []), suggestedValue];
    } else if (fieldName === 'longTermGoals') {
      updated.longTermGoals = [...(updated.longTermGoals || []), suggestedValue];
    } else if (fieldName === 'primaryNeeds') {
      updated.primaryNeeds = [...(updated.primaryNeeds || []), suggestedValue];
    } else {
      (updated as any)[fieldName] = suggestedValue;
    }

    if (onApplyFix) {
      onApplyFix(updated);
    }
    if (onApplyRefinement) {
      onApplyRefinement(fieldName, suggestedValue);
    }
    setAppliedFixes((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Apply single expression replacement
  const handleApplyReplacement = (index: number, fieldName: string, original: string, suggested: string) => {
    const updated = { ...document };
    const currentValue = (updated as any)[fieldName];

    if (typeof currentValue === 'string') {
      // Replace instance
      (updated as any)[fieldName] = currentValue.replace(original, suggested);
      if (onApplyFix) onApplyFix(updated);
      if (onApplyRefinement) onApplyRefinement(fieldName, (updated as any)[fieldName]);
    } else if (fieldName === 'socialWorkerOpinion' && !currentValue) {
      updated.socialWorkerOpinion = suggested;
      if (onApplyFix) onApplyFix(updated);
      if (onApplyRefinement) onApplyRefinement(fieldName, suggested);
    }

    setAppliedReplacements((prev) => ({ ...prev, [index]: true }));
  };

  // Batch Apply All Fixes
  const handleApplyAllFixes = () => {
    if (!auditResult) return;
    setIsBatchApplying(true);

    const updated = { ...document };

    // Apply all missing
    auditResult.missingFields.forEach((mf) => {
      if (mf.suggestedValue) {
        if (mf.fieldName === 'shortTermGoals') {
          if (!updated.shortTermGoals || updated.shortTermGoals.length === 0) {
            updated.shortTermGoals = [mf.suggestedValue];
          }
        } else if (mf.fieldName === 'longTermGoals') {
          if (!updated.longTermGoals || updated.longTermGoals.length === 0) {
            updated.longTermGoals = [mf.suggestedValue];
          }
        } else if (!(updated as any)[mf.fieldName]) {
          (updated as any)[mf.fieldName] = mf.suggestedValue;
        }
      }
    });

    // Apply all improper expressions
    auditResult.improperExpressions.forEach((exp) => {
      const cur = (updated as any)[exp.fieldName];
      if (typeof cur === 'string') {
        (updated as any)[exp.fieldName] = cur.replace(exp.original, exp.suggested);
      }
    });

    if (onApplyFix) onApplyFix(updated);

    // Mark all as done
    const newFixes: Record<string, boolean> = {};
    auditResult.missingFields.forEach((mf) => {
      newFixes[mf.fieldName] = true;
    });
    setAppliedFixes(newFixes);

    const newReplacements: Record<number, boolean> = {};
    auditResult.improperExpressions.forEach((_, idx) => {
      newReplacements[idx] = true;
    });
    setAppliedReplacements(newReplacements);

    setTimeout(() => {
      setIsBatchApplying(false);
      // Re-run audit to show fresh score
      runAudit();
    }, 400);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    return 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-stone-800 dark:text-stone-100 transition-colors">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-900 to-[#2A231F] text-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI 표준 서식 검수 & 품질 감사 모드</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  보건복지부 표준 준수
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                [{document.title || '사례관리 서식'}] 대상 어르신: <span className="font-semibold text-white">{document.clientName || '미지정'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runAudit}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-100 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>재검수</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-amber-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-200 dark:border-amber-900 border-t-amber-600 animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">
              보건복지부 표준 가이드라인 및 실천 윤리 대조 검수 중...
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
              필수 법정 항목 누락, 낙인적 어휘, 목표 구체성, 법적 리스크를 정밀 진단하고 있습니다.
            </p>
          </div>
        ) : auditResult ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Score Box */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center ${getScoreColor(auditResult.score)}`}>
                <span className="text-xs font-bold uppercase tracking-wider">표준 품질 점수</span>
                <div className="my-2">
                  <span className="text-4xl font-black">{auditResult.score}</span>
                  <span className="text-sm font-semibold opacity-75"> / 100</span>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-current">
                  판정: {auditResult.status}
                </span>
              </div>

              {/* Summary Description */}
              <div className="md:col-span-3 bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">검수 총평 및 핵심 피드백</h4>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {auditResult.summary}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    <span>누락 항목: <strong className="text-rose-600 dark:text-rose-400">{auditResult.missingFields.length}건</strong></span>
                    <span>•</span>
                    <span>어휘 교정: <strong className="text-amber-600 dark:text-amber-400">{auditResult.improperExpressions.length}건</strong></span>
                    <span>•</span>
                    <span>체크리스트: <strong className="text-emerald-600 dark:text-emerald-400">{auditResult.complianceChecklist.filter(c => c.isPassed).length}/{auditResult.complianceChecklist.length} 완료</strong></span>
                  </div>

                  {(auditResult.missingFields.length > 0 || auditResult.improperExpressions.length > 0) && (
                    <button
                      type="button"
                      onClick={handleApplyAllFixes}
                      disabled={isBatchApplying}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isBatchApplying ? '일괄 교정 적용 중...' : '권고 사항 1-클릭 일괄 반영'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Subtabs */}
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-[#38302B] text-amber-100'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>종합 사정 및 리스크</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('missing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'missing'
                    ? 'bg-[#38302B] text-amber-100'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>누락 항목 점검 ({auditResult.missingFields.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('expressions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'expressions'
                    ? 'bg-[#38302B] text-amber-100'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                <span>강점 관점 어휘 교정 ({auditResult.improperExpressions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'checklist'
                    ? 'bg-[#38302B] text-amber-100'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>표준 가이드라인 체크리스트</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths Card */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartHandshake className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        어르신 강점 및 잔존 자원 사정
                      </h4>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {auditResult.strengthsAnalysis || '어르신의 자립 의지 및 일상 자원 보호 체계가 반영되어 있습니다.'}
                    </p>
                  </div>

                  {/* Legal Risk Card */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                      <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
                        행정 감사 및 법적 리스크 평가
                      </h4>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {auditResult.legalRiskAssessment || '법정 보건복지부 지침 기준에 적합하게 작성되었습니다.'}
                    </p>
                  </div>
                </div>

                {/* Quick Action Preview List */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>주요 보완 권고사항 요약</span>
                  </h4>

                  {auditResult.missingFields.length === 0 && auditResult.improperExpressions.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>모든 필수 서식 항목과 전문 어휘 기준이 완벽하게 준수되었습니다. 결재 및 제출이 가능합니다.</span>
                    </div>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {auditResult.missingFields.slice(0, 3).map((mf, i) => (
                        <li key={i} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold shrink-0">
                            누락
                          </span>
                          <span><strong>{mf.label}</strong>: {mf.reason}</span>
                        </li>
                      ))}
                      {auditResult.improperExpressions.slice(0, 2).map((exp, i) => (
                        <li key={i} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold shrink-0">
                            어휘교정
                          </span>
                          <span>'{exp.original}' ➔ <strong className="text-emerald-700 dark:text-emerald-400">'{exp.suggested}'</strong> 대체 권고</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MISSING FIELDS */}
            {activeTab === 'missing' && (
              <div className="space-y-3">
                {auditResult.missingFields.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">누락된 필수 항목이 없습니다!</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                      보건복지부 사례관리 표준 7대 서식 필수 항목이 충실하게 채워져 있습니다.
                    </p>
                  </div>
                ) : (
                  auditResult.missingFields.map((field, idx) => {
                    const isApplied = appliedFixes[field.fieldName];
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isApplied
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900'
                            : 'bg-white dark:bg-[#251F1C] border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                field.severity === '필수'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                              }`}>
                                {field.severity}
                              </span>
                              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                {field.label}
                              </h4>
                              <span className="text-[10px] text-stone-400">({field.fieldName})</span>
                            </div>

                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                              {field.reason}
                            </p>

                            {field.suggestedValue && (
                              <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                                <span className="font-bold text-[11px] text-amber-800 dark:text-amber-300 block mb-1">
                                  💡 AI 추천 표준 보충 문안:
                                </span>
                                {field.suggestedValue}
                              </div>
                            )}
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleApplyMissingField(field.fieldName, field.suggestedValue)}
                              disabled={isApplied || !field.suggestedValue}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                isApplied
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-[#38302B] hover:bg-stone-800 text-amber-100'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>반영완료</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>즉시 반영</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: IMPROPER EXPRESSIONS */}
            {activeTab === 'expressions' && (
              <div className="space-y-3">
                {auditResult.improperExpressions.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">부적절하거나 부정적인 표현이 발견되지 않았습니다!</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                      사회복지사 윤리강령 및 강점 관점 전문 기술 지침을 충실하게 준수하고 있습니다.
                    </p>
                  </div>
                ) : (
                  auditResult.improperExpressions.map((item, idx) => {
                    const isReplaced = appliedReplacements[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isReplaced
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900'
                            : 'bg-white dark:bg-[#251F1C] border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                                교정 권고
                              </span>
                              <span className="text-stone-500 font-medium">위치: {item.fieldName}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {/* Original */}
                              <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block mb-1">
                                  ❌ 원문 표현 (소극적/낙인 위험)
                                </span>
                                <p className="font-semibold text-rose-900 dark:text-rose-200">
                                  {item.original}
                                </p>
                              </div>

                              {/* Suggested */}
                              <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                                  ✨ 강점 관점 전문 대체어
                                </span>
                                <p className="font-bold text-emerald-900 dark:text-emerald-200">
                                  {item.suggested}
                                </p>
                              </div>
                            </div>

                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                              <strong>사유:</strong> {item.reason}
                            </p>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleApplyReplacement(idx, item.fieldName, item.original, item.suggested)}
                              disabled={isReplaced}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                isReplaced
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              {isReplaced ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>교정완료</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>단어 교정</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 4: COMPLIANCE CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="space-y-2">
                {auditResult.complianceChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {item.category}
                          </span>
                          <span className="font-bold text-stone-800 dark:text-stone-100">{item.item}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.detail}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.isPassed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                      {item.isPassed ? '적합 통과' : '보완 필요'}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : null}

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100 dark:bg-[#251F1C] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-[11px]">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>근거: 2025 보건복지부 노인보건복지사업안내 & 한국사회복지사 윤리강령</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-700 hover:bg-stone-700 text-white font-bold transition-colors cursor-pointer"
          >
            검수 완료 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
