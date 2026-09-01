import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  FolderSync,
  CheckCircle2,
  ArrowRight,
  Building,
  AlertCircle,
  FileText,
  Mic,
  FileSpreadsheet,
  Activity,
  Layers,
  MapPin,
  Bot
} from 'lucide-react';
import { googleDriveService } from '../utils/googleDriveService';
import { GoogleAuthUser } from '../types';
import { CareBridgeLogo } from './CareBridgeLogo';

interface LoginPageProps {
  onLoginSuccess: (user: GoogleAuthUser, token: string, folderId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginStepStatus, setLoginStepStatus] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'forms' | 'stt' | 'cloud' | 'map'>('forms');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    setLoginStepStatus('구글 계정 인증 진행 중...');

    try {
      // 1. Initiate OAuth Token Request & User Profile fetch
      const user = await googleDriveService.initiateGoogleOAuthFlow();
      const token = googleDriveService.getAccessToken() || 'mock_google_token_' + Date.now();

      setLoginStepStatus("구글 드라이브 '케어브릿지_사례관리' 전용 폴더 검증 및 연동 중...");

      // 2. Find or Create Dedicated Folder '케어브릿지_사례관리' in user's Google Drive
      const folderId = await googleDriveService.getOrCreateAppFolder('케어브릿지_사례관리');

      setLoginStepStatus('인증 완료! 케어브릿지 스마트 포털로 이동합니다.');

      setTimeout(() => {
        onLoginSuccess(user, token, folderId);
      }, 500);
    } catch (err: any) {
      console.error('로그인 중 오류 발생:', err);
      setLoginError('구글 계정 인증 또는 드라이브 권한 연동 중 오류가 발생했습니다. 체험 모드로 즉시 입장을 시도해 보세요.');
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoggingIn(true);
    setLoginStepStatus('[체험 모드] 사례관리 전담 사회복지사 계정으로 즉시 연동합니다...');

    const mockUser: GoogleAuthUser = {
      id: 'google-user-' + Date.now(),
      email: 'leebedro1004@gmail.com',
      name: '이현정 사회복지사',
      picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: '사례관리 전담 사회복지사',
    };

    googleDriveService.signOut();
    const token = 'mock_google_token_' + Date.now();
    sessionStorage.setItem('carebridge_gdrive_token', token);
    sessionStorage.setItem('carebridge_gdrive_expiry', (Date.now() + 3600000).toString());
    sessionStorage.setItem('carebridge_gdrive_user', JSON.stringify(mockUser));

    const folderId = await googleDriveService.getOrCreateAppFolder('케어브릿지_사례관리');

    setTimeout(() => {
      onLoginSuccess(mockUser, token, folderId);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#191412] text-stone-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans select-none">
      {/* Background Decorative Ambient Radial Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Branding Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-3 border-b border-stone-800/80 z-10">
        <CareBridgeLogo size="md" showSubtitle={true} showBadge={true} badgeText="v3.5 AI Cloud" />

        <div className="flex items-center gap-2 text-xs text-stone-300 bg-stone-900/90 px-3.5 py-1.5 rounded-full border border-stone-800 shadow-xs">
          <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold tracking-tight">사회복지시설 사례관리 통합 인증 시스템</span>
        </div>
      </header>

      {/* Center Main Presentation Grid */}
      <main className="max-w-6xl mx-auto w-full my-auto py-6 sm:py-10 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side (7 Cols): Web App Description & Interactive Live Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Main Hero Slogan & Explanation */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-400/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>보건복지부 노인보건복지사업안내 10대 법정 서식 표준화</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              사회복지사를 위한 가장 진보된<br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                스마트 사례관리 & AI 녹취 솔루션
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              어르신 가정방문 초기상담부터 고정밀 AI 음성 인식(STT), 욕구사정, 10대 법정 공문서 작성, 방문 동선 분석까지 하나의 시스템에서 원스톱으로 관리합니다.
            </p>
          </div>

          {/* 🌟 Interactive Web App Preview / Mock UI Showcase */}
          <div className="bg-[#241D19]/90 border border-[#44362E] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            {/* Preview Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-stone-400 hidden sm:inline">케어브릿지 핵심 기능 미리보기</span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('forms')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'forms'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  10대 법정서식
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('stt')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'stt'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  AI 음성녹취
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('cloud')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'cloud'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  드라이브 연동
                </button>
              </div>
            </div>

            {/* Preview Dynamic Content Showcase */}
            {activePreviewTab === 'forms' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-stone-900/80 p-3 rounded-2xl border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>사정표 및 종합평가서 (김순자 어르신)</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          고위험군 (집중관리)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">보건복지부 고시 서식 자동 완성 및 HWPX/PDF 공문서 즉시 출력 지원</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    작성완료
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                    <div className="text-stone-400 text-[10px]">기본 일상생활(ADL)</div>
                    <div className="font-bold text-amber-300 mt-0.5">부분 지원 필요</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                    <div className="text-stone-400 text-[10px]">영양 및 결식위험</div>
                    <div className="font-bold text-rose-300 mt-0.5">긴급 밑반찬 지원</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                    <div className="text-stone-400 text-[10px]">주거 환경 안전</div>
                    <div className="font-bold text-amber-300 mt-0.5">욕실 안전바 시공</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'stt' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Gemini 고정밀 STT 음성 인식 & 화자 분리</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">인식 정확도 99.2%</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800/60 text-stone-300">
                      <strong className="text-amber-300">사회복지사:</strong> 어르신, 최근에 무릎 통증이나 화장실 가실 때 불편하신 점은 없으셨나요?
                    </div>
                    <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800/60 text-stone-300">
                      <strong className="text-sky-300">어르신:</strong> 비 올 때마다 무릎이 쑤셔서 밥상 차리기도 힘들고, 화장실 바닥이 미끄러워서 넘어질 뻔했어...
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-900/50">
                  <span>✨ 실시간 도출된 복지 욕구: [낙상 예방 안전손잡이], [주 3회 밑반찬 연계]</span>
                  <span className="font-bold">자동 사정표 반영</span>
                </div>
              </div>
            )}

            {activePreviewTab === 'cloud' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <FolderSync className="w-4 h-4 text-emerald-400" />
                      <span>구글 드라이브 '케어브릿지_사례관리' 전용 폴더 자동 동기화</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                      보안 암호화 전송
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-stone-300 leading-normal">
                    작성된 10대 법정 문서, 회의록, 어르신 상담 기록이 선생님의 구글 드라이브에 실시간 백업되어 영구 보존 및 타 기기 연속 작업이 가능합니다.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>개인정보 로컬/클라우드 이중 암호화</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>언제든지 PDF/HWPX 원클릭 인쇄</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4 Feature Badges Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-1.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white">10대 법정서식</div>
              <div className="text-[10px] text-stone-400">보건복지부 표준 양식</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center mb-1.5">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white">AI 음성 STT</div>
              <div className="text-[10px] text-stone-400">화자분리 대화록</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-1.5">
                <FolderSync className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white">구글 드라이브</div>
              <div className="text-[10px] text-stone-400">실시간 자동 백업</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white">방문 동선 지도</div>
              <div className="text-[10px] text-stone-400">최적 이동 경로 분석</div>
            </div>
          </div>
        </div>

        {/* Right Side (5 Cols): Google Login Box & Cloud Authorization */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-[#27201C]/95 backdrop-blur-xl border-2 border-[#4A3B32] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/70 space-y-5">
            
            {/* Box Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Lock className="w-3.5 h-3.5" />
                <span>사회복지사 보안 로그인</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                케어브릿지 시스템 접속
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                담당 사회복지사의 Google 계정으로 로그인하여 공문서 작성 및 전용 보관함 연동을 시작하세요.
              </p>
            </div>

            {/* Cloud Storage Scope Notice */}
            <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-stone-800 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <FolderSync className="w-4 h-4 text-amber-400 shrink-0" />
                <span>구글 드라이브 전용 보관함 연동</span>
              </div>
              <p className="text-stone-300 leading-normal text-[11px]">
                로그인 시 구글 드라이브에 <strong className="text-white bg-amber-950 px-1 py-0.5 rounded border border-amber-800">'케어브릿지_사례관리'</strong> 폴더가 자동 생성되며 모든 작성 서식이 안전하게 백업됩니다.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pt-1 border-t border-stone-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Google Drive API (`drive.file` Scope) 보안 표준 준수</span>
              </div>
            </div>

            {/* Main Google Login Action Button (Moved Down Prominently) */}
            <div className="space-y-3 pt-1">
              <button
                id="btn-google-login-main"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl ${
                  isLoggingIn
                    ? 'bg-stone-700 text-stone-300 cursor-not-allowed border border-stone-600'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 border-2 border-amber-300 shadow-amber-950/70 hover:scale-[1.01]'
                }`}
              >
                {/* Google Official Multi-colored SVG Logo */}
                <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5 shadow-2xs" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>

                <span>
                  {isLoggingIn ? '구글 계정 인증 및 연동 중...' : 'Google 계정으로 로그인'}
                </span>
              </button>

              {/* Status Message indicator */}
              {loginStepStatus && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{loginStepStatus}</span>
                </div>
              )}

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Entrance (Clean Single Button Fallback) */}
            <div className="pt-3 border-t border-stone-800/80">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-stone-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>체험 모드로 바로 둘러보기 (데모 입장)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            <p className="text-[10px] text-stone-400 text-center leading-relaxed">
              Google Workspace OAuth 표준 및 암호화 전송 프로토콜 적용
            </p>
          </div>
        </div>
      </main>

      {/* Footer System Notice */}
      <footer className="max-w-6xl mx-auto w-full text-center py-3 text-xs text-stone-400 border-t border-stone-800/70 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>보건복지부 재가노인지원서비스 10대 법정 서식 및 AI 기술 표준 준수</span>
        </div>
        <div className="font-mono text-[11px]">© 2026 CareBridge. All Rights Reserved.</div>
      </footer>
    </div>
  );
};
