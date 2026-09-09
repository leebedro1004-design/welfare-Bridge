import { ClientProfile, CaseDocument, PresetScenario } from '../types';

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: '김순옥',
    birthDate: '1942-03-15',
    age: 84,
    gender: '여',
    phone: '010-3491-8271',
    emergencyContact: {
      name: '김진태',
      relation: '장남 (타지역 거주)',
      phone: '010-9821-4412',
    },
    address: '서울특별시 강북구 삼양로 114길 28, 2층',
    latitude: 37.6258,
    longitude: 127.0175,
    preferredVisitTime: '오전 10:00 ~ 11:30',
    lastVisitDate: '2025-01-15',
    nextScheduledVisit: '2025-01-22 10:30',
    visitPriority: '긴급',
    livingType: '독거노인',
    welfareType: '기초생활수급자(생계/의료)',
    longTermCareStatus: '등급외 B',
    chronicDiseases: ['퇴행성관절염(양측 무릎)', '고혈압', '골다공증', '경미한 백내장'],
    riskLevel: '고위험',
    caseWorker: '이현정 사회복지사',
    registrationDate: '2025-01-15',
    status: '집중관리',
  },
  {
    id: 'client-2',
    name: '박영철',
    birthDate: '1947-08-20',
    age: 79,
    gender: '남',
    phone: '010-4829-1092',
    emergencyContact: {
      name: '이수미',
      relation: '통장 (이웃)',
      phone: '010-5541-7788',
    },
    address: '서울특별시 강북구 솔샘로 174, 다세대 102호',
    latitude: 37.6185,
    longitude: 127.0142,
    preferredVisitTime: '오후 14:00 ~ 15:30',
    lastVisitDate: '2025-01-10',
    nextScheduledVisit: '2025-01-22 13:40',
    visitPriority: '우선',
    livingType: '독거노인',
    welfareType: '차상위계층',
    longTermCareStatus: '등급외 A',
    chronicDiseases: ['당뇨병(인슐린 투약)', '뇌졸중 후유증(우측 편마비 경증)', '우울감'],
    riskLevel: '중위험',
    caseWorker: '이현정 사회복지사',
    registrationDate: '2024-09-10',
    status: '진행중',
  },
  {
    id: 'client-3',
    name: '최정자',
    birthDate: '1939-11-04',
    age: 87,
    gender: '여',
    phone: '010-7210-9934',
    emergencyContact: {
      name: '박순애',
      relation: '딸',
      phone: '010-3321-8890',
    },
    address: '서울특별시 강북구 도봉로 89길 22, 304호',
    latitude: 37.6364,
    longitude: 127.0251,
    preferredVisitTime: '오후 15:30 ~ 16:30',
    lastVisitDate: '2024-12-28',
    nextScheduledVisit: '2025-01-22 15:10',
    visitPriority: '일반',
    livingType: '독거노인',
    welfareType: '기초생활수급자(생계/의료)',
    longTermCareStatus: '등급외 B',
    chronicDiseases: ['허리디스크', '수면장애', '소화불량'],
    riskLevel: '일반',
    caseWorker: '이현정 사회복지사',
    registrationDate: '2024-03-20',
    status: '모니터링',
  },
  {
    id: 'client-4',
    name: '이만수',
    birthDate: '1944-05-12',
    age: 82,
    gender: '남',
    phone: '010-6632-1189',
    emergencyContact: {
      name: '이동현',
      relation: '아들',
      phone: '010-8776-3211',
    },
    address: '서울특별시 강북구 인수봉로 152, 단독주택',
    latitude: 37.6412,
    longitude: 127.0123,
    preferredVisitTime: '오전 11:30 ~ 12:30',
    lastVisitDate: '2025-01-08',
    nextScheduledVisit: '2025-01-22 11:40',
    visitPriority: '우선',
    livingType: '노인부부',
    welfareType: '기초연금수급자',
    longTermCareStatus: '등급외 A',
    chronicDiseases: ['만성폐쇄성폐질환(COPD)', '고혈압', '난청'],
    riskLevel: '중위험',
    caseWorker: '이현정 사회복지사',
    registrationDate: '2024-11-05',
    status: '진행중',
  },
  {
    id: 'client-5',
    name: '정옥순',
    birthDate: '1938-09-27',
    age: 88,
    gender: '여',
    phone: '010-9982-4512',
    emergencyContact: {
      name: '김은지',
      relation: '사회복지 전담공무원',
      phone: '02-901-6543',
    },
    address: '서울특별시 강북구 4.19로 48, 반지하 1호',
    latitude: 37.6492,
    longitude: 127.0084,
    preferredVisitTime: '오후 16:30 ~ 17:30',
    lastVisitDate: '2025-01-05',
    nextScheduledVisit: '2025-01-22 16:30',
    visitPriority: '긴급',
    livingType: '독거노인',
    welfareType: '기초생활수급자(생계/의료)',
    longTermCareStatus: '등급외 C',
    chronicDiseases: ['초기 치매(인지저하)', '낙상 후유증', '결식 위험'],
    riskLevel: '고위험',
    caseWorker: '이현정 사회복지사',
    registrationDate: '2025-01-02',
    status: '집중관리',
  },
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'preset-1',
    title: '신규발굴 독거 어르신 초기면접 및 종합사정 (낙상위험·식사결식)',
    category: '초기상담 / 인테이크',
    recommendedDocType: 'intake',
    description: '주민센터 복지플래너 의뢰로 긴급 방문한 84세 독거 어르신과의 40분 상담 녹취 텍스트',
    clientName: '김순옥',
    age: 84,
    gender: '여',
    workerNotes: '보행 시 지팡이 없이 벽을 짚고 계심. 냉장고 열어보니 유통기한 지난 장아찌류만 소량 있음. 화장실 문턱이 8cm로 매우 높고 미끄럼 방지 패드 없음.',
    transcriptText: `[사회복지사]: 어르신, 안녕하세요! 삼양동 재가노인지원센터 이현정 사회복지사입니다. 주민센터 복지팀에서 연락받고 어르신 뵙고 도움드릴 수 있는 부분 찾으러 왔어요.
[김순옥 어르신]: 아이고 복지사 양반, 먼 데까지 왔네. 들어와요. 집이 누추해서 앉을 데나 있나 모르겠네.
[사회복지사]: 아닙니다 어르신, 편하게 앉으세요. 요즘 무릎이 많이 아프시다고 들었는데 거동은 좀 어떠세요?
[김순옥 어르신]: 말도 마요. 양쪽 무릎이 다 나가서 방에서 화장실 가는 것도 끙끙 앓으면서 기어가다시피 해. 지난주에도 화장실 문턱 넘다가 발이 걸려 넘어져서 엉덩방아를 찧었어. 아직도 허리랑 멍든 데가 쑤셔 죽겠네. 혼자 살다 보니 어디 쓰러져도 아무도 모를까 봐 밤마다 덜컥 겁이 나.
[사회복지사]: 아이고, 지난주에 넘어지셨군요! 크게 안 다치셔서 천만다행입니다. 병원은 다녀오셨어요?
[김순옥 어르신]: 병원 가려면 버스 타러 큰길까지 나가야 하는데 계단 내려가기가 무서워서 못 가. 파스만 붙이고 참았지. 혈압약도 거의 다 떨어져 가는데...
[사회복지사]: 어르신, 식사는 요즘 어떻게 챙겨 드세요? 식사는 거르지 않고 하셔야 약도 드실 텐데요.
[김순옥 어르신]: 밥맛도 통 없고, 가스 불 켜고 서서 국 끓이는 게 너무 힘들어. 그냥 찬물에 밥 말아서 김치 쪼가리나 된장에 찍어 먹고 말지. 하루에 점심 한 끼 대충 때우고 저녁은 그냥 굶고 자요.
[사회복지사]: 그러셨군요... 영양이 부족하시면 기운이 더 빠지셔서 관절도 더 힘들어지세요. 가족분들은 혹시 연락이 닿으시나요?
[김순옥 어르신]: 큰아들이 하나 있긴 한데, 사업 망하고 지방 내려가서 지 살기도 바쁜지 명절에도 통 연락이 안 와. 일 년에 한두 번 전화나 올까... 말해봤자 부담만 줄 텐데 뭐. 이웃들도 다 나이 들어서 서로 집 안부나 묻고 지내지.
[사회복지사]: 네 어르신, 저희 재가노인지원센터에서 매주 주 2~3회 밑반찬 배달해 드리고, 화장실에 안전손잡이랑 미끄럼 방지 매트 설치해 드릴 수 있어요. 병원 가실 때도 동행 서비스 연계해 드릴게요.
[김순옥 어르신]: 아이고 참말인가요? 나라에서 그런 것도 해줘? 반찬만 좀 들어와도 살겠네... 고마워요 복지사 양반.`,
  },
  {
    id: 'preset-2',
    title: '당뇨·편마비 어르신 정기 모니터링 및 복약점검 일지',
    category: '모니터링 / 가정방문',
    recommendedDocType: 'monitoring',
    description: '반찬지원 및 안부확인 진행 중인 79세 박영철 어르신 월 정기 가정방문 상담 녹취',
    clientName: '박영철',
    age: 79,
    gender: '남',
    workerNotes: '어르신 표정이 이전 방문보다 밝아지셨으나, 인슐린 주사 바늘 폐기함이 가득 차 교체 필요함. 발가락 부위에 작은 상처가 있어 소독 및 보건소 연계 확인 요망.',
    transcriptText: `[사회복지사]: 박영철 어르신, 안녕하세요! 지난주에 배달된 밑반찬은 입에 잘 맞으셨어요?
[박영철 어르신]: 어서 와요 복지사님. 응, 이번에 온 미역국이랑 불고기가 아주 부드러워서 밥 두 그릇이나 뚝딱 비웠어. 요새 밥맛이 좀 돌아.
[사회복지사]: 식사 잘 챙겨 드시니 안색이 아주 좋아지셨네요! 당뇨 혈당 체크는 매일 잘하고 계신가요?
[박영철 어르신]: 아침 공복 혈당이 130~140 정도로 지난달보다 많이 안정됐어. 인슐린도 아침마다 꼬박꼬박 맞고 있고. 근데 오른손에 힘이 덜 들어가서 주사 바늘 갈아 끼울 때 가끔 손을 벱니다. 그리고 며칠 전에 발톱 깎다가 엄지발가락 옆이 살짝 까졌는데 잘 안 아무네.
[사회복지사]: 어르신 당뇨 환자분들은 발 상처 관리가 정말 중요해요! 상처 부위 한번 봐드릴게요... 약간 붉어져 있네요. 제가 오늘 보건소 방문간호사 선생님께 긴급으로 말씀드려서 내일 바로 상처 소독이랑 드레싱 점검 오시도록 연락하겠습니다.
[박영철 어르신]: 고마워요. 통장님이 지난번에 가르쳐준 복지관 노래교실도 화요일마다 가봤는데, 사람들도 만나고 참 좋더라고. 집에만 있을 때는 우울했는데 바깥바람 쐬니 살 것 같아.
[사회복지사]: 정말 다행입니다! 노래교실 꾸준히 나가시고, 주사 바늘 수거함도 오늘 새 걸로 교체해 드릴게요.`,
  },
  {
    id: 'preset-3',
    title: '복합위기 어르신 지원을 위한 다학제 사례회의록 (내부·외부 연계)',
    category: '사례회의',
    recommendedDocType: 'case_conference',
    description: '재가노인지원센터 사례관리팀장, 담당 사회복지사, 주거복지센터 담당관, 보건소 간호사 간의 사례회의 녹취',
    clientName: '김순옥',
    age: 84,
    gender: '여',
    workerNotes: '안건: 고위험 독거노인 김순옥 어르신 주거안전 긴급 개입 및 일상생활 복합지원 계획 심의.',
    transcriptText: `[사례관리팀장]: 지금부터 2025년도 제4차 긴급사례회의를 시작하겠습니다. 오늘 안건은 삼양동 독거노인 김순옥 어르신(84세, 기초수급, 등급외 B) 사례에 대한 서비스 계획 및 다자원 연계 방안 확정입니다. 담당 이현정 사회복지사님 보고해 주십시오.
[이현정 복지사]: 대상 어르신은 중증 무릎관절염과 보행불안으로 최근 화장실 낙상사고를 겪으셨으며, 조리불가로 1일 1식 부실급식 상태입니다. 장남과의 단절로 가족 지지망이 전무하며, 야간 낙상 및 고독사 불안감이 매우 높습니다.
[주거복지관]: 주거환경 확인 결과, 화장실 문턱 제거는 임대인 동의가 필요하나 내부 L자형 안전손잡이 2개소 설치와 바닥 미끄럼방지 코팅은 저희 센터 긴급집수리 사업으로 이번 주 목요일 즉시 시공 가능합니다.
[보건소 간호사]: 관절통 완화 및 혈압약 복약 관리를 위해 월 2회 방문건강관리 전담 간호사 배정하고, 정형외과 진료 시 센터 이동지원 차량 및 동행봉사자 연계가 시급해 보입니다.
[사례관리팀장]: 좋습니다. 결정사항 정리하겠습니다.
1. 재가노인지원 주 3회 맞춤형 영양밑반찬 긴급 투입.
2. 주거복지센터 연계: 화장실 안전손잡이 및 미끄럼방지 시공 (4/17 완료 목표).
3. 보건소 방문간호 월 2회 및 복약달력 지원.
4. 야간 응급안전안심서비스(IoT 센서등 및 응급호출벨) 구청 신청.
전원 동의하십니까? 네, 만장일치로 승인합니다.`,
  },
  {
    id: 'preset-4',
    title: '장기요양 3등급 진입에 따른 서비스 종결보고서 및 사례평가서',
    category: '종결 및 평가',
    recommendedDocType: 'termination',
    description: '국민건강보험공단 장기요양 3등급 판정을 받아 주야간보호센터 및 방문요양으로 공식 이관되는 종결 인터뷰 텍스트',
    clientName: '최정자',
    age: 87,
    gender: '여',
    workerNotes: '1년간 재가노인지원서비스(식사지원, 안전바, 말벗)를 통해 상태 유지 후, 인지기능 저하로 장기요양 등급 신청 지원하여 3등급 인정받음. 주야간보호센터로 성공적 연계 종결.',
    transcriptText: `[사회복지사]: 최정자 어르신, 이번에 건강보험공단에서 장기요양 3등급 인정서가 나왔어요! 이제 다음 주부터는 전문 요양보호사 선생님이 매일 오셔서 식사도 챙겨주시고 낮에는 주야간보호센터에서 재미있는 프로그램도 하실 수 있게 되었어요.
[최정자 어르신]: 아이고 복지사님 덕분이에요. 그동안 반찬도 보내주고 나 아플 때마다 손잡아 주고 등급 신청 서류도 다 챙겨주더니... 이제 복지사님이 안 오시면 섭섭해서 어떡하나.
[사회복지사]: 어르신, 저희 재가노인지원센터는 예방적 서비스를 제공하는 곳이라 요양등급을 받으시면 더 많은 전문 급여를 받으실 수 있는 기관으로 안전하게 연결해 드리는 게 원칙이에요. 하지만 3개월 뒤, 6개월 뒤에도 제가 전화로 안부 꼭 드릴 테니 걱정 마세요.
[최정자 딸]: 복지사님, 저희 어머니 혼자 계실 때 식사도 거르시고 우울해하셨는데 센터 덕분에 1년 동안 건강하게 버티셨어요. 정말 진심으로 감사드립니다.
[사회복지사]: 가족분과 어르신 모두 적극적으로 협조해 주셔서 목표를 100% 달성하고 좋은 요양기관으로 연계해 드릴 수 있어 저희도 큰 보람을 느낍니다.`,
  },
];

