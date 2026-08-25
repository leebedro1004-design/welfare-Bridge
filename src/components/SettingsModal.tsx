import React, { useState } from 'react';
import {
  Settings,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  Save,
  X,
  ShieldCheck,
  Cloud,
  Layers,
  Sparkles,
  RefreshCw,
  FolderDown,
  UploadCloud,
  FileCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import { UserSettings, GoogleAuthUser } from '../types';
import { googleDriveService } from '../utils/googleDriveService';
import confetti from 'canvas-confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  user: GoogleAuthUser | null;
  onSignInWithGoogle: () => void;
  onSignOutGoogle: () => void;
  onBackupToDrive?: () => void;
  isBackingUp?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  user,
  onSignInWithGoogle,
  onSignOutGoogle,
  onBackupToDrive,
  isBackingUp = false,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'approval' | 'gdrive' | 'dashboard'>('general');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStepCountChange = (count: 2 | 3 | 4) => {
    let titles = form.approvalStepTitles;
    if (count === 2) titles = ['담당', '센터장'];
    else if (count === 3) titles = ['담당', '선임/팀장', '센터장'];
    else if (count === 4) titles = ['담당', '선임', '부장', '관장'];

    setForm({
      ...form,
      approvalStepsCount: count,
      approvalStepTitles: titles,
    });
  };

  const handleTitleChange = (index: number, val: string) => {
    const updated = [...form.approvalStepTitles];
    updated[index] = val;
    setForm({ ...form, approvalStepTitles: updated });
  };

  const handleSave = () => {
    onSaveSettings(form);
    setSaveSuccess(true);
    try {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
    } catch (e) {}
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                환경설정 & 사용자 기관 관리
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                기관명, 담당자 정보, 결재란 직함, 구글 드라이브 동기화를 설정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-[#221B18] px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300 font-bold bg-white dark:bg-[#1E1916] rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>기관 및 담당자 정보</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approval')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'approval'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300 font-bold bg-white dark:bg-[#1E1916] rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>공식 서식 결재란 설정</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gdrive')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gdrive'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300 font-bold bg-white dark:bg-[#1E1916] rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>구글 계정 & 드라이브 연동</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-stone-800 dark:text-stone-200">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    소속 기관명 (공식 공문서/서식 상단 표기)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={form.institutionName}
                      onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      placeholder="예: (사)굿실버복지회 굿실버재가노인지원서비스센터"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    기관 고유번호 / 사업자번호
                  </label>
                  <input
                    type="text"
                    value={form.institutionRegistrationNumber || ''}
                    onChange={(e) => setForm({ ...form, institutionRegistrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 104-82-99281"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    담당 사회복지사 성명
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={form.workerName}
                      onChange={(e) => setForm({ ...form, workerName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      placeholder="예: 이상호"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    직급 / 직책
                  </label>
                  <input
                    type="text"
                    value={form.workerPosition}
                    onChange={(e) => setForm({ ...form, workerPosition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 선임사회복지사 / 사례관리팀장"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    기관 대표 전화번호
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs focus:ring-2 focus:ring-amber-500"
                      placeholder="예: 02-984-7711"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    담당자 이메일
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs focus:ring-2 focus:ring-amber-500"
                      placeholder="예: leebedro1004@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  기관 소재지 주소
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={form.institutionAddress}
                    onChange={(e) => setForm({ ...form, institutionAddress: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 서울특별시 강북구 삼양로 114길 28 (수유동)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Approval Box Settings */}
          {activeTab === 'approval' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  서식 결재란 단계 구성
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 2, label: '2단 결재', desc: '담당자 - 센터장/시설장' },
                    { count: 3, label: '3단 결재 (표준)', desc: '담당자 - 선임/팀장 - 센터장' },
                    { count: 4, label: '4단 결재', desc: '담당 - 선임 - 부장 - 관장' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => handleStepCountChange(item.count as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        form.approvalStepsCount === item.count
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A] hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  결재 직함명 세부 커스텀
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {form.approvalStepTitles.map((title, idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                        {idx + 1}단계 직함
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs font-bold text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  전자 직인/서명 표시 텍스트
                </label>
                <input
                  type="text"
                  value={form.sealText}
                  onChange={(e) => setForm({ ...form, sealText: e.target.value })}
                  className="w-32 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs font-bold text-center"
                  placeholder="예: (인) 또는 (서명)"
                />
              </div>

              {/* Approval Box Live Preview */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-300 dark:border-stone-700 space-y-2">
                <div className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  실제 서식 결재란 미리보기:
                </div>
                <div className="inline-block border border-stone-400 dark:border-stone-600 text-xs rounded overflow-hidden shadow-xs">
                  <div
                    className="grid bg-stone-200 dark:bg-[#2F2722] text-center font-bold border-b border-stone-300 dark:border-stone-700"
                    style={{ gridTemplateColumns: `36px repeat(${form.approvalStepsCount}, 72px)` }}
                  >
                    <div className="p-1 border-r border-stone-300 dark:border-stone-700 flex items-center justify-center bg-stone-300 dark:bg-[#382F2A]">
                      결<br />재
                    </div>
                    {form.approvalStepTitles.map((t, i) => (
                      <div
                        key={i}
                        className={`p-1.5 text-[11px] ${
                          i < form.approvalStepsCount - 1 ? 'border-r border-stone-300 dark:border-stone-700' : ''
                        }`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                  <div
                    className="grid text-center h-12 bg-white dark:bg-[#1E1916]"
                    style={{ gridTemplateColumns: `36px repeat(${form.approvalStepsCount}, 72px)` }}
                  >
                    <div className="border-r border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#251E1A]"></div>
                    <div className="border-r border-stone-300 dark:border-stone-700 flex items-center justify-center p-1 font-semibold text-stone-800 dark:text-stone-200 text-xs">
                      {form.workerName}
                      <span className="text-[9px] text-emerald-600 ml-0.5">{form.sealText}</span>
                    </div>
                    {form.approvalStepTitles.slice(1).map((_, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-center p-1 text-stone-400 text-xs ${
                          i < form.approvalStepsCount - 2 ? 'border-r border-stone-300 dark:border-stone-700' : ''
                        }`}
                      >
                        {form.sealText}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Google Account & Drive Sync */}
          {activeTab === 'gdrive' && (
            <div className="space-y-5">
              {/* Logged in Google User Card */}
              <div className="p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/80 dark:bg-[#251E1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-amber-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-lg">
                      {user?.name?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {user ? user.name : '구글 미연결 상태'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/60">
                        {user ? '구글 계정 연동됨' : '로그인 필요'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {user ? user.email : '구글 계정으로 로그인하여 나만의 자료를 구글 드라이브에 안전하게 보관하세요.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={onSignOutGoogle}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>로그아웃</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onSignInWithGoogle}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>구글 계정으로 로그인</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Google Drive Folder Configuration */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    구글 드라이브 전용 저장 폴더명
                  </label>
                  <input
                    type="text"
                    value={form.driveFolderName}
                    onChange={(e) => setForm({ ...form, driveFolderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 재가노인지원서비스_사례관리_자료실"
                  />
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                    사례관리 문서, 상담 녹취록, 어르신 프로필이 이 구글 드라이브 폴더에 자동 동기화됩니다.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A]">
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      서식 저장 시 구글 드라이브 자동 백업
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      사회복지사가 서식을 저장할 때마다 실시간으로 구글 드라이브에 안전하게 동기화합니다.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoBackupToDrive}
                    onChange={(e) => setForm({ ...form, autoBackupToDrive: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>

                {onBackupToDrive && (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isBackingUp}
                      onClick={onBackupToDrive}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold hover:bg-teal-100 transition-colors cursor-pointer text-xs disabled:opacity-60"
                    >
                      {isBackingUp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                          <span>구글 드라이브 동기화 진행 중...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>현재 전체 사례관리 데이터 구글 드라이브에 즉시 백업</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {saveSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 환경설정이 성공적으로 저장되었습니다!
              </span>
            ) : (
              '설정 변경 사항은 모든 10대 표준서식과 결재란에 즉시 반영됩니다.'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>설정 저장하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
