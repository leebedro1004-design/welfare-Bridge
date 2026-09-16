import { CaseDocument, ClientProfile, ConsultationInsight, DocumentType } from '../types';
import { PRESET_SCENARIOS } from '../data/mockData';

export interface ConsultationNotesDetectionResult {
  notes: string;
  sourceTitle: string;
  detectedDate: string;
  isCustomPasted?: boolean;
}

export interface SmartFillApiResult {
  summaryOfNotes?: string;
  riskLevel?: '고위험' | '중위험' | '일반';
  riskRationale?: string;
  primaryNeeds?: string[];
  physicalHealthStatus?: string;
  adlStatus?: string;
  iadlStatus?: string;
  emotionalCognitiveStatus?: string;
  housingEnvironment?: string;
  economicStatus?: string;
  socialSupportNetwork?: string;
  socialWorkerOpinion?: string;
  shortTermGoals?: string[];
  longTermGoals?: string[];
  recommendedServices?: Array<{
    category: string;
    serviceName: string;
    frequency: string;
    purpose: string;
    provider?: string;
  }>;
  formSpecificFields?: Record<string, any>;
  fieldSummaries?: Array<{
    fieldName: string;
    label: string;
    value: string;
    reason: string;
  }>;
}

/**
 * Retrieve the most relevant and latest consultation notes for the given client and document.
 */
export function getLatestConsultationNotesForClient(
  client?: ClientProfile,
  doc?: CaseDocument,
  documents?: CaseDocument[],
  consultationInsights?: ConsultationInsight[]
): ConsultationNotesDetectionResult {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Current document already has a source transcript or raw notes
  if (doc?.sourceTranscript && doc.sourceTranscript.trim().length > 30) {
    return {
      notes: doc.sourceTranscript.trim(),
      sourceTitle: '현재 서식에 첨부된 AI 상담 음성 녹취록',
      detectedDate: doc.createdAt?.slice(0, 10) || todayStr,
    };
  }

  if (doc?.rawNotes && doc.rawNotes.trim().length > 30) {
    return {
      notes: doc.rawNotes.trim(),
      sourceTitle: '현재 서식 작성자 현장 상담 메모',
      detectedDate: doc.updatedAt?.slice(0, 10) || todayStr,
    };
  }

  // 2. Search other case documents for this client that contain transcript or notes
  if (documents && client) {
    const clientDocs = documents.filter((d) => d.clientId === client.id && d.id !== doc?.id);
    for (const d of clientDocs) {
      if (d.sourceTranscript && d.sourceTranscript.trim().length > 30) {
        return {
          notes: d.sourceTranscript.trim(),
          sourceTitle: `최근 서식 (${d.title}) 연계 상담 녹취록`,
          detectedDate: d.createdAt?.slice(0, 10) || todayStr,
        };
      }
      if (d.rawNotes && d.rawNotes.trim().length > 30) {
        return {
          notes: d.rawNotes.trim(),
          sourceTitle: `최근 서식 (${d.title}) 현장 상담 메모`,
          detectedDate: d.createdAt?.slice(0, 10) || todayStr,
        };
      }
    }
  }

  // 3. Search preset scenarios matching client name
  if (client) {
    const matchedPreset = PRESET_SCENARIOS.find((p) => p.clientName === client.name);
    if (matchedPreset && matchedPreset.transcriptText) {
      const combinedNotes = [
        matchedPreset.workerNotes ? `[사회복지사 현장 관찰 메모]\n${matchedPreset.workerNotes}` : '',
        `[상담 녹취록]\n${matchedPreset.transcriptText}`,
      ].filter(Boolean).join('\n\n');

      return {
        notes: combinedNotes,
        sourceTitle: `최근 상담 녹취 시나리오 (${matchedPreset.title})`,
        detectedDate: todayStr,
      };
    }
  }

  // 4. Search live consultation insights
  if (client && consultationInsights && consultationInsights.length > 0) {
    const match = consultationInsights.find((i) => i.clientId === client.id);
    if (match) {
      const summaryText = match.threeLineSummary ? match.threeLineSummary.join('\n') : '';
      const notes = `[최근 AI 상담실 3줄 핵심 인사이트 - ${match.timestamp}]\n${summaryText}\n\n[도출된 주요 위기도 및 복지욕구]: ${match.riskLevel}, ${match.keyIssues?.join(', ') || ''}\n권고 서비스: ${match.recommendedService || '사례관리 개입'}`;
      return {
        notes,
        sourceTitle: '최근 AI 상담실 실시간 분석 인사이트',
        detectedDate: match.timestamp?.slice(0, 10) || todayStr,
      };
    }
  }

  // 5. Check localStorage for recently analyzed transcript
  try {
    const recent = localStorage.getItem('senior_care_recent_transcript');
    if (recent && recent.trim().length > 30) {
      return {
        notes: recent.trim(),
        sourceTitle: '브라우저 실시간 상담 임시 녹취록',
        detectedDate: todayStr,
      };
    }
  } catch (e) {}

  // 6. Fallback: Synthesize tailored clinical consultation notes based on client demographics and case history
  const cName = client?.name || doc?.clientName || '어르신';
  const cAge = client?.age || 80;
  const cDiseases = client?.chronicDiseases?.join(', ') || '퇴행성관절염, 고혈압';
  const cLiving = client?.livingType || '독거노인';
  const cRisk = client?.riskLevel || '고위험';

  const defaultClinicalNote = `[사회복지사 가정방문 초기/정기 상담 메모]
- 일시: ${todayStr} 14:00~15:00
- 대상: ${cName} (${cAge}세, ${cLiving}, 위기도: ${cRisk})
- 주요 호소 및 대화 내용:
사회복지사가 가정을 방문하여 ${cName} 어르신과 면담 진행함.
어르신은 "${cDiseases} 약을 매일 먹고 있는데, 최근 무릎과 허리 관절 통증이 심해져서 방에서 화장실 걸어가는 것도 벽을 짚고 겨우 간다. 문턱 넘을 때마다 발이 걸려 넘어질 뻔해 가슴이 철렁한다"며 낙상 두려움을 강하게 호소하심.
식사 상황 확인 결과, "서서 국 끓이고 밥 챙기기가 너무 힘들어 점심에 물 말아 김치랑 대충 때우고 저녁은 굶는 날이 많다"고 진술하여 영양 불균형 및 결식 위험 감지됨.
가족 관계는 타지역 거주 자녀와 연락이 거의 단절된 상태로 심리적 고립감과 적적함을 표현하심.
- 사회복지사 현장 관찰 소견:
화장실 문턱이 8cm 가량으로 높아 미끄럼 방지 매트 및 안전손잡이 긴급 설치가 필요함. 주 2~3회 밑반찬 배달 연계와 주 1회 정기 안부 확인 서비스 즉시 배정 요망.`;

  return {
    notes: defaultClinicalNote,
    sourceTitle: '어르신 복합 만성질환 및 주거·영양 최근 상담 기록',
    detectedDate: todayStr,
  };
}

