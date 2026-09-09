import { CaseDocument, DocumentType, UserSettings } from '../types';
import { getEffectiveWorkerFullName } from './userSettingsHelper';

export interface RealtimeConsultationSummary {
  keywords: string[];
  clientEmotionState: {
    primaryEmotion: string;
    emotionScore: number; // 0 ~ 100 (안정도 / 우울·불안 척도)
    emotionTags: string[];
    description: string;
  };
  consultationGoals: {
    primaryGoal: string;
    shortTermGoals: string[];
    longTermGoals: string[];
  };
  clientSpecialRemarks: {
    urgentRisks: string[];
    healthCondition: string;
    livingEnvironment: string;
    notes: string;
  };
  socialWorkerOpinion: string;
  mappedFieldsByDocType: Record<string, Record<string, any>>;
}

/**
 * Extracts real-time consultation summary (keywords, emotional state, goals, remarks)
 * immediately after recording ends or transcript is available.
 * Strictly avoids generic boilerplate (e.g. knee arthritis, toilet bars) and grounds on actual text.
 */
export function extractRealtimeConsultationSummary(
  transcript: string = '',
  clientName: string = '상담 대상자',
  targetDocType: DocumentType = 'intake',
  analysisResult?: any
): RealtimeConsultationSummary {
  const text = (transcript || '').toLowerCase();
  const rawSentences = (transcript || '')
    .split(/[\n.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const findFirstSentence = (keywords: string[]): string => {
    const found = rawSentences.find((s) => {
      const lower = s.toLowerCase();
      return keywords.some((k) => lower.includes(k.toLowerCase()));
    });
    return found ? found.slice(0, 150) : '';
  };

  // 1. Keyword extraction from actual dialogue
  const keywords: string[] = [];
  const healthSentence = findFirstSentence([
    '무릎', '관절', '다리', '허리', '어깨', '눈', '백내장', '치아', '틀니',
    '혈압', '당뇨', '심장', '뇌졸중', '치매', '통증', '아프', '약', '병원', '투약', '수술'
  ]);
  if (healthSentence) {
    keywords.push('신체질환·건강관리');
  }

  const mealSentence = findFirstSentence([
    '식사', '밥', '반찬', '끼니', '입맛', '결식', '김치', '국', '라면', '굶', '죽'
  ]);
  if (mealSentence) {
    keywords.push('식사지원·영양취약');
  }

  const isolationSentence = findFirstSentence([
    '혼자', '독거', '적적', '외로', '사별', '눈물', '불안', '잠', '불면', '답답'
  ]);
  if (isolationSentence) {
    keywords.push('심리정서·고립감완화');
  }

  const housingSentence = findFirstSentence([
    '화장실', '미끄', '문턱', '낙상', '넘어', '보일러', '난방', '추워', '더워', '곰팡이', '누수', '계단'
  ]);
  if (housingSentence) {
    keywords.push('주거환경·안전점검');
  }

  const econSentence = findFirstSentence([
    '수급', '생계', '돈', '병원비', '월세', '전기세', '연금'
  ]);
  if (econSentence) {
    keywords.push('경제취약·생계지원');
  }

  if (keywords.length === 0) {
    keywords.push('정기안부확인', '일상생활모니터링', '복지욕구파악');
  }

  // 2. Emotional / Psychological State Extraction
  let primaryEmotion = '안정적 대화 및 협조적 태도';
  let emotionScore = 45;
  const emotionTags: string[] = [];

  if (text.includes('우울') || text.includes('죽고') || text.includes('눈물') || text.includes('슬프') || text.includes('사별')) {
    primaryEmotion = '심리적 고립감 및 우울 성향';
    emotionScore = 75;
    emotionTags.push('정서적지지필요', '우울척도(SGDS-K)점검', '안부확인');
  } else if (text.includes('불안') || text.includes('걱정') || text.includes('겁나') || text.includes('넘어질까')) {
    primaryEmotion = '일상생활 불안감 및 신체염려';
    emotionScore = 60;
    emotionTags.push('불안감완화', '안전확인요망', '정기모니터링');
  } else if (text.includes('고마워') || text.includes('반가워') || text.includes('와줘서') || text.includes('감사')) {
    primaryEmotion = '상담원에 대한 신뢰 및 긍정적 라포';
    emotionScore = 30;
    emotionTags.push('라포형성우수', '협조적태도', '상담친밀도높음');
  } else if (isolationSentence) {
    primaryEmotion = '외로움 및 독거 생활 적적함';
    emotionScore = 55;
    emotionTags.push('독거고립감', '말벗상담요망');
  } else {
    primaryEmotion = '안정적 의사소통 및 보통 정서';
    emotionScore = 40;
    emotionTags.push('지남력양호', '협조적');
  }

  const emotionDescription = analysisResult?.emotionalCognitiveStatus || (
    isolationSentence
      ? `${clientName} 어르신은 상담 중 "${isolationSentence}"라고 진술하며, 독거 생활에 따른 정서적 고립감(${primaryEmotion})을 호소하고 있어 정기적인 말벗 안부 확인이 권장됨.`
      : `${clientName} 어르신은 의사소통 및 지남력이 양호하며 복지사의 질문에 적극적으로 호응함(${primaryEmotion}).`
  );

  // 3. Health & Living condition strictly from dialogue or analysisResult
  const healthCondition = analysisResult?.physicalHealthStatus || (
    healthSentence
      ? `[내담자 진술]: "${healthSentence}"\n상담 중 호소한 신체 증상에 대한 정기 건강 체크 및 투약 모니터링이 필요함.`
      : `[상담 중 구체적 만성질환 호소 미언급 - 현장 방문 시 건강 및 복약 상태 정밀 확인 필요]`
  );

  const livingEnvironment = analysisResult?.housingEnvironment || (
    housingSentence
      ? `[내담자 진술]: "${housingSentence}"\n주거 내 위해요인 및 안전 취약점에 대한 환경 점검 및 보완 조치 검토 필요.`
      : `[상담 중 주거시설 특이 위해사항 미언급 - 정기 방문 시 안전 점검 요망]`
  );

  // 4. Consultation Goals & Primary Needs
  const primaryGoal = analysisResult?.primaryNeeds && analysisResult.primaryNeeds.length > 0
    ? `${clientName} 어르신의 주요 욕구(${analysisResult.primaryNeeds.slice(0, 2).join(', ')}) 해결 및 안전한 재가생활 유지`
    : `${clientName} 어르신의 일상생활 자립 유지와 정기 안부확인을 위한 맞춤형 재가노인지원서비스 연계`;

  const shortTermGoals = analysisResult?.shortTermGoals || [
    mealSentence
      ? '영양 식생활 개선 및 결식 예방을 위한 서비스 연계'
      : '초기 1개월 내 정기 안부확인 체계 구축 및 생활 안정 도모',
    housingSentence
      ? '가정 내 주거 위험요소 점검 및 안전 지원'
      : '대상자 일상생활 잔존기능 점검 및 모니터링',
  ];

  const longTermGoals = analysisResult?.longTermGoals || [
    '지역사회 내에서 잔존 기능을 유지하며 존엄하고 안전한 재가 노후생활 지속',
    '사회적 고립감 해소 및 안정적 복지 안전망 구축',
  ];

  // 5. Special Remarks & Urgent Risks
  const urgentRisks: string[] = [];
  if (healthSentence) urgentRisks.push(`신체건강 호소: "${healthSentence.slice(0, 40)}..."`);
  if (housingSentence) urgentRisks.push(`주거안전 점검: "${housingSentence.slice(0, 40)}..."`);
  if (mealSentence) urgentRisks.push(`식사/영양 관리: "${mealSentence.slice(0, 40)}..."`);
  if (isolationSentence) urgentRisks.push(`심리정서 지원: "${isolationSentence.slice(0, 40)}..."`);
  if (urgentRisks.length === 0) {
    urgentRisks.push('독거 어르신 일상생활 지원 및 정기 안전 확인');
  }

  const notes = `${clientName} 어르신 상담 완료. 실제 상담 대화록에 기반하여 확인된 주요 욕구(${keywords.join(', ')})를 중심으로 개입 계획을 수립함.`;
  const socialWorkerOpinion = analysisResult?.socialWorkerOpinion || (
    `본 사례는 ${clientName} 어르신의 구체적인 호소 사항(${keywords.join(', ')})을 감안할 때, 대상자의 자립 생활 유지를 돕기 위한 맞춤형 재가노인지원서비스 연계 및 정기 모니터링이 요구됨.`
  );

  // 6. Pre-mapped payload per Document Type
  const mappedFieldsByDocType: Record<string, Record<string, any>> = {
    // 1. 초기면접지 (Intake)
    intake: {
      title: `${clientName} 어르신 2026년 정기 초기상담면접지`,
      mainNeeds: keywords.join(', '),
      physicalHealthStatus: healthCondition,
      housingEnvironment: livingEnvironment,
      socialWorkerOpinion: socialWorkerOpinion,
      riskRationale: `위기도 사정 근거: ${urgentRisks.join(' / ')}`,
      riskLevel: analysisResult?.riskLevel || (urgentRisks.length >= 3 ? '고위험' : '중위험'),
      shortTermGoals,
      longTermGoals,
      formSpecificFields: {
        intakeSummary: notes,
        intakeClientEmotion: primaryEmotion,
        intakeHealthStatus: healthCondition,
        intakeHousingSafety: livingEnvironment,
        intakeCounselorOpinion: socialWorkerOpinion,
      },
    },

    // 2. 사정기록지 (Assessment)
    assessment: {
      title: `${clientName} 어르신 표준 종합사정기록지`,
      physicalHealthStatus: healthCondition,
      emotionalCognitiveStatus: emotionDescription,
      housingEnvironment: livingEnvironment,
      socialWorkerOpinion: socialWorkerOpinion,
      riskRationale: `위기도 판정 근거: ${urgentRisks.join(' / ')}`,
      riskLevel: analysisResult?.riskLevel || (urgentRisks.length >= 3 ? '고위험' : '중위험'),
      shortTermGoals,
      longTermGoals,
      formSpecificFields: {
        assessmentNeeds: keywords.join(', '),
        assessmentAdlSummary: healthCondition,
        assessmentEmotional: emotionDescription,
        assessmentEnvironment: livingEnvironment,
        assessmentOverallPlan: socialWorkerOpinion,
      },
    },

    // 3. 서비스제공계획서 (Service Plan / ISP)
    service_plan: {
      title: `${clientName} 어르신 재가노인지원서비스 제공계획서(ISP)`,
      shortTermGoals,
      longTermGoals,
      socialWorkerOpinion: socialWorkerOpinion,
      formSpecificFields: {
        problemAndNeeds: `${clientName} 어르신 상담을 통해 도출된 주요 과제는 ${keywords.join(', ')}이며, 이에 대한 개별 맞춤 서비스 제공이 필요함.`,
        longTermGoal: longTermGoals[0],
        shortTermGoal: shortTermGoals.join(' / '),
        servicePlanManagerOpinion: socialWorkerOpinion,
      },
    },

    // 4. 상담/모니터링 기록지 (Monitoring / Counseling Log)
    monitoring: {
      title: `${clientName} 어르신 재가노인지원서비스 상담 및 모니터링 기록지`,
      socialWorkerOpinion: socialWorkerOpinion,
      formSpecificFields: {
        counselingPurpose: primaryGoal,
        counselingContent: `■ 1. 내담자 호소 및 면담 개요:
• ${notes}

■ 2. 신체·건강 및 일상생활(ADL) 상태:
• ${healthCondition}

■ 3. 심리·정서 및 거주 환경:
• 정서 상태: ${primaryEmotion} (${emotionDescription})
• 주거 환경: ${livingEnvironment}

■ 4. 주요 확인 욕구 및 위험 요인:
• 중점 욕구: ${keywords.join(', ')}
• 핵심 사정 요인: ${urgentRisks.join(' / ')}

■ 5. 사회복지사 종합 소견 및 조치 계획:
• ${socialWorkerOpinion}`,
        counselingMethod: '방문상담',
        counselingCategory: '정기상담 및 모니터링',
        counselingNextPlan: `확인된 주요 욕구(${keywords.join(', ')})에 대한 단계적 서비스 연계 및 차회 정기 방문 일정 조율`,
        monitoringSummary: notes,
        counselingKeywords: keywords.join(', '),
        clientEmotionalResponse: primaryEmotion,
        monitoringSpecialRemarks: urgentRisks.join(' / '),
        monitoringPlan: '수립된 맞춤형 계획에 따른 주기적 안부 확인 및 서비스 점검',
        monitoringNeedChanges: `${keywords.join(', ')} 지원 요구 지속`,
        monitoringEnvironmentChanges: healthCondition,
      },
    },
  };

  return {
    keywords,
    clientEmotionState: {
      primaryEmotion,
      emotionScore,
      emotionTags,
      description: emotionDescription,
    },
    consultationGoals: {
      primaryGoal,
      shortTermGoals,
      longTermGoals,
    },
    clientSpecialRemarks: {
      urgentRisks,
      healthCondition,
      livingEnvironment,
      notes,
    },
    socialWorkerOpinion,
    mappedFieldsByDocType,
  };
}

/**
 * Automatically maps consultation transcript and AI analysis results into a statutory legal form
 * (e.g. Counseling & Monitoring Log, Intake Sheet, Assessment Record).
 * Fills in key legal fields: 'counselingPurpose' (상담 목적) and 'counselingContent' (상담 내용).
 */
export function autoFillLegalFormWithConsultation(params: {
  transcript: string;
  analysisResult?: any;
  client?: any;
  targetDocType?: DocumentType;
  existingDoc?: CaseDocument | null;
  userSettings?: UserSettings;
}): CaseDocument {
  const { transcript, analysisResult, client, targetDocType = 'monitoring', existingDoc, userSettings } = params;
  const clientName = client?.name || analysisResult?.clientName || '상담 어르신';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);
  const effectiveWorkerFullName = getEffectiveWorkerFullName(userSettings, client?.caseWorker || '이현정 사회복지사');

  // Extract real-time consultation summary
  const summary = extractRealtimeConsultationSummary(transcript, clientName, targetDocType, analysisResult);

  // Derive explicit Consultation Purpose (상담 목적)
  let derivedPurpose = '';
  if (analysisResult?.primaryNeeds && analysisResult.primaryNeeds.length > 0) {
    const mainNeedsStr = analysisResult.primaryNeeds.slice(0, 3).join(', ');
    derivedPurpose = `${clientName} 어르신의 핵심 욕구(${mainNeedsStr}) 파악 및 일상생활 유지·결식 예방을 위한 재가노인지원서비스 연계 및 안전 모니터링`;
  } else if (summary.consultationGoals?.primaryGoal) {
    derivedPurpose = summary.consultationGoals.primaryGoal;
  } else {
    derivedPurpose = `${clientName} 어르신의 재가 생활 안전 유지, 만성질환 안부확인 및 복지욕구 사정을 위한 정기 방문 상담`;
  }

  // Derive structured Consultation Content (상담 내용)
  const execSummaryLines = analysisResult?.executiveSummary || [];
  const execSummaryText = execSummaryLines.length > 0
    ? execSummaryLines.map((l: string) => `• ${l}`).join('\n')
    : `• ${summary.clientSpecialRemarks.notes}`;

  const healthText = analysisResult?.physicalHealthStatus || summary.clientSpecialRemarks.healthCondition;
  const livingText = analysisResult?.housingEnvironment || summary.clientSpecialRemarks.livingEnvironment;
  const emotionText = analysisResult?.emotionalCognitiveStatus || summary.clientEmotionState.description;
  const workerOpinionText = analysisResult?.socialWorkerOpinion || summary.socialWorkerOpinion;
  const riskText = analysisResult?.riskRationale || summary.clientSpecialRemarks.urgentRisks.join(', ');
  const needsText = (analysisResult?.primaryNeeds && analysisResult.primaryNeeds.length > 0)
    ? analysisResult.primaryNeeds.join(', ')
    : summary.keywords.join(', ');

  const derivedContent = `■ 1. 내담자 호소 및 상담 면담 개요:
${execSummaryText}

■ 2. 신체 기능 및 일상생활 수행(ADL) 점검:
• 신체·건강 상태: ${healthText}
• 거주 및 주거 안전: ${livingText}

■ 3. 심리·정서 상태 및 사회적 지지망:
• 정서 상태: ${emotionText}
• 위기도 요인: ${riskText}

■ 4. 주요 복지 욕구 및 신청 희망 서비스:
• 도출된 핵심 욕구: ${needsText}
• 단기 목표: ${summary.consultationGoals.shortTermGoals.join(' / ')}

■ 5. 사회복지사 종합 소견 및 조치 계획:
• ${workerOpinionText}`;

  // Next intervention plan
  const nextPlan = analysisResult?.recommendedServices && analysisResult.recommendedServices.length > 0
    ? analysisResult.recommendedServices.map((s: any) => `${s.serviceName}(${s.frequency || '정기'}): ${s.purpose || '지원'}`).join(' / ')
    : '주 2회 밑반찬 배달 연계 및 주 1회 이상 정기 유선/방문 안부확인 지속 유지';

  // Base document to merge into
  const baseDoc: CaseDocument = existingDoc
    ? { ...existingDoc }
    : {
        id: `doc-autofill-${Date.now()}`,
        clientId: client?.id || `client-${Date.now()}`,
        clientName: clientName,
        documentType: targetDocType,
        title: `${clientName} 어르신 ${targetDocType === 'monitoring' ? '상담 및 모니터링 기록지' : '법정 서식'} (AI 자동 완성)`,
        createdAt: `${dateStr} ${timeStr}`,
        updatedAt: `${dateStr} ${timeStr}`,
        author: effectiveWorkerFullName,
        status: '작성완료',
        riskLevel: (analysisResult?.riskLevel || '중위험') as any,
        primaryNeeds: analysisResult?.primaryNeeds || summary.keywords,
        shortTermGoals: summary.consultationGoals.shortTermGoals,
        longTermGoals: summary.consultationGoals.longTermGoals,
        recommendedServices: analysisResult?.recommendedServices || [
          { serviceName: '밑반찬 배달 서비스', frequency: '주 2회', purpose: '결식 예방 및 영양 관리' },
          { serviceName: '정기 방문 안부확인', frequency: '주 1회', purpose: '독거노인 안전망 점검' },
        ],
        formSpecificFields: {},
      };

  const autoFilledFields = [
    'counselingPurpose',
    'counselingContent',
    'counselingMethod',
    'counselingCategory',
    'counselingNextPlan',
    'monitoringSummary',
    'monitoringNeedChanges',
    'monitoringEnvironmentChanges',
    'intakeSummary',
    'intakeClientEmotion',
    'intakeHealthStatus',
    'intakeHousingSafety',
    'problemAndNeeds',
    'solutionAndGoals',
  ];

  return {
    ...baseDoc,
    updatedAt: `${dateStr} ${timeStr}`,
    status: '작성완료',
    sourceTranscript: transcript,
    socialWorkerOpinion: workerOpinionText,
    physicalHealthStatus: healthText,
    emotionalCognitiveStatus: emotionText,
    housingEnvironment: livingText,
    riskRationale: riskText,
    evidenceQuotes: analysisResult?.evidenceQuotes || baseDoc.evidenceQuotes,
    contextualAlternatives: analysisResult?.contextualAlternatives || baseDoc.contextualAlternatives,
    formSpecificFields: {
      ...baseDoc.formSpecificFields,
      ...(analysisResult?.formSpecificFields || {}),
      // Core Auto-fill Legal Form Fields
      counselingPurpose: analysisResult?.formSpecificFields?.counselingPurpose || derivedPurpose,
      counselingContent: analysisResult?.formSpecificFields?.counselingContent || derivedContent,
      counselingMethod: '방문상담',
      counselingCategory: targetDocType === 'intake' ? '초기상담' : '정기상담 및 모니터링',
      counselingNextPlan: analysisResult?.formSpecificFields?.counselingNextPlan || nextPlan,
      aiAutoFilledFields: autoFilledFields,
      aiAutoFilledTimestamp: `${dateStr} ${timeStr}`,

      // 7호 모니터링 및 상담일지 필드 호환
      monitoringSummary: analysisResult?.formSpecificFields?.monitoringSummary || summary.clientSpecialRemarks.notes,
      monitoringNeedChanges: analysisResult?.formSpecificFields?.monitoringNeedChanges || `• ${needsText} 관련 서비스 유지 및 보완 희망`,
      monitoringEnvironmentChanges: analysisResult?.formSpecificFields?.monitoringEnvironmentChanges || healthText,
      monitoringDetailedNotes: analysisResult?.formSpecificFields?.monitoringDetailedNotes || derivedContent,
      monitoringPlanResult: analysisResult?.formSpecificFields?.monitoringPlanResult || '서비스 유지',

      // 1호 초기면접지 필드 호환
      intakeSummary: analysisResult?.formSpecificFields?.intakeSummary || summary.clientSpecialRemarks.notes,
      intakeClientEmotion: analysisResult?.formSpecificFields?.intakeClientEmotion || summary.clientEmotionState.primaryEmotion,
      intakeHealthStatus: analysisResult?.formSpecificFields?.intakeHealthStatus || healthText,
      intakeHousingSafety: analysisResult?.formSpecificFields?.intakeHousingSafety || livingText,
      intakeCounselorOpinion: analysisResult?.formSpecificFields?.intakeCounselorOpinion || workerOpinionText,

      // 5호 서비스제공계획서 필드 호환
      problemAndNeeds: analysisResult?.formSpecificFields?.problemAndNeeds || `${clientName} 어르신은 고령 독거 및 만성질환으로 인해 ${needsText} 등의 복합 위험에 노출되어 있어 맞춤형 지원이 요구됨.`,
      solutionAndGoals: analysisResult?.formSpecificFields?.solutionAndGoals || nextPlan,
    },
  };
}

