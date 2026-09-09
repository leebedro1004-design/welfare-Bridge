import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  FolderCheck,
  ArrowRight,
  Layers,
  Sparkles,
  SearchCode,
  X,
  Database,
  Lock,
  Wifi,
  History,
  Info
} from 'lucide-react';
import { UserSettings, GoogleAuthUser, CaseDocument, ClientProfile, SyncHistoryItem } from '../types';
import { googleDriveService } from '../utils/googleDriveService';

interface CloudSyncMonitoringCardProps {
  userSettings: UserSettings;
  googleUser: GoogleAuthUser | null;
  documents?: CaseDocument[];
  clients?: ClientProfile[];
  onTriggerSync?: () => Promise<void> | void;
  isSyncing?: boolean;
  onSignInWithGoogle?: () => void;
  onOpenScheduler?: () => void;
}

export const CloudSyncMonitoringCard: React.FC<CloudSyncMonitoringCardProps> = ({
  userSettings,
  googleUser,
  documents = [],
  clients = [],
  onTriggerSync,
  isSyncing = false,
  onSignInWithGoogle,
  onOpenScheduler,
}) => {
  // Sync history state (last 5 items)
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  
  // Consistency check state
  const [isCheckingConsistency, setIsCheckingConsistency] = useState<boolean>(false);
  const [consistencyReport, setConsistencyReport] = useState<ReturnType<typeof googleDriveService.checkDataConsistency> | null>(null);
  const [showConsistencyModal, setShowConsistencyModal] = useState<boolean>(false);

  // Error Log Modal state
  const [selectedErrorLog, setSelectedErrorLog] = useState<SyncHistoryItem | null>(null);
  const [showAllLogsModal, setShowAllLogsModal] = useState<boolean>(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Local sync in-progress state (combines prop and local trigger)
  const [localSyncing, setLocalSyncing] = useState<boolean>(false);
  const isSyncActive = isSyncing || localSyncing;

  // Notification / Toast inside card
  const [cardNotice, setCardNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Load sync history on mount
  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    const list = googleDriveService.getSyncHistory();
    setSyncHistory(list);
  };

  // 1. Trigger Full Sync
  const handleExecuteSync = async () => {
    if (onTriggerSync) {
      onTriggerSync();
      setTimeout(refreshHistory, 1200);
      return;
    }

    setLocalSyncing(true);
    setCardNotice({
      type: 'info',
      message: '구글 드라이브와 전체 사례관리 데이터 동기화 작업을 시작합니다...',
    });

    try {
      const res = await googleDriveService.backupAllDataToDrive(
        documents,
        clients,
        userSettings.driveFolderName,
        'manual'
      );

      if (res.success) {
        setCardNotice({
          type: 'success',
          message: `동기화 완료: ${res.fileName} (${res.fileSize}) 저장 성공!`,
        });
        // re-run consistency check if it was checked before
        if (consistencyReport) {
          const freshReport = googleDriveService.checkDataConsistency(
            documents,
            clients,
            userSettings.driveFolderName
          );
          setConsistencyReport(freshReport);
        }
      } else {
        setCardNotice({
          type: 'warning',
          message: `동기화 실패: ${res.message}`,
        });
      }
    } catch (e: any) {
      setCardNotice({
        type: 'warning',
        message: `동기화 오류: ${e.message || '알 수 없는 네트워크 오류'}`,
      });
    } finally {
      setLocalSyncing(false);
      refreshHistory();
      setTimeout(() => setCardNotice(null), 5000);
    }
  };

  // 2. Data Consistency Check
  const handleRunConsistencyCheck = () => {
    setIsCheckingConsistency(true);
    setCardNotice({
      type: 'info',
      message: '로컬 브라우저 저장소와 구글 드라이브 간 버전 메타데이터를 정밀 대조하는 중...',
    });

    setTimeout(() => {
      const report = googleDriveService.checkDataConsistency(
        documents,
        clients,
        userSettings.driveFolderName
      );
      setConsistencyReport(report);
      setIsCheckingConsistency(false);
      setShowConsistencyModal(true);

      if (report.status === 'synced') {
        setCardNotice({
          type: 'success',
          message: '데이터 정합성 검사 완료: 로컬 저장소와 드라이브 파일 간 버전이 100% 일치합니다.',
        });
      } else if (report.status === 'mismatch') {
        setCardNotice({
          type: 'warning',
          message: `데이터 정합성 검사 결과: ${report.diffCount}건의 버전 불일치(로컬 신규 수정본)가 감지되었습니다.`,
        });
      } else {
        setCardNotice({
          type: 'info',
          message: report.summaryMessage,
        });
      }

      setTimeout(() => setCardNotice(null), 6000);
    }, 700);
  };

  // 3. Simulate Failure for Testing (Allows user/tester to test the error log viewer)
  const handleSimulateFailure = () => {
    const item = googleDriveService.simulateSyncFailure(documents, clients, userSettings.driveFolderName);
    refreshHistory();
    setCardNotice({
      type: 'warning',
      message: '동기화 실패 상황이 시뮬레이션되었습니다. 타임라인의 [로그 보기] 버튼을 확인해 보세요.',
    });
    setTimeout(() => setCardNotice(null), 5000);
  };

  const handleCopyLog = (item: SyncHistoryItem) => {
    const payload = JSON.stringify(
      {
        logId: item.id,
        timestamp: item.timestamp,
        status: item.status,
        triggerType: item.triggerType,
        folderName: item.folderName,
        message: item.message,
        docCount: item.docCount,
        clientCount: item.clientCount,
        errorDetails: item.errorDetails,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopiedLogId(item.id);
    setTimeout(() => setCopiedLogId(null), 2500);
  };

  // Display top 5 items for the timeline
  const recent5History = syncHistory.slice(0, 5);
  const latestSync = syncHistory[0];

  return (
    <div className="rounded-2xl border border-amber-300/80 dark:border-amber-700/80 bg-white dark:bg-[#221B18] shadow-sm overflow-hidden">
      {/* 1. Monitoring Card Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-b border-amber-200/80 dark:border-amber-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {/* Smoothly Rotating Cloud Icon when sync is active */}
            <div
              className={`relative p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
                isSyncActive
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-600 dark:text-amber-300 shadow-md ring-4 ring-amber-400/20'
                  : 'bg-stone-100 dark:bg-[#2B231E] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              <Cloud
                className={`w-6 h-6 transition-transform ${
                  isSyncActive
                    ? 'animate-smooth-spin text-amber-600 dark:text-amber-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
                style={isSyncActive ? { animationDuration: '3s' } : undefined}
              />
              {/* Active Sync Status Glow Indicator */}
              {isSyncActive && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  클라우드 동기화 모니터링
                </h3>
                {isSyncActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                    <span>동기화 진행 중</span>
                  </span>
                ) : googleUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>실시간 동기화 대기</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    <CloudOff className="w-3 h-3" />
                    <span>구글 연동 대기</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                로컬 저장소 서식({documents.length}건) 및 구글 드라이브 폴더 [
                <span className="font-mono font-semibold text-amber-800 dark:text-amber-300">
                  {userSettings.driveFolderName}
                </span>
                ] 간 무결성 감시 및 버전 이력
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunConsistencyCheck}
              disabled={isCheckingConsistency || isSyncActive}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="로컬 저장소와 드라이브 파일 간 버전 일치 여부를 검사합니다"
            >
              <ShieldCheck className={`w-4 h-4 ${isCheckingConsistency ? 'animate-spin text-indigo-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span>{isCheckingConsistency ? '정합성 분석 중...' : '데이터 정합성 검사'}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteSync}
              disabled={isSyncActive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSyncActive ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>동기화 활성화 중...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>지금 즉시 전체 동기화</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* In-Card Dynamic Notice Banner */}
      {cardNotice && (
        <div
          className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            cardNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : cardNotice.type === 'warning'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {cardNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : cardNotice.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{cardNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setCardNotice(null)}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Key Metrics & Status Ribbon */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#29221E] border border-stone-200 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">로컬 보관 서식</div>
            <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {documents.length} <span className="text-xs font-normal text-stone-500">건</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              ✓ 오프라인 캐시 보관됨
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#29221E] border border-stone-200 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">관리 대상자 어르신</div>
            <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {clients.length} <span className="text-xs font-normal text-stone-500">명</span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-1">
              프로필/상담DB 동기화
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#29221E] border border-stone-200 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">최근 동기화 결과</div>
            <div className="text-xs sm:text-sm font-bold truncate mt-1">
              {latestSync?.status === 'success' ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 성공 ({latestSync.timestamp.slice(11, 16)})
                </span>
              ) : latestSync?.status === 'failed' ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 실패 발생
                </span>
              ) : (
                <span className="text-stone-400">이력 없음</span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              {latestSync?.fileSize ? `용량: ${latestSync.fileSize}` : '동기화 대기 중'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#29221E] border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">정기 자동 스케줄러</div>
              <div className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>매일 {userSettings.autoSyncTime || '18:00'}</span>
              </div>
            </div>
            {onOpenScheduler && (
              <button
                type="button"
                onClick={onOpenScheduler}
                className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline font-semibold text-left mt-1 cursor-pointer"
              >
                스케줄러 설정 열기 &gt;
              </button>
            )}
          </div>
        </div>

        {/* 3. Recent 5 Sync History Timeline Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                최근 5회 동기화 이력 타임라인
              </h4>
              <span className="text-[11px] text-stone-400 font-normal">
                (실시간 오류 로그 진단 연동)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Test failure simulation button */}
              <button
                type="button"
                onClick={handleSimulateFailure}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
                title="동기화 실패 로그 테스트를 시뮬레이션합니다"
              >
                오류 모의 테스트
              </button>

              <button
                type="button"
                onClick={() => setShowAllLogsModal(true)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>로그 전체보기</span>
              </button>
            </div>
          </div>

          {/* Timeline Container */}
          {recent5History.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
              기록된 동기화 이력이 없습니다. [지금 즉시 전체 동기화]를 실행해 보세요.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
              {recent5History.map((item, index) => {
                const isSuccess = item.status === 'success';
                return (
                  <div key={item.id} className="relative group">
                    {/* Node Dot Icon */}
                    <div
                      className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#221B18] ${
                        isSuccess
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white animate-pulse'
                      }`}
                    >
                      {isSuccess ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Timeline Item Card */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        isSuccess
                          ? 'bg-stone-50/70 dark:bg-[#261E1A] border-stone-200 dark:border-stone-800/80 hover:border-stone-300'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {isSuccess ? '동기화 성공' : '동기화 실패'}
                          </span>

                          {/* Trigger Type Badge */}
                          <span className="px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-semibold">
                            {item.triggerType === 'scheduled'
                              ? '정기 스케줄'
                              : item.triggerType === 'auto_save'
                              ? '서식 자동저장'
                              : '수동 실행'}
                          </span>

                          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                            {item.timestamp}
                          </span>

                          {index === 0 && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/60">
                              최근 실행
                            </span>
                          )}
                        </div>

                        {/* Right action button on failure or details */}
                        <div className="flex items-center gap-2">
                          {!isSuccess ? (
                            <button
                              type="button"
                              onClick={() => setSelectedErrorLog(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>로그 보기</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              Drive 반영 완료
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message and details */}
                      <div className="mt-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium">
                        {item.message}
                      </div>

                      {/* Sub details: file size & counts */}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        <span>서식: {item.docCount}건</span>
                        <span>•</span>
                        <span>대상자: {item.clientCount}명</span>
                        <span>•</span>
                        <span>용량: {item.fileSize}</span>
                        {item.fileName && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]" title={item.fileName}>
                              {item.fileName}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Failure Specific Quick Diagnosis Ribbon */}
                      {!isSuccess && item.errorDetails && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-[#1E1714] border border-rose-200 dark:border-rose-900/50 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>오류 코드: {item.errorDetails.code || 'UNKNOWN_ERROR'}</span>
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                              {item.errorDetails.reason}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedErrorLog(item)}
                            className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold shrink-0 self-center cursor-pointer"
                          >
                            원인 분석 상세 &gt;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DATA CONSISTENCY CHECK RESULT MODAL / REPORT DIALOG                     */}
      {/* ========================================================================= */}
      {showConsistencyModal && consistencyReport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl border ${
                    consistencyReport.status === 'synced'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    로컬 저장소 - 구글 드라이브 데이터 정합성 진단 결과
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    검사 시각: {consistencyReport.checkedAt} • 폴더: {consistencyReport.remoteStats.folderName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConsistencyModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  consistencyReport.status === 'synced'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                {consistencyReport.status === 'synced' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {consistencyReport.status === 'synced'
                      ? '데이터 정합성 완벽 일치 (버전 무결성 확인됨)'
                      : `데이터 버전 불일치 감지 (${consistencyReport.diffCount}건의 미동기화 항목)`}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {consistencyReport.summaryMessage}
                  </p>
                  <p className="text-xs font-semibold mt-1">
                    권장 조치: {consistencyReport.recommendation}
                  </p>
                </div>
              </div>

              {/* Comparison Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Local Storage Stats */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-600" />
                      로컬 브라우저 저장소
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">
                      {consistencyReport.localStats.versionHash}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span>총 서식 건수:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {consistencyReport.localStats.docCount}건
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>대상자 어르신:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {consistencyReport.localStats.clientCount}명
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>최근 로컬 갱신:</span>
                      <span className="font-mono text-stone-700 dark:text-stone-300">
                        {consistencyReport.localStats.lastModifiedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remote Google Drive Stats */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-amber-600" />
                      Google Drive 백업본
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      {consistencyReport.remoteStats.lastBackupAt ? '백업 확인됨' : '백업 없음'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span>보관 서식 건수:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {consistencyReport.remoteStats.docCount}건
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>보관 대상자 수:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {consistencyReport.remoteStats.clientCount}명
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>최근 드라이브 백업:</span>
                      <span className="font-mono text-stone-700 dark:text-stone-300">
                        {consistencyReport.remoteStats.lastBackupAt || '기록 없음'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discrepancy Breakdown Table if any */}
              {consistencyReport.diffItems.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    세부 불일치 및 미동기화 항목 목록:
                  </div>
                  <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                    {consistencyReport.diffItems.map((diff) => (
                      <div
                        key={diff.id}
                        className="p-3 bg-white dark:bg-[#201A17] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px]">
                              {diff.type}
                            </span>
                            <span>{diff.name}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {diff.description}
                          </p>
                        </div>
                        <div className="text-right text-[10px] font-mono text-stone-400 shrink-0">
                          <div>로컬: {diff.localTime}</div>
                          {diff.remoteTime && <div>드라이브: {diff.remoteTime}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                동기화 실행 시 드라이브 백업 파일이 최신 버전으로 덮어쓰기 백업됩니다.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConsistencyModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  닫기
                </button>
                {consistencyReport.status !== 'synced' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowConsistencyModal(false);
                      handleExecuteSync();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>지금 즉시 동기화하여 버전 맞추기</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SPECIFIC ERROR LOG DETAILS MODAL (로그 보기 모달)                       */}
      {/* ========================================================================= */}
      {selectedErrorLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1916] border border-rose-300 dark:border-rose-900/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between bg-rose-50/80 dark:bg-[#2A1D1A]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      클라우드 동기화 오류 상세 진단 로그
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-bold">
                      {selectedErrorLog.errorDetails?.code || 'ERROR_UNKNOWN'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    발생 시각: {selectedErrorLog.timestamp} • 대상 폴더: {selectedErrorLog.folderName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedErrorLog(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Section 1: Concrete Cause */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>구체적인 오류 원인 (Cause Analysis)</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                  {selectedErrorLog.errorDetails?.reason || selectedErrorLog.message}
                </p>
                {selectedErrorLog.errorDetails?.details && (
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    {selectedErrorLog.errorDetails.details}
                  </p>
                )}
              </div>

              {/* Section 2: Recommended Solution Guide */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-[#28201B] space-y-2">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>권장 조치 가이드 (How to Fix)</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-semibold">
                  {selectedErrorLog.errorDetails?.suggestedFix ||
                    '구글 계정 로그인 상태를 확인하고 네트워크 방화벽 및 드라이브 저장 공간을 확인하세요.'}
                </p>
                {onSignInWithGoogle && !googleUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedErrorLog(null);
                      onSignInWithGoogle();
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold cursor-pointer hover:bg-amber-500"
                  >
                    <span>구글 계정 재로그인 실행</span>
                  </button>
                )}
              </div>

              {/* Section 3: Diagnostic Request Context */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  전송 컨텍스트 및 시스템 상태
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-stone-400">실행 유형:</span>{' '}
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {selectedErrorLog.triggerType}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">전송 시도 용량:</span>{' '}
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {selectedErrorLog.fileSize}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">서식 건수:</span>{' '}
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {selectedErrorLog.docCount}건
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">대상자 수:</span>{' '}
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {selectedErrorLog.clientCount}명
                    </span>
                  </div>
                  {selectedErrorLog.errorDetails?.endpoint && (
                    <div className="col-span-2 truncate">
                      <span className="text-stone-400">엔드포인트:</span>{' '}
                      <span className="text-stone-700 dark:text-stone-300">
                        {selectedErrorLog.errorDetails.endpoint}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Raw API Response */}
              {selectedErrorLog.errorDetails?.rawResponse && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      원시 API 응답 페이로드 (Raw JSON)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLog(selectedErrorLog)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLogId === selectedErrorLog.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>로그 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-stone-900 text-stone-200 text-[11px] font-mono overflow-x-auto max-h-40 border border-stone-800">
                    {selectedErrorLog.errorDetails.rawResponse}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
              <button
                type="button"
                onClick={() => handleCopyLog(selectedErrorLog)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLogId === selectedErrorLog.id ? '복사 완료' : '전체 로그 복사'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedErrorLog(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedErrorLog(null);
                    handleExecuteSync();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>오류 해결 후 즉시 재시도</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ALL LOGS VIEWER MODAL                                                   */}
      {/* ========================================================================= */}
      {showAllLogsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    클라우드 동기화 전체 감사 로그
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    총 {syncHistory.length}건의 동기화 및 백업 이벤트 기록
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllLogsModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {syncHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    item.status === 'success'
                      ? 'bg-stone-50/70 dark:bg-[#251E1A] border-stone-200 dark:border-stone-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.status === 'success' ? '성공' : '실패'}
                      </span>
                      <span className="font-mono text-stone-500">{item.timestamp}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {item.triggerType}
                      </span>
                    </div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">
                      {item.message}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      서식 {item.docCount}건 • {item.fileSize} • {item.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'failed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllLogsModal(false);
                          setSelectedErrorLog(item);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 cursor-pointer"
                      >
                        상세 오류 로그
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyLog(item)}
                      className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-500"
                      title="로그 복사"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50 dark:bg-[#251E1A]">
              <button
                type="button"
                onClick={() => setShowAllLogsModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
