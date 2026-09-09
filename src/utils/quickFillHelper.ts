import { CaseDocument, ClientProfile, ConsultationInsight, DocumentType, UserSettings } from '../types';
import { INITIAL_CONSULTATION_INSIGHTS } from '../data/mockData';
import {
  getEffectiveAgencyName,
  getEffectiveWorkerFullName,
  getEffectiveWorkerName,
  getEffectiveContactPhone,
} from './userSettingsHelper';

export interface QuickFillPreviewField {
  key: string;
  label: string;
  category: '기본 인적사항' | '신체 및 건강' | '주거 및 환경' | '상담 및 욕구' | '사회복지사 소견' | '서비스 계획';
  source: 'client_profile' | 'consultation_insight' | 'composite';
  previewValue: string;
}

export interface QuickFillResult {
  updatedDoc: CaseDocument;
  filledFieldCount: number;
  filledFields: QuickFillPreviewField[];
  sourceInsight: ConsultationInsight;
}

/**
 * Retrieve the most recent consultation insight for a client.
 * Fallbacks to initial insights or generates a realistic clinical insight based on client profile.
 */
export function getLatestConsultationInsight(
  clientId: string,
  client?: ClientProfile,
  customInsights?: ConsultationInsight[]
): ConsultationInsight {
  // 1. Check custom insights passed from live state
  if (customInsights && customInsights.length > 0) {
    const matching = customInsights.find((i) => i.clientId === clientId);
    if (matching) return matching;
  }

  // 2. Check localStorage for live saved insights
  try {
    const saved = localStorage.getItem('senior_care_live_insights');
    if (saved) {
      const parsed: ConsultationInsight[] = JSON.parse(saved);
      const matching = parsed.find((i) => i.clientId === clientId);
      if (matching) return matching;
    }
  } catch (e) {
    console.error('Failed to parse senior_care_live_insights:', e);
  }

  // 3. Check INITIAL_CONSULTATION_INSIGHTS
  const mockMatch = INITIAL_CONSULTATION_INSIGHTS.find((i) => i.clientId === clientId);
  if (mockMatch) return mockMatch;

  // 4. Fallback: generate a tailored insight based on the client profile
  const nowStr = new Date().toISOString().slice(0, 10);
  const clientName = client?.name || '대상 어르신';
  const diseasesStr = client?.chronicDiseases && client.chronicDiseases.length > 0
    ? client.chronicDiseases.join(', ')
    : '만성 퇴행성 질환';
  const livingTypeStr = client?.livingType || '독거노인';
  const risk = client?.riskLevel || '중위험';

  return {
    id: `insight-auto-${clientId || 'def'}`,
    clientId: clientId || 'client-default',
    clientName: clientName,
    timestamp: `${nowStr} 14:00`,
    riskLevel: risk,
    threeLineSummary: [
      `1. 신체/건강: ${diseasesStr} 투약 중이며, ${risk === '고위험' ? '낙상 위험 및 보행 불안정 호소' : '일상생활 잔존기능 점검 필요'}.`,
      `2. 정서/욕구: ${livingTypeStr} 가구로 식사 준비 및 결식 우려, 정기적인 안부확인 및 말벗 지원 욕구.`,
      `3. 즉시 조치: 주 2회 맞춤 밑반찬 배달 연계, 실내 낙상 예방 주거점검 및 긴급안심망 편성.`,
    ],
    keyIssues: ['만성질환/복약', '식사/영양결식', '안전/낙상예방'],
    recommendedService: '맞춤형 영양 밑반찬 지원 + 정기 유선/방문 안부확인',
    isUrgent: risk === '고위험',
  };
}

/**
 * Clean 3-line summary text prefix
 */
function cleanSummaryPrefix(text?: string): string {
  if (!text) return '';
  return text.replace(/^[0-9]\.\s*[^:]+:\s*/, '').trim();
}

/**
 * Build list of preview fields that will be filled for the current document
 */
