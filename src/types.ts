// Document Types for Senior Case Management based on Standard Guidelines (10-Step Lifecycle)
export type DocumentType =
  | 'intake'           // 1. 초기면접지
  | 'assessment'       // 2. 사정기록지 (기본·경제·주거·건강, 일반사정, 가계도·생태도, 약도, ADL/IADL, 정서·사회, SGDS 15문항)
  | 'scoring'          // 3. 대상자 선정기준표 (점수 산정 및 판정)
  | 'case_conference'  // 4. 사례회의록 (선정/제공/재사정/종결 판정회의)
  | 'service_plan'     // 5. 서비스 계획서 (기본 서비스 & 개별 서비스 제공 목표)
  | 'agreement'        // 6. 서비스 이용 안내 및 동의서 / 개인정보 제공 승낙서
  | 'monitoring'       // 7. 재가노인지원서비스 모니터링 기록지
  | 'reassessment'     // 8. 재사정 기록지
  | 'termination'      // 9. 종결보고서 및 사례평가서 (종결안내서, 종결보고서, 사례평가서)
  | 'referral';        // 10. 서비스 연계 및 의뢰서 / 회신서

export type RiskLevel = '고위험' | '중위험' | '일반';
export type LivingType = '독거노인' | '노인부부' | '조손가구' | '자녀동거' | '기타';
export type WelfareType = '기초생활수급자(생계/의료)' | '기초생활수급자(주거/교육)' | '차상위계층' | '기초연금수급자' | '일반저소득';

export interface FamilyMember {
  relation: string;
  name: string;
  address: string;
  age: string;
  job: string;
  livingTogether: boolean | string;
  notes?: string;
  phone?: string;
}

export interface MedicalRecord {
  hospitalName: string;
  disease: string;
  outpatientStatus: string;
  frequency: string;
  medicationStatus: string;
  phone: string;
}

export interface AdlIadlItem {
  id: string;
  category: string;
  name: string;
  score: '자립가능' | '약간불편' | '도와주면 가능' | '완전도움필요';
}

export interface SgdsItem {
  questionNumber: number;
  question: string;
  score: number; // 0, 1, 2
  response: '아니다' | '그런 편이다' | '그렇다';
}

export interface ClientProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: '남' | '여';
  phone: string;
  residentNumber?: string; // e.g. 451231-1******
  education?: string;      // 학력 e.g. 초졸
  religion?: string;       // 종교 e.g. 천주교, 불교, 기독교
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  address: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
  preferredVisitDay?: string;
  preferredVisitTime?: string;
  lastVisitDate?: string;
  nextScheduledVisit?: string;
  visitPriority?: '긴급' | '우선' | '일반';
  livingType: LivingType;
  welfareType: WelfareType;
  longTermCareStatus: '등급외 A' | '등급외 B' | '등급외 C' | '무등급' | '신청중' | '장기요양 등급자';
  chronicDiseases: string[];
  riskLevel: RiskLevel;
  caseWorker: string;
  registrationDate: string;
  status: '진행중' | '집중관리' | '모니터링' | '종결';
  profileImage?: string;
  familyMembers?: FamilyMember[];
  livingArrangement?: string;
  assignedWorker?: string;
  specialNotes?: string;
}

export interface DocumentAuditResult {
  score: number; // 0 to 100
  status: '적합' | '양호' | '보완필요' | '주의';
  summary: string;
  missingFields: {
    fieldName: string;
    label: string;
    severity: '필수' | '권장';
    reason: string;
    suggestedValue?: string;
  }[];
  improperExpressions: {
    original: string;
    reason: string;
    suggested: string;
    fieldName: string;
  }[];
  strengthsAnalysis: string;
  legalRiskAssessment: string;
  complianceChecklist: {
    category: string;
    item: string;
    isPassed: boolean;
    detail: string;
  }[];
}

export interface VisitRouteItem {
  clientId: string;
  clientName: string;
  address: string;
  age: number;
  gender: '남' | '여';
  riskLevel: RiskLevel;
  priority: '긴급' | '우선' | '일반';
  order: number;
  lat: number;
  lng: number;
  estimatedArrival: string;
  durationMinutes: number;
  purpose: string;
  phone: string;
  completed?: boolean;
}

export interface VisitRoutePlan {
  id: string;
  title: string;
  date: string;
  totalClients: number;
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
  totalEstimatedMinutes?: number;
  items: VisitRouteItem[];
  workerName: string;
  transportMode: '도보' | '차량' | '대중교통';
  startLocation: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

export interface RecommendedService {
  category: string;
  serviceName: string;
  frequency: string;
  purpose: string;
  provider?: string;
}

export interface CaseDocument {
  id: string;
  clientId: string;
  clientName: string;
  documentType: DocumentType;
  type?: DocumentType;
  title: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  status: '임시저장' | '작성완료' | '결재완료';
  
