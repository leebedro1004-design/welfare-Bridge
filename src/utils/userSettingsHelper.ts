import { UserSettings } from '../types';

/**
 * Returns the effective institution/agency name, prioritizing user configured values.
 */
export function getEffectiveAgencyName(settings?: UserSettings, fallback = '도봉재가노인지원서비스센터'): string {
  return settings?.agencyName?.trim() || settings?.institutionName?.trim() || fallback;
}

/**
 * Returns the effective worker name (without redundant suffixes).
 */
export function getEffectiveWorkerName(settings?: UserSettings, fallback = '이현정'): string {
  const raw = settings?.workerName?.trim() || settings?.socialWorkerName?.trim() || fallback;
  return raw.replace(/사회복지사|\(인\)|선임|주임/g, '').trim() || fallback;
}

/**
 * Returns the official worker title with '사회복지사' attached.
 */
export function getEffectiveWorkerFullName(settings?: UserSettings, fallback = '이현정 사회복지사'): string {
  const name = settings?.workerName?.trim() || settings?.socialWorkerName?.trim();
  if (!name) return fallback;
  return name.includes('사회복지사') ? name : `${name} 사회복지사`;
}

/**
 * Returns the worker position/role.
 */
export function getEffectiveWorkerPosition(settings?: UserSettings, fallback = '선임 사회복지사'): string {
  return settings?.workerPosition?.trim() || fallback;
}

/**
 * Returns the contact phone for official notices & emergency 119 briefs.
 */
export function getEffectiveContactPhone(settings?: UserSettings, fallback = '02-2600-1111'): string {
  return settings?.contactPhone?.trim() || fallback;
}

/**
 * Returns the official seal text.
 */
export function getEffectiveSealText(settings?: UserSettings, fallback = '도봉재가노인지원서비스센터장인'): string {
  if (settings?.sealText?.trim()) return settings.sealText.trim();
  const agency = getEffectiveAgencyName(settings, '');
  return agency ? `${agency}장인` : fallback;
}

/**
 * Resolves document author, automatically upgrading placeholder names like '이상호 사회복지사'
 * to the configured worker in settings.
 */
export function resolveDocumentAuthor(author?: string, settings?: UserSettings): string {
  const effective = getEffectiveWorkerFullName(settings);
  if (!author || author.includes('이상호') || author.trim() === '담당 사회복지사') {
    return effective;
  }
  return author;
}

/**
 * Resolves institution/agency name, replacing obsolete placeholders like 굿실버 with configured agency.
 */
export function resolveAgencyName(agency?: string, settings?: UserSettings): string {
  const effective = getEffectiveAgencyName(settings);
  if (!agency || agency.includes('굿실버') || agency.includes('은빛재가노인')) {
    return effective;
  }
  return agency;
}
