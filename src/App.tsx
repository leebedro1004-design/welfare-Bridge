import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { SubNavSidebar } from './components/SubNavSidebar';
import { WorkspaceTabBar, OpenWorkspaceTab } from './components/WorkspaceTabBar';
import { MainPortalHub } from './components/MainPortalHub';
import { AIStudioTranscript } from './components/AIStudioTranscript';
import { FormEditor } from './components/FormEditor';
import { ClientList } from './components/ClientList';
import { DocumentArchive } from './components/DocumentArchive';
import { SupervisionAdvisor } from './components/SupervisionAdvisor';
import { ScheduleAlertBanner } from './components/ScheduleAlertBanner';
import { ConsultationInsightsCard } from './components/ConsultationInsightsCard';
import { VisitRoutePlanner } from './components/VisitRoutePlanner';
import { RiskDiagnosticCard } from './components/RiskDiagnosticCard';
import { DashboardManagerBar, DashboardPanelConfig } from './components/DashboardManagerBar';
import { DashboardWindow } from './components/DashboardWindow';
import { SettingsModal } from './components/SettingsModal';
import { AutoSyncSchedulerModal } from './components/AutoSyncSchedulerModal';
import { NewClientModal } from './components/NewClientModal';
import { MajorFormsQuickModal } from './components/MajorFormsQuickModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SummaryReportView } from './components/SummaryReportView';
import { LoginPage } from './components/LoginPage';
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
  CheckCircle2,
  Clock,
  ShieldAlert,
  Home,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { ClientProfile, CaseDocument, UserSettings, GoogleAuthUser, ConsultationInsight, DocumentType } from './types';
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
  dashboardPanelOrder: ['riskDiagnostic', 'routes', 'insights'],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('portal');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // MDI Workspace Open Tabs state
  const [openTabs, setOpenTabs] = useState<OpenWorkspaceTab[]>([
    {
      id: 'tab-portal',
      tab: 'portal',
      title: '나의업무 (홈)',
      icon: <Home className="w-3.5 h-3.5 text-amber-500" />,
      closable: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-portal');

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

  // Google User Auth & Drive Folder State
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser | null>(() => {
    return googleDriveService.getCurrentUser();
  });
  const [driveToken, setDriveToken] = useState<string | null>(() => {
    return googleDriveService.getAccessToken();
  });
  const [folderId, setFolderId] = useState<string | null>(() => {
    return sessionStorage.getItem('carebridge_gdrive_folder_id');
  });

  const handleLoginSuccess = (user: GoogleAuthUser, token: string, createdFolderId: string) => {
    setGoogleUser(user);
    setDriveToken(token);
    setFolderId(createdFolderId);
    sessionStorage.setItem('carebridge_gdrive_folder_id', createdFolderId);
    setDriveToast(`[구글 인증 완료] '${user.name}' 계정 및 구글 드라이브 '케어브릿지_사례관리' 폴더가 연동되었습니다.`);
    setTimeout(() => setDriveToast(null), 4000);
  };

  const handleLogout = () => {
    googleDriveService.signOut();
    setGoogleUser(null);
    setDriveToken(null);
    setFolderId(null);
    sessionStorage.removeItem('carebridge_gdrive_folder_id');
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [isMajorFormsModalOpen, setIsMajorFormsModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isBackingUpToDrive, setIsBackingUpToDrive] = useState<boolean>(false);
  const [driveToast, setDriveToast] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);

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

  // Dashboard Card Reordering State
  const [dashboardOrder, setDashboardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('senior_care_dashboard_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return userSettings.dashboardPanelOrder || ['riskDiagnostic', 'routes', 'insights'];
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
    riskDiagnostic: {
      id: 'riskDiagnostic',
      name: '위험도 AI 진단서',
      isOpen: true,
      isMinimized: false,
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
      badgeCount: 3,
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

  useEffect(() => {
    localStorage.setItem('senior_care_live_insights', JSON.stringify(liveInsights));
  }, [liveInsights]);

  // Tab Manager Helper: Ensures clicked tab is in openTabs
  const navigateToTab = (tab: AppTab, subTitle?: string, docType?: DocumentType) => {
    setActiveTab(tab);

    const getTabMeta = (t: AppTab): { id: string; title: string; icon: React.ReactNode } => {
      switch (t) {
        case 'portal':
          return { id: 'tab-portal', title: '나의업무 (홈)', icon: <Home className="w-3.5 h-3.5 text-amber-500" /> };
        case 'dashboard':
          return { id: 'tab-dashboard', title: '통합 대시보드', icon: <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" /> };
        case 'clients':
          return { id: 'tab-clients', title: '대상자 관리', icon: <Users className="w-3.5 h-3.5 text-blue-500" /> };
        case 'ai-studio':
          return { id: 'tab-ai-studio', title: 'AI 녹취·상담실', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> };
        case 'forms':
          return {
            id: 'tab-forms',
            title: docType ? DOCUMENT_TYPE_LABELS[docType].label.split('(')[0] : '10대 법정서식',
            icon: <FileText className="w-3.5 h-3.5 text-emerald-500" />,
          };
        case 'insights':
          return { id: 'tab-insights', title: '위험도·인사이트', icon: <TrendingUp className="w-3.5 h-3.5 text-teal-500" /> };
        case 'routes':
          return { id: 'tab-routes', title: '방문동선 지도', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> };
        case 'archive':
          return { id: 'tab-archive', title: '문서 보관함', icon: <FolderCheck className="w-3.5 h-3.5 text-stone-400" /> };
        case 'supervision':
          return { id: 'tab-supervision', title: 'AI 수퍼비전', icon: <Bot className="w-3.5 h-3.5 text-purple-500" /> };
        case 'summary-report':
          return { id: 'tab-summary-report', title: '어르신 종합보고서', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" /> };
        default:
          return { id: 'tab-portal', title: '나의업무', icon: <Home className="w-3.5 h-3.5" /> };
      }
    };

    const meta = getTabMeta(tab);
    const existing = openTabs.find((item) => item.id === meta.id);

    if (!existing) {
      setOpenTabs((prev) => [
        ...prev,
        {
          id: meta.id,
          tab,
          title: subTitle || meta.title,
          icon: meta.icon,
          closable: meta.id !== 'tab-portal',
        },
      ]);
    } else if (subTitle && existing.title !== subTitle) {
      setOpenTabs((prev) =>
        prev.map((item) => (item.id === meta.id ? { ...item, title: subTitle } : item))
      );
    }
    setActiveTabId(meta.id);
  };

  const handleSelectWorkspaceTab = (tabItem: OpenWorkspaceTab) => {
    setActiveTab(tabItem.tab);
    setActiveTabId(tabItem.id);
  };

  const handleCloseWorkspaceTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(remaining);
    if (activeTabId === tabId) {
      const lastTab = remaining[remaining.length - 1] || remaining[0];
      if (lastTab) {
        setActiveTab(lastTab.tab);
        setActiveTabId(lastTab.id);
      } else {
        setActiveTab('portal');
        setActiveTabId('tab-portal');
      }
    }
  };

  // Google Sign In
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

  const handleSignOutGoogle = () => {
    googleDriveService.signOut();
    setGoogleUser(null);
    setDriveToast('Google 계정 로그아웃이 완료되었습니다.');
    setTimeout(() => setDriveToast(null), 3000);
  };

  // Auto Sync Cloud Scheduler Background Loop
  useEffect(() => {
    const checkAutoSync = async () => {
      if (!userSettings.autoSyncEnabled) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().slice(0, 10);
      const lastSyncDate = localStorage.getItem('carebridge_last_scheduled_sync_date');
      const scheduledTime = userSettings.autoSyncTime || '18:00';

      let shouldTrigger = false;

      if (userSettings.autoSyncInterval === 'hourly') {
        const lastHour = localStorage.getItem('carebridge_last_scheduled_sync_hour');
        const currentHourStr = `${todayDateStr}_${currentHours}`;
        if (lastHour !== currentHourStr) {
          shouldTrigger = true;
          localStorage.setItem('carebridge_last_scheduled_sync_hour', currentHourStr);
        }
      } else if (userSettings.autoSyncInterval === 'every_6_hours') {
        const last6Hour = localStorage.getItem('carebridge_last_scheduled_sync_6hour');
        const block = Math.floor(now.getHours() / 6);
        const current6HourStr = `${todayDateStr}_block_${block}`;
        if (last6Hour !== current6HourStr) {
          shouldTrigger = true;
          localStorage.setItem('carebridge_last_scheduled_sync_6hour', current6HourStr);
        }
      } else {
        if (currentTimeStr === scheduledTime && lastSyncDate !== todayDateStr) {
          shouldTrigger = true;
          localStorage.setItem('carebridge_last_scheduled_sync_date', todayDateStr);
        }
      }

      if (shouldTrigger && !isBackingUpToDrive) {
        setIsBackingUpToDrive(true);
        try {
          const res = await googleDriveService.backupAllDataToDrive(
            documents,
            clients,
            userSettings.driveFolderName,
            'scheduled'
          );
          setLastSyncResult({
            success: res.success,
            message: res.message,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          });
          if (res.success) {
            setDriveToast(`[정기 자동 백업 완료] Google Drive에 ${documents.length}건 서식이 안전하게 백업되었습니다.`);
          }
        } catch (e: any) {
          console.error('Scheduled backup error:', e);
        } finally {
          setIsBackingUpToDrive(false);
          setTimeout(() => setDriveToast(null), 5000);
        }
      }
    };

    const intervalId = setInterval(checkAutoSync, 30000);
    return () => clearInterval(intervalId);
  }, [userSettings, documents, clients, isBackingUpToDrive]);

  // Manual Backup to Google Drive
  const handleBackupToDrive = async (triggerType: 'manual' | 'scheduled' | 'auto_save' = 'manual') => {
    setIsBackingUpToDrive(true);
    try {
      const res = await googleDriveService.backupAllDataToDrive(
        documents,
        clients,
        userSettings.driveFolderName,
        triggerType
      );
      setLastSyncResult({
        success: res.success,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      });
      if (res.success) {
        setDriveToast(
          triggerType === 'auto_save'
            ? '구글 드라이브에 자동 저장 백업되었습니다.'
            : '구글 드라이브에 전체 사례관리 문서 백업이 완료되었습니다.'
        );
      } else {
        setDriveToast(`백업 알림: ${res.message}`);
      }
    } catch (e: any) {
      setDriveToast(`백업 실패: ${e.message}`);
    } finally {
      setIsBackingUpToDrive(false);
      setTimeout(() => setDriveToast(null), 4000);
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (newSettings.dashboardPanelOrder) {
      setDashboardOrder(newSettings.dashboardPanelOrder);
    }
    setDriveToast('기관 및 결재 환경설정이 저장되었습니다.');
    setTimeout(() => setDriveToast(null), 3000);
  };

  const handleTogglePanelOpen = (panelId: string, open?: boolean) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isOpen: open !== undefined ? open : !prev[panelId].isOpen,
        isMinimized: false,
      },
    }));
  };

  const handleTogglePanelMinimize = (panelId: string, min?: boolean) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isMinimized: min !== undefined ? min : !prev[panelId].isMinimized,
      },
    }));
  };

  const handleResetAllPanels = () => {
    setPanels({
      schedule: { id: 'schedule', name: '마감·일정 알림', isOpen: true, isMinimized: false, icon: <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />, badgeCount: 2 },
      riskDiagnostic: { id: 'riskDiagnostic', name: '위험도 AI 진단서', isOpen: true, isMinimized: false, icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />, badgeCount: 3 },
      routes: { id: 'routes', name: '방문 동선 지도', isOpen: true, isMinimized: false, icon: <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> },
      insights: { id: 'insights', name: '상담 인사이트', isOpen: true, isMinimized: false, icon: <BrainCircuit className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> },
      aiStudio: { id: 'aiStudio', name: 'AI 녹취 분석기', isOpen: true, isMinimized: false, icon: <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> },
    });
  };

  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
    const intakeDoc = createEmptyDocument('intake', newClient);
    setDocuments((prev) => [intakeDoc, ...prev]);
    setCurrentDocument(intakeDoc);
    setDriveToast(`${newClient.name} 어르신이 신규 등록되었습니다.`);
    setTimeout(() => setDriveToast(null), 3000);
  };

  const handleSaveDocument = (updatedDoc: CaseDocument) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === updatedDoc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedDoc;
        return next;
      }
      return [updatedDoc, ...prev];
    });
    setCurrentDocument(updatedDoc);

    if (googleUser && userSettings.autoBackupToDrive) {
      handleBackupToDrive('auto_save');
    }
  };

  const handleGeneratedDocument = (newDoc: CaseDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocument(newDoc);
    const dType = newDoc.documentType || newDoc.type || 'intake';
    navigateToTab('forms', DOCUMENT_TYPE_LABELS[dType]?.label || '서식 작성기', dType);
    setDriveToast(`[${DOCUMENT_TYPE_LABELS[dType]?.label}] 서식이 자동 생성되어 작성기에 열렸습니다.`);
    setTimeout(() => setDriveToast(null), 4000);
  };

  const handlePushInsightToDashboard = (insight: ConsultationInsight) => {
    setLiveInsights((prev) => [insight, ...prev]);
  };

  const handleSelectClientForConsultation = (client: ClientProfile) => {
    setSelectedClientForAI(client);
    setPanels((prev) => ({
      ...prev,
      aiStudio: { ...prev.aiStudio, isOpen: true, isMinimized: false },
    }));
    navigateToTab('ai-studio', `${client.name} 어르신 AI 상담`);
  };

  const handleSelectClientForForm = (client: ClientProfile, docType?: DocumentType) => {
    const targetType = docType || 'intake';
    const existingMatchingDoc = documents.find(
      (d) => d.clientId === client.id && (d.documentType === targetType || d.type === targetType)
    );
    if (existingMatchingDoc) {
      setCurrentDocument(existingMatchingDoc);
    } else {
      setCurrentDocument(createEmptyDocument(targetType, client));
    }
    navigateToTab('forms', `${client.name} 어르신 서식`, targetType);
  };

  const handleSelectDocTypeFromSidebar = (docType: DocumentType) => {
    const currentDocType = currentDocument ? (currentDocument.documentType || currentDocument.type) : 'intake';
    if (currentDocType === docType) {
      navigateToTab('forms', DOCUMENT_TYPE_LABELS[docType]?.label, docType);
      return;
    }
    const currentClient = clients.find((c) => c.id === currentDocument?.clientId) || clients[0];
    const existing = documents.find((d) => d.clientId === currentClient?.id && (d.documentType === docType || d.type === docType));
    if (existing) {
      setCurrentDocument(existing);
    } else {
      setCurrentDocument(createEmptyDocument(docType, currentClient));
    }
    navigateToTab('forms', DOCUMENT_TYPE_LABELS[docType]?.label, docType);
  };

  const handleOpenDocumentFromArchive = (doc: CaseDocument) => {
    setCurrentDocument(doc);
    const dType = doc.documentType || doc.type || 'intake';
    navigateToTab('forms', DOCUMENT_TYPE_LABELS[dType]?.label, dType);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (currentDocument?.id === docId) {
      const remaining = documents.filter((d) => d.id !== docId);
      setCurrentDocument(remaining[0] || createEmptyDocument('intake', clients[0]));
    }
  };

  const handleSelectDocumentFromBanner = (docId: string, clientId?: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setCurrentDocument(doc);
      const dType = doc.documentType || doc.type || 'intake';
      navigateToTab('forms', DOCUMENT_TYPE_LABELS[dType]?.label, dType);
    } else if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        handleSelectClientForForm(client);
      }
    }
  };

  // Big Highlight Handler: New Consultation Trigger
  const handleNewConsultation = () => {
    setSelectedClientForAI(null);
    setPanels((prev) => ({
      ...prev,
      aiStudio: { ...prev.aiStudio, isOpen: true, isMinimized: false },
    }));
    navigateToTab('ai-studio', '신규 AI 녹취 상담');
  };

  const highRiskClients = clients.filter(
    (c) => c.riskLevel.includes('고') || c.riskLevel.includes('위험')
  );

  // 📌 구글 로그인 정보가 없으면 독립된 로그인 화면으로 전면 격리
  if (!googleUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#14100E] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900 transition-colors">
      {/* 1. Global Top Navigation Header (희망이음 스타일 상단 대분류 헤더) */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
        clientCount={clients.length}
        docCount={documents.length}
        onNewConsultation={handleNewConsultation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScheduler={() => setIsSchedulerModalOpen(true)}
        user={googleUser}
        userSettings={userSettings}
        onSignInWithGoogle={() => handleLoginSuccess(googleUser || { id: 'user-1', name: '사회복지사', email: 'user@gmail.com', role: '복지사' }, driveToken || 'token', folderId || 'folder')}
        onLogout={handleLogout}
        onOpenMajorFormsModal={() => setIsMajorFormsModalOpen(true)}
        onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* 2. MDI Workspace Multi-Tab Bar (상단 열려있는 작업 탭 표시줄) */}
      <div className="hidden sm:block">
        <WorkspaceTabBar
          openTabs={openTabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectWorkspaceTab}
          onCloseTab={handleCloseWorkspaceTab}
        />
      </div>

      {/* Global Notification Toast */}
      {driveToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#251F1C] text-amber-200 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-amber-500/40 flex items-center gap-2.5 animate-slide-in">
          <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{driveToast}</span>
        </div>
      )}

      {/* 3. Main Workspace Area: Left Sidebar (세부 메뉴 대시보드) + Right Content View (작업 공간) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Sub-Navigation Sidebar (희망이음 스타일 좌측 세로 서브메뉴) */}
        <SubNavSidebar
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            navigateToTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          selectedDocType={currentDocument?.type || 'intake'}
          onSelectDocType={(docType) => {
            handleSelectDocTypeFromSidebar(docType);
            setIsMobileSidebarOpen(false);
          }}
          onNewConsultation={() => {
            handleNewConsultation();
            setIsMobileSidebarOpen(false);
          }}
          onNewClientRegister={() => {
            setIsNewClientModalOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onOpenMajorFormsModal={() => {
            setIsMajorFormsModalOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          clientsCount={clients.length}
          highRiskCount={highRiskClients.length}
          docsCount={documents.length}
          userSettings={userSettings}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          currentClient={clients.find((c) => c.id === currentDocument?.clientId) || clients[0]}
          currentDocument={currentDocument}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Viewport Container (Mobile Safe Bottom Padding) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 pb-24 md:pb-8">
          {/* TAB 0: MAIN PORTAL HUB (초기 환영 & 3대 대형 버튼 & 표준 워크플로우) */}
          {activeTab === 'portal' && (
            <MainPortalHub
              onNavigateTab={(tab) => navigateToTab(tab)}
              clients={clients}
              documents={documents}
              userSettings={userSettings}
              onNewConsultation={handleNewConsultation}
              onSelectClientForConsultation={handleSelectClientForConsultation}
              onSelectClientForForm={handleSelectClientForForm}
              onNewClientRegister={() => setIsNewClientModalOpen(true)}
              onOpenMajorFormsModal={() => setIsMajorFormsModalOpen(true)}
            />
          )}

          {/* TAB 1: INTEGRATED SMART DASHBOARD */}
          {activeTab === 'dashboard' && (
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

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>총 관리 어르신</span>
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    {clients.length} <span className="text-xs font-normal text-stone-500">명</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>작성 법정 서식</span>
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
                    {highRiskClients.length} <span className="text-xs font-normal text-stone-500">명</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>금주 방문 일정</span>
                    <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                    4 <span className="text-xs font-normal text-stone-500">가구</span>
                  </div>
                </div>
              </div>

              {/* Cards View */}
              <div className="space-y-6">
                {panels.riskDiagnostic?.isOpen && (
                  <RiskDiagnosticCard
                    clients={clients}
                    documents={documents}
                    isOpen={panels.riskDiagnostic.isOpen}
                    isMinimized={panels.riskDiagnostic.isMinimized}
                    onToggleOpen={(open) => handleTogglePanelOpen('riskDiagnostic', open)}
                    onToggleMinimize={(min) => handleTogglePanelMinimize('riskDiagnostic', min)}
                    onSelectClientForAction={(client, docType) => {
                      const targetDocType = docType || 'service_plan';
                      const newDoc = createEmptyDocument(targetDocType, client);
                      setCurrentDocument(newDoc);
                      navigateToTab('forms', DOCUMENT_TYPE_LABELS[targetDocType]?.label, targetDocType);
                    }}
                  />
                )}

                {panels.routes?.isOpen && (
                  <DashboardWindow
                    id="routes"
                    title="어르신 댁 방문 상담 동선 최적화 & 스마트 지도 뷰"
                    subtitle="위기도 및 실시간 지리적 인접성을 고려한 최적 경로 스케줄러"
                    icon={<MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                    isOpen={panels.routes.isOpen}
                    isMinimized={panels.routes.isMinimized}
                    onToggleOpen={(open) => handleTogglePanelOpen('routes', open)}
                    onToggleMinimize={(min) => handleTogglePanelMinimize('routes', min)}
                    accentColor="rose"
                  >
                    <VisitRoutePlanner
                      clients={clients}
                      onSelectClientForConsultation={handleSelectClientForConsultation}
                    />
                  </DashboardWindow>
                )}

                {panels.insights?.isOpen && (
                  <ConsultationInsightsCard
                    clients={clients}
                    documents={documents}
                    customInsights={liveInsights}
                    isOpen={panels.insights.isOpen}
                    isMinimized={panels.insights.isMinimized}
                    onToggleOpen={(open) => handleTogglePanelOpen('insights', open)}
                    onToggleMinimize={(min) => handleTogglePanelMinimize('insights', min)}
                    onOpenFormForClient={handleSelectClientForForm}
                    onSaveDocument={handleSaveDocument}
                    onUpdateDocument={handleSaveDocument}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI TRANSCRIPT STUDIO */}
          {activeTab === 'ai-studio' && (
            <div className="space-y-6">
              <AIStudioTranscript
                clients={clients}
                onGenerateDocument={handleGeneratedDocument}
                selectedClient={selectedClientForAI}
                onPushInsightToDashboard={handlePushInsightToDashboard}
              />
            </div>
          )}

          {/* TAB 3: 10 STANDARD FORMS EDITOR */}
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

          {/* TAB 5: RISK & CONSULTATION INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <RiskDiagnosticCard
                clients={clients}
                documents={documents}
                isOpen={true}
                onSelectClientForAction={(client, docType) => {
                  const targetDocType = docType || 'service_plan';
                  const newDoc = createEmptyDocument(targetDocType, client);
                  setCurrentDocument(newDoc);
                  navigateToTab('forms', DOCUMENT_TYPE_LABELS[targetDocType]?.label, targetDocType);
                }}
              />
              <ConsultationInsightsCard
                clients={clients}
                documents={documents}
                customInsights={liveInsights}
                isOpen={true}
                onOpenFormForClient={handleSelectClientForForm}
                onSaveDocument={handleSaveDocument}
                onUpdateDocument={handleSaveDocument}
              />
            </div>
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

          {/* TAB 9: SUMMARY REPORT (어르신 종합 이력 보고서) */}
          {activeTab === 'summary-report' && (
            <SummaryReportView
              clients={clients}
              documents={documents}
              insights={liveInsights}
              selectedClient={selectedClientForAI || clients[0]}
              onSelectClient={(c) => setSelectedClientForAI(c)}
              onNavigateTab={(t) => navigateToTab(t)}
            />
          )}
        </main>
      </div>

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
        onOpenScheduler={() => {
          setIsSettingsOpen(false);
          setIsSchedulerModalOpen(true);
        }}
      />

      {/* Cloud Auto Sync Scheduler Modal */}
      <AutoSyncSchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
        userSettings={userSettings}
        onUpdateSettings={handleSaveSettings}
        user={googleUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onTriggerImmediateSync={() => handleBackupToDrive('manual')}
        isSyncing={isBackingUpToDrive}
      />

      {/* New Client Registration Modal (신규 어르신 등록 모달) */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAddClient={(newClient, immediateAction) => {
          handleAddClient(newClient);
          if (immediateAction === 'ai_consultation') {
            handleSelectClientForConsultation(newClient);
          } else if (immediateAction === 'intake_form') {
            handleSelectClientForForm(newClient, 'intake');
          }
        }}
        onSaveClient={(newClient) => {
          handleAddClient(newClient);
        }}
        onStartAIConsultation={(newClient) => {
          handleAddClient(newClient);
          handleSelectClientForConsultation(newClient);
        }}
        onStartIntakeForm={(newClient) => {
          handleAddClient(newClient);
          handleSelectClientForForm(newClient, 'intake');
        }}
        agencyName={userSettings.agencyName || userSettings.institutionName || '사회복지시설 사례관리팀'}
        workerName={userSettings.workerName || userSettings.defaultWorkerName || googleUser?.name || '사회복지사'}
      />

      {/* Major Legal Forms Quick Modal Launcher (주요 법정 서식 빠른 런처 모달) */}
      <MajorFormsQuickModal
        isOpen={isMajorFormsModalOpen}
        onClose={() => setIsMajorFormsModalOpen(false)}
        clients={clients}
        onSelectForm={(docType, targetClient) => {
          const client = targetClient || clients[0];
          handleSelectClientForForm(client, docType);
        }}
      />

      {/* Mobile Bottom Navigation Bar (스마트폰 & 태블릿 최적화 하단 바) */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigateTab={(tab) => navigateToTab(tab)}
        onNewConsultation={handleNewConsultation}
        onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
        onOpenMajorFormsModal={() => setIsMajorFormsModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScheduler={() => setIsSchedulerModalOpen(true)}
        user={googleUser}
        userSettings={userSettings}
        clientsCount={clients.length}
        docsCount={documents.length}
      />
    </div>
  );
}
