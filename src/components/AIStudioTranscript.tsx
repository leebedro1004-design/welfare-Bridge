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
  ChevronRight
} from 'lucide-react';
import { DocumentType, ClientProfile, PresetScenario, AIAnalysisResponse, CaseDocument, ConsultationInsight } from '../types';
import { DOCUMENT_TYPE_LABELS, mapAiResponseToDocument } from '../utils/documentTemplates';
import { PRESET_SCENARIOS } from '../data/mockData';
import { CONSULTATION_STAGES, ConsultationStage } from '../data/consultationGuides';
import confetti from 'canvas-confetti';

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
  const [activeMainTab, setActiveMainTab] = useState<'transcript' | 'guide'>('transcript');

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

  // Consultation Guide Mode states
  const [activeGuideStageId, setActiveGuideStageId] = useState<number>(1);
  const [checkedGuideQuestions, setCheckedGuideQuestions] = useState<Record<string, boolean>>({});
  const [aiCustomSuggestedQuestions, setAiCustomSuggestedQuestions] = useState<Array<{ id: string; text: string; rationale: string }>>([]);
  const [isGeneratingAiQuestions, setIsGeneratingAiQuestions] = useState<boolean>(false);
  const [questionCopiedToast, setQuestionCopiedToast] = useState<string | null>(null);

  // Auto-send 3-line summary state
  const [autoSendToInsights, setAutoSendToInsights] = useState<boolean>(true);
  const [sentInsightToast, setSentInsightToast] = useState<string | null>(null);

  // Recording & Microphone states

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

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
        console.warn('Speech recognition notification:', err);
        if (err.error === 'not-allowed') {
          setMicStatusMessage('마이크 접근 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해 주세요.');
          stopRecordingInternal();
        }
      };

      recog.onend = () => {
        if (isRecording && !isPaused) {
          try {
            recog.start();
          } catch (e) {}
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

  // Update target client when prop changes
  useEffect(() => {
    if (selectedClient) {
      setTargetClientId(selectedClient.id);
    }
  }, [selectedClient]);

  // Audio level visualizer loop
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

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
    } catch (err) {
      console.warn('Microphone stream access notice:', err);
    }
  };

  const stopRecordingInternal = () => {
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');
    setAudioLevel(0);
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
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
  };

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

  // Handle File Upload (.txt, .vtt, .srt, .docx, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscriptText(content);
    };
    reader.readAsText(file);
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

      // Auto-transmit 3-line summary to dashboard if enabled
      if (autoSendToInsights && onPushInsightToDashboard) {
        transmitInsightToDashboard(data.result);
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
      setErrorMessage(err.message || '서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
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

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
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

      {/* Mode Selector Tabs: [🎙️ AI 음성/녹취록 입력] vs [🧭 실시간 상담 가이드 모드 (질문 체크리스트)] */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveMainTab('transcript')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'transcript'
              ? 'bg-white dark:bg-[#2C2420] text-amber-900 dark:text-amber-300 shadow-sm border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileAudio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>🎙️ AI 음성 녹음 & 녹취록 기반 표준 서식 작성</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('guide')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'guide'
              ? 'bg-white dark:bg-[#2C2420] text-teal-900 dark:text-teal-300 shadow-sm border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>🧭 실시간 상담 가이드 모드 (단계별 질문 체크리스트)</span>
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

      {/* When Guide Mode is Active */}
      {activeMainTab === 'guide' ? (
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
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-amber-700 hover:bg-amber-600 text-white'
                  }`}
                  title="브라우저 마이크 음성 실시간 받아쓰기"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>녹음 종료 ({formatTimer(recordingSeconds)})</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>현장 실시간 음성 녹음</span>
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

                {/* File Upload Button */}
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>텍스트/자막 파일 첨부</span>
                  <input
                    type="file"
                    accept=".txt,.vtt,.srt,.doc,.docx,.json,.csv"
                    className="hidden"
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

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                id="input-transcript-text"
                rows={10}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`[예시: 상담 대화 또는 녹취 내용]
사회복지사: 어르신, 요즘 무릎 통증은 좀 어떠세요?
어르신: 말도 마요. 지난주 화장실 문턱에서 넘어져서 엉덩방아를 찧었어. 밥맛도 없어서 하루 한 끼 찬물에 말아 먹어...
(상단 '현장 실시간 음성 녹음'으로 말하거나, 녹취 파일을 복사/붙여넣기, '표준사례 프리셋'을 로드하세요)`}
                className="w-full text-xs font-mono p-3.5 rounded-lg border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 dark:text-stone-100 bg-stone-50/60 dark:bg-[#251F1C] leading-relaxed resize-y"
              />
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
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Output & 1-Click Form Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {analysisResult ? (
            <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden sticky top-24 transition-colors">
              {/* Header banner */}
              <div className="bg-gradient-to-r from-[#2F2520] to-[#251D19] text-white p-4 flex items-center justify-between border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold">AI 사례 사정 브리핑 & 추천 계획</h3>
                </div>
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

              <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                {/* 3-line Executive Summary */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    사회복지사 핵심 요약 브리핑
                  </h4>
                  <ul className="space-y-1.5">
                    {analysisResult.executiveSummary.map((item, idx) => (
                      <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Rationale */}
                {analysisResult.riskRationale && (
                  <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-300 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      위기도 판정 근거 및 위험요인
                    </div>
                    <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                      {analysisResult.riskRationale}
                    </p>
                  </div>
                )}

                {/* Primary Needs */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                    <ListPlus className="w-3.5 h-3.5 text-stone-500" />
                    도출된 주요 어르신 욕구 및 과제 ({analysisResult.primaryNeeds?.length || 0}건)
                  </h4>
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
                </div>

                {/* Recommended Care Services */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    추천 재가노인지원 맞춤형 서비스
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.recommendedServices?.map((svc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#251F1C] text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-800 dark:text-stone-200">{svc.serviceName}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-semibold">
                            {svc.frequency}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400">
                          {svc.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Worker Opinion Preview */}
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    사회복지사 종합소견 초안
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#251F1C] p-2.5 rounded border border-stone-200 dark:border-stone-700 leading-relaxed">
                    {analysisResult.socialWorkerOpinion}
                  </p>
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

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    id="btn-apply-to-form-editor"
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-amber-700 hover:bg-amber-600 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>서식 편집기로 이동하여 인쇄/PDF/저장하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
};

