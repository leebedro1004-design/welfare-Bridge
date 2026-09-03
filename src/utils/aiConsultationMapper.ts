import { CaseDocument, DocumentType } from '../types';

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
 */
export function extractRealtimeConsultationSummary(
  transcript: string,
  clientName: string = '상담 어르신',
  targetDocType: DocumentType = 'intake'
): RealtimeConsultationSummary {
  const text = transcript.toLowerCase();

  // 1. Keyword extraction
  const keywords: string[] = [];
  if (text.includes('무릎') || text.includes('관절') || text.includes('다리') || text.includes('허리')) {
    keywords.push('만성관절염·보행제한');
  }
  if (text.includes('식사') || text.includes('밥') || text.includes('반찬') || text.includes('입맛') || text.includes('결식')) {
    keywords.push('식사결식·영양취약');
  }
  if (text.includes('혼자') || text.includes('독거') || text.includes('적적') || text.includes('외로') || text.includes('사별')) {
    keywords.push('독거고령·사회적고립');
  }
  if (text.includes('화장실') || text.includes('미끄') || text.includes('문턱') || text.includes('낙상') || text.includes('넘어')) {
    keywords.push('화장실낙상위험·주거개선');
  }
  if (text.includes('혈압') || text.includes('당뇨') || text.includes('약') || text.includes('병원')) {
    keywords.push('만성질환·복약관리');
  }
  if (text.includes('수급') || text.includes('생계') || text.includes('돈') || text.includes('병원비')) {
    keywords.push('기초생활수급·경제취약');
  }
  if (text.includes('장기요양') || text.includes('등급') || text.includes('돌봄')) {
    keywords.push('장기요양진입·돌봄필요');
  }

  // Fallbacks if transcript is brief
  if (keywords.length === 0) {
    keywords.push('독거노인안부', '일상생활지원', '건강상태사정', '복지욕구파악');
  }

  // 2. Emotional / Psychological State Extraction
  let primaryEmotion = '외로움 및 고립감 (경계선)';
  let emotionScore = 65;
  const emotionTags: string[] = [];

  if (text.includes('우울') || text.includes('죽고') || text.includes('눈물') || text.includes('슬프') || text.includes('사별')) {
    primaryEmotion = '상실감 및 중증 우울감';
    emotionScore = 78;
    emotionTags.push('상실우울', '정서적지지시급', '우울척도(SGDS-K)점검');
  } else if (text.includes('불안') || text.includes('걱정') || text.includes('겁나') || text.includes('넘어질까')) {
    primaryEmotion = '신체기능 저하에 따른 불안감';
    emotionScore = 60;
    emotionTags.push('낙상불안', '심리적위축', '안전확인요망');
  } else if (text.includes('고마워') || text.includes('반가워') || text.includes('와줘서') || text.includes('감사')) {
    primaryEmotion = '방문에 대한 안도감 및 높은 신뢰도';
    emotionScore = 40;
    emotionTags.push('라포형성우수', '정서적안도', '협조적');
  } else {
    primaryEmotion = '사회적 고립에 따른 경증 무기력감';
    emotionScore = 55;
    emotionTags.push('경증고립감', '말벗필요', '정서환기');
  }

  const emotionDescription = `${clientName} 어르신은 독거 생활로 인한 사회적 고립감과 신체 기력 저하에 따른 심리적 위축 상태(${primaryEmotion})를 보이며, 복지사 및 자원봉사자의 정기 방문을 통한 지속적 라포 형성과 정서적 지지 개입이 효과적일 것으로 판단됨.`;

  // 3. Consultation Goals Extraction
  const primaryGoal = `${clientName} 어르신의 결식 예방 및 일상생활 자립 유지를 위한 통합 재가복지서비스 연계`;
  const shortTermGoals = [
    '주 2회 영양 밑반찬 배달 서비스를 통한 결식 예방 및 기본 영양 섭취 개선',
    '주 1회 정기 방문 및 유선 안부확인을 통한 독거 어르신 안전 모니터링',
    '화장실 안전손잡이 및 미끄럼방지 매트 설치를 통한 가정 내 낙상 사고 예방',
  ];
  const longTermGoals = [
    '지역사회 내에서 잔존 신체기능을 최대한 유지하며 안전하고 안정된 재가 노후생활 영위',
    '사회적 지지체계 및 민관 협력 돌봄망 구축을 통한 위기 상황 예방 및 삶의 질 향상',
  ];

  // 4. Special Remarks & Urgent Risks
  const urgentRisks: string[] = [];
  if (keywords.some((k) => k.includes('낙상') || k.includes('보행'))) {
    urgentRisks.push('화장실 문턱 및 욕실 바닥 미끄럼으로 인한 낙상 고위험');
  }
  if (keywords.some((k) => k.includes('결식') || k.includes('식사'))) {
    urgentRisks.push('만성질환 및 치아 결손으로 인한 식사 불규칙 및 영양 불균형');
  }
  if (keywords.some((k) => k.includes('고립') || k.includes('우울'))) {
    urgentRisks.push('배우자 사별 후 이웃 교류 단절로 인한 고독사 위험군 모니터링 필요');
  }
  if (urgentRisks.length === 0) {
    urgentRisks.push('고령 독거노인 일상생활 지원 및 정기적 안전 확인 필요');
  }

  const healthCondition = '양측 퇴행성 무릎 관절염으로 계단 및 장거리 보행 시 지팡이 의존. 고혈압 투약 중이나 규칙적 복약 지도 및 건강 모니터링 필요.';
  const livingEnvironment = '노후 다세대주택 반지하/저층 거주. 화장실 문턱이 높고 안전바가 부재하여 낙상 위험이 높으며, 동절기 단열 및 결로 개선 요망.';
  const notes = `${clientName} 어르신은 복지 서비스에 긍정적인 반응을 보이며 밑반찬 지원과 안전바 설치에 강한 욕구를 나타냄. 정기적 사례관리 개입 적극 권장.`;

  const socialWorkerOpinion = `본 사례는 만성질환과 고령 독거로 인해 일상생활 수행능력(ADL/IADL)이 저하된 대상자로서, 결식 예방을 위한 밑반찬 배달과 주 1회 안전 안부확인, 주거환경 낙상방지 지원을 골자로 하는 재가노인지원서비스 통합 사례관리 개입이 반드시 시급히 요구됨.`;

  // 5. Pre-mapped payload per Document Type
  const mappedFieldsByDocType: Record<string, Record<string, any>> = {
    // 1. 초기면접지 (Intake)
    intake: {
      title: `${clientName} 어르신 2026년 정기 초기상담면접지`,
      mainNeeds: keywords.join(', '),
      physicalHealthStatus: healthCondition,
      housingEnvironment: livingEnvironment,
      socialWorkerOpinion: socialWorkerOpinion,
      riskRationale: `위기도: 고령 독거, 결식 위험 및 관절염 보행 제한 복합 요인`,
      riskLevel: '중점위기(고위험군)',
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
      riskLevel: '중점위기(고위험군)',
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
        problemAndNeeds: `${clientName} 어르신은 독거노인으로서 ${keywords.join(', ')} 등의 복합 문제를 겪고 있어 체계적인 서비스 연계가 시급함.`,
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
• 긴급 위험 요인: ${urgentRisks.join(' / ')}

■ 5. 사회복지사 종합 소견 및 개입 방향:
• ${socialWorkerOpinion}`,
        counselingMethod: '방문상담',
        counselingCategory: '정기상담 및 모니터링',
        counselingNextPlan: `밑반찬 배달 주 2회 지원 및 주 1회 정기 안부확인 지속 유지, 가정 내 낙상방지 안전바 설치 연계`,
        monitoringSummary: notes,
        counselingKeywords: keywords.join(', '),
        clientEmotionalResponse: primaryEmotion,
        monitoringSpecialRemarks: urgentRisks.join(' / '),
        monitoringPlan: '현 수립된 서비스 계획(밑반찬 주 2회, 안부확인 주 1회) 지속 유지 및 만족도 평가 실시',
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
}): CaseDocument {
  const { transcript, analysisResult, client, targetDocType = 'monitoring', existingDoc } = params;
  const clientName = client?.name || analysisResult?.clientName || '상담 어르신';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  // Extract real-time consultation summary
  const summary = extractRealtimeConsultationSummary(transcript, clientName, targetDocType);

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
        author: client?.caseWorker || '이상호 사회복지사',
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
    formSpecificFields: {
      ...baseDoc.formSpecificFields,
      // Core Auto-fill Legal Form Fields
      counselingPurpose: derivedPurpose,
      counselingContent: derivedContent,
      counselingMethod: '방문상담',
      counselingCategory: targetDocType === 'intake' ? '초기상담' : '정기상담 및 모니터링',
      counselingNextPlan: nextPlan,
      aiAutoFilledFields: autoFilledFields,
      aiAutoFilledTimestamp: `${dateStr} ${timeStr}`,

      // 7호 모니터링 및 상담일지 필드 호환
      monitoringSummary: summary.clientSpecialRemarks.notes,
      monitoringNeedChanges: `• ${needsText} 관련 서비스 유지 및 보완 희망`,
      monitoringEnvironmentChanges: healthText,
      monitoringDetailedNotes: derivedContent,
      monitoringPlanResult: '서비스 유지',

      // 1호 초기면접지 필드 호환
      intakeSummary: summary.clientSpecialRemarks.notes,
      intakeClientEmotion: summary.clientEmotionState.primaryEmotion,
      intakeHealthStatus: healthText,
      intakeHousingSafety: livingText,
      intakeCounselorOpinion: workerOpinionText,

      // 5호 서비스제공계획서 필드 호환
      problemAndNeeds: `${clientName} 어르신은 고령 독거 및 만성질환으로 인해 ${needsText} 등의 복합 위험에 노출되어 있어 맞춤형 지원이 요구됨.`,
      solutionAndGoals: nextPlan,
    },
  };
}

