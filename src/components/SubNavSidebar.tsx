import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Sparkles,
  FileText,
  MapPin,
  LineChart,
  FolderCheck,
  Bot,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  PhoneCall,
  Search,
  FilePlus,
  Compass,
  Building,
  Printer,
  ShieldCheck,
  Star,
  Settings,
  Headphones,
  UploadCloud,
  Layers,
  Eye,
  EyeOff,
  UserCheck,
  Crosshair,
  Maximize2,
  Minimize2,
  FolderOpen,
  FileSpreadsheet
} from 'lucide-react';
import { AppTab } from './Header';
import { DocumentType, ClientProfile, UserSettings, CaseDocument } from '../types';
import { DOCUMENT_TYPE_LABELS, ORDERED_DOC_TYPES } from '../utils/documentTemplates';

export interface SubNavSidebarProps {
  activeTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  selectedDocType?: DocumentType;
  onSelectDocType?: (docType: DocumentType) => void;
  onNewConsultation: () => void;
  onNewClientRegister?: () => void;
  onOpenMajorFormsModal?: () => void;
  clientsCount: number;
  highRiskCount: number;
  docsCount: number;
  userSettings?: UserSettings;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentClient?: ClientProfile | null;
  currentDocument?: CaseDocument | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SubNavSidebar: React.FC<SubNavSidebarProps> = ({
  activeTab,
  onNavigateTab,
  selectedDocType = 'intake',
  onSelectDocType,
  onNewConsultation,
  onNewClientRegister,
  onOpenMajorFormsModal,
  clientsCount,
  highRiskCount,
  docsCount,
  userSettings,
  isCollapsed,
  onToggleCollapse,
  currentClient,
  currentDocument,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Focus Mode toggle: when enabled, hides non-essential categories to maximize attention on current senior/doc
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Collapsible category accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    currentCase: true,
    quickActions: true,
    legalForms: true,
    clients: true,
    aiStudio: true,
    monitoring: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const collapseAll = () => {
    setOpenSections({
      currentCase: true,
      quickActions: false,
      legalForms: false,
      clients: false,
      aiStudio: false,
      monitoring: false,
    });
  };

  const expandAll = () => {
    setOpenSections({
      currentCase: true,
      quickActions: true,
      legalForms: true,
      clients: true,
      aiStudio: true,
      monitoring: true,
    });
  };

  // Grouped Legal Forms (10-Step Standard Guidelines)
  const intakeForms: DocumentType[] = ['intake', 'assessment', 'scoring'];
  const planForms: DocumentType[] = ['case_conference', 'service_plan', 'agreement'];
  const evalForms: DocumentType[] = ['monitoring', 'reassessment', 'termination', 'referral'];

  // Content renderer used in both desktop sidebar and mobile drawer
  const renderSidebarContent = (isMobileDrawer: boolean = false) => (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-72 bg-[#1E1916] text-stone-200 border-r border-[#38302B] flex flex-col select-none h-full max-h-screen overflow-y-auto shadow-2xl z-50'
          : 'hidden md:flex w-68 bg-[#1E1916] text-stone-200 border-r border-[#38302B] flex-col select-none shrink-0 h-full max-h-screen overflow-y-auto transition-all shadow-lg z-20'
      }`}
    >
      {/* 1. Sidebar Top Header & Category Collapse Controls */}
      <div className="p-3 border-b border-[#38302B] bg-[#27211D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-600/20 border border-amber-500/30 shrink-0">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white">사례관리 내비게이션</h3>
            <p className="text-[10px] text-stone-400">카테고리별 맞춤 접기/펼치기</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isFocusMode
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
            title={isFocusMode ? '집중 모드 해제 (전체 메뉴 표시)' : '집중 모드 (현재 작업 대상자에만 집중)'}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isFocusMode ? '집중중' : '집중'}</span>
          </button>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-md hover:bg-[#38302B] text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="닫기"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md hover:bg-[#38302B] text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="사이드바 완전히 최소화"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. FOCUS MODE BANNER (When Active) */}
      {isFocusMode && (
        <div className="bg-amber-950/60 border-b border-amber-800/40 p-2.5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            현재 사례 집중 모드 가동 중
          </span>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="text-[10px] text-stone-300 hover:underline cursor-pointer"
          >
            해제
          </button>
        </div>
      )}

      {/* 3. QUICK GLOBAL ACCORDION CONTROLS */}
      {!isFocusMode && (
        <div className="px-3 py-1.5 bg-[#181412] border-b border-[#2C2420] flex items-center justify-between text-[10px] text-stone-400">
          <span>섹션 관리:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              전체 펼치기
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              전체 접기
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN SCROLLABLE CONTENT */}
      <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
        {/* SECTION 1: 🎯 CURRENT FOCUS TARGET (현재 작업 중인 대상자 및 문서) */}
        {currentClient && (
          <div className="rounded-xl bg-gradient-to-br from-[#2E241E] to-[#221B17] border border-amber-600/40 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('currentCase')}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer bg-black/20 hover:bg-black/40"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>현재 집중 작업 어르신</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  openSections.currentCase ? '' : '-rotate-90'
                }`}
              />
            </button>

            {openSections.currentCase && (
              <div className="p-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-100 text-sm">
                    {currentClient.name} 어르신 ({currentClient.age}세)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentClient.riskLevel.includes('고')
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {currentClient.riskLevel}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 space-y-0.5">
                  <p className="truncate">📍 {currentClient.address}</p>
                  <p className="truncate">📞 {currentClient.phone}</p>
                  <p className="truncate text-amber-200/80">
                    🏥 {currentClient.chronicDiseases?.join(', ') || '만성질환 없음'}
                  </p>
                </div>

                {/* Quick actions for current client */}
                <div className="pt-2 border-t border-stone-700/60 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={onNewConsultation}
                    className="py-1.5 px-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>AI 녹취</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('forms')}
                    className="py-1.5 px-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-emerald-200" />
                    <span>서식 작성</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: ⚡ QUICK ACTIONS (신규 등록 및 빠른 실행) */}
        {(!isFocusMode || !currentClient) && (
          <div className="rounded-xl bg-[#251E1A] border border-[#38302B] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('quickActions')}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#2F2622]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>빠른 실행 & 원클릭</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  openSections.quickActions ? '' : '-rotate-90'
                }`}
              />
            </button>

            {openSections.quickActions && (
              <div className="p-1.5 space-y-1">
                {onNewClientRegister && (
                  <button
                    type="button"
                    onClick={onNewClientRegister}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>신규 어르신 등록</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-950 px-1.5 py-0.2 rounded text-amber-300">
                      신규
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onNewConsultation}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:bg-[#2D2622] hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>실시간 AI 녹취 시작</span>
                </button>

                {onOpenMajorFormsModal && (
                  <button
                    type="button"
                    onClick={onOpenMajorFormsModal}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:bg-[#2D2622] hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>주요 법정 서식 빠른 런처</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateTab('summary-report')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-purple-300 hover:bg-[#2D2622] hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                  <span>어르신 종합보고서 (통합이력)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: 📄 10 LEGAL STATUTORY FORMS (보건복지부 10대 법정서식 접기/펼치기) */}
        <div className="rounded-xl bg-[#251E1A] border border-[#38302B] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('legalForms')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#2F2622]"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>10대 법정서식</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-normal">
                10개
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                openSections.legalForms ? '' : '-rotate-90'
              }`}
            />
          </button>

          {openSections.legalForms && (
            <div className="p-1.5 space-y-1.5">
              {/* Group A: 초기접수 & 사정 */}
              <div className="space-y-0.5">
                <div className="px-2 py-0.5 text-[10px] font-bold text-stone-400 uppercase">
                  1단계 · 접수 및 사정
                </div>
                {intakeForms.map((type) => {
                  const isSelected = activeTab === 'forms' && selectedDocType === type;
                  const info = DOCUMENT_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onSelectDocType?.(type);
                        onNavigateTab('forms');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-stone-300 hover:bg-[#2D2622] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{info.label.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Group B: 계획 및 실행 */}
              <div className="space-y-0.5 pt-1 border-t border-stone-800">
                <div className="px-2 py-0.5 text-[10px] font-bold text-stone-400 uppercase">
                  2단계 · 회의 및 계획
                </div>
                {planForms.map((type) => {
                  const isSelected = activeTab === 'forms' && selectedDocType === type;
                  const info = DOCUMENT_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onSelectDocType?.(type);
                        onNavigateTab('forms');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-stone-300 hover:bg-[#2D2622] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{info.label.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Group C: 평가 및 종결 */}
              <div className="space-y-0.5 pt-1 border-t border-stone-800">
                <div className="px-2 py-0.5 text-[10px] font-bold text-stone-400 uppercase">
                  3단계 · 평가 및 종결
                </div>
                {evalForms.map((type) => {
                  const isSelected = activeTab === 'forms' && selectedDocType === type;
                  const info = DOCUMENT_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onSelectDocType?.(type);
                        onNavigateTab('forms');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-stone-300 hover:bg-[#2D2622] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{info.label.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: 👥 SENIORS MANAGEMENT (재가 어르신 관리 접기/펼치기) */}
        {(!isFocusMode || activeTab === 'clients') && (
          <div className="rounded-xl bg-[#251E1A] border border-[#38302B] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('clients')}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#2F2622]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>대상자 관리</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-normal">
                  {clientsCount}명
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  openSections.clients ? '' : '-rotate-90'
                }`}
              />
            </button>

            {openSections.clients && (
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('clients')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    activeTab === 'clients' ? 'bg-blue-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>전체 관리 어르신</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300">
                    {clientsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('clients')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:bg-[#2D2622] flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>고위험 집중 관리군</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold">
                    {highRiskCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: 🎙️ AI STUDIO & INSIGHTS (AI 상담실 및 분석) */}
        {(!isFocusMode || activeTab === 'ai-studio' || activeTab === 'insights') && (
          <div className="rounded-xl bg-[#251E1A] border border-[#38302B] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('aiStudio')}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#2F2622]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI 상담실 & 위험도 분석</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  openSections.aiStudio ? '' : '-rotate-90'
                }`}
              />
            </button>

            {openSections.aiStudio && (
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('ai-studio')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeTab === 'ai-studio' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>실시간 음성 녹음실</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('insights')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeTab === 'insights' ? 'bg-teal-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-teal-400" />
                  <span>위험도·SGDS-K 추이</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: 📊 MONITORING & ADMIN */}
        {(!isFocusMode || activeTab === 'routes' || activeTab === 'archive' || activeTab === 'supervision') && (
          <div className="rounded-xl bg-[#251E1A] border border-[#38302B] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('monitoring')}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#2F2622]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>방문동선 & 행정 지원</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  openSections.monitoring ? '' : '-rotate-90'
                }`}
              />
            </button>

            {openSections.monitoring && (
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('routes')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeTab === 'routes' ? 'bg-rose-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>방문동선 지도</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('archive')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeTab === 'archive' ? 'bg-stone-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <FolderCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>문서보관함</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('supervision')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeTab === 'supervision' ? 'bg-purple-600 text-white font-bold' : 'text-stone-300 hover:bg-[#2D2622]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI 수퍼비전 자문</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer (Agency & Worker Status) */}
      <div className="p-3 border-t border-[#38302B] bg-[#181412] text-[11px] space-y-1">
        <div className="text-stone-400 flex items-center justify-between">
          <span className="font-semibold">{userSettings?.agencyName || '도봉재가노인지원서비스센터'}</span>
        </div>
        <div className="text-stone-500 text-[10px]">
          {userSettings?.socialWorkerName ? `${userSettings.socialWorkerName} 사회복지사` : '담당 사회복지사'} (접속중)
        </div>
      </div>
    </aside>
  );

  // 1. Collapsed Desktop Sidebar
  const renderCollapsedSidebar = () => (
    <aside className="hidden md:flex w-12 bg-[#201B18] text-stone-300 border-r border-[#38302B] flex-col items-center py-3 justify-between select-none shrink-0 transition-all z-20">
      <div className="flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-[#2D2622] hover:bg-amber-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          title="좌측 서브메뉴 펼치기"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-stone-700/60 my-1" />

        {/* Collapsed icons */}
        <button
          onClick={() => onNavigateTab('portal')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'portal' ? 'bg-amber-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="나의업무 (홈)"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateTab('clients')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'clients' ? 'bg-blue-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="대상자 관리"
        >
          <Users className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateTab('ai-studio')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ai-studio' ? 'bg-amber-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="AI 녹취·상담실"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateTab('forms')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'forms' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="10대 법정서식"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateTab('insights')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'insights' ? 'bg-teal-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="위험도·인사이트"
        >
          <LineChart className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateTab('routes')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'routes' ? 'bg-rose-600 text-white' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="방문동선·일정"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="p-2 rounded-lg hover:bg-stone-800 text-stone-400"
        title="사이드바 펼치기"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </aside>
  );

  return (
    <>
      {/* Desktop View */}
      {isCollapsed ? renderCollapsedSidebar() : renderSidebarContent(false)}

      {/* Mobile Drawer View (When opened on mobile) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative flex-1 flex max-w-xs w-full">
            {renderSidebarContent(true)}
          </div>
          <div
            className="flex-1 w-full h-full cursor-pointer"
            onClick={onCloseMobile}
            aria-label="사이드바 닫기"
          />
        </div>
      )}
    </>
  );
};
