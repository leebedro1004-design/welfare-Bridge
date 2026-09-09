import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { CaseDocument, ClientProfile, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS } from './documentTemplates';
import { getEffectiveAgencyName, resolveDocumentAuthor } from './userSettingsHelper';

// Standard Ministry form codes
const MOHW_FORM_NUMBERS: Record<string, { code: string; title: string; act: string }> = {
  intake: {
    code: '[별지 제1호 서식]',
    title: '재가노인지원서비스 초기상담 및 접수기록지',
    act: '노인복지법 시행규칙 제24조 및 보건복지부 노인보건복지사업안내',
  },
  assessment: {
    code: '[별지 제2호 서식]',
    title: '재가노인지원서비스 종합사정표 (Assessment)',
    act: '노인복지법 제38조 및 재가노인지원서비스 운영매뉴얼',
  },
  scoring: {
    code: '[별지 제3호 서식]',
    title: '어르신 위기도 및 욕구 사정 척도 검사표 (ADL·IADL·우울)',
    act: '보건복지부 재가노인지원서비스 표준 척도 기준',
  },
  case_conference: {
    code: '[별지 제4호 서식]',
    title: '사례회의록 (전문사례관리 판정 회의)',
    act: '재가노인지원서비스 사례관리 표준 업무지침',
  },
  service_plan: {
    code: '[별지 제5호 서식]',
    title: '개인별 사례관리 및 맞춤형 서비스 제공계획서',
    act: '노인복지법 시행규칙 제24조의2',
  },
  agreement: {
    code: '[별지 제6호 서식]',
    title: '재가노인지원서비스 이용 및 개인정보 수집·이용 동의서',
    act: '개인정보 보호법 제15조 및 사회복지사업법 제33조',
  },
  monitoring: {
    code: '[별지 제7호 서식]',
    title: '서비스 제공 모니터링 및 중간 점검 일지',
    act: '재가노인지원서비스 사후관리 운영 매뉴얼',
  },
  reassessment: {
    code: '[별지 제8호 서식]',
    title: '재사정 및 서비스 지속여부 평가서 (Re-Assessment)',
    act: '재가노인지원서비스 연간 재사정 지침',
  },
  termination: {
    code: '[별지 제9호 서식]',
    title: '사례관리 종결보고서 및 사후관리 계획서',
    act: '재가노인지원서비스 종결 및 사후관리 규정',
  },
  referral: {
    code: '[별지 제10호 서식]',
    title: '외부 전문기관 자원연계 및 사례의뢰서',
    act: '지역사회 보장협의체 및 민관협력 연계 지침',
  },
};

/**
 * Creates an offscreen DOM element representing the standard Ministry document format
 */
