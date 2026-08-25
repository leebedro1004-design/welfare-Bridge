import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { AIStudioTranscript } from './components/AIStudioTranscript';
import { FormEditor } from './components/FormEditor';
import { ClientList } from './components/ClientList';
import { DocumentArchive } from './components/DocumentArchive';
import { SupervisionAdvisor } from './components/SupervisionAdvisor';
import { ScheduleAlertBanner } from './components/ScheduleAlertBanner';
import { ConsultationInsightsCard } from './components/ConsultationInsightsCard';
import { VisitRoutePlanner } from './components/VisitRoutePlanner';
import { DashboardManagerBar, DashboardPanelConfig } from './components/DashboardManagerBar';
import { DashboardWindow } from './components/DashboardWindow';
import { SettingsModal } from './components/SettingsModal';
import {
  BellRing,
  BrainCircuit,
  Sparkles,
  LayoutDashboard,
  FolderCheck,
  Bot,
  Users,
  MapPin,
  FileText,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { ClientProfile, CaseDocument, UserSettings, GoogleAuthUser, ConsultationInsight } from './types';
import { INITIAL_CLIENTS, INITIAL_DOCUMENTS } from './data/mockData';
import { createEmptyDocument, DOCUMENT_TYPE_LABELS } from './utils/documentTemplates';
import { googleDriveService } from './utils/googleDriveService';

const DEFAULT_USER_SETTINGS: UserSettings = {
  institutionName: '도봉재가노인지원서비스센터',
  agencyName: '도봉재가노인지원서비스센터',
  institutionRegistrationNumber: '123-82-99881',
  workerName: '이현정',
  socialWorkerName: '이현정',
  workerPosition: '선임 사회복지사',
  contactPhone: '02-998-1004',
  contactEmail: 'leebedro1004@gmail.com',
  institutionAddress: '서울특별시 도봉구 도봉로 552',
  approvalStepsCount: 3,
  approvalStepTitles: ['담당', '팀장', '센터장'],
  sealText: '도봉재가노인지원서비스센터장인',
  driveFolderName: 'CareBridge_사례관리_문서함',
  autoBackupToDrive: true,
  dashboardPanelOrder: ['routes', 'insights'],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Persistent User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('senior_care_user_settings');
    if (saved) {
      try {
        return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse user settings', e);
      }
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Google User Auth State
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser | null>(() => {
    return googleDriveService.getCurrentUser();
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBackingUpToDrive, setIsBackingUpToDrive] = useState<boolean>(false);
  const [driveToast, setDriveToast] = useState<string | null>(null);

  // Live Consultation Insights state (synced with AIStudioTranscript)
  const [liveInsights, setLiveInsights] = useState<ConsultationInsight[]>(() => {
    const saved = localStorage.getItem('senior_care_live_insights');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Dashboard Card Reordering State (Drag and Drop / Up and Down controls)
  const [dashboardOrder, setDashboardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('senior_care_dashboard_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return userSettings.dashboardPanelOrder || ['routes', 'insights'];
  });

  // Persistent Clients State
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('senior_care_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved clients', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  // Persistent Documents State
  const [documents, setDocuments] = useState<CaseDocument[]>(() => {
    const saved = localStorage.getItem('senior_care_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved documents', e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  // Active Document for Form Editor
  const [currentDocument, setCurrentDocument] = useState<CaseDocument | null>(() => {
    return documents[0] || createEmptyDocument('intake', clients[0]);
  });

  // Selected Client for new AI Studio consultation
  const [selectedClientForAI, setSelectedClientForAI] = useState<ClientProfile | null>(null);

  // Dashboard Panels Configuration & State
  const [panels, setPanels] = useState<Record<string, DashboardPanelConfig>>({
    schedule: {
      id: 'schedule',
      name: '마감·일정 알림',
      isOpen: true,
      isMinimized: false,
      icon: <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      badgeCount: 2,
    },
    routes: {
      id: 'routes',
      name: '방문 동선 지도',
      isOpen: true,
      isMinimized: false,
      icon: <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
    },
    insights: {
      id: 'insights',
      name: '상담 인사이트',
      isOpen: true,
      isMinimized: false,
      icon: <BrainCircuit className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
    },
    aiStudio: {
      id: 'aiStudio',
      name: 'AI 녹취 분석기',
      isOpen: true,
      isMinimized: false,
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />,
    },
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('senior_care_user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    localStorage.setItem('senior_care_live_insights', JSON.stringify(liveInsights));
  }, [liveInsights]);

  useEffect(() => {
    localStorage.setItem('senior_care_dashboard_order', JSON.stringify(dashboardOrder));
  }, [dashboardOrder]);

  useEffect(() => {
    localStorage.setItem('senior_care_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('senior_care_documents', JSON.stringify(documents));
  }, [documents]);

  // Handle Google OAuth Sign In
  const handleSignInWithGoogle = async () => {
    try {
      const user = await googleDriveService.initiateGoogleOAuthFlow();
      setGoogleUser(user);
      setDriveToast(`${user.name}님으로 구글 로그인 및 드라이브 연동이 완료되었습니다.`);
      setTimeout(() => setDriveToast(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert('Google 로그인 요청 중 문제가 발생했습니다: ' + (err.message || ''));
    }
  };

  // Handle Google Sign Out
  const handleSignOutGoogle = () => {
    googleDriveService.signOut();
    setGoogleUser(null);
    setDriveToast('Google 계정 로그아웃이 완료되었습니다.');
    setTimeout(() => setDriveToast(null), 3000);
  };

  // Manual Backup to Google Drive
  const handleBackupToDrive = async () => {
    setIsBackingUpToDrive(true);
    try {
      const res = await googleDriveService.backupAllDataToDrive(
        documents,
        clients,
        userSettings.driveFolderName
      );
      if (res.success) {
        setDriveToast(res.message);
      } else {
        alert('백업 실패: ' + res.message);
      }
    } catch (e: any) {
      alert('구글 드라이브 백업 중 오류: ' + (e.message || ''));
    } finally {
      setIsBackingUpToDrive(false);
      setTimeout(() => setDriveToast(null), 4000);
    }
  };

  // Save Settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (newSettings.dashboardPanelOrder) {
      setDashboardOrder(newSettings.dashboardPanelOrder);
    }
    setDriveToast('환경설정이 성공적으로 저장되었습니다.');
    setTimeout(() => setDriveToast(null), 3000);
  };

  // Dashboard Reordering Handlers
  const handleMoveDashboardCard = (cardId: string, direction: 'up' | 'down') => {
    setDashboardOrder((prev) => {
      const idx = prev.indexOf(cardId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleDragDropDashboardCard = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setDashboardOrder((prev) => {
      const sourceIdx = prev.indexOf(sourceId);
      const targetIdx = prev.indexOf(targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(sourceIdx, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
  };

  // Panel State Handlers
  const handleTogglePanelOpen = (panelId: string, open: boolean) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isOpen: open,
      },
    }));
  };

  const handleTogglePanelMinimize = (panelId: string, min: boolean) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isMinimized: min,
      },
    }));
  };

  const handleResetAllPanels = () => {
    setPanels({
      schedule: {
        id: 'schedule',
        name: '마감·일정 알림',
        isOpen: true,
        isMinimized: false,
        icon: <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        badgeCount: 2,
      },
      routes: {
        id: 'routes',
        name: '방문 동선 지도',
        isOpen: true,
        isMinimized: false,
        icon: <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
      },
      insights: {
        id: 'insights',
        name: '상담 인사이트',
        isOpen: true,
        isMinimized: false,
        icon: <BrainCircuit className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
      },
      aiStudio: {
        id: 'aiStudio',
        name: 'AI 녹취 분석기',
        isOpen: true,
        isMinimized: false,
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />,
      },
    });
  };

  // Push new insight to live feed from AIStudioTranscript
  const handlePushInsightToDashboard = (insight: ConsultationInsight) => {
    setLiveInsights((prev) => [insight, ...prev]);
  };

  // Handler: When AI generates or fills a document
  const handleGeneratedDocument = (newDoc: CaseDocument) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === newDoc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newDoc;
        return copy;
      }
      return [newDoc, ...prev];
    });

    if (newDoc.clientName && !clients.some((c) => c.name === newDoc.clientName)) {
      const autoClient: ClientProfile = {
        id: newDoc.clientId || `client-${Date.now()}`,
        name: newDoc.clientName,
        birthDate: '1945-01-01',
        age: 81,
        gender: '여',
        phone: '010-0000-0000',
        emergencyContact: {
          name: '이웃',
          relation: '이웃/통장',
          phone: '010-0000-0000',
        },
        address: '관내 재가 어르신 댁',
        livingType: '독거노인',
        welfareType: '기초생활수급자(생계/의료)',
        longTermCareStatus: '등급외 B',
        chronicDiseases: ['만성질환'],
        riskLevel: newDoc.riskLevel || '중위험',
        caseWorker: newDoc.author || userSettings.workerName || '이현정 사회복지사',
        registrationDate: new Date().toISOString().slice(0, 10),
        status: '진행중',
        latitude: 37.5665,
        longitude: 126.978,
        preferredVisitDay: '수요일',
        preferredVisitTime: '오후 2시',
      };
      setClients((prev) => [autoClient, ...prev]);
    }

    setCurrentDocument(newDoc);
    setActiveTab('forms');

    // Auto backup to Google Drive if enabled
    if (userSettings.autoBackupToDrive && googleUser) {
      googleDriveService.uploadFileToDrive(newDoc, userSettings.driveFolderName).then((res) => {
        if (res.success) {
          setDriveToast(`[구글드라이브 백업 완료]: ${newDoc.title}`);
          setTimeout(() => setDriveToast(null), 3000);
        }
      });
    }
  };

  // Handler: Save document from Editor
  const handleSaveDocument = (savedDoc: CaseDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === savedDoc.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDoc.id ? savedDoc : d));
      }
      return [savedDoc, ...prev];
    });
    setCurrentDocument(savedDoc);

    // Auto-backup to Google Drive if active
    if (userSettings.autoBackupToDrive && googleUser) {
      googleDriveService.uploadFileToDrive(savedDoc, userSettings.driveFolderName).then((res) => {
        if (res.success) {
          setDriveToast(`[구글 드라이브]: ${savedDoc.title} 자동 저장됨`);
          setTimeout(() => setDriveToast(null), 3000);
        }
      });
    }
  };

  // Handler: Add new client
  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
  };

  // Handler: Select client for AI consultation
  const handleSelectClientForConsultation = (client: ClientProfile) => {
    setSelectedClientForAI(client);
    setPanels((prev) => ({
      ...prev,
      aiStudio: { ...prev.aiStudio, isOpen: true, isMinimized: false },
    }));
    setActiveTab('ai-studio');
  };

  // Handler: Select client for Form Editor
  const handleSelectClientForForm = (client: ClientProfile) => {
    const existingDoc = documents.find((d) => d.clientId === client.id);
    if (existingDoc) {
      setCurrentDocument(existingDoc);
    } else {
      setCurrentDocument(createEmptyDocument('intake', client));
    }
    setActiveTab('forms');
  };

  // Handler: Open document from Archive
  const handleOpenDocumentFromArchive = (doc: CaseDocument) => {
    setCurrentDocument(doc);
    setActiveTab('forms');
  };

  // Handler: Delete document
  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (currentDocument?.id === docId) {
      const remaining = documents.filter((d) => d.id !== docId);
      setCurrentDocument(remaining[0] || createEmptyDocument('intake', clients[0]));
    }
  };

  // Handler: Select document from Alert Banner
  const handleSelectDocumentFromBanner = (docId: string, clientId?: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setCurrentDocument(doc);
      setActiveTab('forms');
    } else if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        handleSelectClientForForm(client);
      }
    }
  };

  // Handler: Top CTA for New Consultation
  const handleNewConsultation = () => {
    setSelectedClientForAI(null);
    setPanels((prev) => ({
      ...prev,
      aiStudio: { ...prev.aiStudio, isOpen: true, isMinimized: false },
    }));
    setActiveTab('ai-studio');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#14100E] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900 transition-colors">
      {/* Global Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientCount={clients.length}
        docCount={documents.length}
        onNewConsultation={handleNewConsultation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={googleUser}
        userSettings={userSettings}
        onSignInWithGoogle={handleSignInWithGoogle}
      />

      {/* Global Notification Toast */}
      {driveToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#251F1C] text-amber-200 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-amber-500/40 flex items-center gap-2.5 animate-slide-in">
          <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{driveToast}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: INTEGRATED SMART DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Window Manager Bar */}
            <DashboardManagerBar
              panels={panels}
              onTogglePanelOpen={handleTogglePanelOpen}
              onTogglePanelMinimize={handleTogglePanelMinimize}
              onResetAllPanels={handleResetAllPanels}
              todayCount={2}
            />

            {/* Panel 1: Schedule & Deadline Alerts */}
            {panels.schedule?.isOpen && (
              <ScheduleAlertBanner
                documents={documents}
                clients={clients}
                onSelectClient={handleSelectClientForConsultation}
                onSelectDocument={handleSelectDocumentFromBanner}
                isOpen={panels.schedule.isOpen}
                onClose={() => handleTogglePanelOpen('schedule', false)}
              />
            )}

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                  <span>총 등록 어르신</span>
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  {clients.length} <span className="text-xs font-normal text-stone-500">명</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                  <span>작성 사례 서식</span>
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  {documents.length} <span className="text-xs font-normal text-stone-500">건</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                  <span>고위험 집중관리</span>
                  <BellRing className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  {clients.filter((c) => c.riskLevel.includes('고')).length} <span className="text-xs font-normal text-stone-500">명</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                  <span>이번 주 방문 예정</span>
                  <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                  4 <span className="text-xs font-normal text-stone-500">가구</span>
                </div>
              </div>
            </div>

            {/* Custom Reorderable Dashboard Panels Container */}
            <div className="space-y-6">
              {dashboardOrder.map((panelKey, idx) => {
                const canMoveUp = idx > 0;
                const canMoveDown = idx < dashboardOrder.length - 1;

                if (panelKey === 'routes' && panels.routes?.isOpen) {
                  return (
                    <DashboardWindow
                      key="routes"
                      id="routes"
                      title="어르신 댁 방문 상담 동선 최적화 & 스마트 지도 뷰"
                      subtitle="위기도 및 실시간 지리적 인접성을 고려한 최적 경로 스케줄러"
                      icon={<MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                      badge={
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                          실시간 위치 연동
                        </span>
                      }
                      isOpen={panels.routes.isOpen}
                      isMinimized={panels.routes.isMinimized}
                      onToggleOpen={(open) => handleTogglePanelOpen('routes', open)}
                      onToggleMinimize={(min) => handleTogglePanelMinimize('routes', min)}
                      accentColor="rose"
                      isDraggable={true}
                      onMoveUp={() => handleMoveDashboardCard('routes', 'up')}
                      onMoveDown={() => handleMoveDashboardCard('routes', 'down')}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', 'routes')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const source = e.dataTransfer.getData('text/plain');
                        if (source) handleDragDropDashboardCard(source, 'routes');
                      }}
                    >
                      <VisitRoutePlanner
                        clients={clients}
                        onSelectClientForConsultation={handleSelectClientForConsultation}
                      />
                    </DashboardWindow>
                  );
                }

                if (panelKey === 'insights' && panels.insights?.isOpen) {
                  return (
                    <ConsultationInsightsCard
                      key="insights"
                      clients={clients}
                      documents={documents}
                      customInsights={liveInsights}
                      isOpen={panels.insights.isOpen}
                      isMinimized={panels.insights.isMinimized}
                      onToggleOpen={(open) => handleTogglePanelOpen('insights', open)}
                      onToggleMinimize={(min) => handleTogglePanelMinimize('insights', min)}
                      isDraggable={true}
                      onMoveUp={() => handleMoveDashboardCard('insights', 'up')}
                      onMoveDown={() => handleMoveDashboardCard('insights', 'down')}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', 'insights')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const source = e.dataTransfer.getData('text/plain');
                        if (source) handleDragDropDashboardCard(source, 'insights');
                      }}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI TRANSCRIPT STUDIO */}
        {activeTab === 'ai-studio' && (
          <div className="space-y-6">
            <DashboardManagerBar
              panels={panels}
              onTogglePanelOpen={handleTogglePanelOpen}
              onTogglePanelMinimize={handleTogglePanelMinimize}
              onResetAllPanels={handleResetAllPanels}
              todayCount={2}
            />

            {panels.schedule?.isOpen && (
              <ScheduleAlertBanner
                documents={documents}
                clients={clients}
                onSelectClient={handleSelectClientForConsultation}
                onSelectDocument={handleSelectDocumentFromBanner}
                isOpen={panels.schedule.isOpen}
                onClose={() => handleTogglePanelOpen('schedule', false)}
              />
            )}

            {panels.aiStudio?.isOpen ? (
              <AIStudioTranscript
                clients={clients}
                onGenerateDocument={handleGeneratedDocument}
                selectedClient={selectedClientForAI}
                onPushInsightToDashboard={handlePushInsightToDashboard}
              />
            ) : (
              <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      AI 상담 녹취 분석 창이 닫혀 있습니다.
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      음성 녹음 파일이나 텍스트를 분석하여 표준 서식을 자동 작성하려면 창을 열어주세요.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePanelOpen('aiStudio', true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  창 열기
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CASE MANAGEMENT FORMS */}
        {activeTab === 'forms' && (
          <FormEditor
            currentDocument={currentDocument}
            clients={clients}
            userSettings={userSettings}
            onSaveDocument={handleSaveDocument}
          />
        )}

        {/* TAB 4: VISIT ROUTE MAP */}
        {activeTab === 'routes' && (
          <VisitRoutePlanner
            clients={clients}
            onSelectClientForConsultation={handleSelectClientForConsultation}
          />
        )}

        {/* TAB 5: CONSULTATION INSIGHTS */}
        {activeTab === 'insights' && (
          <ConsultationInsightsCard
            clients={clients}
            documents={documents}
            customInsights={liveInsights}
            isOpen={true}
          />
        )}

        {/* TAB 6: CLIENTS MANAGEMENT */}
        {activeTab === 'clients' && (
          <ClientList
            clients={clients}
            onAddClient={handleAddClient}
            onSelectClientForConsultation={handleSelectClientForConsultation}
            onSelectClientForForm={handleSelectClientForForm}
          />
        )}

        {/* TAB 7: ARCHIVE */}
        {activeTab === 'archive' && (
          <DocumentArchive
            documents={documents}
            onOpenDocument={handleOpenDocumentFromArchive}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {/* TAB 8: SUPERVISION */}
        {activeTab === 'supervision' && (
          <SupervisionAdvisor clients={clients} />
        )}
      </main>

      {/* Global Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSaveSettings={handleSaveSettings}
        user={googleUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onBackupToDrive={handleBackupToDrive}
        isBackingUp={isBackingUpToDrive}
      />

      {/* Footer */}
      <footer className="bg-[#231E1B] border-t border-[#38302B] text-stone-400 text-xs py-4 print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-200">케어브릿지 (CareBridge)</span>
            <span className="text-stone-500">|</span>
            <span>{userSettings.institutionName || '재가노인지원서비스 스마트 사례관리 AI 시스템'}</span>
          </div>
          <div className="text-stone-400">
            보건복지부 노인보건복지사업안내 표준 7대 서식 준수 • Gemini 3.7 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}

