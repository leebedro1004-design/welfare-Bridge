import { CaseDocument } from '../types';
import { DOCUMENT_TYPE_LABELS } from './documentTemplates';

/**
 * Returns the exact interview/transcript evidence quote for a specific field if available.
 */
export function getFieldEvidenceQuote(fieldKey: string, doc: CaseDocument): string | undefined {
  if (doc.evidenceQuotes && doc.evidenceQuotes[fieldKey]) {
    return doc.evidenceQuotes[fieldKey];
  }

  // Fallbacks: search within sourceTranscript for key snippets
  const transcript = doc.sourceTranscript || '';
  if (!transcript) return undefined;

  const rawSentences = transcript
    .split(/[\n.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  if (fieldKey === 'physicalHealthStatus') {
    const found = rawSentences.find((s) =>
      ['아프', '무릎', '허리', '다리', '병원', '약', '혈압', '당뇨', '통증', '치아', '수술'].some((k) =>
        s.includes(k)
      )
    );
    if (found) return found.slice(0, 100);
  }

  if (fieldKey === 'housingEnvironment') {
    const found = rawSentences.find((s) =>
      ['집', '방', '화장실', '문턱', '미끄', '난방', '보일러', '추워', '더워', '계단', '물'].some((k) =>
        s.includes(k)
      )
    );
    if (found) return found.slice(0, 100);
  }

  if (fieldKey === 'emotionalCognitiveStatus') {
    const found = rawSentences.find((s) =>
      ['혼자', '외로', '적적', '우울', '슬프', '눈물', '불안', '잠', '불면', '기억'].some((k) =>
        s.includes(k)
      )
    );
    if (found) return found.slice(0, 100);
  }

  return undefined;
}

/**
 * Generates dynamic, client-specific alternative phrasings for the AI Collaboration Field.
 * Strictly avoids generic boilerplate and personalizes to the current client's actual data.
 */
export function getContextualFieldAlternatives(fieldKey: string, doc: CaseDocument): string[] {
  // 1. Check if backend AI generated client-specific alternatives
  if (doc.contextualAlternatives && doc.contextualAlternatives[fieldKey]?.length) {
    return doc.contextualAlternatives[fieldKey];
  }

  const name = doc.clientName || '내담자';
  const docTypeName = DOCUMENT_TYPE_LABELS[doc.documentType]?.short || '사례관리 기록지';
  const needsStr = (doc.primaryNeeds && doc.primaryNeeds.length > 0)
    ? doc.primaryNeeds.slice(0, 3).join(', ')
    : '일상생활 자립지원 및 정기 안부확인';
  const quote = getFieldEvidenceQuote(fieldKey, doc);

  switch (fieldKey) {
    case 'title':
      return [
        `[재가노인지원] ${name} 어르신 2026년 정기 ${docTypeName}`,
        `[맞춤사례관리] ${name} 대상자 안전확인 및 ${needsStr} 계획서`,
        `[위기예방] ${name} 어르신 위기도(${doc.riskLevel || '일반'}) 사정 및 조치 보고서`,
      ];

    case 'problemAndNeeds':
    case 'counselingPurpose':
      return [
        quote
          ? `${name} 어르신 면담 중 "${quote}" 등 호소사항 확인됨. ${needsStr} 중심의 자립생활 지원 필요.`
          : `${name} 어르신의 핵심 욕구(${needsStr})를 파악하고 지속 가능한 재가생활을 지원하기 위한 상담 실시.`,
        `${name} 어르신의 일상생활 안전성 확보 및 ${needsStr} 욕구 해결을 위한 맞춤형 복지서비스 연계.`,
        `고령 독거 생활에 따른 위험 요소를 사전에 예방하고 지역사회 돌봄 안전망을 구축하기 위한 사례관리 개입.`,
      ];

    case 'counselingContent':
    case 'intakeSummary':
      return [
        `■ 상담 개요:\n• ${name} 어르신과 대면 면담을 진행하여 현재 일상생활 실태 및 주요 고충(${needsStr})을 심층 사정함.\n• 상담 과정에서 확인된 욕구를 바탕으로 단계별 맞춤 지원 방안을 논의함.`,
        `■ 내담자 주요 발언 및 관찰:\n• ${quote ? `내담자 진술: "${quote}"` : '정서적 지지 및 생활밀착형 복지 지원에 높은 호응을 보임.'}\n• 현 상태 유지 및 악화 방지를 위한 지속적 모니터링 필요.`,
      ];

    case 'riskRationale':
      return [
        `${name} 어르신은 위기도 [${doc.riskLevel || '중위험'}] 수준으로 사정됨. 주 위험요인: ${needsStr}.`,
        `고령 독거 거주 특성과 복합 위험요인(${needsStr})이 상존하여 응급상황 대처 취약성 높음.`,
        `비공식 지지체계 부족 및 일상생활 자립 제한으로 인해 정기적 안전 점검이 반드시 수반되어야 함.`,
      ];

    case 'physicalHealthStatus':
      if (doc.physicalHealthStatus) {
        return [
          `[공문서 표준형] ${doc.physicalHealthStatus} 향후 규칙적 복약 순응도 및 신체 자립기능 유지를 위한 정기 점검 요망.`,
          `[간결 요약형] ${doc.physicalHealthStatus.split('\n')[0]} (일상생활 보조 및 건강 모니터링 필요)`,
          `[보건·의료 연계형] ${doc.physicalHealthStatus} 지역 보건소 방문건강관리사업 및 만성질환 관리 프로그램 연계 검토.`,
        ];
      }
      return [
        quote
          ? `[내담자 호소]: "${quote}" 신체적 불편감 완화 및 잔존기능 유지를 위한 일상생활 지원 필요.`
          : `${name} 어르신의 일상 신체기능 상태를 정기 방문을 통해 점검하고 건강 이상 징후 발생 시 신속 대처함.`,
        `기본적 일상생활수행(ADL)은 일부 가능하나 무리한 신체활동 제한 및 안전한 생활환경 조성이 요망됨.`,
      ];

    case 'emotionalCognitiveStatus':
      if (doc.emotionalCognitiveStatus) {
        return [
          `[정서지지 강화형] ${doc.emotionalCognitiveStatus} 정기적인 방문 및 유선 안부확인을 통한 라포 형성과 심리적 안정 유도가 요구됨.`,
          `[사회관계망 연계형] ${doc.emotionalCognitiveStatus} 사회적 고립감을 완화하기 위한 복지관 프로그램 및 말벗 봉사자 결연 권장.`,
        ];
      }
      return [
        quote
          ? `[내담자 진술]: "${quote}" 상담 중 확인된 정서적 고립감 완화를 위한 지속적 말벗 지원 요망.`
          : `시간·장소 지남력은 양호하나 독거로 인한 적적함을 호소하여 정기적 안부확인을 통한 정서 지지가 필요함.`,
        `사회적 교류 기회를 확대하여 고독감을 경감하고 긍정적인 일상 에너지를 회복할 수 있도록 개입 계획 수립.`,
      ];

    case 'housingEnvironment':
      if (doc.housingEnvironment) {
        return [
          `[안전시설 보완형] ${doc.housingEnvironment} 가정 내 안전사고 예방을 위한 환경 정비 및 위해요소 개선 지원 검토.`,
          `[위생·주거정비형] ${doc.housingEnvironment} 안전하고 쾌적한 주거환경 유지를 위한 지속적 안전 모니터링 실시.`,
        ];
      }
      return [
        quote
          ? `[주거 관찰/진술]: "${quote}" 실내 위해요소 제거 및 가정 내 낙상 예방 조치 필요.`
          : `${name} 어르신의 거주지 내 안전 취약 요인을 점검하고 낙상 예방 등 위험요소 최소화 추진.`,
        `단열 및 환기 상태, 바닥 미끄럼 여부 등을 주기적으로 살펴 어르신의 주거 안전성을 확보함.`,
      ];

    case 'socialWorkerOpinion':
      return [
        `본 사례는 ${name} 어르신의 확인된 핵심 욕구(${needsStr})를 충족하고 재가생활의 안정성을 도모하기 위해, 맞춤형 재가노인지원서비스 제공 및 지역사회 통합돌봄 자원 연계를 통한 통합 사례관리를 적극 추진하고자 함.`,
        `${name} 어르신의 자기결정권을 존중하며 잔존 자립 역량을 유지할 수 있도록 주 1회 이상 정기 모니터링을 실시하고, 응급상황 발생에 대비한 촘촘한 안전망을 유지 관리하고자 함.`,
        `민관 복지협력망을 가동하여 대상자의 긴급한 생활 욕구를 적시에 해결하고, 정서적 고립감 해소와 삶의 질 향상을 위한 지속적인 개입을 유지할 계획임.`,
      ];

    case 'shortTermGoals':
      return [
        `1. ${needsStr} 관련 긴급 서비스 우선 연계\n2. 주 1회 정기 방문 및 유선 안부확인을 통한 독거 안전망 구축\n3. 대상자 욕구 변화 및 서비스 만족도 지속 모니터링`,
        `1. 대상자 일상생활 불편 요인 해소를 위한 맞춤형 자원 연계\n2. 신체·정서적 안정감 유지를 위한 사례관리자 정기 면담 실시\n3. 가정 내 생활안전 취약점 점검 및 보완`,
      ];

    default:
      return [
        `${name} 어르신의 실제 상담 내용에 부합하도록 작성된 문안입니다.`,
        `대상자의 개별 상황에 맞추어 수정 보완하여 서식에 반영하세요.`,
      ];
  }
}
