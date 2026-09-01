import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Users,
  FolderCheck,
  Bot,
  HeartHandshake,
  ShieldCheck,
  Printer,
  LineChart,
  BrainCircuit,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Moon,
  Sun,
  Settings,
  Cloud,
  LogIn,
  LogOut,
  CheckCircle2,
  Home,
  Clock,
  Maximize2,
  ChevronDown,
  Layers,
  ShieldAlert,
  Building,
  UserPlus,
  Zap,
  Bookmark,
  Menu,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleAuthUser, UserSettings } from '../types';
import { CareBridgeLogo } from './CareBridgeLogo';

export type AppTab = 'portal' | 'dashboard' | 'ai-studio' | 'forms' | 'routes' | 'insights' | 'clients' | 'archive' | 'supervision' | 'summary-report';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  clientCount: number;
  docCount: number;
  onNewConsultation: () => void;
  onOpenSettings?: () => void;
  user?: GoogleAuthUser | null;
  userSettings?: UserSettings;
  onSignInWithGoogle?: () => void;
  onLogout?: () => void;
  onOpenScheduler?: () => void;
  onToggleFocusMode?: () => void;
  onOpenMajorFormsModal?: () => void;
  onOpenNewClientModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clientCount,
  docCount,
  onNewConsultation,
  onOpenSettings,
  user,
  userSettings,
  onSignInWithGoogle,
  onLogout,
  onOpenScheduler,
  onToggleFocusMode,
  onOpenMajorFormsModal,
  onOpenNewClientModal,
  onToggleMobileSidebar,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('carebridge_theme') === 'dark';
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('carebridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('carebridge_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const agencyDisplayName = userSettings?.agencyName || userSettings?.institutionName || '도봉재가노인지원서비스센터';
  const workerDisplayName = userSettings?.socialWorkerName || userSettings?.workerName || '이현정';
  const workerPosition = userSettings?.workerPosition || '선임 사회복지사';

  return (
    <header className="bg-[#241E1B] text-stone-100 border-b border-[#38302B] sticky top-0 z-40 shadow-sm transition-colors select-none">
      {/* 1. TOP SYSTEM STATUS & USER BAR (희망이음 상단 시스템 헤더) */}
      <div className="bg-[#1C1715] border-b border-[#332A25] px-2 sm:px-4 py-1.5 text-xs">
        <div className="max-w-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Portal Identity + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
              aria-label="모바일 사례관리 메뉴 열기"
              title="사례관리 메뉴"
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>

            <CareBridgeLogo size="sm" showSubtitle={false} showBadge={true} badgeText="희망이음" />
            <span className="hidden md:inline-block w-px h-3 bg-stone-700" />
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-amber-200 font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              <Building className="w-3 h-3 text-amber-400" />
              {agencyDisplayName}
            </span>
          </div>

          {/* User Session & Utility Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] text-stone-300">
            <div className="hidden sm:flex items-center gap-1.5 text-stone-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>현재시간: <strong className="text-stone-200">{currentTime}</strong></span>
            </div>

            <span className="hidden sm:inline-block w-px h-3 bg-stone-700" />

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-amber-300 font-bold truncate max-w-[100px] sm:max-w-none">
                {workerDisplayName}
              </span>
              <span className="text-stone-400 hidden xs:inline">({workerPosition})</span>
            </div>

            {/* Auto-backup indicator & Logout */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenScheduler}
                  className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] hover:bg-emerald-900 transition-colors cursor-pointer"
                  title="Google Drive '케어브릿지_사례관리' 폴더 연동 중"
                >
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>드라이브 연동 중</span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                    title="로그아웃 후 초기 화면으로 이동"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>로그아웃</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignInWithGoogle || onOpenSettings}
                className="flex items-center gap-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                title="Google 계정 로그인 화면"
              >
                <LogIn className="w-3 h-3" />
                <span>Google 로그인</span>
              </button>
            )}

            {/* Quick Dark Mode */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
              title={isDark ? '라이트 모드로 전환' : '야간 다크 모드로 전환'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
              title="기관 환경설정"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HORIZONTAL CATEGORY NAVIGATION BAR (희망이음 스타일 상단 대분류 탭) */}
      <div className="px-4 bg-[#28211D]">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-0.5">
            {/* 1. 나의업무 (홈) */}
            <button
              id="tab-portal"
              type="button"
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'portal' || activeTab === 'dashboard'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>나의업무 (홈)</span>
            </button>

            {/* 2. 대상자 관리 */}
            <button
              id="tab-clients"
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'clients'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>대상자 관리</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-normal">
                {clientCount}
              </span>
            </button>

            {/* 3. AI 녹취·사정 */}
            <button
              id="tab-ai-studio"
              type="button"
              onClick={() => setActiveTab('ai-studio')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'ai-studio'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI 녹취·상담실</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 font-semibold animate-pulse">
                AI
              </span>
            </button>

            {/* 4. 10대 법정서식 */}
            <button
              id="tab-forms"
              type="button"
              onClick={() => setActiveTab('forms')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'forms'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>10대 법정서식</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-normal">
                {docCount}
              </span>
            </button>

            {/* 4-B. 주요 법정 서식 퀵 런처 (User Request #4) */}
            {onOpenMajorFormsModal && (
              <button
                id="header-btn-major-forms"
                type="button"
                onClick={onOpenMajorFormsModal}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 my-1.5 text-xs font-bold rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-colors cursor-pointer whitespace-nowrap"
                title="사례회의록, 서비스계획서 등 주요 서식 즉시 작성"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>주요 서식 퀵</span>
              </button>
            )}

            {/* 5. 어르신 종합보고서 (Summary Report) */}
            <button
              id="tab-summary-report"
              type="button"
              onClick={() => setActiveTab('summary-report')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'summary-report'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <span>어르신 종합보고서</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 font-normal">
                NEW
              </span>
            </button>

            {/* 6. 위험도·인사이트 */}
            <button
              id="tab-insights"
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'insights'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <LineChart className="w-4 h-4 text-teal-400" />
              <span>위험도·인사이트</span>
            </button>

            {/* 6. 방문동선·일정 */}
            <button
              id="tab-routes"
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'routes'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>방문동선·일정</span>
            </button>

            {/* 7. 문서보관함 */}
            <button
              id="tab-archive"
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'archive'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <FolderCheck className="w-4 h-4 text-stone-400" />
              <span>문서보관함</span>
            </button>

            {/* 8. AI 수퍼비전 */}
            <button
              id="tab-supervision"
              type="button"
              onClick={() => setActiveTab('supervision')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'supervision'
                  ? 'border-amber-400 text-amber-300 bg-[#352C27]'
                  : 'border-transparent text-stone-300 hover:text-white hover:bg-[#312924]'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI 수퍼비전</span>
            </button>
          </nav>

          {/* Quick CTAs */}
          <div className="hidden sm:flex items-center gap-2 pl-2">
            {onOpenNewClientModal && (
              <button
                id="header-new-client-btn"
                type="button"
                onClick={onOpenNewClientModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 hover:text-white shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
                title="새로운 대상자 인적사항 및 사례 등록"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>신규 어르신 등록</span>
              </button>
            )}

            <button
              id="header-new-consultation-btn"
              type="button"
              onClick={onNewConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
              title="새로운 어르신 상담 녹취 및 AI 분석 시작"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>신규 상담 시작</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
