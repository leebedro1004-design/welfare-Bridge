import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  HeartPulse,
  BrainCircuit,
  Smile,
  Frown,
  Activity,
  Sparkles,
  ShieldAlert,
  Calendar,
  CalendarDays,
  Users,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Clock,
  ArrowRight,
  ListFilter,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Tag,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkle,
  Eye,
  Star,
  StarOff,
  Volume2,
  Repeat,
  Mail,
  Send,
  Share2,
  Phone,
  Printer,
  ShieldCheck,
  FastForward,
  Rewind,
  MessageSquareQuote
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { ClientProfile, CaseDocument, ConsultationInsight } from '../types';

interface ConsultationInsightsCardProps {
  clients: ClientProfile[];
  documents: CaseDocument[];
  customInsights?: ConsultationInsight[];
  insights?: ConsultationInsight[];
  onSelectClient?: (clientId: string) => void;
  onOpenFormForClient?: (client: ClientProfile) => void;
  isOpen?: boolean;
  isMinimized?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onToggleMinimize?: (min: boolean) => void;
  onClose?: () => void;
  isDraggable?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const ConsultationInsightsCard: React.FC<ConsultationInsightsCardProps> = ({
  clients,
  documents,
  customInsights = [],
  insights = [],
  onSelectClient,
  onOpenFormForClient,
  isOpen = true,
  isMinimized: controlledMinimized,
  onToggleOpen,
  onToggleMinimize,
  onClose,
  isDraggable,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [internalMinimized, setInternalMinimized] = useState<boolean>(false);
  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;
  const setIsMinimized = (min: boolean) => {
    if (onToggleMinimize) onToggleMinimize(min);
    else setInternalMinimized(min);
  };

  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<'all' | 'emotional' | 'physical'>('all');
  const [insightsFilter, setInsightsFilter] = useState<'all' | 'high_risk'>('all');
  
  // Modals & Active Tabs
  const [isPsychReportModalOpen, setIsPsychReportModalOpen] = useState<boolean>(false);
  const [isEmailReportModalOpen, setIsEmailReportModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'insights' | 'transcript_analyzer' | 'doc_timeline'>('insights');
  const [timelineViewMode, setTimelineViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2025-05-18');
  
  // Favorites / Starred System
  const [starredDocIds, setStarredDocIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('carebridge_starred_docs');
      return saved ? JSON.parse(saved) : ['doc-sample-1', 'doc-1'];
    } catch {
      return ['doc-sample-1', 'doc-1'];
    }
  });
  const [isFavoritesOnly, setIsFavoritesOnly] = useState<boolean>(false);

  // Transcript Analyzer & Audio Player State
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>('sample-1');
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState<boolean>(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>(['#식사불규칙', '#낙상고위험', '#우울_고립감', '#무릎관절염_통증']);
  const [analysisResultNote, setAnalysisResultNote] = useState<string>('어르신의 최근 발화에서 우울감 호소 빈도가 25% 증가하였으며, 무릎 통증으로 인한 보행 불안이 주된 원인으로 파악되었습니다.');
  const [copiedReportToast, setCopiedReportToast] = useState<string | null>(null);
  const [timelineTopicFilter, setTimelineTopicFilter] = useState<'all' | 'health' | 'psychology' | 'welfare' | 'safety'>('all');

  // Mini Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const audioDuration = 185; // 3 min 05 sec
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoopingSection, setIsLoopingSection] = useState<boolean>(false);
  const loopRange: [number, number] = [15, 38]; // 15s to 38s
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Email Report Modal State
  const [emailRecipients, setEmailRecipients] = useState<{ director: boolean; teamLeader: boolean; dayCare: boolean; guardian: boolean; custom: string }>({
    director: true,
    teamLeader: true,
    dayCare: false,
    guardian: false,
    custom: ''
  });
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Share Modal State
  const [shareTab, setShareTab] = useState<'guardian' | 'director' | 'link'>('guardian');
  const [guardianMessage, setGuardianMessage] = useState<string>('안녕하세요 보호자님, 오늘 김순자 어르신 댁 방문 상담을 마쳤습니다. 식사는 잘 챙겨드셨으며, 무릎 관절염 통증 완화를 위해 보건소 물리치료를 연계해 드렸습니다. 늘 건강하시길 바랍니다.');

  if (!isOpen) return null;

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredDocIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('carebridge_starred_docs', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    setCopiedReportToast(starredDocIds.includes(id) ? '즐겨찾기에서 해제되었습니다.' : '⭐ 중요 상담 건으로 즐겨찾기에 등록되었습니다.');
    setTimeout(() => setCopiedReportToast(null), 2500);
  };

  // Audio Playback Simulation with Web Audio API sound
  useEffect(() => {
    if (isPlayingAudio) {
      audioTimerRef.current = setInterval(() => {
        setAudioCurrentTime((prev) => {
          let next = prev + 1 * playbackSpeed;
          if (isLoopingSection && next >= loopRange[1]) {
            return loopRange[0];
          }
          if (next >= audioDuration) {
            setIsPlayingAudio(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [isPlayingAudio, playbackSpeed, isLoopingSection]);

  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleSeekAudio = (newTime: number) => {
    setAudioCurrentTime(newTime);
  };

  const handleSkipAudio = (seconds: number) => {
    setAudioCurrentTime((prev) => Math.max(0, Math.min(audioDuration, prev + seconds)));
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const isSelectedHighRisk = selectedClient?.riskLevel === '고위험';
  const hasPsychologicalDrop = selectedClient ? (selectedClient.riskLevel === '고위험' || selectedClient.age >= 85) : true;

  // Emotional trajectory data
  const EMOTIONAL_TRAJECTORY_DATA = selectedClient && selectedClient.riskLevel === '고위험' ? [
    { session: '1차 (초기면접)', date: '1월', psychologicalStability: 42, depressionIndex: 75, rapportScore: 40, mealVitality: 35 },
    { session: '2차 (긴급사례)', date: '2월', psychologicalStability: 38, depressionIndex: 82, rapportScore: 50, mealVitality: 30 },
    { session: '3차 (밑반찬연계)', date: '3월', psychologicalStability: 30, depressionIndex: 88, rapportScore: 55, mealVitality: 28 },
    { session: '4차 (심리상담)', date: '4월', psychologicalStability: 45, depressionIndex: 72, rapportScore: 68, mealVitality: 48 },
    { session: '5차 (통증완화)', date: '5월', psychologicalStability: 58, depressionIndex: 60, rapportScore: 78, mealVitality: 62 },
    { session: '6차 (최근상담)', date: '최근', psychologicalStability: 64, depressionIndex: 54, rapportScore: 85, mealVitality: 70 },
  ] : [
    { session: '1차 (초기면접)', date: '1월', psychologicalStability: 35, depressionIndex: 78, rapportScore: 45, mealVitality: 30 },
    { session: '2차 (긴급사례)', date: '2월', psychologicalStability: 48, depressionIndex: 65, rapportScore: 62, mealVitality: 50 },
    { session: '3차 (밑반찬연계)', date: '3월', psychologicalStability: 62, depressionIndex: 52, rapportScore: 75, mealVitality: 68 },
    { session: '4차 (안전손잡이)', date: '4월', psychologicalStability: 75, depressionIndex: 40, rapportScore: 84, mealVitality: 76 },
    { session: '5차 (정기모니터링)', date: '5월', psychologicalStability: 82, depressionIndex: 32, rapportScore: 89, mealVitality: 82 },
    { session: '6차 (최근상담)', date: '최근', psychologicalStability: 88, depressionIndex: 25, rapportScore: 94, mealVitality: 88 },
  ];

  const ISSUE_DISTRIBUTION_DATA = [
    { issue: '식사/영양결식', count: 18, percentage: 85, color: '#10b981' },
    { issue: '낙상/주거안전', count: 15, percentage: 72, color: '#f59e0b' },
    { issue: '만성질환/복약', count: 14, percentage: 68, color: '#0d9488' },
    { issue: '정서고립/우울', count: 12, percentage: 58, color: '#8b5cf6' },
    { issue: '경제/수급불안', count: 9,  percentage: 43, color: '#78716c' },
    { issue: '장기요양진입', count: 7,  percentage: 34, color: '#f43f5e' },
  ];

  const SAMPLE_TRANSCRIPTS = [
    {
      id: 'sample-1',
      title: '방문상담 녹취 (김순자 어르신 - 무릎 통증 및 우울감)',
      date: '2025-05-18',
      audioFile: 'recording_20250518_kim.mp3',
      text: '사회복지사: "어르신, 요 며칠 식사는 잘 챙겨드셨어요? 얼굴이 조금 야위신 것 같아요."\n어르신: "아이고, 비가 오니까 양쪽 무릎이 쑤셔서 밥통 앞까지 가기도 싫어... 그냥 찬물에 밥 말아 몇 숟갈 뜨고 누워만 있었지. 혼자 있으니까 세상 살아서 뭐하나 싶고..."\n사회복지사: "어르신, 그러시면 기운이 더 빠지세요. 보건소 물리치료 예약해드릴게요."',
      tags: ['#무릎관절염_통증', '#식사불규칙', '#정서우울_고립감', '#방문보건연계필요'],
      summary: '우천 시 무릎 통증 악화로 식사 거름 및 고립감·우울감 표출. 방문 물리치료 및 밑반찬 집중 모니터링 필요.',
      primaryEmotion: '우울/무기력 (고위험)',
      emotionColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      emotionScores: [
        { emotion: '우울/고립감', score: 82, color: '#f43f5e' },
        { emotion: '통증/신체불안', score: 75, color: '#f59e0b' },
        { emotion: '무기력/식욕저하', score: 68, color: '#8b5cf6' },
        { emotion: '사회적 신뢰/라포', score: 55, color: '#10b981' },
      ],
      keywords: [
        { word: '무릎 통증', weight: '높음', category: '건강/신체' },
        { word: '식사 결식', weight: '심각', category: '영양/돌봄' },
        { word: '혼자/고립감', weight: '위험', category: '심리/정서' },
        { word: '물리치료 연계', weight: '권고', category: '복지서비스' }
      ]
    },
    {
      id: 'sample-2',
      title: '전화 안부상담 (박정남 어르신 - 어지럼증 및 낙상 우려)',
      date: '2025-05-17',
      audioFile: 'recording_20250517_park.mp3',
      text: '사회복지사: "박 어르신, 혈압약은 아침에 잊지 않고 드셨나요?"\n어르신: "응, 먹긴 먹었는데 아침에 화장실 가다가 핑 돌아서 벽을 짚었어. 하마터면 넘어질 뻔했지 뭐야."\n사회복지사: "큰일 날 뻔하셨네요. 화장실 미끄럼 방지 매트와 안전손잡이 추가 점검해드리겠습니다."',
      tags: ['#어지럼증_기립성저혈압', '#낙상주의_고위험', '#주거환경개선', '#안전손잡이점검'],
      summary: '기립성 어지럼증으로 인한 낙상 직전 상황 발생. 욕실 미끄럼방지 매트 및 긴급 안전손잡이 설치 긴급 의뢰.',
      primaryEmotion: '낙상 공포/불안',
      emotionColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      emotionScores: [
        { emotion: '낙상 공포/불안', score: 78, color: '#f59e0b' },
        { emotion: '신체 어지럼', score: 70, color: '#f43f5e' },
        { emotion: '복약 준수도', score: 85, color: '#10b981' },
        { emotion: '환경 개선 기대', score: 80, color: '#0d9488' },
      ],
      keywords: [
        { word: '기립성 어지럼', weight: '심각', category: '건강/신체' },
        { word: '화장실 낙상위험', weight: '높음', category: '주거안전' },
        { word: '안전손잡이 점검', weight: '긴급', category: '복지서비스' },
        { word: '혈압약 복용', weight: '양호', category: '만성질환' }
      ]
    },
    {
      id: 'sample-3',
      title: '정기 모니터링 (이영수 어르신 - 경로당 출석 및 활력 회복)',
      date: '2025-05-15',
      audioFile: 'recording_20250515_lee.mp3',
      text: '사회복지사: "어르신, 요즘 경로당 실버체조 프로그램 잘 나가고 계신가요?"\n어르신: "그럼! 복지사가 연결해준 덕에 친구들도 사귀고 웃을 일이 많아졌어. 밥맛도 훨씬 좋아졌고!"',
      tags: ['#정서안정_양호', '#사회적관계망회복', '#식사영양양호', '#활력증진'],
      summary: '사회복지 연계 프로그램을 통해 경로당 정기 출석 및 교우관계 형성. 정서안정도 및 영양상태 뚜렷한 호전.',
      primaryEmotion: '정서적 활력 & 안정 (매우 양호)',
      emotionColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      emotionScores: [
        { emotion: '정서적 활력/안정', score: 92, color: '#10b981' },
        { emotion: '사회적 유대감', score: 88, color: '#0d9488' },
        { emotion: '식사/일상 만족', score: 86, color: '#059669' },
        { emotion: '우울/고립감', score: 15, color: '#94a3b8' },
      ],
      keywords: [
        { word: '경로당 실버체조', weight: '우수', category: '복지서비스' },
        { word: '교우관계 형성', weight: '높음', category: '심리/정서' },
        { word: '밥맛/영양 호전', weight: '양호', category: '영양/돌봄' },
        { word: '생활 만족도', weight: '최상', category: '심리/정서' }
      ]
    }
  ];

  const currentTranscript = SAMPLE_TRANSCRIPTS.find((t) => t.id === selectedTranscriptId) || SAMPLE_TRANSCRIPTS[0];

  const handleRunTranscriptAnalysis = () => {
    setIsAnalyzingTranscript(true);
    setTimeout(() => {
      setIsAnalyzingTranscript(false);
      setGeneratedTags(currentTranscript.tags);
      setAnalysisResultNote(currentTranscript.summary);
    }, 800);
  };

  const handleCopyReport = () => {
    const reportText = `[AI 심리 변화 요약 리포트]\n- 대상자: ${selectedClient ? selectedClient.name : '전체 관리 어르신'}\n- 심리 안정도: 88점 (호전)\n- 우울/불안 지수: 25점 (완화)\n- 사회복지사 라포: 94점 (우수)\n- 주요 소견: 정기 안부확인 및 밑반찬 지원 개입 후 우울감 53% 경감. 주거 안전손잡이 보강을 통한 심리적 안도감 제고.\n- 권고사항: 관절염 통증 관리 및 장기요양 등급 판정 모니터링 지속.`;
    navigator.clipboard.writeText(reportText);
    setCopiedReportToast('AI 심리 변화 요약 리포트 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedReportToast(null), 3000);
  };

  const handleCopyTranscriptSummary = () => {
    const summaryText = `[녹취 분석 요약]\n- 녹취 제목: ${currentTranscript.title}\n- 상담일: ${currentTranscript.date}\n- 감정 상태: ${currentTranscript.primaryEmotion}\n- 핵심 요약: ${analysisResultNote}\n- 분류 태그: ${generatedTags.join(', ')}\n- 주요 키워드: ${currentTranscript.keywords.map(k => `${k.word}(${k.category})`).join(', ')}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedReportToast('녹취 분석 요약 및 태그가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedReportToast(null), 3000);
  };

  const handleReflectInReport = () => {
    if (selectedClient && onOpenFormForClient) {
      onOpenFormForClient(selectedClient);
      setCopiedReportToast(`'${selectedClient.name}' 어르신의 상담 서식에 분석 요약 내용이 자동 연계 반영되었습니다.`);
    } else {
      const summaryText = `[상담 서식 자동 반영 내용]\n■ 상담 요약: ${analysisResultNote}\n■ 핵심 태그: ${generatedTags.join(' ')}\n■ 주호소 감정: ${currentTranscript.primaryEmotion}`;
      navigator.clipboard.writeText(summaryText);
      setCopiedReportToast('보고서 반영 텍스트가 서식 작성용으로 클립보드에 준비되었습니다.');
    }
    setTimeout(() => setCopiedReportToast(null), 3500);
  };

  const handleSendEmailReport = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailReportModalOpen(false);
      setCopiedReportToast('선택한 수신자(센터장, 팀장 외)에게 표준 사례관리 보고서가 성공적으로 발송되었습니다.');
      setTimeout(() => setCopiedReportToast(null), 4000);
    }, 1000);
  };

  const handleSendShare = () => {
    setIsShareModalOpen(false);
    if (shareTab === 'guardian') {
      setCopiedReportToast('보호자(자녀) 안심 알림톡 및 녹취 요약 메시지가 발송되었습니다.');
    } else if (shareTab === 'director') {
      setCopiedReportToast('센터장님께 긴급 결재 및 상담 녹취 보고 메일이 발송되었습니다.');
    } else {
      navigator.clipboard.writeText(`https://carebridge.local/secure-audio-vault/${currentTranscript.id}?auth=aes256_exp72h`);
      setCopiedReportToast('72시간 유효 보안 암호화 녹취 열람 링크가 복사되었습니다.');
    }
    setTimeout(() => setCopiedReportToast(null), 3500);
  };

  // Topic inference helper
  const getDocumentTopics = (doc: CaseDocument): { label: string; type: 'health' | 'psychology' | 'welfare' | 'safety'; color: string }[] => {
    const text = ((doc.title || '') + ' ' + (doc.socialWorkerOpinion || '') + ' ' + (doc.rawNotes || '') + ' ' + (doc.documentType || '') + ' ' + (doc.executiveSummary?.join(' ') || '')).toLowerCase();
    const topics: { label: string; type: 'health' | 'psychology' | 'welfare' | 'safety'; color: string }[] = [];

    if (text.includes('건강') || text.includes('통증') || text.includes('혈압') || text.includes('물리치료') || text.includes('약') || text.includes('만성') || text.includes('의료')) {
      topics.push({ label: '건강·의료', type: 'health', color: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' });
    }
    if (text.includes('우울') || text.includes('심리') || text.includes('정서') || text.includes('고립') || text.includes('상담') || text.includes('사정') || text.includes('불안')) {
      topics.push({ label: '심리·정서', type: 'psychology', color: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' });
    }
    if (text.includes('낙상') || text.includes('안전') || text.includes('주거') || text.includes('손잡이') || text.includes('환경')) {
      topics.push({ label: '주거·안전', type: 'safety', color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' });
    }
    if (text.includes('서비스') || text.includes('밑반찬') || text.includes('복지') || text.includes('연계') || text.includes('수급') || text.includes('급여') || topics.length === 0) {
      topics.push({ label: '복지서비스', type: 'welfare', color: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800' });
    }
    return topics;
  };

  // Filtered documents
  const filteredClientDocuments = documents.filter((doc) => {
    if (selectedClientId !== 'all' && !(doc.clientName === selectedClient?.name || doc.clientName?.includes(selectedClient?.name || ''))) {
      return false;
    }
    if (isFavoritesOnly && !starredDocIds.includes(doc.id)) {
      return false;
    }
    if (timelineTopicFilter !== 'all') {
      const topics = getDocumentTopics(doc);
      if (!topics.some(t => t.type === timelineTopicFilter)) return false;
    }
    return true;
  });

  // Calendar dates with consultation events (May 2025)
  const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2025-05-${day.toString().padStart(2, '0')}`;
    const dayDocs = documents.filter(d => (d.createdAt && d.createdAt.startsWith(dateStr)) || (day === 18 || day === 17 || day === 15 || day === 10 || day === 7 || day === 3));
    return {
      day,
      dateStr,
      hasConsultation: [3, 7, 10, 14, 15, 17, 18, 22].includes(day),
      count: [18, 17, 15].includes(day) ? 2 : [3, 7, 10, 14, 22].includes(day) ? 1 : 0,
      types: [18].includes(day) ? ['health', 'psychology'] : [17].includes(day) ? ['safety'] : [15].includes(day) ? ['welfare'] : [3, 7, 10, 14, 22].includes(day) ? ['welfare'] : []
    };
  });

  return (
    <div
      className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-all"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Titlebar & Controls */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 bg-gradient-to-r from-amber-50/70 via-stone-50/50 to-emerald-50/50 dark:from-amber-950/40 dark:via-[#231E1B] dark:to-emerald-950/40">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? '클릭하여 펼치기' : '클릭하여 최소화(접기)'}
        >
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                상담 기록 기반 인사이트 & 감정·기능 변화 추이
              </h3>
              
              {hasPsychologicalDrop && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>주의 필요 (심리지표 급하락 위험군 감지)</span>
                </span>
              )}

              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/50 dark:border-emerald-800/50">
                안정도 88점 (호전 추세)
              </span>
            </div>
            {!isMinimized ? (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                재가노인지원 상담 기록에서 도출된 주요 위기 이슈와 어르신의 심리적 안정감·우울도 변화를 시계열로 분석합니다.
              </p>
            ) : (
              <p className="text-[11px] text-teal-900 dark:text-teal-300 font-semibold mt-0.5">
                [최소화됨] 심리안정감 88점(↑53점), 우울지수 25점(↓53점 완화), 복지사 라포 94점
              </p>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {!isMinimized && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#2C2420] px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
              >
                <option value="all">전체 관리 어르신 종합 분석</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age}세, {c.riskLevel})
                  </option>
                ))}
              </select>

              {/* 📧 표준 보고서 메일 발송 자동화 버튼 */}
              <button
                type="button"
                onClick={() => setIsEmailReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white shadow-xs transition-colors cursor-pointer"
                title="감정 분석 및 요약 결과를 표준 보고서로 변환하여 메일로 발송"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>표준 보고서 메일 발송</span>
              </button>

              {/* 📋 'AI 심리 변화 요약 리포트' Modal Trigger Button */}
              <button
                type="button"
                onClick={() => setIsPsychReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>AI 심리 리포트</span>
              </button>
            </div>
          )}

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMinimized ? '창 펼치기' : '창 접기'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="인사이트 창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      {!isMinimized && (
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-[#1A1614] px-5 pt-2 gap-2 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveAnalysisTab('insights')}
            className={`pb-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalysisTab === 'insights'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>심리·기능 지표 & 추이 차트</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisTab('transcript_analyzer')}
            className={`pb-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalysisTab === 'transcript_analyzer'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-600" />
            <span>상담 녹취 & 미니 오디오 플레이어</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisTab('doc_timeline')}
            className={`pb-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalysisTab === 'doc_timeline'
                ? 'border-amber-600 text-amber-900 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>상담 이력 타임라인 & 미니 캘린더 ({filteredClientDocuments.length})</span>
          </button>
        </div>
      )}

      {/* Body Content */}
      {!isMinimized && (
        <div className="p-5 sm:p-6 space-y-6">
          {activeAnalysisTab === 'insights' && (
            <>
              {/* ⚠️ Warning Banner if High Risk or Sudden Drop */}
              {hasPsychologicalDrop && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold">심리 지표 주의 필요 경보: </span>
                      <span>3회차 상담 전후 우울지표가 임계치(60점)를 초과하였거나 안정도가 급격히 하락한 이력이 있습니다. 긴급 정서지원 서비스 연계를 권장합니다.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEmailReportModalOpen(true)}
                      className="px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>보고서 메일</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPsychReportModalOpen(true)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer shadow-2xs"
                    >
                      리포트 확인
                    </button>
                  </div>
                </div>
              )}

              {/* 4 Summary Stat Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>심리적 안정감</span>
                    <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                    <span>88점</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">↑ 53점 상승</span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">초기 35점 대비 정서적 안정화</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>우울·고립 불안도</span>
                    <Frown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                    <span>25점</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">↓ 53점 완화</span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">노인우울척도(SGDS-K) 정상치</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>복지사 신뢰도(라포)</span>
                    <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-xl font-extrabold text-teal-700 dark:text-teal-400 flex items-baseline gap-1.5">
                    <span>94점</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">최상위 수준</span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">상담 시 개방적 감정 표현</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/90 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>식사 활력·신체 안정</span>
                    <HeartPulse className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                    <span>88점</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">↑ 58점 개선</span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">밑반찬 지원 및 안전손잡이 완료</p>
                </div>
              </div>

              {/* Trajectory Area Chart + Issue Distribution Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. Psychological Trajectory Area Chart */}
                <div className="lg:col-span-7 bg-stone-50/60 dark:bg-[#251E1A] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>회차별 심리적 안정감 vs 우울도 변화 곡선</span>
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {selectedClient ? `${selectedClient.name} 어르신 6개월 상담 시계열 추적` : '전체 어르신 평균 추이'}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      안정화 성공 코호트
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={EMOTIONAL_TRAJECTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorDepression" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1c1917',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '11px',
                            border: 'none',
                          }}
                        />
                        <Area type="monotone" dataKey="psychologicalStability" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStability)" name="심리적 안정감 (점)" />
                        <Area type="monotone" dataKey="depressionIndex" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorDepression)" name="우울/불안 지표 (점)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Major Issues Bar Chart */}
                <div className="lg:col-span-5 bg-stone-50/60 dark:bg-[#251E1A] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <PieIcon className="w-4 h-4 text-amber-600" />
                        <span>주요 사례관리 호소 욕구 빈도 (%)</span>
                      </h4>
                      <span className="text-[10px] text-stone-400">최근 30일간 상담 내용 빈도 분석</span>
                    </div>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ISSUE_DISTRIBUTION_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} unit="%" stroke="#9ca3af" />
                        <YAxis dataKey="issue" type="category" tick={{ fontSize: 10 }} stroke="#9ca3af" width={75} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1c1917',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '11px',
                            border: 'none',
                          }}
                          formatter={(val: any) => [`${val}% (${Math.round((val * 20) / 100)}명)`, '언급 빈도']}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                          {ISSUE_DISTRIBUTION_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 🎙️ Tab 2: Consultation Transcript Analysis & Mini Audio Player + Section Looping */}
          {activeAnalysisTab === 'transcript_analyzer' && (
            <div className="space-y-4">
              {/* 🎧 Mini Audio Player Section */}
              <div className="bg-gradient-to-r from-amber-950/80 via-[#2A221E] to-[#201A17] text-white p-5 rounded-2xl border border-amber-600/40 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-800/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-200">실시간 상담 음성 플레이어</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                          {currentTranscript.audioFile}
                        </span>
                        {starredDocIds.includes(currentTranscript.id) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1 border border-amber-400/40">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            중요 상담
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-0.5">
                        {currentTranscript.title}
                      </h4>
                    </div>
                  </div>

                  {/* Share & Favorite Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleStar(currentTranscript.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        starredDocIds.includes(currentTranscript.id)
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-xs'
                          : 'bg-black/30 border-white/10 text-stone-300 hover:border-amber-400'
                      }`}
                      title={starredDocIds.includes(currentTranscript.id) ? '즐겨찾기 해제' : '중요 상담으로 즐겨찾기'}
                    >
                      <Star className={`w-4 h-4 ${starredDocIds.includes(currentTranscript.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{starredDocIds.includes(currentTranscript.id) ? '즐겨찾기됨' : '즐겨찾기'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="보호자 또는 센터장에게 녹취 및 요약본 즉시 공유/메일 전송"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>보호자·센터장 공유</span>
                    </button>
                  </div>
                </div>

                {/* Player Controls & Visualizer */}
                <div className="space-y-3">
                  {/* Waveform Animation */}
                  <div className="flex items-center justify-between gap-1 h-10 px-2 bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                    {Array.from({ length: 48 }, (_, i) => {
                      const isActive = (i / 48) <= (audioCurrentTime / audioDuration);
                      const inLoop = isLoopingSection && (i / 48) >= (loopRange[0] / audioDuration) && (i / 48) <= (loopRange[1] / audioDuration);
                      const height = isPlayingAudio ? (Math.sin(i * 0.4 + audioCurrentTime * 2) * 12 + 18) : (Math.sin(i * 0.4) * 8 + 14);
                      return (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-150 ${
                            inLoop
                              ? 'bg-amber-400 shadow-xs ring-1 ring-amber-300'
                              : isActive
                              ? 'bg-emerald-400'
                              : 'bg-stone-700'
                          }`}
                          style={{ height: `${Math.max(4, height)}px` }}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber Range */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-300 w-12 text-right">
                      {formatAudioTime(audioCurrentTime)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={audioDuration}
                      value={audioCurrentTime}
                      onChange={(e) => handleSeekAudio(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                    />
                    <span className="text-xs font-mono text-stone-400 w-12">
                      {formatAudioTime(audioDuration)}
                    </span>
                  </div>

                  {/* Playback Buttons, Speed & Loop controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      {/* Skip -5s */}
                      <button
                        type="button"
                        onClick={() => handleSkipAudio(-5)}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="5초 전으로"
                      >
                        <Rewind className="w-3.5 h-3.5" />
                        <span className="text-[10px]">-5초</span>
                      </button>

                      {/* Play/Pause Main Button */}
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 fill-stone-950" />
                            <span>일시 정지</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-stone-950" />
                            <span>음성 재생</span>
                          </>
                        )}
                      </button>

                      {/* Skip +5s */}
                      <button
                        type="button"
                        onClick={() => handleSkipAudio(5)}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="5초 후로"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span className="text-[10px]">+5초</span>
                      </button>
                    </div>

                    {/* 🔁 구간 반복 (A-B Loop) Toggle Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoopingSection(!isLoopingSection);
                          if (!isLoopingSection) {
                            setAudioCurrentTime(loopRange[0]);
                            setIsPlayingAudio(true);
                            setCopiedReportToast('핵심 발화 구간(15초~38초) 반복 청취 모드가 활성화되었습니다.');
                          } else {
                            setCopiedReportToast('구간 반복 모드가 해제되었습니다.');
                          }
                          setTimeout(() => setCopiedReportToast(null), 2500);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isLoopingSection
                            ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400/40 animate-pulse'
                            : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
                        }`}
                        title="어르신의 주요 호소 구간(15초~38초)을 반복 청취하여 정확한 사정을 지원합니다"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>구간 반복 청취 (15s~38s) {isLoopingSection ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* Speed Presets */}
                      <div className="flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700 text-[11px] font-bold">
                        {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                              playbackSpeed === speed
                                ? 'bg-amber-600 text-white'
                                : 'text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript Text & AI Auto-Classification */}
              <div className="bg-stone-50/70 dark:bg-[#251E1A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-600" />
                      <span>상담 녹취 데이터 선택 및 AI 자동 태그 분류 분석기</span>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      현장 녹취 발화록을 선택하여 AI 감정 분석, 위험 징후 추출, 핵심 키워드 태그를 원클릭으로 생성합니다.
                    </p>
                  </div>

                  {/* Transcript Selector */}
                  <select
                    value={selectedTranscriptId}
                    onChange={(e) => {
                      setSelectedTranscriptId(e.target.value);
                      setAudioCurrentTime(0);
                    }}
                    className="text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#2C2420] px-3 py-1.5 text-stone-800 dark:text-stone-200 shadow-xs"
                  >
                    {SAMPLE_TRANSCRIPTS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Transcript Text Preview */}
                  <div className="lg:col-span-7 space-y-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>선택된 상담 녹취록 전문</span>
                      <span className="text-[10px] text-stone-400">상담일: {currentTranscript.date}</span>
                    </label>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 text-xs leading-relaxed text-stone-700 dark:text-stone-300 font-mono whitespace-pre-line h-48 overflow-y-auto">
                      {currentTranscript.text}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunTranscriptAnalysis}
                      disabled={isAnalyzingTranscript}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {isAnalyzingTranscript ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>AI 음성/텍스트 맥락 심층 분석 중...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>선택 녹취 AI 자동 태그 생성 & 요약 실행</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: AI Auto-Classification Tags, Summary & Actions */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-1.5 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          AI 자동 분류 태그 (Auto-Generated Tags)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {generatedTags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1"
                            >
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            핵심 임상 요약 & 권고 개입
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            AI 추출 완료
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-[#251E1A] p-2.5 rounded-lg border border-stone-200/60 dark:border-stone-800">
                          {analysisResultNote}
                        </p>

                        {/* Action Buttons: '보고서 반영' & '요약본 복사' */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleReflectInReport}
                            className="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            title="이 요약본을 상담 기록 서식에 즉시 반영하거나 작성용으로 연계합니다"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>보고서 반영</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleCopyTranscriptSummary}
                            className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#28211D] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            title="분석 결과와 분류 태그를 클립보드로 복사합니다"
                          >
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>요약본 복사</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 Emotion Analysis Dashboard */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>녹취 감정 분석 대시보드 (Emotion & Keyword Insights)</span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${currentTranscript.emotionColor}`}>
                          주호소: {currentTranscript.primaryEmotion}
                        </span>
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        음성 톤 및 발화 어휘의 심리·정서적 강도와 핵심 키워드를 다차원으로 정량화하여 표시합니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEmailReportModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>분석 결과 메일 발송</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Emotion Score Bars */}
                  <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/80 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        세부 정서 지수 정량화 (0~100점)
                      </span>
                      <span className="text-[10px] text-stone-400">심리 부하도</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {currentTranscript.emotionScores.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">{item.emotion}</span>
                            <span className="font-bold text-stone-900 dark:text-stone-100">{item.score}점</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${item.score}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Key Identified Keywords Categorization */}
                  <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/80 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        도메인별 핵심 발화 키워드 추출
                      </span>
                      <span className="text-[10px] text-stone-400">중요도 판정</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {currentTranscript.keywords.map((kw, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                              {kw.category}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              kw.weight === '심각' || kw.weight === '위험'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : kw.weight === '긴급' || kw.weight === '높음'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {kw.weight}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            {kw.word}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 📈 Recharts Transcript Emotion & Psychological Metric Trend Line Chart */}
                <div className="mt-4 p-4 rounded-xl bg-stone-50/80 dark:bg-[#251E1A] border border-stone-200/80 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span>녹취 실시간 구간별 어르신 심리 지표 및 감성 변화 트렌드 (Recharts Line Chart)</span>
                      </h5>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        상담 도입부부터 종료 시점까지 발화 음조 및 심리 지표의 실시간 변화 추이 분석
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full inline-block"></span> 심리적 안정도
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <span className="w-2.5 h-0.5 bg-rose-500 border border-dashed rounded-full inline-block"></span> 우울/불안 지수
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <span className="w-2.5 h-0.5 bg-amber-500 rounded-full inline-block"></span> 라포 형성도
                      </span>
                    </div>
                  </div>

                  <div className="h-48 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { stage: '0~3분 (도입)', stability: 42, depression: 78, rapport: 38 },
                          { stage: '3~7분 (주호소)', stability: 36, depression: 85, rapport: 45 },
                          { stage: '7~12분 (경청)', stability: 58, depression: 64, rapport: 68 },
                          { stage: '12~18분 (공감)', stability: 72, depression: 48, rapport: 82 },
                          { stage: '18~23분 (개입)', stability: 84, depression: 35, rapport: 92 },
                          { stage: '23~30분 (마무리)', stability: 90, depression: 28, rapport: 96 },
                        ]}
                        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                        <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" unit="점" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1c1917',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '11px',
                            border: '1px solid #374151',
                          }}
                          formatter={(value: any, name: any) => [
                            `${value}점`,
                            name === 'stability'
                              ? '심리적 안정도'
                              : name === 'depression'
                              ? '우울/불안 지수'
                              : '라포 형성도',
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="stability"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#10b981' }}
                          activeDot={{ r: 6 }}
                          name="stability"
                        />
                        <Line
                          type="monotone"
                          dataKey="depression"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#f43f5e' }}
                          name="depression"
                        />
                        <Line
                          type="monotone"
                          dataKey="rapport"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#f59e0b' }}
                          name="rapport"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📅 Tab 3: Recent Consultation Documents Mini Timeline & Mini Calendar Section */}
          {activeAnalysisTab === 'doc_timeline' && (
            <div className="space-y-4">
              <div className="bg-stone-50/70 dark:bg-[#251E1A] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>
                        {selectedClient ? `${selectedClient.name} 어르신` : '전체 어르신'} 상담 이력 및 주기 분석
                      </span>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      상담 서식 목록을 타임라인 리스트나 월간 캘린더 뷰로 전환하여 상담 빈도와 방문 주기를 한눈에 파악합니다.
                    </p>
                  </div>

                  {/* View Mode Toggle: Timeline List vs. Mini Calendar */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center bg-stone-200 dark:bg-stone-800 p-1 rounded-xl border border-stone-300 dark:border-stone-700 text-xs">
                      <button
                        type="button"
                        onClick={() => setTimelineViewMode('list')}
                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          timelineViewMode === 'list'
                            ? 'bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 shadow-2xs'
                            : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>타임라인 뷰</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimelineViewMode('calendar')}
                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          timelineViewMode === 'calendar'
                            ? 'bg-white dark:bg-[#1E1916] text-stone-900 dark:text-stone-100 shadow-2xs'
                            : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                        <span>미니 캘린더 뷰</span>
                      </button>
                    </div>

                    <span className="text-xs px-2.5 py-1 bg-stone-200 dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300 font-bold">
                      {filteredClientDocuments.length}건
                    </span>
                  </div>
                </div>

                {/* 🏷️ Topic Tag Filter Bar with ⭐ Favorites Toggle */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200/90 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <ListFilter className="w-3.5 h-3.5 text-amber-600" />
                      <span>토픽 필터:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setTimelineTopicFilter('all')}
                      className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        timelineTopicFilter === 'all' && !isFavoritesOnly
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      전체 ({documents.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimelineTopicFilter('health');
                        setIsFavoritesOnly(false);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        timelineTopicFilter === 'health' && !isFavoritesOnly
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900 hover:bg-rose-100'
                      }`}
                    >
                      <HeartPulse className="w-3 h-3" />
                      <span>건강·의료</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimelineTopicFilter('psychology');
                        setIsFavoritesOnly(false);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        timelineTopicFilter === 'psychology' && !isFavoritesOnly
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900 hover:bg-purple-100'
                      }`}
                    >
                      <BrainCircuit className="w-3 h-3" />
                      <span>심리·정서</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimelineTopicFilter('welfare');
                        setIsFavoritesOnly(false);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        timelineTopicFilter === 'welfare' && !isFavoritesOnly
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-900 hover:bg-teal-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>복지서비스</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimelineTopicFilter('safety');
                        setIsFavoritesOnly(false);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        timelineTopicFilter === 'safety' && !isFavoritesOnly
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>주거·낙상안전</span>
                    </button>
                  </div>

                  {/* ⭐ 즐겨찾기 (Starred) 모아보기 Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFavoritesOnly(!isFavoritesOnly)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isFavoritesOnly
                        ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavoritesOnly ? 'fill-stone-950 text-stone-950' : 'fill-amber-500 text-amber-500'}`} />
                    <span>중요 즐겨찾기 모아보기 ({starredDocIds.length})</span>
                  </button>
                </div>

                {/* 📅 CALENDAR VIEW */}
                {timelineViewMode === 'calendar' ? (
                  <div className="space-y-4">
                    {/* Monthly Frequency KPI Header */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 block">5월 총 상담 횟수</span>
                          <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">8회 진행 (주 2.0회)</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 block">평균 상담 방문 주기</span>
                          <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">3.8일 간격 (양호)</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 block">장기 미상담 주의군</span>
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">0명 (14일 이상 미상담 없음)</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Calendar Grid */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                            2025년 5월 상담 일정 및 수행 이력 캘린더
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400">날짜를 클릭하면 해당일의 상담 문서를 조회합니다</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stone-400 pb-1">
                        <span className="text-rose-500">일</span>
                        <span>월</span>
                        <span>화</span>
                        <span>수</span>
                        <span>목</span>
                        <span>금</span>
                        <span className="text-blue-500">토</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5">
                        {/* Empty padding days for Thursday start of May 2025 */}
                        <div className="h-14 rounded-xl bg-stone-50/40 dark:bg-stone-900/30 opacity-40"></div>
                        <div className="h-14 rounded-xl bg-stone-50/40 dark:bg-stone-900/30 opacity-40"></div>
                        <div className="h-14 rounded-xl bg-stone-50/40 dark:bg-stone-900/30 opacity-40"></div>
                        <div className="h-14 rounded-xl bg-stone-50/40 dark:bg-stone-900/30 opacity-40"></div>

                        {CALENDAR_DAYS.map((cd) => {
                          const isSelected = selectedCalendarDate === cd.dateStr;
                          return (
                            <div
                              key={cd.day}
                              onClick={() => setSelectedCalendarDate(cd.dateStr)}
                              className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-amber-100/80 dark:bg-amber-950/80 border-amber-500 ring-2 ring-amber-400 shadow-xs'
                                  : cd.hasConsultation
                                  ? 'bg-stone-50 dark:bg-[#251E1A] border-stone-300 dark:border-stone-700 hover:border-amber-400'
                                  : 'bg-white dark:bg-[#1E1916] border-stone-100 dark:border-stone-800 text-stone-400 hover:bg-stone-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold ${cd.hasConsultation ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                                  {cd.day}
                                </span>
                                {cd.hasConsultation && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                )}
                              </div>

                              {cd.hasConsultation && (
                                <div className="flex items-center gap-1 overflow-hidden">
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold truncate">
                                    상담 {cd.count}건
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Selected Day Consultation Preview */}
                      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            선택일 ({selectedCalendarDate}):
                          </span>
                          <span className="text-stone-600 dark:text-stone-300">
                            방문상담 2건 (김순자 어르신 정기 안부상담 및 무릎 물리치료 연계 완료)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTimelineViewMode('list')}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
                        >
                          목록으로 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ⏱️ TIMELINE LIST VIEW */
                  filteredClientDocuments.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs border border-dashed border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-[#1E1916]">
                      {isFavoritesOnly
                        ? '즐겨찾기로 등록된 상담 건이 없습니다. 중요한 상담 카드의 별(⭐) 아이콘을 클릭하여 등록해보세요.'
                        : '해당 토픽 태그 조건에 일치하는 상담 서식이 없습니다. 태그 필터를 \'전체\'로 변경해보세요.'}
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700">
                      {filteredClientDocuments.map((doc, idx) => {
                        const docTopics = getDocumentTopics(doc);
                        const isStarred = starredDocIds.includes(doc.id);
                        return (
                          <div key={doc.id || idx} className="relative group">
                            {/* Timeline Bullet */}
                            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white dark:border-[#251E1A] shadow-xs"></div>

                            <div className={`p-4 rounded-xl bg-white dark:bg-[#1E1916] border transition-all space-y-2.5 ${
                              isStarred
                                ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-300/40 shadow-xs'
                                : 'border-stone-200 dark:border-stone-800 shadow-2xs hover:border-amber-400'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                                    {doc.title || doc.documentType}
                                  </span>
                                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                    {doc.clientName} 어르신
                                  </span>
                                  
                                  {/* Topic Tags for Document */}
                                  <div className="flex items-center gap-1">
                                    {docTopics.map((topic, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${topic.color}`}
                                      >
                                        #{topic.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Star Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleStar(doc.id, e)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isStarred
                                        ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-600'
                                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-500'
                                    }`}
                                    title={isStarred ? '즐겨찾기 해제' : '중요 상담으로 즐겨찾기'}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                                  </button>

                                  <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                                    <Calendar className="w-3 h-3" />
                                    {doc.createdAt?.slice(0, 10) || '2025-05-18'}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                                {doc.executiveSummary?.[0] || doc.socialWorkerOpinion || doc.rawNotes || '어르신 가정방문 상담 실시 및 신체 건강, 일상생활 지원 계획 수립 완료.'}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                                <span className="text-stone-400">
                                  작성자: {doc.author || '이현정 사회복지사'} • 상태: <strong className="text-emerald-600">{doc.status || '작성완료'}</strong>
                                </span>
                                {selectedClient && onOpenFormForClient && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenFormForClient(selectedClient)}
                                    className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> 서식 열람 & 편집
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Bottom AI Synthesis & Actionable Advice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-stone-50 to-emerald-50/60 dark:from-amber-950/40 dark:via-[#251E1A] dark:to-emerald-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>AI 상담 인사이트 종합 분석 & 사회복지사 실무 권고사항</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailReportModalOpen(true)}
                className="text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>표준 보고서로 메일 전송</span>
              </button>
            </div>
            <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-1.5">
              <p>
                • <strong>정서적 라포 및 고립감 완화:</strong> 초기 방문 시 78점에 달했던 우울·불안 지표가 정기 밑반찬 배달과 말벗 상담 개입 후 25점으로 대폭 경감되었습니다. 특히 사회복지사에 대한 신뢰도가 94점으로 최상위 상태입니다.
              </p>
              <p>
                • <strong>신체 안전 및 영양 상태:</strong> 결식률 0% 달성 및 화장실 안전손잡이 시공으로 2차 낙상 사고가 성공적으로 예방되었습니다.
              </p>
              <p>
                • <strong>차기 중점 개입 제언:</strong> 관절염 통증으로 인한 야간 수면장애 호소가 지속되고 있으므로, 보건소 방문간호 연계 및 통증완화 파스/보호대 지원, 그리고 장기요양 등급 신청 준비를 병행하는 것을 권고합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📧 모달 1: 표준 보고서 템플릿 메일 발송 자동화 UI (Standard Report Email Dispatch Automation Modal) */}
      {isEmailReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>표준 상담 보고서 메일 발송 자동화</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                      원클릭 발송
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    감정 분석 및 요약 결과를 공인 표준 양식으로 자동 변환하여 센터장, 팀장 또는 보호자에게 발송합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEmailReportModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-stone-700 dark:text-stone-300 max-h-[75vh] overflow-y-auto">
              {/* Recipient Selection */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 space-y-3">
                <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  보고서 수신자 선택 (다중 선택 가능)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRecipients.director}
                      onChange={(e) => setEmailRecipients({ ...emailRecipients, director: e.target.checked })}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold block text-stone-900 dark:text-stone-100">센터장 (결재/보고)</span>
                      <span className="text-[10px] text-stone-400">director@dobong-care.or.kr</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRecipients.teamLeader}
                      onChange={(e) => setEmailRecipients({ ...emailRecipients, teamLeader: e.target.checked })}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold block text-stone-900 dark:text-stone-100">사례관리팀장</span>
                      <span className="text-[10px] text-stone-400">teamlead@dobong-care.or.kr</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRecipients.guardian}
                      onChange={(e) => setEmailRecipients({ ...emailRecipients, guardian: e.target.checked })}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold block text-stone-900 dark:text-stone-100">어르신 보호자 (자녀)</span>
                      <span className="text-[10px] text-stone-400">guardian@family.net (김민수)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRecipients.dayCare}
                      onChange={(e) => setEmailRecipients({ ...emailRecipients, dayCare: e.target.checked })}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold block text-stone-900 dark:text-stone-100">주간보호·협력병원</span>
                      <span className="text-[10px] text-stone-400">clinic@dobong-health.go.kr</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Standard Report Template Preview */}
              <div className="space-y-2">
                <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  표준 보고서 메일 본문 미리보기 (Standard Format)
                </span>

                <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 space-y-3 font-mono text-[11px] leading-relaxed">
                  <div className="border-b border-stone-300 dark:border-stone-700 pb-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      제목: [사례관리 정기 보고] {selectedClient ? selectedClient.name : '김순자'} 어르신 상담 요약 및 감정 분석 리포트
                    </span>
                    <span className="text-stone-500">발신: 도봉재가노인지원서비스센터 이현정 선임 사회복지사</span>
                  </div>

                  <div className="space-y-2 text-stone-800 dark:text-stone-200">
                    <p className="font-bold text-amber-800 dark:text-amber-300">
                      ■ 대상자 정보: {selectedClient ? `${selectedClient.name} 어르신 (${selectedClient.age}세, ${selectedClient.riskLevel})` : '김순자 어르신 (83세, 고위험군)'}
                    </p>
                    
                    <p>
                      ■ 심리·감정 분석 핵심 결과:<br/>
                      - 심리적 안정감: 88점 (호전)<br/>
                      - 노인우울지수(SGDS-K): 25점 (완화)<br/>
                      - 복지사 신뢰도: 94점 (우수)<br/>
                      - 주호소 감정: {currentTranscript.primaryEmotion}
                    </p>

                    <p>
                      ■ 상담 발화 핵심 요약:<br/>
                      {analysisResultNote}
                    </p>

                    <p>
                      ■ 분류 태그: {generatedTags.join(', ')}
                    </p>

                    <p>
                      ■ 사회복지사 조치 소견:<br/>
                      - 보건소 방문간호 물리치료 연계 및 통증 완화 파스 지원<br/>
                      - 화장실 안전손잡이 추가 점검을 통한 낙상 사고 예방<br/>
                      - 자원봉사자 주 1회 말벗 서비스 연계 확정
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <button
                type="button"
                onClick={() => setIsEmailReportModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                취소
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#28211D] text-stone-800 dark:text-stone-200 hover:bg-stone-100 cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>서식 복사</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmailReport}
                  disabled={isSendingEmail}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-700 hover:bg-teal-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>메일 전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>메일 즉시 발송</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📤 모달 2: 녹취 파일 및 요약본 보호자/센터장 즉시 공유 & 메일 발송 모달 */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in my-8">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>상담 녹취 & 요약본 즉시 공유</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    보호자 안심 알림 발송 및 센터장 결재 보고를 간편하게 수행합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Share Method Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShareTab('guardian')}
                  className={`py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                    shareTab === 'guardian'
                      ? 'bg-white dark:bg-[#1E1916] text-amber-700 dark:text-amber-400 shadow-2xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  보호자 안심 알림
                </button>
                <button
                  type="button"
                  onClick={() => setShareTab('director')}
                  className={`py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                    shareTab === 'director'
                      ? 'bg-white dark:bg-[#1E1916] text-amber-700 dark:text-amber-400 shadow-2xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  센터장 결재 보고
                </button>
                <button
                  type="button"
                  onClick={() => setShareTab('link')}
                  className={`py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                    shareTab === 'link'
                      ? 'bg-white dark:bg-[#1E1916] text-amber-700 dark:text-amber-400 shadow-2xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  보안 링크 복사
                </button>
              </div>

              {shareTab === 'guardian' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950 dark:text-amber-200 block">수신 보호자 정보</span>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300">김민수 (자녀) • 010-8899-1234</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">연락처 연동됨</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700 dark:text-stone-300 block">발송 메시지 내용 미리보기 (SMS/알림톡)</label>
                    <textarea
                      rows={4}
                      value={guardianMessage}
                      onChange={(e) => setGuardianMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#251E1A] text-stone-800 dark:text-stone-200 text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {shareTab === 'director' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">센터장 결재 상신 안건</span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">
                      [긴급 보고] {currentTranscript.title} - {currentTranscript.primaryEmotion} 발생 및 물리치료 연계 승인의 건
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    클릭 시 센터장님 전자 결재 메일함으로 녹취 파일 원본과 AI 분석 소견서가 함께 발송됩니다.
                  </p>
                </div>
              )}

              {shareTab === 'link' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 space-y-1.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">72시간 유효 암호화 보안 링크</span>
                    <div className="p-2 rounded bg-white dark:bg-[#1E1916] border font-mono text-[10px] text-stone-500 break-all select-all">
                      https://carebridge.local/secure-audio-vault/{currentTranscript.id}?auth=aes256_exp72h
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    개인정보보호법에 따라 권한이 있는 담당자만 열람할 수 있도록 암호화 토큰이 포함되어 있습니다.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={handleSendShare}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{shareTab === 'link' ? '보안 링크 복사' : '즉시 전송하기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 AI 심리 변화 요약 리포트 모달 */}
      {isPsychReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>AI 심리 변화 요약 리포트</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      3개월 추이 종합
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {selectedClient ? `${selectedClient.name} 어르신 (${selectedClient.age}세, ${selectedClient.riskLevel})` : '재가노인 전체 관리 코호트'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPsychReportModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-stone-700 dark:text-stone-300 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">심리적 안정감</span>
                  <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">88점 (+53점)</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">뚜렷한 호전세</span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium block">노인우울척도(SGDS-K)</span>
                  <span className="text-lg font-black text-rose-900 dark:text-rose-200">25점 (-53점)</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">정상 안정 범위 진입</span>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium block">복지사 신뢰도(라포)</span>
                  <span className="text-lg font-black text-teal-900 dark:text-teal-200">94점</span>
                  <span className="text-[10px] text-teal-600 block mt-0.5">적극적 상담 참여</span>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>임상적 심리 변화 시계열 분석</span>
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <p>
                    <strong>1. 초기 고립 및 우울 위험기 (1~2월):</strong> 홀로 거주하며 식사 결식과 만성 관절 통증으로 인해 자포자기성 발언과 높은 고립 불안(SGDS 78점)을 보였음.
                  </p>
                  <p>
                    <strong>2. 위기 개입 및 라포 형성기 (3~4월):</strong> 주 3회 밑반찬 배달과 주거 안전손잡이 설치 등 가시적 실생활 지원이 이루어지며 마음의 문을 열고 복지사에 대한 신뢰 점수가 84점까지 급상승함.
                  </p>
                  <p>
                    <strong>3. 정서적 안정 및 자립 의지 회복기 (5월~현재):</strong> 안부전화에 밝은 목소리로 응답하며, 경로당 체조 프로그램 참여 등 사회적 관계망을 회복하는 긍정적 변화를 보임.
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>사회복지사 실무 권고사항 및 차기 개입 계획</span>
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-stone-700 dark:text-stone-300">
                  <li>장마철/혹서기 관절염 통증 악화에 따른 일시적 우울 재발 가능성 대비 보건소 방문간호 사전 연계</li>
                  <li>주 1회 이상 자원봉사자 말벗 안부 확인 지속 및 경로당 동년배 모임 독려</li>
                  <li>장기요양 등급 신청 서류 준비를 통한 안정적 요양보호 서비스 기반 구축</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <button
                type="button"
                onClick={() => setIsPsychReportModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={handleCopyReport}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>리포트 클립보드 복사</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {copiedReportToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedReportToast}</span>
        </div>
      )}
    </div>
  );
};
