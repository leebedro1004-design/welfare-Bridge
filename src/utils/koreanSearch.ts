// Utility for Korean Chosung (초성) and multi-field fuzzy search for client records

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * Extract Korean chosungs from text.
 * e.g., '김영순' -> 'ㄱㅇㅅ', '박점순' -> 'ㅂㅈㅅ'
 */
export function extractChosung(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code >= 0 && code <= 11171) {
        return CHOSUNG_LIST[Math.floor(code / 588)];
      }
      return char;
    })
    .join('');
}

/**
 * Check if the query is purely chosung characters
 */
export function isChosungQuery(query: string): boolean {
  const clean = query.replace(/\s+/g, '');
  if (!clean) return false;
  return clean.split('').every((char) => CHOSUNG_LIST.includes(char));
}

export interface SearchableClient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  welfareType: string;
  livingType: string;
  riskLevel: string;
  chronicDiseases: string[];
  longTermCareStatus?: string;
  caseWorker?: string;
  birthDate?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

/**
 * Perform comprehensive client search matching:
 * 1. Name exact/partial match
 * 2. Korean Chosung match (e.g. 'ㄱㅇㅅ' matches '김영순')
 * 3. Phone number & last 4 digits (e.g. '4321', '010-2345-4321')
 * 4. Address & Dong/Street (e.g. '도봉', '방학동')
 * 5. Chronic diseases (e.g. '관절염', '치매', '당뇨', '고혈압')
 * 6. Welfare type & Living type (e.g. '기초수급', '독거')
 * 7. Birth date or age (e.g. '1942', '82')
 */
export function matchClientQuery(client: SearchableClient, query: string): { matched: boolean; matchReason?: string } {
  const trimmed = query.trim();
  if (!trimmed) return { matched: true };

  const lowerQuery = trimmed.toLowerCase();
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');

  // 1. Name Match
  const clientName = client.name || '';
  if (clientName.toLowerCase().includes(lowerQuery)) {
    return { matched: true, matchReason: `성명 일치 (${clientName})` };
  }

  // 2. Chosung Name Match
  const nameChosung = extractChosung(clientName);
  if (nameChosung.includes(trimmed) || (isChosungQuery(trimmed) && nameChosung.startsWith(trimmed))) {
    return { matched: true, matchReason: `초성 일치 (${nameChosung} → ${clientName})` };
  }

  // 3. Phone Number Match (Full or Last 4 digits)
  const clientPhoneDigits = (client.phone || '').replace(/[^0-9]/g, '');
  if (digitsOnly && digitsOnly.length >= 2) {
    if (clientPhoneDigits.includes(digitsOnly)) {
      return { matched: true, matchReason: `전화번호 일치 (${client.phone})` };
    }
    const emergDigits = (client.emergencyContact?.phone || '').replace(/[^0-9]/g, '');
    if (emergDigits.includes(digitsOnly)) {
      return { matched: true, matchReason: `보호자 연락처 일치 (${client.emergencyContact?.phone})` };
    }
  }

  // 4. Address Match
  const clientAddress = client.address || '';
  if (clientAddress.toLowerCase().includes(lowerQuery)) {
    return { matched: true, matchReason: `주소지 일치 (${clientAddress})` };
  }
  const addressChosung = extractChosung(clientAddress);
  if (isChosungQuery(trimmed) && addressChosung.includes(trimmed)) {
    return { matched: true, matchReason: `주소 초성 일치 (${clientAddress})` };
  }

  // 5. Chronic Diseases Match
  const matchingDisease = client.chronicDiseases?.find((d) => {
    if (d.toLowerCase().includes(lowerQuery)) return true;
    if (isChosungQuery(trimmed) && extractChosung(d).includes(trimmed)) return true;
    return false;
  });
  if (matchingDisease) {
    return { matched: true, matchReason: `기저질환 일치 (${matchingDisease})` };
  }

  // 6. Welfare or Living Type Match
  if (client.welfareType?.toLowerCase().includes(lowerQuery)) {
    return { matched: true, matchReason: `수급자격 (${client.welfareType})` };
  }
  if (client.livingType?.toLowerCase().includes(lowerQuery)) {
    return { matched: true, matchReason: `주거형태 (${client.livingType})` };
  }
  if (client.longTermCareStatus?.toLowerCase().includes(lowerQuery)) {
    return { matched: true, matchReason: `장기요양 (${client.longTermCareStatus})` };
  }

  // 7. Birth date match
  if (client.birthDate) {
    const birthClean = client.birthDate.replace(/[^0-9]/g, '');
    if (digitsOnly && digitsOnly.length >= 2 && birthClean.includes(digitsOnly)) {
      return { matched: true, matchReason: `생년월일 일치 (${client.birthDate})` };
    }
  }

  // 8. Risk tier keyword match
  if (trimmed === '최중점' || trimmed === '고위험') {
    if (client.riskLevel.includes('고') || client.riskLevel.includes('최')) {
      return { matched: true, matchReason: '최중점 관리군' };
    }
  }
  if (trimmed === '중점' || trimmed === '중위험') {
    if (client.riskLevel.includes('중')) {
      return { matched: true, matchReason: '중점 관리군' };
    }
  }
  if (trimmed === '일반' || trimmed === '저위험') {
    if (!client.riskLevel.includes('고') && !client.riskLevel.includes('최') && !client.riskLevel.includes('중')) {
      return { matched: true, matchReason: '일반 관리군' };
    }
  }

  return { matched: false };
}
