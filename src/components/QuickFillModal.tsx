import React, { useState } from 'react';
import { CaseDocument, ClientProfile, ConsultationInsight, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import {
  QuickFillPreviewField,
  getQuickFillPreviewFields,
  applyQuickFillToDocument,
} from '../utils/quickFillHelper';
import {
  Zap,
  X,
  User,
  Activity,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  Tag,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface QuickFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: CaseDocument;
  client: ClientProfile;
  insight: ConsultationInsight;
  userSettings?: UserSettings;
  onApply: (updatedDoc: CaseDocument, filledCount: number, summaryMessage: string) => void;
}

export const QuickFillModal: React.FC<QuickFillModalProps> = ({
  isOpen,
  onClose,
  doc,
  client,
  insight,
  userSettings,
  onApply,
}) => {
  const [includeProfile, setIncludeProfile] = useState<boolean>(true);
  const [includeInsights, setIncludeInsights] = useState<boolean>(true);
  const [includeServices, setIncludeServices] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('전체');

  if (!isOpen) return null;

  const previewFields = getQuickFillPreviewFields(doc, client, insight, userSettings);
  const docMeta = DOCUMENT_TYPE_LABELS[doc.documentType] || {
    label: doc.documentType,
    short: '서식',
    step: 1,
    badgeColor: '',
    description: '',
    pdfPages: '',
    category: '접수/사정' as const,
  };

  const categories = ['전체', '기본 인적사항', '신체 및 건강', '주거 및 환경', '상담 및 욕구', '사회복지사 소견', '서비스 계획'];

  const filteredPreview = activeCategoryFilter === '전체'
    ? previewFields
    : previewFields.filter((f) => f.category === activeCategoryFilter);

  const handleConfirm = () => {
    const result = applyQuickFillToDocument(doc, client, insight, userSettings);
    const summaryMsg = `'${client.name}' 어르신 프로필 및 최근 상담 인사이트(${insight.keyIssues.join(', ')})를 기반으로 총 ${result.filledFieldCount}개 항목이 ${docMeta.label}에 자동 반영되었습니다.`;
    onApply(result.updatedDoc, result.filledFieldCount, summaryMsg);
    onClose();
  };

  return (
    <div
      id="modal-quick-fill-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-quick-fill-content"
        className="relative w-full max-w-4xl bg-white dark:bg-[#1E1916] rounded-2xl shadow-2xl border border-amber-300/80 dark:border-amber-700/60 overflow-hidden flex flex-col max-h-[92vh] text-stone-800 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-amber-100 fill-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  서식 퀵필 (Quick-Fill) 자동채우기
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/25 text-white">
                  원클릭 데이터 연동
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                현재 어르신 프로필 및 최근 상담 녹취 인사이트를 불러와 법정 공통 서식 항목을 일괄 사전 완성합니다.
              </p>
            </div>
          </div>
          <button
            id="btn-close-quick-fill-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Document Header Banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 dark:text-stone-400 font-medium">반영 대상 서식:</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold shadow-xs">
              [{docMeta.step}단계] {docMeta.label}
            </span>
            <span className="text-stone-600 dark:text-stone-300">
              (현재 문서: <strong className="text-stone-900 dark:text-stone-100">{doc.title}</strong>)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
              총 {previewFields.length}개 항목 자동완성 준비됨
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Data Sources Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Card A: Client Profile */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-[#251E1A] space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>연동 소스 1: 어르신 기본 프로필</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  {client.status || '진행중'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-stone-900 dark:text-stone-100">
                    {client.name} <span className="text-xs font-normal text-stone-500">({client.gender}, {client.age}세)</span>
                  </span>
                  <span className="font-mono text-stone-500 text-[11px]">생일: {client.birthDate}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                    {client.livingType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                    {client.welfareType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[11px] font-semibold">
                    {client.longTermCareStatus || '장기요양 등급외'}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 space-y-1 text-stone-600 dark:text-stone-400">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{client.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{client.phone}</span>
                    {client.emergencyContact && (
                      <span className="text-stone-500 text-[11px] ml-2">
                        (비상: {client.emergencyContact.name} - {client.emergencyContact.relation})
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-stone-700 dark:text-stone-300 font-medium">
                      {client.chronicDiseases.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Card B: Recent Consultation Insight */}
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/60 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                  <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>연동 소스 2: 최근 상담 인사이트</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    insight.riskLevel === '고위험'
                      ? 'bg-rose-600 text-white'
                      : insight.riskLevel === '중위험'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {insight.riskLevel}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                    {insight.timestamp}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    ■ 최근 상담 3줄 핵심 요약:
                  </div>
                  {insight.threeLineSummary.map((line, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 pl-2 border-l-2 border-amber-400 dark:border-amber-600"
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[11px] text-stone-500 font-medium">핵심 이슈:</span>
                  {insight.keyIssues.map((issue, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200"
                    >
                      #{issue}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-stone-800 dark:text-stone-200 bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <strong className="text-amber-900 dark:text-amber-300">추천 개입:</strong>{' '}
                  {insight.recommendedService}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Quick-Fill Options & Preview */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                  서식 자동채우기 상세 매핑 내역 ({previewFields.length}건)
                </h4>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      activeCategoryFilter === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Table / List */}
            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-[#1E1916] max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-[#251E1A] text-stone-500 dark:text-stone-400 sticky top-0 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-2.5 font-bold w-28">분류</th>
                    <th className="p-2.5 font-bold w-36">항목명</th>
                    <th className="p-2.5 font-bold w-24">데이터 출처</th>
                    <th className="p-2.5 font-bold">사전 반영될 내용 미리보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {filteredPreview.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                    >
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100">
                        {item.label}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            item.source === 'client_profile'
                              ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                              : item.source === 'consultation_insight'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          }`}
                        >
                          {item.source === 'client_profile'
                            ? '프로필'
                            : item.source === 'consultation_insight'
                            ? '상담인사이트'
                            : '종합매핑'}
                        </span>
                      </td>
                      <td className="p-2.5 text-stone-700 dark:text-stone-300 font-mono text-[11px] leading-relaxed">
                        <span className="line-clamp-2">{item.previewValue}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick-fill execution notice */}
            <div className="flex items-center gap-2 p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>참고:</strong> 퀵필 실행 시 기존에 수기 입력된 서식 데이터 중 해당 공통 항목이 최신 프로필 및 상담 인사이트로 부드럽게 갱신되며, 변경사항은 즉시 편집창에 반영됩니다.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-[#251E1A] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            id="btn-cancel-quick-fill"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
          >
            취소
          </button>

          <div className="flex items-center gap-3">
            <button
              id="btn-apply-quick-fill-modal-submit"
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>지금 서식에 퀵필 적용하기 ({previewFields.length}개 항목)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