export const INITIAL_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-1',
    clientId: 'client-1',
    clientName: '김순옥',
    documentType: 'intake',
    title: '김순옥 어르신 초기면접지 (인테이크)',
    createdAt: '2025-01-15 14:30',
    updatedAt: '2025-01-15 16:20',
    author: '이현정 사회복지사',
    status: '결재완료',
    riskLevel: '고위험',
    riskRationale: '중증 무릎관절염으로 인한 보행불가, 최근 화장실 낙상사고 발생, 1일 1식 부실급식 및 가족단절로 야간 응급상황 대처 불가.',
    executiveSummary: [
      '84세 여성 독거 기초생활수급자로 양측 퇴행성 관절염으로 인한 극심한 거동 불편 호소.',
      '지난주 화장실 문턱 넘던 중 낙상사고 발생하였으며, 조리불가로 영양 결핍 및 만성질환 악화 위험 높음.',
      '긴급 식사지원(밑반찬 주 3회), 주거안전바 설치, 방문간호 연계 및 재가노인지원사업 집중관리 대상자로 등록 선정함.',
    ],
    primaryNeeds: [
      '결식 예방을 위한 영양 식사 및 밑반찬 지원',
      '화장실 및 실내 낙상 예방 주거환경개선(안전손잡이 설치)',
      '병원 진료 및 약 처방을 위한 이동·동행 지원',
      '고립감 해소를 위한 정기 안부확인 및 정서지원',
    ],
    physicalHealthStatus: '양측 무릎 관절염 중증, 고혈압 복약 중이나 병원 방문 불가로 약 잔여량 3일분. 최근 낙상으로 좌측 둔부 타박상.',
    adlStatus: '화장실 이동 시 벽을 짚고 기어가다시피 이동함. 목욕 및 옷 입기 시 상당한 보조 필요.',
    iadlStatus: '취사 및 장보기 완전 불가능. 청소 및 빨래 곤란. 전화 받기는 가능하나 번호 다이얼 조작 서툼.',
    emotionalCognitiveStatus: '지남력 양호하나, 혼자 쓰러질까 봐 밤에 불면증 및 불안감 호소(우울척도 11점 중등도 우울).',
    housingEnvironment: '2층 다세대 주택으로 가파른 외부 계단. 실내 화장실 문턱 8cm로 매우 높음. 온수 및 난방 상태는 양호.',
    economicStatus: '기초생활수급자 생계·의료 급여 수급 중(월 약 62만원). 의료비 지출 부담 호소.',
    socialSupportNetwork: '장남 1인 타지역 거주하나 실질적 왕래 및 경제적 지원 전무. 이웃 교류 제한적.',
    socialWorkerOpinion: '신체적 기능 저하와 낙상 트라우마, 영양결핍 위험이 복합적으로 나타나는 고위험 독거 어르신으로 재가노인지원사업 긴급 개입 필요.',
    recommendedServices: [
      { category: '식사지원', serviceName: '영양 밑반찬 배달', frequency: '주 3회', purpose: '결식예방 및 기초영양 유지' },
      { category: '주거환경', serviceName: '화장실 안전손잡이 및 미끄럼방지 시공', frequency: '1회(긴급)', purpose: '낙상 2차사고 방지' },
      { category: '보건의료', serviceName: '보건소 방문간호 및 병원동행', frequency: '월 2회', purpose: '만성질환 및 관절염 관리' },
      { category: '안전안심', serviceName: 'IoT 안심 LED 및 응급벨 설치', frequency: '상시', purpose: '24시간 고독사 및 위기대응' },
    ],
    shortTermGoals: [
      '1개월 내 주 3회 밑반찬 연계를 통해 결식률 0% 달성 및 규칙적 복약 환경 조성',
      '2주 내 화장실 안전손잡이 설치로 실내 낙상 위험도 50% 경감',
    ],
    longTermGoals: [
      '재가 생활 안정성 유지를 통한 시설 입소 지연 및 지역사회 내 건강한 노후 생활 영위',
    ],
  },
];

