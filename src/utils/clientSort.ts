import { ClientProfile } from '../types';

export type ClientSortOption = 'recent' | 'name' | 'risk';

/**
 * Returns numerical weight for risk level where high risk (최중점/고위험) is prioritized first
 */
export function getRiskRank(riskLevel: string): number {
  if (riskLevel.includes('최') || riskLevel.includes('고')) return 1;
  if (riskLevel.includes('중')) return 2;
  return 3;
}

/**
 * Sorts an array of ClientProfile according to selected criterion:
 * - 'recent': Recently added clients first (newest registrationDate or ID)
 * - 'name': Alphabetical order (가나다순 / A-Z)
 * - 'risk': Highest risk level first (고위험/최중점 -> 중위험/중점 -> 일반)
 */
export function sortClients(clients: ClientProfile[], sortOption: ClientSortOption): ClientProfile[] {
  const cloned = [...clients];

  switch (sortOption) {
    case 'recent':
      return cloned.sort((a, b) => {
        // 1. Compare registrationDate (YYYY-MM-DD)
        const dateA = a.registrationDate || '';
        const dateB = b.registrationDate || '';
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA); // Newest date first
        }

        // 2. Fallback to client ID (e.g. client-1725... or client-2)
        const idTimestampA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const idTimestampB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        if (idTimestampA !== idTimestampB) {
          return idTimestampB - idTimestampA; // Larger timestamp or number first
        }

        return b.id.localeCompare(a.id);
      });

    case 'name':
      return cloned.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    case 'risk':
      return cloned.sort((a, b) => {
        const rankA = getRiskRank(a.riskLevel);
        const rankB = getRiskRank(b.riskLevel);
        if (rankA !== rankB) {
          return rankA - rankB; // 1 (최중점) -> 2 (중점) -> 3 (일반)
        }
        // If same risk level, secondary sort by name
        return a.name.localeCompare(b.name, 'ko');
      });

    default:
      return cloned;
  }
}
