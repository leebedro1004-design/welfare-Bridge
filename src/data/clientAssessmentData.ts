import { ClientProfile, DocumentType } from '../types';

export interface ClientAdlItem {
  name: string;
  category: '기본일상생활(ADL)' | '수단적일상생활(IADL)';
  status: '자립' | '부분도움' | '완전도움';
  note?: string;
}

export interface ClientAssessmentDetail {
  clientId: string;
  assessmentDate: string;
  assessorName: string;
  
  // 1. 신체기능 및 일상생활 자립도
  adlScoreTotal: number; // e.g. 18 / 24
  adlItems: ClientAdlItem[];
  physicalSummary: string;

  // 2. 정서 및 심리 상태 (SGDS-K 15문항 단축형)
  depressionScore: number; // 0 ~ 15
  depressionLevel: '정상 (0~7점)' | '우울 의심 (8~10점)' | '고위험 우울 (11~15점)';
  emotionalSummary: string;
  keyConcerns: string[];

  // 3. 주거 및 경제 환경
  housingSafetyScore: '양호' | '주의' | '위험';
  housingDetails: string;
  economicStatus: string;
  
  // 4. 종합 사정 소견 및 개입 계획
  workerOverallOpinion: string;
  recommendedServices: {
    serviceName: string;
    frequency: string;
    purpose: string;
  }[];
}

export interface ClientConsultationEntry {
  id: string;
  clientId: string;
  date: string;
  time: string;
  type: 'visit' | 'call' | 'center' | 'hospital' | 'emergency';
  typeLabel: string;
  workerName: string;
  title: string;
  threeLineSummary: [string, string, string];
  clientVoiceQuote: string;
  riskAssessment: '최중점' | '중점' | '일반';
  keyNeeds: string[];
  actionTaken: string;
  linkedDocType?: DocumentType;
  linkedDocTitle?: string;
}

