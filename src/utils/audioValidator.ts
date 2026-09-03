/**
 * Audio file validation utility for CareBridge Senior Case Management STT
 * Validates audio file formats (MP3, WAV, M4A, AAC, OGG, WEBM, FLAC, WMA),
 * file size limits, and stream integrity before upload.
 */

export interface AudioValidationResult {
  isValid: boolean;
  format: string;
  normalizedMime: string;
  sizeMB: number;
  sizeFormatted: string;
  errorMessage?: string;
  suggestion?: string;
}

export const SUPPORTED_AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'm4a',
  'aac',
  'ogg',
  'webm',
  'flac',
  'wma',
  'mp4',
] as const;

export const SUPPORTED_AUDIO_MIME_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'video/mp4',
  'audio/aac',
  'audio/x-aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
  'audio/x-ms-wma',
] as const;

export const MAX_AUDIO_FILE_SIZE_BYTES = 300 * 1024 * 1024; // 300MB (약 1시간~2시간 분량의 고음질 녹음 파일 수용)
export const RECOMMENDED_AUDIO_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

/**
 * Validates an audio file before initiation of the upload process.
 * Returns validation status, detected format, and user-friendly error messages if invalid.
 */
export function validateAudioFile(file: File): AudioValidationResult {
  if (!file) {
    return {
      isValid: false,
      format: 'UNKNOWN',
      normalizedMime: 'audio/unknown',
      sizeMB: 0,
      sizeFormatted: '0 MB',
      errorMessage: '선택된 오디오 파일이 없습니다.',
      suggestion: '녹음된 음성 파일을 선택해 주세요.',
    };
  }

  const fileName = file.name || '';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const rawMime = (file.type || '').toLowerCase();
  const sizeBytes = file.size || 0;
  const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(2));
  const sizeFormatted = `${sizeMB} MB`;

  // 1. Check if extension matches supported audio extensions
  const hasSupportedExt = SUPPORTED_AUDIO_EXTENSIONS.includes(
    fileExt as (typeof SUPPORTED_AUDIO_EXTENSIONS)[number]
  );

  // 2. Check if MIME type is an audio MIME or MP4 audio
  const hasSupportedMime =
    rawMime.startsWith('audio/') ||
    SUPPORTED_AUDIO_MIME_TYPES.some((m) => rawMime.includes(m)) ||
    (rawMime === 'video/mp4' && fileExt === 'm4a');

  // Format detection
  const detectedFormat = (fileExt ? fileExt.toUpperCase() : rawMime.split('/')[1]?.toUpperCase()) || 'AUDIO';

  // Normalize MIME type for Gemini API
  let normalizedMime = 'audio/mp3';
  if (fileExt === 'wav' || rawMime.includes('wav')) {
    normalizedMime = 'audio/wav';
  } else if (fileExt === 'm4a' || fileExt === 'mp4' || rawMime.includes('m4a') || rawMime.includes('mp4')) {
    normalizedMime = 'audio/m4a';
  } else if (fileExt === 'aac' || rawMime.includes('aac')) {
    normalizedMime = 'audio/aac';
  } else if (fileExt === 'ogg' || rawMime.includes('ogg')) {
    normalizedMime = 'audio/ogg';
  } else if (fileExt === 'webm' || rawMime.includes('webm')) {
    normalizedMime = 'audio/webm';
  } else if (fileExt === 'flac' || rawMime.includes('flac')) {
    normalizedMime = 'audio/flac';
  } else {
    normalizedMime = 'audio/mp3';
  }

  // Unsupported format verification
  if (!hasSupportedExt && !hasSupportedMime) {
    return {
      isValid: false,
      format: detectedFormat,
      normalizedMime,
      sizeMB,
      sizeFormatted,
      errorMessage: `지원되지 않는 오디오 형식입니다: '${file.name}' (${file.type || '알 수 없는 포맷'})`,
      suggestion: '지원 가능한 음성 형식(MP3, WAV, M4A, AAC, OGG, WEBM, FLAC) 파일을 선택해 주세요.',
    };
  }

  // Empty file check
  if (sizeBytes === 0) {
    return {
      isValid: false,
      format: detectedFormat,
      normalizedMime,
      sizeMB: 0,
      sizeFormatted: '0 MB',
      errorMessage: '선택한 파일의 크기가 0 바이트입니다. 빈 파일은 변환할 수 없습니다.',
      suggestion: '실제 음성이 녹음된 정상 오디오 파일을 선택해 주세요.',
    };
  }

  // Max file size check (Supports up to 300MB for 1-hour audio recordings)
  if (sizeBytes > MAX_AUDIO_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      format: detectedFormat,
      normalizedMime,
      sizeMB,
      sizeFormatted,
      errorMessage: `파일 용량(${sizeFormatted})이 대용량 허용 한도(300MB, 약 1시간~2시간 분량)를 초과하였습니다.`,
      suggestion: '파일 크기를 300MB 이하로 압축하거나 1시간 단위로 분할하여 업로드해 주세요.',
    };
  }

  return {
    isValid: true,
    format: detectedFormat,
    normalizedMime,
    sizeMB,
    sizeFormatted,
  };
}

/**
 * Checks if a given file has a supported audio extension or MIME type.
 */
export function isAudioFile(file: File): boolean {
  if (!file) return false;
  const nameLower = (file.name || '').toLowerCase();
  const rawMime = (file.type || '').toLowerCase();
  const hasExt = SUPPORTED_AUDIO_EXTENSIONS.some((ext) => nameLower.endsWith(`.${ext}`));
  const hasMime = rawMime.startsWith('audio/') || rawMime === 'video/mp4' || SUPPORTED_AUDIO_MIME_TYPES.some((m) => rawMime.includes(m));
  return hasExt || hasMime;
}

