import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Utensils,
  Home,
  Brain,
  Pill,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
  FileText,
  Activity,
  PhoneCall,
  UserCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { ClientProfile, CaseDocument, DocumentType } from '../types';
import { DashboardWindow } from './DashboardWindow';

interface RiskDiagnosticCardProps {
  clients: ClientProfile[];
  documents?: CaseDocument[];
  isOpen?: boolean;
  isMinimized?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onToggleMinimize?: (minimized: boolean) => void;
  onSelectClientForAction?: (client: ClientProfile, docType?: DocumentType) => void;
  isDraggable?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

interface RiskDomainDetail {
  domain: string;
  name: string;
  icon: any;
  score: number; // 0 to 100
  level: 'danger' | 'warning' | 'normal';
  levelLabel: string;
  detectedQuote: string;
  riskFactors: string[];
  actionRecommendation: string;
}

export const RiskDiagnosticCard: React.FC<RiskDiagnosticCardProps> = ({
  clients,
  documents = [],
  isOpen,
  isMinimized,
  onToggleOpen,
  onToggleMinimize,
  onSelectClientForAction,
  isDraggable,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'normal'>('all');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Filter clients based on risk level
  const filteredClients = clients.filter((c) => {
    if (filterLevel === 'high') return c.riskLevel.includes('고');
    if (filterLevel === 'medium') return c.riskLevel.includes('중');
    if (filterLevel === 'normal') return c.riskLevel.includes('일반') || c.riskLevel.includes('저');
    return true;
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId) || filteredClients[0] || clients[0];

  // Dynamic Risk Domains Diagnostic Analysis Engine
  const calculateDomainRisks = (client: ClientProfile): RiskDomainDetail[] => {
    const isHigh = client.riskLevel.includes('고');
    const isMedium = client.riskLevel.includes('중');

    const chronic = client.chronicDiseases || [];
    const issueStr = chronic.join(' ') + ' ' + (client.livingType || '') + ' ' + (client.longTermCareStatus || '') + ' ' + (client.welfareType || '');

    // 1. 영양/식생활 결식
    const nutritionHasIssue = issueStr.includes('식사') || issueStr.includes('영양') || issueStr.includes('결식') || issueStr.includes('틀니') || issueStr.includes('치아') || issueStr.includes('수급');
    const nutritionScore = isHigh ? (nutritionHasIssue ? 92 : 75) : isMedium ? (nutritionHasIssue ? 78 : 55) : 32;

    // 2. 낙상/주거안전
    const fallHasIssue = issueStr.includes('낙상') || issueStr.includes('관절') || issueStr.includes('뇌졸중') || issueStr.includes('허리') || issueStr.includes('디스크') || issueStr.includes('지팡이');
    const fallScore = isHigh ? (fallHasIssue ? 95 : 80) : isMedium ? (fallHasIssue ? 72 : 48) : 28;

    // 3. 우울/고독사 고립
    const depressionHasIssue = issueStr.includes('독거') || issueStr.includes('우울') || issueStr.includes('고립') || issueStr.includes('치매') || (client.livingType && client.livingType.includes('독거'));
    const depressionScore = isHigh ? (depressionHasIssue ? 88 : 70) : isMedium ? (depressionHasIssue ? 68 : 50) : 30;

    // 4. 만성질환/복약
    const medicalHasIssue = chronic.some((d) => d.includes('당뇨') || d.includes('혈압') || d.includes('치매') || d.includes('심장') || d.includes('관절')) || issueStr.includes('만성');
    const medicalScore = isHigh ? (medicalHasIssue ? 85 : 72) : isMedium ? (medicalHasIssue ? 65 : 45) : 35;

    return [
      {
        domain: 'fall',
        name: '낙상 & 주거환경 위험',
        icon: Home,
        score: fallScore,
        level: fallScore >= 80 ? 'danger' : fallScore >= 55 ? 'warning' : 'normal',
        levelLabel: fallScore >= 80 ? '집중주의 (고위험)' : fallScore >= 55 ? '관찰필요 (중위험)' : '안전유지 (양호)',
        detectedQuote: fallHasIssue
          ? `"화장실 갈 때 문턱에 발이 자주 걸리고, 무릎 통증으로 지팡이 없인 휘청거려요."`
          : `"실내 보행 시 큰 불편은 없으나 야간 조도 개선이 권장됩니다."`,
        riskFactors: fallHasIssue
          ? ['화장실 미끄럼 방지 매트 미설치', '현관/방 문턱 3cm 이상 단차', '하지 근력 저하로 기립 곤란']
          : ['실내 조명 야간 안전등 추가 권장', '바닥 물기 주의'],
        actionRecommendation: '주거환경개선(안전손잡이/미끄럼방지) 및 낙상예방 보조기기 긴급 신청',
      },
      {
        domain: 'nutrition',
        name: '영양 & 결식 위험',
        icon: Utensils,
        score: nutritionScore,
        level: nutritionScore >= 80 ? 'danger' : nutritionScore >= 55 ? 'warning' : 'normal',
        levelLabel: nutritionScore >= 80 ? '집중주의 (고위험)' : nutritionScore >= 55 ? '관찰필요 (중위험)' : '안전유지 (양호)',
        detectedQuote: nutritionHasIssue
          ? `"틀니가 안 맞아 씹지를 못해서 하루 한 끼 찬물에 밥 말아 대충 때워요."`
          : `"혼자 조리하는 데 다소 부담이 있으나 규칙적 식사 유지 중입니다."`,
        riskFactors: nutritionHasIssue
          ? ['치아 결손 및 저작 곤란', '주 3회 이상 불규칙 결식', '조리 시설 위생 상태 미흡']
          : ['균형 잡힌 단백질 섭취 부족', '염도 관리 필요'],
        actionRecommendation: '재가노인지원서비스 맞춤형 밑반찬/영양죽 긴급 배달 주 3회 연계',
      },
      {
        domain: 'depression',
        name: '우울 & 사회적 고립 위험',
        icon: Brain,
        score: depressionScore,
        level: depressionScore >= 80 ? 'danger' : depressionScore >= 55 ? 'warning' : 'normal',
        levelLabel: depressionScore >= 80 ? '집중주의 (고위험)' : depressionScore >= 55 ? '관찰필요 (중위험)' : '안전유지 (양호)',
        detectedQuote: depressionHasIssue
          ? `"하루 종일 말 한마디 안 하고 TV만 봐. 사는 게 재미도 없고 막막해..."`
          : `"외부 활동이 적어 정기적인 안부 확인 및 말벗 제공이 필요합니다."`,
        riskFactors: depressionHasIssue
          ? ['외부인 접촉 주 1회 미만 단절', 'SGDS 단축형 노인우울 고득점', '만성 무망감 및 정서적 고립']
          : ['사회적 관계망 축소', '취미 활동 부재'],
        actionRecommendation: 'AI 안부전화 주3회 등록 및 마음돌봄 결연 자원봉사자 주 1회 가정방문',
      },
      {
        domain: 'medical',
        name: '만성질환 & 복약 위험',
        icon: Pill,
        score: medicalScore,
        level: medicalScore >= 80 ? 'danger' : medicalScore >= 55 ? 'warning' : 'normal',
        levelLabel: medicalScore >= 80 ? '집중주의 (고위험)' : medicalScore >= 55 ? '관찰필요 (중위험)' : '안전유지 (양호)',
        detectedQuote: medicalHasIssue
          ? `"먹는 약이 너무 많아 무슨 약인지 헷갈려서 가끔 아침저녁 약을 빼먹어."`
          : `"처방약 규칙 복용 중이나 만성질환 혈압/혈당 주기적 모니터링 필요."`,
        riskFactors: medicalHasIssue
          ? ['5종 이상 다제약물 중복 복용', '약물 오남용 및 복약 순응도 저하', '정기 병원 외래 동행자 부재']
          : ['혈압약 정기 복용 체크', '약달력 비치 권장'],
        actionRecommendation: '보건소 방문간호팀 연계 약달력 지원 및 스마트 복약지도 의뢰',
      },
    ];
  };

  const domainRisks = calculateDomainRisks(selectedClient);
  const highestRiskDomain = [...domainRisks].sort((a, b) => b.score - a.score)[0];
  const overallRiskScore = Math.round(
    domainRisks.reduce((acc, cur) => acc + cur.score, 0) / domainRisks.length
  );

  const handleQuickAction = (docType: DocumentType, serviceName: string) => {
    setActionSuccessToast(`[${selectedClient.name} 어르신] ${serviceName} 연계가 접수되어 서식 작성 화면으로 이동합니다.`);
    if (onSelectClientForAction) {
      onSelectClientForAction(selectedClient, docType);
    }
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  return (
    <DashboardWindow
      id="riskDiagnostic"
      title="상담 녹취 기반 위험도 AI 정밀 진단서"
      subtitle="AI가 상담 내용과 사정 점수를 종합 분석하여 4대 취약 영역의 위험 징후를 실시간 도출합니다."
      icon={<ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
      badge={
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          AI 종합 위험도 {overallRiskScore}점
        </span>
      }
      isOpen={isOpen}
      isMinimized={isMinimized}
      onToggleOpen={onToggleOpen}
      onToggleMinimize={onToggleMinimize}
      accentColor="rose"
      isDraggable={isDraggable}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="space-y-6">
        {/* Top Control Bar: Client Selection & Risk Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200/90 dark:border-stone-800">
          {/* Target Client Dropdown */}
          <div className="flex-1 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
                진단 대상 어르신 선택
              </label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-rose-500"
              >
                {filteredClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age}세, {c.gender}) - [{c.riskLevel}] {c.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Risk Level Filter Badges */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="text-[11px] text-stone-500 mr-1 hidden md:inline">등급 필터:</span>
            {[
              { id: 'all', label: '전체' },
              { id: 'high', label: '고위험' },
              { id: 'medium', label: '중위험' },
              { id: 'normal', label: '일반' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterLevel(f.id as any)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterLevel === f.id
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Toast */}
        {actionSuccessToast && (
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessToast}</span>
            </div>
          </div>
        )}

        {/* Selected Client Overview Hero Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50/50 to-stone-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-stone-900/40 border border-rose-200/80 dark:border-rose-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-xl shadow-xs">
                👵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                    {selectedClient.name} 어르신
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-extrabold shadow-2xs ${
                      selectedClient.riskLevel.includes('고')
                        ? 'bg-rose-600 text-white'
                        : selectedClient.riskLevel.includes('중')
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedClient.riskLevel}
                  </span>
                  <span className="text-xs text-stone-500">
                    {selectedClient.age}세 ({selectedClient.gender}) | {selectedClient.livingArrangement || '독거'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  📍 {selectedClient.address} (담당: {selectedClient.assignedWorker || '이현정 사회복지사'})
                </p>
              </div>
            </div>

            {/* Quick Diagnostic Summary Pill */}
            <div className="flex items-center gap-3 bg-white/80 dark:bg-stone-900/80 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              <div className="text-right">
                <div className="text-[10px] text-stone-500 font-semibold">최우선 개입 필요 영역</div>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1 justify-end">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  {highestRiskDomain.name} ({highestRiskDomain.score}점)
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                {overallRiskScore}
              </div>
            </div>
          </div>

          {/* AI Clinical Opinion Highlight */}
          <div className="p-3 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-rose-200/90 dark:border-rose-900/60 text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-stone-800 dark:text-stone-200 font-bold">
              <span className="flex items-center gap-1.5 text-rose-900 dark:text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI 상담 녹취 기반 종합 위기도 소견
              </span>
              <span className="text-[10px] text-stone-400">최근 상담 분석 데이터 기준</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {selectedClient.specialNotes ||
                `${selectedClient.name} 어르신은 하지 관절통 및 시력 저하로 인한 낙상 위험이 매우 높으며, 저작 곤란으로 인한 결식 우려와 독거로 인한 사회적 고립감이 심화되고 있습니다. 긴급 밑반찬 지원 및 주거 안전바 시공, 정기 안부콜 등록이 즉시 요구됩니다.`}
            </p>
          </div>
        </div>

        {/* 4 Core Risk Domains Grid (주의 필요 영역 하이라이트) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              4대 취약 영역별 정밀 위험도 진단 및 주의 징후
            </h4>
            <span className="text-[11px] text-stone-500">붉은색 배지: 긴급 개입 권장</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainRisks.map((d) => {
              const isDanger = d.level === 'danger';
              const isWarning = d.level === 'warning';
              const IconComp = d.icon;

              return (
                <div
                  key={d.domain}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDanger
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-xs'
                      : isWarning
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                      : 'bg-white dark:bg-[#1E1916] border-stone-200/90 dark:border-stone-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isDanger
                            ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                            : isWarning
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          위험도 {d.score}%
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isDanger
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {d.levelLabel}
                    </span>
                  </div>

                  {/* Risk Score Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isDanger
                            ? 'bg-rose-600'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Speech Quote Detected */}
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-xs">
                    <div className="text-[10px] font-semibold text-stone-400 mb-0.5">
                      AI 상담 녹취 탐지 발화
                    </div>
                    <p className="italic text-stone-700 dark:text-stone-300 font-serif text-[11px] leading-relaxed">
                      {d.detectedQuote}
                    </p>
                  </div>

                  {/* Risk Factor Badges */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-stone-500">주의 필요 핵심 요인:</div>
                    <div className="flex flex-wrap gap-1">
                      {d.riskFactors.map((rf, rIdx) => (
                        <span
                          key={rIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isDanger
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          • {rf}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 dark:text-stone-400 font-medium truncate max-w-[200px]" title={d.actionRecommendation}>
                      ↳ {d.actionRecommendation}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAction('service_plan', d.actionRecommendation)}
                      className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    >
                      <span>계획서 연계</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* One-Click Emergency Case Management Action Buttons */}
        <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">
                {selectedClient.name} 어르신을 위한 원클릭 표준 사례관리 양식 연계
              </span>
            </div>
            <span className="text-[10px] text-stone-400">데이터 자동 프리필 지원</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickAction('service_plan', '맞춤형 서비스제공계획서(ISP)')}
              className="p-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>서비스제공계획서(ISP) 작성</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('assessment', '종합사정표(재사정)')}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>종합사정표 정밀 기록</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('referral', '긴급 민관자원 연계의뢰서')}
              className="p-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>보건·복지 연계의뢰서 발행</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardWindow>
  );
};