function createDocumentDom(doc: CaseDocument, client?: ClientProfile, userSettings?: UserSettings): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '780px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.padding = '36px 40px';
  container.style.fontFamily = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.6';
  container.style.boxSizing = 'border-box';

  const formMeta = MOHW_FORM_NUMBERS[doc.documentType] || {
    code: '[표준 서식]',
    title: doc.title || '재가노인지원서비스 사례관리 기록서식',
    act: '노인복지법 및 재가노인지원서비스 표준 운영지침',
  };

  const agencyName = getEffectiveAgencyName(userSettings, '도봉재가노인지원서비스센터');
  const workerName = resolveDocumentAuthor(doc.author, userSettings);

  const executiveSummaryText = Array.isArray(doc.executiveSummary)
    ? doc.executiveSummary.join(' / ')
    : doc.executiveSummary || '상세 사정 내용 참조';

  const primaryNeedsText = Array.isArray(doc.primaryNeeds)
    ? doc.primaryNeeds.join(', ')
    : doc.primaryNeeds || '신체 건강 및 주거 안정 지원';

  const shortGoalsText = Array.isArray(doc.shortTermGoals)
    ? doc.shortTermGoals.join('; ')
    : doc.shortTermGoals || '일상생활 수행능력(ADL) 유지 및 긴급 안전 모니터링';

  const longGoalsText = Array.isArray(doc.longTermGoals)
    ? doc.longTermGoals.join('; ')
    : doc.longTermGoals || '지역사회 지속 거주(AIP) 실현 및 만성질환 관리 체계화';

  container.innerHTML = `
    <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 11px; font-weight: bold; color: #44403c;">${formMeta.code}</div>
        <div style="font-size: 9px; color: #78716c;">근거: ${formMeta.act}</div>
      </div>
      <table style="border-collapse: collapse; border: 1px solid #000; text-align: center; font-size: 10px; width: 190px;">
        <thead>
          <tr style="background-color: #f5f5f4; border-bottom: 1px solid #000;">
            <th rowspan="2" style="border-right: 1px solid #000; padding: 2px 4px; width: 32px; font-weight: bold;">결<br/>재</th>
            <th style="border-right: 1px solid #000; padding: 2px 4px; font-weight: bold;">담 당</th>
            <th style="border-right: 1px solid #000; padding: 2px 4px; font-weight: bold;">팀 장</th>
            <th style="padding: 2px 4px; font-weight: bold;">센터장</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 38px;">
            <td style="border-right: 1px solid #000; vertical-align: bottom; padding: 2px; font-size: 9px; color: #57534e;">${workerName.slice(0, 4)}</td>
            <td style="border-right: 1px solid #000;"></td>
            <td style="border-right: 1px solid #000;"></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="text-align: center; margin: 18px 0 14px 0;">
      <h1 style="font-size: 20px; font-weight: 800; text-decoration: underline; text-underline-offset: 6px; margin: 0 0 6px 0; letter-spacing: 1px;">
        ${formMeta.title}
      </h1>
      <p style="font-size: 11px; color: #57534e; margin: 0;">
        사례관리 대상자: <strong>${doc.clientName || client?.name || '미지정'}</strong> 어르신 
        (관리번호: ${doc.clientId || client?.id || 'CB-001'})
      </p>
    </div>

    <!-- Client Info Table -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px; margin-bottom: 14px;">
      <tbody>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; width: 85px; font-weight: bold; text-align: center;">성 명</th>
          <td style="border-right: 1px solid #000; padding: 6px; width: 130px; font-weight: bold;">${doc.clientName || client?.name}</td>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; width: 85px; font-weight: bold; text-align: center;">연령/성별</th>
          <td style="border-right: 1px solid #000; padding: 6px; width: 130px;">${client?.age ? client.age + '세' : '82세'} (${client?.gender || '여'})</td>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; width: 80px; font-weight: bold; text-align: center;">위기도</th>
          <td style="padding: 6px; text-align: center; font-weight: bold; color: ${doc.riskLevel === '고위험' ? '#b91c1c' : '#b45309'};">
            ${doc.riskLevel || client?.riskLevel || '중위험'}
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">주거 형태</th>
          <td style="border-right: 1px solid #000; padding: 6px;">${client?.livingType || '독거노인'}</td>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">수급 자격</th>
          <td colspan="3" style="padding: 6px;">${client?.welfareType || '기초생활수급자(생계/의료)'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">주 소</th>
          <td colspan="5" style="padding: 6px;">${client?.address || '서울특별시 도봉구 방학동'}</td>
        </tr>
        <tr>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">작성일/담당자</th>
          <td colspan="5" style="padding: 6px;">
            작성일자: <strong>${doc.createdAt || new Date().toISOString().slice(0, 10)}</strong> | 
            담당 사회복지사: <strong>${workerName}</strong> | 
            진행상태: <strong>${doc.status || '결재완료'}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Main Content Section -->
    <div style="border: 1px solid #000; padding: 12px; margin-bottom: 12px; background-color: #ffffff;">
      <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 6px 0; color: #1c1917; border-bottom: 1px dashed #78716c; padding-bottom: 4px;">
        1. AI 상담 분석 요약 및 핵심 호소 사정
      </h3>
      <p style="font-size: 11px; margin: 0 0 8px 0; color: #292524; white-space: pre-line;">
        ${executiveSummaryText}
      </p>
      <div style="font-size: 10px; color: #57534e; background-color: #fafaf9; padding: 6px 8px; border-radius: 4px;">
        <strong>핵심 욕구:</strong> ${primaryNeedsText}
      </div>
    </div>

    <!-- Detailed Assessment Domains -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px; margin-bottom: 12px;">
      <tbody>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; width: 110px; font-weight: bold; text-align: center;">신체·건강 상태</th>
          <td style="padding: 6px;">${doc.physicalHealthStatus || client?.chronicDiseases?.join(', ') || '만성 무릎관절염 및 고혈압 투약 관리 필요'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">일상동작(ADL)</th>
          <td style="padding: 6px;">${doc.adlStatus || '실내 보행 가능하나 외출 및 무거운 짐 운반 시 낙상 위험 높음'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">정서·심리 상태</th>
          <td style="padding: 6px;">${doc.emotionalCognitiveStatus || '사회적 고립감 호소, 정기적인 안부 확인 및 말벗 서비스 선호'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">주거·안전 환경</th>
          <td style="padding: 6px;">${doc.housingEnvironment || '노후 단독주택 지하 거주, 문턱 단차로 인한 실내 안전손잡이 설치 요망'}</td>
        </tr>
        <tr>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">사회복지사 총괄의견</th>
          <td style="padding: 6px; font-weight: 500;">${doc.socialWorkerOpinion || '고위험 독거 어르신으로 주 2회 방문상담 및 밑반찬 배달, 복지관 안전 지지체계 즉각 연계 적합함.'}</td>
        </tr>
      </tbody>
    </table>

    <!-- Goals & Service Plan -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10.5px; margin-bottom: 14px;">
      <tbody>
        <tr style="border-bottom: 1px solid #000;">
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; width: 110px; font-weight: bold; text-align: center;">단기 목표</th>
          <td style="padding: 6px;">${shortGoalsText}</td>
        </tr>
        <tr>
          <th style="background-color: #f5f5f4; border-right: 1px solid #000; padding: 6px; font-weight: bold; text-align: center;">장기 목표</th>
          <td style="padding: 6px;">${longGoalsText}</td>
        </tr>
      </tbody>
    </table>

    <!-- Footer Agency Seal -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 10px; border-top: 1px solid #78716c;">
      <div style="font-size: 10px; color: #78716c;">
        본 문서는 재가노인지원서비스 스마트 사례관리 시스템에 의해 전자적으로 공인 출력되었습니다.
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 12px; font-weight: bold; letter-spacing: 1px;">${agencyName}</span>
        <div style="width: 32px; height: 32px; border: 1.5px solid #dc2626; color: #dc2626; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; line-height: 1;">
          관인<br/>생략
        </div>
      </div>
    </div>
  `;

  return container;
}

