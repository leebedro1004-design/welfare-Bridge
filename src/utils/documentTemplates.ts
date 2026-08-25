import { DocumentType, CaseDocument, ClientProfile, AIAnalysisResponse } from '../types';

export interface DocumentTypeMeta {
  step: number;
  label: string;
  short: string;
  badgeColor: string;
  description: string;
  pdfPages: string;
  category: '접수/사정' | '선정/계획' | '실행/점검' | '종결/연계';
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, DocumentTypeMeta> = {
  intake: {
    step: 1,
    label: '1. 초기면접지 (Intake)',
    short: '초기면접지',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    description: '기본사항, 가족사항, 생활·신체상태, 타서비스이용, 적격여부 및 신청서비스',
    pdfPages: 'Page 1',
    category: '접수/사정',
  },
  assessment: {
    step: 2,
    label: '2. 사정기록지 (Assessment)',
    short: '사정기록지',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    description: '기본/경제/주거/건강, 일반사정, 가계도·생태도, 약도, ADL·IADL, 정서·사회, SGDS 우울척도',
    pdfPages: 'Page 2~8',
    category: '접수/사정',
  },
  scoring: {
    step: 3,
    label: '3. 대상자 선정기준표 (Scoring)',
    short: '선정기준표',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    description: '경제기능(수급/주택/소득), 건강기능(신체/정서/장애/ADL/요양), 재량점수 및 총점 판정',
    pdfPages: 'Page 9',
    category: '선정/계획',
  },
  case_conference: {
    step: 4,
    label: '4. 사례회의록 (Conference)',
    short: '사례회의록',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    description: '서비스 [선정/제공/재사정/종결] 판정회의 내용 및 8대 영역별 서비스 제공결정',
    pdfPages: 'Page 10~11, 18~19, 25',
    category: '선정/계획',
  },
  service_plan: {
    step: 5,
    label: '5. 서비스 계획서 (Service Plan)',
    short: '서비스계획서',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    description: '대상자 문제·욕구 및 해결목표, 기본 서비스(16종) & 개별 서비스(16종) 제공목표',
    pdfPages: 'Page 12~13',
    category: '선정/계획',
  },
  agreement: {
    step: 6,
    label: '6. 서비스 이용 동의서 & 승낙서',
    short: '이용동의서',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
    description: '서비스 종류 안내, 조정 및 중단 기준, 서비스 이용 동의서, 개인정보 제공·활용 승낙서',
    pdfPages: 'Page 14~15',
    category: '선정/계획',
  },
  monitoring: {
    step: 7,
    label: '7. 모니터링 기록지 (Monitoring)',
    short: '모니터링기록',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    description: '이용자 만족도 5문항 5점척도 조사, 욕구변화 모니터링, 종합 서비스 유지/변경 계획',
    pdfPages: 'Page 16',
    category: '실행/점검',
  },
  reassessment: {
    step: 8,
    label: '8. 재사정 기록지 (Re-assessment)',
    short: '재사정기록지',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
    description: '재사정 유형/요인(욕구발생/자원환경변화), 클라이언트 변화욕구, worker 의견 및 재계획',
    pdfPages: 'Page 17',
    category: '실행/점검',
  },
  termination: {
    step: 9,
    label: '9. 종결보고서 및 사례평가서',
    short: '종결/평가서',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    description: '서비스 종결 안내서, 사례관리 종결보고서(초기vs종결 대비), 5단계 목표달성 사례평가서',
    pdfPages: 'Page 20~22',
    category: '종결/연계',
  },
  referral: {
    step: 10,
    label: '10. 서비스 연계·의뢰서 & 회신서',
    short: '연계·의뢰서',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    description: '타 기관 이관 및 서비스 연계·의뢰서, 의뢰에 대한 접수·지원결정 회신서',
    pdfPages: 'Page 23~24',
    category: '종결/연계',
  },
};

export const ORDERED_DOC_TYPES: DocumentType[] = [
  'intake',
  'assessment',
  'scoring',
  'case_conference',
  'service_plan',
  'agreement',
  'monitoring',
  'reassessment',
  'termination',
  'referral',
];

export function createEmptyDocument(docType: DocumentType, client?: ClientProfile): CaseDocument {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const clientName = client?.name || '홍길동';

  return {
    id: `doc-${Date.now()}`,
    clientId: client?.id || '',
    clientName: clientName,
    documentType: docType,
    title: `${clientName} 어르신 ${DOCUMENT_TYPE_LABELS[docType].short} (${dateStr})`,
    createdAt: `${dateStr} ${timeStr}`,
    updatedAt: `${dateStr} ${timeStr}`,
    author: client?.caseWorker || '이상호 사회복지사',
    status: '임시저장',
    riskLevel: client?.riskLevel || '중위험',
    primaryNeeds: client ? ['일상생활 식사지원', '만성질환 안부확인', '정서적 지지'] : [],
    shortTermGoals: ['결식 예방 및 균형 잡힌 영양 공급', '주 1회 이상 정서적 말벗 및 안부확인'],
    longTermGoals: ['지역사회 내 안전한 잔존기능 유지 및 자립 생활 지속'],
    recommendedServices: [
      { category: '일상생활지원', serviceName: '밑반찬배달서비스', frequency: '주 2회', purpose: '결식예방 및 영양개선', provider: '재가노인지원센터' },
      { category: '정서지원', serviceName: '안부확인 및 말벗상담', frequency: '주 1회', purpose: '고립감 완화 및 정서안정', provider: '사회복지사' },
    ],
    formSpecificFields: {
      // 1. 초기면접지
      intakeDate: dateStr,
      interviewer: client?.caseWorker || '이상호 사회복지사',
      eligibilityStatus: '적격',
      serviceReason: '부양자의 부양능력 약화 및 고령으로 인한 만성질환 거동불편',
      appliedServices: '일상생활지원(밑반찬, 김장, 생신), 정서적지원(심리지지), 보건의료지원',
      notesFamily: '자녀들과의 교류가 소원하고 자녀들의 부양능력 또한 부족함',
      notesLiving: '월세 다세대주택 2층에 홀로 거주 중이며 계단 이용에 주의 필요',
      notesHealth: '고혈압 및 관절염 약물 복용 중이며 우울감과 외로움 호소',

      // 2. 사정기록지
      consultationMethod: '방문',
      consultationTime: '14:00 ~ 15:00',
      incomeEarned: 150000,
      incomeGovSupport: 270000,
      incomeBasicPension: 250000,
      incomeSponsorship: 20000,
      incomeFamilySupport: 100000,
      housingDeposit: 10000000,
      housingMonthlyRent: 150000,
      housingFloorType: '2층이상',
      housingHasElevator: false,
      housingCondition: '불량',
      housingConditionNotes: '도배 및 장판 노후화, 싱크대 수리 필요',
      housingHygiene: '양호',
      heatingType: '가스보일러',
      toiletType: '단독 / 서양식',
      mobilityStatus: '도움필요',
      disabilityTypeGrade: '지체장애 3급',
      assistiveDevices: ['지팡이'],
      physicalIssues: ['시각', '수면'],
      mentalIssues: ['우울증'],
      pastHistory: '과거 관절 수술 및 위궤양 치료 이력 있음',
      presentHistory: '고혈압 및 퇴행성 관절염 약 복용 중',
      assessmentAppearance: '백발에 체구는 작으시며, 안색은 다소 창백하나 단정한 인상',
      assessmentCognition: '무학이나 시간/장소 지남력 명확하고 의사소통 원활함',
      assessmentEmotion: '배우자 사별 후 독거로 인한 공허감 및 경미한 우울감 표출',
      assessmentBehavior: '보행 시 지팡이를 의지하여 조심스럽게 이동하며 협조적 태도',
      clientPastStory: '젊은 시절 시장에서 노점상을 하며 자녀들을 양육하였으나 현재는 교류 감소',
      clientPresentStory: '홀로 지내며 끼니를 거르는 경우가 많고 무릎 통증으로 외출 제한',
      clientNeedsDailyLiving: '정기적인 밑반찬 지원 및 가사지원 서비스 희망',
      clientNeedsCommunityResource: '보청기 및 안과 검진 연계 필요',
      clientCoreProblem: '식생활 불균형, 만성 통증으로 인한 활동량 감소 및 사회적 고립',
      directionsAndMap: `${client?.address || '대구광역시 달서구 대명천로 38-1, 2층'} (골목 진입 후 왼쪽 첫 번째 대문)`,
      sgdsAnswers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 0, 9: 1, 10: 0, 11: 1, 12: 0, 13: 2, 14: 1, 15: 1 },
      sgdsTotalScore: 14,
      sgdsVerdict: '보통수준 (정상범위 경계선, 정기적인 정서관리 권장)',

      // 3. 대상자 선정기준표
      scoreEconomicSupport: 5,
      scoreNonWorkingFamilyBonus: 0,
      scoreHousingType: 4,
      scoreRentBonus: 1,
      scoreIncome: 5,
      scoreNoOtherIncomeBonus: 0,
      scoreSponsorshipDeduction: 0,
      scorePhysicalHealth: 2,
      scoreEmotionalHealth: 2,
      scoreSeverePatientBonus: 0,
      scoreDisability: 4,
      scoreMultiDisabilityBonus: 0,
      scoreAdl: 2,
      scoreCareGrade: 0,
      scoreDiscretionary: 6,
      scoreDiscretionaryReason: '만성질환과 독거로 인한 결식위험 및 우울예방 다중서비스 필요',
      scoreTotal: 29,
      scoreVerdict: '사례관리형',
      scoreWorkerComment: '경제적 취약성과 질환, 독거로 인한 고립위험이 높아 재가노인사례관리 대상자로 적합함',

      // 4. 사례회의록
      conferenceCategory: '선정',
      conferenceDate: dateStr,
      conferenceInvestigator: '이상호 사회복지사',
      conferenceAttendees: '장성태 센터장, 이상호 주임, 정명훈 사회복지사 (총 3명)',
      conferenceTopic: `${clientName} 어르신 신규 사례관리 대상자 선정 및 개입계획 심의`,
      conferenceDiscussion: '대상자의 식생활 불균형과 거동 불편을 고려할 때 주 2회 밑반찬과 정기 안부확인이 시급함',
      conferenceDecision: '재가노인사례관리 대상자(사례관리형) 선정 가결 및 즉시 서비스 개입 개시',
      conferenceDecisionStatus: '제공',
      conferenceStartDate: dateStr,

      // 5. 서비스 계획서
      servicePlanDate: dateStr,
      problemAndNeeds: '기초수급자 독거노인으로서 관절염과 우울감으로 인한 결식 및 일상생활 어려움',
      solutionAndGoals: '밑반찬 배달과 안부확인, 주거환경개선 연계를 통해 영양상태 개선 및 안전 확보',
      servicePeriod: `${dateStr} ~ 서비스 종결 시까지`,
      serviceNotes: '재가노인지원서비스 연 24회 이상 제공 필수 (물질지원 12회, 정서·기타 12회)',

      // 6. 동의서
      agreementDate: dateStr,
      clientSignerName: clientName,
      clientResidentNumber: client?.residentNumber || '451231-1******',
      clientAddress: client?.address || '대구광역시 달서구 상인동 비둘기아파트 205동 1515호',
      hasAgreedToServiceTerms: true,
      hasAgreedToPrivacyCollection: true,
      hasAgreedToPrivacyThirdParty: true,

      // 7. 모니터링
      monitoringDate: dateStr,
      monitoringNumber: '19-01',
      monitoringType: '정기',
      monitoringMethod: '방문',
      monitoringSatisfactionScores: {
        halfYearSatisfaction: '매우 만족',
        scheduleAdherence: '매우 만족',
        serviceGuideAccuracy: '매우 만족',
        lifeHelpEffectiveness: '매우 만족',
        workerSatisfaction: '매우 만족',
      },
      monitoringNeedChanges: '현재 제공 중인 밑반찬 외에 여름철 방충망 보수 및 선풍기 지원 희망',
      monitoringEnvironmentChanges: '무릎 통증은 다소 지속되나 영양상태 호전되고 표정이 밝아짐',
      monitoringPlanResult: '서비스 유지',

      // 8. 재사정
      reassessmentDate: dateStr,
      reassessmentType: '새로운 욕구가 발생',
      reassessmentFactor: '자원과 환경에 의한 요인',
      reassessmentClientNeedChange: '장기요양 등급탈락에 따라 재가노인지원서비스를 통한 가사지원 및 병원동행 수요 지속',
      reassessmentWorkerOpinion: '민간 자원봉사센터와 연계하여 주 1회 가사지원 및 병원동행 서비스 연계 필요',
      reassessmentResult: '서비스 재계획',
      reassessmentFuturePlan: '노인맞춤돌봄서비스 연계 및 결연 자원봉사자 지속 파견',

      // 9. 종결 및 평가
      terminationDate: dateStr,
      terminationNoticeDate: dateStr,
      terminationType: '클라이언트에 의한 종결',
      terminationClientReason: '목표달성',
      terminationInitialState: '초기 심한 우울감과 식생활 불균형으로 자립생활 위기 상태',
      terminationFinalState: '정기 서비스 개입을 통해 영양상태 회복 및 지역사회 경로당 활동 재개',
      terminationWorkerOpinion: '주요 목표를 달성하였으며 지역사회 돌봄 안전망으로 원활히 이관함',
      evaluationPositiveImpact: '규칙적 식사로 기력 호전, 말벗 활동으로 우울증 완화 및 자존감 회복',
      evaluationNegativeImpact: '기관 서비스에 대한 일시적 의존도 상승 (상담을 통해 자립 격려)',
      evaluationFinalVerdict: '종결',

      // 10. 연계 및 의뢰
      referralTargetAgency: '성당노인복지센터 재가노인지원사업팀',
      referralSenderAgency: '(사)굿실버복지회 굿실버노인복지센터',
      referralReason: '어르신 거주지 이전(달서구 상인동 → 성당동)에 따른 서비스 관할 이관 의뢰',
      referralRequests: {
        dailyLiving: '밑반찬배달 주 2회, 김장·절기서비스 지속',
        housing: '연 1회 방역 및 안전손잡이 점검',
        emotional: '주 1회 안부확인 및 심리지지서비스',
        resourceDev: '정기 후원물품 및 후원금 결연 연계',
      },
      referralReplyDate: dateStr,
      referralReplySupportDecision: '적격 (재가노인지원서비스 대상자 선정 및 2019.07.21부터 개입 예정)',
    },
  };
}

