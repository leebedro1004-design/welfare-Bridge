import { DocumentType, RiskLevel, CaseDocument } from '../types';

export type ConditionPresetId = 'standard' | 'mild_care' | 'high_risk' | 'unclassified_barrier' | 'urgent_crisis';

export interface ConditionPreset {
  id: ConditionPresetId;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  targetClientDesc: string;
  keyProblems: string[];
  recommendedServices: Array<{
    category: string;
    serviceName: string;
    frequency: string;
    purpose: string;
    provider: string;
  }>;
  shortTermGoals: string[];
  longTermGoals: string[];
  riskLevel: RiskLevel;
  adlDefaultScores?: Record<string, '자립가능' | '약간불편' | '도와주면 가능' | '완전도움필요'>;
  iadlDefaultScores?: Record<string, '자립가능' | '약간불편' | '도와주면 가능' | '완전도움필요'>;
  sgdsDefaultScore?: number;
  economicStatusTemplate: string;
  physicalHealthTemplate: string;
  housingEnvironmentTemplate: string;
  emotionalCognitiveTemplate: string;
  socialSupportTemplate: string;
  workerOpinionTemplate: string;
}

export const CONDITION_PRESETS: Record<ConditionPresetId, ConditionPreset> = {
  standard: {
    id: 'standard',
    name: '일반 관리형 (표준 독거노인 정기 안부·영양관리)',
    badge: '일반형',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    description: '기본적인 일상생활 자립이 가능하나 독거로 인한 결식 우려 및 사회적 고립 예방이 필요한 어르신',
    targetClientDesc: '독거노인, 기초연금 수급자, 경미한 만성질환(고혈압 등), 사회적 관계망 협소',
    riskLevel: '일반',
    keyProblems: [
      '불규칙한 식습관으로 인한 가벼운 영양 불균형 우려',
      '외부 활동 감소에 따른 완만한 고립감 및 외로움',
      '계절별 안전(폭염/한파) 점검 필요',
    ],
    recommendedServices: [
      {
        category: '식사지원',
        serviceName: '정기 밑반찬 지원',
        frequency: '주 2회',
        purpose: '균형 잡힌 영양 공급 및 규칙적 식습관 유지',
        provider: '재가노인지원서비스센터',
      },
      {
        category: '안전·안부',
        serviceName: '유선 및 방문 안부확인',
        frequency: '주 2회',
        purpose: '위기상황 조기발견 및 정서적 지지',
        provider: '전담 생활지원사 / 사회복지사',
      },
      {
        category: '여가·정서',
        serviceName: '계절 나들이 및 생신 잔치',
        frequency: '분기 1회',
        purpose: '지역사회 교류 증진 및 자존감 향상',
        provider: '복지관 연계',
      },
    ],
    shortTermGoals: [
      '주 2회 밑반찬 수령을 통해 결식 없이 규칙적인 3식을 유지한다.',
      '주 1회 이상 복지사 안부전화에 응답하여 건강 상태를 공유한다.',
    ],
    longTermGoals: [
      '지역사회 내에서 건강하고 독립적인 일상생활을 안정적으로 영위한다.',
      '이웃 관계망을 형성하여 고립감을 해소한다.',
    ],
    economicStatusTemplate: '기초연금 및 자녀 비정기 소액 용돈으로 생활. 생계 유지에 큰 결손은 없으나 의료비 지출 시 부담 호소.',
    physicalHealthTemplate: '고혈압 약을 규칙적으로 복용 중이며, 계단 이용 시 가벼운 무릎 통증 외 전반적인 신체 거동 양호함.',
    housingEnvironmentTemplate: '일반 연립주택 2층 거주. 실내 채광 및 환기 양호하나 현관 입구 단차에 주의 필요.',
    emotionalCognitiveTemplate: '지남력 정상. TV 시청 위주로 시간을 보내며 홀로 있는 시간이 길어 다소 쓸쓸함을 표현하나 대화 시 밝게 응대함.',
    socialSupportTemplate: '인근에 거주하는 자녀가 월 1회 방문하며, 이웃 주민과 가벼운 인사 나누는 수준임.',
    workerOpinionTemplate: '전반적인 자립 능력이 양호한 독거 어르신으로, 예방적 차원의 밑반찬 지원과 정기 안부확인을 통해 일상생활 기능 저하를 방지하고 건강한 노후를 유지하도록 지원함.',
  },

  mild_care: {
    id: 'mild_care',
    name: '경증·초기 돌봄형 (만성질환·병원동행·가사지원 필요)',
    badge: '경증돌봄',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    description: '퇴행성 관절염, 당뇨합병증 등으로 병원 이동 및 가사활동에 부분적 도움이 필요한 어르신',
    targetClientDesc: '만성 복합질환자, 지팡이/보행기 사용, 정기 외래 진료 동행 및 복약 지도 필요',
    riskLevel: '중위험',
    keyProblems: [
      '하지 관절 통증으로 대중교통 이용 및 병원 외래 방문의 어려움',
      '복합 질환으로 인한 다약제 복용 및 복약 오남용 위험',
      '무거운 짐 들기, 침구 세탁 등 고강도 가사활동 수행 제한',
    ],
    recommendedServices: [
      {
        category: '보건·의료',
        serviceName: '병원 동행 및 복약 모니터링',
        frequency: '월 2회 (진료일)',
        purpose: '외래 진료 및 정확한 처방약 복용 확인',
        provider: '동행자원봉사단 / 보건소 방문간호',
      },
      {
        category: '일상가사',
        serviceName: '대형 세탁물 및 주거 대청소',
        frequency: '월 1회',
        purpose: '위생적 주거환경 유지 및 신체 부담 경감',
        provider: '재가노인지원센터 깔끄미봉사단',
      },
      {
        category: '신체건강',
        serviceName: '관절염 통증 완화 파스/보호대 지원',
        frequency: '격월 1회',
        purpose: '통증 완화 및 보행 안정성 확보',
        provider: '후원물품 연계',
      },
    ],
    shortTermGoals: [
      '정기 병원 외래 진료를 누락 없이 100% 수검한다.',
      '약 달력을 활용하여 매일 정해진 시간에 정확히 약을 복용한다.',
    ],
    longTermGoals: [
      '만성질환의 급격한 악화를 예방하고 자택 내 자립 생활 기간을 최대화한다.',
      '보행 보조기를 안전하게 사용하여 실외 낙상 위험을 방지한다.',
    ],
    economicStatusTemplate: '차상위 본인부담경감 대상자로 병원비 감면 혜택을 받고 있으나 비급여 파스 및 영양제 구매 부담.',
    physicalHealthTemplate: '양측 무릎 퇴행성 관절염 및 당뇨 복용 중. 보행 시 실버카(보행기)를 사용하며 장거리 보행 시 호흡곤란 호소.',
    housingEnvironmentTemplate: '단독주택 1층 거주. 화장실 바닥이 다소 미끄러우며, 침대 없이 바닥 매트 생활로 일어설 때 지지대 필요.',
    emotionalCognitiveTemplate: '통증으로 인한 야간 수면장애를 간헐적으로 호소하나 인지기능 및 의사소통은 명확함.',
    socialSupportTemplate: '자녀들과 연락이 소원하며, 같은 동네 노인정 친구 1~2명과 가끔 통화함.',
    workerOpinionTemplate: '만성질환 관리와 병원 동행 지원이 핵심인 대상자로, 보건소 방문간호 및 정기 동행 서비스를 연계하여 신체기능 잔존을 도모함.',
  },

  high_risk: {
    id: 'high_risk',
    name: '고위험·위기 개입형 (낙상 위험·극심한 우울/고립·결식 위기)',
    badge: '고위험 집중',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    description: '최근 낙상 사고 경험, 심각한 우울 척도, 식사 결식 등으로 긴급한 안전망 개입이 필요한 어르신',
    targetClientDesc: '낙상 고위험군, SGDS 11점 이상 고우울군, 주거 위험 노출, 결식 빈번 가구',
    riskLevel: '고위험',
    keyProblems: [
      '최근 화장실 내 미끄럼 낙상으로 인한 골반 통증 및 2차 낙상 공포증',
      '배우자 사별 후 식욕 전폐 및 주 3회 이상 결식 발생',
      'SGDS 우울척도 13점의 고우울 상태로 대인기피 및 무기력감 심화',
      '화장실 안전손잡이 부재, 높은 문턱 등 주거 내 치명적 위험요소',
    ],
    recommendedServices: [
      {
        category: '주거안전',
        serviceName: '낙상예방 안전손잡이 및 미끄럼방지매트 긴급시공',
        frequency: '즉시 (1회)',
        purpose: '2차 낙상사고 방지 및 실내 이동 안전성 확보',
        provider: '주거환경개선사업단',
      },
      {
        category: '식사지원',
        serviceName: '집중 영양죽 및 밑반찬 긴급 제공',
        frequency: '주 4회',
        purpose: '결식 해결 및 체력 회복',
        provider: '재가노인지원센터 / 무료급식 연계',
      },
      {
        category: '정서·상담',
        serviceName: '마음안심 전문 심리상담 및 주 3회 집중 방문',
        frequency: '주 3회',
        purpose: '우울감 완화 및 자살위기 예방 모니터링',
        provider: '정신건강복지센터 연계 / 전담사회복지사',
      },
      {
        category: '응급안전',
        serviceName: '독거노인 응급안전안심서비스 댁내장비 설치',
        frequency: '상시가동',
        purpose: '화재, 가스누출 및 119 응급호출 안전망 구축',
        provider: '응급안전안심센터',
      },
    ],
    shortTermGoals: [
      '화장실 안전손잡이를 설치하여 낙상 공포 없이 안전하게 용변 및 세면을 수행한다.',
      '주 4회 영양식을 섭취하여 체중 감소를 방지하고 결식을 0건으로 낮춘다.',
      '사회복지사 및 상담원과의 신뢰 관계를 통해 감정을 표출한다.',
    ],
    longTermGoals: [
      '우울 척도를 8점 이하(경증)로 안정화하고 일상생활 의욕을 회복한다.',
      '촘촘한 민관 안전망을 구축하여 재가 내 안심 생활을 보장한다.',
    ],
    economicStatusTemplate: '기초생활수급자(생계·의료). 급여의 상당 부분이 병원비 및 체납된 도시가스 요금으로 지출되어 영양 식재료 구매 불가.',
    physicalHealthTemplate: '낙상 후유증으로 좌측 하지 지탱 곤란. 기립 시 어지럼증과 통증을 호소하여 침상 외 이동을 극도로 꺼림.',
    housingEnvironmentTemplate: '반지하 노후 주택으로 습기 및 곰팡이 심각. 화장실 단차가 15cm로 높고 바닥 타일이 매우 미끄러움.',
    emotionalCognitiveTemplate: '배우자 사별 6개월 차로 "살아서 뭐하나"라는 절망감을 자주 표현하며 눈물을 흘림. 수면제를 복용해야만 2~3시간 수면.',
    socialSupportTemplate: '자녀 연락 두절 상태이며 친인척 지지체계 전무. 이웃과의 교류도 일체 거부하고 있음.',
    workerOpinionTemplate: '낙상 위험, 결식 위기, 고우울증이 복합적으로 중첩된 최고위험 사례로 즉각적인 위기개입(주거개선+영양지원+응급안전연계+정신건강상담)을 즉시 가동하고 주 3회 집중 방문 사후관리를 실시함.',
  },

  unclassified_barrier: {
    id: 'unclassified_barrier',
    name: '장기요양 등급외 / 사각지대 특화형 (등급외 A/B, 경도인지장애)',
    badge: '등급외 특화',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    description: '노인장기요양보험 등급 판정에서 탈락(등급외 A/B/C)하여 공적 장기요양 혜택을 받지 못하는 돌봄 사각지대 어르신',
    targetClientDesc: '등급외 A/B, 초기 인지저하(경도인지장애), 복지용구 구매 제한, 주간보호 미이용 어르신',
    riskLevel: '중위험',
    keyProblems: [
      '장기요양 등급 탈락으로 인한 공적 요양보호사 파견 서비스 중단 및 돌봄 공백',
      '최근 약속 날짜 혼동 및 가스불 끄는 것을 잊어버리는 경도 인지저하 증상',
      '복지용구(성인용 보행기, 목욕의자) 공단 급여 미지원에 따른 경제적 부담',
    ],
    recommendedServices: [
      {
        category: '인지강화',
        serviceName: '두뇌활력 인지재활 학습지 및 퍼즐 지원',
        frequency: '주 1회',
        purpose: '인지기능 유지 및 치매 진행 지연',
        provider: '치매안심센터 연계',
      },
      {
        category: '안전관리',
        serviceName: '가스안전 타이머콕 무료 보급 및 점검',
        frequency: '즉시 (1회)',
        purpose: '가스 과열 화재사고 사전 차단',
        provider: '한국가스안전공사 연계',
      },
      {
        category: '돌봄연계',
        serviceName: '재가노인지원서비스 맞춤 돌봄패키지',
        frequency: '주 2회',
        purpose: '등급외자 대상 가사·정서·자원 연계 통합 지원',
        provider: '재가노인지원서비스센터',
      },
    ],
    shortTermGoals: [
      '가스 타이머콕을 설치하여 주방 화재 위험을 완벽히 제거한다.',
      '치매안심센터 치매 조기검진(CIST)을 수검하고 맞춤형 인지프로그램에 등록한다.',
    ],
    longTermGoals: [
      '장기요양 등급 재신청 시기를 모니터링하여 적기에 등급 진입을 조력한다.',
      '지역사회 돌봄 사각지대에서 방치되지 않고 안전한 보호체계를 유지한다.',
    ],
    economicStatusTemplate: '기초생활수급자(주거). 공적 요양 서비스 본인부담금을 낼 여력이 없어 등급외자 전용 무료 재가복지 의존.',
    physicalHealthTemplate: '신체적 거동은 부분 자립 가능하나, 냄비 태움 및 복약 시간 중복 등 인지적 판단력 저하가 관찰됨.',
    housingEnvironmentTemplate: '노후 아파트 3층(승강기 있음). 가스레인지 사용 시 환기가 미흡하여 타이머콕 차단 장치 설치 필수.',
    emotionalCognitiveTemplate: '최근 기억력 감퇴에 대한 두려움과 불안을 호소하며, 등급 탈락에 따른 실망감을 느낌.',
    socialSupportTemplate: '타 지역 거주 조카가 간헐적으로 전화 통화하나 직접적인 수발은 불가능한 상태.',
    workerOpinionTemplate: '장기요양 등급 탈락으로 인해 돌봄 사각지대에 놓인 어르신으로, 치매안심센터 정밀검진 연계 및 가스안전장치 설치를 선행하고 향후 상태 변화에 따른 등급 재신청을 지속 모니터링함.',
  },

  urgent_crisis: {
    id: 'urgent_crisis',
    name: '긴급 위기대응형 (학대/방임 의심·단전·단수·단기구호)',
    badge: '긴급위기',
    badgeColor: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-200 border-red-400 font-bold',
    description: '갑작스러운 주거 퇴거 위기, 단전/단수, 부양의무자 방임 의심 등 즉각적인 긴급구호가 필요한 어르신',
    targetClientDesc: '공과금 장기체납, 단전/단수 가구, 방임·방치 의심, 주거 불안정',
    riskLevel: '고위험',
    keyProblems: [
      '전기 및 수도 요금 장기 체납으로 인한 단전·단수 위기',
      '냉난방 불가 및 비위생적 방치 상태로 생명·건강 직결 위협',
      '긴급 생계비 및 긴급 주거안정 자금 전무',
    ],
    recommendedServices: [
      {
        category: '긴급복지',
        serviceName: '지자체 긴급복지지원(생계비/의료비/연료비) 긴급신청',
        frequency: '즉시 신청',
        purpose: '단전/단수 해소 및 긴급 생계비 확보',
        provider: '주민센터 맞춤형복지팀',
      },
      {
        category: '물품구호',
        serviceName: '긴급 식료품 키트 및 위생용품 즉시 전달',
        frequency: '당일 지원',
        purpose: '당일 식사 및 기초 위생 해결',
        provider: '푸드뱅크 / 재가센터 긴급구호금',
      },
      {
        category: '권익옹호',
        serviceName: '노인보호전문기관 연계 및 권익 상담',
        frequency: '필요시',
        purpose: '방임/학대 정밀 사정 및 신변 안전 확보',
        provider: '지역 노인보호전문기관',
      },
    ],
    shortTermGoals: [
      '긴급복지 신청을 통해 3일 이내 단전/단수 위기를 해결한다.',
      '긴급 식료품을 당일 전달하여 결식 상태를 즉각 해소한다.',
    ],
    longTermGoals: [
      '기초생활보장 수급권 책정을 통해 지속 가능한 공적 소득보장 체계로 편입시킨다.',
      '안전하고 위생적인 주거로 이전하거나 주거 환경을 전면 개선한다.',
    ],
    economicStatusTemplate: '소득 전무 상태로 월세 및 공과금 6개월 이상 체납. 당장 식료품을 구매할 현금이 0원인 극빈 상태.',
    physicalHealthTemplate: '장기간의 결식 및 비위생적 환경으로 영양실조 및 탈수 증세 의심. 기력 쇠진.',
    housingEnvironmentTemplate: '전기 공급 중단 위기로 촛불 사용 중(화재 위험 극심). 수도 공급 불안정 및 쓰레기 적치.',
    emotionalCognitiveTemplate: '극도의 불안과 수치심으로 초기 면담 시 문을 열어주지 않는 등 방어적 태도.',
    socialSupportTemplate: '모든 가족 관계 단절. 주민등록 말소 위기 및 사회적 고립 극대화.',
    workerOpinionTemplate: '생존을 위협받는 초고위험 긴급 사례로, 즉각 행정복지센터 긴급복지지원 연계 및 당일 긴급구호 식료품을 전달하고 집중 사례관리로 전환하여 위기를 수습함.',
  },
};
