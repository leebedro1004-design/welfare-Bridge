import React, { useState } from 'react';
import {
  TrendingUp,
  HeartPulse,
  BrainCircuit,
  Smile,
  Frown,
  Activity,
  Sparkles,
  ShieldAlert,
  Calendar,
  Users,
  ChevronRight,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Clock,
  ArrowRight,
  ListFilter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import { ClientProfile, CaseDocument, ConsultationInsight } from '../types';

interface ConsultationInsightsCardProps {
  clients: ClientProfile[];
  documents: CaseDocument[];
  insights?: ConsultationInsight[];
  onSelectClient?: (clientId: string) => void;
  onOpenFormForClient?: (client: ClientProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ConsultationInsightsCard: React.FC<ConsultationInsightsCardProps> = ({
  clients,
  documents,
  insights = [],
  onSelectClient,
  onOpenFormForClient,
  isOpen = true,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<'all' | 'emotional' | 'physical'>('all');
  const [insightsFilter, setInsightsFilter] = useState<'all' | 'high_risk'>('all');

  if (!isOpen) return null;

  // Filter insights
  const filteredInsights = insights.filter((item) => {
    if (selectedClientId !== 'all' && item.clientId !== selectedClientId) return false;
    if (insightsFilter === 'high_risk' && item.riskLevel !== '고위험') return false;
    return true;
  });

  // Multi-session emotional and functional trajectory data
  const EMOTIONAL_TRAJECTORY_DATA = [
    {
      session: '1차 (초기면접)',
      date: '1월',
      psychologicalStability: 35, // 심리적 안정감 (0-100)
      depressionIndex: 78,        // 우울/불안도 (낮을수록 좋음)
      rapportScore: 45,           // 사회복지사 신뢰/라포도 (0-100)
      mealVitality: 30,           // 식사/활력도 (0-100)
    },
    {
      session: '2차 (긴급사례회의)',
      date: '2월',
      psychologicalStability: 48,
      depressionIndex: 65,
      rapportScore: 62,
      mealVitality: 50,
    },
    {
      session: '3차 (밑반찬연계)',
      date: '3월',
      psychologicalStability: 62,
      depressionIndex: 52,
      rapportScore: 75,
      mealVitality: 68,
    },
    {
      session: '4차 (안전손잡이설치)',
      date: '4월',
      psychologicalStability: 75,
      depressionIndex: 40,
      rapportScore: 84,
      mealVitality: 76,
    },
    {
      session: '5차 (정기모니터링)',
      date: '5월',
      psychologicalStability: 82,
      depressionIndex: 32,
      rapportScore: 89,
      mealVitality: 82,
    },
    {
      session: '6차 (최근상담)',
      date: '최근',
      psychologicalStability: 88,
      depressionIndex: 25,
      rapportScore: 94,
      mealVitality: 88,
    },
  ];

  // Frequency of Major Case Issues & Needs
  const ISSUE_DISTRIBUTION_DATA = [
    { issue: '식사/영양결식', count: 18, percentage: 85, color: '#10b981' },
    { issue: '낙상/주거안전', count: 15, percentage: 72, color: '#f59e0b' },
    { issue: '만성질환/복약', count: 14, percentage: 68, color: '#0d9488' },
    { issue: '정서고립/우울', count: 12, percentage: 58, color: '#8b5cf6' },
    { issue: '경제/수급불안', count: 9,  percentage: 43, color: '#78716c' },
    { issue: '장기요양진입', count: 7,  percentage: 34, color: '#f43f5e' },
  ];

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-all">
      {/* Titlebar & Controls */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 bg-gradient-to-r from-amber-50/70 via-stone-50/50 to-emerald-50/50 dark:from-amber-950/40 dark:via-[#231E1B] dark:to-emerald-950/40">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? '클릭하여 펼치기' : '클릭하여 최소화(접기)'}
        >
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                상담 기록 기반 인사이트 & 감정·기능 변화 추이
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/50 dark:border-emerald-800/50">
                안정도 88점 (호전)
              </span>
            </div>
            {!isMinimized ? (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                재가노인지원 상담 기록에서 도출된 주요 위기 이슈와 어르신의 심리적 안정감·우울도 변화를 시계열로 분석합니다.
              </p>
            ) : (
              <p className="text-[11px] text-teal-900 dark:text-teal-300 font-semibold mt-0.5">
                [최소화됨] 심리안정감 88점(↑53점), 우울지수 25점(↓53점 완화), 복지사 라포 94점
              </p>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#2C2420] px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
              >
                <option value="all">전체 관리 어르신 종합 분석</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age}세, {c.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMinimized ? '창 펼치기' : '창 접기'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="인사이트 창 닫기 (상단 바에서 다시 열 수 있습니다)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body when not minimized */}
      {!isMinimized && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 4 Summary Stat Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                <span>심리적 안정감</span>
                <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                <span>88점</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">↑ 53점 상승</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">초기 35점 대비 정서적 안정화</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                <span>우울·고립 불안도</span>
                <Frown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </div>
              <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                <span>25점</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">↓ 53점 완화</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">안부확인 및 말벗 연계 효과</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                <span>사회복지사 신뢰 라포</span>
                <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                <span>94점</span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">최상위 수준</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">서비스 거부 없이 능동적 참여</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                <span>식사 및 영양 규칙성</span>
                <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                <span>88%</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">결식률 0% 달성</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">밑반찬 주 3회 공급 안정</p>
            </div>
          </div>

          {/* Real-time Audio Transcript 3-Line Summary Feed Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>음성 상담 기록 실시간 3줄 요약 피드</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/60">
                      총 {filteredInsights.length}건
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    AIStudioTranscript에서 자동 전송된 긴 상담 기록의 3줄 핵심 분석(신체·정서·조치계획) 결과입니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setInsightsFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    insightsFilter === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => setInsightsFilter('high_risk')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    insightsFilter === 'high_risk'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  고위험 집중
                </button>
              </div>
            </div>

            {filteredInsights.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs border border-dashed border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50/50 dark:bg-[#251E1A]/50">
                수신된 상담 요약이 없습니다. 상단의 'AI 음성인식 & 스마트 서식 작성기'에서 긴 상담을 녹음하거나 분석 후 대시보드로 자동 전송할 수 있습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredInsights.map((item) => {
                  const client = clients.find((c) => c.id === item.clientId);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#251E1A] hover:border-amber-400 dark:hover:border-amber-600 shadow-2xs space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            {item.clientName} 어르신
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              item.riskLevel === '고위험'
                                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                : item.riskLevel === '중위험'
                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                      </div>

                      {/* 3-Line Summary Card */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 dark:bg-[#1E1916] text-[11px] leading-relaxed border border-stone-200/70 dark:border-stone-800">
                        {item.threeLineSummary.map((line, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-stone-800 dark:text-stone-200">
                            <span className="shrink-0 font-bold text-amber-700 dark:text-amber-400">
                              {idx === 0 ? '🩺' : idx === 1 ? '💭' : '🎯'}
                            </span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>

                      {/* Key issues & CTA */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.keyIssues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            >
                              #{issue}
                            </span>
                          ))}
                        </div>

                        {onOpenFormForClient && client && (
                          <button
                            type="button"
                            onClick={() => onOpenFormForClient(client)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 cursor-pointer"
                          >
                            <span>서식 작성</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Emotional Trajectory Area Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-stone-50/70 dark:bg-[#251E1A] p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  상담 회차별 어르신 감정 및 심리 지표 변화
                </h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    심리안정
                  </span>
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    우울지수
                  </span>
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    라포지수
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={EMOTIONAL_TRAJECTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDepression" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRapport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#57534e" opacity={0.3} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#292524',
                        color: '#fff',
                        borderRadius: '10px',
                        fontSize: '11px',
                        border: 'none',
                      }}
                      formatter={(val: any, name: any) => {
                        const labels: Record<string, string> = {
                          psychologicalStability: '심리적 안정감',
                          depressionIndex: '우울/불안 지수',
                          rapportScore: '복지사 라포 형성도',
                          mealVitality: '식사/일상 활력도',
                        };
                        return [`${val}점`, labels[name] || name];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="psychologicalStability"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStability)"
                    />
                    <Area
                      type="monotone"
                      dataKey="depressionIndex"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDepression)"
                    />
                    <Area
                      type="monotone"
                      dataKey="rapportScore"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRapport)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Key Issues Frequency Bar Chart (5 Cols) */}
            <div className="lg:col-span-5 bg-stone-50/70 dark:bg-[#251E1A] p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  상담 중 가장 많이 언급된 위기 이슈 & 욕구
                </h4>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">빈도 비율 (%)</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ISSUE_DISTRIBUTION_DATA}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#57534e" opacity={0.3} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} />
                    <YAxis dataKey="issue" type="category" tick={{ fontSize: 11, fill: '#d6d3d1' }} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#292524',
                        color: '#fff',
                        borderRadius: '10px',
                        fontSize: '11px',
                        border: 'none',
                      }}
                      formatter={(val: any) => [`${val}% (${Math.round((val * 20) / 100)}명)`, '언급 빈도']}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {ISSUE_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom AI Synthesis & Actionable Advice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-stone-50 to-emerald-50/60 dark:from-amber-950/40 dark:via-[#251E1A] dark:to-emerald-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>AI 상담 인사이트 종합 분석 & 사회복지사 실무 권고사항</span>
            </div>
            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-1.5">
              <p>
                • <strong>정서적 라포 및 고립감 완화:</strong> 초기 방문 시 78점에 달했던 우울·불안 지표가 정기 밑반찬 배달과 말벗 상담 개입 후 25점으로 대폭 경감되었습니다. 특히 사회복지사에 대한 신뢰도가 94점으로 최상위 상태입니다.
              </p>
              <p>
                • <strong>신체 안전 및 영양 상태:</strong> 결식률 0% 달성 및 화장실 안전손잡이 시공으로 2차 낙상 사고가 성공적으로 예방되었습니다.
              </p>
              <p>
                • <strong>차기 중점 개입 제언:</strong> 관절염 통증으로 인한 야간 수면장애 호소가 지속되고 있으므로, 보건소 방문간호 연계 및 통증완화 파스/보호대 지원, 그리고 장기요양 등급 신청 준비를 병행하는 것을 권고합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

