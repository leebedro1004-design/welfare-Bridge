import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Save,
  Printer,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  CheckSquare,
  Shield,
  HelpCircle,
  Wand2,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Sliders,
  Layers
} from 'lucide-react';
import { CaseDocument, ClientProfile, DocumentType, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS, ORDERED_DOC_TYPES, createEmptyDocument } from '../utils/documentTemplates';
import { CONDITION_PRESETS, ConditionPresetId } from '../data/conditionPresets';
import { DocumentAuditModal } from './DocumentAuditModal';
import { IntakeFormView } from './forms/IntakeFormView';
import { AssessmentFormView } from './forms/AssessmentFormView';
import { ScoringFormView } from './forms/ScoringFormView';
import { ConferenceFormView } from './forms/ConferenceFormView';
import { ServicePlanFormView } from './forms/ServicePlanFormView';
import { AgreementFormView } from './forms/AgreementFormView';
import { MonitoringFormView } from './forms/MonitoringFormView';
import { ReassessmentFormView } from './forms/ReassessmentFormView';
import { TerminationFormView } from './forms/TerminationFormView';
import { ReferralFormView } from './forms/ReferralFormView';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FormEditorProps {
  currentDocument: CaseDocument | null;
  clients: ClientProfile[];
  userSettings?: UserSettings;
  onSaveDocument: (doc: CaseDocument) => void;
  onSelectClientForNewDoc?: (client: ClientProfile) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  currentDocument,
  clients,
  userSettings,
  onSaveDocument,
}) => {
  // Form active document state
  const [doc, setDoc] = useState<CaseDocument>(() => {
    if (currentDocument) return currentDocument;
    return createEmptyDocument('intake', clients[0]);
  });

  const [activeDocType, setActiveDocType] = useState<DocumentType>(
    currentDocument?.documentType || 'intake'
  );
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<ConditionPresetId>('standard');
  const [presetAppliedToast, setPresetAppliedToast] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Sync with incoming prop
  useEffect(() => {
    if (currentDocument) {
      setDoc(currentDocument);
      setActiveDocType(currentDocument.documentType);
    }
  }, [currentDocument]);

  // Apply condition preset template to current active document
  const handleApplyConditionPreset = (presetId: ConditionPresetId) => {
    const preset = CONDITION_PRESETS[presetId];
    if (!preset) return;

    setDoc((prev) => {
      const updated = { ...prev };
      updated.riskLevel = preset.riskLevel;
      if (preset.keyProblems && preset.keyProblems.length > 0) {
        updated.primaryNeeds = [...preset.keyProblems];
      }
      if (preset.recommendedServices && preset.recommendedServices.length > 0) {
        updated.recommendedServices = preset.recommendedServices.map((s) => ({
          serviceName: s.serviceName,
          category: s.category,
          frequency: s.frequency,
          purpose: s.purpose,
          provider: s.provider,
        }));
      }
      if (preset.shortTermGoals && preset.shortTermGoals.length > 0) {
        updated.shortTermGoals = [...preset.shortTermGoals];
      }
      if (preset.longTermGoals && preset.longTermGoals.length > 0) {
        updated.longTermGoals = [...preset.longTermGoals];
      }
      if (preset.workerOpinionTemplate) {
        updated.socialWorkerOpinion = preset.workerOpinionTemplate;
      }
      if (preset.physicalHealthTemplate) {
        updated.physicalHealthStatus = preset.physicalHealthTemplate;
      }
      if (preset.emotionalCognitiveTemplate) {
        updated.emotionalCognitiveStatus = preset.emotionalCognitiveTemplate;
      }
      if (preset.housingEnvironmentTemplate) {
        updated.housingEnvironment = preset.housingEnvironmentTemplate;
      }
      if (preset.economicStatusTemplate) {
        updated.economicStatus = preset.economicStatusTemplate;
      }
      if (preset.adlDefaultScores) {
        updated.adlScores = { ...preset.adlDefaultScores };
      }
      if (preset.iadlDefaultScores) {
        updated.iadlScores = { ...preset.iadlDefaultScores };
      }
      if (preset.sgdsDefaultScore !== undefined) {
        updated.depressionScore = preset.sgdsDefaultScore;
      }

      updated.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      return updated;
    });

    setPresetAppliedToast(`[${preset.name}] 서식 템플릿이 성공적으로 적용되었습니다.`);
    setIsPresetModalOpen(false);
    setTimeout(() => setPresetAppliedToast(null), 3000);
  };


  // Handle document type tab switch
  const handleSwitchDocType = (type: DocumentType) => {
    setActiveDocType(type);
    if (doc.documentType !== type) {
      // Find matching client
      const matchedClient = clients.find((c) => c.id === doc.clientId) || clients[0];
      const newBlank = createEmptyDocument(type, matchedClient);
      setDoc({
        ...newBlank,
        clientName: doc.clientName || matchedClient?.name || '',
        clientId: doc.clientId || matchedClient?.id || '',
        author: doc.author,
      });
    }
  };

  // Client change handler
  const handleClientChange = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      setDoc((prev) => ({
        ...prev,
        clientId: selected.id,
        clientName: selected.name,
        title: `${selected.name} 어르신 ${DOCUMENT_TYPE_LABELS[doc.documentType].short} (${new Date().toISOString().slice(0, 10)})`,
        riskLevel: selected.riskLevel,
      }));
    }
  };

  // Field change handler
  const handleFieldChange = (field: keyof CaseDocument, value: any) => {
    setDoc((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }));
  };

  // Specific nested field change handler
  const handleSpecificFieldChange = (field: string, value: any) => {
    setDoc((prev) => ({
      ...prev,
      formSpecificFields: {
        ...prev.formSpecificFields,
        [field]: value,
      },
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }));
  };

  // Save Document
  const handleSave = () => {
    onSaveDocument(doc);
    setSaveToast(true);
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.9 } });
    } catch (e) {}
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Export as Official Public Submission PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    setPdfToast('재가노인지원서비스 표준 서식 PDF 문서를 렌더링 중입니다...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add subsequent pages if document is multi-page
      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `[표준서식]_${doc.clientName || '어르신'}_${DOCUMENT_TYPE_LABELS[doc.documentType].short}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      setPdfToast(`${fileName} 다운로드가 완료되었습니다.`);
      try {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.9 } });
      } catch (e) {}
      setTimeout(() => setPdfToast(null), 3500);
    } catch (error) {
      console.error('PDF Export failed:', error);
      setPdfToast('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(Ctrl+P)를 이용해 주세요.');
      setTimeout(() => setPdfToast(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${doc.clientName || '어르신'}_${DOCUMENT_TYPE_LABELS[doc.documentType].short}_${doc.createdAt.slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Matched client info
  const clientInfo = clients.find((c) => c.id === doc.clientId);

  return (
    <div className="space-y-6">
      {/* 10-Step Standard Lifecycle Stepper (Page 1 ~ 25) */}
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800/80 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>재가노인지원서비스 10단계 표준 사례관리 서식 체계</span>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            보건복지부 노인보건복지 사업안내 & 한국재가노인복지협회 매뉴얼 기준
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {ORDERED_DOC_TYPES.map((type) => {
            const info = DOCUMENT_TYPE_LABELS[type];
            const isSelected = activeDocType === type;
            return (
              <button
                key={type}
                onClick={() => handleSwitchDocType(type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-start gap-0.5 cursor-pointer text-left shrink-0 ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs dark:bg-amber-700'
                    : 'bg-stone-50 dark:bg-[#251E1A] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}>
                    {info.step}
                  </span>
                  <span>{info.short}</span>
                </div>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                  {info.pdfPages}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar / Actions Bar */}
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Left: Document Info & Client Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${DOCUMENT_TYPE_LABELS[doc.documentType].badgeColor}`}>
            {DOCUMENT_TYPE_LABELS[doc.documentType].label}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">대상 어르신:</span>
            <select
              value={doc.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="text-xs font-bold text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age}세, {c.livingType} / {c.welfareType})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">결재 상태:</span>
            <select
              value={doc.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#251F1C] px-2.5 py-1.5 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
            >
              <option value="임시저장">임시저장</option>
              <option value="작성완료">작성완료</option>
              <option value="결재완료">결재완료 (승인)</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Condition Preset Template Picker */}
          <button
            id="btn-open-condition-preset"
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer shadow-xs"
            title="고위험/경증/저장강박 등 어르신 상태별 표준 템플릿 즉시 로드"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>상태별 표준 프리셋</span>
          </button>

          {/* AI Document Audit Button */}
          <button
            id="btn-open-doc-audit"
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer shadow-xs"
            title="복지부 가이드라인 준수 및 누락항목 AI 실시간 검수"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>AI 서식 실시간 검수</span>
          </button>


          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 cursor-pointer"
            title="JSON 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            id="btn-export-pdf-official"
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            title="관공서 제출용 표준 양식 PDF 즉시 다운로드"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600 dark:text-rose-400" />
                <span>PDF 생성 중...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>관공서 제출용 PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 cursor-pointer"
            title="브라우저 인쇄"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄</span>
          </button>

          <button
            id="btn-save-case-document"
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>서식 저장하기</span>
          </button>
        </div>
      </div>

      {/* AI Document Audit Inspection Modal */}
      <DocumentAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        document={doc}
        client={clientInfo}
        onApplyRefinement={(field, text) => {
          handleFieldChange(field as keyof CaseDocument, text);
        }}
      />

      {/* Condition Preset Template Selection Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in my-8">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    어르신 상태별 표준 사례관리 서식 템플릿 프리셋
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    실제 현장 유형(고위험, 경증, 위기구호, 저장강박 등)에 맞춤화된 전문 사정·계획 문구를 1초 만에 불러옵니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(Object.keys(CONDITION_PRESETS) as ConditionPresetId[]).map((key) => {
                  const preset = CONDITION_PRESETS[key];
                  const isSelected = selectedPresetId === key;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(key)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#251F1C] hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${preset.badgeColor}`}>
                          {preset.badge}
                        </span>
                        <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                          위기도: {preset.riskLevel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mb-2 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="text-[10px] text-teal-800 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/60 px-2 py-1 rounded">
                        <strong>주요 지원:</strong> {preset.recommendedServices.map((s) => s.serviceName).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preset Detail Preview */}
              {selectedPresetId && (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-2.5 text-xs">
                  <h4 className="font-bold text-stone-800 dark:text-stone-200">
                    선택된 프리셋 사정 및 서비스 계획 미리보기
                  </h4>
                  <div className="space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    <p>• <strong>신체·건강 템플릿:</strong> {CONDITION_PRESETS[selectedPresetId].physicalHealthTemplate}</p>
                    <p>• <strong>정서·인지 템플릿:</strong> {CONDITION_PRESETS[selectedPresetId].emotionalCognitiveTemplate}</p>
                    <p>• <strong>사회복지사 총괄 소견:</strong> {CONDITION_PRESETS[selectedPresetId].workerOpinionTemplate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2 bg-stone-50 dark:bg-[#251F1C]">
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleApplyConditionPreset(selectedPresetId)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-700 hover:bg-teal-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>현재 서식에 템플릿 적용하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {presetAppliedToast && (
        <div className="fixed bottom-28 right-6 z-50 bg-teal-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-teal-500/40 flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{presetAppliedToast}</span>
        </div>
      )}


      {pdfToast && (
        <div className="fixed bottom-18 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-rose-500/40 flex items-center gap-2 animate-slide-in">
          <FileCheck className="w-4 h-4 text-rose-400" />
          <span>{pdfToast}</span>
        </div>
      )}

      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{doc.title} 문서가 정상적으로 저장되었습니다.</span>
        </div>
      )}

      {/* Main Standard Document Sheet (Printable Layout) */}
      <div
        ref={printRef}
        id="printable-case-sheet"
        className="bg-white dark:bg-[#1E1916] border border-stone-300 dark:border-stone-700 rounded-xl shadow-sm p-6 sm:p-10 text-stone-900 dark:text-stone-100 max-w-4xl mx-auto space-y-8 font-sans print:border-none print:shadow-none print:p-0 print:bg-white print:text-black"
      >
        {/* Top Approval Box for Official Public Submissions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
              {userSettings?.institutionName || '재가노인지원서비스'} 표준 사례관리 양식 {DOCUMENT_TYPE_LABELS[doc.documentType].pdfPages}
            </div>
            <div className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <span>대상자: {doc.clientName} (ID: {doc.clientId || 'ct-001'})</span>
              {doc.status && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  doc.status === '결재완료' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {doc.status}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Approval Stamp Grid based on User Settings */}
          {(() => {
            const stepTitles = userSettings?.approvalStepTitles || ['담당자', '선임/팀장', '센터장'];
            return (
              <div className="border border-stone-400 dark:border-stone-600 text-[11px] rounded overflow-hidden shadow-2xs">
                <div className="flex bg-stone-100 dark:bg-[#251E1A] text-center font-bold border-b border-stone-300 dark:border-stone-700">
                  <div className="p-1 border-r border-stone-300 dark:border-stone-700 w-8 flex items-center justify-center bg-stone-200 dark:bg-[#2F2722] text-[10px]">
                    결<br/>재
                  </div>
                  {stepTitles.map((title, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-1.5 w-16 ${sIdx < stepTitles.length - 1 ? 'border-r border-stone-300 dark:border-stone-700' : ''}`}
                    >
                      {title}
                    </div>
                  ))}
                </div>
                <div className="flex text-center h-12">
                  <div className="border-r border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#201A17] w-8"></div>
                  {stepTitles.map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className={`w-16 flex flex-col items-center justify-center p-1 font-medium ${
                        sIdx < stepTitles.length - 1 ? 'border-r border-stone-300 dark:border-stone-700' : ''
                      }`}
                    >
                      {sIdx === 0 ? (
                        <div className="text-stone-800 dark:text-stone-200 text-xs">
                          {doc.author.replace('사회복지사', '').trim() || userSettings?.workerName || '이현정'}
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">(인)</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 dark:text-stone-500 text-[10px]">
                          {doc.status === '결재완료' ? '승인(인)' : '(서명)'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Dynamic 10-Form Sub-Component Render */}
        {doc.documentType === 'intake' && (
          <IntakeFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'assessment' && (
          <AssessmentFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'scoring' && (
          <ScoringFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'case_conference' && (
          <ConferenceFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'service_plan' && (
          <ServicePlanFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'agreement' && (
          <AgreementFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'monitoring' && (
          <MonitoringFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'reassessment' && (
          <ReassessmentFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'termination' && (
          <TerminationFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {doc.documentType === 'referral' && (
          <ReferralFormView
            doc={doc}
            client={clientInfo}
            onChange={handleFieldChange}
            onSpecificChange={handleSpecificFieldChange}
          />
        )}

        {/* Bottom Official Seal Footer */}
        <div className="pt-8 border-t border-stone-300 dark:border-stone-700 text-center space-y-2">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            본 사례관리 서식은 재가노인지원서비스 운영규정 및 보건복지부 노인보건복지 사업안내 지침에 의거하여 작성되었습니다.
          </div>
          <div className="text-base font-bold text-stone-800 dark:text-stone-200 tracking-wider">
            (사)굿실버복지회 부설 굿실버노인복지센터 (재가노인지원서비스사업)
          </div>
        </div>
      </div>
    </div>
  );
};
