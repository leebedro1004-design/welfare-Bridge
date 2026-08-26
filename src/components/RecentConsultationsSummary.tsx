import React, { useState } from 'react';
import {
  Sparkles,
  Headphones,
  FileText,
  Clock,
  User,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FilePlus2,
  TrendingUp,
  Tag,
  Volume2,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { ClientProfile, CaseDocument, PresetScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/mockData';

interface RecentConsultationsSummaryProps {
  clients: ClientProfile[];
  onOpenAiStudio: (scenario?: PresetScenario, client?: ClientProfile) => void;
  onOpenFormWithClient?: (client: ClientProfile, docType?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export interface ConsultationLogItem {
  id: string;
  clientId: string;
  clientName: string;
  clientAge: number;
  consultationDate: string;
  consultationType: '방문상담' | '전화상담' | '초기접수';
  duration: string;
  riskLevel: '고위험' | '중위험' | '일반';
  primaryConcerns: string[];
  summarySnippet: string;
  recommendedDoc: string;
  audioAvailable: boolean;
  status: '분석완료' | '서식생성완료' | '검토필요';
}

export const RecentConsultationsSummary: React.FC<RecentConsultationsSummaryProps> = ({
  clients,
  onOpenAiStudio,
  onOpenFormWithClient,
  onNavigateTab,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_risk' | 'pending'>('all');

  // Realistic recent consultation logs based on mock data and real scenarios
  const recentLogs: ConsultationLogItem[] = [
    {
      id: 'log-1',
      clientId: 'client-1',
      clientName: '김순옥',
      clientAge: 84,
      consultationDate: '2025-01-20 (월) 10:30',
      consultationType: '방문상담',
      duration: '18분 42초',
      riskLevel: '고위험',
      primaryConcerns: ['퇴행성관절염 통증', '식사/영양결식 위험', '화장실 낙상 우려'],
      summarySnippet:
        '양측 무릎 관절염 악화로 보행기 없이 거동 불가. 가스레인지 불 켜기가 힘들어 2일간 식사를 거름. 주거 안전손잡이 긴급설치 및 밑반찬 배달 연계 시급.',
      recommendedDoc: '초기상담 및 종합욕구사정표',
      audioAvailable: true,
      status: '분석완료',
    },
    {
      id: 'log-2',
      clientId: 'client-2',
      clientName: '박영철',
      clientAge: 79,
      consultationDate: '2025-01-18 (토) 14:15',
      consultationType: '전화상담',
      duration: '12분 10초',
      riskLevel: '중위험',
      primaryConcerns: ['인슐린 투약 누락', '만성 우울감', '사회적 고립'],
      summarySnippet:
        '뇌졸중 후유증과 함께 혈당 수치가 불안정하나 인슐린 주사 투약을 자주 잊음. 이웃과의 교류가 거의 없어 SGDS-K 우울검사 및 주기적 유선안부 확인 필요.',
      recommendedDoc: '서비스제공계획서',
      audioAvailable: true,
      status: '서식생성완료',
    },
    {
      id: 'log-3',
      clientId: 'client-4',
      clientName: '이만수',
      clientAge: 82,
      consultationDate: '2025-01-16 (목) 11:00',
      consultationType: '초기접수',
      duration: '22분 05초',
      riskLevel: '고위험',
      primaryConcerns: ['최근 빙판길 낙상', '허리 요추 골절', '돌봄 공백'],
      summarySnippet:
        '지난주 빙판길에서 넘어진 후 통증으로 누워만 계심. 독거 거주로 비상상황 시 119 호출 어려움. 응급안전안심서비스 장비 연계 및 일상생활지원 신청 접수.',
      recommendedDoc: '사례회의록 & 긴급지원',
      audioAvailable: true,
      status: '검토필요',
    },
    {
      id: 'log-4',
      clientId: 'client-3',
      clientName: '최정자',
      clientAge: 87,
      consultationDate: '2025-01-14 (화) 15:20',
      consultationType: '방문상담',
      duration: '14분 30초',
      riskLevel: '일반',
      primaryConcerns: ['수면장애', '겨울철 난방비 부담', '정기 안부'],
      summarySnippet:
        '불면증이 있으나 식사는 양호함. 실내 한파로 인한 난방용품(전기매트) 지원 요청 및 도봉구청 에너지바우처 연계 안내 완료.',
      recommendedDoc: '서비스제공기록지',
      audioAvailable: false,
      status: '서식생성완료',
    },
  ];

  const filteredLogs = recentLogs.filter((log) => {
    if (selectedFilter === 'high_risk') return log.riskLevel === '고위험';
    if (selectedFilter === 'pending') return log.status === '분석완료' || log.status === '검토필요';
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Quick Entrance Launcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                AI 상담실 퀵 진입 & 최근 상담 요약
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                실시간 음성 녹취 분석기 바로가기 및 최근 어르신 상담 기록 요약 브리핑
              </p>
            </div>
          </div>
        </div>

        {/* ⚡ DIRECT QUICK LAUNCHER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-quick-start-recording"
            type="button"
            onClick={() => onOpenAiStudio()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Headphones className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>실시간 녹취 분석기 바로 진입</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('ai-studio')}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>상담실 전체보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Quick Starters Bar */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl p-3 border border-amber-200/80 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          빠른 시나리오 불러오기:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.slice(0, 3).map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onOpenAiStudio(scenario)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-amber-800/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 text-[11px] font-semibold text-stone-800 dark:text-stone-200 transition-all cursor-pointer shadow-2xs"
            >
              {scenario.title}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            전체 상담 ({recentLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('high_risk')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedFilter === 'high_risk'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            고위험군 상담 ({recentLogs.filter((l) => l.riskLevel === '고위험').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('pending')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedFilter === 'pending'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            서식 작성 대기 ({recentLogs.filter((l) => l.status === '분석완료' || l.status === '검토필요').length})
          </button>
        </div>

        <span className="text-[11px] text-stone-400 hidden sm:inline">
          최근 상담 기준 자동 정렬됨
        </span>
      </div>

      {/* Consultation Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLogs.map((log) => {
          const client = clients.find((c) => c.name === log.clientName || c.id === log.clientId);

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800/80 hover:border-amber-400/80 transition-all flex flex-col justify-between space-y-3 group shadow-2xs"
            >
              {/* Card Top */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-stone-900 dark:text-stone-100">
                      {log.clientName} 어르신 ({log.clientAge}세)
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        log.riskLevel === '고위험'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                          : log.riskLevel === '중위험'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-900'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900'
                      }`}
                    >
                      {log.riskLevel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                      {log.consultationType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{log.duration}</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>상담일시: {log.consultationDate}</span>
                </div>

                {/* Primary Concerns Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {log.primaryConcerns.map((concern, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-medium"
                    >
                      #{concern}
                    </span>
                  ))}
                </div>

                {/* Summary Snippet */}
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-white dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
                  {log.summarySnippet}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  권장: {log.recommendedDoc}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (client) {
                        onOpenFormWithClient?.(client, 'intake');
                      } else {
                        onNavigateTab('forms');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FilePlus2 className="w-3 h-3" />
                    <span>서식 즉시 작성</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('ai-studio')}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 text-stone-800 dark:text-stone-200 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    녹취 상세
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
