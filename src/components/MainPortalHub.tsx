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
  UserCheck,
  PlusCircle,
  PlayCircle,
  FilePlus2,
  FileCheck2,
  Building,
  Printer,
  Compass,
  ArrowUpRight,
  UserPlus,
  Zap,
  Bookmark
} from 'lucide-react';
import { AppTab } from './Header';
import { ClientProfile, CaseDocument, UserSettings, PresetScenario, DocumentType } from '../types';
import { RecentConsultationsSummary } from './RecentConsultationsSummary';
import { MAJOR_LEGAL_FORMS } from './MajorFormsQuickModal';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

interface MainPortalHubProps {
  onNavigateTab: (tab: AppTab) => void;
  clients: ClientProfile[];
  documents: CaseDocument[];
  userSettings?: UserSettings;
  onNewConsultation: (scenario?: PresetScenario, client?: ClientProfile) => void;
  onSelectClientForConsultation?: (client: ClientProfile) => void;
  onSelectClientForForm?: (client: ClientProfile, docType?: DocumentType) => void;
  onNewClientRegister: () => void;
  onOpenMajorFormsModal: () => void;
}

export const MainPortalHub: React.FC<MainPortalHubProps> = ({
  onNavigateTab,
  clients,
  documents,
  userSettings,
  onNewConsultation,
  onSelectClientForConsultation,
  onSelectClientForForm,
  onNewClientRegister,
  onOpenMajorFormsModal,
}) => {
  const highRiskClients = clients.filter(
    (c) => c.riskLevel.includes('고') || c.riskLevel.includes('위험')
  );
  const pendingDocs = documents.filter(
    (d) => d.status === '작성중' || d.status === '초안'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 1. HERO BIG QUICKSTART SECTION - "처음 시작할 때 가장 먼저 누르는 큰 버튼" 🌟 */}
      <div className="bg-gradient-to-br from-[#2F2520] via-[#3B2F28] to-[#251E1A] text-white p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Institution & Worker Header Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-700/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                <HeartHandshake className="w-3.5 h-3.5" />
                {userSettings?.agencyName || '도봉재가노인지원서비스센터'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs">
                {userSettings?.socialWorkerName ? `${userSettings.socialWorkerName} 담당자` : '담당 사회복지사'}
              </span>
            </div>
            <span className="text-xs text-amber-200/80 font-medium hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              보건복지부 표준 노인보건복지사업안내 규격 적용
            </span>
          </div>

          {/* Core Title */}
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-stone-100 flex items-center gap-2">
              어르신 첫 상담과 서식 작성을 바로 시작하세요!
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-3xl leading-relaxed">
              복잡한 메뉴를 찾을 필요 없이 아래 <strong className="text-amber-300 underline underline-offset-4 font-bold">신규 등록 및 AI 상담 버튼</strong>을 클릭하면 어르신 인적사항 등록부터 AI 실시간 녹취, 10대 법정서식 작성까지 한 화면에서 즉시 진행됩니다.
            </p>
          </div>

          {/* 🎯 3 PROMINENT HERO ACTION BUTTONS (접근성 극대화된 3대 대형 버튼) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* BUTTON 1: (HIGH PRIORITY) 신규 어르신 등록 */}
            <button
              id="hero-btn-register-new-client"
              type="button"
              onClick={onNewClientRegister}
              className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-950/50 border-2 border-amber-400/60 text-left transition-all transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] backdrop-blur-xs tracking-wider border border-white/30">
                    ★ 시작하기 · 신규 사례
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5 text-white animate-bounce" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  신규 어르신 등록<br />
                  <span className="text-amber-200 font-semibold text-xs sm:text-sm">& 새로운 사례 시작하기</span>
                </h3>
              </div>
              <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-amber-100">
                <span>성함·주소·수급구분 원스톱 등록</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* BUTTON 2: AI 상담실 & 실시간 녹취 */}
            <button
              id="hero-btn-start-ai-consultation"
              type="button"
              onClick={() => onNewConsultation()}
              className="group relative p-5 rounded-2xl bg-[#342A24] hover:bg-[#42352E] text-stone-100 shadow-md border border-stone-600/80 hover:border-amber-400/60 text-left transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                    AI 상담실
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-100 leading-snug">
                  방문/전화 대화 녹취 &<br />
                  <span className="text-amber-300 font-semibold text-xs sm:text-sm">실시간 AI 위험도 사정</span>
                </h3>
              </div>
              <div className="pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs font-semibold text-stone-300">
                <span>음성 자동 텍스트화 & 위험군 감지</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* BUTTON 3: 주요 법정 서식 원클릭 런처 */}
            <button
              id="hero-btn-open-major-forms"
              type="button"
              onClick={onOpenMajorFormsModal}
              className="group relative p-5 rounded-2xl bg-[#342A24] hover:bg-[#42352E] text-stone-100 shadow-md border border-stone-600/80 hover:border-emerald-400/60 text-left transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                    주요 법정 서식
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-100 leading-snug">
                  사례회의록 & 계획서<br />
                  <span className="text-emerald-300 font-semibold text-xs sm:text-sm">10대 법정서식 빠른 작성</span>
                </h3>
              </div>
              <div className="pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs font-semibold text-stone-300">
                <span>사례회의록 · 서비스계획서 즉시 생성</span>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* 4 Quick KPI Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-700/60 relative z-10">
          <div
            onClick={() => onNavigateTab('clients')}
            className="bg-black/30 hover:bg-black/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">총 관리 어르신</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{clients.length}명</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('clients')}
            className="bg-black/30 hover:bg-black/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">고위험 집중관리</span>
              <span className="text-sm sm:text-base font-extrabold text-rose-300">{highRiskClients.length}명</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('forms')}
            className="bg-black/30 hover:bg-black/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">작성 완료 서식</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300">{documents.length}건</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('forms')}
            className="bg-black/30 hover:bg-black/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">결재 대기 서식</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-300">{pendingDocs.length}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎙️ 2. AI 상담실 퀵 진입 & 최근 상담 요약 (User Request #2) */}
      <RecentConsultationsSummary
        clients={clients}
        onOpenAiStudio={(scenario, client) => onNewConsultation(scenario, client)}
        onOpenFormWithClient={(client, docType) => onSelectClientForForm?.(client, docType as DocumentType)}
        onNavigateTab={onNavigateTab}
      />

      {/* 📄 3. 주요 법정 서식 퀵 런처 바 (User Request #4) */}
      <div className="bg-white dark:bg-[#1E1916] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              자주 사용하는 주요 법정 서식 (원클릭 작성)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              사례회의록, 서비스계획서 등 일상 업무에서 가장 빈번하게 작성하는 보건복지부 양식
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenMajorFormsModal}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>전체 10대 법정서식 런처 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MAJOR_LEGAL_FORMS.slice(0, 3).map((form) => (
            <div
              key={form.type}
              onClick={() => {
                const targetClient = clients[0];
                onSelectClientForForm?.(targetClient, form.type);
                onNavigateTab('forms');
              }}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {form.lawNumber}
                </span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {form.badge}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                {form.title}
              </h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                {form.desc}
              </p>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>즉시 작성하기</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 4. 4단계 원스톱 표준 프로세스 안내 */}
      <div className="bg-white dark:bg-[#1E1916] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              재가노인지원서비스 스마트 사례관리 표준 업무 흐름
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              초기 상담부터 서비스 제공 및 종결까지 보건복지부 지침에 따른 4단계 표준 프로세스를 제공합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>통합 모니터링 대시보드</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* STEP 1 */}
          <div
            onClick={() => onNavigateTab('ai-studio')}
            className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                01단계
              </span>
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              상담 접수 & AI 실시간 녹취
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              어르신과의 방문/전화 상담을 실시간 녹음하고 대화 내용을 자동으로 텍스트화합니다.
            </p>
          </div>

          {/* STEP 2 */}
          <div
            onClick={() => onNavigateTab('forms')}
            className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                02단계
              </span>
              <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              초기상담 & 종합욕구사정
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              AI 분석 결과를 바탕으로 별지 제1호 접수기록지와 제2호 종합사정표를 신속하게 작성합니다.
            </p>
          </div>

          {/* STEP 3 */}
          <div
            onClick={() => onNavigateTab('forms')}
            className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 hover:border-blue-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                03단계
              </span>
              <CalendarDays className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              서비스 제공 계획 수립
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              사례회의를 거쳐 식사배달, 안전확인, 주거개선 등 맞춤형 서비스 제공계획서를 완성합니다.
            </p>
          </div>

          {/* STEP 4 */}
          <div
            onClick={() => onNavigateTab('forms')}
            className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 hover:border-purple-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                04단계
              </span>
              <Printer className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              전자결재 및 표준 공문서 출력
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              담당-팀장-센터장 3단 결재와 기관 직인이 날인된 보건복지부 제출용 정식 PDF를 출력합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