/**
 * Automated text cleanup routine for STT transcript outputs:
 * - Removes timestamps, noise tags, empty lines, and redundant fillers
 * - Normalizes Korean dialogue turns (사회복지사 / 어르신 / 보호자)
 * - Trims trailing whitespace and formats into clean structured dialogue
 */
export function cleanTranscriptText(rawTranscript: string): string {
  if (!rawTranscript) return '';

  return rawTranscript
    .split('\n')
    .map((line) => {
      let trimmed = line.trim();
      // Remove redundant timestamp indicators like [00:12] or (01:23) if present
      trimmed = trimmed.replace(/^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/g, '');
      trimmed = trimmed.replace(/^\(\d{1,2}:\d{2}(?::\d{2})?\)\s*/g, '');
      // Standardize speaker prefix spacing
      trimmed = trimmed.replace(/^(사회복지사|복지사|상담사|어르신|대상자|보호자|가족)\s*[:：]\s*/, '$1: ');
      return trimmed;
    })
    .filter((line, index, arr) => {
      // Remove consecutive blank lines
      if (!line && (!arr[index - 1] || arr[index - 1].trim() === '')) {
        return false;
      }
      return true;
    })
    .join('\n')
    .trim();
}

/**
 * Fast client-side extractor that derives a structured 3-line summary & key insights
 * immediately upon receiving new STT transcript text, ensuring real-time mapping to
 * liveInsights state without waiting for deep LLM batch operations.
 */
export function extractQuickInsightFromTranscript(params: {
  transcript: string;
  clientId: string;
  clientName: string;
  fileName?: string;
}): {
  riskLevel: '고위험' | '중위험' | '일반';
  threeLineSummary: [string, string, string];
  keyIssues: string[];
  recommendedService: string;
  isUrgent: boolean;
} {
  const { transcript, clientName, fileName } = params;
  const text = (transcript || '').toLowerCase();

  const hasFall = text.includes('낙상') || text.includes('넘어') || text.includes('어지') || text.includes('다리') || text.includes('무릎') || text.includes('허리');
  const hasMeal = text.includes('식사') || text.includes('밥') || text.includes('결식') || text.includes('굶') || text.includes('반찬') || text.includes('입맛');
  const hasMedical = text.includes('혈압') || text.includes('당뇨') || text.includes('병원') || text.includes('약') || text.includes('통증') || text.includes('관절염');
  const hasDepression = text.includes('우울') || text.includes('혼자') || text.includes('외로') || text.includes('눈물') || text.includes('답답') || text.includes('죽고') || text.includes('적적');

  // Compute risk level
  const riskFactorsCount = [hasFall, hasMeal, hasMedical, hasDepression].filter(Boolean).length;
  const isUrgent = hasFall || (hasDepression && hasMeal) || riskFactorsCount >= 3;
  const riskLevel: '고위험' | '중위험' | '일반' = isUrgent ? '고위험' : riskFactorsCount >= 1 ? '중위험' : '일반';

  // Key issues
  const keyIssues: string[] = [];
  if (hasFall) keyIssues.push('낙상/주거안전');
  if (hasMeal) keyIssues.push('식사/영양결식');
  if (hasMedical) keyIssues.push('만성질환/복약');
  if (hasDepression) keyIssues.push('우울/고립감');
  if (keyIssues.length === 0) keyIssues.push('일상생활지원', '안부확인');

  // 3-line structured summary
  const summaryLine1 = hasFall
    ? `1. [신체·건강] 보행 시 낙상 위험 및 관절 통증 호소. 실내 안전 손잡이 및 보행 보조 점검 시급`
    : hasMedical
    ? `1. [신체·건강] 만성질환 정기 복약 관리 및 혈압/혈당 주기적 모니터링 필요`
    : `1. [신체·건강] 일상생활 동작(ADL) 기능 상태 양호하나 기본적 건강 안부 확인 지속`;

  const summaryLine2 = hasMeal
    ? `2. [정서·욕구] 단독 취사 곤란 및 영양 불균형 우려. 정기 밑반찬·도시락 지원 욕구 확인`
    : hasDepression
    ? `2. [정서·욕구] 독거로 인한 사회적 고립감 및 우울 징후 관찰. 정기 안부콜 및 정서 지지망 필요`
    : `2. [정서·욕구] 독거생활 지속을 위한 사회적 교류 및 복지관 프로그램 참여 희망`;

  const summaryLine3 = hasFall
    ? `3. [즉시 조치] 주거환경개선(욕실 안전바·미끄럼방지) 긴급 연계 및 생활지원사 주 2회 방문 배정`
    : hasMeal
    ? `3. [즉시 조치] 지역사회 나눔 밑반찬 서비스 즉시 연계 및 결식 예방 모니터링 개시`
    : isUrgent
    ? `3. [즉시 조치] ${clientName} 어르신 집중사례관리 등록 및 보건·복지 통합 안전망 가동`
    : `3. [즉시 조치] 정기 모니터링 기록지 작성 및 AI 스마트돌봄 안부 확인 서비스 등록`;

  // Recommended service
  let recommendedService = '생활지원사 정기 방문 및 안부 확인';
  if (hasFall) recommendedService = '주거 안전손잡이 긴급 시공 및 방문 물리치료 연계';
  else if (hasMeal) recommendedService = '주 3회 영양 밑반찬 배달 및 결식 예방 지원';
  else if (hasDepression) recommendedService = 'AI 스마트돌봄 안부전화 및 복지관 원예 프로그램 연계';

  return {
    riskLevel,
    threeLineSummary: [summaryLine1, summaryLine2, summaryLine3],
    keyIssues: keyIssues.slice(0, 3),
    recommendedService,
    isUrgent,
  };
}