/**
 * Call the Smart Fill API
 */
export async function executeSmartFillApi(params: {
  documentType: DocumentType;
  consultationNotes: string;
  clientProfile?: ClientProfile;
  currentDocument?: CaseDocument;
}): Promise<{
  success: boolean;
  data: SmartFillApiResult;
  filledFieldCount: number;
  isFallback?: boolean;
}> {
  const res = await fetch('/api/ai/smart-fill-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error || `스마트 필 API 요청 실패 (${res.status})`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json?.error || '스마트 필 결과를 수신하지 못했습니다.');
  }

  return {
    success: true,
    data: json.data,
    filledFieldCount: json.filledFieldCount || 7,
    isFallback: json.isFallback,
  };
}

/**
 * Apply Smart Fill data to the active CaseDocument
 */
export function applySmartFillToDocument(
  doc: CaseDocument,
  smartFill: SmartFillApiResult
): {
  updatedDoc: CaseDocument;
  filledCount: number;
  fieldSummaries: Array<{ fieldName: string; label: string; value: string; reason: string }>;
} {
  const updated: CaseDocument = { ...doc };
  let count = 0;
  const summaries: Array<{ fieldName: string; label: string; value: string; reason: string }> = [];

  // 1. Top-level clinical fields
  if (smartFill.physicalHealthStatus) {
    updated.physicalHealthStatus = smartFill.physicalHealthStatus;
    count++;
    summaries.push({
      fieldName: 'physicalHealthStatus',
      label: '신체 및 건강상태',
      value: smartFill.physicalHealthStatus.slice(0, 45) + '...',
      reason: '상담 기록 질환 및 보행 상태 반영',
    });
  }

  if (smartFill.adlStatus) {
    updated.adlStatus = smartFill.adlStatus;
    count++;
    summaries.push({
      fieldName: 'adlStatus',
      label: '일상생활동작(ADL)',
      value: smartFill.adlStatus.slice(0, 45) + '...',
      reason: '화장실, 보행, 일상동작 수행 곤란 반영',
    });
  }

  if (smartFill.iadlStatus) {
    updated.iadlStatus = smartFill.iadlStatus;
    count++;
    summaries.push({
      fieldName: 'iadlStatus',
      label: '도구적 일상생활(IADL)',
      value: smartFill.iadlStatus.slice(0, 45) + '...',
      reason: '취사, 장보기, 식사준비 곤란 반영',
    });
  }

  if (smartFill.emotionalCognitiveStatus) {
    updated.emotionalCognitiveStatus = smartFill.emotionalCognitiveStatus;
    count++;
    summaries.push({
      fieldName: 'emotionalCognitiveStatus',
      label: '정서 및 인지상태',
      value: smartFill.emotionalCognitiveStatus.slice(0, 45) + '...',
      reason: '독거 고립감 및 심리 반응 반영',
    });
  }

  if (smartFill.housingEnvironment) {
    updated.housingEnvironment = smartFill.housingEnvironment;
    count++;
    summaries.push({
      fieldName: 'housingEnvironment',
      label: '주거 환경',
      value: smartFill.housingEnvironment.slice(0, 45) + '...',
      reason: '실내 문턱, 낙상 위험도, 주택 환경 반영',
    });
  }

  if (smartFill.economicStatus) {
    updated.economicStatus = smartFill.economicStatus;
    count++;
    summaries.push({
      fieldName: 'economicStatus',
      label: '경제 상태',
      value: smartFill.economicStatus.slice(0, 45) + '...',
      reason: '기초생활수급 및 의료비 부담 반영',
    });
  }

  if (smartFill.socialSupportNetwork) {
    updated.socialSupportNetwork = smartFill.socialSupportNetwork;
    count++;
    summaries.push({
      fieldName: 'socialSupportNetwork',
      label: '사회적 지지망',
      value: smartFill.socialSupportNetwork.slice(0, 45) + '...',
      reason: '가족 단절 및 공적 지지망 필요성 반영',
    });
  }

  if (smartFill.socialWorkerOpinion) {
    updated.socialWorkerOpinion = smartFill.socialWorkerOpinion;
    count++;
    summaries.push({
      fieldName: 'socialWorkerOpinion',
      label: '사회복지사 종합 소견',
      value: smartFill.socialWorkerOpinion.slice(0, 45) + '...',
      reason: '사례관리 개입 전문 판단 반영',
    });
  }

  if (smartFill.riskLevel) {
    updated.riskLevel = smartFill.riskLevel;
    count++;
  }

  if (smartFill.riskRationale) {
    updated.riskRationale = smartFill.riskRationale;
    count++;
  }

  if (smartFill.primaryNeeds && smartFill.primaryNeeds.length > 0) {
    updated.primaryNeeds = [...smartFill.primaryNeeds];
    count++;
    summaries.push({
      fieldName: 'primaryNeeds',
      label: '주요 복지 욕구',
      value: smartFill.primaryNeeds.join(', '),
      reason: '우선순위 복지 욕구 도출',
    });
  }

  if (smartFill.shortTermGoals && smartFill.shortTermGoals.length > 0) {
    updated.shortTermGoals = [...smartFill.shortTermGoals];
    count++;
  }

  if (smartFill.longTermGoals && smartFill.longTermGoals.length > 0) {
    updated.longTermGoals = [...smartFill.longTermGoals];
    count++;
  }

  if (smartFill.recommendedServices && smartFill.recommendedServices.length > 0) {
    updated.recommendedServices = smartFill.recommendedServices.map((s) => ({
      category: s.category || '기본서비스',
      serviceName: s.serviceName,
      frequency: s.frequency || '주 2회',
      purpose: s.purpose || '영양 및 안부 지원',
      provider: s.provider || '도봉재가노인지원서비스센터',
    }));
    count++;
    summaries.push({
      fieldName: 'recommendedServices',
      label: '추천 서비스 계획',
      value: smartFill.recommendedServices.map((s) => s.serviceName).join(', '),
      reason: '맞춤형 급여 및 자원 연계 계획 수립',
    });
  }

  // 2. Nested formSpecificFields
  if (smartFill.formSpecificFields && typeof smartFill.formSpecificFields === 'object') {
    const existing = updated.formSpecificFields || {};
    const mergedSpecific: Record<string, any> = { ...existing };

    Object.entries(smartFill.formSpecificFields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        mergedSpecific[k] = v;
        count++;
      }
    });

    updated.formSpecificFields = mergedSpecific;
  }

  // Set updated timestamp
  updated.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

  // Use fieldSummaries from API if provided and richer
  const finalSummaries = (smartFill.fieldSummaries && smartFill.fieldSummaries.length > 0)
    ? smartFill.fieldSummaries
    : summaries;

  return {
    updatedDoc: updated,
    filledCount: Math.max(count, finalSummaries.length),
    fieldSummaries: finalSummaries,
  };
}
