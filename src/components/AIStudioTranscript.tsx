import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Mic,
  MicOff,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Info,
  ShieldAlert,
  ListPlus,
  SlidersHorizontal,
  Bookmark,
  FileAudio,
  Pause,
  Play,
  Volume2,
  StickyNote,
  Plus,
  Eraser,
  Layers,
  CheckSquare,
  Compass,
  ListChecks,
  Send,
  HelpCircle,
  MessageSquareQuote,
  ChevronRight,
  VolumeX,
  FastForward,
  Headphones,
  Edit3,
  Keyboard,
  Star,
  Tag,
  X,
  Activity,
  FileCheck
} from 'lucide-react';
import { DocumentType, ClientProfile, PresetScenario, AIAnalysisResponse, CaseDocument, ConsultationInsight } from '../types';
import { DOCUMENT_TYPE_LABELS, mapAiResponseToDocument, createEmptyDocument } from '../utils/documentTemplates';
import {
  validateAudioFile,
  isAudioFile,
  cleanTranscriptText,
  extractQuickInsightFromTranscript,
  AudioValidationResult,
} from '../utils/audioValidator';
import { PRESET_SCENARIOS } from '../data/mockData';
import { CONSULTATION_STAGES, ConsultationStage } from '../data/consultationGuides';
import { CounselingSentimentTrendChart } from './CounselingSentimentTrendChart';
import { AIFormWizardStepView } from './AIFormWizardStepView';
import { AIRealtimeSummaryCard } from './AIRealtimeSummaryCard';
import confetti from 'canvas-confetti';

export interface KeySegmentBookmark {
  id: string;
  timestamp: string;
  seconds: number;
  label: string;
  contextText?: string;
}

interface AIStudioTranscriptProps {
  clients: ClientProfile[];
  onGenerateDocument: (doc: CaseDocument) => void;
  selectedClient?: ClientProfile | null;
  onPushInsightToDashboard?: (insight: ConsultationInsight) => void;
}

