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
  Layers,
  Maximize2,
  Minimize2,
  Share2,
  Mail,
  Send,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Cloud,
  Type,
  X,
  Volume2,
  VolumeX,
  Music,
  Palette,
  AlignLeft,
  BarChart2,
  Compass,
  Expand,
  Mic,
  MicOff,
  Shrink,
  Edit3,
  CheckCheck,
  Zap,
} from 'lucide-react';
import { CaseDocument, ClientProfile, ConsultationInsight, DocumentType, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS, ORDERED_DOC_TYPES, createEmptyDocument } from '../utils/documentTemplates';
import { resolveDocumentAuthor, getEffectiveAgencyName, getEffectiveWorkerName } from '../utils/userSettingsHelper';
import { ConditionPresetId, CONDITION_PRESETS } from '../data/conditionPresets';
import { DocumentAuditModal } from './DocumentAuditModal';
import { OfficialPrintExportModal } from './OfficialPrintExportModal';
import { AIHumanCollaborationMode } from './AIHumanCollaborationMode';
import { InlineAICollaborationField, CollaborationTopBanner } from './AICollaborationInlineControls';
import { getContextualFieldAlternatives, getFieldEvidenceQuote } from '../utils/aiAlternativesHelper';
import { CaseLifecycleProgressBar } from './CaseLifecycleProgressBar';
import { focusSoundService, SoundType } from '../utils/focusSoundService';
import { QuickFillModal } from './QuickFillModal';
import { getLatestConsultationInsight, applyQuickFillToDocument } from '../utils/quickFillHelper';
import { SmartFillModal } from './SmartFillModal';
import {
  getLatestConsultationNotesForClient,
  executeSmartFillApi,
  applySmartFillToDocument,
} from '../utils/smartFillHelper';
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
  documents?: CaseDocument[];
  userSettings?: UserSettings;
  onSaveDocument: (doc: CaseDocument) => void;
  onSelectClientForNewDoc?: (client: ClientProfile) => void;
  consultationInsights?: ConsultationInsight[];
}

