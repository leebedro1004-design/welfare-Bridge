import React, { useState, useEffect, useRef } from 'react';
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
  FileSpreadsheet,
  Mic,
  MicOff,
  Radio,
  Volume2,
  HelpCircle,
  X
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
  onReopenTutorial?: () => void;
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
  onReopenTutorial,
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

  // ==========================================
  // AI Voice Command Navigation Feature
  // ==========================================
  const [isVoiceCommandActive, setIsVoiceCommandActive] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [liveSpokenText, setLiveSpokenText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isVoiceActiveRef = useRef<boolean>(false);

  useEffect(() => {
    isVoiceActiveRef.current = isVoiceCommandActive;
  }, [isVoiceCommandActive]);

  const executeVoiceCommand = (phrase: string) => {
    const text = phrase.toLowerCase().trim();
    if (!text) return;
    setLiveSpokenText(phrase);

    // 1. Open dashboard
    if (
      text.includes('open dashboard') ||
      text.includes('dashboard') ||
      text.includes('대시보드') ||
      text.includes('홈') ||
      text.includes('나의업무') ||
      text.includes('나의 업무')
    ) {
      setActiveTab('portal');
      setVoiceFeedback('✅ 명령 실행: "Open dashboard" ➔ 나의업무 대시보드로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 2. Add new client
    if (
      text.includes('add new client') ||
      text.includes('new client') ||
      text.includes('add client') ||
      text.includes('신규 등록') ||
      text.includes('신규 어르신') ||
      text.includes('어르신 등록') ||
      text.includes('새 대상자') ||
      text.includes('대상자 등록')
    ) {
      if (onOpenNewClientModal) {
        onOpenNewClientModal();
        setVoiceFeedback('✅ 명령 실행: "Add new client" ➔ 신규 어르신 등록 창을 열었습니다');
      } else {
        setActiveTab('clients');
        setVoiceFeedback('✅ 명령 실행: "Add new client" ➔ 대상자 관리 화면으로 이동했습니다');
      }
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 3. Open consultation / start consultation
    if (
      text.includes('open consultation') ||
      text.includes('start consultation') ||
      text.includes('consultation') ||
      text.includes('상담 시작') ||
      text.includes('녹취') ||
      text.includes('녹취실') ||
      text.includes('ai 녹취')
    ) {
      setActiveTab('ai-studio');
      setVoiceFeedback('✅ 명령 실행: "Open consultation" ➔ AI 녹취·상담실로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 4. Open forms
    if (
      text.includes('open forms') ||
      text.includes('forms') ||
      text.includes('서식') ||
      text.includes('법정 서식') ||
      text.includes('10대 서식')
    ) {
      setActiveTab('forms');
      setVoiceFeedback('✅ 명령 실행: "Open forms" ➔ 10대 법정서식 화면으로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 5. Open clients
    if (
      text.includes('open clients') ||
      text.includes('clients') ||
      text.includes('대상자 관리') ||
      text.includes('어르신 명부') ||
      text.includes('명부')
    ) {
      setActiveTab('clients');
      setVoiceFeedback('✅ 명령 실행: "Open clients" ➔ 대상자 관리 명부로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 6. Open documents / archive
    if (
      text.includes('open documents') ||
      text.includes('open archive') ||
      text.includes('documents') ||
      text.includes('archive') ||
      text.includes('문서보관함') ||
      text.includes('보관함')
    ) {
      setActiveTab('archive');
      setVoiceFeedback('✅ 명령 실행: "Open documents" ➔ 문서보관함으로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 7. Open routes
    if (
      text.includes('open routes') ||
      text.includes('routes') ||
      text.includes('방문 동선') ||
      text.includes('동선') ||
      text.includes('일정')
    ) {
      setActiveTab('routes');
      setVoiceFeedback('✅ 명령 실행: "Open routes" ➔ 방문동선·일정으로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 8. Open insights
    if (
      text.includes('open insights') ||
      text.includes('insights') ||
      text.includes('위험도') ||
      text.includes('인사이트')
    ) {
      setActiveTab('insights');
      setVoiceFeedback('✅ 명령 실행: "Open insights" ➔ 위험도·인사이트로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }

    // 9. Open summary report
    if (
      text.includes('open summary') ||
      text.includes('summary report') ||
      text.includes('종합보고서') ||
      text.includes('보고서')
    ) {
      setActiveTab('summary-report');
      setVoiceFeedback('✅ 명령 실행: "Open summary report" ➔ 어르신 종합보고서로 이동했습니다');
      setTimeout(() => setVoiceFeedback(null), 4500);
      return;
    }
  };

  useEffect(() => {
    if (!isVoiceCommandActive) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'ko-KR';

      recog.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const phrase = event.results[i][0].transcript;
          if (phrase) {
            setLiveSpokenText(phrase);
            executeVoiceCommand(phrase);
          }
        }
      };

      recog.onerror = (err: any) => {
        console.warn('Voice command recognition notification:', err?.error || err);
        if (err.error === 'not-allowed') {
          setVoiceFeedback('⚠️ 마이크 사용 권한이 필요합니다. 브라우저에서 마이크를 허용해 주세요.');
        }
      };

      recog.onend = () => {
        if (isVoiceActiveRef.current) {
          try {
            recog.start();
          } catch (e) {}
        }
      };

      try {
        recog.start();
        recognitionRef.current = recog;
        setVoiceFeedback('🎙️ AI 음성 명령 수신 중: "Open dashboard", "Add new client" 등을 말씀하세요.');
      } catch (e) {
        console.error('Failed to start voice command recognition', e);
      }
    } else {
      setVoiceFeedback('🎙️ Web Speech API 미지원 브라우저: 아래 테스트 버튼으로 음성 명령을 시뮬레이션할 수 있습니다.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isVoiceCommandActive]);

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

            {/* Help Guide Reopen Button (도움말 가이드 다시 보기) */}
            {onReopenTutorial && (
              <button
                id="btn-reopen-tutorial"
                type="button"
                onClick={onReopenTutorial}
                className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 font-bold text-[10px] transition-colors cursor-pointer"
                title="처음 사용자를 위한 5일 튜토리얼 & 실습 가이드 다시 보기"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">도움말 가이드</span>
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
            {/* 🎤 Voice Command Toggle Button */}
            <button
              id="header-voice-command-toggle"
              type="button"
              onClick={() => setIsVoiceCommandActive((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-xs transition-all cursor-pointer hover:scale-[1.02] ${
                isVoiceCommandActive
                  ? 'bg-rose-900/90 text-rose-100 border-rose-500 ring-2 ring-rose-500/60 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600 hover:text-white'
              }`}
              title="AI 음성 내비게이션 명령 토글 ('Open dashboard', 'Add new client' 등)"
            >
              {isVoiceCommandActive ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-rose-300 animate-bounce" />
                  <span>Voice Command ON</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-stone-400" />
                  <span>Voice Command</span>
                </>
              )}
            </button>

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

      {/* 3. AI Voice Command Live Listening Status Banner */}
      {isVoiceCommandActive && (
        <div className="bg-[#1b1411] border-t border-b border-rose-900/60 px-4 py-2 text-xs transition-all shadow-inner">
          <div className="max-w-full mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="font-bold text-rose-300 flex items-center gap-1.5 shrink-0">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Voice Command 수신 대기 중:
              </span>
              <span className="text-stone-300 truncate max-w-md">
                {voiceFeedback || '말씀해 보세요: "Open dashboard", "Add new client", "Open archive"...'}
              </span>
              {liveSpokenText && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-[11px] border border-stone-700">
                  인식 발화: "{liveSpokenText}"
                </span>
              )}
            </div>

            {/* Quick Test Chips & Close */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="hidden lg:inline text-[11px] text-stone-400">클릭하여 명령 시뮬레이션:</span>
              <button
                type="button"
                onClick={() => executeVoiceCommand('open dashboard')}
                className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-[11px] cursor-pointer"
                title="'Open dashboard' 명령 시뮬레이션"
              >
                📢 "Open dashboard"
              </button>
              <button
                type="button"
                onClick={() => executeVoiceCommand('add new client')}
                className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-[11px] cursor-pointer"
                title="'Add new client' 명령 시뮬레이션"
              >
                📢 "Add new client"
              </button>
              <button
                type="button"
                onClick={() => executeVoiceCommand('open archive')}
                className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[11px] cursor-pointer hidden md:inline-block"
                title="'Open archive' 명령 시뮬레이션"
              >
                📢 "Open archive"
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceCommandActive(false)}
                className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer ml-1"
                title="Voice Command 끄기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
