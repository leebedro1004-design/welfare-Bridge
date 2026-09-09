import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  HeartPulse,
  ShieldAlert,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  HeartHandshake,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Filter,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Siren,
  FolderCheck,
  FileEdit,
  Building,
  CalendarDays,
  X,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { AppTab } from './Header';
import { ClientProfile, CaseDocument, UserSettings, PresetScenario, DocumentType, RiskLevel } from '../types';
import { ClientDetailRecordModal } from './ClientDetailRecordModal';
import { ClientQuickSearchBar } from './ClientQuickSearchBar';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import { matchClientQuery } from '../utils/koreanSearch';
import { sortClients, ClientSortOption } from '../utils/clientSort';

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
  onUpdateClientRiskLevel?: (clientId: string, newRisk: RiskLevel) => void;
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
  onUpdateClientRiskLevel,
}) => {
  // Active Roster Filter Tier: 'all' | 'high' (최중점) | 'mid' (중점) | 'low' (일반)
  const [activeTier, setActiveTier] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [welfareFilter, setWelfareFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortBy, setSortBy] = useState<ClientSortOption>('recent');

  // Selected client for detailed consultation & assessment modal
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<ClientProfile | null>(null);

  // Group clients by priority tier
  const highRiskClients = useMemo(
    () => clients.filter((c) => c.riskLevel.includes('고') || c.riskLevel.includes('최')),
    [clients]
  );
  const midRiskClients = useMemo(
    () => clients.filter((c) => c.riskLevel.includes('중')),
    [clients]
  );
  const lowRiskClients = useMemo(
    () => clients.filter((c) => !c.riskLevel.includes('고') && !c.riskLevel.includes('최') && !c.riskLevel.includes('중')),
    [clients]
  );

  // Filter clients based on active tier, search term (Korean chosung/multi-field), and welfare type + apply sorting
  const filteredClients = useMemo(() => {
    const list = clients.filter((c) => {
      // 1. Tier Filter
      if (activeTier === 'high') {
        if (!c.riskLevel.includes('고') && !c.riskLevel.includes('최')) return false;
      } else if (activeTier === 'mid') {
        if (!c.riskLevel.includes('중')) return false;
      } else if (activeTier === 'low') {
        if (c.riskLevel.includes('고') || c.riskLevel.includes('최') || c.riskLevel.includes('중')) return false;
      }

      // 2. Comprehensive Search Query Match (Name, Chosung, Phone last 4 digits, Address, Disease, Welfare)
      if (searchTerm.trim()) {
        const { matched } = matchClientQuery(c, searchTerm);
        if (!matched) return false;
      }

      // 3. Welfare Type Filter
      if (welfareFilter !== 'all' && c.welfareType !== welfareFilter) {
        return false;
      }

      return true;
    });

    return sortClients(list, sortBy);
  }, [clients, activeTier, searchTerm, welfareFilter, sortBy]);

  const handleOpenDetail = (client: ClientProfile) => {
    setSelectedClientForDetail(client);
  };

  const agencyName = userSettings?.agencyName || userSettings?.institutionName || '도봉재가노인지원서비스센터';
  const workerName = userSettings?.socialWorkerName || userSettings?.workerName || '이현정 사회복지사';

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 1. DIRECT SYSTEM HEADER & ACTION BAR (불필요한 군더더기 배너 제거, 직관적 핵심 상단 바) 🌟 */}
      <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-extrabold text-xs border border-amber-300/80 dark:border-amber-700/60 flex items-center gap-1.5 shadow-2xs">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                {agencyName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs">
                {workerName} (사례관리 전담)
              </span>
              <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                보건복지부 노인보건복지사업안내 규격
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
              재가노인지원 맞춤형 사례관리 시스템
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              신규 대상자 등록부터 최중점·중점·일반 관리 명부 확인, 세부 상담 및 사정기록을 한 화면에서 직관적으로 관리합니다.
            </p>
          </div>

          {/* Quick Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 🎯 CORE ACTION: 대상자 (신규) 등록 버튼 */}
            <button
              id="btn-register-new-client-main"
              type="button"
              onClick={onNewClientRegister}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 border border-amber-500/40"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>대상자(신규) 등록</span>
            </button>

            {/* SECONDARY TOOL: AI 상담실 바로가기 */}
            <button
              type="button"
              onClick={() => onNewConsultation()}
              className="px-3.5 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
              title="AI 음성 녹취 및 실시간 위험도 분석"
            >
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">AI 녹취·상담실</span>
              <span className="sm:hidden">AI 상담실</span>
            </button>

            {/* SECONDARY TOOL: 10대 법정 서식 런처 */}
            <button
              type="button"
              onClick={onOpenMajorFormsModal}
              className="px-3.5 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
              title="10대 법정 표준서식 빠른 작성"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">10대 법정서식</span>
              <span className="sm:hidden">법정서식</span>
            </button>

            {/* OPTIONAL: 전체 대시보드 */}
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-3 py-3 rounded-2xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
              title="통합 모니터링 및 지도 대시보드"
            >
              대시보드 →
            </button>
          </div>
        </div>

        {/* 📊 Real-Time Quick Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div
            onClick={() => setActiveTier('all')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              activeTier === 'all'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-2xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-amber-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">총 관리 대상자</span>
              <span className="text-base font-extrabold text-stone-900 dark:text-stone-100">{clients.length}명</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTier('high')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              activeTier === 'high'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-2xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-rose-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">최중점 (고위험)</span>
              <span className="text-base font-extrabold text-rose-700 dark:text-rose-400">{highRiskClients.length}명</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTier('mid')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              activeTier === 'mid'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-2xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-amber-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">중점 (정기관리)</span>
              <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">{midRiskClients.length}명</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTier('low')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              activeTier === 'low'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">일반 (모니터링)</span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{lowRiskClients.length}명</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 2. FAST CLIENT SPOTLIGHT SEARCH (대상자 신속 통합 검색창) 🌟 */}
      <div className="bg-gradient-to-r from-amber-500/10 via-stone-50 to-stone-100 dark:from-amber-950/20 dark:via-[#1A1614] dark:to-[#1E1916] rounded-3xl border border-amber-300/70 dark:border-amber-900/50 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                  대상자 신속 통합 검색
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  초성(ㄱㅇㅅ)·전화뒷자리·질환·주소 즉시조회
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                수많은 어르신 중 찾고자 하는 대상자를 1초 만에 검색하여 세부상담·사정기록을 즉시 열람합니다.
              </p>
            </div>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold self-end sm:self-auto flex items-center gap-1.5">
            <span>등록된 전체 대상자:</span>
            <span className="text-amber-700 dark:text-amber-400 font-black text-sm">{clients.length}명</span>
          </div>
        </div>

        {/* Quick Search Bar Component */}
        <ClientQuickSearchBar
          clients={clients}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSelectClient={handleOpenDetail}
          onNewClientRegister={onNewClientRegister}
          onNewConsultationForClient={(client) => onNewConsultation(undefined, client)}
          onSelectClientForForm={onSelectClientForForm}
        />
      </div>

      {/* 🌟 3. CORE SYSTEM: 기존대상자 명부 (최중점, 중점, 일반 탭 분할) 🌟 */}
      <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Tier Tab Switcher & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          {/* Categorized Roster Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTier('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTier === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              <span>전체 명부</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-stone-300 dark:text-stone-900">
                {clients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTier('high')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTier === 'high'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>최중점 대상자</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">
                {highRiskClients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTier('mid')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTier === 'mid'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>중점 대상자</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
                {midRiskClients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTier('low')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTier === 'low'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>일반 대상자</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold">
                {lowRiskClients.length}
              </span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <span className="text-xs text-stone-400 font-bold mr-1 hidden sm:inline">보기 형식:</span>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="카드 뷰"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="테이블 명부 뷰"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Secondary Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="어르신 성명, 초성(ㄱㅇㅅ), 전화번호 뒷자리, 주소지, 기저질환(관절염 등) 검색"
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                title="검색어 지우기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-bold">수급자격:</span>
            <select
              value={welfareFilter}
              onChange={(e) => setWelfareFilter(e.target.value)}
              className="text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">전체 수급자격</option>
              <option value="기초생활수급자(생계/의료)">기초수급 (생계/의료)</option>
              <option value="차상위계층">차상위계층</option>
              <option value="기초연금수급자">기초연금수급자</option>
              <option value="일반저소득">일반저소득</option>
            </select>
          </div>

          {/* 🔽 Client Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
              정렬:
            </span>
            <select
              id="select-client-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ClientSortOption)}
              className="text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="recent">최근 등록순 (Recently Added)</option>
              <option value="name">성명 가나다순 (Name)</option>
              <option value="risk">위기도순 (Risk Level)</option>
            </select>
          </div>

          {(searchTerm || welfareFilter !== 'all' || activeTier !== 'all' || sortBy !== 'recent') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setWelfareFilter('all');
                setActiveTier('all');
                setSortBy('recent');
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="모든 필터 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>전체 초기화</span>
            </button>
          )}

          <span className="text-xs text-stone-400 font-medium">
            조회된 대상자: <strong className="text-amber-700 dark:text-amber-400 font-black">{filteredClients.length}</strong>명
          </span>
        </div>

        {/* 📋 ROSTER DISPLAY: ZERO-RESULTS EMPTY STATE */}
        {filteredClients.length === 0 && (
          <div className="py-12 px-6 text-center space-y-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {searchTerm ? `'${searchTerm}'(으)로 조회된 대상자가 없습니다` : '조건에 해당하는 대상자가 없습니다'}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                어르신 성함의 한글 초성(예: <b>ㄱㅇㅅ</b>), 전화번호 뒷 4자리, 생년월일, 주소지 동명 또는 기저질환(당뇨, 치매 등)으로 다시 검색해 보세요.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {(searchTerm || welfareFilter !== 'all' || activeTier !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setWelfareFilter('all');
                    setActiveTier('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>검색 필터 초기화</span>
                </button>
              )}
              <button
                type="button"
                onClick={onNewClientRegister}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-black shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{searchTerm ? `'${searchTerm}' 어르신 신규 등록하기` : '신규 대상자 등록하기'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 📋 ROSTER DISPLAY: CARD VIEW (DEFAULT) */}
        {viewMode === 'card' && filteredClients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 pt-1">
            {filteredClients.map((client) => {
              const isHigh = client.riskLevel.includes('고') || client.riskLevel.includes('최');
              const isMid = client.riskLevel.includes('중');
              const tierLabel = isHigh ? '최중점' : isMid ? '중점' : '일반';
              const clientDocsCount = documents.filter((d) => d.clientId === client.id).length;

              return (
                <div
                  key={client.id}
                  className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between group"
                >
                  {/* Card Main Click Area */}
                  <div
                    onClick={() => handleOpenDetail(client)}
                    className="p-5 space-y-3.5 cursor-pointer"
                  >
                    {/* Header: Name, Age, Gender, Tier Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center border border-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                          {client.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                              {client.name}
                            </h3>
                            <span className="text-xs text-stone-500 font-medium">
                              ({client.age}세, {client.gender})
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium block">
                            {client.livingType} · {client.welfareType.split('(')[0]}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : isMid
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {tierLabel}
                      </span>
                    </div>

                    {/* Contact & Address Box */}
                    <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {client.phone}
                          </span>
                        </div>
                        {client.emergencyContact?.phone && (
                          <div className="text-[11px] text-stone-500">
                            <span>비상({client.emergencyContact.relation}): </span>
                            <span className="font-semibold text-rose-700 dark:text-rose-400">
                              {client.emergencyContact.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800 text-[11px]">
                        <span className="text-amber-900 dark:text-amber-300 font-semibold">
                          장기요양: {client.longTermCareStatus}
                        </span>
                        <span className="text-stone-500">
                          연계서식: <strong className="text-stone-800 dark:text-stone-200">{clientDocsCount}건</strong>
                        </span>
                      </div>
                    </div>

                    {/* Chronic Diseases Badges */}
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-rose-500" />
                        주요 만성 질환
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {client.chronicDiseases.map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Clear Detailed Record Button & Action CTAs */}
                  <div className="border-t border-stone-100 dark:border-stone-800 p-3 bg-stone-50/70 dark:bg-stone-900/40 space-y-2">
                    {/* PRIMARY DETAIL BUTTON: 세부상담 및 사정기록 열람 */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(client)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-amber-600 dark:from-stone-800 dark:to-stone-700 dark:hover:from-amber-600 dark:hover:to-amber-500 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>세부상담 · 사정기록 열람하기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Secondary Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectClientForConsultation) {
                            onSelectClientForConsultation(client);
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300/80 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>AI 녹취상담</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectClientForForm) {
                            onSelectClientForForm(client, 'assessment');
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
                        <span>서식 작성</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📋 ROSTER DISPLAY: TABLE VIEW (ALTERNATIVE FOR DENSE WORK) */}
        {viewMode === 'table' && filteredClients.length > 0 && (
          <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-extrabold">
                    <th
                      onClick={() => setSortBy(sortBy === 'name' ? 'recent' : 'name')}
                      className="p-3.5 cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 select-none transition-colors"
                      title="클릭하여 성명 가나다순 정렬"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>대상자 성명</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-stone-400 opacity-50'}`} />
                      </div>
                    </th>
                    <th
                      onClick={() => setSortBy(sortBy === 'risk' ? 'recent' : 'risk')}
                      className="p-3.5 cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 select-none transition-colors"
                      title="클릭하여 위기도순 정렬"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>관리 등급</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === 'risk' ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-stone-400 opacity-50'}`} />
                      </div>
                    </th>
                    <th className="p-3.5">연령/성별</th>
                    <th className="p-3.5">수급자격/주거</th>
                    <th className="p-3.5">주소지</th>
                    <th className="p-3.5">연락처</th>
                    <th className="p-3.5">보유 기저질환</th>
                    <th className="p-3.5 text-right">상세 상담·사정기록</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredClients.map((client) => {
                    const isHigh = client.riskLevel.includes('고') || client.riskLevel.includes('최');
                    const isMid = client.riskLevel.includes('중');
                    const tierLabel = isHigh ? '최중점' : isMid ? '중점' : '일반';

                    return (
                      <tr
                        key={client.id}
                        onClick={() => handleOpenDetail(client)}
                        className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer group"
                      >
                        <td className="p-3.5 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black flex items-center justify-center text-xs">
                            {client.name.slice(0, 1)}
                          </div>
                          <span>{client.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold border ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                : isMid
                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {tierLabel}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-400">
                          {client.age}세 ({client.gender})
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-400">
                          {client.welfareType.split('(')[0]} · {client.livingType}
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-400 max-w-[180px] truncate">
                          {client.address}
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-400 font-mono font-medium">
                          {client.phone}
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                          {client.chronicDiseases.join(', ')}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(client);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-extrabold text-xs inline-flex items-center gap-1 hover:bg-amber-700 dark:hover:bg-amber-400 shadow-2xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>열람하기</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 3. POPUP MODAL: 대상자별 세부 상담기록 및 종합 사정기록 모달 🌟 */}
      {selectedClientForDetail && (
        <ClientDetailRecordModal
          isOpen={Boolean(selectedClientForDetail)}
          onClose={() => setSelectedClientForDetail(null)}
          client={selectedClientForDetail}
          documents={documents}
          onSelectClientForConsultation={(c) => {
            setSelectedClientForDetail(null);
            onSelectClientForConsultation?.(c);
          }}
          onSelectClientForForm={(c, docType) => {
            setSelectedClientForDetail(null);
            onSelectClientForForm?.(c, docType);
          }}
          onUpdateClientRiskLevel={(cId, newRisk) => {
            onUpdateClientRiskLevel?.(cId, newRisk);
            // Update modal selected client reference as well
            setSelectedClientForDetail((prev) => (prev && prev.id === cId ? { ...prev, riskLevel: newRisk } : prev));
          }}
        />
      )}
    </div>
  );
};