export function getQuickFillPreviewFields(
  doc: CaseDocument,
  client: ClientProfile,
  insight: ConsultationInsight,
  userSettings?: UserSettings
): QuickFillPreviewField[] {
  const fields: QuickFillPreviewField[] = [];
  const effectiveWorker = getEffectiveWorkerFullName(userSettings, client.caseWorker || '이현정 사회복지사');
  const effectiveAgency = getEffectiveAgencyName(userSettings, '도봉재가노인지원서비스센터');

  // Common Fields across all legal forms
  fields.push({
    key: 'clientName',
    label: '대상자 성명',
    category: '기본 인적사항',
    source: 'client_profile',
    previewValue: client.name,
  });

  fields.push({
    key: 'riskLevel',
    label: '위기도 등급',
    category: '기본 인적사항',
    source: 'consultation_insight',
    previewValue: `${insight.riskLevel} (상담 판정)`,
  });

  fields.push({
    key: 'physicalHealthStatus',
    label: '신체·건강 상태',
    category: '신체 및 건강',
    source: 'composite',
    previewValue: `${client.chronicDiseases.join(', ')} / ${cleanSummaryPrefix(insight.threeLineSummary[0])}`,
  });

  fields.push({
    key: 'emotionalCognitiveStatus',
    label: '정서·인지 상태',
    category: '신체 및 건강',
    source: 'composite',
    previewValue: `${client.livingType} / ${cleanSummaryPrefix(insight.threeLineSummary[1])}`,
  });

  fields.push({
    key: 'housingEnvironment',
    label: '주거환경 및 안전',
    category: '주거 및 환경',
    source: 'composite',
    previewValue: `${client.address} (실내 안전점검 및 낙상예방 필요)`,
  });

  fields.push({
    key: 'socialWorkerOpinion',
    label: '사회복지사 종합소견',
    category: '사회복지사 소견',
    source: 'composite',
    previewValue: `${client.name} 어르신(${client.age}세, ${client.welfareType}) 상담 분석: ${cleanSummaryPrefix(insight.threeLineSummary[2])}`,
  });

  fields.push({
    key: 'primaryNeeds',
    label: '핵심 욕구 및 당면 과제',
    category: '상담 및 욕구',
    source: 'consultation_insight',
    previewValue: insight.keyIssues.join(', '),
  });

  fields.push({
    key: 'recommendedServices',
    label: '추천 서비스 및 지원 연계',
    category: '서비스 계획',
    source: 'consultation_insight',
    previewValue: insight.recommendedService,
  });

  // Form-Specific Previews
  switch (doc.documentType) {
    case 'intake':
      fields.push({
        key: 'interviewer',
        label: '면접 담당자',
        category: '기본 인적사항',
        source: 'client_profile',
        previewValue: effectiveWorker,
      });
      fields.push({
        key: 'chronicDiseasesText',
        label: '주요 질환명',
        category: '신체 및 건강',
        source: 'client_profile',
        previewValue: client.chronicDiseases.join(', '),
      });
      fields.push({
        key: 'serviceReason',
        label: '서비스 신청 사유',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: cleanSummaryPrefix(insight.threeLineSummary[1]),
      });
      fields.push({
        key: 'appliedServices',
        label: '신청 희망 서비스',
        category: '서비스 계획',
        source: 'consultation_insight',
        previewValue: insight.recommendedService,
      });
      fields.push({
        key: 'intakeSummary',
        label: '상담 요약 (3줄)',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: insight.threeLineSummary.join(' | '),
      });
      break;

    case 'assessment':
      fields.push({
        key: 'clientPresentStory',
        label: '현재 생활사 및 호소내용',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: `${cleanSummaryPrefix(insight.threeLineSummary[0])} ${cleanSummaryPrefix(insight.threeLineSummary[1])}`,
      });
      fields.push({
        key: 'assessmentEmotion',
        label: '정서 상태 관찰 소견',
        category: '신체 및 건강',
        source: 'consultation_insight',
        previewValue: cleanSummaryPrefix(insight.threeLineSummary[1]),
      });
      break;

    case 'scoring':
      fields.push({
        key: 'scoreWorkerComment',
        label: '선정 사유 종합 코멘트',
        category: '사회복지사 소견',
        source: 'composite',
        previewValue: `${client.welfareType} 독거노인으로 ${insight.keyIssues.join(', ')} 개입 필요`,
      });
      break;

    case 'case_conference':
      fields.push({
        key: 'conferenceTopic',
        label: '회의 주제',
        category: '상담 및 욕구',
        source: 'composite',
        previewValue: `${client.name} 어르신 재가노인지원서비스 적격 심의 및 맞춤 개입`,
      });
      fields.push({
        key: 'conferenceAgenda',
        label: '회의 안건',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: `신규 위기 어르신 지원: ${insight.keyIssues.join(', ')}`,
      });
      fields.push({
        key: 'conferenceDiscussion',
        label: '회의 내용 및 토론',
        category: '사회복지사 소견',
        source: 'consultation_insight',
        previewValue: `상담 결과 ${cleanSummaryPrefix(insight.threeLineSummary[0])} 확인되어 ${insight.recommendedService} 필요성 검토`,
      });
      break;

    case 'service_plan':
      fields.push({
        key: 'problemAndNeeds',
        label: '문제 및 욕구',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: `${client.welfareType} ${client.livingType} 가구로 ${insight.keyIssues.join(', ')} 지원 필요`,
      });
      fields.push({
        key: 'shortTermGoal',
        label: '단기 목표',
        category: '서비스 계획',
        source: 'consultation_insight',
        previewValue: `1. ${insight.recommendedService} 연계 / 2. 정기 안부확인 / 3. 주거안전 확보`,
      });
      break;

    case 'agreement':
      fields.push({
        key: 'applicantSign',
        label: '신청인 서명란',
        category: '기본 인적사항',
        source: 'client_profile',
        previewValue: `${client.name} (서명/인)`,
      });
      break;

    case 'monitoring':
      fields.push({
        key: 'counselingPurpose',
        label: '상담 및 모니터링 목적',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: `${insight.keyIssues.join(', ')} 점검 및 ${insight.recommendedService} 연계 확인`,
      });
      fields.push({
        key: 'counselingContent',
        label: '상담 및 모니터링 기록',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: insight.threeLineSummary.join('\n'),
      });
      fields.push({
        key: 'counselingNextPlan',
        label: '차회 개입 및 조치 계획',
        category: '서비스 계획',
        source: 'consultation_insight',
        previewValue: `${insight.recommendedService} 모니터링 및 정기 안부 일정 수립`,
      });
      break;

    case 'reassessment':
      fields.push({
        key: 'reassessmentClientNeedChange',
        label: '클라이언트 변화 및 신규 욕구',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: cleanSummaryPrefix(insight.threeLineSummary[0]),
      });
      fields.push({
        key: 'reassessmentWorkerOpinion',
        label: '사회복지사 평가 및 개입방향',
        category: '사회복지사 소견',
        source: 'consultation_insight',
        previewValue: `${insight.recommendedService} 보충 편성 및 위기도 지속 모니터링`,
      });
      break;

    case 'termination':
      fields.push({
        key: 'terminationNoticeDetail',
        label: '종결 및 조치 상세',
        category: '사회복지사 소견',
        source: 'consultation_insight',
        previewValue: `${client.name} 어르신 지원 성과 및 차회 연계 계획`,
      });
      break;

    case 'referral':
      fields.push({
        key: 'referralReason',
        label: '연계 및 의뢰 사유',
        category: '상담 및 욕구',
        source: 'consultation_insight',
        previewValue: `${client.name} 어르신 ${insight.keyIssues.join(', ')} 문제 해결을 위해 ${insight.recommendedService} 연계 요청`,
      });
      break;
  }

  return fields;
}

