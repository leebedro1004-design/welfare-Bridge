import React, { useState } from 'react';
import { CaseDocument, ClientProfile, ConsultationInsight, DocumentType, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import {
  ConsultationNotesDetectionResult,
  getLatestConsultationNotesForClient,
  executeSmartFillApi,
  applySmartFillToDocument,
  SmartFillApiResult,
} from '../utils/smartFillHelper';
import {
  Wand2,
  Sparkles,
  X,
  FileText,
  User,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

interface SmartFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: CaseDocument;
  client: ClientProfile;
  documents?: CaseDocument[];
  consultationInsights?: ConsultationInsight[];
  userSettings?: UserSettings;
  onApply: (updatedDoc: CaseDocument, filledCount: number, summaryMessage: string) => void;
}

export const SmartFillModal: React.FC<SmartFillModalProps> = ({
  isOpen,
  onClose,
  doc,
  client,
  documents = [],
  consultationInsights = [],
  userSettings,
  onApply,
}) => {
  const [detectionResult, setDetectionResult] = useState<ConsultationNotesDetectionResult>(() =>
    getLatestConsultationNotesForClient(client, doc, documents, consultationInsights)
  );
  const [editableNotes, setEditableNotes] = useState<string>(detectionResult.notes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const docMeta = DOCUMENT_TYPE_LABELS[doc.documentType] || {
    label: doc.documentType,
    short: '서식',
    step: 1,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: '공식 법정 기록 서식',
    pdfPages: '1~3p',
    category: '접수/사정',
  };

  const handleResetNotes = () => {
    const fresh = getLatestConsultationNotesForClient(client, doc, documents, consultationInsights);
    setDetectionResult(fresh);
    setEditableNotes(fresh.notes);
    setErrorMessage(null);
  };

  const handleExecuteSmartFill = async () => {
    if (!editableNotes.trim()) {
      setErrorMessage('분석 및 자동채우기에 사용할 상담 기록(Consultation Notes)을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await executeSmartFillApi({
        documentType: doc.documentType,
        consultationNotes: editableNotes,
        clientProfile: client,
        currentDocument: doc,
      });

      const { updatedDoc, filledCount } = applySmartFillToDocument(doc, response.data);

      const successMsg = `✨ 스마트 필 완료: 최근 상담 기록을 정밀 분석하여 현재 [${docMeta.short}]의 ${filledCount}개 주요 항목을 성공적으로 자동 작성했습니다.`;
      onApply(updatedDoc, filledCount, successMsg);
      onClose();
    } catch (err: any) {
      console.error('Smart Fill Execution Error:', err);
      setErrorMessage(err.message || '스마트 필 작업 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E1916] rounded-2xl border-2 border-indigo-400 dark:border-indigo-600 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 text-indigo-200 border border-white/20 shadow-xs">
              <Wand2 className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Gemini AI 스마트 필 (Smart Fill)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-indigo-500/80 text-white border border-indigo-300/40">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                최근 상담 기록(음성 녹취/상담 메모)을 심층 분석하여 현재 열린 서식 항목을 자동으로 채웁니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Form & Client Metadata Card */}
        <div className="bg-stone-50 dark:bg-[#251F1C] px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 dark:text-stone-400 font-medium">대상 어르신:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              {client.name} 어르신 ({client.age}세, {client.livingType})
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                client.riskLevel === '고위험'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {client.riskLevel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 dark:text-stone-400 font-medium">현재 적용 서식:</span>
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${docMeta.badgeColor}`}>
              {docMeta.label}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Notes Source Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  감지된 상담 기록 소스: {detectionResult.sourceTitle}
                </span>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  기록 일자: {detectionResult.detectedDate} · 필요 시 아래 입력창에서 내용을 자유롭게 수정하거나 추가할 수 있습니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetNotes}
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="원래 감지된 상담 기록으로 되돌리기"
            >
              <RefreshCw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          </div>

          {/* Editable Consultation Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-indigo-600" />
                <span>스마트 필에 반영할 최근 상담 기록 및 현장 메모 (Consultation Notes)</span>
              </label>
              <span className="text-stone-400 font-mono text-[11px]">
                {editableNotes.length}자
              </span>
            </div>

            <textarea
              value={editableNotes}
              onChange={(e) => setEditableNotes(e.target.value)}
              rows={7}
              placeholder="상담 녹취록 또는 현장 방문 메모를 입력하세요..."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Target Fields Preview Blueprint */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 bg-stone-50/60 dark:bg-[#1a1614] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>현재 서식({docMeta.short})에서 자동 채워질 법정 항목 안내:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">신체 및 일상기능</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  만성질환, 보행안정성, ADL, 낙상위험도
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">주거 및 환경안전</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  실내 문턱, 화장실, 위생, 주거상태
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">정서 및 고립도</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  우울감, 가족관계망, 심리 상태
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">주요 복지 욕구</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  식사결식, 안전손잡이, 정기안부
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">사회복지사 소견</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  전문 개입 필요성, 위기도 판정
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#251F1C] border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">서식 고유 세부항목</span>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">
                  {docMeta.short} 맞춤 신청사유 및 세부항목
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-[#251F1C] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px]">
            <Info className="w-3.5 h-3.5" />
            <span>기존에 작성된 무관한 항목은 유지되며, 관련 항목만 정밀 업데이트됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              취소
            </button>

            <button
              id="btn-confirm-smart-fill"
              type="button"
              onClick={handleExecuteSmartFill}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini 분석 및 자동 작성 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>스마트 필 적용하기</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
