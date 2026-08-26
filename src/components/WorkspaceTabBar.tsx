import React from 'react';
import { X, Home, Sparkles, FileText, Users, MapPin, BrainCircuit, FolderCheck, Bot, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { AppTab } from './Header';

export interface OpenWorkspaceTab {
  id: string;
  tab: AppTab;
  title: string;
  icon?: React.ReactNode;
  closable?: boolean;
  subType?: string;
}

interface WorkspaceTabBarProps {
  openTabs: OpenWorkspaceTab[];
  activeTabId: string;
  onSelectTab: (tabItem: OpenWorkspaceTab) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
}

export const WorkspaceTabBar: React.FC<WorkspaceTabBarProps> = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}) => {
  return (
    <div className="bg-[#EAE5DF] dark:bg-[#1A1614] border-b border-stone-300 dark:border-stone-800 px-3 pt-1.5 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar shadow-2xs">
      <div className="flex items-center gap-1">
        {openTabs.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectTab(item)}
              className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg text-xs font-bold transition-all cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-white dark:bg-[#201B18] text-amber-900 dark:text-amber-300 border-stone-300 dark:border-stone-700 shadow-2xs'
                  : 'bg-stone-200/70 dark:bg-[#15110F] text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-200 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{item.title}</span>

              {item.closable && (
                <button
                  type="button"
                  onClick={(e) => onCloseTab(item.id, e)}
                  className={`p-0.5 rounded hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="탭 닫기"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
