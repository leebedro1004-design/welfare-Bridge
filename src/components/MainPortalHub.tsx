import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  FileText,
  MapPin,
  LineChart,
  FolderCheck,
  Bot,
  BellRing,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HeartHandshake,
  Headphones,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Mail,
  Send,
  Star,
  Activity,
  UserCheck
} from 'lucide-react';
import { AppTab } from './Header';
import { ClientProfile, CaseDocument, UserSettings } from '../types';

interface MainPortalHubProps {
  onNavigateTab: (tab: AppTab) => void;
  clients: ClientProfile[];
  documents: CaseDocument[];
  userSettings?: UserSettings;
  onNewConsultation: () => void;
  onSelectClientForConsultation?: (client: ClientProfile) => void;
  onSelectClientForForm?: (client: ClientProfile) => void;
}

export const MainPortalHub: React.FC<MainPortalHubProps> = ({
  onNavigateTab,
  clients,
  documents,
  userSettings,
  onNewConsultation,
  onSelectClientForConsultation,
  onSelectClientForForm
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  const highRiskClients = clients.filter(c => c.riskLevel.includes('고') || c.riskLevel.includes('위험'));
  const pendingDocs = documents.filter(d => d.status === '작성중' || d.status === '초안');

  // Categories definition for the portal
  const CATEGORIES = [
    {
      id: 'clients-care',
      category: '재가 어르신 관리 & 신규 발굴',
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'blue',
      badge: `${clients.length}명 관리 중`,
      targetTab: 'clients' as AppTab,
      description: '어르신 기본 인적사항, 건강·영양 상태, 위기도 등급 및 비상연락망 통합 관리',
      subItems: [
        { label: '어르신 목록 조회 및 검색', actionTab: 'clients' as AppTab },
        { label: '고위험 집중관리 어르신 필터', actionTab: 'clients' as AppTab },
        { label: '신규 대상자 등록 & 긴급 대처', actionTab: 'clients' as AppTab }
      ],
      stats: `${highRiskClients.length}명 고위험군 집중 모니터링`,
      tag: '대상자 중심'
    },
    {
      id: 'ai-transcript',
      category: 'AI 상담 녹취 분석 & 감정 대시보드',
      icon: <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'amber',
      badge: 'Gemini 3.7 Flash',
      targetTab: 'ai-studio' as AppTab,
      description: '음성 녹음 및 대화록 자동 텍스트화, 임상 요약, 위험 태그 추출, 감정 분석 및 미니 오디오 플레이어',
      subItems: [
        { label: '실시간 음성 녹음 및 텍스트 변환', actionTab: 'ai-studio' as AppTab },
        { label: '녹취 분석 & 자동 태그 분류기', actionTab: 'insights' as AppTab },
        { label: '감정 분석 대시보드 & 구간 반복', actionTab: 'insights' as AppTab }
      ],
      stats: '자동 3줄 요약 & 표준 보고서 변환',
      tag: 'AI 특화'
    },
    {
      id: 'forms-archive',
      category: '사례관리 7대 표준서식 & 보관함',
      icon: <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'emerald',
      badge: `총 ${documents.length}건 등록`,
      targetTab: 'forms' as AppTab,
      description: '보건복지부 노인보건복지사업안내 7대 양식 (초기면접, 욕구사정, 위기도평가, 사례회의록 등) 작성 및 전자결재',
      subItems: [
        { label: '초기상담·욕구사정 서식 작성', actionTab: 'forms' as AppTab },
        { label: '서식 전자결재 & 인쇄/PDF', actionTab: 'forms' as AppTab },
        { label: '완료 문서 보관함 & 구글 드라이브', actionTab: 'archive' as AppTab }
      ],
      stats: `${pendingDocs.length}건 작성/결재 대기 중`,
      tag: '표준 서식'
    },
    {
      id: 'routes-schedule',
      category: '방문 동선 최적화 & 현장 스케줄',
      icon: <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      color: 'rose',
      badge: '스마트 지도 연동',
      targetTab: 'routes' as AppTab,
      description: '어르신 댁 위치 지도 뷰, 당일 방문 우선순위 및 최적 권역 이동 경로 자동 계산',
      subItems: [
        { label: '어르신 위치 인터랙티브 지도', actionTab: 'routes' as AppTab },
        { label: '경로 최적화 및 이동 시간 산출', actionTab: 'routes' as AppTab },
        { label: '방문 일정 마감 알림 배너', actionTab: 'dashboard' as AppTab }
      ],
      stats: '금주 4가구 방문 예정 (동선 최적화)',
      tag: '현장 업무'
    },
    {
      id: 'insights-reports',
      category: '상담 인사이트 & 시계열 심리 리포트',
      icon: <LineChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      color: 'teal',
      badge: 'SGDS-K 지표 연동',
      targetTab: 'insights' as AppTab,
      description: '3개월 노인우울척도(SGDS-K) 추이, 상담 빈도 미니 캘린더, 중요 상담 즐겨찾기, 표준 보고서 메일 발송',
      subItems: [
        { label: '심리 안정도·우울도 시계열 추이', actionTab: 'insights' as AppTab },
        { label: '상담 이력 미니 캘린더 뷰', actionTab: 'insights' as AppTab },
        { label: '표준 보고서 메일 발송 & 보호자 공유', actionTab: 'insights' as AppTab }
      ],
      stats: '안정도 88점 (호전 추세 분석 중)',
      tag: '통계/분석'
    },
    {
      id: 'supervision-advisor',
      category: 'AI 슈퍼비전 & 복지사업 규정 자문',
      icon: <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'purple',
      badge: '전문 슈퍼바이저 챗',
      targetTab: 'supervision' as AppTab,
      description: '보건복지부 지침 기반의 법률·행정 질의응답, 위기개입 전략 코칭, 윤리적 딜레마 슈퍼비전 자문',
      subItems: [
        { label: '노인복지사업 지침 규정 질의', actionTab: 'supervision' as AppTab },
        { label: '긴급 위기사례 개입 자문', actionTab: 'supervision' as AppTab },
        { label: '사례관리자 감정 소진 예방 가이드', actionTab: 'supervision' as AppTab }
      ],
      stats: '최신 보건복지부 업무안내 규정 탑재',
      tag: '전문 자문'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Top Welcome & Today's Summary Hero */}
      <div className="bg-gradient-to-r from-[#2B231F] via-[#382D27] to-[#251E1A] text-white p-6 sm:p-8 rounded-3xl border border-stone-700/60 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                {userSettings?.agencyName || '도봉재가노인지원서비스센터'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs">
                {userSettings?.socialWorkerName ? `${userSettings.socialWorkerName} 선임 사회복지사` : '담당 사회복지사'}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-100">
              반갑습니다! 오늘 진행할 스마트 사례관리 업무를 선택해주세요.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              복잡한 대시보드를 일일이 찾을 필요 없이, 아래 표 형태의 업무 카테고리를 클릭하면 해당하는 전문 대시보드와 서식으로 즉시 이동합니다.
            </p>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNewConsultation}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>새 상담 녹취 AI 분석 시작</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2.5 rounded-2xl bg-[#3E342F] hover:bg-[#4D413B] text-stone-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-600 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>스마트 통합 대시보드 전체 보기</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-700/60">
          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">총 관리 어르신</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{clients.length}명</span>
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">고위험 집중관리</span>
              <span className="text-sm sm:text-base font-extrabold text-rose-300">{highRiskClients.length}명</span>
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">작성된 표준 서식</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300">{documents.length}건</span>
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">결재 대기 문서</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-300">{pendingDocs.length}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Category Matrix Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>사례관리 업무 카테고리 매트릭스</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
              총 6대 영역
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            원하는 업무 영역을 클릭하여 해당 대시보드 산하로 바로 진입하세요.
          </p>
        </div>

        {/* View Mode Toggle: Table Matrix vs. Card Grid */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 dark:bg-[#28211D] p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>표 형태 매트릭스 뷰</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>카드 그리드 뷰</span>
          </button>
        </div>
      </div>

      {/* 📋 VIEW 1: Table Matrix View (표 형태의 카테고리) */}
      {viewMode === 'matrix' ? (
        <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-600 dark:text-stone-400">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 min-w-[220px]">업무 카테고리</th>
                  <th className="py-3.5 px-4 min-w-[280px]">핵심 기능 및 설명</th>
                  <th className="py-3.5 px-4 min-w-[180px]">주요 세부 작업</th>
                  <th className="py-3.5 px-4 min-w-[140px]">현황 / 통계</th>
                  <th className="py-3.5 px-4 text-center w-28">대시보드 이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs">
                {CATEGORIES.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors group cursor-pointer"
                    onClick={() => onNavigateTab(cat.targetTab)}
                  >
                    {/* Number */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-stone-400">
                      0{idx + 1}
                    </td>

                    {/* Category Title & Icon */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-[#28211D] border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition-transform">
                          {cat.icon}
                        </div>
                        <div>
                          <div className="font-extrabold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                            <span>{cat.category}</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium inline-block mt-1">
                            {cat.tag}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-stone-600 dark:text-stone-300 leading-relaxed">
                      {cat.description}
                    </td>

                    {/* Sub Tasks */}
                    <td className="py-4 px-4">
                      <ul className="space-y-1">
                        {cat.subItems.map((sub, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab(sub.actionTab);
                            }}
                          >
                            <ChevronRight className="w-3 h-3 text-amber-500" />
                            <span>{sub.label}</span>
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* Status Stats */}
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#251E1A] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 text-[11px] font-bold">
                        {cat.stats}
                      </span>
                    </td>

                    {/* Navigation CTA Button */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateTab(cat.targetTab);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 group-hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1 mx-auto shadow-2xs transition-all cursor-pointer"
                      >
                        <span>이동</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 🗂️ VIEW 2: Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => onNavigateTab(cat.targetTab)}
              className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-[#28211D] border border-stone-200 dark:border-stone-700">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {cat.category}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Sub items */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                  {cat.subItems.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 text-amber-500" />
                      <span>{sub.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-400">
                  {cat.stats}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>진입하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 Quick Direct Navigation Table: 오늘의 추천 업무 바로가기 */}
      <div className="bg-stone-50/80 dark:bg-[#251E1A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              사회복지사 실무 빠른 실행 (Quick Actions)
            </h4>
          </div>
          <span className="text-[11px] text-stone-400">자주 사용하는 핵심 기능</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('ai-studio')}
            className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 text-left hover:border-amber-400 transition-all flex items-start gap-3 cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                상담 녹취 실시간 분석
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                음성 녹음 파일 자동 요약
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('forms')}
            className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 text-left hover:border-emerald-400 transition-all flex items-start gap-3 cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                사례관리 서식 신규 작성
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                7대 표준양식 전자 결재
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('routes')}
            className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 text-left hover:border-rose-400 transition-all flex items-start gap-3 cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                오늘의 방문 동선 지도
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                최적 이동 경로 산출
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('insights')}
            className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 text-left hover:border-teal-400 transition-all flex items-start gap-3 cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                감정 분석 & 캘린더 조회
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                상담 이력 및 주기 추적
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
