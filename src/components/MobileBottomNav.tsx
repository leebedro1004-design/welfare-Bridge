import React, { useState } from 'react';
import {
  Home,
  Users,
  Sparkles,
  FileText,
  Menu,
  X,
  UserPlus,
  Zap,
  MapPin,
  LineChart,
  FolderCheck,
  Bot,
  Settings,
  Cloud,
  Moon,
  Sun,
  LayoutDashboard,
  HeartHandshake,
  ChevronRight,
  LogOut,
  Building,
  Headphones,
  FileSpreadsheet
} from 'lucide-react';
import { AppTab } from './Header';
import { GoogleAuthUser, UserSettings } from '../types';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  onNewConsultation: () => void;
  onOpenNewClientModal: () => void;
  onOpenMajorFormsModal: () => void;
  onOpenSettings: () => void;
  onOpenScheduler: () => void;
  user?: GoogleAuthUser | null;
  userSettings?: UserSettings;
  clientsCount: number;
  docsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onNewConsultation,
  onOpenNewClientModal,
  onOpenMajorFormsModal,
  onOpenSettings,
  onOpenScheduler,
  user,
  userSettings,
  clientsCount,
  docsCount,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('carebridge_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('carebridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('carebridge_theme', 'light');
    }
  };

  const handleSelectTab = (tab: AppTab) => {
    onNavigateTab(tab);
    setIsMoreMenuOpen(false);
  };

  const workerName = userSettings?.socialWorkerName || userSettings?.workerName || '이현정';
  const agencyName = userSettings?.agencyName || userSettings?.institutionName || '도봉재가노인지원서비스센터';

  return (
    <>
      {/* 1. MOBILE BOTTOM ACTION SHEET / MORE DRAWER */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="flex-1 w-full"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          <div className="bg-[#241E1B] text-stone-100 rounded-t-3xl border-t-2 border-amber-600/40 p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between border-b border-stone-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">스마트 사례관리 전체 메뉴</h4>
                  <p className="text-[11px] text-stone-400">{agencyName} · {workerName} 복지사</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Hero Actions (신규 등록 & 주요 서식) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenNewClientModal();
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-xs flex flex-col items-start justify-between gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all text-left"
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-[10px] text-amber-200">원클릭 신규</span>
                  <span className="text-xs font-black">신규 어르신 등록</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenMajorFormsModal();
                }}
                className="p-3.5 rounded-2xl bg-[#342A24] border border-emerald-500/40 text-stone-100 font-bold text-xs flex flex-col items-start justify-between gap-2 shadow-md hover:bg-[#3D312A] active:scale-95 transition-all text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-300">사례회의록·계획서</span>
                  <span className="text-xs font-black text-emerald-100">주요 법정서식 퀵</span>
                </div>
              </button>
            </div>

            {/* Extended Tab Navigations */}
            <div className="space-y-1 bg-[#1C1715] rounded-2xl p-2 border border-stone-800">
              <span className="text-[10px] font-bold text-stone-400 px-2 py-1 block uppercase">
                업무 모듈 바로가기
              </span>

              <button
                type="button"
                onClick={() => handleSelectTab('summary-report')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'summary-report' ? 'bg-purple-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>어르신 사례관리 종합 이력 보고서</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-950 px-1.5 py-0.5 rounded text-purple-300">
                  NEW
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('routes')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'routes' ? 'bg-rose-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>방문동선 지도 & 일정 플래너</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('insights')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'insights' ? 'bg-teal-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LineChart className="w-4 h-4 text-teal-400" />
                  <span>위험도 통계 & SGDS-K 우울 추이</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('archive')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'archive' ? 'bg-stone-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderCheck className="w-4 h-4 text-stone-400" />
                  <span>완료 문서보관함 & 인쇄 대장</span>
                </div>
                <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                  {docsCount}건
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('supervision')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'supervision' ? 'bg-purple-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI 수퍼비전 자문실</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>통합 위젯 대시보드</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Utility & Settings Controls */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-700/60">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenSettings();
                }}
                className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Settings className="w-4 h-4 text-stone-400" />
                <span>환경설정</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenScheduler();
                }}
                className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>드라이브 동기화</span>
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-300" />}
                <span>{isDark ? '라이트 모드' : '다크 모드'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="모바일 하단 내비게이션"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1D1815]/95 backdrop-blur-md border-t border-[#38302B] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)] select-none safe-area-bottom"
      >
        {/* 1. 홈 (나의업무) */}
        <button
          type="button"
          onClick={() => handleSelectTab('portal')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            activeTab === 'portal' || activeTab === 'dashboard'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {(activeTab === 'portal' || activeTab === 'dashboard') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">홈</span>
        </button>

        {/* 2. 대상자 관리 */}
        <button
          type="button"
          onClick={() => handleSelectTab('clients')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            activeTab === 'clients' ? 'text-blue-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {clientsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white font-mono text-[9px] px-1 rounded-full">
                {clientsCount}
              </span>
            )}
            {activeTab === 'clients' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">어르신</span>
        </button>

        {/* 3. AI 녹취 (CENTER HIGHLIGHTED TAB) */}
        <button
          type="button"
          onClick={() => {
            handleSelectTab('ai-studio');
            onNewConsultation();
          }}
          className="flex flex-col items-center justify-center flex-1 -mt-4 py-1 px-1 cursor-pointer min-h-[56px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 group-hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-amber-950/80 border-2 border-amber-300 transition-transform">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-amber-300 mt-0.5 tracking-tight">AI 녹취</span>
        </button>

        {/* 4. 10대 법정서식 */}
        <button
          type="button"
          onClick={() => handleSelectTab('forms')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            activeTab === 'forms' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5" />
            {docsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-600 text-white font-mono text-[9px] px-1 rounded-full">
                {docsCount}
              </span>
            )}
            {activeTab === 'forms' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">법정서식</span>
        </button>

        {/* 5. 전체 메뉴 / 더보기 */}
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            isMoreMenuOpen ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">전체메뉴</span>
        </button>
      </nav>
    </>
  );
};
