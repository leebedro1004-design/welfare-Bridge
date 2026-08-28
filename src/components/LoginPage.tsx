import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  FolderSync,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Building,
  AlertCircle
} from 'lucide-react';
import { googleDriveService } from '../utils/googleDriveService';
import { GoogleAuthUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: GoogleAuthUser, token: string, folderId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginStepStatus, setLoginStepStatus] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

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
      setLoginError('구글 계정 인증 또는 드라이브 권한 연동 중 오류가 발생했습니다. 아래 데모 계정으로 즉시 입장을 시도해 보세요.');
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async (userEmail: string, userName: string) => {
    setIsLoggingIn(true);
    setLoginStepStatus(`[데모 로그인] ${userName} 계정으로 구글 드라이브를 연동합니다...`);

    const mockUser: GoogleAuthUser = {
      id: 'google-user-' + Date.now(),
      email: userEmail,
      name: userName,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    <div className="min-h-screen bg-[#1E1916] text-stone-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Ambient Blur Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header branding bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              <span>케어브릿지</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                CareBridge v3.5
              </span>
            </h1>
            <p className="text-xs text-stone-400">재가노인지원서비스 스마트 사회복지 사례관리 솔루션</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 bg-stone-900/80 px-3.5 py-1.5 rounded-full border border-stone-800">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>도봉재가노인지원서비스센터 통합 인증 시스템</span>
        </div>
      </header>

      {/* Center Main Login Box */}
      <main className="max-w-md mx-auto w-full my-auto py-8 z-10">
        <div className="bg-[#2B231F]/90 backdrop-blur-xl border border-[#4D3F36] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          {/* Badge & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Lock className="w-3.5 h-3.5" />
              <span>보안 구글 계정 인증 및 클라우드 동기화</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              케어브릿지 로그인
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed max-w-xs mx-auto">
              담당 사회복지사의 구글 계정으로 로그인하여 10대 법정 서식 및 AI 상담 녹취 자료를 안전하게 작성하고 내 구글 드라이브에 자동 저장하세요.
            </p>
          </div>

          {/* Drive Scope Highlight Box */}
          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 space-y-2.5 text-left text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <FolderSync className="w-4 h-4 text-amber-400 shrink-0" />
              <span>자동 구글 드라이브 연동 안내</span>
            </div>
            <p className="text-stone-300 leading-normal text-[11px]">
              로그인 완료 시, 선생님 구글 드라이브 내 <strong className="text-white bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">'케어브릿지_사례관리'</strong> 폴더가 자동 생성되며 작성한 공문서와 첨부파일이 전용 보관함으로 실시간 동기화됩니다.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-1 border-t border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Google Drive API (`drive.file` Scope) 보안 연동 규격 준수</span>
            </div>
          </div>

          {/* Main Google Login Action Button */}
          <div className="space-y-3">
            <button
              id="btn-google-login-main"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg ${
                isLoggingIn
                  ? 'bg-stone-700 text-stone-300 cursor-not-allowed border border-stone-600'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 border border-amber-400 shadow-amber-950/60 hover:scale-[1.01]'
              }`}
            >
              {/* Google Brand Colored SVG Icon */}
              <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                {isLoggingIn ? '구글 드라이브 연동 중...' : 'Google 계정으로 로그인'}
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
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}
          </div>

          {/* Preset Quick Social Worker Account Selector */}
          <div className="pt-4 border-t border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-bold text-stone-300">사례관리 전담 복지사 계정 빠른 선택:</span>
              <span>테스트 로그인 지원</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('leebedro1004@gmail.com', '이상호 사회복지사')}
                disabled={isLoggingIn}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="이상호"
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                    이상호 사회복지사
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">leebedro1004@gmail.com</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('hyejeong.lee@seniorcare.org', '이현정 선임복지사')}
                disabled={isLoggingIn}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="이현정"
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                    이현정 선임복지사
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">hyejeong.lee@seniorcare.org</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 shrink-0" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center leading-relaxed">
            서비스 이용을 위해 구글 로그인 및 <br className="hidden sm:inline" />
            구글 드라이브 파일 저장 권한이 필수로 요청됩니다.
          </p>
        </div>
      </main>

      {/* Footer System Notice */}
      <footer className="max-w-6xl mx-auto w-full text-center py-4 text-xs text-stone-500 border-t border-stone-800/60 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>보건복지부 재가노인지원서비스 10대 법정 서식 및 AI 기술 표준 준수</span>
        </div>
        <div>© 2026 CareBridge. All Rights Reserved.</div>
      </footer>
    </div>
  );
};