  // Audio transcript or raw source
  sourceTranscript?: string;
  audioDuration?: string;
  rawNotes?: string;

  // AI Analysis Results
  executiveSummary?: string[];
  riskLevel?: RiskLevel;
  riskRationale?: string;
  primaryNeeds?: string[];
  evidenceQuotes?: Record<string, string>;
  contextualAlternatives?: Record<string, string[]>;
  
  // Specific Form Fields
  physicalHealthStatus?: string;
  adlStatus?: string;
  iadlStatus?: string;
  emotionalCognitiveStatus?: string;
  housingEnvironment?: string;
  economicStatus?: string;
  socialSupportNetwork?: string;
  socialWorkerOpinion?: string;
  
  recommendedServices?: RecommendedService[];
  shortTermGoals?: string[];
  longTermGoals?: string[];
  
  // Custom form presets and scoring shortcuts
  adlScores?: any;
  iadlScores?: any;
  depressionScore?: number;
  servicePlanItems?: any[];
  
  // Sub-type specific fields matching official 10-step PDF forms
  formSpecificFields?: {
    // 1. 초기면접지
    intakeDate?: string;
    interviewer?: string;
    intervieweeType?: string;
    referrerName?: string;
    referrerRelation?: string;
    referrerPhone?: string;
    referralRoute?: string;
    eligibilityStatus?: '적격' | '부적격';
    ineligibleReason?: string;
    serviceReason?: string;
    appliedServices?: string;
    otherServiceUsage?: string;
    notesFamily?: string;
    notesLiving?: string;
    notesHealth?: string;
    intakeSummary?: string;
    intakeClientEmotion?: string;
    intakeHealthStatus?: string;
    intakeHousingSafety?: string;
    intakeCounselorOpinion?: string;

    // 2. 사정기록지 세부
    consultationMethod?: '방문' | '내방' | '전화' | '서신';
    consultationTime?: string;
    incomeEarned?: number | string;
    incomeGovSupport?: number | string;
    incomeBasicPension?: number | string;
    incomeSponsorship?: number | string;
    incomeFamilySupport?: number | string;
    housingDeposit?: number | string;
    housingMonthlyRent?: number | string;
    housingFloorType?: string;
    housingHasElevator?: boolean;
    housingCondition?: '양호' | '불량';
    housingConditionNotes?: string;
    housingHygiene?: '양호' | '불량';
    housingHygieneNotes?: string;
    heatingType?: string;
    toiletType?: string;
    mobilityStatus?: '자립가능' | '도움필요' | '완전도움필요';
    disabilityTypeGrade?: string;
    assistiveDevices?: string[];
    physicalIssues?: string[];
    mentalIssues?: string[];
    pastHistory?: string;
    presentHistory?: string;
    assessmentAppearance?: string;
    assessmentCognition?: string;
    assessmentEmotion?: string;
    assessmentBehavior?: string;
    clientPastStory?: string;
    clientPresentStory?: string;
    clientNeedsDailyLiving?: string;
    clientNeedsCommunityResource?: string;
    clientCoreProblem?: string;
    directionsAndMap?: string;
    adlScores?: Record<string, '자립가능' | '약간불편' | '도와주면 가능' | '완전도움필요'>;
    iadlScores?: Record<string, '자립가능' | '약간불편' | '도와주면 가능' | '완전도움필요'>;
    sgdsAnswers?: Record<number, number>; // 0, 1, 2
    sgdsTotalScore?: number;
    sgdsVerdict?: string;
    emotionalAnswers?: Record<string, { answer: string; reason?: string }>;
    socialAnswers?: Record<string, { answer: string; reason?: string }>;

    // 3. 대상자 선정기준표
    scoreEconomicSupport?: number; // 0, 2, 3, 5
    scoreNonWorkingFamilyBonus?: number; // 0, 1, 1.5, 2, 2.5
    scoreHousingType?: number; // 0, 1, 2, 3, 4
    scoreRentBonus?: number; // 0, 1, 1.5, 2
    scoreIncome?: number; // 0 ~ 6
    scoreNoOtherIncomeBonus?: number; // 0 or 1.5
    scoreSponsorshipDeduction?: number; // 0, -0.5, -1, -2
    scorePhysicalHealth?: number; // 1, 2, 3
    scoreEmotionalHealth?: number; // 1, 2, 3
    scoreSeverePatientBonus?: number; // 0 or 1.5
    scoreDisability?: number; // 0 ~ 6
    scoreMultiDisabilityBonus?: number; // 0 or 1.5
    scoreAdl?: number; // 1, 2, 3
    scoreCareGrade?: number; // 0 ~ 4
    scoreDiscretionary?: number; // 1 ~ 10+
    scoreDiscretionaryReason?: string;
    scoreTotal?: number;
    scoreVerdict?: '사례관리형' | '기본형' | '선정보류형';
    scoreWorkerComment?: string;

    // 4. 사례회의록
    conferenceCategory?: '선정' | '제공' | '재사정' | '종결' | '모니터링';
    conferenceDate?: string;
    conferenceInvestigator?: string;
    conferenceAttendees?: string;
    conferenceTopic?: string;
    conferenceDiscussion?: string;
    conferenceDecision?: string;
    conferenceDecisionReason?: string;
    conferenceDecisionStatus?: '제공' | '종결' | '유지';
    conferenceStartDate?: string;
    conferenceEndDate?: string;
    conferenceServicesProvided?: string[];

    // 5. 서비스 계획서
    servicePlanDate?: string;
    problemAndNeeds?: string;
    solutionAndGoals?: string;
    basicServiceGoals?: Array<{
      category: string;
      serviceName: string;
      subGoal: string;
      method: string;
      frequency: string;
      staff: string;
    }>;
    individualServiceGoals?: Array<{
      category: string;
      serviceName: string;
      subGoal: string;
      method: string;
      frequency: string;
      staff: string;
    }>;
    servicePeriod?: string;
    serviceNotes?: string;

    // 6. 서비스 이용 동의서 & 개인정보 승낙서
    agreementDate?: string;
    clientSignerName?: string;
    clientResidentNumber?: string;
    clientAddress?: string;
    hasAgreedToServiceTerms?: boolean;
    hasAgreedToPrivacyCollection?: boolean;
    hasAgreedToPrivacyThirdParty?: boolean;

    // 7. 모니터링 및 상담 기록지
    monitoringDate?: string;
    monitoringNumber?: string;
    monitoringType?: '최초' | '정기';
    monitoringMethod?: '방문' | '유선' | '내방';
    monitoringSummary?: string; // 모니터링 요약 (상담 요약)
    counselingPurpose?: string; // 상담 목적 (AI 서식 자동 완성 매핑 대상 필드)
    counselingContent?: string; // 상담 내용 (AI 서식 자동 완성 매핑 대상 필드)
    counselingMethod?: string; // 상담 방법 (방문상담 / 전화상담 등)
    counselingCategory?: string; // 상담 구분 (정기상담 / 초기상담 / 위기상담 등)
    counselingNextPlan?: string; // 상담 후 조치 계획
    aiAutoFilledFields?: string[]; // AI 서식 자동 완성으로 채워진 필드 목록
    aiAutoFilledTimestamp?: string; // 자동 완성 일시
    monitoringSatisfactionScores?: {
      halfYearSatisfaction?: string;
      scheduleAdherence?: string;
      serviceGuideAccuracy?: string;
      lifeHelpEffectiveness?: string;
      workerSatisfaction?: string;
      [key: string]: any;
    } | Record<string, number | string>;
    monitoringNeedChanges?: string;
    monitoringEnvironmentChanges?: string;
    monitoringComplaints?: string;
    monitoringPlanResult?: '서비스 유지' | '서비스 계획 변경' | '재 방문 면담';
    monitoringDetailedNotes?: string;
    monitoringChange?: string;
    monitoringActionTaken?: string;

    // 8. 재사정 기록지
    reassessmentDate?: string;
    reassessmentType?: '새로운 욕구가 발생' | '긴급한 상황이 발생' | '기타';
    reassessmentFactor?: '재가노인에 의한 요인' | '기관과 사회복지사에 의한 요인' | '자원과 환경에 의한 요인';
    reassessmentClientNeedChange?: string;
    reassessmentServiceProblem?: string;
    reassessmentWorkerOpinion?: string;
    reassessmentResult?: '종결' | '서비스 재계획' | '의뢰' | '현 상태 유지';
    reassessmentFuturePlan?: string;

    // 9. 종결보고서 및 사례평가서
    terminationDate?: string;
    terminationNoticeDate?: string;
    terminationNoticeReason?: string;
    terminationReason?: string;
    terminationType?: '클라이언트에 의한 종결' | '기관 및 사회복지사에 의한 종결';
    terminationClientReason?: '사망' | '시설입소' | '이주' | '목표달성' | '타 기관 이용' | '거절이나 포기' | '상황호전' | '약속불이행' | '기타';
    terminationAgencyReason?: '기관의 업무조정' | '기관·법인의 교체' | '기관의 자원·능력의 한계' | '원칙변경' | '기관의 사례기한 제한' | '기타';
    terminationInitialState?: string;
    terminationFinalState?: string;
    terminationWorkerOpinion?: string;
    evaluationOutreachScore?: string;
    evaluationAssessmentScore?: string;
    evaluationPlanScore?: string;
    evaluationServiceScore?: string;
    evaluationReassessmentScore?: string;
    evaluationClientSatisfactionScore?: string;
    evaluationPositiveImpact?: string;
    evaluationNegativeImpact?: string;
    evaluationChangedNeeds?: string;
    evaluationFinalVerdict?: '계속지원' | '종결';

    // 10. 서비스 연계 및 의뢰서 / 회신서
    referralTargetAgency?: string;
    referralSenderAgency?: string;
    referralReason?: string;
    referralRequests?: {
      dailyLiving?: string;
      housing?: string;
      emotional?: string;
      resourceDev?: string;
    };
    referralReplyDate?: string;
    referralReplySupportDecision?: string;
    referralReplyStartDate?: string;
    referralReplyScore?: number | string;
    [key: string]: any;
  };
}

export interface AIAnalysisResponse {
  executiveSummary: string[];
  riskLevel: string;
  riskRationale: string;
  clientName?: string;
  estimatedAge?: string;
  gender?: string;
  livingType?: string;
  primaryNeeds: string[];
  physicalHealthStatus?: string;
  adlStatus?: string;
  iadlStatus?: string;
  emotionalCognitiveStatus?: string;
  housingEnvironment?: string;
  economicStatus?: string;
  socialSupportNetwork?: string;
  socialWorkerOpinion: string;
  recommendedServices: RecommendedService[];
  shortTermGoals?: string[];
  longTermGoals?: string[];
  evidenceQuotes?: Record<string, string>; // 실제 상담 대화록에서 발화된 근거 구절 인용
  contextualAlternatives?: Record<string, string[]>; // 해당 내담자 고유 맥락에 맞춘 대안 문구 추천
  formSpecificFields?: {
    // 공통 및 상담일지
    counselingPurpose?: string;
    counselingContent?: string;
    counselingMethod?: string;
    counselingCategory?: string;
    counselingNextPlan?: string;
    // 초기면접지
    intakeSummary?: string;
    intakeClientEmotion?: string;
    intakeHealthStatus?: string;
    intakeHousingSafety?: string;
    intakeCounselorOpinion?: string;
    // 종합사정기록지
    assessmentNeeds?: string;
    assessmentAdlSummary?: string;
    assessmentEmotional?: string;
    assessmentEnvironment?: string;
    assessmentOverallPlan?: string;
    // 서비스제공계획서
    problemAndNeeds?: string;
    longTermGoal?: string;
    shortTermGoal?: string;
    servicePlanManagerOpinion?: string;
    // 사례회의 및 모니터링/종결
    conferenceTopic?: string;
    conferenceDiscussion?: string;
    conferenceDecision?: string;
    monitoringChange?: string;
    monitoringActionTaken?: string;
    terminationReason?: string;
    goalAchievementRate?: string;
    followUpPlan?: string;
    [key: string]: any;
  };
}

export interface PresetScenario {
  id: string;
  title: string;
  category: string;
  recommendedDocType: DocumentType;
  description: string;
  clientName: string;
  age: number;
  gender: '남' | '여';
  transcriptText: string;
  workerNotes: string;
}

export interface SyncHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  docCount: number;
  clientCount: number;
  fileSize: string;
  fileName: string;
  folderName: string;
  message: string;
  triggerType: 'scheduled' | 'manual' | 'auto_save';
  errorDetails?: {
    code?: string;
    reason?: string;
    endpoint?: string;
    suggestedFix?: string;
    rawResponse?: string;
    details?: string;
  };
}

export interface UserSettings {
  institutionName: string;
  agencyName?: string; // alias for institutionName
  institutionRegistrationNumber?: string;
  workerName: string;
  socialWorkerName?: string; // alias for workerName
  workerPosition: string;
  contactPhone: string;
  contactEmail: string;
  institutionAddress: string;
  approvalStepsCount: 2 | 3 | 4;
  approvalStepTitles: string[];
  sealText: string;
  driveFolderName: string;
  autoBackupToDrive: boolean;
  dashboardPanelOrder: string[];
  
  // Auto Sync Cloud Scheduler Settings
  autoSyncEnabled?: boolean;
  autoSyncTime?: string; // e.g., "18:00"
  autoSyncInterval?: 'daily' | 'hourly' | 'every_6_hours';
  pushNotificationEnabled?: boolean;
  lastAutoSyncTime?: string;
  lastAutoSyncStatus?: 'success' | 'failed' | 'idle';
}


export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
}

export interface ConsultationInsight {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  riskLevel: RiskLevel;
  threeLineSummary: [string, string, string]; // 1. 신체/건강, 2. 정서/욕구, 3. 즉시 조치
  keyIssues: string[];
  recommendedService: string;
  isUrgent?: boolean;
}
