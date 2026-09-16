import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  UserPlus,
  Mic,
  FileSpreadsheet,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Zap,
  HelpCircle,
  FileText,
  Clock,
  Volume2,
  Users,
  Copy,
  AlertTriangle,
  RotateCcw,
  EyeOff
} from 'lucide-react';
import { ClientProfile } from '../types';

export interface PracticeScenario {
  id: string;
  title: string;
  badge: string;
  riskCategory: '결식/만성질환' | '낙상/주거안전' | '인지저하/치매의심';
  elderName: string;
  elderAge: number;
  gender: '여' | '남';
  address: string;
  conditionDescription: string;
  welfareType: string;
  consultationTranscript: string;
  highlightPoints: string[];
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: 'scenario-meal-arthritis',
    title: '거동불편 독거 어르신 식사 결식 및 밑반찬 지원 상담',
    badge: '영양결식·관절염',
    riskCategory: '결식/만성질환',
    elderName: '김순자 (실습용)',
    elderAge: 82,
    gender: '여',
    address: '서울특별시 도봉구 창동 (실습용 가상 주소)',
    conditionDescription: '퇴행성 무릎관절염 3기, 고혈압, 보행기 의존, 독거',
    welfareType: '국민기초생활수급자 (생계·의료)',
    highlightPoints: [
      '무릎 통증으로 인한 조리 곤란 및 끼니 결식 우려',
      '물에 찬밥 말아먹는 불규칙 식습관 파악',
      '주 2회 영양 밑반찬 배달 연계 및 치아 상태(부드러운 음식) 반영',
    ],
    consultationTranscript: `사회복지사: 김순자 어르신, 안녕하세요! 도봉재가노인지원센터 이현정 사회복지사입니다. 무릎은 요새 좀 어떠셔요?
어르신: 아이고 선생 왔는가... 요즘 비 오고 날씨 궂으니까 무릎이 너무 쑤셔서 방에서 부엌 나가는 것도 천근만근이야. 밥을 지어 먹을 수가 없어.
사회복지사: 저런, 식사는 어떻게 챙겨 드셨어요? 어제 저녁이랑 오늘 아침은 드셨나요?
어르신: 어제는 그냥 물에 찬밥 조금 말아 먹고, 오늘은 아침에 입맛도 없고 무릎 아파서 건너뛰었어. 가스레인지 불 켜기도 겁나고...
사회복지사: 어르신, 끼니 거르시면 드시는 혈압약도 위에 부담되고 큰일 나요. 저희 센터에서 주 2회 화요일, 금요일에 영양 밑반찬 배달 연계해 드릴게요. 국이랑 단백질 반찬 3가지 들어있는 건데요, 혹시 못 드시는 음식 있으세요?
어르신: 이가 안 좋아서 질긴 고기나 딱딱한 건 못 씹어. 소화 잘되는 부드러운 걸로 주면 너무 고맙겠어.
사회복지사: 네, 부드러운 조림과 나물 위주로 맞춤 영양 식단 요청해 두겠습니다. 다음 주 화요일부터 첫 배달 방문 드릴게요!`,
  },
  {
    id: 'scenario-fall-safety',
    title: '화장실 미끄러짐 낙상 후유증 및 주거안전바 설치 상담',
    badge: '낙상위험·주거개선',
    riskCategory: '낙상/주거안전',
    elderName: '박영수 (실습용)',
    elderAge: 78,
    gender: '남',
    address: '서울특별시 도봉구 쌍문동 (실습용 가상 주소)',
    conditionDescription: '경미한 뇌경색 후유증, 좌측 편마비, 화장실 낙상 타박상',
    welfareType: '차상위계층 (본인부담경감)',
    highlightPoints: [
      '야간 배뇨 중 화장실 바닥 물기로 인한 낙상 타박상 호소',
      '화장실 내 안전 손잡이 및 미끄럼방지 시설 전무 확인',
      '주거환경 개선(L자형 안전바, 미끄럼방지 매트) 긴급 연계',
    ],
    consultationTranscript: `사회복지사: 박영수 어르신, 지난주에 화장실에서 살짝 미끄러지셨다고 연락 주셔서 바로 찾아왔습니다. 어디 다치신 곳은 없으신가요?
어르신: 아이고 어깨랑 엉덩이가 멍이 퍼렇게 들었어. 밤에 소변보러 가다가 물기 있는 타일에 발이 쑥 미끄러졌거든. 다행히 뼈는 안 부러졌는데 그 뒤로 화장실 가기가 너무 겁이나.
사회복지사: 정말 놀라셨겠어요. 어르신 화장실 벽에 손잡이가 없으시네요. 바닥도 타일이 미끄럽고요.
어르신: 변기에서 일어날 때도 벽을 짚어야 겨우 일어나는데 손잡이가 있으면 참 좋겠어.
사회복지사: 네, 저희 도봉구 주거안전개선 사업으로 변기 옆이랑 욕조 쪽에 L자형 안전 손잡이 바로 설치 신청해 드릴 거고요, 미끄럼 방지 매트도 이번 주 안에 깔아드릴게요.
어르신: 아이고 선생, 손잡이만 달아줘도 한시름 놓겠어. 고마워요.`,
  },
  {
    id: 'scenario-cognitive-dementia',
    title: '날짜 혼동 및 약 복용 누락 의심(인지기능 저하) 상담',
    badge: '인지저하·치매안심',
    riskCategory: '인지저하/치매의심',
    elderName: '최정옥 (실습용)',
    elderAge: 85,
    gender: '여',
    address: '서울특별시 도봉구 방학동 (실습용 가상 주소)',
    conditionDescription: '당뇨병, 최근 단기기억 저하, 냄비 태움 빈번, 사별 독거',
    welfareType: '기초연금 수급 독거노인',
    highlightPoints: [
      '날짜 혼동 및 음식 조리 중 가스불 끄기 망각 위험',
      '당뇨약 복용 여부 혼동으로 약 임의 누락',
      '가스 타이머 콕 설치, 복약달력 지원 및 치매안심센터 CIST 검사 연계',
    ],
    consultationTranscript: `사회복지사: 최정옥 어르신, 안녕하세요! 오늘이 무슨 요일인지 아실까요?
어르신: 오늘이... 목요일인가? 날짜가 영 헷갈리네. 내가 며칠 전에 국 냄비를 가스레인지에 올려두고 깜빡해서 다 태워 먹었잖아. 연기가 자욱해서 옆집에서 뛰어왔어.
사회복지사: 어머나, 큰불 날 뻔하셨네요. 식탁 위에 당뇨약이 그대로 쌓여있는데, 오늘 아침 약 드셨어요?
어르신: 글쎄, 아침에 먹었던가 안 먹었던가 기억이 안 나. 두 번 먹으면 안 될 것 같아서 그냥 뒀어.
사회복지사: 어르신, 가스 타이머 콕 자동 차단기랑 요일별 복약 정리함을 바로 달아드릴게요. 그리고 보건소 치매안심센터에서 인지선별검사(CIST) 같이 받아보시는 게 안전할 것 같아요.
어르신: 기억력이 자꾸 깜빡깜빡해서 걱정이었는데, 선생이 같이 가주면 검사받아 볼게.`,
  },
];

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipForever: () => void;
  onStartPracticeScenario: (scenario: PracticeScenario) => void;
  onOpenNewClientModal?: () => void;
  onNavigateToTab?: (tab: 'portal' | 'ai-studio' | 'forms' | 'clients') => void;
}

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({
  isOpen,
  onClose,
  onSkipForever,
  onStartPracticeScenario,
  onOpenNewClientModal,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState<number>(5);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-meal-arthritis');

  // Calculate remaining days out of 5 days
  useEffect(() => {
    const firstVisit = parseInt(localStorage.getItem('tutorial_first_visit_time') || '0', 10);
    if (!firstVisit) {
      localStorage.setItem('tutorial_first_visit_time', Date.now().toString());
      setRemainingDays(5);
    } else {
      const daysPassed = Math.floor((Date.now() - firstVisit) / (24 * 60 * 60 * 1000));
      setRemainingDays(Math.max(0, 5 - daysPassed));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const STEPS = [
    {
      title: '1. 신규 대상자 등록',
      subtitle: '어르신 인적사항 및 복지·건강 정보 등록',
      icon: <UserPlus className="w-5 h-5 text-amber-400" />,
    },
    {
      title: '2. 음성 상담 녹음 & STT',
      subtitle: '방문·전화 상담 실시간 음성인식 전사',
      icon: <Mic className="w-5 h-5 text-amber-400" />,
    },
    {
      title: '3. AI 실시간 요약 & 위험감지',
      subtitle: 'Gemini 실시간 브리핑 & 핵심 위험 팝업',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      title: '4. 법정 서식 자동 반영 & 스마트필',
      subtitle: '상담기록지·초기면접지 1-클릭 채우기',
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-400" />,
    },
    {
      title: '5. 모의 상담 실습 모드',
      subtitle: '가상 어르신 프로필로 안심 실습 체험',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
  ];

  const selectedScenario =
    PRACTICE_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRACTICE_SCENARIOS[0];

  return (
    <div
      id="tutorial-guide-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="tutorial-guide-modal-content"
        className="bg-white dark:bg-[#1C1715] border border-stone-300 dark:border-stone-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B221D] via-[#241C18] to-[#1C1715] text-white px-5 py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>케어브릿지 신규 사용자 튜토리얼</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>5일 안내 모드: D-{remainingDays > 0 ? remainingDays : 'Day'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                신규 대상자 등록부터 AI 상담 전사, 실시간 요약, 법정 서식 자동 반영까지 한눈에 마스터하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-tutorial-skip-session"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              title="이번 세션 건너뛰기"
            >
              건너뛰기 (Skip)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="bg-stone-100 dark:bg-[#251E1A] px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center justify-between min-w-[620px] gap-1">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isPast = currentStep > idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md font-bold'
                      : isPast
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-white dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-amber-700'
                        : isPast
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{step.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content by Step */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: 신규 대상자 등록 */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-amber-600 text-white shrink-0 mt-0.5 shadow-sm">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      1단계: 사례관리의 첫걸음
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100">
                      신규 어르신(대상자) 기본 정보 및 복지 상태 등록
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      상담과 서식 작성에 앞서 어르신의 인적사항(성명, 주민등록번호, 주소, 비상연락처)과 국민기초생활수급·차상위 자격, 주요 기저질환을 시스템에 등록합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Popover Explanatory Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>등록 필수 항목 체크리스트</span>
                  </h4>
                  <ul className="text-xs space-y-2 text-stone-600 dark:text-stone-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <strong>성명 및 주민번호:</strong> 공식 법정 서식 및 희망이음 연계용
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <strong>거주 형태 및 주소:</strong> 방문 동선 최적화 및 주거환경 평가
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <strong>보장구분 & 질환:</strong> 기초수급, 차상위, 관절염, 치매, 뇌경색 등
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <strong>사례관리 구분:</strong> 일반사례관리 vs 집중관리 대상
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>원클릭 퀵 런처</span>
                    </h4>
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1 leading-relaxed">
                      상단 내비게이션의 <strong>'+ 대상자 등록'</strong> 버튼을 누르면 언제 어디서든 바로 등록 팝업이 실행됩니다.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      id="btn-tutorial-open-new-client"
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewClientModal?.();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>신규 대상자 등록 모달 열어보기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 음성 상담 녹음 & STT */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-sm">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                      2단계: 현장 상담 녹취 및 전사
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-blue-950 dark:text-blue-100">
                      현장 가정방문 & 유선상담 실시간 음성 전사 (STT)
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      사회복지사의 번거로운 현장 수기 메모를 대체하여, 스마트폰이나 노트북 마이크로 어르신과의 상담 대화를 실시간 텍스트로 안전하게 변환합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <span>실시간 음성 레벨 미터</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    마이크 감도를 시각적으로 보여주어, 어르신의 작은 목소리도 놓치지 않고 수신 중인지 직관적으로 확인할 수 있습니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>녹음 파일 드래그앤드롭</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    현장에서 녹음기나 스마트폰으로 녹음해둔 .mp3, .m4a 음성 파일도 마우스로 끌어다 놓으면 즉시 전사 분석됩니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                    <EyeOff className="w-4 h-4 text-emerald-500" />
                    <span>개인정보 안심 처리</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    음성 데이터는 외부 저장소에 무단 전송되지 않으며, 암호화된 전사 엔진과 사용자 기기 세션 내에서 안전하게 처리됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI 실시간 요약 & 위험감지 */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                      3단계: 스마트 스트리밍 AI 사정
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-100">
                      음성 상담 중 AI 요약 생성 & 핵심 위험 키워드 즉시 경고
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      상담이 진행되는 동안 실시간 스트리밍 분석 엔진이 작동합니다. 낙상, 식사 결식, 우울/자살 위험 등 생명과 직결된 핵심 위험 발화가 감지되면 즉시 팝업 경고와 북마크를 제안합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Demo of Streaming Risk Warning Popover */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping inline-block" />
                    <span className="text-xs font-black text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      실시간 스트리밍 위험 키워드 감지 팝업 (시뮬레이션)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold">
                    반응속도 0.1초 즉시 알림
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#1E1916] rounded-xl border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold bg-rose-600 text-white text-[10px]">
                        긴급: 낙상/주거안전
                      </span>
                      <span className="text-stone-500 text-[11px]">키워드: "화장실에서 넘", "못 일어"</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 italic">
                      "...밤에 화장실 가다가 물기에 미끄러져서 크게 넘어졌는데 혼자서는 못 일어났어..."
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      ★ 중요 북마크 자동 추가
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>상담 종료 후 3줄 핵심 요약 브리핑 자동 도출</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>'요약 결과 복사' 버튼으로 한글/외부 문서에 즉시 붙여넣기</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 법정 서식 자동 반영 & 스마트 필 */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-sm">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                      4단계: 법정 서식 연동
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-100">
                      상담기록지·초기면접지 원클릭 자동 완성 & 스마트 필(Smart Fill)
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      AI가 상담록에서 도출한 어르신의 호소 문제, 신체·정서 상태, 사회복지사 종합 소견을 보건복지부 10대 표준 법정 서식의 지정 칸에 자동으로 채워 넣습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>원클릭 법정 서식 자동 매핑</span>
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    상담 분석 완료 화면에서 <strong>'⚡ 상담기록지 서식 자동 완성'</strong> 버튼을 클릭하면, '상담 목적'과 '상담 내용' 필드가 완벽한 공문서 형식으로 채워집니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-900 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>서식 편집기 내 스마트 필 (Smart Fill)</span>
                  </h4>
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                    서식 편집기 상단 <strong>'스마트 필'</strong> 버튼을 통해 이전 상담 기록 및 녹취 데이터를 현재 서식(초기면접지, 종합사정표 등)의 임상 항목에 맞춰 정밀 보충할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: 신규 사회복지사를 위한 모의 상담 실습 모드 */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shrink-0 mt-0.5 shadow-md">
                    <Zap className="w-6 h-6 text-amber-200" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      5단계: 실습 모드 (안심 가상 데이터 체험)
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100">
                      익명화된 가상 어르신 프로필로 모의 상담 AI 분석 실습
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      실제 어르신의 개인정보 유출 걱정 없이, 아래 3가지 대표 시나리오 중 하나를 선택하여 <strong>[실습 모드 시작]</strong>을 누르시면 가상 어르신 등록과 상담 녹취가 자동 로드되어 AI 분석을 즉시 체험하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenario Selector Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  대표 모의 상담 시나리오 선택:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRACTICE_SCENARIOS.map((scenario) => {
                    const isSelected = selectedScenarioId === scenario.id;
                    return (
                      <div
                        key={scenario.id}
                        onClick={() => setSelectedScenarioId(scenario.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 shadow-md ring-2 ring-amber-400/30'
                            : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              {scenario.badge}
                            </span>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              {scenario.elderName} ({scenario.elderAge}세)
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                            {scenario.title}
                          </h5>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                            {scenario.conditionDescription}
                          </p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500">{scenario.welfareType.split(' ')[0]}</span>
                          <span
                            className={`font-bold ${
                              isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-stone-500'
                            }`}
                          >
                            {isSelected ? '선택됨 ✓' : '클릭하여 선택'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Scenario Preview & Launch Button */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      선택된 실습 시나리오: [{selectedScenario.elderName}]
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                      익명화 실습 데이터
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    가상 어르신 프로필 자동 생성 및 AI 녹취실로 이동
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#1A1513] rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-2">
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    상담 녹취록 미리보기:
                  </p>
                  <p className="text-stone-700 dark:text-stone-300 line-clamp-3 text-[11px] leading-relaxed whitespace-pre-line font-mono">
                    {selectedScenario.consultationTranscript}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>실습 완료 후 언제든 가상 데이터를 삭제하거나 초기화할 수 있습니다.</span>
                  </div>

                  <button
                    id="btn-tutorial-start-practice"
                    type="button"
                    onClick={() => {
                      onStartPracticeScenario(selectedScenario);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>가상 프로필 생성 & 실습 모드 바로 시작하기</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-stone-50 dark:bg-[#1A1513] px-5 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 flex-wrap gap-2">
          {/* Left: Step indicator and Skip Forever */}
          <div className="flex items-center gap-3">
            <button
              id="btn-tutorial-skip-forever"
              type="button"
              onClick={onSkipForever}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
              title="튜토리얼을 완료하고 앞으로 자동으로 띄우지 않습니다. (언제든 상단 '도움말 가이드'로 다시 볼 수 있음)"
            >
              다시 보지 않기 (5일 가이드 종료)
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {currentStep + 1} / {STEPS.length} 단계
            </span>
          </div>

          {/* Right: Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전</span>
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>다음 단계</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onStartPracticeScenario(selectedScenario);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>실습 모드 시작</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