// Pre-populated realistic assessment records for initial clients
export const MOCK_ASSESSMENT_DETAILS: Record<string, ClientAssessmentDetail> = {
  'client-1': {
    clientId: 'client-1',
    assessmentDate: '2025-01-15',
    assessorName: '이현정 사회복지사',
    adlScoreTotal: 14,
    adlItems: [
      { name: '식사하기', category: '기본일상생활(ADL)', status: '부분도움', note: '틀니 헐거움으로 딱딱한 음식 조리 불가, 죽/찬물 밥 섭취' },
      { name: '옷 입고 벗기', category: '기본일상생활(ADL)', status: '자립', note: '하의 착용 시 무릎 통증으로 서서 입기 어려움' },
      { name: '세수 및 양치', category: '기본일상생활(ADL)', status: '자립', note: '세면대 사용 가능하나 장시간 기립 시 어지럼' },
      { name: '목욕하기', category: '기본일상생활(ADL)', status: '부분도움', note: '욕조 진입 불가, 바닥 미끄럼 낙상 공포' },
      { name: '일어나 앉기/보행', category: '기본일상생활(ADL)', status: '부분도움', note: '양측 무릎 관절염 중증, 벽을 짚고 보행' },
      { name: '화장실 이용', category: '기본일상생활(ADL)', status: '부분도움', note: '8cm 문턱 넘다 지난주 낙상 사고 발생' },
      { name: '음식 조리/식사준비', category: '수단적일상생활(IADL)', status: '완전도움', note: '가스 불 켜기 및 조리 불가로 1일 1식 부실 결식' },
      { name: '약 챙겨먹기', category: '수단적일상생활(IADL)', status: '부분도움', note: '혈압약 등 복약 주기 불규칙, 외래 방문 지연' },
      { name: '청소 및 세탁', category: '수단적일상생활(IADL)', status: '완전도움', note: '허리디스크 및 무릎으로 걸레질/손빨래 불가' },
      { name: '외출 및 장보기', category: '수단적일상생활(IADL)', status: '완전도움', note: '계단 및 언덕길 보행 불가로 독거 고립' },
    ],
    physicalSummary: '양측 퇴행성 무릎관절염과 골다공증으로 실내 보행 시 벽을 짚어야 하며, 계단 및 실외 이동이 사실상 불가능함. 최근 화장실 문턱 낙상으로 둔부 타박상 발생.',
    depressionScore: 12,
    depressionLevel: '고위험 우울 (11~15점)',
    emotionalSummary: '장남과의 연락 두절로 인한 깊은 소외감과 "혼자 쓰러져도 아무도 모를 것"이라는 고독사 불안감이 극심함. 수면 장애 동반.',
    keyConcerns: ['영양결식 (1일 1식)', '낙상사고 재발 위험', '가족단절 소외감', '실외 이동 불가'],
    housingSafetyScore: '위험',
    housingDetails: '2층 다세대주택으로 진입 계단 가파름. 화장실 문턱(8cm) 높고 미끄럼방지 패드 및 안전손잡이 부재. 단열 취약.',
    economicStatus: '기초생활수급자(생계/의료)로 월 생계급여 외 사적 부양비 전무. 병원 교통비 및 보조기구 구입 여력 없음.',
    workerOverallOpinion: '신체 거동 장애와 식사 결식, 주거 낙상 위험이 중첩된 최중점 집중관리 대상자임. 화장실 안전손잡이 긴급 시공 및 주 3회 밑반찬 배달, 주 2회 유선·방문 안부 확인이 즉각 개입되어야 함.',
    recommendedServices: [
      { serviceName: '맞춤형 영양 밑반찬 배달', frequency: '주 3회 (화, 목, 토)', purpose: '부실 결식 예방 및 저염 고단백 영양 보충' },
      { serviceName: '주거환경개선 (화장실 안전손잡이·미끄럼방지)', frequency: '1회 (긴급)', purpose: '화장실 낙상사고 재발 방지' },
      { serviceName: '정기 집중 안부확인 & 말벗', frequency: '주 2회 (방문 1회, 유선 1회)', purpose: '고독사 예방 및 정서적 지지망 강화' },
      { serviceName: '병원 외래진료 동행 서비스', frequency: '월 1회', purpose: '정형외과 관절염 및 고혈압 처방약 수령' },
    ],
  },
  'client-2': {
    clientId: 'client-2',
    assessmentDate: '2025-01-10',
    assessorName: '이현정 사회복지사',
    adlScoreTotal: 18,
    adlItems: [
      { name: '식사하기', category: '기본일상생활(ADL)', status: '자립', note: '스스로 식사 가능하나 오른손 편마비로 젓가락질 서툼' },
      { name: '옷 입고 벗기', category: '기본일상생활(ADL)', status: '자립', note: '단추 잠그기 시 약간의 시간 소요' },
      { name: '목욕하기', category: '기본일상생활(ADL)', status: '부분도움', note: '등 씻기 등 일부 동작 불편' },
      { name: '일어나 앉기/보행', category: '기본일상생활(ADL)', status: '자립', note: '지팡이 짚고 평지 20분 내외 자립 보행 가능' },
      { name: '화장실 이용', category: '기본일상생활(ADL)', status: '자립', note: '양변기 사용 원활' },
      { name: '약 챙겨먹기/인슐린', category: '수단적일상생활(IADL)', status: '부분도움', note: '인슐린 주사 바늘 결합 시 손가락 떨림 있어 점검 필요' },
      { name: '음식 조리/식사준비', category: '수단적일상생활(IADL)', status: '부분도움', note: '간단한 조리 가능하나 당뇨식 조절 어려움' },
      { name: '청소 및 세탁', category: '수단적일상생활(IADL)', status: '자립', note: '세탁기 사용 가능' },
    ],
    physicalSummary: '뇌졸중 후유증으로 우측 경증 편마비가 잔존하며, 인슐린 투약 중인 제2형 당뇨병 환자임. 발가락 미세 상처로 인한 당뇨발 합병증 예방 관리 필수.',
    depressionScore: 7,
    depressionLevel: '정상 (0~7점)',
    emotionalSummary: '이웃 통장 및 복지관 노래교실 프로그램 참여로 사회적 관계망이 양호하며, 일상 회복 의지가 비교적 높음.',
    keyConcerns: ['당뇨발 합병증 위험', '인슐린 주사 안전관리', '당뇨 맞춤 식단 부족'],
    housingSafetyScore: '주의',
    housingDetails: '반지하 다세대 1층으로 채광 보통, 바닥 턱 낮음. 인슐린 보관 냉장고 작동 정상.',
    economicStatus: '차상위계층으로 의료비 감면 혜택 받고 있으나 당뇨 소모품 및 특수 영양식 구입 부담 존재.',
    workerOverallOpinion: '자가 관리 능력이 양호한 중점 관리 대상자로서, 보건소 방문간호와 연계한 당뇨발 소독 및 정기 혈당 모니터링 중심의 서비스 유지가 적합함.',
    recommendedServices: [
      { serviceName: '보건소 방문간호 연계 (상처 소독·혈당)', frequency: '격주 1회', purpose: '당뇨발 상처 악화 방지 및 혈당 조절' },
      { serviceName: '정기 안부 및 복약 확인', frequency: '주 1회 (유선/방문)', purpose: '인슐린 투약 및 주사바늘 안전 수거' },
      { serviceName: '복지관 여가문화 프로그램 연계', frequency: '주 1회', purpose: '사회관계망 유지 및 우울감 예방' },
    ],
  },
  'client-3': {
    clientId: 'client-3',
    assessmentDate: '2024-12-28',
    assessorName: '이현정 사회복지사',
    adlScoreTotal: 21,
    adlItems: [
      { name: '식사하기', category: '기본일상생활(ADL)', status: '자립', note: '자가 조리 및 섭취 원활' },
      { name: '옷 입고 벗기', category: '기본일상생활(ADL)', status: '자립', note: '문제 없음' },
      { name: '목욕하기', category: '기본일상생활(ADL)', status: '자립', note: '스스로 가능' },
      { name: '일어나 앉기/보행', category: '기본일상생활(ADL)', status: '자립', note: '실버카(보행보조기) 이용 시 실외 보행 가능' },
      { name: '약 챙겨먹기', category: '수단적일상생활(IADL)', status: '자립', note: '소화제, 수면유도제 자가 복용' },
      { name: '장보기/외출', category: '수단적일상생활(IADL)', status: '자립', note: '인근 슈퍼마켓 자립 이용' },
    ],
    physicalSummary: '만성 요통 및 허리디스크가 있으나 실버카를 이용하여 인근 마트 및 경로당 통행이 가능한 상태임. 소화불량 및 수면장애 간헐적 호소.',
    depressionScore: 4,
    depressionLevel: '정상 (0~7점)',
    emotionalSummary: '인근에 딸이 거주하여 주말마다 왕래가 있어 가족 지지망이 유지되고 있음. 정서적 안정 상태.',
    keyConcerns: ['간헐적 요통 통증', '겨울철 한파 건강관리'],
    housingSafetyScore: '양호',
    housingDetails: '엘리베이터 있는 다세대 3층. 실내 문턱 완만하고 조명 밝음.',
    economicStatus: '기초연금 및 차상위 특례 수급으로 기본 생계 안정적.',
    workerOverallOpinion: '일상생활 자립도가 매우 양호한 일반 관리 대상자로서, 월 1~2회 정기 유선 안부확인과 한파/폭염 등 계절성 위기 지원 중심으로 관리함.',
    recommendedServices: [
      { serviceName: '정기 안부 확인 (모니터링)', frequency: '격주 1회 (유선)', purpose: '일상 건강 및 생활 변화 모니터링' },
      { serviceName: '계절성 안전물품 지원', frequency: '필요 시 (동·하절기)', purpose: '방한용품 및 보냉용품 지원' },
    ],
  },
  'client-4': {
    clientId: 'client-4',
    assessmentDate: '2025-01-02',
    assessorName: '이현정 사회복지사',
    adlScoreTotal: 12,
    adlItems: [
      { name: '식사하기', category: '기본일상생활(ADL)', status: '완전도움', note: '식사 거름 빈번, 가스레인지 밸브 잠그는 것을 잊음' },
      { name: '옷 입기', category: '기본일상생활(ADL)', status: '부분도움', note: '계절에 맞지 않는 옷 착용' },
      { name: '보행 및 이동', category: '기본일상생활(ADL)', status: '부분도움', note: '낙상 후유증으로 다리 절뚝임' },
      { name: '투약 관리', category: '수단적일상생활(IADL)', status: '완전도움', note: '인지저하로 약 복용 여부를 기억하지 못함' },
      { name: '외출/길찾기', category: '수단적일상생활(IADL)', status: '완전도움', note: '최근 동네 골목에서 배회하여 파출소 인계 이력' },
    ],
    physicalSummary: '초기 인지저하(치매 의심) 증상과 낙상 후유증으로 거동 및 일상 판단력이 급격히 저하됨. 가스 불 켜두고 외출하는 등 화재 위험 상존.',
    depressionScore: 10,
    depressionLevel: '우울 의심 (8~10점)',
    emotionalSummary: '자주 깜빡하는 것에 대한 불안과 공포로 공격적인 방어 태도를 보이기도 함.',
    keyConcerns: ['치매 배회 및 실종 위험', '화재 안전사고 위험', '투약 및 영양 결손'],
    housingSafetyScore: '위험',
    housingDetails: '단독주택 노후 가옥. 가스 자동 차단기 미설치. 출입문 잠금장치 취약.',
    economicStatus: '기초생활수급자(생계/의료). 치매 정밀진단비 및 주간보호 자부담금 지원 필요.',
    workerOverallOpinion: '인지저하와 배회 위험이 있는 최중점 초고위험 대상자임. 치매안심센터 배회감지기(스마트태그) 긴급 보급 및 가스타이머콕 설치, 주 3회 이상 집중 모니터링이 필수적임.',
    recommendedServices: [
      { serviceName: '스마트 배회감지기(GPS) 보급 및 안심귀가', frequency: '상시 연계', purpose: '실종 및 배회 사고 예방' },
      { serviceName: '가스안전 타이머콕 설치', frequency: '긴급 1회', purpose: '가스 화재사고 사전 차단' },
      { serviceName: '치매안심센터 정밀검사 및 주간보호 연계', frequency: '신청 중', purpose: '장기요양 등급 인정을 통한 주간 돌봄' },
      { serviceName: '주 3회 집중 안부 및 식사 배달', frequency: '주 3회', purpose: '영양 결식 및 복약 확인' },
    ],
  },
};