export const DEFAULT_USER_SETTINGS: import('../types').UserSettings = {
  institutionName: '도봉재가노인지원서비스센터',
  agencyName: '도봉재가노인지원서비스센터',
  institutionRegistrationNumber: '123-82-99881',
  workerName: '이현정',
  socialWorkerName: '이현정',
  workerPosition: '선임 사회복지사',
  contactPhone: '02-2600-1111',
  contactEmail: 'contact@dobongsilver.or.kr',
  institutionAddress: '서울특별시 도봉구 도봉로 123길 45 (방학동)',
  approvalStepsCount: 3,
  approvalStepTitles: ['담당', '선임/팀장', '센터장'],
  sealText: '도봉재가노인지원서비스센터장인',
  driveFolderName: '재가노인지원서비스_스마트사례관리_자료실',
  autoBackupToDrive: true,
  dashboardPanelOrder: ['schedule', 'routes', 'insights', 'aiStudio'],
};

export const INITIAL_CONSULTATION_INSIGHTS: import('../types').ConsultationInsight[] = [
  {
    id: 'insight-1',
    clientId: 'client-1',
    clientName: '김순옥',
    timestamp: '2026-08-24 16:30',
    riskLevel: '고위험',
    threeLineSummary: [
      '1. 신체/건강: 양측 무릎 퇴행성 관절염으로 거동 제한 및 최근 화장실 미끄럼 낙상 사고 경험 확인.',
      '2. 정서/욕구: 식사 조리 불가로 주 3회 결식 발생 및 홀로 쓰러질까 봐 야간 불면증/불안감 호소.',
      '3. 즉시 조치: 주 3회 긴급 밑반찬 배달, 화장실 안전손잡이 긴급 시공 및 응급안전안심 장비 접수 완료.',
    ],
    keyIssues: ['낙상/주거안전', '식사/영양결식', '만성질환/복약'],
    recommendedService: '긴급 밑반찬(주 3회) + 화장실 안전손잡이 긴급시공',
    isUrgent: true,
  },
  {
    id: 'insight-2',
    clientId: 'client-2',
    clientName: '박영철',
    timestamp: '2026-08-24 14:15',
    riskLevel: '중위험',
    threeLineSummary: [
      '1. 신체/건강: 당뇨 인슐린 투약 중이며 우측 편마비로 신체 균형 다소 불안정.',
      '2. 정서/욕구: 병원 외래 진료 시 혼자 대중교통 이용에 큰 두려움과 심리적 위축.',
      '3. 즉시 조치: 월 2회 병원 동행 봉사단 연계 및 보건소 방문간호 인슐린 복약 점검 의뢰.',
    ],
    keyIssues: ['만성질환/복약', '병원외래동행', '장기요양진입'],
    recommendedService: '병원동행 서비스 + 복약 지도',
    isUrgent: false,
  },
  {
    id: 'insight-3',
    clientId: 'client-3',
    clientName: '최정자',
    timestamp: '2026-08-24 11:20',
    riskLevel: '일반',
    threeLineSummary: [
      '1. 신체/건강: 허리디스크로 장시간 보행 및 기립 불편, 야간 잦은 수면장애 및 소화불량 호소.',
      '2. 정서/욕구: 자녀 출가 후 독거로 인한 적적함 호소, 정기적인 안부 전화 및 말벗 소통 희망.',
      '3. 즉시 조치: 주 1회 정기 유선 안부확인, 월 1회 방문상담 및 소화에 용이한 밑반찬 연계.',
    ],
    keyIssues: ['만성질환/복약', '정서적지지/말벗', '영양식단개선'],
    recommendedService: '주 1회 정기 안부확인 + 영양 밑반찬 지원',
    isUrgent: false,
  },
  {
    id: 'insight-4',
    clientId: 'client-4',
    clientName: '이만수',
    timestamp: '2026-08-23 15:40',
    riskLevel: '중위험',
    threeLineSummary: [
      '1. 신체/건강: 만성폐쇄성폐질환(COPD)으로 호흡곤란 빈발 및 양측 난청으로 전화소통 곤란.',
      '2. 정서/욕구: 배우자 역시 고령으로 가사 및 영양식 준비에 큰 한계 봉착, 가사 보조 지원 절실.',
      '3. 즉시 조치: 노인맞춤돌봄 가사지원 서비스 연계, 호흡기 약물 정기 투약 확인 및 복약알림기 지원.',
    ],
    keyIssues: ['호흡기질환/건강', '노인부부가사부담', '난청/의사소통'],
    recommendedService: '가사지원 연계 + 호흡기 복약관리 점검',
    isUrgent: false,
  },
  {
    id: 'insight-5',
    clientId: 'client-5',
    clientName: '정옥순',
    timestamp: '2026-08-23 10:15',
    riskLevel: '고위험',
    threeLineSummary: [
      '1. 신체/건강: 초기 인지저하(치매의심)로 약 복용 불규칙, 낙상 후유증으로 거동 극심 불편.',
      '2. 정서/욕구: 가스불 끄는 것을 자주 잊어 화재 위험 가중, 음식 조리 중단되어 심각한 결식 상태.',
      '3. 즉시 조치: 가스안전타이머콕 긴급 시공, 치매안심센터 선별검사 의뢰 및 주 5회 긴급 도시락 지원.',
    ],
    keyIssues: ['인지저하/치매위험', '가스화재/안전사고', '식사/영양결식'],
    recommendedService: '긴급 도시락(주 5회) + 가스안전타이머콕 시공 + 치매검사 연계',
    isUrgent: true,
  },
];
