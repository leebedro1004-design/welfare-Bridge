import React, { useState, useEffect } from 'react';
import {
  Clock,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellRing,
  RefreshCw,
  UploadCloud,
  ShieldCheck,
  Calendar,
  HardDrive,
  FileText,
  Users,
  X,
  Play,
  History,
  Check,
  ChevronRight,
  ExternalLink,
  Trash2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { UserSettings, GoogleAuthUser, CaseDocument, ClientProfile, SyncHistoryItem } from '../types';
import { googleDriveService } from '../utils/googleDriveService';
import confetti from 'canvas-confetti';

interface AutoSyncSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onUpdateUserSettings: (newSettings: UserSettings) => void;
  googleUser: GoogleAuthUser | null;
  onSignInWithGoogle: () => void;
  documents: CaseDocument[];
  clients: ClientProfile[];
  onTriggerSyncNow: () => Promise<void>;
  isSyncing: boolean;
  lastSyncResult?: { success: boolean; message: string; timestamp?: string } | null;
}

export const AutoSyncSchedulerModal: React.FC<AutoSyncSchedulerModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onUpdateUserSettings,
  googleUser,
  onSignInWithGoogle,
  documents,
  clients,
  onTriggerSyncNow,
  isSyncing,
  lastSyncResult,
}) => {
  const [enabled, setEnabled] = useState<boolean>(userSettings.autoSyncEnabled ?? true);
  const [syncTime, setSyncTime] = useState<string>(userSettings.autoSyncTime || '18:00');
  const [syncInterval, setSyncInterval] = useState<'daily' | 'hourly' | 'every_6_hours'>(
    userSettings.autoSyncInterval || 'daily'
  );
  const [pushEnabled, setPushEnabled] = useState<boolean>(userSettings.pushNotificationEnabled ?? true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    setSyncHistory(googleDriveService.getSyncHistory());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    const perm = await googleDriveService.requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      setToastMessage('브라우저 푸시 알림 권한이 정상적으로 허용되었습니다.');
      setPushEnabled(true);
      googleDriveService.sendBrowserPushNotification(
        '푸시 알림 연결 완료',
        '매일 정해진 시간 자동 클라우드 백업 결과를 푸시 알림으로 수신합니다.'
      );
    } else {
      setToastMessage('브라우저에서 알림 권한이 차단되었습니다. 주소창 권한 설정을 확인해 주세요.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendTestPush = () => {
    const sent = googleDriveService.sendBrowserPushNotification(
      '자동 백업 테스트 성공',
      `[정상 작동] 현재 총 ${documents.length}건 서식 및 ${clients.length}명 사례 데이터가 백업 준비 상태입니다.`
    );
    setTestNotificationSent(true);
    setToastMessage(
      sent
        ? '테스트 푸시 알림이 발송되었습니다! (화면 우측 상단/시스템 알림창 확인)'
        : '푸시 알림이 발송되었습니다. 브라우저 설정에 따라 앱 내 토스트로 표시됩니다.'
    );
    setTimeout(() => {
      setTestNotificationSent(false);
      setToastMessage(null), 4000;
    }, 4000);
  };

  const handleSaveSchedulerSettings = () => {
    const updated: UserSettings = {
      ...userSettings,
      autoSyncEnabled: enabled,
      autoSyncTime: syncTime,
      autoSyncInterval: syncInterval,
      pushNotificationEnabled: pushEnabled,
    };
    onUpdateUserSettings(updated);
    setToastMessage('자동 동기화 스케줄러 설정이 안전하게 저장되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 백업 동기화 이력 로그를 삭제하시겠습니까?')) {
      googleDriveService.clearSyncHistory();
      setSyncHistory([]);
      setToastMessage('백업 이력이 초기화되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRunManualSync = async () => {
    await onTriggerSyncNow();
    setSyncHistory(googleDriveService.getSyncHistory());
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-[#2B231F] via-[#241D19] to-[#1C1613] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-inner">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Google Drive 자동 동기화 스케줄러
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  enabled
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}>
                  {enabled ? '자동 예약 활성' : '스케줄 일시정지'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                매일 지정된 시간에 앱 내 모든 사례관리 데이터를 Google Drive에 자동 백업하고 푸시 알림을 발송합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Account & Connection Status Banner */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {googleUser?.picture ? (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full border-2 border-amber-500"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-base">
                  {googleUser?.name?.[0] || 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {googleUser ? googleUser.name : 'Google 계정 미연동'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300">
                    {googleUser ? 'Google Drive 연결됨' : '연동 필요'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  대상 폴더: <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{userSettings.driveFolderName}</span>
                </p>
              </div>
            </div>

            {!googleUser && (
              <button
                type="button"
                onClick={onSignInWithGoogle}
                className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Google 로그인 연동
              </button>
            )}
          </div>

          {/* 2. Scheduler Config Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Schedule Timing */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#221B18] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    정기 백업 시간 및 주기 설정
                  </h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  매일 백업 실행 시각
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { time: '09:00', label: '오전 09:00 (출근)' },
                    { time: '12:30', label: '낮 12:30 (점심)' },
                    { time: '18:00', label: '오후 18:00 (퇴근)' },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      disabled={!enabled}
                      onClick={() => setSyncTime(preset.time)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        syncTime === preset.time
                          ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-200'
                          : 'bg-stone-50 dark:bg-[#251E1A] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                      } ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400">직접 시간 지정:</span>
                  <input
                    type="time"
                    disabled={!enabled}
                    value={syncTime}
                    onChange={(e) => setSyncTime(e.target.value)}
                    className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#251E1A] text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Interval / Frequency */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  동기화 빈도
                </label>
                <select
                  disabled={!enabled}
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value as any)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#251E1A] text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="daily">매일 1회 정기 백업 (권장)</option>
                  <option value="every_6_hours">6시간마다 자동 점검 및 백업</option>
                  <option value="hourly">1시간마다 실시간 백업</option>
                </select>
              </div>
            </div>

            {/* Right Card: Push Notifications & Live Status */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#221B18] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    백업 성공 푸시 알림 설정
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                }`}>
                  {notificationPermission === 'granted' ? '브라우저 권한 허용됨' : '권한 확인 필요'}
                </span>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                클라우드 백업이 완료되면 성공 결과, 동기화된 서식 개수, 저장된 파일 크기를 데스크톱 푸시 및 인앱 배너로 즉시 통보합니다.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {notificationPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleRequestPushPermission}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>브라우저 푸시 알림 허용하기</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendTestPush}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>테스트 푸시 알림 발송</span>
                  </button>
                )}
              </div>

              {/* Payload Summary Quick Info */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 text-xs space-y-1">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>현재 백업 대상 서식:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{documents.length}건</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>등록 관리 어르신:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{clients.length}명</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>다음 자동 예약 시각:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {enabled ? `오늘 ${syncTime}` : '비활성'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Manual Immediate Sync Trigger CTA */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>지금 즉시 전체 클라우드 동기화 실행</span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                스케줄 시간을 기다리지 않고 지금 즉시 전체 데이터를 Google Drive에 스냅샷 백업합니다.
              </p>
            </div>
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleRunManualSync}
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '클라우드 동기화 중...' : '지금 즉시 전체 동기화'}</span>
            </button>
          </div>

          {/* 4. Sync History Logs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <History className="w-4 h-4 text-stone-500" />
                <span>최근 클라우드 동기화 및 백업 이력</span>
              </div>
              {syncHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[11px] text-stone-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>이력 초기화</span>
                </button>
              )}
            </div>

            {syncHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                아직 기록된 자동 백업 이력이 없습니다. '지금 즉시 전체 동기화'를 실행해 보세요.
              </div>
            ) : (
              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/80 max-h-48 overflow-y-auto">
                {syncHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-[#201A17] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                          {item.message}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                          <span>{item.timestamp}</span>
                          <span>•</span>
                          <span>용량: {item.fileSize}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {item.triggerType === 'scheduled' ? '정기 스케줄' : item.triggerType === 'auto_save' ? '자동 저장' : '수동 실행'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      Drive 동기화됨
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {toastMessage || '설정 저장 시 브라우저 백그라운드 스케줄러가 활성화됩니다.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveSchedulerSettings();
                setTimeout(() => onClose(), 600);
              }}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>스케줄러 설정 저장</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