export const AIStudioTranscript: React.FC<AIStudioTranscriptProps> = ({
  clients,
  onGenerateDocument,
  selectedClient,
  onPushInsightToDashboard,
}) => {
  // Navigation / Mode state
  const [activeMainTab, setActiveMainTab] = useState<'transcript' | 'wizard' | 'guide'>('transcript');

  // Input states
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('intake');
  const [targetClientId, setTargetClientId] = useState<string>(selectedClient?.id || '');
  const [workerNotes, setWorkerNotes] = useState<string>('');
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [scratchpadCopied, setScratchpadCopied] = useState<boolean>(false);
  const [focusAreas, setFocusAreas] = useState<string[]>([
    '식사/영양결식',
    '낙상/주거안전',
    '만성질환/복약',
  ]);

  // Key segment bookmarks state
  const [bookmarks, setBookmarks] = useState<KeySegmentBookmark[]>([]);
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);
  const [showShortcutHelpModal, setShowShortcutHelpModal] = useState<boolean>(false);

  // Consultation Guide Mode states
  const [activeGuideStageId, setActiveGuideStageId] = useState<number>(1);
  const [checkedGuideQuestions, setCheckedGuideQuestions] = useState<Record<string, boolean>>({});
  const [aiCustomSuggestedQuestions, setAiCustomSuggestedQuestions] = useState<Array<{ id: string; text: string; rationale: string }>>([]);
  const [isGeneratingAiQuestions, setIsGeneratingAiQuestions] = useState<boolean>(false);
  const [questionCopiedToast, setQuestionCopiedToast] = useState<string | null>(null);

  // Auto-send 3-line summary state
  const [autoSendToInsights, setAutoSendToInsights] = useState<boolean>(true);
  const [sentInsightToast, setSentInsightToast] = useState<string | null>(null);
  const [showRealtimeSummary, setShowRealtimeSummary] = useState<boolean>(false);

  // Apply mapped draft from realtime summary directly to form editor
  const handleApplyRealtimeSummaryDraftToForm = (targetType: DocumentType, mappedDraftData: Record<string, any>) => {
    const client = clients.find((c) => c.id === targetClientId) || selectedClient || clients[0];
    const baseDoc = createEmptyDocument(targetType, client);
    const mergedDoc: CaseDocument = {
      ...baseDoc,
      ...mappedDraftData,
      clientId: client.id,
      clientName: client.name,
      documentType: targetType,
      type: targetType,
      formSpecificFields: {
        ...(baseDoc.formSpecificFields || {}),
        ...(mappedDraftData.formSpecificFields || {}),
      },
    };

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    onGenerateDocument(mergedDoc);
  };

  // Recording & Microphone states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync state to ref to avoid stale closures in event listeners
  useEffect(() => {
    isRecordingRef.current = isRecording;
    isPausedRef.current = isPaused;
  }, [isRecording, isPaused]);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'ko-KR';

      recog.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interimChunk += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interimChunk);
        if (finalChunk) {
          setTranscriptText((prev) => (prev ? prev + '\n' + finalChunk.trim() : finalChunk.trim()));
        }
      };

      recog.onerror = (err: any) => {
        console.warn('Speech recognition event notification:', err?.error || err);
        if (err.error === 'not-allowed') {
          setMicStatusMessage('마이크 접근 권한이 차단되었습니다. 브라우저 설정에서 마이크를 허용해 주세요.');
          stopRecordingInternal();
        } else if (err.error === 'no-speech') {
          // Normal pause in speaking, do not stop recording
        }
      };

      recog.onend = () => {
        // Use live ref values to seamlessly restart continuous recognition without dropping out
        if (isRecordingRef.current && !isPausedRef.current) {
          try {
            recog.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };

      recognitionRef.current = recog;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopRecordingInternal();
    };
  }, []);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [isEditingAnalysis, setIsEditingAnalysis] = useState<boolean>(false);
  const [isWizardMode, setIsWizardMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Text-To-Speech (TTS) State for Social Workers on the Move
  const [isTtsSpeaking, setIsTtsSpeaking] = useState<boolean>(false);
  const [isTtsPaused, setIsTtsPaused] = useState<boolean>(false);
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsVolume, setTtsVolume] = useState<number>(1.0);
  const [autoPlayTtsOnComplete, setAutoPlayTtsOnComplete] = useState<boolean>(false);
  const [ttsActiveSection, setTtsActiveSection] = useState<string>('');
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Focus Area options
  const FOCUS_OPTIONS = [
    '식사/영양결식',
    '낙상/주거안전',
    '만성질환/복약',
    '우울/고립감',
    '인지기능/기억력',
    '경제/수급상황',
    '응급안전안심',
    '장기요양진입',
  ];

  // Update target client when prop changes
  useEffect(() => {
    if (selectedClient) {
      setTargetClientId(selectedClient.id);
    }
  }, [selectedClient]);

  // Audio level visualizer and MediaRecorder capture loop
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 1. Audio Visualizer Setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // 2. MediaRecorder for high-fidelity audio stream capture
      recordedChunksRef.current = [];
      try {
        let mimeType = 'audio/webm;codecs=opus';
        if (typeof MediaRecorder !== 'undefined') {
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = '';
              }
            }
          }
          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunksRef.current.push(e.data);
            }
          };
          recorder.onstop = () => {
            if (recordedChunksRef.current.length > 0) {
              const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
              setRecordedAudioBlob(blob);
              const audioUrl = URL.createObjectURL(blob);
              setUploadedAudioUrl(audioUrl);
              setUploadedAudioFileName(`현장녹음_${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.webm`);
            }
          };
          recorder.start(500);
          mediaRecorderRef.current = recorder;
        }
      } catch (recorderErr) {
        console.warn('MediaRecorder init notice:', recorderErr);
      }
    } catch (err) {
      console.warn('Microphone stream access notice:', err);
    }
  };

  const stopRecordingInternal = () => {
    setIsRecording(false);
    setIsPaused(false);
    isRecordingRef.current = false;
    isPausedRef.current = false;
    setInterimTranscript('');
    setAudioLevel(0);
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Automatically activate real-time summary & auto-mapping step when recording completes
    setShowRealtimeSummary(true);
  };

  // Format Timer helper
  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 Key Segment Bookmark Handler (중요 발화 구간 즉시 마킹)
  const handleMarkKeySegment = (customLabel?: string) => {
    const timeStr = isRecording
      ? formatTimer(recordingSeconds)
      : new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const label = customLabel || `⭐ 핵심호소·위험징후 [${timeStr}]`;
    const newBookmark: KeySegmentBookmark = {
      id: `bm-${Date.now()}`,
      timestamp: timeStr,
      seconds: recordingSeconds,
      label,
      contextText: interimTranscript || transcriptText.slice(-60) || '어르신 주요 발화 지점',
    };

    setBookmarks((prev) => [...prev, newBookmark]);

    // Insert marker into transcript text
    const markTag = `\n[⭐ 중요 구간 마킹 (${timeStr})]: `;
    setTranscriptText((prev) => (prev ? prev + markTag : markTag));

    setShortcutToast(`[단축키 M] 중요 발화 구간 (${timeStr})이 북마크에 기록되었습니다.`);
    setTimeout(() => setShortcutToast(null), 3000);
  };

  // ⌨️ Keyboard Shortcuts Global Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // 1. Space Bar -> Toggle Recording (when not typing in an input/textarea)
      if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        toggleRecording();
        setShortcutToast(
          isRecording
            ? '[단축키 Space] 상담 녹음이 종료되었습니다.'
            : '[단축키 Space] 현장 실시간 녹음이 시작되었습니다.'
        );
        setTimeout(() => setShortcutToast(null), 2500);
        return;
      }

      // 2. Ctrl + Space or Alt + R -> Toggle Recording (anywhere)
      if ((e.ctrlKey && e.code === 'Space') || (e.altKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        toggleRecording();
        setShortcutToast(
          isRecording
            ? '[단축키] 상담 녹음이 종료되었습니다.'
            : '[단축키] 현장 실시간 녹음이 시작되었습니다.'
        );
        setTimeout(() => setShortcutToast(null), 2500);
        return;
      }

      // 3. M key (when not typing) or Alt + M / Ctrl + M -> Bookmark Key Segment
      if (
        (!isInputFocused && e.key.toLowerCase() === 'm') ||
        (e.altKey && e.key.toLowerCase() === 'm') ||
        (e.ctrlKey && e.key.toLowerCase() === 'm')
      ) {
        e.preventDefault();
        handleMarkKeySegment();
        return;
      }

      // 4. Ctrl + Enter or Alt + A -> Run AI Analysis
      if ((e.ctrlKey && e.key === 'Enter') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        if (!isAnalyzing && transcriptText.trim()) {
          setShortcutToast('[단축키 Ctrl+Enter] AI 표준 서식 사정 분석을 시작합니다.');
          setTimeout(() => setShortcutToast(null), 2500);
          runAIAnalysis();
        }
        return;
      }

      // 5. Alt + E -> Toggle Analysis Edit Mode
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEditingAnalysis((prev) => !prev);
        setShortcutToast(
          !isEditingAnalysis
            ? '[단축키 Alt+E] 직접 수정 모드가 활성화되었습니다.'
            : '[단축키 Alt+E] 수정 미리보기 모드로 전환되었습니다.'
        );
        setTimeout(() => setShortcutToast(null), 2500);
        return;
      }

      // 6. Alt + T -> Toggle TTS Audio Summary
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (isTtsSpeaking) {
          handleStopTts();
          setShortcutToast('[단축키 Alt+T] 음성 요약 재생이 중지되었습니다.');
        } else if (analysisResult) {
          handlePlayTts('all');
          setShortcutToast('[단축키 Alt+T] AI 핵심 요약 음성 브리핑 재생 시작');
        }
        setTimeout(() => setShortcutToast(null), 2500);
        return;
      }

      // 7. '?' or F1 -> Show Shortcuts Help
      if (!isInputFocused && (e.key === '?' || e.key === 'F1')) {
        e.preventDefault();
        setShowShortcutHelpModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isPaused, recordingSeconds, transcriptText, isAnalyzing, isEditingAnalysis, isTtsSpeaking, analysisResult]);

  // Voice recording toggle
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecordingInternal();
    } else {
      setMicStatusMessage(null);
      try {
        if (speechSupported && recognitionRef.current) {
          recognitionRef.current.start();
        }
        await startAudioVisualizer();

        setIsRecording(true);
        setIsPaused(false);
        setRecordingSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error('Recording start error:', err);
        setMicStatusMessage('마이크 시작 중 권한 확인이 필요합니다.');
        // Fallback: start timer with simulation
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  const togglePause = () => {
    if (isPaused) {
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  // Audio & File Upload States
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioStageIndex, setAudioStageIndex] = useState<number>(0);
  const [audioElapsedSeconds, setAudioElapsedSeconds] = useState<number>(0);
  const [audioFileMeta, setAudioFileMeta] = useState<{
    name: string;
    sizeKB: number;
    sizeMB: string;
    format: string;
    rawMime: string;
  } | null>(null);
  const [transcribingStatus, setTranscribingStatus] = useState<string>('');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioAbortControllerRef = useRef<AbortController | null>(null);
  const audioProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio STT Stages definition for visual progress breakdown
  const AUDIO_STT_STAGES = [
    { label: '파일 무결성 검증', desc: '오디오 스트림 분석 및 포맷 확인' },
    { label: 'Gemini 규격 호환성 검증', desc: 'Base64 인코딩 및 MIME 정규화' },
    { label: 'AI 멀티모달 STT 음성인식', desc: 'Gemini 모델 음성 분석 및 화자 분리' },
    { label: '상담 대화록 생성', desc: '한국어 전문 복지 대화록 포맷팅' },
  ];

  // Helper to detect audio format
  const getAudioFormat = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    return ext;
  };

  // Audio file transcription handler with pre-validation, live progress tracking & automated cleanup/insights mapping
  const processAudioFile = async (file: File) => {
    // 0. Pre-validation of Audio File Format and Size using audioValidator utility
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      const alertMsg = `${validation.errorMessage}\n\n💡 안내: ${validation.suggestion || '지원 형식(MP3, WAV, M4A 등) 파일을 선택해 주세요.'}`;
      setErrorMessage(`[파일 형식 오류] ${validation.errorMessage}`);
      alert(alertMsg);
      return;
    }

    // Abort any prior in-flight audio transcription
    if (audioAbortControllerRef.current) {
      audioAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    audioAbortControllerRef.current = abortController;

    if (audioProgressTimerRef.current) clearInterval(audioProgressTimerRef.current);
    if (audioElapsedTimerRef.current) clearInterval(audioElapsedTimerRef.current);

    const sizeKB = Math.round(file.size / 1024);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const detectedFormat = validation.format;

    setAudioFileMeta({
      name: file.name,
      sizeKB,
      sizeMB,
      format: detectedFormat,
      rawMime: file.type || validation.normalizedMime,
    });

    setIsTranscribingAudio(true);
    setAudioProgress(8);
    setAudioStageIndex(0);
    setAudioElapsedSeconds(0);
    setTranscribingStatus(`음성 파일 '${file.name}' (${sizeMB}MB) 사전 검증 통과 및 변환 준비 중...`);
    setErrorMessage(null);
    setUploadSuccessBanner(null);

    // Start elapsed seconds counter
    audioElapsedTimerRef.current = setInterval(() => {
      setAudioElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      // Create local object URL for instant preview playback
      const audioUrl = URL.createObjectURL(file);
      setUploadedAudioUrl(audioUrl);
      setUploadedAudioFileName(file.name);

      // Stage 1: File reading and Base64 encoding (Progress: 10% -> 35%)
      setAudioProgress(20);
      setAudioStageIndex(1);
      setTranscribingStatus(`오디오 데이터를 Gemini API 호환 규격으로 인코딩 및 정규화 중...`);

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = (err) => reject(new Error('오디오 파일 스트림 읽기에 실패했습니다.'));
        reader.readAsDataURL(file);
      });

      // Stage 2: In-flight AI processing simulation timer (Progress: 35% -> 85%)
      setAudioProgress(40);
      setAudioStageIndex(2);
      setTranscribingStatus(`🎙️ Gemini AI 모델이 음성을 듣고 사회복지사/어르신 화자를 분리하여 한국어로 텍스트 변환(STT) 중입니다...`);

      // Dynamic progress ticker while server is processing
      audioProgressTimerRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev < 80) return prev + Math.floor(Math.random() * 4 + 2);
          if (prev < 90) return prev + 1;
          return prev;
        });
      }, 400);

      // Call server STT endpoint
      const response = await fetch('/api/ai/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: validation.normalizedMime,
          fileName: file.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '음성 텍스트 변환(STT)에 실패했습니다. 다시 시도해 주세요.');
      }

      // Stage 3: Formatting, Automated Cleanup & Applying Transcript (Progress: 90% -> 100%)
      if (audioProgressTimerRef.current) clearInterval(audioProgressTimerRef.current);
      setAudioProgress(95);
      setAudioStageIndex(3);
      setTranscribingStatus(`한국어 대화록 자동 정제 및 실시간 인사이트 동기화 중...`);

      const rawTranscribedText = data.transcript || '';
      if (!rawTranscribedText.trim()) {
        throw new Error('음성 파일에서 감지된 발화 내용이 없습니다. 음성이 명확한 녹음 파일인지 확인해 주세요.');
      }

      // 1. Automated cleanup routine: standardizes speaker labels, removes artifact timestamps and whitespace
      const cleanedText = cleanTranscriptText(rawTranscribedText);

      // 2. Set cleaned transcript in editor
      setTranscriptText((prev) => {
        if (!prev.trim()) return cleanedText;
        return `${prev}\n\n[음성 파일 녹취: ${file.name}]\n${cleanedText}`;
      });

      // 3. Immediately map STT converted results to liveInsights in App component
      const targetClient = clients.find((c) => c.id === targetClientId) || selectedClient || clients[0];
      const quickInsightData = extractQuickInsightFromTranscript({
        transcript: cleanedText,
        clientId: targetClient?.id || 'client-1',
        clientName: targetClient?.name || '상담 어르신',
        fileName: file.name,
      });

      const sttLiveInsight: ConsultationInsight = {
        id: `insight-stt-${Date.now()}`,
        clientId: targetClient?.id || 'client-1',
        clientName: targetClient?.name || '상담 어르신',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        riskLevel: quickInsightData.riskLevel,
        threeLineSummary: quickInsightData.threeLineSummary,
        keyIssues: quickInsightData.keyIssues,
        recommendedService: quickInsightData.recommendedService,
        isUrgent: quickInsightData.isUrgent,
      };

      // Push instantly to App's liveInsights state without manual page refresh
      if (onPushInsightToDashboard) {
        onPushInsightToDashboard(sttLiveInsight);
      }

      setShowRealtimeSummary(true);
      setAudioProgress(100);
      setUploadSuccessBanner(
        `🎙️ '${file.name}' STT 변환 완료! 대화록 정제 및 실시간 인사이트(Live Insights)가 대시보드에 즉시 자동 연동되었습니다.`
      );
      setTimeout(() => setUploadSuccessBanner(null), 6000);

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Audio transcription aborted by user.');
        setUploadSuccessBanner('음성 파일 변환 작업이 취소되었습니다.');
        setTimeout(() => setUploadSuccessBanner(null), 3000);
        return;
      }

      console.error('Audio transcription error:', err);
      let errorMsg = err.message || '음성 파일 변환 중 오류가 발생했습니다.';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error && parsed.error.message) {
          errorMsg = parsed.error.message;
        }
      } catch (e) {}
      setErrorMessage(`[음성 인식(STT) 오류] ${errorMsg}`);
    } finally {
      if (audioProgressTimerRef.current) clearInterval(audioProgressTimerRef.current);
      if (audioElapsedTimerRef.current) clearInterval(audioElapsedTimerRef.current);
      setIsTranscribingAudio(false);
      setTranscribingStatus('');
    }
  };

  // Convert recorded live audio blob directly to Gemini STT
  const handleTranscribeRecordedAudio = async () => {
    if (!recordedAudioBlob) {
      setErrorMessage('녹음된 현장 음성 데이터가 없습니다.');
      return;
    }
    const fileName = `현장상담녹음_${new Date().toISOString().slice(0, 10)}_${new Date().getHours()}시${new Date().getMinutes()}분.webm`;
    const audioFile = new File([recordedAudioBlob], fileName, { type: recordedAudioBlob.type || 'audio/webm' });
    await processAudioFile(audioFile);
  };

  // Cancel in-flight audio transcription
  const cancelAudioTranscription = () => {
    if (audioAbortControllerRef.current) {
      audioAbortControllerRef.current.abort();
    }
    if (audioProgressTimerRef.current) clearInterval(audioProgressTimerRef.current);
    if (audioElapsedTimerRef.current) clearInterval(audioElapsedTimerRef.current);
    setIsTranscribingAudio(false);
    setTranscribingStatus('');
  };

  // Text/document file handler
  const processTextFile = (file: File) => {
    setErrorMessage(null);
    setUploadSuccessBanner(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setTranscriptText((prev) => (prev.trim() ? `${prev}\n\n[불러온 파일: ${file.name}]\n${content}` : content));
        setUploadSuccessBanner(`📄 텍스트 파일 '${file.name}'을 성공적으로 불러왔습니다.`);
        setTimeout(() => setUploadSuccessBanner(null), 4000);
      }
    };
    reader.onerror = () => {
      setErrorMessage(`파일 '${file.name}'을 읽는 중 오류가 발생했습니다.`);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Main unified file router (handles audio, text, vtt, srt, json, csv, etc.)
  const handleIncomingFile = (file: File) => {
    if (!file) return;

    // Check if it's an audio file using audio validator utility
    if (isAudioFile(file)) {
      processAudioFile(file);
    } else {
      // Check if it's a known text/document type
      const nameLower = file.name.toLowerCase();
      const isTextDoc =
        nameLower.endsWith('.txt') ||
        nameLower.endsWith('.vtt') ||
        nameLower.endsWith('.srt') ||
        nameLower.endsWith('.json') ||
        nameLower.endsWith('.csv') ||
        nameLower.endsWith('.doc') ||
        nameLower.endsWith('.docx') ||
        file.type.startsWith('text/');

      if (isTextDoc) {
        processTextFile(file);
      } else {
        // Unknown or unsupported format: show alert to prevent premature API failures
        const alertMsg = `지원되지 않는 파일 형식입니다: '${file.name}'\n\n- 음성 인식(STT): MP3, WAV, M4A, AAC, OGG, WEBM, FLAC\n- 텍스트 문서: TXT, VTT, SRT, JSON, CSV`;
        setErrorMessage(`[파일 형식 오류] 지원되지 않는 파일 형식: ${file.name}`);
        alert(alertMsg);
      }
    }
  };

  // Handle File Input Change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIncomingFile(file);
    }
    // Reset file input value so same file can be re-uploaded if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleIncomingFile(file);
    }
  };

  // Load Preset Scenario
  const loadPreset = (preset: PresetScenario) => {
    setTranscriptText(preset.transcriptText);
    setDocumentType(preset.recommendedDocType);
    setWorkerNotes(preset.workerNotes);
    const matched = clients.find((c) => c.name === preset.clientName);
    if (matched) {
      setTargetClientId(matched.id);
    }
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Toggle Focus Area
  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // Scratchpad helper functions
  const insertScratchpadTag = (tag: string) => {
    setScratchpadText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const mergeScratchpadToTranscript = () => {
    if (!scratchpadText.trim()) return;
    const appendContent = `\n\n[실시간 보충 관찰 메모 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})]\n${scratchpadText}`;
    setTranscriptText((prev) => prev + appendContent);
    setScratchpadText('');
  };

  const mergeScratchpadToWorkerNotes = () => {
    if (!scratchpadText.trim()) return;
    setWorkerNotes((prev) => (prev ? `${prev} | ${scratchpadText}` : scratchpadText));
    setScratchpadText('');
  };

  const copyScratchpad = () => {
    if (!scratchpadText) return;
    navigator.clipboard.writeText(scratchpadText);
    setScratchpadCopied(true);
    setTimeout(() => setScratchpadCopied(false), 2000);
  };

  // Trigger AI Analysis via Server Endpoint
  const runAIAnalysis = async () => {
    if (!transcriptText.trim()) {
      setErrorMessage('분석할 상담 녹취 또는 텍스트 내용을 입력해 주세요.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress(15);

    const targetClient = clients.find((c) => c.id === targetClientId);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 600);

    const combinedNotes = [
      workerNotes,
      scratchpadText ? `[현장/분석 중 실시간 임시 메모]: ${scratchpadText}` : ''
    ].filter(Boolean).join('\n\n');

    try {
      const response = await fetch('/api/ai/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          transcriptText,
          clientInfo: targetClient || null,
          additionalNotes: combinedNotes,
          focusAreas,
        }),
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI 서식 분석 요청에 실패했습니다.');
      }

      setAnalysisResult(data.result);
      setIsWizardMode(true);
      setActiveMainTab('wizard');

      // Auto-transmit 3-line summary to dashboard if enabled
      if (autoSendToInsights && onPushInsightToDashboard) {
        transmitInsightToDashboard(data.result);
      }

      // Auto-play TTS voice summary if enabled
      if (autoPlayTtsOnComplete) {
        setTimeout(() => {
          handlePlayTts(undefined, data.result);
        }, 500);
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      let cleanMsg = err.message || '서버와의 통신 중 오류가 발생했습니다.';
      try {
        const parsed = JSON.parse(cleanMsg);
        if (parsed.error && parsed.error.message) {
          cleanMsg = parsed.error.message;
        }
      } catch (e) {}
      setErrorMessage(cleanMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Emergency local assessment generator in case of network or API service delays
  const generateEmergencyAssessment = () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress(50);

    setTimeout(() => {
      const targetClient = clients.find((c) => c.id === targetClientId);
      const clientName = targetClient ? targetClient.name : '어르신';
      const text = transcriptText.toLowerCase();

      const hasFallRisk = text.includes('낙상') || text.includes('넘어') || text.includes('어지') || text.includes('문턱') || text.includes('무릎');
      const hasMealRisk = text.includes('밥') || text.includes('식사') || text.includes('굶') || text.includes('찬물') || text.includes('입맛');
      const hasDepressionRisk = text.includes('외롭') || text.includes('우울') || text.includes('죽고') || text.includes('혼자') || text.includes('불안');
      const hasMedicalRisk = text.includes('약') || text.includes('병원') || text.includes('당뇨') || text.includes('혈압') || text.includes('통증');

      const isHighRisk = (hasFallRisk && hasMealRisk) || hasDepressionRisk || text.includes('응급');

      const emergencyResult: AIAnalysisResponse = {
        executiveSummary: [
          `[긴급 규칙 사정] ${clientName} 어르신 상담 기록 기반 즉시 분석 완료 (${isHighRisk ? '고위험군' : '중위험군 집중관리'})`,
          `주요 호소 및 관찰: ${hasFallRisk ? '거동 불편 및 주거 낙상 위험 지표 감지' : '일상생활 지원 필요'}, ${hasMealRisk ? '영양 결식 및 불규칙 식습관 확인' : '건강 모니터링 필요'}`,
          `긴급 대응 권고: 사회복지사 현장 정밀 확인, ${hasFallRisk ? '화장실/문턱 안전바 설치 및' : ''} ${hasMealRisk ? '맞춤형 영양 도시락 연계' : '정기 안부 전화 배정'} 즉시 추진`,
        ],
        riskLevel: isHighRisk ? '고위험군 (집중사례관리 대상)' : '중위험군 (일반사례관리 대상)',
        riskRationale: `${clientName} 어르신의 진술 및 상담 기록 키워드 분석 결과, ${hasFallRisk ? '낙상 위험, ' : ''}${hasMealRisk ? '영양 결식 우려, ' : ''}${hasMedicalRisk ? '만성질환 복약 관리 필요성' : '사회적 고립 예방'}이 우선순위로 도출되었습니다.`,
        clientName,
        primaryNeeds: [
          hasFallRisk ? '낙상 후유증 및 보행 안정성 확보 지원' : '만성질환 규칙적 복약 및 건강 점검',
          hasMealRisk ? '결식 예방 및 주 3회 영양 반찬 지원' : '균형 잡힌 영양 섭취 모니터링',
          '주거 내 안전 손잡이 및 조명 환경 개선',
          hasDepressionRisk ? '우울감 완화 및 정서 지지망 형성' : '독거 어르신 안부 확인 및 사회적 교류',
        ],
        physicalHealthStatus: `${hasMedicalRisk ? '만성질환 보유 중이며 정기 복약 관리 및 혈압/혈당 체크가 필요함' : '특이 병력 정밀 확인 요망'}. 거동 시 보행 안전 주의 요함.`,
        adlStatus: hasFallRisk ? '보행 및 실내 이동 시 다소 부축 필요, 낙상 재발 공포 호소' : '기본적 일상생활 수행 가능하나 만성 피로 관찰',
        iadlStatus: hasMealRisk ? '단독 취사 및 무거운 물품 장보기 곤란' : '가사 및 식사 준비 지원 연계 권장',
        emotionalCognitiveStatus: hasDepressionRisk ? '사회적 고립감 및 우울 증세 관찰되어 주기적 정서 케어 필요' : '인지 기능은 양호하나 고립감 예방 필요',
        housingEnvironment: '독거 거주 상태로 실내 문턱 및 욕실 미끄럼 방지 등 안전 취약 요소 상존',
        economicStatus: '기초연금 등 정부보조금 수급 중이며 의료비 지출 부담 호소',
        socialSupportNetwork: '인근 거주 친인척 지지망 부족, 생활지원사 및 복지관 네트워크 연계 필요',
        socialWorkerOpinion: `${clientName} 어르신은 현재 복합적 복지 욕구가 상존하므로 ${isHighRisk ? '긴급 집중사례관리' : '일반사례관리'} 대상자로 선정하여 신속한 민간·공공 자원 연계를 진행해야 함.`,
        recommendedServices: [
          {
            category: '식사/영양관리',
            serviceName: '밑반찬 배달 및 영양 도시락 연계',
            frequency: '주 2~3회',
            purpose: '영양 불균형 해소 및 결식 예방',
          },
          {
            category: '주거/환경개선',
            serviceName: '욕실 안전바 및 미끄럼방지 패드 시공',
            frequency: '1회 (설치 및 점검)',
            purpose: '실내 낙상 사고 사전 방지',
          },
          {
            category: '정서/안부확인',
            serviceName: 'AI 스마트돌봄 안부콜 및 생활지원사 방문',
            frequency: '주 2회',
            purpose: '독거 어르신 고독사 예방 및 정서 안정',
          },
        ],
        shortTermGoals: [
          '1개월 내 주거 안전 점검 및 화장실 안전 손잡이 설치',
          '주 2회 밑반찬 연계를 통한 결식 위험 해소',
        ],
        longTermGoals: [
          '안정적인 일상생활 자립 유지 및 우울감 완화',
          '지역사회 복지 서비스 연계를 통한 촘촘한 안전망 확보',
        ],
        formSpecificFields: {
          conferenceTopic: `${clientName} 어르신 복지 지원 긴급 사례회의`,
          conferenceDiscussion: '거동 불편 및 영양 지원 시급성 검토',
          conferenceDecision: '밑반찬 및 주거환경개선 우선 지원 결정',
          monitoringChange: '초기 면접 대비 정서적 편안함 관찰됨',
          monitoringActionTaken: '복약 상태 확인 및 안전바 설치 일정 안내',
        },
      };

      setAnalysisProgress(100);
      setIsAnalyzing(false);
      setAnalysisResult(emergencyResult);
      setIsWizardMode(true);
      setActiveMainTab('wizard');

      if (autoSendToInsights && onPushInsightToDashboard) {
        transmitInsightToDashboard(emergencyResult);
      }

      setUploadSuccessBanner('⚡ 전문 복지 사정 규칙을 기반으로 임시 사정 데이터가 성공적으로 생성되었습니다.');
      setTimeout(() => setUploadSuccessBanner(null), 4000);
    }, 400);
  };

  // Text-To-Speech (TTS) Engine for Social Workers on the move
  const handlePlayTts = (customSection?: 'all' | 'summary' | 'needs' | 'opinion', targetResult?: AIAnalysisResponse) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('현재 브라우저 환경에서 음성 출력(TTS)을 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel();

    const res = targetResult || analysisResult;
    if (!res) return;

    const targetClient = clients.find((c) => c.id === targetClientId);
    const clientName = targetClient ? `${targetClient.name} 어르신` : '상담 어르신';

    let speechText = '';
    const section = customSection || 'all';
    setTtsActiveSection(section);

    if (section === 'summary' || section === 'all') {
      const summaryLines = res.executiveSummary || [];
      speechText += `사례관리 AI 핵심 요약 음성 브리핑입니다. 대상자: ${clientName}, 판정 위기도는 ${res.riskLevel}입니다. `;
      if (summaryLines.length > 0) {
        speechText += `첫째, ${summaryLines[0]}. `;
        if (summaryLines[1]) speechText += `둘째, ${summaryLines[1]}. `;
        if (summaryLines[2]) speechText += `셋째, ${summaryLines[2]}. `;
      }
    }

    if (section === 'needs' || (section === 'all' && res.primaryNeeds?.length)) {
      speechText += `도출된 주요 복지 욕구는 ${res.primaryNeeds?.join(', ')} 입니다. `;
      if (res.recommendedServices?.length) {
        speechText += `추천 연계 서비스는 ${res.recommendedServices.map((s) => s.serviceName).join(', ')} 입니다. `;
      }
    }

    if (section === 'opinion' || (section === 'all' && res.socialWorkerOpinion)) {
      speechText += `사회복지사 종합 소견: ${res.socialWorkerOpinion}. `;
    }

    speechText += `이상으로 이동 중 음성 브리핑을 마칩니다.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ko-KR';
    utterance.rate = ttsRate;
    utterance.volume = ttsVolume;
    utterance.pitch = 1.0;

    // Select Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.includes('ko') || v.lang.includes('KR') || v.name.includes('Korean') || v.name.includes('Yuna'));
    if (koVoice) {
      utterance.voice = koVoice;
    }

    utterance.onstart = () => {
      setIsTtsSpeaking(true);
      setIsTtsPaused(false);
    };

    utterance.onend = () => {
      setIsTtsSpeaking(false);
      setIsTtsPaused(false);
      setTtsActiveSection('');
    };

    utterance.onerror = (e) => {
      console.warn('TTS error occurred:', e);
      setIsTtsSpeaking(false);
      setIsTtsPaused(false);
      setTtsActiveSection('');
    };

    ttsUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTts = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsTtsPaused(true);
    }
  };

  const handleResumeTts = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsTtsPaused(false);
    }
  };

  const handleStopTts = () => {
    window.speechSynthesis.cancel();
    setIsTtsSpeaking(false);
    setIsTtsPaused(false);
    setTtsActiveSection('');
  };

  const handleChangeTtsRate = (newRate: number) => {
    setTtsRate(newRate);
    if (isTtsSpeaking) {
      handlePlayTts(ttsActiveSection as any);
    }
  };

  // Generate 3-line executive summary
  const generateThreeLineSummary = (result: AIAnalysisResponse): [string, string, string] => {
    const p1 = result.physicalHealthStatus || (result.executiveSummary && result.executiveSummary[0]) || '신체 건강 및 ADL 자립 상태 지속 관찰 필요';
    const p2 = result.emotionalCognitiveStatus || (result.executiveSummary && result.executiveSummary[1]) || '우울 및 사회적 고립감 완화를 위한 정서적 지지 시급';
    const p3 = result.socialWorkerOpinion || (result.executiveSummary && result.executiveSummary[2]) || '맞춤형 재가노인지원서비스 및 긴급 안전망 즉시 연계 조치';
    return [
      `1. [신체·건강] ${p1.slice(0, 90)}${p1.length > 90 ? '...' : ''}`,
      `2. [정서·욕구] ${p2.slice(0, 90)}${p2.length > 90 ? '...' : ''}`,
      `3. [조치·계획] ${p3.slice(0, 90)}${p3.length > 90 ? '...' : ''}`,
    ];
  };

  // Transmit 3-line summary to dashboard
  const transmitInsightToDashboard = (customResult?: AIAnalysisResponse) => {
    const res = customResult || analysisResult;
    if (!res) return;
    const targetClient = clients.find((c) => c.id === targetClientId);
    const summary = generateThreeLineSummary(res);
    const newInsight: ConsultationInsight = {
      id: 'insight-' + Date.now(),
      clientId: targetClientId || targetClient?.id || 'client-1',
      clientName: targetClient?.name || '상담 어르신',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      riskLevel: (res.riskLevel?.includes('고') ? '고위험' : res.riskLevel?.includes('중') ? '중위험' : '일반') as any,
      threeLineSummary: summary,
      keyIssues: focusAreas.length > 0 ? focusAreas.slice(0, 3) : ['식사/영양', '낙상예방', '만성질환'],
      recommendedService: res.recommendedServices?.[0]?.serviceName || '긴급 밑반찬 및 방문안부',
      isUrgent: res.riskLevel?.includes('고') || false,
    };

    if (onPushInsightToDashboard) {
      onPushInsightToDashboard(newInsight);
    }
    setSentInsightToast(`${targetClient?.name || '어르신'}의 3줄 상담 요약이 인사이트 대시보드로 자동 전송되었습니다!`);
    setTimeout(() => setSentInsightToast(null), 4000);
  };

  // Generate contextual AI suggested questions for guide stage
  const handleGenerateAiStageQuestions = async (stage: ConsultationStage) => {
    setIsGeneratingAiQuestions(true);
    try {
      // Simulate real-time tailored guidance or simple synthesis
      await new Promise((r) => setTimeout(r, 600));
      const targetClient = clients.find((c) => c.id === targetClientId);
      const suggestions = [
        {
          id: `ai-q-${Date.now()}-1`,
          text: `"${targetClient ? targetClient.name + ' 어르신' : '어르신'}, 최근 무릎이나 허리 통증 때문에 혼자 일어서거나 화장실 가실 때 휘청거리신 적이 있으신가요?"`,
          rationale: '낙상 고위험 징후 탐색 및 주거 안전바 설치 필요성 판단용 질문',
        },
        {
          id: `ai-q-${Date.now()}-2`,
          text: `"입맛이 없으실 때 끼니를 거르시거나 라면이나 믹스커피로 대충 때우시는 날이 일주일에 며칠 정도 되시나요?"`,
          rationale: '영양 결식 및 당뇨·만성질환 식이 관리 상태 구체적 파악',
        },
        {
          id: `ai-q-${Date.now()}-3`,
          text: `"혼자 계실 때 마음이 답답하거나 문득 슬퍼져서 눈물이 나시는 순간이 있으신가요?"`,
          rationale: '독거노인 고립감 및 노년기 우울증(SGDS-K) 스크리닝 연계',
        },
      ];
      setAiCustomSuggestedQuestions(suggestions);
    } finally {
      setIsGeneratingAiQuestions(false);
    }
  };

  const toggleQuestionCheck = (qId: string) => {
    setCheckedGuideQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const copyOrInsertQuestion = (questionText: string, insertMode: 'scratchpad' | 'clipboard' = 'scratchpad') => {
    if (insertMode === 'scratchpad') {
      setScratchpadText((prev) => (prev ? `${prev}\n[질문/확인]: ${questionText}` : `[질문/확인]: ${questionText}`));
      setQuestionCopiedToast(`임시 관찰 메모에 질문이 삽입되었습니다.`);
    } else {
      navigator.clipboard.writeText(questionText);
      setQuestionCopiedToast(`질문이 클립보드에 복사되었습니다.`);
    }
    setTimeout(() => setQuestionCopiedToast(null), 2500);
  };


  // Create Form and navigate to editor
  const handleApplyToForm = () => {
    if (!analysisResult) return;
    const targetClient = clients.find((c) => c.id === targetClientId);
    const newDoc = mapAiResponseToDocument(
      documentType,
      analysisResult,
      targetClient,
      transcriptText,
      workerNotes
    );
    onGenerateDocument(newDoc);
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-[#382D26] via-[#2F2520] to-[#251D19] rounded-2xl p-6 text-white shadow-md border border-[#52443C] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>재가노인지원사업 전용 AI 문서화 & 실시간 음성인식 엔진</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2 text-stone-100">
            어르신 상담 녹취·음성을 7대 표준 사례관리 서식으로 즉시 자동 매핑
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            방문 상담 시 마이크 음성(STT), 녹음 텍스트, 또는 메모를 입력하면 
            <strong className="text-amber-300 font-semibold"> Gemini 3.7 Flash</strong>가 전문 사회복지사 관점에서 ADL, 위기도, 영양/낙상 위험, 
            맞춤형 서비스 계획을 정밀 분석하여 선택한 7대 표준 공문서 서식에 자동 채워줍니다.
          </p>
        </div>
      </div>

      {/* Preset Quick Loader */}
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              현장 실무 표준 사례 프리셋 (1초 만에 테스트)
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400">클릭 시 실제 현장 대화 녹취록이 자동 로드됩니다</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="text-left p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-all group cursor-pointer shadow-xs bg-white dark:bg-[#251F1C]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-100 group-hover:text-amber-900">
                  {preset.category}
                </span>
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  {preset.clientName} ({preset.age}세)
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                {preset.title}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector Tabs: [🎙️ 1. AI 음성/녹취록 입력] vs [✨ 2. 단계별 AI 서식 완성 마법사] vs [🧭 3. 실시간 상담 가이드 모드] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-stone-100 dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveMainTab('transcript')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'transcript'
              ? 'bg-white dark:bg-[#2C2420] text-amber-900 dark:text-amber-300 shadow-sm border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileAudio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>🎙️ 1. 음성/녹취록 입력</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!analysisResult) {
              if (transcriptText.trim()) {
                runAIAnalysis();
              } else {
                setErrorMessage('서식 완성 마법사를 시작하려면 먼저 녹취록 텍스트를 입력하거나 음성 파일을 첨부해 주세요.');
                setActiveMainTab('transcript');
              }
            } else {
              setActiveMainTab('wizard');
              setIsWizardMode(true);
            }
          }}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeMainTab === 'wizard'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
              : analysisResult
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>✨ 2. 단계별 서식 완성 마법사</span>
          {analysisResult && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-amber-900 font-bold">
              분석완료
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('guide')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'guide'
              ? 'bg-white dark:bg-[#2C2420] text-teal-900 dark:text-teal-300 shadow-sm border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>🧭 3. 실시간 상담 가이드</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300">
            5단계
          </span>
        </button>
      </div>

      {/* Toast Notification */}
      {sentInsightToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sentInsightToast}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">대시보드 반영 완료</span>
        </div>
      )}

      {questionCopiedToast && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2 shadow-xs">
          <Check className="w-3.5 h-3.5 text-amber-600" />
          <span>{questionCopiedToast}</span>
        </div>
      )}

      {/* Mode Views Switching */}
      {activeMainTab === 'wizard' ? (
        analysisResult ? (
          <AIFormWizardStepView
            analysisResult={analysisResult}
            client={clients.find((c) => c.id === targetClientId) || selectedClient || null}
            documentType={documentType}
            workerNotes={workerNotes}
            transcriptText={transcriptText}
            focusAreas={focusAreas}
            onUpdateAnalysisResult={(updated) => setAnalysisResult(updated)}
            onFinishAndSave={(finalDoc) => {
              onGenerateDocument(finalDoc);
            }}
            onPushInsight={(insight) => {
              if (onPushInsightToDashboard) {
                onPushInsightToDashboard(insight);
              }
            }}
            onCancel={() => setActiveMainTab('transcript')}
          />
        ) : (
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl p-8 border border-stone-200 dark:border-stone-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              AI 분석 데이터가 준비되지 않았습니다
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              [음성/녹취록 입력] 탭에서 상담 녹음 파일을 첨부하거나 대화 내용을 입력한 후, 
              <strong> [AI 자동 분석]</strong>을 실행하시면 단계별 수정 및 다듬기 마법사가 즉시 시작됩니다.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveMainTab('transcript')}
                className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                녹취록 입력 화면으로 이동하기
              </button>
              {transcriptText.trim() && (
                <button
                  type="button"
                  onClick={runAIAnalysis}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>지금 바로 AI 분석 시작</span>
                </button>
              )}
            </div>
          </div>
        )
      ) : activeMainTab === 'guide' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 5-Stage Step Navigator & Stage Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Stage Tabs Bar */}
            <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-teal-600" />
                  상담 진행 5단계 단계별 선택
                </span>
                <span className="text-[11px] text-stone-500">
                  체크 완료:{' '}
                  {Object.values(checkedGuideQuestions).filter(Boolean).length}개 문항
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {CONSULTATION_STAGES.map((stg) => {
                  const isCurrent = activeGuideStageId === stg.id;
                  const stageCheckedCount = stg.questions.filter((q) => checkedGuideQuestions[q.id]).length;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => {
                        setActiveGuideStageId(stg.id);
                        setAiCustomSuggestedQuestions([]);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 shadow-xs ring-1 ring-teal-500'
                          : 'bg-stone-50 dark:bg-[#251F1C] border-stone-200 dark:border-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isCurrent ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {stg.stageNumber}단계
                        </span>
                        {stageCheckedCount === stg.questions.length && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                        {stg.title}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-1">
                        {stageCheckedCount}/{stg.questions.length} 완료
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stage Questions & Real-time Checklist */}
            {(() => {
              const curStage = CONSULTATION_STAGES.find((s) => s.id === activeGuideStageId) || CONSULTATION_STAGES[0];
              return (
                <div className="bg-white dark:bg-[#1E1916] p-5 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 shadow-xs space-y-4">
                  {/* Stage Header & Tips */}
                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-600 text-white">
                          {curStage.stageNumber}단계
                        </span>
                        <h3 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                          {curStage.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        {curStage.badge}
                      </span>
                    </div>
                    <div className="text-xs text-stone-700 dark:text-stone-300 bg-white/70 dark:bg-stone-900/50 p-2.5 rounded-lg border border-teal-200/40">
                      💡 <strong>진행 가이드 & 목표:</strong> {curStage.subtitle}
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span>필수 질문 체크리스트 ({curStage.questions.length}문항)</span>
                      <span className="text-[11px] text-stone-500">질문 클릭 시 체크 및 메모 반영</span>
                    </div>

                    {curStage.questions.map((item) => {
                      const isChecked = !!checkedGuideQuestions[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isChecked
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                              : 'bg-stone-50 dark:bg-[#251F1C] border-stone-200 dark:border-stone-800 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleQuestionCheck(item.id)}
                              className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                                  {item.category}
                                </span>
                                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1 rounded">
                                  사정가이드
                                </span>
                              </div>
                              <p
                                className={`text-xs font-semibold leading-relaxed ${
                                  isChecked
                                    ? 'text-stone-500 line-through'
                                    : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {item.question}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                ↳ 의도: {item.rationale}
                              </p>

                              {/* Quick Action to Insert to Scratchpad */}
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
                                <button
                                  type="button"
                                  onClick={() => copyOrInsertQuestion(item.question, 'scratchpad')}
                                  className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>임시 관찰메모에 질문 삽입</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyOrInsertQuestion(item.question, 'clipboard')}
                                  className="text-[11px] text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>복사</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Instant Follow-up Question Suggestion Generator */}
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>AI 맞춤형 실시간 심층 질문 추천</span>
                      </div>
                      <button
                        type="button"
                        disabled={isGeneratingAiQuestions}
                        onClick={() => handleGenerateAiStageQuestions(curStage)}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isGeneratingAiQuestions ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>{curStage.title} AI 질문 생성</span>
                      </button>
                    </div>

                    {aiCustomSuggestedQuestions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {aiCustomSuggestedQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="p-3 rounded-lg bg-white dark:bg-[#251F1C] border border-amber-300 dark:border-amber-800 text-xs space-y-1.5 shadow-xs"
                          >
                            <p className="font-semibold text-stone-900 dark:text-stone-100">
                              {q.text}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-stone-500">
                              <span>↳ {q.rationale}</span>
                              <button
                                type="button"
                                onClick={() => copyOrInsertQuestion(q.text, 'scratchpad')}
                                className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                              >
                                + 메모에 넣기
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column: Live Scratchpad & Voice Recording & Switch back (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Observation Scratchpad in Guide Mode */}
            <div className="bg-white dark:bg-[#1E1916] p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-600" />
                  상담 중 실시간 관찰 & 답변 메모
                </h3>
                <span className="text-[10px] text-stone-500">질문 답변 기록용</span>
              </div>

              <textarea
                rows={8}
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="상담 중 어르신의 답변이나 특이사항을 빠르게 적어두세요. 체크리스트 질문을 클릭하여 삽입하거나 직접 타이핑할 수 있습니다."
                className="w-full text-xs font-sans p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#251F1C] text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (scratchpadText.trim()) {
                      setTranscriptText((prev) => (prev ? `${prev}\n\n${scratchpadText}` : scratchpadText));
                      setActiveMainTab('transcript');
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>메모를 녹취록에 넣고 서식 자동분석</span>
                </button>
              </div>
            </div>

            {/* Quick Live Voice Recorder in Guide Mode */}
            <div className="bg-white dark:bg-[#1E1916] p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-rose-600" />
                  가이드 중 백그라운드 실시간 녹음
                </span>
                <span className="text-xs text-stone-500">{formatTimer(recordingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={toggleRecording}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 dark:bg-stone-700'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? '녹음 정지 및 녹취록 반영' : '상담 대화 녹음 시작'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
      /* Main Two-Column Studio Layout */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Input & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target Form & Client Selectors */}
          <div className="bg-white dark:bg-[#1E1916] p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              1. 작성할 사례관리 서식 및 대상 어르신 선택
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  변환할 표준 서식 양식 <span className="text-amber-600">*</span>
                </label>
                <select
                  id="select-document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] px-3 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="intake">1. 초기면접지 (인테이크)</option>
                  <option value="assessment">2. 종합사정기록지 (ADL/사정)</option>
                  <option value="case_conference">3. 사례회의록 (다학제 논의)</option>
                  <option value="service_plan">4. 서비스 제공 계획서 (ISP)</option>
                  <option value="monitoring">5. 모니터링 및 상담·방문일지</option>
                  <option value="reassessment">6. 재사정표 (정기/수시)</option>
                  <option value="termination">7. 종결보고서 및 사례평가서</option>
                </select>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  {DOCUMENT_TYPE_LABELS[documentType].description}
                </p>
              </div>

              {/* Target Client */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  연계할 대상 어르신 프로필
                </label>
                <select
                  id="select-target-client"
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#251F1C] px-3 py-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- 신규 발굴 어르신 (AI 추출 정보로 자동생성) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.age}세, {c.livingType} / {c.welfareType})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  기존 관리 어르신 선택 시 인적사항과 질환 정보가 함께 결합됩니다.
                </p>
              </div>
            </div>

            {/* Focus Areas Chips */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                AI 중점 사정 영역 (다중 선택 가능)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_OPTIONS.map((opt) => {
                  const isSelected = focusAreas.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleFocusArea(opt)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-700 font-bold shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transcript / Audio Input Card */}
          <div className="bg-white dark:bg-[#1E1916] p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                2. 상담 현장 실시간 마이크 녹음(STT) 또는 녹취록 입력
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Record Button */}
                <button
                  id="btn-voice-record"
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-400'
                      : 'bg-amber-700 hover:bg-amber-600 text-white'
                  }`}
                  title="브라우저 마이크 음성 실시간 받아쓰기 (단축키: Space / Alt+R)"
                  aria-keyshortcuts="Space"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>녹음 종료 ({formatTimer(recordingSeconds)})</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>실시간 녹음 (Space)</span>
                    </>
                  )}
                </button>

                {isRecording && (
                  <button
                    type="button"
                    onClick={togglePause}
                    className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-300 transition-colors"
                    title={isPaused ? '재개' : '일시정지'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* 🎯 Key Segment Bookmark Button */}
                <button
                  type="button"
                  onClick={() => handleMarkKeySegment()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 transition-all cursor-pointer shadow-2xs"
                  title="어르신 주요 호소/위험 징후 발화 지점 중요 북마크 (단축키: M)"
                  aria-keyshortcuts="KeyM"
                >
                  <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>중요구간 마킹 (M)</span>
                </button>

                {/* Keyboard Shortcuts Info Button */}
                <button
                  type="button"
                  onClick={() => setShowShortcutHelpModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="단축키 가이드 보기 (?)"
                >
                  <Keyboard className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">단축키</span>
                </button>

                {/* File Upload Button (Audio & Text) */}
                <label
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                    isTranscribingAudio
                      ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-amber-400'
                  }`}
                  title="음성 녹음 파일(MP3, WAV, M4A 등) 또는 텍스트 문서(TXT, VTT, DOCX 등)를 업로드하여 AI 자동 변환합니다."
                >
                  {isTranscribingAudio ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>음성 STT 변환 중...</span>
                    </>
                  ) : (
                    <>
                      <FileAudio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="hidden sm:inline">음성/문서 파일 첨부 (STT)</span>
                      <span className="sm:hidden">파일첨부</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.m4a,.wav,.aac,.ogg,.webm,.flac,.wma,.txt,.vtt,.srt,.doc,.docx,.json,.csv,audio/*"
                    className="hidden"
                    disabled={isTranscribingAudio}
                    onChange={handleFileUpload}
                  />
                </label>

                {transcriptText && (
                  <button
                    type="button"
                    onClick={copyTranscript}
                    className="p-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="복사"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Shortcuts Accessibility Bar */}
            <div className="flex flex-wrap items-center justify-between text-[11px] bg-stone-50 dark:bg-[#251F1C] px-3 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono text-[10px] font-bold shadow-2xs">Space</kbd>
                  <span>녹음 시작/중지</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono text-[10px] font-bold shadow-2xs">M</kbd>
                  <span>중요구간 마킹</span>
                </span>
                <span className="flex items-center gap-1 hidden sm:flex">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono text-[10px] font-bold shadow-2xs">Ctrl+Enter</kbd>
                  <span>AI 사정분석</span>
                </span>
                <span className="flex items-center gap-1 hidden md:flex">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono text-[10px] font-bold shadow-2xs">Alt+E</kbd>
                  <span>직접수정</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutHelpModal(true)}
                className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>전체 단축키</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Bookmarks Display Area */}
            {bookmarks.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    마킹된 중요 발화 구간 ({bookmarks.length}개)
                  </span>
                  <button
                    type="button"
                    onClick={() => setBookmarks([])}
                    className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    목록 지우기
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bookmarks.map((bm) => (
                    <span
                      key={bm.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#201A17] border border-amber-300 dark:border-amber-800 text-[11px] text-stone-800 dark:text-stone-200 shadow-2xs"
                    >
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">{bm.timestamp}</span>
                      <span>{bm.label.replace(`[${bm.timestamp}]`, '').trim()}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Audio STT Processing & Progress Bar Indicator */}
            {isTranscribingAudio && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/15 border-2 border-amber-400 dark:border-amber-600/80 shadow-md space-y-4 animate-in fade-in duration-200">
                {/* Header: Status, Percentage, Elapsed Timer & Cancel Button */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                        <span>Gemini AI 고정밀 음성 인식(STT) 진행 중</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                          {audioProgress}%
                        </span>
                      </h4>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 line-clamp-1">
                        {transcribingStatus || '음성을 분석하여 발화자(사회복지사/어르신)별 대화록으로 변환하고 있습니다...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>{Math.floor(audioElapsedSeconds / 60).toString().padStart(2, '0')}:{(audioElapsedSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={cancelAudioTranscription}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/60 text-stone-600 dark:text-stone-300 text-xs font-semibold border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
                      title="진행 중인 음성 변환 취소"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>취소</span>
                    </button>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-amber-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-amber-300/80 dark:border-amber-700/60 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                      style={{ width: `${Math.max(audioProgress, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
                    </div>
                  </div>
                </div>

                {/* 4-Stage Progress Breadcrumbs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {AUDIO_STT_STAGES.map((stage, idx) => {
                    const isCompleted = audioStageIndex > idx;
                    const isCurrent = audioStageIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-left transition-all border ${
                          isCompleted
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                            : isCurrent
                            ? 'bg-white dark:bg-stone-900 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/30 shadow-xs'
                            : 'bg-stone-50/50 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center text-[9px] font-mono shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span className="text-[11px] font-bold truncate">{stage.label}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1">
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Uploaded File Info Footnote */}
                {audioFileMeta && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-900 dark:text-amber-300 pt-2 border-t border-amber-200/80 dark:border-amber-800/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">📁 파일: {audioFileMeta.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold">
                        {audioFileMeta.format} ({audioFileMeta.sizeMB}MB)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      💡 시스템이 정상 작동 중입니다. 오디오 크기에 따라 3~10초 소요됩니다.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Upload Success Banner */}
            {uploadSuccessBanner && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">{uploadSuccessBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadSuccessBanner(null)}
                  className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                >
                  닫기
                </button>
              </div>
            )}

            {/* Uploaded Audio Playback Widget */}
            {uploadedAudioUrl && (
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-[#2A2320] border border-stone-300 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200 truncate">
                    <FileAudio className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">첨부 음성 재생: {uploadedAudioFileName || '녹음 파일'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedAudioUrl(null);
                      setUploadedAudioFileName(null);
                    }}
                    className="text-[11px] text-stone-500 hover:text-rose-600 cursor-pointer"
                  >
                    오디오 닫기
                  </button>
                </div>
                <audio
                  src={uploadedAudioUrl}
                  controls
                  className="w-full h-8 rounded-lg focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    💡 재생 바에서 음성을 확인하거나 Gemini AI로 고정밀 녹취록 변환을 수행할 수 있습니다.
                  </span>
                  {recordedAudioBlob && !isTranscribingAudio && (
                    <button
                      type="button"
                      onClick={handleTranscribeRecordedAudio}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini 고정밀 STT 변환</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Voice Recording Active Banner */}
            {isRecording && (
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      실시간 음성 수신 중: {formatTimer(recordingSeconds)} {isPaused && '(일시정지됨)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <div className="w-20 h-2 bg-rose-200 dark:bg-rose-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 dark:bg-rose-400 transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {interimTranscript && (
                  <p className="text-xs italic text-rose-800 dark:text-rose-300 line-clamp-1 bg-white/70 dark:bg-stone-900/70 p-1.5 rounded border border-rose-100 dark:border-rose-900">
                    "{interimTranscript}"
                  </p>
                )}
              </div>
            )}

            {micStatusMessage && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{micStatusMessage}</span>
              </div>
            )}

            {/* Main Textarea with Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl transition-all ${
                isDragOver
                  ? 'ring-4 ring-amber-500 ring-offset-2 bg-amber-50/40 dark:bg-amber-950/30'
                  : ''
              }`}
            >
              <textarea
                id="input-transcript-text"
                rows={10}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`[예시: 상담 대화 또는 녹취 내용]
사회복지사: 어르신, 요즘 무릎 통증은 좀 어떠세요?
어르신: 말도 마요. 지난주 화장실 문턱에서 넘어져서 엉덩방아를 찧었어. 밥맛도 없어서 하루 한 끼 찬물에 말아 먹어...

💡 파일 첨부 팁:
- MP3, M4A, WAV 등 음성 파일을 이 곳에 드래그하거나 상단 '음성/문서 파일 첨부'를 클릭하면 Gemini AI가 고정밀 한국어 텍스트로 자동 변환(STT)합니다.
- TXT, DOCX, CSV 등 텍스트 문서를 드래그하여 바로 불러올 수 있습니다.`}
                className="w-full text-xs font-mono p-3.5 rounded-lg border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 dark:text-stone-100 bg-stone-50/60 dark:bg-[#251F1C] leading-relaxed resize-y"
              />

              {isDragOver && (
                <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-xs rounded-lg border-2 border-dashed border-amber-500 flex flex-col items-center justify-center pointer-events-none text-amber-900 dark:text-amber-200">
                  <Upload className="w-8 h-8 text-amber-600 animate-bounce mb-2" />
                  <span className="text-sm font-bold">음성 또는 텍스트 파일을 여기에 놓아주세요</span>
                  <span className="text-xs text-amber-700 dark:text-amber-300">MP3, WAV, M4A, TXT 등 자동 인식 및 STT 변환</span>
                </div>
              )}

              <div className="absolute bottom-2.5 right-3 text-[11px] text-stone-400 bg-white/80 dark:bg-stone-900/80 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                글자 수: {transcriptText.length.toLocaleString()}자
              </div>
            </div>

            {/* Extra Social Worker Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                사회복지사 현장 관찰 메모 (선택 사항)
              </label>
              <input
                type="text"
                value={workerNotes}
                onChange={(e) => setWorkerNotes(e.target.value)}
                placeholder="예: 실내 조명 어두움, 냉장고 위생 불량, 이웃 통장님과 라포 형성 필요 등 특이사항"
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-[#251F1C]"
              />
            </div>

            {/* Real-time Supplementary Scratchpad */}
            <div className="rounded-xl border border-amber-300/80 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    <StickyNote className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    실시간 보충 임시 메모장
                  </span>
                  {isAnalyzing && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white animate-pulse flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI 분석 진행 중 작성 가능
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {scratchpadText && (
                    <>
                      <button
                        type="button"
                        onClick={copyScratchpad}
                        className="px-2 py-1 text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded hover:bg-amber-100 dark:hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                        title="메모 복사"
                      >
                        {scratchpadCopied ? <Check className="w-3 h-3 text-amber-700" /> : <Copy className="w-3 h-3" />}
                        <span>{scratchpadCopied ? '복사됨' : '복사'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScratchpadText('')}
                        className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 rounded hover:bg-rose-100 dark:hover:bg-rose-950 flex items-center gap-1 cursor-pointer"
                        title="메모 비우기"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>비우기</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                녹음 직후나 AI가 분석하는 동안 떠오른 핵심 관찰사항, 대상자 주요 어록, 긴급 조치 메모를 자유롭게 입력하세요. 분석 요청 시 자동 반영되거나 녹취록에 바로 병합할 수 있습니다.
              </p>

              {/* Quick Keyword Tag Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  '식사/영양 불량',
                  '화장실 낙상 위험',
                  '우울/고립감 심각',
                  '약물 오복용·방치',
                  '보호자 연락두절',
                  '긴급 안전바 설치요망',
                  '장기요양 등급신청 필요',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertScratchpadTag(`[${tag}]`)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>

              {/* Scratchpad Textarea */}
              <div className="relative">
                <textarea
                  id="input-temporary-scratchpad"
                  rows={3}
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="예: 어르신께서 혼자 계실 때 불안하여 불을 켜고 주무신다고 하심. 냉장고 약통에 유통기한 지난 약 다수 발견. 긴급 영양 반찬 지원 연계 메모."
                  className="w-full text-xs font-sans p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 dark:text-stone-100 bg-white dark:bg-[#251F1C] leading-relaxed resize-y"
                />
                {scratchpadText && (
                  <div className="absolute bottom-2 right-2 text-[10px] text-stone-400 bg-white/90 dark:bg-stone-900/90 px-1.5 py-0.2 rounded border border-stone-200 dark:border-stone-700">
                    {scratchpadText.length}자
                  </div>
                )}
              </div>

              {/* Quick Merge Action Buttons */}
              {scratchpadText.trim() && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={mergeScratchpadToTranscript}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>녹취록 본문에 추가 병합</span>
                  </button>

                  <button
                    type="button"
                    onClick={mergeScratchpadToWorkerNotes}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-900 dark:text-stone-100 text-xs font-semibold border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    <span>관찰 메모로 반영</span>
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                id="btn-run-ai-analysis"
                type="button"
                disabled={isAnalyzing || !transcriptText.trim()}
                onClick={runAIAnalysis}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAnalyzing || !transcriptText.trim()
                    ? 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-600 shadow-amber-700/20 active:scale-[0.99]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini 3.7 AI 사례관리 심층 사정 및 서식 작성 중... ({analysisProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-bounce" />
                    <span>AI 자동 분석 및 {DOCUMENT_TYPE_LABELS[documentType].short} 데이터 생성하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">분석 처리 알림: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/80 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={runAIAnalysis}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>AI 분석 다시 시도</span>
                  </button>

                  <button
                    type="button"
                    onClick={generateEmergencyAssessment}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    title="API 지연 시 임상 사정 규칙 기반으로 즉시 사정 결과 생성"
                  >
                    <Zap className="w-3 h-3 text-amber-200" />
                    <span>즉시 규칙 사정 데이터 생성 (비상)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-[11px] ml-auto cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Output & Realtime Summary Auto-Mapping (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* ⚡ Real-Time Consultation Summary & Auto-Mapping Card (Triggered upon recording end or when transcript exists) */}
          {(showRealtimeSummary || transcriptText.trim().length > 15) && (
            <AIRealtimeSummaryCard
              transcriptText={transcriptText}
              clientName={(clients.find((c) => c.id === targetClientId) || selectedClient || clients[0])?.name || '상담 어르신'}
              clientId={targetClientId || selectedClient?.id || clients[0]?.id || 'client-1'}
              defaultDocType={documentType}
              onApplyMappedDraftToForm={handleApplyRealtimeSummaryDraftToForm}
            />
          )}

          {analysisResult ? (
            <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden sticky top-24 transition-colors">
              {/* Header banner */}
              <div className="bg-gradient-to-r from-[#2F2520] to-[#251D19] text-white p-4 flex items-center justify-between border-b border-stone-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold">AI 사례 사정 브리핑 & 추천 계획</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAnalysis(!isEditingAnalysis)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                      isEditingAnalysis
                        ? 'bg-amber-500 text-stone-900 border-amber-400 shadow-xs'
                        : 'bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAnalysis ? '수정 완료 (미리보기)' : '분석 결과 직접 수정하기'}</span>
                  </button>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      analysisResult.riskLevel.includes('고')
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : analysisResult.riskLevel.includes('중')
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    위기도: {analysisResult.riskLevel}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                {/* Manual Correction Mode Info Banner */}
                {isEditingAnalysis && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>사용자 직접 수정 모드가 켜져 있습니다.</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      녹취나 텍스트에서 AI가 분석한 내용 중 오차나 오류가 있는 부분을 자유롭게 수정하거나 추가하세요. 수정된 내용은 서식 편집기 및 3줄 요약에 즉시 반영됩니다.
                    </p>
                  </div>
                )}
                {/* 📊 회기별 상담 정서 흐름 & 우울 추이 시각화 Chart */}
                <CounselingSentimentTrendChart clientName={(clients.find(c => c.id === targetClientId) || selectedClient || clients[0])?.name || '어르신'} />

                {/* 🎧 TTS Voice Player for Social Workers on the move */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-teal-950/40 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/70 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-600 text-white shadow-xs">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>현장 이동 중 AI 음성 브리핑 (TTS)</span>
                          {isTtsSpeaking && !isTtsPaused && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              음성 재생 중
                            </span>
                          )}
                          {isTtsPaused && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300">
                              일시 정지
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          신체·정서·조치계획 핵심 요약을 음성으로 들으며 다음 방문지로 이동하세요.
                        </p>
                      </div>
                    </div>

                    <label className="hidden sm:flex items-center gap-1 text-[10px] text-stone-600 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPlayTtsOnComplete}
                        onChange={(e) => setAutoPlayTtsOnComplete(e.target.checked)}
                        className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>분석 완료 시 자동재생</span>
                    </label>
                  </div>

                  {/* Audio Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                    <div className="flex items-center gap-1.5">
                      {!isTtsSpeaking || isTtsPaused ? (
                        <button
                          type="button"
                          onClick={() => (isTtsPaused ? handleResumeTts() : handlePlayTts('all'))}
                          className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isTtsPaused ? '이어듣기' : '전체 요약 듣기'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePauseTts}
                          className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>일시 정지</span>
                        </button>
                      )}

                      {isTtsSpeaking && (
                        <button
                          type="button"
                          onClick={handleStopTts}
                          className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 text-xs transition-colors cursor-pointer"
                          title="음성 정지"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Section Quick Jump Buttons */}
                      <button
                        type="button"
                        onClick={() => handlePlayTts('summary')}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors cursor-pointer ${
                          ttsActiveSection === 'summary' && isTtsSpeaking
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        3줄요약만
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlayTts('opinion')}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors cursor-pointer ${
                          ttsActiveSection === 'opinion' && isTtsSpeaking
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        종합소견만
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">배속:</span>
                      {[0.9, 1.0, 1.2, 1.5].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleChangeTtsRate(rate)}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                            ttsRate === rate
                              ? 'bg-amber-600 text-white'
                              : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3-line Executive Summary */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      사회복지사 핵심 요약 브리핑
                    </span>
                    {isEditingAnalysis && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">
                        (각 항목을 직접 수정하세요)
                      </span>
                    )}
                  </h4>
                  {isEditingAnalysis ? (
                    <div className="space-y-2">
                      {analysisResult.executiveSummary.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-amber-600 font-bold text-xs shrink-0">•</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...analysisResult.executiveSummary];
                              updated[idx] = e.target.value;
                              setAnalysisResult({ ...analysisResult, executiveSummary: updated });
                            }}
                            className="w-full text-xs p-1.5 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {analysisResult.executiveSummary.map((item, idx) => (
                        <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Risk Level & Risk Rationale */}
                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      위기도 판정 근거 및 위험요인
                    </div>
                    {isEditingAnalysis && (
                      <div className="flex items-center gap-1">
                        {['고위험', '중위험', '일반'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setAnalysisResult({ ...analysisResult, riskLevel: level })}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                              analysisResult.riskLevel === level
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {isEditingAnalysis ? (
                    <textarea
                      rows={2}
                      value={analysisResult.riskRationale || ''}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, riskRationale: e.target.value })}
                      className="w-full text-xs p-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                      {analysisResult.riskRationale || '신체 건강 및 주거 안전 위험 요인 존재.'}
                    </p>
                  )}
                </div>

                {/* Primary Needs */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ListPlus className="w-3.5 h-3.5 text-stone-500" />
                      도출된 주요 어르신 욕구 및 과제 ({analysisResult.primaryNeeds?.length || 0}건)
                    </span>
                    {isEditingAnalysis && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(analysisResult.primaryNeeds || []), '새로운 욕구 항목'];
                          setAnalysisResult({ ...analysisResult, primaryNeeds: updated });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer font-semibold"
                      >
                        + 욕구 추가
                      </button>
                    )}
                  </h4>
                  {isEditingAnalysis ? (
                    <div className="space-y-1.5">
                      {analysisResult.primaryNeeds?.map((need, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={need}
                            onChange={(e) => {
                              const updated = [...(analysisResult.primaryNeeds || [])];
                              updated[idx] = e.target.value;
                              setAnalysisResult({ ...analysisResult, primaryNeeds: updated });
                            }}
                            className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = analysisResult.primaryNeeds?.filter((_, i) => i !== idx);
                              setAnalysisResult({ ...analysisResult, primaryNeeds: updated });
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded text-xs"
                            title="삭제"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.primaryNeeds?.map((need, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Care Services */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      추천 재가노인지원 맞춤형 서비스
                    </span>
                    {isEditingAnalysis && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...(analysisResult.recommendedServices || []),
                            { serviceName: '신규 지원 서비스', frequency: '주 1회', purpose: '일상 지원 및 안부 확인' },
                          ];
                          setAnalysisResult({ ...analysisResult, recommendedServices: updated });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer"
                      >
                        + 서비스 추가
                      </button>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.recommendedServices?.map((svc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#251F1C] text-xs"
                      >
                        {isEditingAnalysis ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={svc.serviceName}
                                onChange={(e) => {
                                  const updated = [...(analysisResult.recommendedServices || [])];
                                  updated[idx] = { ...updated[idx], serviceName: e.target.value };
                                  setAnalysisResult({ ...analysisResult, recommendedServices: updated });
                                }}
                                placeholder="서비스명"
                                className="w-full text-xs font-bold p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916]"
                              />
                              <input
                                type="text"
                                value={svc.frequency}
                                onChange={(e) => {
                                  const updated = [...(analysisResult.recommendedServices || [])];
                                  updated[idx] = { ...updated[idx], frequency: e.target.value };
                                  setAnalysisResult({ ...analysisResult, recommendedServices: updated });
                                }}
                                placeholder="주기"
                                className="w-24 text-xs p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = analysisResult.recommendedServices?.filter((_, i) => i !== idx);
                                  setAnalysisResult({ ...analysisResult, recommendedServices: updated });
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                ✕
                              </button>
                            </div>
                            <input
                              type="text"
                              value={svc.purpose}
                              onChange={(e) => {
                                  const updated = [...(analysisResult.recommendedServices || [])];
                                  updated[idx] = { ...updated[idx], purpose: e.target.value };
                                  setAnalysisResult({ ...analysisResult, recommendedServices: updated });
                              }}
                              placeholder="목적 및 내용"
                              className="w-full text-[11px] p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1916]"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-stone-800 dark:text-stone-200">{svc.serviceName}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-semibold">
                                {svc.frequency}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-400">
                              {svc.purpose}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Worker Opinion Preview */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      사회복지사 종합소견 {isEditingAnalysis ? '직접 수정' : '초안'}
                    </span>
                  </h4>
                  {isEditingAnalysis ? (
                    <textarea
                      rows={4}
                      value={analysisResult.socialWorkerOpinion}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, socialWorkerOpinion: e.target.value })}
                      className="w-full text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-[#1E1916] p-2.5 rounded border border-amber-400 dark:border-amber-600 leading-relaxed focus:ring-2 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#251F1C] p-2.5 rounded border border-stone-200 dark:border-stone-700 leading-relaxed">
                      {analysisResult.socialWorkerOpinion}
                    </p>
                  )}
                </div>

                {/* 3-Line Summary Dashboard Transmission Section */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-teal-50 dark:from-amber-950/40 dark:to-teal-950/40 border border-amber-300 dark:border-amber-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      상담 인사이트 대시보드 연동
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSendToInsights}
                        onChange={(e) => setAutoSendToInsights(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>분석 시 자동 전송</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    긴 상담 녹음의 3줄 핵심 요약(신체·정서·조치계획)을 상담 인사이트 대시보드로 즉시 보냅니다.
                  </p>

                  <button
                    type="button"
                    onClick={() => transmitInsightToDashboard()}
                    className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>대시보드로 3줄 요약 즉시 전송</span>
                  </button>
                </div>

                {/* Analysis Result Immediate Linkage & Wizard Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    id="btn-immediate-form-link"
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400/50 active:scale-[0.99]"
                    title="추출된 상담 분석 내용을 10대 표준 서식에 자동 매핑하여 서식 편집기 초안으로 즉시 이동합니다."
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-100" />
                    <span>⚡ 분석 결과 즉시 연동 ({DOCUMENT_TYPE_LABELS[documentType].short} 초안 바로가기)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMainTab('wizard');
                      setIsWizardMode(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ring-1 ring-amber-400/40 active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                    <span>✨ AI 6단계 서식 완성 마법사 (차례대로 문장 수정·다듬기)</span>
                  </button>

                  <button
                    id="btn-apply-to-form-editor"
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>서식 편집기로 이동 (수동 직접 편집/PDF 출력)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50/60 dark:bg-[#1E1916] border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center text-stone-500 dark:text-stone-400 flex flex-col items-center justify-center min-h-[420px] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-stone-700 dark:text-stone-200 mb-1">
                AI 실시간 분석 대기 중
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed mb-4">
                왼쪽 화면에서 마이크로 음성을 녹음하거나 상담 텍스트를 입력하고 
                <br />
                <span className="font-semibold text-amber-800 dark:text-amber-300">[AI 자동 분석]</span> 버튼을 누르면
                여기에 실시간 사정 결과와 표준 서식이 생성됩니다.
              </p>
              <div className="text-[11px] bg-white dark:bg-[#251F1C] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-left space-y-1 shadow-xs">
                <div className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  지원되는 7대 표준 양식:
                </div>
                <div>• 초기면접지, 종합사정표, 사례회의록</div>
                <div>• 서비스계획서(ISP), 모니터링일지</div>
                <div>• 재사정표, 종결보고서 및 평가서</div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      {/* Shortcut Toast Notification */}
      {shortcutToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900/95 dark:bg-stone-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-amber-500/50 flex items-center gap-2 animate-slide-in backdrop-blur-xs">
          <Keyboard className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{shortcutToast}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Accessibility Help Modal */}
      {showShortcutHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl max-w-md w-full border border-stone-300 dark:border-stone-700 shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold">키보드 접근성 단축키 안내</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutHelpModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-stone-600 dark:text-stone-300">
                마우스 없이 키보드만으로 상담 녹취를 신속하게 제어하고 중요 구간을 마킹할 수 있습니다.
              </p>

              <div className="space-y-2 divide-y divide-stone-100 dark:divide-stone-800">
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">실시간 녹음 시작 / 중지</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Space</kbd>
                    <span className="text-stone-400">또는</span>
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Alt+R</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">중요 발화 / 위험구간 마킹</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">M</kbd>
                    <span className="text-stone-400">또는</span>
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Alt+M</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">AI 서식 사정분석 즉시 실행</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Ctrl+Enter</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">분석 결과 직접 수정 모드 토글</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Alt+E</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">AI 요약 음성 브리핑(TTS) 재생/정지</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">Alt+T</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium text-stone-700 dark:text-stone-200">단축키 도움말 열기/닫기</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-mono font-bold text-stone-800 dark:text-stone-200">?</kbd>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowShortcutHelpModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  확인 완료 (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