export function mapAiResponseToDocument(
  docType: DocumentType,
  aiData: AIAnalysisResponse,
  client?: ClientProfile,
  transcriptText?: string,
  rawNotes?: string
): CaseDocument {
  const blank = createEmptyDocument(docType, client);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);
  const clientName = client?.name || aiData.clientName || '어르신';

  return {
    ...blank,
    id: `doc-${Date.now()}`,
    clientId: client?.id || `client-${Date.now()}`,
    clientName: clientName,
    documentType: docType,
    title: `${clientName} 어르신 ${DOCUMENT_TYPE_LABELS[docType].short} (${dateStr})`,
    createdAt: `${dateStr} ${timeStr}`,
    updatedAt: `${dateStr} ${timeStr}`,
    author: client?.caseWorker || '이상호 사회복지사',
    status: '작성완료',
    sourceTranscript: transcriptText,
    rawNotes: rawNotes,
    executiveSummary: aiData.executiveSummary || [],
    riskLevel: (aiData.riskLevel as any) || '중위험',
    riskRationale: aiData.riskRationale || '',
    primaryNeeds: aiData.primaryNeeds || blank.primaryNeeds,
    physicalHealthStatus: aiData.physicalHealthStatus || blank.physicalHealthStatus,
    adlStatus: aiData.adlStatus || blank.adlStatus,
    iadlStatus: aiData.iadlStatus || blank.iadlStatus,
    emotionalCognitiveStatus: aiData.emotionalCognitiveStatus || blank.emotionalCognitiveStatus,
    housingEnvironment: aiData.housingEnvironment || blank.housingEnvironment,
    economicStatus: aiData.economicStatus || blank.economicStatus,
    socialSupportNetwork: aiData.socialSupportNetwork || blank.socialSupportNetwork,
    socialWorkerOpinion: aiData.socialWorkerOpinion || blank.socialWorkerOpinion,
    recommendedServices: aiData.recommendedServices?.length ? aiData.recommendedServices : blank.recommendedServices,
    shortTermGoals: aiData.shortTermGoals?.length ? aiData.shortTermGoals : blank.shortTermGoals,
    longTermGoals: aiData.longTermGoals?.length ? aiData.longTermGoals : blank.longTermGoals,
    formSpecificFields: {
      ...blank.formSpecificFields,
      conferenceTopic: aiData.formSpecificFields?.conferenceTopic || blank.formSpecificFields?.conferenceTopic,
      conferenceDiscussion: aiData.formSpecificFields?.conferenceDiscussion || blank.formSpecificFields?.conferenceDiscussion,
      conferenceDecision: aiData.formSpecificFields?.conferenceDecision || blank.formSpecificFields?.conferenceDecision,
      monitoringChange: aiData.formSpecificFields?.monitoringChange || blank.formSpecificFields?.monitoringChange,
      monitoringActionTaken: aiData.formSpecificFields?.monitoringActionTaken || blank.formSpecificFields?.monitoringActionTaken,
      terminationReason: aiData.formSpecificFields?.terminationReason || blank.formSpecificFields?.terminationReason,
      notesHealth: aiData.physicalHealthStatus || blank.formSpecificFields?.notesHealth,
      notesLiving: aiData.housingEnvironment || blank.formSpecificFields?.notesLiving,
      problemAndNeeds: aiData.primaryNeeds?.join(', ') || blank.formSpecificFields?.problemAndNeeds,
      solutionAndGoals: aiData.shortTermGoals?.join(', ') || blank.formSpecificFields?.solutionAndGoals,
    },
  };
}

