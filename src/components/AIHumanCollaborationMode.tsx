import React, { useState } from 'react';
import { 
  Sparkles, Check, RefreshCw, Undo2, CheckCheck, 
  HelpCircle, Eye, EyeOff, Bot, UserCheck, ShieldCheck,
  ChevronRight, ArrowRight, FileCheck, Layers, Info
} from 'lucide-react';
import { CaseDocument, DocumentType } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

export interface AICollaborationReviewItem {
  id: string;
  fieldKey: string;
  label: string;
  category: '기본·인적' | '신체·건강' | '정서·환경' | '욕구·소견' | '서비스계획';
  aiDraft: string;
  confidence: number; // 0 ~ 100
  rationale: string; // 근거 문구
  suggestedAlternatives?: string[];
  status: 'accepted' | 'modified' | 'pending';
}

interface AIHumanCollaborationModeProps {
  isOpen: boolean;
  onClose: () => void;
  document: CaseDocument;
  onApplyFieldUpdate: (fieldKey: string, value: any) => void;
  onApplyBatchUpdates: (updates: Record<string, any>) => void;
}

export const AIHumanCollaborationMode: React.FC<AIHumanCollaborationModeProps> = ({
  isOpen,
  onClose,
  document,
  onApplyFieldUpdate,
  onApplyBatchUpdates,
}) => {
  // Extract editable items from the document
  const initialItems: AICollaborationReviewItem[] = React.useMemo(() => {
    const items: AICollaborationReviewItem[] = [];

    // 1. Title
    items.push({
      id: 'item-title',
      fieldKey: 'title',
      label: '문서 제목',
      category: '기본·인적',
      aiDraft: document.title || '',
      confidence: 98,
      rationale: '대상자 성명, 서식 유형 및 사정 작성일자를 공문서 표준 네이밍 규칙에 맞추어 생성',
      suggestedAlternatives: [
        `${document.clientName} 어르신 2026년 정기 ${DOCUMENT_TYPE_LABELS[document.documentType].short}`,
        `[긴급] ${document.clientName} 어르신 위기사례 개입 ${DOCUMENT_TYPE_LABELS[document.documentType].short}`,
      ],
      status: 'pending',
    });

    // 2. Risk rationale
    if (document.riskRationale || document.riskLevel) {
      items.push({
        id: 'item-riskRationale',
        fieldKey: 'riskRationale',
        label: '위기도 종합 판정 근거',
        category: '기본·인적',
        aiDraft: document.riskRationale || `${document.riskLevel} 판정: 고령 독거, 만성질환 및 결식 위험 복합 작용`,
        confidence: 94,
        rationale: '클라이언트 건강 상태 및 경제·주거 취약요인 가중치 분석 결과',
        suggestedAlternatives: [
          '만성 퇴행성 관절염 및 독거로 인한 일상생활 자립 제한 및 결식 고위험군',
          '기초생활수급자 독거노인으로서 주거환경 노후화 및 사회적 지지망 부재',
        ],
        status: 'pending',
      });
    }

    // 3. Physical Health Status
    items.push({
      id: 'item-physicalHealthStatus',
      fieldKey: 'physicalHealthStatus',
      label: '신체건강 및 ADL/IADL 상태',
      category: '신체·건강',
      aiDraft: document.physicalHealthStatus || '무릎 관절염 및 고혈압 투약 중. 보행 시 지팡이 사용하며 식사 준비에 어려움 호소.',
      confidence: 92,
      rationale: '상담 대화 중 호소한 신체 증상, 복약 및 보행/식사 일상수행능력(ADL) 추출',
      suggestedAlternatives: [
        '양측 퇴행성 무릎 관절염으로 계단 보행 및 장거리 외출 제한, 정기적 병원 동행 필요',
        '치아 결손 및 소화기능 저하로 연식 위주의 균형 잡힌 영양 식단 공급이 시급함',
      ],
      status: 'pending',
    });

    // 4. Emotional / Cognitive Status
    items.push({
      id: 'item-emotionalCognitiveStatus',
      fieldKey: 'emotionalCognitiveStatus',
      label: '정서·심리 및 인지 기능 상태',
      category: '정서·환경',
      aiDraft: document.emotionalCognitiveStatus || '시간/장소 지남력은 양호하나 배우자 사별 후 사회적 고립감과 가벼운 무기력감 표출.',
      confidence: 89,
      rationale: '지남력 문답 및 독거로 인한 우울감/외로움 척도(SGDS-K 연계) 분석',
      suggestedAlternatives: [
        '인지기능은 명확하나 외부 교류 단절로 인한 우울 점수 경계선(정기 말벗 정서지지 필요)',
        '단기 기억력 양호, 이웃과의 왕래가 적어 말벗 봉사자 정기 방문 결연 권장',
      ],
      status: 'pending',
    });

    // 5. Housing / Environment
    items.push({
      id: 'item-housingEnvironment',
      fieldKey: 'housingEnvironment',
      label: '주거 환경 및 안전 위협 요인',
      category: '정서·환경',
      aiDraft: document.housingEnvironment || '노후 다세대주택 거주. 화장실 문턱 높고 안전손잡이 부재로 낙상 위험 상존.',
      confidence: 91,
      rationale: '주거 형태, 난방, 화장실 문턱 등 낙상 안전 위해요소 사정 기록 추출',
      suggestedAlternatives: [
        '화장실 미끄럼 방지 매트 및 L자형 벽면 안전손잡이 긴급 설치 지원 필요',
        '싱크대 수전 누수 및 동절기 외풍 차단을 위한 단열 에어캡 시공 요망',
      ],
      status: 'pending',
    });

    // 6. Social Worker Opinion
    items.push({
      id: 'item-socialWorkerOpinion',
      fieldKey: 'socialWorkerOpinion',
      label: '사회복지사 종합 사정 소견',
      category: '욕구·소견',
      aiDraft: document.socialWorkerOpinion || '식생활 개선을 위한 밑반찬 배달과 주 1회 안부확인, 낙상예방 안전바 설치를 포함한 통합 사례관리 개입이 시급함.',
      confidence: 96,
      rationale: '보건복지부 재가노인지원서비스 8대 핵심영역 연계 표준 소견 문안 구성',
      suggestedAlternatives: [
        '경제적·신체적 취약도가 높은 고위험 독거노인으로서 즉시 사례관리형 대상자로 선정하여 다각적 자원 연계가 필수적임.',
        '결식 예방과 일상생활 잔존기능 유지를 최우선 목표로 설정하고 주기적 모니터링을 통한 안전망 구축 요망.',
      ],
      status: 'pending',
    });

    // 7. Goals
    items.push({
      id: 'item-shortTermGoals',
      fieldKey: 'shortTermGoals',
      label: '단기 개입 목표',
      category: '서비스계획',
      aiDraft: Array.isArray(document.shortTermGoals) ? document.shortTermGoals.join('\n• ') : (document.shortTermGoals || '결식 예방 밑반찬 배달\n• 주 1회 방문 안부확인'),
      confidence: 90,
      rationale: '초기 1~3개월 내 달성 가능한 구체적 행동 지표',
      status: 'pending',
    });

    return items;
  }, [document]);

  const [reviewItems, setReviewItems] = useState<AICollaborationReviewItem[]>(initialItems);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Sync edits when active item changes or loaded
  React.useEffect(() => {
    const currentValues: Record<string, string> = {};
    reviewItems.forEach((it) => {
      if (editedValues[it.id] === undefined) {
        currentValues[it.id] = it.aiDraft;
      }
    });
    setEditedValues((prev) => ({ ...currentValues, ...prev }));
  }, [reviewItems]);

  if (!isOpen) return null;

  const activeItem = reviewItems[activeItemIndex] || reviewItems[0];

  const handleUpdateItemStatus = (id: string, status: 'accepted' | 'modified') => {
    setReviewItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it))
    );
  };

  const handleApplyCurrent = () => {
    if (!activeItem) return;
    const value = editedValues[activeItem.id] || activeItem.aiDraft;
    
    if (activeItem.fieldKey === 'shortTermGoals' || activeItem.fieldKey === 'longTermGoals') {
      const arr = value.split('\n').map((s) => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
      onApplyFieldUpdate(activeItem.fieldKey, arr);
    } else {
      onApplyFieldUpdate(activeItem.fieldKey, value);
    }

    handleUpdateItemStatus(activeItem.id, value === activeItem.aiDraft ? 'accepted' : 'modified');
    setAppliedToast(`[${activeItem.label}] 항목이 서식에 즉시 반영되었습니다.`);
    setTimeout(() => setAppliedToast(null), 2500);

    if (activeItemIndex < reviewItems.length - 1) {
      setActiveItemIndex((prev) => prev + 1);
    }
  };

  const handleApplyAlternative = (altText: string) => {
    if (!activeItem) return;
    setEditedValues((prev) => ({ ...prev, [activeItem.id]: altText }));
  };

  const handleAcceptAll = () => {
    const updates: Record<string, any> = {};
    reviewItems.forEach((it) => {
      const val = editedValues[it.id] || it.aiDraft;
      if (it.fieldKey === 'shortTermGoals' || it.fieldKey === 'longTermGoals') {
        updates[it.fieldKey] = val.split('\n').map((s) => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
      } else {
        updates[it.fieldKey] = val;
      }
    });

    onApplyBatchUpdates(updates);
    setReviewItems((prev) => prev.map((it) => ({ ...it, status: 'accepted' })));
    setAppliedToast('전체 AI 초안 항목이 검토 완료되어 서식에 일괄 적용되었습니다!');
    setTimeout(() => {
      setAppliedToast(null);
      onClose();
    }, 1500);
  };

  const categories = ['전체', '기본·인적', '신체·건강', '정서·환경', '욕구·소견', '서비스계획'];
  const filteredItems = filterCategory === '전체'
    ? reviewItems
    : reviewItems.filter((it) => it.category === filterCategory);

  const completedCount = reviewItems.filter((it) => it.status !== 'pending').length;
  const progressPercent = Math.round((completedCount / reviewItems.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-5xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-r from-[#2F2520] via-[#261D19] to-[#1E1815] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  AI-인간 협업 항목별 검토 & 보완 수정 모드
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 font-black">
                  CO-PILOT
                </span>
              </div>
              <p className="text-xs text-stone-300 pt-0.5">
                AI가 추출한 초안 문장을 사회복지사가 항목별로 신뢰도와 근거를 확인하며 즉시 수정·보완합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">전체 초안 일괄 반영</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar & Filter */}
        <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251F1C] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-stone-700 dark:text-stone-300">검토 진행도:</span>
            <div className="w-32 bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-extrabold text-amber-700 dark:text-amber-400">
              {completedCount}/{reviewItems.length} ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-amber-800 text-white dark:bg-amber-700'
                    : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Split Layout: Left List, Right Inspector & Editor */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Items List */}
          <div className="md:col-span-4 border-r border-stone-200 dark:border-stone-800 overflow-y-auto p-3 space-y-2 bg-stone-50/40 dark:bg-[#1C1714]">
            {filteredItems.map((item) => {
              const actualIndex = reviewItems.findIndex((x) => x.id === item.id);
              const isSelected = actualIndex === activeItemIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItemIndex(actualIndex)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#251F1C] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      item.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'modified'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.status === 'accepted' && <Check className="w-3 h-3" />}
                      {item.status === 'modified' && <UserCheck className="w-3 h-3" />}
                      {item.status === 'pending' ? '검토대기' : item.status === 'accepted' ? '초안승인' : '수정반영'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {editedValues[item.id] || item.aiDraft}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: AI Rationale & Co-editing Canvas */}
          <div className="md:col-span-8 overflow-y-auto p-5 space-y-5 bg-white dark:bg-[#1E1916]">
            {activeItem ? (
              <div className="space-y-4">
                {/* Item Header & AI Confidence */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                      {activeItem.category} &gt; {activeItem.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
                      {activeItem.label} 검토 및 수정
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">AI 신뢰도:</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {activeItem.confidence}% 일치
                    </span>
                  </div>
                </div>

                {/* AI Rationale & Grounding Box */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>AI 초안 생성 근거 및 사정 사유</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-5">
                    {activeItem.rationale}
                  </p>
                </div>

                {/* Editable Draft Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>사회복지사 최종 반영 문장 (직접 수정 가능)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditedValues((prev) => ({ ...prev, [activeItem.id]: activeItem.aiDraft }))}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>원래 AI 초안으로 초기화</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={editedValues[activeItem.id] || ''}
                    onChange={(e) =>
                      setEditedValues((prev) => ({ ...prev, [activeItem.id]: e.target.value }))
                    }
                    placeholder="AI 초안 내용을 검토하고 보완할 내용을 직접 입력하세요..."
                    className="w-full text-xs font-medium p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed shadow-2xs"
                  />
                </div>

                {/* Alternative Suggestions */}
                {activeItem.suggestedAlternatives && activeItem.suggestedAlternatives.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>추천 대체 문장 (클릭 시 즉시 적용)</span>
                    </span>
                    <div className="space-y-1.5">
                      {activeItem.suggestedAlternatives.map((alt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyAlternative(alt)}
                          className="w-full text-left p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-colors text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between group cursor-pointer"
                        >
                          <span className="leading-relaxed">{alt}</span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0 ml-2 group-hover:underline">
                            선택 적용
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer for current item */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeItemIndex === 0}
                      onClick={() => setActiveItemIndex((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                    >
                      이전 항목
                    </button>
                    <button
                      type="button"
                      disabled={activeItemIndex === reviewItems.length - 1}
                      onClick={() => setActiveItemIndex((prev) => Math.min(reviewItems.length - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                    >
                      다음 항목
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCurrent}
                    className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>현재 항목 서식에 반영하고 다음으로</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Toast */}
        {appliedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-slide-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