/**
 * Apply Quick-Fill to the document, pre-populating both top-level and form-specific fields.
 */
export function applyQuickFillToDocument(
  doc: CaseDocument,
  client: ClientProfile,
  insight: ConsultationInsight,
  userSettings?: UserSettings
): QuickFillResult {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);
  const effectiveWorker = getEffectiveWorkerFullName(userSettings, client.caseWorker || '이현정 사회복지사');
  const effectiveAgency = getEffectiveAgencyName(userSettings, '도봉재가노인지원서비스센터');
  const effectivePhone = getEffectiveContactPhone(userSettings, '02-901-8900');

  const previewFields = getQuickFillPreviewFields(doc, client, insight, userSettings);

  const cleanHealthSummary = cleanSummaryPrefix(insight.threeLineSummary[0]);
  const cleanEmotionalSummary = cleanSummaryPrefix(insight.threeLineSummary[1]);
  const cleanActionSummary = cleanSummaryPrefix(insight.threeLineSummary[2]);

  // Deep clone doc
  const updatedDoc: CaseDocument = JSON.parse(JSON.stringify(doc));

  // 1. Top-level Document Fields
  updatedDoc.clientId = client.id;
  updatedDoc.clientName = client.name;
  updatedDoc.riskLevel = insight.riskLevel || client.riskLevel;
  updatedDoc.author = effectiveWorker;
  updatedDoc.updatedAt = `${dateStr} ${timeStr}`;

  // Physical Health Status
  updatedDoc.physicalHealthStatus = `${client.chronicDiseases.join(', ')} 투약 관리 중. ${cleanHealthSummary}`;

  // Emotional & Cognitive Status
  updatedDoc.emotionalCognitiveStatus = `${client.livingType} 거주 상태이며, ${cleanEmotionalSummary}`;

  // Housing Environment
  updatedDoc.housingEnvironment = `${client.address} 거주. 실내 보행 및 낙상 예방 안전 점검 요망.`;

  // Social Worker Synthesized Opinion
  updatedDoc.socialWorkerOpinion = `${client.name} 어르신(${client.age}세, ${client.livingType}, ${client.welfareType})은 만성질환(${client.chronicDiseases.slice(0, 2).join(', ')}) 및 신체기능 저하로 일상생활 위기도가 확인됨. 최근 면담 결과 ${cleanActionSummary || '선제적 복지서비스 연계'} 조치가 시급하며, ${insight.recommendedService || '영양식 지원 및 정기 안부 모니터링'}을 통한 맞춤형 사례관리 개입이 필요함.`;

  // Primary Needs
  updatedDoc.primaryNeeds = Array.from(
    new Set([...insight.keyIssues, '일상생활 식사지원', '정서적 안부확인'])
  );

  // Short Term Goals
  updatedDoc.shortTermGoals = [
    `1개월 내 ${insight.recommendedService || '밑반찬 배달'}을 통한 규칙적 영양 섭취 및 결식률 0% 유지`,
    `2주 내 실내 낙상 위험 요소 점검 및 주 1회 정기 방문/유선 안부확인망 구축`,
  ];

  // Long Term Goals
  updatedDoc.longTermGoals = [
    '지역사회 내 신체 잔존기능 유지 및 시설 입소 예방을 통한 안정적 재가 자립생활 지속',
  ];

  // Recommended Services
  updatedDoc.recommendedServices = [
    {
      category: '일상생활지원',
      serviceName: insight.recommendedService || '영양 밑반찬 배달서비스',
      frequency: insight.riskLevel === '고위험' ? '주 2~3회' : '주 1~2회',
      purpose: '결식 예방 및 균형 잡힌 영양 공급',
      provider: effectiveAgency,
    },
    {
      category: '정서지원',
      serviceName: '정기 안부확인 및 말벗상담',
      frequency: '주 1회',
      purpose: '사회적 고립감 완화 및 안전 확인',
      provider: effectiveWorker,
    },
    {
      category: '주거안전지원',
      serviceName: '실내 낙상예방 안전점검 및 환경개선',
      frequency: '월 1회',
      purpose: '가정 내 미끄럼 사고 방지 및 안전한 주거환경 유지',
      provider: '지역사회 연계',
    },
  ];

  // 2. Form-Specific Fields
  if (!updatedDoc.formSpecificFields) {
    updatedDoc.formSpecificFields = {};
  }
  const spec = updatedDoc.formSpecificFields;

  // Track Quick-Fill metadata
  spec.isQuickFilled = true;
  spec.quickFillTimestamp = `${dateStr} ${timeStr}`;
  spec.quickFillSource = {
    clientName: client.name,
    clientId: client.id,
    insightId: insight.id,
    timestamp: insight.timestamp,
  };
  spec.aiAutoFilledTimestamp = `${dateStr} ${timeStr}`;
  spec.aiAutoFilledFields = previewFields.map((f) => f.key);

  // Populate per DocumentType
  switch (updatedDoc.documentType) {
    case 'intake':
      spec.intakeDate = spec.intakeDate || dateStr;
      spec.interviewDate = spec.interviewDate || dateStr;
      spec.interviewer = effectiveWorker;
      spec.gender = client.gender;
      spec.age = `${client.age}세`;
      spec.birthDate = client.birthDate;
      spec.address = client.address;
      spec.phone = client.phone;
      spec.economicStatus = client.welfareType.includes('기초생활수급')
        ? '국민기초생활수급권자'
        : client.welfareType.includes('차상위')
        ? '차상위계층'
        : '일반 저소득';
      spec.householdType = client.livingType.includes('독거') ? '독거' : '노인부부';
      spec.housingType = spec.housingType || '월세';
      spec.buildingType = spec.buildingType || '빌라/다세대주택';
      spec.healthStatus = client.riskLevel === '고위험' ? '질환으로 건강이 나쁘다' : '질환은 있지만 건강한 편이다';
      spec.chronicDiseasesText = client.chronicDiseases.join(', ');
      spec.careGrade = client.longTermCareStatus || '등급없음 (일반/등급외)';
      spec.serviceReason = cleanEmotionalSummary || '만성질환 및 독거로 인한 일상생활 자립 지원 필요';
      spec.appliedServices = insight.recommendedService || '일상생활지원(밑반찬), 정서지원(안부확인), 주거안전';
      spec.eligibilityStatus = '적격';
      spec.eligibilityReasons = [
        '만성질환 독거노인 돌봄 필요',
        '부양자의 부양능력 약화',
        '긴급구호/위기지원',
      ];
      spec.intakeSummary = insight.threeLineSummary.join('\n');
      spec.intakeClientEmotion = cleanEmotionalSummary || '외로움 및 정서적 위축';
      spec.intakeHealthStatus = `${client.chronicDiseases.join(', ')}. ${cleanHealthSummary}`;
      spec.intakeHousingSafety = `${client.address}. 실내 낙상 예방 및 안전 손잡이 점검 필요.`;
      spec.intakeCounselorOpinion = updatedDoc.socialWorkerOpinion;

      // Emergency Contact mapping
      if (client.emergencyContact) {
        spec.referrerName = `${client.emergencyContact.name} (${client.emergencyContact.relation})`;
        spec.referrerRelation = client.emergencyContact.relation;
        spec.referrerPhone = client.emergencyContact.phone;
        spec.familyList = [
          {
            relation: client.emergencyContact.relation || '보호자',
            name: client.emergencyContact.name,
            address: '타지역 거주',
            age: '50대',
            job: '회사원/자영업',
            livingWith: '비동거',
            note: `비상연락망 (${client.emergencyContact.phone})`,
          },
        ];
      }
      break;

    case 'assessment':
      spec.assessmentDate = spec.assessmentDate || dateStr;
      spec.economicStatus = client.welfareType.includes('기초생활수급') ? '기초생활수급자' : '차상위계층';
      spec.healthPhysicalMentalNotes = `[신체] ${client.chronicDiseases.join(', ')} / [정신] ${cleanEmotionalSummary}`;
      spec.assessmentAppearance = `${client.age}세 고령으로 체구가 다소 왜소하시나 단정한 인상 유지.`;
      spec.assessmentCognition = '시간/장소 지남력 비교적 양호하며 일상 소통 원활함.';
      spec.assessmentEmotion = cleanEmotionalSummary || '적적함 및 정서적 위축';
      spec.assessmentBehavior = `${client.chronicDiseases[0] || '관절염'}으로 거동 시 지팡이에 의지하며 협조적임.`;
      spec.clientPresentStory = `${insight.threeLineSummary[0]} ${insight.threeLineSummary[1]}`;
      spec.clientPastStory = '가족 부양 후 배우자 사별 및 자녀 독립으로 오랜 기간 독거 생활 지속 중.';
      break;

    case 'scoring':
      spec.scoreEconomicSupport = client.welfareType.includes('기초생활수급') ? 5 : 3;
      spec.scoreHousingType = 4;
      spec.scoreRentBonus = 1;
      spec.scoreIncome = client.welfareType.includes('기초생활수급') ? 5 : 4;
      spec.scorePhysicalHealth = client.riskLevel === '고위험' ? 3 : 2;
      spec.scoreEmotionalHealth = client.riskLevel === '고위험' ? 3 : 2;
      spec.scoreDisability = 3;
      spec.scoreAdl = client.riskLevel === '고위험' ? 3 : 2;
      spec.scoreCareGrade = 0; // 등급외
      spec.scoreDiscretionary = 6;
      spec.scoreWorkerComment = `선정 사유: ${client.welfareType} 독거노인으로 만성질환(${client.chronicDiseases.join(', ')}) 및 최근 상담 결과(${insight.keyIssues.join(', ')})에 따른 긴급 지원 필요. 종합 판정 결과 재가노인지원서비스 [사례관리형] 대상자로 최종 적격 판정함.`;
      break;

    case 'case_conference':
      spec.conferenceDate = spec.conferenceDate || dateStr;
      spec.conferenceType = '선정회의';
      spec.conferenceTopic = `${client.name} 어르신 재가노인지원서비스 선정 및 맞춤형 위기개입 심의`;
      spec.conferenceAgenda = `• 안건: 신규 발굴 위기 독거어르신(${client.name}, ${client.age}세, ${client.welfareType}) 적격 심의 및 맞춤 지원 계획 확정\n• 면담 현황: ${insight.threeLineSummary[0]}\n• 주요 욕구: ${insight.threeLineSummary[1]}`;
      spec.conferenceDiscussion = `• 담당 복지사: 최근 상담 결과 ${cleanHealthSummary} 및 ${cleanEmotionalSummary}가 확인되어 ${insight.recommendedService} 연계가 시급함.\n• 팀장 및 팀원: 낙상 방지 및 영양 결식 예방을 위한 긴급 개입에 전원 동의함.`;
      spec.conferenceDecision = `1. ${client.name} 어르신 재가노인지원서비스 [사례관리형] 대상자로 최종 선정 승인\n2. ${insight.recommendedService} 즉시 개시 및 정기 안부 모니터링 편성\n3. 담당자: ${effectiveWorker}`;
      break;

    case 'service_plan':
      spec.problemAndNeeds = `${client.name} 어르신은 ${client.welfareType} ${client.livingType} 가구로, ${client.chronicDiseases.join(', ')} 및 ${insight.keyIssues.join(', ')}에 따른 일상생활 곤란과 결식 위험이 확인됨.`;
      spec.longTermGoal = '지역사회 내에서 신체 잔존기능을 유지하고 결식 및 고립 없이 안정된 자립 노후생활 유지.';
      spec.shortTermGoal = `1. ${insight.recommendedService} 즉시 연계\n2. 주 1회 정기 방문상담을 통한 안부 및 안전 확인\n3. 실내 낙상 위험 요소 개선`;
      break;

    case 'agreement':
      spec.agreementDate = spec.agreementDate || dateStr;
      spec.applicantSign = `${client.name} (서명/인)`;
      spec.agreeService = true;
      spec.agreePrivacy = true;
      spec.agreeThirdParty = true;
      break;

    case 'monitoring':
      spec.monitoringDate = spec.monitoringDate || dateStr;
      spec.counselingPurpose = `${client.name} 어르신의 핵심 욕구(${insight.keyIssues.join(', ')}) 점검 및 ${insight.recommendedService} 연계 지원 모니터링`;
      spec.counselingContent = `■ 1. 내담자 호소 및 상담 면담 개요:\n${insight.threeLineSummary.map((s) => '• ' + s).join('\n')}\n\n■ 2. 신체 기능 및 건강 상태:\n• 만성질환: ${client.chronicDiseases.join(', ')}\n• 주요 소견: ${cleanHealthSummary}\n\n■ 3. 심리·정서 및 주거 안전:\n• 정서 상태: ${cleanEmotionalSummary}\n• 거주지: ${client.address}\n\n■ 4. 조치 계획 및 추천 서비스:\n• ${insight.recommendedService}`;
      spec.counselingMethod = spec.counselingMethod || '방문상담';
      spec.counselingCategory = spec.counselingCategory || '정기상담 및 모니터링';
      spec.counselingNextPlan = `${insight.recommendedService} 제공 모니터링 및 다음 방문 상담 진행`;
      spec.monitoringSummary = insight.threeLineSummary.join('\n');
      spec.monitoringNeedChanges = `• ${insight.keyIssues.join(', ')} 관련 맞춤 지원 희망`;
      spec.monitoringEnvironmentChanges = cleanHealthSummary;
      spec.monitoringResult = '서비스 유지 (현 계획 지속 제공)';
      break;

    case 'reassessment':
      spec.reassessmentDate = spec.reassessmentDate || dateStr;
      spec.reassessmentType = '새로운 욕구가 발생';
      spec.reassessmentFactor = '재가노인에 의한 요인';
      spec.reassessmentClientNeedChange = `${cleanHealthSummary}로 인한 거동 제한 심화 및 ${cleanEmotionalSummary} 욕구 표출`;
      spec.reassessmentWorkerOpinion = `${client.name} 어르신의 상태 변화에 따라 ${insight.recommendedService}를 확대 편성하고 정기 안부 주기를 강화함.`;
      spec.reassessmentDecision = '서비스 계획 변경 후 지속 제공 (재계획 수립)';
      break;

    case 'termination':
      spec.terminationNoticeDate = spec.terminationNoticeDate || dateStr;
      spec.issuingOrg = effectiveAgency;
      spec.terminationReasonType = spec.terminationReasonType || '상태 호전(목표 달성)';
      spec.terminationNoticeDetail = `• 종결 사유: ${client.name} 어르신 재가노인지원서비스 개입 및 ${insight.recommendedService} 연계 후 일상생활 안정 및 자립 목표 달성.\n• 후속 조치: 정기적 유선 안부확인으로 사후 관리 지속.`;
      break;

    case 'referral':
      spec.referralDate = spec.referralDate || dateStr;
      spec.referralSourceOrg = `${effectiveAgency} (담당: ${effectiveWorker} / ☎ ${effectivePhone})`;
      spec.referralReason = `${client.name} 어르신(${client.age}세, ${client.welfareType})은 만성질환(${client.chronicDiseases.join(', ')})을 앓고 계시며, 최근 상담 결과 ${insight.keyIssues.join(', ')}에 대한 민간·공공 자원 연계가 시급하여 ${insight.recommendedService} 협조를 정중히 의뢰합니다.`;
      break;
  }

  return {
    updatedDoc,
    filledFieldCount: previewFields.length,
    filledFields: previewFields,
    sourceInsight: insight,
  };
}