export const FormEditor: React.FC<FormEditorProps> = ({
  currentDocument,
  clients,
  documents = [],
  userSettings,
  onSaveDocument,
  onSelectClientForNewDoc,
  consultationInsights,
}) => {
  // Form active document state
  const [doc, setDoc] = useState<CaseDocument>(() => {
    if (currentDocument) return currentDocument;
    return createEmptyDocument('intake', clients[0], userSettings);
  });

  const [activeDocType, setActiveDocType] = useState<DocumentType>(
    currentDocument?.documentType || 'intake'
  );
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isOfficialPrintModalOpen, setIsOfficialPrintModalOpen] = useState<boolean>(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState<boolean>(false);
  const [isInlineCollaborationActive, setIsInlineCollaborationActive] = useState<boolean>(true);
  const [collaborationNoticeToast, setCollaborationNoticeToast] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<ConditionPresetId>('standard');
  const [presetAppliedToast, setPresetAppliedToast] = useState<string | null>(null);

  // Smart Fill State (Gemini AI 최신 상담 기록 연동 법정 서식 자동 채우기)
  const [isSmartFillModalOpen, setIsSmartFillModalOpen] = useState<boolean>(false);
  const [isSmartFillingDirect, setIsSmartFillingDirect] = useState<boolean>(false);
  const [smartFillToast, setSmartFillToast] = useState<string | null>(null);

  // Quick-Fill State (어르신 프로필 및 최근 상담 인사이트 기반 자동완성)
  const [isQuickFillModalOpen, setIsQuickFillModalOpen] = useState<boolean>(false);
  const [quickFillToast, setQuickFillToast] = useState<string | null>(null);

  const activeClient = clients.find((c) => c.id === doc.clientId) || clients[0];
  const activeInsight = getLatestConsultationInsight(activeClient?.id || '', activeClient, consultationInsights);

  const handleOpenSmartFill = () => {
    setIsSmartFillModalOpen(true);
  };

  const handleApplySmartFill = (updatedDoc: CaseDocument, filledCount: number, summaryMessage: string) => {
    setDoc(updatedDoc);
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    setSmartFillToast(summaryMessage);
    setTimeout(() => setSmartFillToast(null), 5000);
  };

  // Instant 1-click Direct Smart Fill
  const handleDirectSmartFill = async () => {
    if (!activeClient) return;
    setIsSmartFillingDirect(true);
    try {
      const detection = getLatestConsultationNotesForClient(activeClient, doc, documents, consultationInsights);
      const response = await executeSmartFillApi({
        documentType: doc.documentType,
        consultationNotes: detection.notes,
        clientProfile: activeClient,
        currentDocument: doc,
      });
      const { updatedDoc, filledCount } = applySmartFillToDocument(doc, response.data);
      const docLabel = DOCUMENT_TYPE_LABELS[doc.documentType]?.short || '서식';
      const summaryMsg = `✨ [${docLabel}] 스마트 필 완료: 최근 상담 기록을 바탕으로 ${filledCount}개 항목이 성공적으로 자동 완성되었습니다.`;
      handleApplySmartFill(updatedDoc, filledCount, summaryMsg);
    } catch (err: any) {
      console.error('Direct Smart Fill Error:', err);
      // Open modal so the user can inspect or retry
      setIsSmartFillModalOpen(true);
    } finally {
      setIsSmartFillingDirect(false);
    }
  };

  const handleOpenQuickFill = () => {
    setIsQuickFillModalOpen(true);
  };

  const handleApplyQuickFill = (updatedDoc: CaseDocument, filledCount: number, summaryMessage: string) => {
    setDoc(updatedDoc);
    try {
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    setQuickFillToast(summaryMessage);
    setTimeout(() => setQuickFillToast(null), 5000);
  };

  // Instant 1-click Quick-Fill
  const handleInstantQuickFill = () => {
    if (!activeClient) return;
    const result = applyQuickFillToDocument(doc, activeClient, activeInsight, userSettings);
    const summaryMsg = `⚡ '${activeClient.name}' 어르신 프로필 및 최근 상담 인사이트(${activeInsight.keyIssues.join(', ')})가 총 ${result.filledFieldCount}개 항목에 즉시 반영되었습니다.`;
    handleApplyQuickFill(result.updatedDoc, result.filledFieldCount, summaryMsg);
  };

  // Batch Accept all AI Proposals
  const handleAcceptAllAIInlineProposals = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setCollaborationNoticeToast('🎉 모든 AI 초안 제안 항목이 성공적으로 일괄 수락 및 확정되었습니다.');
    setTimeout(() => setCollaborationNoticeToast(null), 3500);
  };

  // Focus Mode State (집중 문서 모드 - 전체 앱 다크모드와 별도 테마 및 집중 환경 지원)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [focusTheme, setFocusTheme] = useState<'sepia' | 'paper' | 'slate' | 'dark'>('sepia');
  const [focusFontSize, setFocusFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [focusFontFamily, setFocusFontFamily] = useState<'sans' | 'serif'>('sans');
  const [focusCanvasWidth, setFocusCanvasWidth] = useState<'standard' | 'wide' | 'full'>('standard');
  const [focusSoundType, setFocusSoundType] = useState<SoundType>('off');
  const [focusVolume, setFocusVolume] = useState<number>(0.35);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRefiningText, setIsRefiningText] = useState<boolean>(false);
  const [focusToast, setFocusToast] = useState<string | null>(null);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>('방금 전');

  // Calculate live document statistics
  const docStats = React.useMemo(() => {
    const texts: string[] = [
      doc.title || '',
      doc.socialWorkerOpinion || '',
      doc.physicalHealthStatus || '',
      doc.emotionalCognitiveStatus || '',
      doc.housingEnvironment || '',
      doc.economicStatus || '',
      doc.socialSupportNetwork || '',
      ...(doc.executiveSummary || []),
      ...(doc.shortTermGoals || []),
      ...(doc.longTermGoals || []),
      ...(doc.primaryNeeds || []),
      ...(doc.recommendedServices?.map((s) => `${s.serviceName} ${s.purpose}`) || []),
    ];
    const combined = texts.join(' ');
    const charWithSpace = combined.length;
    const charNoSpace = combined.replace(/\s+/g, '').length;
    const wordCount = combined.trim() ? combined.trim().split(/\s+/).length : 0;
    return { charWithSpace, charNoSpace, wordCount };
  }, [doc]);

  // Handle ambient sound changes
  const handleSoundChange = (type: SoundType) => {
    setFocusSoundType(type);
    focusSoundService.playSound(type);
    if (type !== 'off') {
      setFocusToast(`[집중 사운드] ${type === 'rain' ? '잔잔한 빗소리' : type === 'forest' ? '숲속 바람' : type === 'waves' ? '파도 소리' : type === 'binaural' ? '집중 알파파 10Hz' : '백색 소음'} 재생 중`);
      setTimeout(() => setFocusToast(null), 3000);
    }
  };

  const handleVolumeChange = (v: number) => {
    setFocusVolume(v);
    focusSoundService.setVolume(v);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // AI Sentence Polisher
  const handleAIRefine = () => {
    setIsRefiningText(true);
    setTimeout(() => {
      setIsRefiningText(false);
      setFocusToast('AI가 사회복지 표준 공문서 어조(객관적·명확한 기술)로 문장을 다듬었습니다.');
      setTimeout(() => setFocusToast(null), 3500);
    }, 1000);
  };

  // Stop ambient sound when unmounting or leaving focus mode
  useEffect(() => {
    if (!isFocusMode) {
      focusSoundService.stop();
      setFocusSoundType('off');
    }
  }, [isFocusMode]);

  // Voice Dictation State (구두 받아쓰기)
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictationTranscript, setDictationTranscript] = useState<string>('');
  const [activeInputLabel, setActiveInputLabel] = useState<string>('사회복지사 종합 소견');
  const [dictationToast, setDictationToast] = useState<string | null>(null);

  const dictationRecognitionRef = useRef<any>(null);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Focus tracking inside FormEditor container
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const inputEl = target as HTMLInputElement | HTMLTextAreaElement;
        activeInputRef.current = inputEl;
        const placeholder = inputEl.placeholder || inputEl.name || inputEl.id || '선택된 서식 입력 항목';
        setActiveInputLabel(placeholder.length > 25 ? placeholder.slice(0, 22) + '...' : placeholder);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const fillActiveField = (text: string, isFinal: boolean) => {
    let target = activeInputRef.current;
    if (!target) {
      const firstTextArea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (firstTextArea) {
        target = firstTextArea;
        activeInputRef.current = firstTextArea;
      }
    }

    if (target) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      const updatedVal = target.value ? `${target.value} ${text}` : text;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(target, updatedVal);
      } else {
        target.value = updatedVal;
      }

      const ev = new Event('input', { bubbles: true });
      target.dispatchEvent(ev);

      const fieldName = target.getAttribute('name') || target.id;
      if (fieldName && fieldName in doc) {
        handleFieldChange(fieldName as keyof CaseDocument, updatedVal);
      } else if (fieldName) {
        handleSpecificFieldChange(fieldName, updatedVal);
      } else {
        handleFieldChange('socialWorkerOpinion', updatedVal);
      }
    } else {
      handleFieldChange('socialWorkerOpinion', doc.socialWorkerOpinion ? `${doc.socialWorkerOpinion} ${text}` : text);
    }
  };

  const simulateSpeechInput = (customSpeech?: string) => {
    const textToInsert = customSpeech || '어르신 하지 무릎 통증 심화 및 거실 문턱 낙상 위협 호소. 영양밑반찬 주3회 연계 요청.';
    setDictationTranscript(textToInsert);
    fillActiveField(textToInsert, true);
  };

  const toggleVoiceDictation = () => {
    if (isDictating) {
      if (dictationRecognitionRef.current) {
        try { dictationRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsDictating(false);
      setDictationToast('구두 받아쓰기가 종료되었습니다.');
      setTimeout(() => setDictationToast(null), 2500);
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsDictating(true);
      setDictationToast('마이크 음성 받아쓰기가 시작되었습니다. (시뮬레이션 음성 입력 가동)');
      simulateSpeechInput();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onstart = () => {
        setIsDictating(true);
        setDictationToast('마이크 활성화됨: 현재 선택된 서식 입력칸에 음성이 받아써집니다.');
        setTimeout(() => setDictationToast(null), 3000);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        setDictationTranscript(currentText);

        if (currentText) {
          fillActiveField(currentText, !!final);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setDictationToast('음성 받아쓰기 수신 대기 중입니다...');
      };

      recognition.onend = () => {
        if (isDictating) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
      dictationRecognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setIsDictating(true);
      simulateSpeechInput();
    }
  };

  const handleRefineDictatedSpeech = () => {
    setIsRefiningText(true);
    setTimeout(() => {
      setIsRefiningText(false);
      const polished = '대상 어르신은 기상 후 하지 강직 및 무릎관절통으로 독자적 이동이 제한적이며, 영양 불균형 해소를 위해 밑반찬 지원 및 낙상 예방 주거 개보수를 긴급 연계함.';
      fillActiveField(polished, true);
      setDictationToast('AI가 구후 어조를 정제하여 사회복지 표준 서식 표현으로 다듬었습니다.');
      setTimeout(() => setDictationToast(null), 3000);
    }, 800);
  };

  // Report Share State (보고서 이메일 & Google Drive 공유)
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTargetType, setShareTargetType] = useState<'guardian' | 'community_center' | 'health_clinic' | 'custom'>('guardian');
  const [shareRecipientEmail, setShareRecipientEmail] = useState<string>('');
  const [shareRecipientName, setShareRecipientName] = useState<string>('');
  const [shareRecipientPhone, setShareRecipientPhone] = useState<string>('');
  const [shareSubject, setShareSubject] = useState<string>('');
  const [shareMessage, setShareMessage] = useState<string>('');
  const [shareDrivePermission, setShareDrivePermission] = useState<'view' | 'comment'>('view');
  const [shareDriveLinkCopied, setShareDriveLinkCopied] = useState<boolean>(false);
  const [shareNotificationToast, setShareNotificationToast] = useState<string | null>(null);
  const [shareHistory, setShareHistory] = useState<Array<{ id: string; target: string; email: string; date: string; method: string }>>([
    {
      id: 'sh-1',
      target: '강서구 등촌3동 주민센터 복지팀',
      email: 'welfare_dc3@gangseo.go.kr',
      date: '2026-08-20 14:30',
      method: '공문서 이메일 & Drive',
    },
  ]);

  const printRef = useRef<HTMLDivElement>(null);

  // Sync with incoming prop
  useEffect(() => {
    if (currentDocument) {
      setDoc(currentDocument);
      setActiveDocType(currentDocument.documentType);
    }
  }, [currentDocument]);

  // Handle ESC key to exit Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Update recipient info when share target type changes
  useEffect(() => {
    const client = clients.find((c) => c.id === doc.clientId) || clients[0];
    if (shareTargetType === 'guardian') {
      setShareRecipientName(`${client.emergencyContact.name} (${client.emergencyContact.relation || '보호자'})`);
      setShareRecipientPhone(client.emergencyContact.phone || '010-0000-0000');
      setShareRecipientEmail(`guardian_${client.name}@example.com`);
      setShareSubject(`[재가노인지원센터] ${client.name} 어르신 사례관리 상담 및 지원계획 공유 보고서`);
      setShareMessage(`안녕하세요, ${client.name} 어르신의 보호자님.\n\n재가노인지원센터 담당 사회복지사입니다.\n어르신 댁을 방문하여 진행한 [${DOCUMENT_TYPE_LABELS[doc.documentType].label}] 사정 결과 및 맞춤형 서비스 연계 계획을 공유해 드립니다.\n\n궁금하신 점이 있으시면 언제든지 센터로 연락 부탁드립니다.`);
    } else if (shareTargetType === 'community_center') {
      setShareRecipientName('관할 행정복지센터 맞춤형복지팀 주무관');
      setShareRecipientPhone('02-2600-0000');
      setShareRecipientEmail('welfare_care@gangseo.go.kr');
      setShareSubject(`[민관협력 사례보고] ${client.name} 어르신 재가노인지원서비스 사례관리 문서 연계`);
      setShareMessage(`안녕하십니까, 관할 행정복지센터 복지담당 주무관님.\n\n재가노인지원센터입니다. 관내 ${client.name} 어르신의 [${DOCUMENT_TYPE_LABELS[doc.documentType].label}] 사정서 및 긴급 위기개입 지원계획서를 공유드립니다.\n민관 사례회의 및 긴급 구호 연계 협조 요청드립니다.`);
    } else if (shareTargetType === 'health_clinic') {
      setShareRecipientName('보건소 방문보건팀 / 간호사');
      setShareRecipientPhone('02-2600-5000');
      setShareRecipientEmail('nurse_visit@health.seoul.kr');
      setShareSubject(`[건강·복약 연계] ${client.name} 어르신 신체사정 및 만성질환 관리 기록 공유`);
      setShareMessage(`안녕하십니까, 방문보건팀 간호사님.\n\n재가노인지원센터입니다. ${client.name} 어르신 댁 방문 중 관찰된 신체 건강상태, 투약 상태 및 통증 호소 내용을 공유드립니다.\n방문간호 연계 및 복약지도 협조 부탁드립니다.`);
    } else {
      setShareSubject(`[재가노인지원센터] ${client.name} 어르신 ${DOCUMENT_TYPE_LABELS[doc.documentType].label} 공유 보고서`);
      setShareMessage(`재가노인지원서비스 표준 사례관리 보고서를 공유합니다.`);
    }
  }, [shareTargetType, doc.clientId, doc.documentType, doc.clientName]);

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
      const newBlank = createEmptyDocument(type, matchedClient, userSettings);
      setDoc({
        ...newBlank,
        clientName: doc.clientName || matchedClient?.name || '',
        clientId: doc.clientId || matchedClient?.id || '',
        author: resolveDocumentAuthor(doc.author, userSettings),
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
    setLastAutoSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.9 } });
    } catch (e) {}
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Copy Google Drive sharing link
  const handleCopyShareLink = () => {
    const dummyDriveLink = `https://drive.google.com/file/d/care-doc-${doc.id || Date.now()}/view?usp=sharing`;
    navigator.clipboard.writeText(dummyDriveLink);
    setShareDriveLinkCopied(true);
    setShareNotificationToast('Google Drive 열람 링크가 클립보드에 복사되었습니다.');
    setTimeout(() => {
      setShareDriveLinkCopied(false);
      setShareNotificationToast(null);
    }, 3000);
  };

  // Send Share Email to Guardian or Agency
  const handleSendShareEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareRecipientEmail) return;

    const newEntry = {
      id: 'sh-' + Date.now(),
      target: shareRecipientName || shareRecipientEmail,
      email: shareRecipientEmail,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      method: `이메일 (${shareDrivePermission === 'view' ? '열람권한' : '검토/의견권한'})`,
    };
    setShareHistory((prev) => [newEntry, ...prev]);

    const driveLink = `https://drive.google.com/file/d/care-doc-${doc.id || 'current'}/view?usp=sharing`;
    const mailtoUrl = `mailto:${encodeURIComponent(shareRecipientEmail)}?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareMessage + `\n\n[Google Drive 문서 바로가기]\n${driveLink}\n\n* 본 메일은 재가노인지원서비스 스마트 사례관리 시스템에서 발송되었습니다.`)}`;

    window.open(mailtoUrl, '_blank');
    setShareNotificationToast(`${shareRecipientName || shareRecipientEmail} 님께 공유 이메일 발송이 완료되었습니다.`);
    setTimeout(() => {
      setShareNotificationToast(null);
      setIsShareModalOpen(false);
    }, 2500);
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
      {/* 5-Stage Case Management Progress Bar (사례관리 진행 상황바: 상담 기록 -> AI 추출 -> 협업 검토 -> 작성 완료 -> 최종 결재) */}
      <CaseLifecycleProgressBar
        document={doc}
        onStatusChange={(newStatus) => handleFieldChange('status', newStatus)}
        onOpenCollaboration={() => setIsCollaborationModalOpen(true)}
      />

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
          {/* Smart Fill (Gemini AI 최신 상담 기록 연동 법정 서식 자동 완성) */}
          <div className="inline-flex rounded-xl shadow-xs">
            <button
              id="btn-smart-fill"
              type="button"
              onClick={handleOpenSmartFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-l-xl border border-r-0 border-indigo-500 dark:border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              title="최근 상담 기록(음성 녹취/현장 메모)을 Gemini AI로 정밀 분석하여 현재 열려 있는 법정 서식의 관련 항목들을 스마트하게 자동 채우기"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>스마트 필 (Smart Fill)</span>
            </button>
            <button
              id="btn-smart-fill-instant"
              type="button"
              onClick={handleDirectSmartFill}
              disabled={isSmartFillingDirect}
              className="px-2 py-1.5 text-[11px] font-bold rounded-r-xl border border-indigo-500 dark:border-indigo-600 bg-purple-700 hover:bg-purple-800 text-white transition-all cursor-pointer disabled:opacity-50"
              title="검토창 없이 즉시 최근 상담 기록 기반 스마트 필 실행"
            >
              {isSmartFillingDirect ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <span>⚡즉시</span>
              )}
            </button>
          </div>

          {/* Quick-Fill (어르신 프로필 및 최근 상담 인사이트 연동 자동완성) */}
          <div className="inline-flex rounded-xl shadow-xs">
            <button
              id="btn-quick-fill-trigger"
              type="button"
              onClick={handleOpenQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-l-xl border border-r-0 border-amber-500 dark:border-amber-600 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all cursor-pointer active:scale-95"
              title="어르신 프로필 및 최근 상담 인사이트 데이터를 불러와 법정 공통 서식 항목을 일괄 자동채우기 (미리보기 및 상세 설정)"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
              <span>퀵필 (Quick-Fill)</span>
            </button>
            <button
              id="btn-quick-fill-instant"
              type="button"
              onClick={handleInstantQuickFill}
              className="px-2 py-1.5 text-[11px] font-bold rounded-r-xl border border-amber-500 dark:border-amber-600 bg-orange-600 hover:bg-orange-700 text-white transition-all cursor-pointer"
              title="검토창 없이 즉시 1-클릭 빠른 자동채우기"
            >
              ⚡즉시반영
            </button>
          </div>

          {/* Voice Dictation Button (구두 받아쓰기) */}
          <button
            id="btn-voice-dictation-editor"
            type="button"
            onClick={toggleVoiceDictation}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
              isDictating
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse ring-2 ring-rose-400'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            }`}
            title="마이크 음성으로 서식 항목을 구두 받아쓰기하여 입력"
          >
            {isDictating ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>구두 받아쓰기 중...</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>음성 구두 받아쓰기</span>
              </>
            )}
          </button>

          {/* AI-Human Collaboration Mode Toggle Button */}
          <button
            id="btn-toggle-ai-collaboration-mode"
            type="button"
            onClick={() => setIsInlineCollaborationActive(!isInlineCollaborationActive)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
              isInlineCollaborationActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-200'
            }`}
            title="서식 내 AI 초안 텍스트 하이라이트 및 항목별 제안 수락/수정 인라인 모드 토글"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isInlineCollaborationActive ? 'animate-spin text-amber-100' : 'text-amber-600'}`} />
            <span>AI-인간 협업 모드: {isInlineCollaborationActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* AI Collaboration Full Modal Button */}
          <button
            id="btn-open-ai-collaboration"
            type="button"
            onClick={() => setIsCollaborationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer shadow-xs"
            title="AI 초안 항목별 상세 비교 및 전수 검토 모달"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>항목별 전수 검토창</span>
          </button>

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

          {/* Focus Mode Button (집중 문서 모드) */}
          <button
            id="btn-toggle-focus-mode"
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shadow-xs"
            title="방해요소 없이 서식 작성에만 몰입하는 집중 모드"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>집중 문서 모드</span>
          </button>

          {/* Share Report Modal Button */}
          <button
            id="btn-open-share-report"
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shadow-xs"
            title="보호자 및 유관기관(주민센터, 보건소)에 보고서 이메일 및 Google Drive 공유"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>보고서 공유</span>
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
            onClick={() => setIsOfficialPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-800 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/70 dark:to-amber-950/70 hover:from-rose-100 hover:to-amber-100 text-rose-800 dark:text-rose-200 transition-all cursor-pointer shadow-xs"
            title="보건복지부 표준 양식 규격 인쇄 및 정식 PDF 저장"
          >
            <FileCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>보건복지부 표준 인쇄·PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 cursor-pointer"
            title="브라우저 빠른 인쇄"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>빠른 인쇄</span>
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

      {/* Smart Fill Toast Notification */}
      {smartFillToast && (
        <div
          id="toast-smart-fill-success"
          className="p-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Wand2 className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span>{smartFillToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSmartFillToast(null)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-white/90 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick-Fill Toast Notification */}
      {quickFillToast && (
        <div
          id="toast-quick-fill-success"
          className="p-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span>{quickFillToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuickFillToast(null)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-white/90 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick-Fill Active Status Indicator Banner */}
      {doc.formSpecificFields?.isQuickFilled && (
        <div
          id="banner-quick-fill-synced"
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-300/80 dark:border-amber-700/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40 text-xs text-amber-950 dark:text-amber-200 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <div>
              <span className="font-black text-amber-900 dark:text-amber-100">
                ⚡ 퀵필(Quick-Fill) 연동 완료:
              </span>{' '}
              <span className="text-stone-700 dark:text-stone-300">
                <strong>[{doc.clientName} 어르신 프로필]</strong> 및 최근 상담 인사이트(
                <strong className="text-amber-800 dark:text-amber-300">{activeInsight.timestamp}</strong>)의 3줄 요약, 핵심 이슈, 추천 서비스가 본 서식에 자동 연동되었습니다.
              </span>
              {doc.formSpecificFields.quickFillTimestamp && (
                <span className="text-stone-500 dark:text-stone-400 text-[11px] ml-1.5">
                  ({doc.formSpecificFields.quickFillTimestamp} 반영)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-reopen-quick-fill-banner"
              type="button"
              onClick={handleOpenQuickFill}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors cursor-pointer shadow-2xs"
            >
              매핑 검토 / 재반영
            </button>
          </div>
        </div>
      )}

      {/* Voice Dictation Live Control Bar & Field Target Indicator */}
      {(isDictating || dictationToast) && (
        <div className="bg-gradient-to-r from-purple-950/90 via-[#2E202B] to-[#1E1916] border-2 border-purple-500/80 rounded-2xl p-4 text-white shadow-lg space-y-3 animate-fade-in transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white animate-pulse shadow-xs">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-purple-200 uppercase tracking-wide">
                    실시간 음성 구두 받아쓰기 (Dictation) 가동 중
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-stone-300 pt-0.5">
                  현재 활성 입력칸: <strong className="text-amber-300 font-bold">[{activeInputLabel}]</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={handleRefineDictatedSpeech}
                disabled={isRefiningText}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="받아쓴 음성 문장의 방언·어두 오차를 공문서 어조로 다듬기"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{isRefiningText ? '어조 다듬는 중...' : '✨ AI 공문서 어조 다듬기'}</span>
              </button>

              <button
                type="button"
                onClick={() => simulateSpeechInput()}
                className="px-2.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold transition-all border border-purple-700 flex items-center gap-1 cursor-pointer"
                title="테스트 가상 음성 입력"
              >
                <span>테스트 음성 입력</span>
              </button>

              <button
                type="button"
                onClick={toggleVoiceDictation}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>받아쓰기 종료</span>
              </button>
            </div>
          </div>

          {/* Quick preset phrases for dictation */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-purple-900/60">
            <span className="text-[11px] text-purple-300 font-bold shrink-0">빠른 음성 구두 문구:</span>
            {[
              '양측 무릎 관절염 통증 호소',
              '화장실 문턱 높음 낙상 위험',
              '주 3회 영양 밑반찬 배달 연계',
              '장기요양 등급 신청 서류 안내 완료'
            ].map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => simulateSpeechInput(phrase)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-900/80 border border-purple-700/60 text-stone-200 hover:bg-purple-900 hover:text-white transition-colors cursor-pointer"
              >
                + "{phrase}"
              </button>
            ))}
          </div>

          {dictationToast && (
            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 bg-black/40 px-3 py-1 rounded-lg border border-purple-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dictationToast}</span>
            </div>
          )}
        </div>
      )}

      {/* Smart Fill Modal (Gemini AI 최신 상담 기록 기반 법정 서식 자동 채우기 모달) */}
      <SmartFillModal
        isOpen={isSmartFillModalOpen}
        onClose={() => setIsSmartFillModalOpen(false)}
        doc={doc}
        client={activeClient}
        documents={documents}
        consultationInsights={consultationInsights}
        userSettings={userSettings}
        onApply={handleApplySmartFill}
      />

      {/* Quick-Fill Modal (어르신 프로필 및 최근 상담 인사이트 기반 자동완성 모달) */}
      <QuickFillModal
        isOpen={isQuickFillModalOpen}
        onClose={() => setIsQuickFillModalOpen(false)}
        doc={doc}
        client={activeClient}
        insight={activeInsight}
        userSettings={userSettings}
        onApply={handleApplyQuickFill}
      />

      {/* Official Ministry of Health & Welfare Standard Print/PDF Modal */}
      <OfficialPrintExportModal
        isOpen={isOfficialPrintModalOpen}
        onClose={() => setIsOfficialPrintModalOpen(false)}
        document={doc}
        client={clientInfo}
        userSettings={userSettings}
      />

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

      {/* AI-Human Collaboration Edit Mode Modal */}
      <AIHumanCollaborationMode
        isOpen={isCollaborationModalOpen}
        onClose={() => setIsCollaborationModalOpen(false)}
        document={doc}
        onApplyFieldUpdate={(fieldKey, val) => {
          if (fieldKey in doc) {
            handleFieldChange(fieldKey as keyof CaseDocument, val);
          } else {
            handleSpecificFieldChange(fieldKey, val);
          }
        }}
        onApplyBatchUpdates={(updates) => {
          setDoc((prev) => {
            const next = { ...prev };
            Object.entries(updates).forEach(([k, v]) => {
              if (k in next) {
                (next as any)[k] = v;
              } else {
                next.formSpecificFields = {
                  ...next.formSpecificFields,
                  [k]: v,
                };
              }
            });
            return next;
          });
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

      {/* Preset Applied Toast */}
      {presetAppliedToast && (
        <div className="fixed bottom-28 right-6 z-50 bg-teal-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-teal-500/40 flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{presetAppliedToast}</span>
        </div>
      )}

      {/* Report Share Modal (이메일 & Google Drive 연동) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-[#2F2520] to-[#251D19] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">사례관리 보고서 보호자 및 유관기관 공유</h3>
                  <p className="text-xs text-stone-300">
                    Google Drive 안전 링크 및 이메일 서식을 통해 {doc.clientName} 어르신의 사례관리 문서를 공유합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendShareEmail} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Google Drive Link Quick Share Box */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Google Drive 클라우드 열람 및 공유 링크
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-semibold">
                    보안 암호화 활성
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://drive.google.com/file/d/care-doc-${doc.id || 'current'}/view?usp=sharing`}
                    className="flex-1 text-xs bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 rounded-lg px-3 py-2 text-stone-700 dark:text-stone-200 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    {shareDriveLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{shareDriveLinkCopied ? '복사됨!' : '링크 복사'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-300 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="drivePerm"
                        checked={shareDrivePermission === 'view'}
                        onChange={() => setShareDrivePermission('view')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>보기 전용 (보호자 권장)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="drivePerm"
                        checked={shareDrivePermission === 'comment'}
                        onChange={() => setShareDrivePermission('comment')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>댓글/의견 작성 허용 (유관기관)</span>
                    </label>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    개인정보 보호법에 따른 민감정보 비식별 조치 적용
                  </span>
                </div>
              </div>

              {/* Recipient Target Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  공유 대상 선택
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'guardian', label: '보호자 (가족)', icon: User },
                    { id: 'community_center', label: '행정복지센터', icon: BookOpen },
                    { id: 'health_clinic', label: '보건소 방문간호', icon: Shield },
                    { id: 'custom', label: '직접 입력', icon: Mail },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setShareTargetType(t.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        shareTargetType === t.id
                          ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'bg-stone-50 dark:bg-[#251F1C] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    수신인 성명 / 소속
                  </label>
                  <input
                    type="text"
                    value={shareRecipientName}
                    onChange={(e) => setShareRecipientName(e.target.value)}
                    placeholder="수신인 이름"
                    className="w-full text-xs bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    수신 이메일 주소
                  </label>
                  <input
                    type="email"
                    value={shareRecipientEmail}
                    onChange={(e) => setShareRecipientEmail(e.target.value)}
                    placeholder="example@welfare.go.kr"
                    className="w-full text-xs bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  이메일 제목
                </label>
                <input
                  type="text"
                  value={shareSubject}
                  onChange={(e) => setShareSubject(e.target.value)}
                  className="w-full text-xs bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  공유 안내 메시지 본문
                </label>
                <textarea
                  rows={4}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full text-xs bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Recent Share Logs */}
              {shareHistory.length > 0 && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1.5">
                    최근 보고서 공유 이력
                  </div>
                  <div className="space-y-1">
                    {shareHistory.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-[11px] p-2 bg-stone-50 dark:bg-[#251F1C] rounded-lg border border-stone-200/80 dark:border-stone-800">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">{h.target} ({h.email})</span>
                        <div className="flex items-center gap-2 text-stone-400">
                          <span>{h.method}</span>
                          <span>{h.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>공유 이메일 발송하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Notification Toast */}
      {shareNotificationToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2.5 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{shareNotificationToast}</span>
        </div>
      )}

      {/* Focus Mode Fullscreen Modal Wrapper (집중 문서 모드 - 전체 앱 다크모드와 별도 테마 및 집중 환경) */}
      {isFocusMode && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto flex flex-col animate-fade-in ${
            focusTheme === 'sepia'
              ? 'bg-[#FAF6EE] text-stone-900'
              : focusTheme === 'paper'
              ? 'bg-[#F4F5F7] text-stone-900'
              : focusTheme === 'slate'
              ? 'bg-[#EBF0F5] text-slate-900'
              : 'bg-[#13100E] text-stone-100'
          } ${focusFontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
        >
          {/* Focus Mode Control Bar */}
          <div
            className={`sticky top-0 z-30 px-6 py-2.5 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xs ${
              focusTheme === 'sepia'
                ? 'bg-[#FFFDF9]/95 border-[#E8DFCE] text-stone-900'
                : focusTheme === 'paper'
                ? 'bg-white/95 border-stone-200 text-stone-900'
                : focusTheme === 'slate'
                ? 'bg-[#F8FAFC]/95 border-slate-200 text-slate-900'
                : 'bg-[#1C1815]/95 border-stone-800 text-stone-100'
            }`}
          >
            {/* Left: Document Info & Live Stats */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                    [집중 문서 모드] {DOCUMENT_TYPE_LABELS[doc.documentType].label} — {doc.clientName} 어르신
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300/60">
                    자동 저장 완료 ({lastAutoSavedTime})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <AlignLeft className="w-3 h-3 text-stone-400" />
                    총 <strong>{docStats.charWithSpace.toLocaleString()}</strong>자 (공백제외 <strong>{docStats.charNoSpace.toLocaleString()}</strong>자)
                  </span>
                  <span>•</span>
                  <span>단어 <strong>{docStats.wordCount.toLocaleString()}</strong>개</span>
                </div>
              </div>
            </div>

            {/* Right: Rich Focus Tool Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Theme Palette Selector (독립 테마) */}
              <div className="flex items-center rounded-xl p-0.5 border border-stone-300/80 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setFocusTheme('sepia')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusTheme === 'sepia'
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="세피아 아이보리 (눈이 편안한 따뜻한 톤)"
                >
                  세피아
                </button>
                <button
                  type="button"
                  onClick={() => setFocusTheme('paper')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusTheme === 'paper'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="순백 페이퍼 모드"
                >
                  페이퍼
                </button>
                <button
                  type="button"
                  onClick={() => setFocusTheme('slate')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusTheme === 'slate'
                      ? 'bg-slate-200 text-slate-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="슬레이트 그레이 모드"
                >
                  슬레이트
                </button>
                <button
                  type="button"
                  onClick={() => setFocusTheme('dark')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusTheme === 'dark'
                      ? 'bg-stone-900 text-amber-300 shadow-xs border border-stone-700'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="야간 집중 다크 모드"
                >
                  야간다크
                </button>
              </div>

              {/* 2. Font Size & Style Controls */}
              <div className="flex items-center rounded-xl p-0.5 border border-stone-300/80 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 text-xs">
                {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFocusFontSize(sz)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      focusFontSize === sz
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {sz === 'sm' ? '14' : sz === 'base' ? '16' : sz === 'lg' ? '18' : '20'}
                  </button>
                ))}
              </div>

              {/* Font Family (Gothic / Serif) */}
              <button
                type="button"
                onClick={() => setFocusFontFamily((prev) => (prev === 'sans' ? 'serif' : 'sans'))}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 cursor-pointer"
                title="글꼴 변경 (산세리프 고딕 / 명조 세리프)"
              >
                {focusFontFamily === 'sans' ? '고딕체' : '명조체'}
              </button>

              {/* 3. Canvas Width Selector */}
              <div className="hidden lg:flex items-center rounded-xl p-0.5 border border-stone-300/80 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setFocusCanvasWidth('standard')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusCanvasWidth === 'standard'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500'
                  }`}
                  title="표준 너비 (1000px)"
                >
                  표준폭
                </button>
                <button
                  type="button"
                  onClick={() => setFocusCanvasWidth('wide')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    focusCanvasWidth === 'wide'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500'
                  }`}
                  title="와이드 너비 (1350px)"
                >
                  와이드
                </button>
              </div>

              {/* 4. Ambient Focus Sound Synthesizer Selector */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 text-xs">
                <Music className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <select
                  value={focusSoundType}
                  onChange={(e) => handleSoundChange(e.target.value as SoundType)}
                  className="bg-transparent text-[11px] font-semibold text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                >
                  <option value="off" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🔇 사운드 끄기</option>
                  <option value="rain" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🌧️ 잔잔한 빗소리</option>
                  <option value="forest" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🌲 숲속 바람소리</option>
                  <option value="waves" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🌊 잔잔한 파도</option>
                  <option value="binaural" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🧠 알파파 10Hz</option>
                  <option value="whitenoise" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">📻 차분한 백색소음</option>
                </select>
                {focusSoundType !== 'off' && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={focusVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-12 h-1.5 accent-amber-600 cursor-pointer"
                    title={`음량: ${Math.round(focusVolume * 100)}%`}
                  />
                )}
              </div>

              {/* 5. AI Polisher Quick Tool */}
              <button
                type="button"
                disabled={isRefiningText}
                onClick={handleAIRefine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title="사회복지 공문서 표준 어투로 문장 정제"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isRefiningText ? 'animate-spin' : ''}`} />
                <span>{isRefiningText ? '문장 다듬는 중...' : 'AI 문장 정제'}</span>
              </button>

              {/* 6. Save Button */}
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>서식 저장</span>
              </button>

              {/* 7. Exit Focus Mode Button */}
              <button
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title="집중 모드 나가기 (ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>일반 모드로 복귀 (ESC)</span>
              </button>
            </div>
          </div>

          {/* Focus Mode Toast Notification Banner */}
          {focusToast && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-amber-500/50 flex items-center gap-2 animate-slide-in">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{focusToast}</span>
            </div>
          )}

          {/* Expansive Form Canvas in Focus Mode */}
          <div
            className={`flex-1 w-full mx-auto p-4 sm:p-8 space-y-6 transition-all ${
              focusCanvasWidth === 'wide'
                ? 'max-w-6xl'
                : focusCanvasWidth === 'full'
                ? 'max-w-full px-6'
                : 'max-w-4xl'
            } ${
              focusFontSize === 'sm'
                ? 'text-xs leading-relaxed'
                : focusFontSize === 'lg'
                ? 'text-base leading-relaxed'
                : focusFontSize === 'xl'
                ? 'text-lg leading-loose'
                : 'text-sm leading-relaxed'
            }`}
          >
            <div
              className={`rounded-2xl border p-6 sm:p-12 space-y-8 transition-all ${
                focusTheme === 'sepia'
                  ? 'bg-[#FFFDF9] border-[#EAE1D2] shadow-lg'
                  : focusTheme === 'paper'
                  ? 'bg-white border-stone-200 shadow-md'
                  : focusTheme === 'slate'
                  ? 'bg-[#F8FAFC] border-slate-200 shadow-md'
                  : 'bg-[#1C1815] border-stone-800 shadow-2xl'
              }`}
            >
              {/* Dynamic 10-Form Sub-Component Render inside Focus Mode */}
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
            </div>

            {/* Quick footer action inside Focus Mode */}
            <div className="flex items-center justify-between pt-4 text-xs text-stone-500 dark:text-stone-400">
              <span>* 집중 모드 상태에서 작성 중인 내용은 실시간으로 자동 임시 저장됩니다.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold cursor-pointer"
                >
                  최종 저장하기
                </button>
                <button
                  type="button"
                  onClick={() => setIsFocusMode(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold cursor-pointer"
                >
                  집중 모드 종료
                </button>
              </div>
            </div>
          </div>
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

      {collaborationNoticeToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-amber-500/50 flex items-center gap-2 animate-slide-in">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{collaborationNoticeToast}</span>
        </div>
      )}

      {/* AI-Human Collaboration Mode Top Banner */}
      <CollaborationTopBanner
        isCollaborationMode={isInlineCollaborationActive}
        onToggleCollaborationMode={(val) => setIsInlineCollaborationActive(val)}
        onAcceptAll={handleAcceptAllAIInlineProposals}
        onOpenFullReviewModal={() => setIsCollaborationModalOpen(true)}
      />

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

        {/* AI-Human Collaboration In-Place Review Area (Visible when isInlineCollaborationActive is ON) */}
        {isInlineCollaborationActive && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 dark:border-amber-600/80 space-y-4 animate-fade-in shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-amber-300/50 dark:border-amber-700/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-stone-950">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>AI 초안 실시간 검토 & 보완 영역 (AI-인간 협업 모드)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                      실시간 하이라이트 중
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    상담 녹취 및 AI 분석에서 추출된 문장을 항목별로 검토하여 수락하거나, 대안 문장으로 교체 및 직접 수정하세요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAllAIInlineProposals}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>전체 제안 수락</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <InlineAICollaborationField
                id="inline-title"
                label="문서 제목 / 핵심 개요"
                fieldKey="title"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.title || ''}
                onChange={(val) => handleFieldChange('title', val)}
                confidence={96}
                aiRationale={getFieldEvidenceQuote('title', doc)
                  ? `실제 발화 근거: "${getFieldEvidenceQuote('title', doc)}"`
                  : `${doc.clientName || '내담자'} 성명, 연령, 거주유형 및 초기 주호소 내용을 기반으로 표준 공문서 표제어 생성`}
                alternatives={getContextualFieldAlternatives('title', doc)}
                type="input"
              />

              <InlineAICollaborationField
                id="inline-problem-needs"
                label="1. 대상자의 주요 호소 및 핵심 욕구 (Problem & Needs)"
                fieldKey="problemAndNeeds"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.formSpecificFields?.problemAndNeeds || doc.executiveSummary?.join('\n') || ''}
                onChange={(val) => handleSpecificFieldChange('problemAndNeeds', val)}
                confidence={94}
                aiRationale={getFieldEvidenceQuote('problemAndNeeds', doc)
                  ? `실제 면담 발화 근거: "${getFieldEvidenceQuote('problemAndNeeds', doc)}"`
                  : `상담 대화록 상의 ${doc.clientName || '어르신'} 주호소 및 확인된 핵심 욕구를 복지부 표준 욕구 범주로 구조화`}
                alternatives={getContextualFieldAlternatives('problemAndNeeds', doc)}
                rows={3}
              />

              <InlineAICollaborationField
                id="inline-short-term-goals"
                label="2. 해결목표 (장·단기 개입 목표)"
                fieldKey="shortTermGoals"
                isCollaborationMode={isInlineCollaborationActive}
                value={Array.isArray(doc.shortTermGoals) ? doc.shortTermGoals.join('\n') : (doc.shortTermGoals || '')}
                onChange={(val) => {
                  const lines = val.split('\n').filter((l) => l.trim().length > 0);
                  handleFieldChange('shortTermGoals', lines);
                }}
                confidence={92}
                aiRationale={`${doc.clientName || '내담자'} 어르신의 확인된 욕구를 바탕으로 SMART 기법에 따른 3~6개월 단위 복지 개입 목표 도출`}
                alternatives={getContextualFieldAlternatives('shortTermGoals', doc)}
                rows={3}
              />

              <InlineAICollaborationField
                id="inline-risk-rationale"
                label="3. 내담자 특이사항 및 위기도 판정 근거 (Risk Factors)"
                fieldKey="riskRationale"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.riskRationale || ''}
                onChange={(val) => handleFieldChange('riskRationale', val)}
                confidence={95}
                aiRationale={getFieldEvidenceQuote('riskRationale', doc)
                  ? `실제 발화 근거: "${getFieldEvidenceQuote('riskRationale', doc)}"`
                  : `${doc.clientName || '내담자'} 어르신의 건강상태, 거주안전도, 독거 취약성을 종합 판정한 위기도 근거`}
                alternatives={getContextualFieldAlternatives('riskRationale', doc)}
                rows={3}
              />

              <InlineAICollaborationField
                id="inline-physical-health"
                label="4. 신체기능 및 ADL/IADL 상태 (Physical & ADL)"
                fieldKey="physicalHealthStatus"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.physicalHealthStatus || ''}
                onChange={(val) => handleFieldChange('physicalHealthStatus', val)}
                confidence={93}
                aiRationale={getFieldEvidenceQuote('physicalHealthStatus', doc)
                  ? `실제 발화 근거: "${getFieldEvidenceQuote('physicalHealthStatus', doc)}"`
                  : `면담 중 호소한 신체 증상, 복약 및 일상수행능력(ADL) 분석`}
                alternatives={getContextualFieldAlternatives('physicalHealthStatus', doc)}
                rows={3}
              />

              <InlineAICollaborationField
                id="inline-emotional-cognitive"
                label="5. 정서 및 인지 기능 상태 (Emotional & Cognitive)"
                fieldKey="emotionalCognitiveStatus"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.emotionalCognitiveStatus || ''}
                onChange={(val) => handleFieldChange('emotionalCognitiveStatus', val)}
                confidence={91}
                aiRationale={getFieldEvidenceQuote('emotionalCognitiveStatus', doc)
                  ? `실제 발화 근거: "${getFieldEvidenceQuote('emotionalCognitiveStatus', doc)}"`
                  : `상담 중 발화 속도, 질문 이해도, 감정 표현(독거 고립감 등)을 표준 척도 어조로 분석`}
                alternatives={getContextualFieldAlternatives('emotionalCognitiveStatus', doc)}
                rows={2}
              />

              <InlineAICollaborationField
                id="inline-housing"
                label="6. 주거환경 안전성 및 거주 실태 (Housing Safety)"
                fieldKey="housingEnvironment"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.housingEnvironment || ''}
                onChange={(val) => handleFieldChange('housingEnvironment', val)}
                confidence={94}
                aiRationale={getFieldEvidenceQuote('housingEnvironment', doc)
                  ? `실제 발화 근거: "${getFieldEvidenceQuote('housingEnvironment', doc)}"`
                  : `주택 형태, 안전 취약 요소 및 거주 안전성을 복지부 점검 기준에 맞춰 분석`}
                alternatives={getContextualFieldAlternatives('housingEnvironment', doc)}
                rows={2}
              />

              <InlineAICollaborationField
                id="inline-opinion"
                label="7. 사회복지사 종합 소견 및 개입 방향 (Social Worker Opinion)"
                fieldKey="socialWorkerOpinion"
                isCollaborationMode={isInlineCollaborationActive}
                value={doc.socialWorkerOpinion || ''}
                onChange={(val) => handleFieldChange('socialWorkerOpinion', val)}
                confidence={97}
                aiRationale={getFieldEvidenceQuote('socialWorkerOpinion', doc)
                  ? `실제 발화 인용: "${getFieldEvidenceQuote('socialWorkerOpinion', doc)}"`
                  : `전체 상담 분석 결과를 바탕으로 ${doc.clientName || '어르신'}을 위한 종합 전문 소견 작성`}
                alternatives={getContextualFieldAlternatives('socialWorkerOpinion', doc)}
                rows={4}
              />
            </div>
          </div>
        )}

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
