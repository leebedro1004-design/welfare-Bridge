import React, { useState } from 'react';
import {
  Minus,
  Square,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  GripVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface DashboardWindowProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  summaryWhenCollapsed?: React.ReactNode;
  isOpen: boolean;
  isMinimized?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onToggleMinimize?: (minimized: boolean) => void;
  headerAction?: React.ReactNode;
  accentColor?: 'amber' | 'emerald' | 'teal' | 'stone' | 'rose';
  className?: string;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const DashboardWindow: React.FC<DashboardWindowProps> = ({
  id,
  title,
  subtitle,
  icon,
  badge,
  children,
  summaryWhenCollapsed,
  isOpen,
  isMinimized = false,
  onToggleOpen,
  onToggleMinimize,
  headerAction,
  accentColor = 'stone',
  className = '',
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const [localMinimized, setLocalMinimized] = useState<boolean>(isMinimized);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const effectiveMinimized = onToggleMinimize ? isMinimized : localMinimized;
  const toggleMin = () => {
    if (onToggleMinimize) {
      onToggleMinimize(!effectiveMinimized);
    } else {
      setLocalMinimized(!localMinimized);
    }
  };

  const accentStyles = {
    amber: 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700',
    emerald: 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700',
    teal: 'border-teal-200/80 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/20 hover:border-teal-300 dark:hover:border-teal-700',
    stone: 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1916] hover:border-stone-300 dark:hover:border-stone-700',
    rose: 'border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700',
  }[accentColor];

  const headerBgStyles = {
    amber: 'bg-gradient-to-r from-amber-50/90 via-stone-50/60 to-amber-50/40 dark:from-amber-950/60 dark:via-[#231E1B] dark:to-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/50',
    emerald: 'bg-gradient-to-r from-emerald-50/90 via-stone-50/60 to-emerald-50/40 dark:from-emerald-950/60 dark:via-[#231E1B] dark:to-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-900/50',
    teal: 'bg-gradient-to-r from-teal-50/90 via-stone-50/60 to-teal-50/40 dark:from-teal-950/60 dark:via-[#231E1B] dark:to-teal-950/40 border-b border-teal-200/60 dark:border-teal-900/50',
    stone: 'bg-gradient-to-r from-stone-50 via-warm-gray-50 to-stone-50 dark:from-[#251E1A] dark:via-[#1E1916] dark:to-[#251E1A] border-b border-stone-200/70 dark:border-stone-800',
    rose: 'bg-gradient-to-r from-rose-50/90 via-stone-50/60 to-rose-50/40 dark:from-rose-950/60 dark:via-[#231E1B] dark:to-rose-950/40 border-b border-rose-200/60 dark:border-rose-900/50',
  }[accentColor];

  return (
    <div
      id={`window-${id}`}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
        if (onDragOver) onDragOver(e);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        setIsDraggingOver(false);
        if (onDrop) onDrop(e);
      }}
      className={`rounded-2xl border bg-white dark:bg-[#1E1916] shadow-xs transition-all duration-200 overflow-hidden ${
        isDraggingOver ? 'ring-2 ring-amber-500 scale-[1.008]' : ''
      } ${accentStyles} ${className}`}
    >
      {/* Window Titlebar */}
      <div
        className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 select-none ${headerBgStyles}`}
      >
        {/* Left: Drag Handle, Window Icon, Title, Badge */}
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={toggleMin}
          title={effectiveMinimized ? '클릭하여 창 펼치기' : '클릭하여 창 최소화(접기)'}
        >
          {isDraggable && (
            <div
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing shrink-0"
              title="드래그하여 대시보드 카드 순서 변경"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div className="shrink-0 p-2 rounded-xl bg-white dark:bg-[#2C2420] shadow-xs border border-stone-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-300">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && !effectiveMinimized && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
            {effectiveMinimized && summaryWhenCollapsed && (
              <div className="mt-1 text-xs text-stone-600 dark:text-stone-300 font-medium">
                {summaryWhenCollapsed}
              </div>
            )}
          </div>
        </div>

        {/* Right: Window Controls & Up/Down Movement */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {headerAction}

          {/* Up/Down Quick Reorder Buttons */}
          {(onMoveUp || onMoveDown) && (
            <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 bg-white/70 dark:bg-stone-900/60 mr-1">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                className="p-1 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="위로 이동"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                className="p-1 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="아래로 이동"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Minimize / Expand Button */}
          <button
            type="button"
            onClick={toggleMin}
            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={effectiveMinimized ? '창 최대화/펼치기' : '창 최소화/접기'}
            aria-label="최소화"
          >
            {effectiveMinimized ? (
              <Maximize2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            ) : (
              <Minimize2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            )}
          </button>

          {/* Close / Hide Button */}
          {onToggleOpen && (
            <button
              type="button"
              onClick={() => onToggleOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="이 대시보드 창 닫기 (상단 바에서 언제든 다시 열 수 있습니다)"
              aria-label="창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Window Body (Hidden when Minimized) */}
      {!effectiveMinimized && (
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1916] transition-all duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

