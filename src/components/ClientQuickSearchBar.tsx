import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  UserPlus,
  CornerDownLeft,
  ChevronRight,
  History,
  Tag
} from 'lucide-react';
import { ClientProfile } from '../types';
import { matchClientQuery, extractChosung } from '../utils/koreanSearch';

interface ClientQuickSearchBarProps {
  clients: ClientProfile[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectClient: (client: ClientProfile) => void;
  onNewClientRegister?: () => void;
  onNewConsultationForClient?: (client: ClientProfile) => void;
  onSelectClientForForm?: (client: ClientProfile) => void;
}

export const ClientQuickSearchBar: React.FC<ClientQuickSearchBarProps> = ({
  clients,
  searchTerm,
  onSearchTermChange,
  onSelectClient,
  onNewClientRegister,
  onNewConsultationForClient,
  onSelectClientForForm,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentClientIds, setRecentClientIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('care_recent_viewed_clients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut to focus search: Ctrl+K, Cmd+K, or Slash ('/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matched clients using Korean Chosung, Phone, Disease, Address match
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return clients
      .map((client) => {
        const matchInfo = matchClientQuery(client, searchTerm);
        return { client, matchInfo };
      })
      .filter((item) => item.matchInfo.matched);
  }, [clients, searchTerm]);

  // Recent clients list
  const recentClients = useMemo(() => {
    return recentClientIds
      .map((id) => clients.find((c) => c.id === id))
      .filter((c): c is ClientProfile => Boolean(c))
      .slice(0, 4);
  }, [clients, recentClientIds]);

  // Keep selected index in bound
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  const handleSelect = (client: ClientProfile) => {
    // Save to recent
    setRecentClientIds((prev) => {
      const filtered = prev.filter((id) => id !== client.id);
      const updated = [client.id, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('care_recent_viewed_clients', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    onSelectClient(client);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex].client);
      }
    }
  };

  const clearSearch = () => {
    onSearchTermChange('');
    inputRef.current?.focus();
  };

  const getTierBadge = (risk: string) => {
    if (risk.includes('고') || risk.includes('최')) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-extrabold flex items-center gap-1 border border-rose-200 dark:border-rose-900">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          최중점
        </span>
      );
    }
    if (risk.includes('중')) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold flex items-center gap-1 border border-amber-200 dark:border-amber-900">
          <Clock className="w-3 h-3 text-amber-600" />
          중점
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-200 dark:border-emerald-900">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        일반
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 🔍 Main Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-600 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          id="input-client-fast-search"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            onSearchTermChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="대상자 빠른 검색 (성함, 초성 'ㄱㅇㅅ', 연락처 뒷자리, 생년월일, 주소, 질환명)"
          className="w-full text-xs sm:text-sm pl-11 sm:pl-12 pr-24 sm:pr-32 py-3.5 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 shadow-sm focus:shadow-md transition-all font-medium"
        />

        {/* Right Action Icons (Clear, Shortcut Hint, Results Count) */}
        <div className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center gap-1.5">
          {searchTerm ? (
            <>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold hidden sm:inline">
                {searchResults.length}명 조회됨
              </span>
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
              <span>단축키</span>
              <kbd className="font-sans font-bold text-stone-600 dark:text-stone-300">/</kbd>
              <span>또는</span>
              <kbd className="font-sans font-bold text-stone-600 dark:text-stone-300">Ctrl+K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* 📑 Instant Results & Suggestions Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#231E1B] rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[460px] flex flex-col">
          {/* Active Search Mode */}
          {searchTerm.trim() ? (
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
              <div className="p-2.5 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 font-semibold px-4">
                <span>
                  검색 결과: <b className="text-amber-600 font-black">{searchResults.length}</b>명 일치
                </span>
                <span className="text-[11px] text-stone-400 hidden sm:inline flex items-center gap-1">
                  <span>선택: Enter</span> <CornerDownLeft className="w-3 h-3 inline" />
                  <span className="ml-2">이동: ↑ ↓</span>
                </span>
              </div>

              {searchResults.length > 0 ? (
                searchResults.map(({ client, matchInfo }, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleSelect(client)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3.5 sm:p-4 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-600'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Left: Client Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-stone-900 dark:text-stone-100">
                            {client.name}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">
                            ({extractChosung(client.name)})
                          </span>
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                            {client.age}세 ({client.gender})
                          </span>
                          {getTierBadge(client.riskLevel)}
                          <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                            {client.welfareType}
                          </span>
                          {client.livingType && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                              {client.livingType}
                            </span>
                          )}
                        </div>

                        {/* Match Reason Tag */}
                        {matchInfo.matchReason && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                            <Tag className="w-3 h-3 shrink-0" />
                            <span>{matchInfo.matchReason}</span>
                          </div>
                        )}

                        {/* Sub details: Address & Phone & Diseases */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            {client.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            {client.phone}
                          </span>
                          {client.chronicDiseases && client.chronicDiseases.length > 0 && (
                            <span className="text-[11px] text-stone-400 truncate max-w-xs">
                              질환: {client.chronicDiseases.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Direct Quick Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(client);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                          <span>세부상담·사정 열람</span>
                        </button>

                        {onNewConsultationForClient && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNewConsultationForClient(client);
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
                            title="이 어르신과 AI 상담/녹취 시작"
                          >
                            <Sparkles className="w-4 h-4 text-amber-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                      '{searchTerm}' 일치하는 대상자를 찾지 못했습니다.
                    </p>
                    <p className="text-xs text-stone-400">
                      성함의 한글 초성(예: 'ㄱㅇㅅ') 또는 전화번호 뒷자리(4자리), 주소 동명으로 검색해 보세요.
                    </p>
                  </div>

                  {onNewClientRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNewClientRegister();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>'{searchTerm}' 어르신 신규 등록하기</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Idle Popover Mode: Recent clients & Quick filter tags */
            <div className="p-4 space-y-4">
              {/* Recent Viewed Clients */}
              {recentClients.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-stone-400" />
                      최근 열람한 어르신
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentClientIds([]);
                        localStorage.removeItem('care_recent_viewed_clients');
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      기록 지우기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleSelect(client)}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 font-bold text-xs shrink-0">
                            {client.name.slice(0, 1)}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                                {client.name}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                ({client.age}세)
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 truncate block">
                              {client.address}
                            </span>
                          </div>
                        </div>
                        {getTierBadge(client.riskLevel)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Search Tag Recommendations */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  빠른 추천 키워드 (클릭 시 즉시 필터)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '최중점 (고위험군)', query: '최중점' },
                    { label: '중점 (정기관리)', query: '중점' },
                    { label: '독거 어르신', query: '독거' },
                    { label: '기초수급자', query: '기초수급' },
                    { label: '만성 관절염', query: '관절염' },
                    { label: '당뇨·고혈압', query: '당뇨' },
                    { label: '인지저하·치매', query: '치매' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        onSearchTermChange(item.query);
                        setIsOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950 dark:hover:text-amber-200 transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-700/60"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Guide */}
          <div className="p-2.5 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 px-4">
            <span>
              💡 성함 <b>초성</b>(예: <kbd className="font-mono font-bold bg-white dark:bg-stone-800 px-1 py-0.5 rounded">ㄱㅇㅅ</kbd>) 또는 <b>전화 뒷 4자리</b>로 가장 빠르게 찾을 수 있습니다.
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 font-bold cursor-pointer"
            >
              닫기 (ESC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