// Generate fallback assessment for newly registered or undefined clients
export function getClientAssessment(client: ClientProfile): ClientAssessmentDetail {
  if (MOCK_ASSESSMENT_DETAILS[client.id]) {
    return MOCK_ASSESSMENT_DETAILS[client.id];
  }

  const isHigh = client.riskLevel.includes('고') || client.riskLevel.includes('최');
  const isMid = client.riskLevel.includes('중');

  return {
    clientId: client.id,
    assessmentDate: client.registrationDate || new Date().toISOString().slice(0, 10),
    assessorName: client.caseWorker || '이현정 사회복지사',
    adlScoreTotal: isHigh ? 13 : isMid ? 18 : 22,
    adlItems: [
      { name: '식사하기', category: '기본일상생활(ADL)', status: isHigh ? '부분도움' : '자립', note: '혼자 식사 섭취 가능 여부' },
      { name: '옷 입고 벗기', category: '기본일상생활(ADL)', status: '자립', note: '계절별 의복 착용' },
      { name: '목욕 및 위생', category: '기본일상생활(ADL)', status: isHigh ? '부분도움' : '자립', note: '욕실 안전 사용' },
      { name: '보행 및 실내이동', category: '기본일상생활(ADL)', status: isHigh ? '부분도움' : isMid ? '부분도움' : '자립', note: `${client.chronicDiseases.join(', ')} 영향` },
      { name: '화장실 이용', category: '기본일상생활(ADL)', status: '자립', note: '배설 조절 및 좌변기 사용' },
      { name: '음식 조리/식사준비', category: '수단적일상생활(IADL)', status: isHigh ? '완전도움' : isMid ? '부분도움' : '자립', note: '균형 잡힌 식단 조리' },
      { name: '복약 관리', category: '수단적일상생활(IADL)', status: isHigh ? '부분도움' : '자립', note: '처방약 정기 복용' },
      { name: '외출 및 장보기', category: '수단적일상생활(IADL)', status: isHigh ? '완전도움' : isMid ? '부분도움' : '자립', note: '실외 활동성' },
    ],
    physicalSummary: `${client.name} 어르신은 ${client.chronicDiseases.join(', ')} 등의 만성질환을 앓고 계시며, ${client.livingType} 거주 상태로 일상생활 지원 필요도가 확인됨.`,
    depressionScore: isHigh ? 11 : isMid ? 7 : 3,
    depressionLevel: isHigh ? '고위험 우울 (11~15점)' : isMid ? '우울 의심 (8~10점)' : '정상 (0~7점)',
    emotionalSummary: `${client.livingType}로 인한 사회적 고립감과 질환으로 인한 건강 염려증이 관찰됨.`,
    keyConcerns: client.chronicDiseases.slice(0, 3).concat([`${client.riskLevel} 관리 필요`]),
    housingSafetyScore: isHigh ? '위험' : isMid ? '주의' : '양호',
    housingDetails: `${client.address} 거주. 화장실 및 주방 안전 설비 보완 요망.`,
    economicStatus: `${client.welfareType} 대상자로 공적 급여 의존도 높음.`,
    workerOverallOpinion: `${client.name} 어르신의 위기도(${client.riskLevel})에 따라 적절한 맞춤형 재가노인지원서비스를 연계 제공함.`,
    recommendedServices: [
      { serviceName: '정기 안부 및 안전확인', frequency: isHigh ? '주 2회' : '주 1회', purpose: '고독사 예방 및 일상 건강 상태 모니터링' },
      { serviceName: '맞춤형 영양 밑반찬 지원', frequency: isHigh ? '주 3회' : '주 1~2회', purpose: '결식 예방 및 영양 불균형 해소' },
      { serviceName: '지역사회 자원 연계', frequency: '수시', purpose: '보건소, 병원, 복지관 등 필요 자원 연계' },
    ],
  };
}