/**
 * Exports a single CaseDocument as a PDF Blob and appropriate file name
 */
export async function exportDocumentToPdfBlob(
  doc: CaseDocument,
  client?: ClientProfile,
  userSettings?: UserSettings
): Promise<{ fileName: string; blob: Blob }> {
  const container = createDocumentDom(doc, client, userSettings);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2.0,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Subsequent pages if long
    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const typeLabel = DOCUMENT_TYPE_LABELS[doc.documentType]?.short || '서식';
    const clientName = doc.clientName || client?.name || '어르신';
    const dateStr = doc.createdAt || new Date().toISOString().slice(0, 10);
    const fileName = `[표준서식]_${clientName}_${typeLabel}_${dateStr}.pdf`;

    const blob = pdf.output('blob');
    return { fileName, blob };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Bulk exports multiple CaseDocuments as a single downloadable ZIP file
 */
export async function bulkExportDocumentsToZip(
  docs: CaseDocument[],
  clients: ClientProfile[] = [],
  userSettings?: UserSettings,
  onProgress?: (current: number, total: number) => void
): Promise<{ zipBlob: Blob; zipFileName: string; count: number }> {
  if (!docs || docs.length === 0) {
    throw new Error('내보낼 문서가 선택되지 않았습니다.');
  }

  const zip = new JSZip();
  const dateStr = new Date().toISOString().slice(0, 10);
  const zipFileName = `재가노인지원_사례관리서식_일괄출력_${dateStr}.zip`;

  const clientMap = new Map<string, ClientProfile>();
  clients.forEach((c) => clientMap.set(c.id, c));

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (onProgress) {
      onProgress(i + 1, docs.length);
    }

    const client = clientMap.get(doc.clientId) || clients.find((c) => c.name === doc.clientName);
    const { fileName, blob } = await exportDocumentToPdfBlob(doc, client, userSettings);

    // Ensure unique file name inside zip if duplicate names exist
    let uniqueName = fileName;
    let counter = 1;
    while (zip.file(uniqueName)) {
      uniqueName = fileName.replace('.pdf', `_(${counter}).pdf`);
      counter++;
    }

    zip.file(uniqueName, blob);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    zipBlob,
    zipFileName,
    count: docs.length,
  };
}

/**
 * Triggers browser download of a Blob
 */
export function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
