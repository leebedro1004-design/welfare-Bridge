export interface ConsultationQuestion {
  id: string;
  stageId: string;
  question: string;
  category: '라포' | '신체·ADL' | '정서·우울' | '주거안전' | '경제·자원';
  rationale: string;
  suggestedFollowUp?: string;
  relatedAssessmentField?: string;
}

export interface ConsultationStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  questions: ConsultationQuestion[];
}

export const CONSULTATION_STAGES: ConsultationStage[] = [
  {
    id: 'stage_1_rapport',
    stageNumber: 1,
    title: '초기 탐색 및 라포 형성',
    subtitle: '편안한 환영 인사와 하루 일과 생활패턴 파악',
    badge: '1단계: 라포형성',
    color: 'amber',
    questions: [
      {
        id: 'q1_1',
        stageId: 'stage_1_rapport',
        category: '라포',
        question: '어르신, 오늘 아침 식사는 따뜻하게 챙겨 드셨어요? 요즘 밤에 잠은 잘 오시나요?',
        rationale: '가장 일상적이고 부담 없는 대화로 긴장을 완화하고 수면/식사 기본 패턴을 확인합니다.',
        suggestedFollowUp: '잠을 잘 못 주무신다면 통증 때문인지, 잡생각/불안 때문인지 여쭙기',
        relatedAssessmentField: 'physicalHealthStatus',
      },
      {
        id: 'q1_2',
        stageId: 'stage_1_rapport',
        category: '라포',
        question: '요즘 댁에 계실 때 하루 일과는 주로 어떻게 보내시는지 편하게 들려주세요.',
        rationale: 'TV 시청, 복지관 방문, 경로당 등 활동 반경과 생활 리듬을 사정합니다.',
        suggestedFollowUp: '하루 중 가장 힘든 시간대나 지루한 시간대가 언제인지 파악',
        relatedAssessmentField: 'iadlStatus',
      },
      {
        id: 'q1_3',
        stageId: 'stage_1_rapport',
        category: '라포',
        question: '저희 재가노인지원서비스센터에서 방문 드린 목적을 들으셨을 때 어떤 도움이 가장 먼저 떠오르셨나요?',
        rationale: '어르신 본인이 체감하는 주관적 우선 욕구와 기관에 대한 기대를 확인합니다.',
        suggestedFollowUp: '원하시는 도움을 메모하고 사례관리 계획에 반영 약속하기',
        relatedAssessmentField: 'primaryNeeds',
      },
    ],
  },
  {
    id: 'stage_2_adl',
    stageNumber: 2,
    title: '신체건강 & 일상생활(ADL) 점검',
    subtitle: '거동, 식사준비, 복약상태, 만성질환 통증',
    badge: '2단계: 신체·ADL',
    color: 'emerald',
    questions: [
      {
        id: 'q2_1',
        stageId: 'stage_2_adl',
        category: '신체·ADL',
        question: '혼자서 국이나 반찬을 만들어 드실 때 가스불 켜기나 무거운 냄비 들기가 힘들지 않으신가요?',
        rationale: 'I-ADL(취사/영양) 자립도 및 밑반찬 배달 서비스 적격성을 판단합니다.',
        suggestedFollowUp: '일주일에 몇 끼 정도 직접 요리하시는지, 거른 적이 있는지 확인',
        relatedAssessmentField: 'adlStatus',
      },
      {
        id: 'q2_2',
        stageId: 'stage_2_adl',
        category: '신체·ADL',
        question: '병원에서 처방받아 드시는 혈압약이나 당뇨약, 관절약은 매일 제시간에 잘 챙겨 드시고 계신가요?',
        rationale: '만성질환 복약 순응도 및 약 달력 지원/보건소 방문간호 연계 필요성을 사정합니다.',
        suggestedFollowUp: '약 봉투를 함께 확인하며 깜빡 잊고 거르는 빈도 체크',
        relatedAssessmentField: 'physicalHealthStatus',
      },
      {
        id: 'q2_3',
        stageId: 'stage_2_adl',
        category: '신체·ADL',
        question: '방에서 일어서시거나 화장실 가실 때 어지럽거나 다리에 힘이 풀려 주저앉으신 적이 있으신가요?',
        rationale: '낙상 고위험군 조기 식별 및 보행보조기(실버카)/안전바 지원 필요성을 파악합니다.',
        suggestedFollowUp: '최근 6개월 이내 넘어진 경험(낙상 횟수) 정밀 질문',
        relatedAssessmentField: 'mobilityStatus',
      },
      {
        id: 'q2_4',
        stageId: 'stage_2_adl',
        category: '신체·ADL',
        question: '정기적으로 병원 외래 진료 가실 때 혼자서 버스나 지하철을 타고 다녀오실 수 있으신가요?',
        rationale: '병원 동행 봉사단 연계 및 이동 지원 서비스 필요 여부를 결정합니다.',
        suggestedFollowUp: '외래 병원 위치와 진료 주기(월 1회/격월) 확인',
        relatedAssessmentField: 'iadlStatus',
      },
    ],
  },
  {
    id: 'stage_3_emotional',
    stageNumber: 3,
    title: '정서심리 & 사회적 고립도 (우울척도)',
    subtitle: '외로움, SGDS 우울문항, 지지체계 및 가족교류',
    badge: '3단계: 정서·고립',
    color: 'teal',
    questions: [
      {
        id: 'q3_1',
        stageId: 'stage_3_emotional',
        category: '정서·우울',
        question: '홀로 계실 때 문득 마음이 울적하거나 세상에 나 혼자 남겨진 것 같아 쓸쓸하실 때가 자주 있으신가요?',
        rationale: 'SGDS 한국형 노인우울척도와 연계하여 사회심리적 고립감의 깊이를 측정합니다.',
        suggestedFollowUp: '울적할 때 어떻게 마음을 달래시는지 대처기제 파악',
        relatedAssessmentField: 'emotionalCognitiveStatus',
      },
      {
        id: 'q3_2',
        stageId: 'stage_3_emotional',
        category: '정서·우울',
        question: '자녀분들이나 가까운 친척, 혹은 이웃 주민들과는 일주일에 몇 번 정도 전화나 왕래를 하시나요?',
        rationale: '비공식 사회적 지지망(가족/이웃) 유무 및 단절 상태를 확인합니다.',
        suggestedFollowUp: '가장 의지하거나 위급할 때 연락할 수 있는 분의 연락처 확보',
        relatedAssessmentField: 'socialSupportNetwork',
      },
      {
        id: 'q3_3',
        stageId: 'stage_3_emotional',
        category: '정서·우울',
        question: '최근에 기억력이 예전 같지 않아서 약속 날짜나 물건 둔 곳을 자주 잊어버려 당황하신 적이 있으신가요?',
        rationale: '경도인지장애(MCI) 및 치매 조기검진 연계 필요성을 자연스럽게 탐색합니다.',
        suggestedFollowUp: '치매안심센터 무료 선별검사 안내 제안',
        relatedAssessmentField: 'emotionalCognitiveStatus',
      },
    ],
  },
  {
    id: 'stage_4_housing',
    stageNumber: 4,
    title: '주거위생 & 낙상·화재 안전 환경',
    subtitle: '문턱, 화장실 미끄럼, 가스안전, 난방상태',
    badge: '4단계: 주거안전',
    color: 'rose',
    questions: [
      {
        id: 'q4_1',
        stageId: 'stage_4_housing',
        category: '주거안전',
        question: '화장실 바닥이 젖어있을 때 미끄러질까 봐 무섭거나 벽을 짚고 겨우 다니시지는 않나요?',
        rationale: '화장실 벽면 안전손잡이 및 미끄럼방지 패드 긴급 시공 필요성을 진단합니다.',
        suggestedFollowUp: '현장에서 화장실 타일 상태와 문턱 높이 직접 확인',
        relatedAssessmentField: 'housingEnvironment',
      },
      {
        id: 'q4_2',
        stageId: 'stage_4_housing',
        category: '주거안전',
        question: '가스레인지에 냄비를 올려두고 깜빡 잊어 냄비를 태우거나 연기가 난 적이 있으신가요?',
        rationale: '가스안전 타이머콕 무료 설치 및 화재감지기 연계 우선순위를 책정합니다.',
        suggestedFollowUp: '한국가스안전공사 연계 타이머콕 설치 접수 안내',
        relatedAssessmentField: 'housingEnvironment',
      },
      {
        id: 'q4_3',
        stageId: 'stage_4_housing',
        category: '주거안전',
        question: '겨울철 난방비(가스비/전기요금)가 부담스러워 보일러를 끄고 냉방에서 주무신 적이 있으신가요?',
        rationale: '에너지 취약계층 동절기 난방유/난방용품 및 에너지바우처 연계 필요성을 점검합니다.',
        suggestedFollowUp: '온수 매트, 방한 텐트, 난방비 긴급지원 연계 검토',
        relatedAssessmentField: 'housingEnvironment',
      },
    ],
  },
  {
    id: 'stage_5_resources',
    stageNumber: 5,
    title: '경제상태 & 공적자원·긴급복지 연계',
    subtitle: '수급권 변동, 병원비 부담, 장기요양 등급 신청',
    badge: '5단계: 공적연계',
    color: 'purple',
    questions: [
      {
        id: 'q5_1',
        stageId: 'stage_5_resources',
        category: '경제·자원',
        question: '현재 기초연금이나 수급비로 매달 월세, 공과금, 병원비를 내고 나면 생활비가 빠듯하지 않으신가요?',
        rationale: '기초생활수급 신청 가능 여부, 차상위 본인부담경감, 긴급생계비 연계를 검토합니다.',
        suggestedFollowUp: '임대차계약서 및 최근 공과금 고지서 확인',
        relatedAssessmentField: 'economicStatus',
      },
      {
        id: 'q5_2',
        stageId: 'stage_5_resources',
        category: '경제·자원',
        question: '국민건강보험공단 노인장기요양보험 등급을 신청해 보신 적이 있으신가요?',
        rationale: '등급외 A/B 판정자 여부 및 등급 신청 대행/재신청 시점을 판단합니다.',
        suggestedFollowUp: '등급 결과 통보서 유무 확인 및 등급 신청 서류 작성 지원',
        relatedAssessmentField: 'longTermCareStatus',
      },
      {
        id: 'q5_3',
        stageId: 'stage_5_resources',
        category: '경제·자원',
        question: '어르신, 오늘 상담 드린 내용 중 저희 센터가 이번 주에 당장 해결해 드렸으면 하는 가장 시급한 한 가지는 무엇일까요?',
        rationale: '클라이언트의 자기결정권을 존중하며 즉각적인 단기 목표를 확정합니다.',
        suggestedFollowUp: '결정된 1순위 서비스의 제공 일정과 담당자를 명확히 안내',
        relatedAssessmentField: 'shortTermGoals',
      },
    ],
  },
];
