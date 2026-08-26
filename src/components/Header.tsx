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
  CheckCircle2,
  Home,
  Clock,
  Maximize2
} from 'lucide-react';
import { GoogleAuthUser, UserSettings } from '../types';

export type AppTab = 'portal' | 'dashboard' | 'ai-studio' | 'forms' | 'routes' | 'insights' | 'clients' | 'archive' | 'supervision';

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
  onOpenScheduler?: () => void;
  onToggleFocusMode?: () => void;
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
  onOpenScheduler,
  onToggleFocusMode,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('carebridge_theme') === 'dark';
  });

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

  return (
    <header className="bg-[#231E1B] text-stone-100 border-b border-[#38302B] sticky top-0 z-40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Service Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md border border-amber-400/30">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-700/60">
                  {userSettings?.agencyName || '재가노인지원사업'}
                </span>
                <span className="text-[11px] text-stone-400">
                  {userSettings?.socialWorkerName ? `${userSettings.socialWorkerName} 담당자` : '따뜻한 스마트 사례관리'}
                </span>
              </div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                케어브릿지
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-600/40">
                  <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
                  스마트 AI
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#2D2622] border border-[#3E342F] text-stone-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-400">관리 어르신:</span>
              <span className="font-bold text-amber-200">{clientCount}명</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#2D2622] border border-[#3E342F] text-stone-300">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-400">작성 서식:</span>
              <span className="font-bold text-emerald-200">{docCount}건</span>
            </div>
            {user ? (
              <button
                type="button"
                onClick={onOpenScheduler}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 transition-colors cursor-pointer"
                title="Google Drive 자동 동기화 스케줄러 열기"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-semibold text-xs">
                  {userSettings?.autoSyncTime ? `자동 백업 ${userSettings.autoSyncTime}` : '클라우드 스케줄러'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenScheduler}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 transition-colors cursor-pointer"
                title="Google Drive 자동 동기화 스케줄러 설정"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-xs">자동 동기화 예약</span>
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2">
            {/* Auto-sync Scheduler Quick Button */}
            <button
              id="btn-open-scheduler-header"
              type="button"
              onClick={onOpenScheduler}
              className="p-2 rounded-xl bg-[#2D2622] hover:bg-[#38302B] text-stone-300 hover:text-amber-300 border border-[#3E342F] transition-colors cursor-pointer"
              title="Google Drive 자동 동기화 스케줄러 & 푸시 알림 설정"
            >
              <Clock className="w-4 h-4 text-amber-400" />
            </button>
            {/* Google Login or Profile Avatar Button */}
            {user ? (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2D2622] hover:bg-[#38302B] border border-[#3E342F] text-xs text-stone-200 cursor-pointer"
                title={`${user.name} (${user.email}) - 환경설정 열기`}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover border border-amber-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.slice(0, 1)}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-amber-200">{user.name}</span>
              </button>
            ) : (
              <button
                id="btn-google-login-header"
                type="button"
                onClick={onSignInWithGoogle || onOpenSettings}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#2D2622] hover:bg-[#38302B] text-stone-200 border border-[#3E342F] transition-colors cursor-pointer"
                title="Google 계정으로 로그인 및 드라이브 연동"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">구글 로그인</span>
              </button>
            )}

            {/* Settings Modal Button */}
            <button
              id="btn-open-settings-header"
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-[#2D2622] hover:bg-[#38302B] text-stone-300 hover:text-amber-300 border border-[#3E342F] transition-colors cursor-pointer"
              title="기관명/담당자/결재란/구글드라이브 환경설정"
            >
              <Settings className="w-4 h-4 text-stone-300" />
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              id="btn-toggle-dark-mode"
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-[#2D2622] hover:bg-[#38302B] text-stone-300 hover:text-amber-300 border border-[#3E342F] transition-colors cursor-pointer"
              title={isDark ? '라이트 모드로 전환' : '야간 업무용 다크 모드로 전환'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-300" />
              )}
            </button>

            <button
              id="header-new-consultation-btn"
              onClick={onNewConsultation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>새 상담 녹취 AI 분석</span>
            </button>
          </div>
        </div>


        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-[#38302B] pt-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-portal"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'portal'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>메인 업무 포털</span>
          </button>

          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>스마트 통합 대시보드</span>
          </button>

          <button
            id="tab-ai-studio"
            onClick={() => setActiveTab('ai-studio')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai-studio'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI 녹음·텍스트 분석실</span>
          </button>

          <button
            id="tab-forms"
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'forms'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>사례관리 7대 표준서식 작성기</span>
          </button>

          <button
            id="tab-routes"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'routes'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>방문 동선 지도 & 스케줄</span>
          </button>

          <button
            id="tab-insights"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'insights'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <LineChart className="w-4 h-4 text-teal-400" />
            <span>상담 인사이트 & 감정변화</span>
          </button>

          <button
            id="tab-clients"
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'clients'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>재가 어르신 관리 ({clientCount})</span>
          </button>

          <button
            id="tab-archive"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'archive'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <FolderCheck className="w-4 h-4 text-stone-400" />
            <span>문서 보관함 ({docCount})</span>
          </button>

          <button
            id="tab-supervision"
            onClick={() => setActiveTab('supervision')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'supervision'
                ? 'border-amber-400 text-amber-300 bg-[#2E2723]'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#2D2622]/50'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span>AI 슈퍼비전</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
