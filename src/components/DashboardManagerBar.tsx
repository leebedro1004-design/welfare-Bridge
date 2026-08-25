import React from 'react';
import {
  SlidersHorizontal,
  Plus,
  RotateCcw,
  Sparkles,
  Calendar,
  LineChart,
  Bot,
  Users,
  FileText,
  Eye,
  EyeOff,
  LayoutDashboard,
  Check
} from 'lucide-react';

export interface DashboardPanelConfig {
  id: string;
  name: string;
  isOpen: boolean;
  isMinimized: boolean;
  icon: React.ReactNode;
  badgeCount?: number;
}

interface DashboardManagerBarProps {
  panels: Record<string, DashboardPanelConfig>;
  onTogglePanelOpen: (panelId: string, open: boolean) => void;
  onTogglePanelMinimize: (panelId: string, min: boolean) => void;
  onResetAllPanels: () => void;
  todayCount: number;
}

export const DashboardManagerBar: React.FC<DashboardManagerBarProps> = ({
  panels,
  onTogglePanelOpen,
  onTogglePanelMinimize,
  onResetAllPanels,
  todayCount,
}) => {
  const panelList: DashboardPanelConfig[] = Object.values(panels);
  const closedPanels = panelList.filter((p) => !p.isOpen);

  return (
    <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-3.5 sm:p-4 shadow-xs mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 transition-all">
      {/* Left: Dashboard Customizer Status */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
          <LayoutDashboard className="w-4 h-4 text-amber-800 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
              맞춤형 대시보드 창 제어
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
              활성 창 {panelList.filter((p) => p.isOpen).length}/{panelList.length}개
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            필요한 대시보드만 켜고 끄거나 최소화하여 나만의 깔끔한 업무 공간을 구성하세요.
          </p>
        </div>
      </div>

      {/* Center/Right: Panel Toggle Buttons & Restore */}
      <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
        {panelList.map((panel) => {
          const active = panel.isOpen;
          const isMin = panel.isMinimized;

          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => onTogglePanelOpen(panel.id, !active)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
                active
                  ? 'bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/70 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 opacity-70'
              }`}
              title={active ? '창 닫기' : '창 열기'}
            >
              {panel.icon}
              <span>{panel.name}</span>
              {panel.badgeCount !== undefined && panel.badgeCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                  {panel.badgeCount}
                </span>
              )}
              {active ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              ) : (
                <Plus className="w-3 h-3 text-stone-400" />
              )}
            </button>
          );
        })}

        {/* Reset / Open All */}
        <button
          type="button"
          onClick={onResetAllPanels}
          className="p-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          title="모든 대시보드 창 기본 상태로 복원"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">기본배치</span>
        </button>
      </div>
    </div>
  );
};
