import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  Stamp,
  Sliders,
  Sparkles,
  Eye
} from 'lucide-react';
import { CaseDocument, ClientProfile, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

interface OfficialPrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
}

// Ministry of Health & Welfare standard form codes
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
    title: '사례종결 보고서 및 사후관리 계획서',
    act: '재가노인지원서비스 사례관리 종결 기준',
  },
  referral: {
    code: '[별지 제10호 서식]',
    title: '타기관 서비스 연계 및 의뢰서 (Referral)',
    act: '지역사회 보장협의체 및 민관협력 연계 지침',
  },
};

export const OfficialPrintExportModal: React.FC<OfficialPrintExportModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  client,
  userSettings,
}) => {
  const [includeApprovalBox, setIncludeApprovalBox] = useState<boolean>(true);
  const [includeOfficialSeal, setIncludeOfficialSeal] = useState<boolean>(true);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('보건복지부 표준 원본');
  const [printFontScale, setPrintFontScale] = useState<'normal' | 'compact' | 'large'>('normal');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const previewSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formMeta = MOHW_FORM_NUMBERS[doc.documentType] || {
    code: '[표준 서식]',
    title: doc.title,
    act: '보건복지부 노인보건복지사업안내',
  };

  const agencyName = userSettings?.agencyName || userSettings?.institutionName || '도봉재가노인지원서비스센터';
  const workerName = doc.author || userSettings?.socialWorkerName || userSettings?.workerName || '이현정 사회복지사';
  const sealText = userSettings?.sealText || `${agencyName}장인`;

  // Print via browser
  const handleDirectPrint = () => {
    window.print();
  };

  // High Resolution PDF Generation & Download
  const handleExportStandardPdf = async () => {
    if (!previewSheetRef.current) return;
    setIsExporting(true);
    setExportToast('보건복지부 표준 양식 규격에 맞춰 고해상도 PDF를 생성 중입니다...');

    try {
      await new Promise((r) => setTimeout(r, 150));
      const element = previewSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
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

      // First Page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Multi-page support
      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `[보건복지부표준_${formMeta.code}]_${doc.clientName || '어르신'}_${DOCUMENT_TYPE_LABELS[doc.documentType]?.short || '서식'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      setExportToast(`${fileName} 저장이 완료되었습니다.`);
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
      } catch (e) {}
      setTimeout(() => setExportToast(null), 3000);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setExportToast('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(PDF 저장)를 이용해 주세요.');
      setTimeout(() => setExportToast(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#1C1715] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-6xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                  {formMeta.code}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  보건복지부 표준 서식 인쇄 및 공문서 PDF 저장 모듈
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                노인보건복지 사업안내 규정에 최적화된 결재선·관인 직인·표준 서식 테이블 규격을 적용합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Controls & Real-time A4 Print Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* LEFT SIDEBAR: Print/PDF Options (4 Cols) */}
          <div className="lg:col-span-4 p-5 border-r border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#221D1A] space-y-5 overflow-y-auto max-h-[75vh]">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                공문서 출력 서식 설정
              </h4>

              {/* Approval Box Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={includeApprovalBox}
                  onChange={(e) => setIncludeApprovalBox(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    3단 결재란 표시 (담당/팀장/센터장)
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    표준 문서 상단 우측에 내부 결재용 결재선 테이블을 배치합니다.
                  </div>
                </div>
              </label>

              {/* Official Seal Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={includeOfficialSeal}
                  onChange={(e) => setIncludeOfficialSeal(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-rose-600" />
                    기관 관인(직인) 전자 날인
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    하단 기관명 위에 붉은색 정식 관인 전자 도장을 날인합니다.
                  </div>
                </div>
              </label>

              {/* Watermark Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs w-full">
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    배경 워터마크 표시
                  </div>
                  <div className="text-stone-500 text-[11px] mb-1.5">
                    대외 제출용 또는 원본 진위 확인 워터마크를 삽입합니다.
                  </div>
                  {includeWatermark && (
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      placeholder="워터마크 문구 입력"
                    />
                  )}
                </div>
              </label>

              {/* Font Density */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 space-y-1.5 text-xs">
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  인쇄 폰트 및 여백 밀도
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['compact', 'normal', 'large'] as const).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setPrintFontScale(scale)}
                      className={`py-1 text-xs rounded-lg border font-semibold cursor-pointer ${
                        printFontScale === scale
                          ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-200'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {scale === 'compact' ? '축약형' : scale === 'normal' ? '표준(권장)' : '확대형'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={handleExportStandardPdf}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'PDF 변환 생성 중...' : '보건복지부 표준 PDF 다운로드'}</span>
              </button>

              <button
                type="button"
                onClick={handleDirectPrint}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>브라우저 인쇄 / 직접 출력</span>
              </button>
            </div>

            {exportToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{exportToast}</span>
              </div>
            )}
          </div>

          {/* RIGHT PREVIEW: Real A4 Standard Document Layout (8 Cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-stone-200/80 dark:bg-[#151210] overflow-y-auto max-h-[75vh] flex justify-center">
            {/* A4 Paper Sheet Container */}
            <div
              ref={previewSheetRef}
              className={`w-full max-w-[780px] bg-white text-black p-8 sm:p-10 shadow-2xl border border-stone-300 rounded-sm relative text-left leading-relaxed ${
                printFontScale === 'compact' ? 'text-[11px]' : printFontScale === 'large' ? 'text-[13px]' : 'text-xs'
              }`}
              style={{ minHeight: '1050px', fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif' }}
            >
              {/* Optional Watermark Overlay */}
              {includeWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-10 rotate-[-30deg] select-none text-5xl font-black tracking-widest text-stone-900">
                  {watermarkText}
                </div>
              )}

              {/* Standard Header Row */}
              <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4">
                <div>
                  <div className="text-[11px] font-bold text-stone-600 tracking-wider">
                    {formMeta.code}
                  </div>
                  <div className="text-[9px] text-stone-500">
                    근거: {formMeta.act}
                  </div>
                </div>

                {/* 3-Step Approval Box */}
                {includeApprovalBox && (
                  <table className="border-collapse border border-black text-center text-[10px] w-56 ml-auto">
                    <thead>
                      <tr className="bg-stone-100 border-b border-black">
                        <th className="border-r border-black py-0.5 w-10 font-bold" rowSpan={2}>
                          결<br />재
                        </th>
                        {(userSettings?.approvalStepTitles || ['담 당', '팀 장', '센터장']).map((title, i) => (
                          <th key={i} className="border-r last:border-r-0 border-black py-0.5 font-bold">
                            {title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-12 border-b border-black">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black relative">
                          <span className="text-[9px] text-stone-500 absolute bottom-1 left-0 right-0">
                            {workerName.split(' ')[0]}
                          </span>
                        </td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Document Main Title */}
              <div className="text-center my-6 space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider underline underline-offset-8 decoration-1">
                  {formMeta.title}
                </h1>
                <p className="text-[11px] text-stone-600 pt-2 font-medium">
                  사례관리 대상자: <strong>{doc.clientName || client?.name || '미지정'}</strong> 어르신
                  (관리번호: {doc.clientId || client?.id || 'CB-001'})
                </p>
              </div>

              {/* Client Basic Info Standard Table */}
              <table className="w-full border-collapse border border-black text-[11px] mb-4">
                <tbody>
                  <tr className="border-b border-black">
                    <th className="bg-stone-100 border-r border-black p-1.5 w-24 font-bold text-center">
                      성 명
                    </th>
                    <td className="border-r border-black p-1.5 w-36 font-semibold">
                      {doc.clientName || client?.name}
                    </td>
                    <th className="bg-stone-100 border-r border-black p-1.5 w-24 font-bold text-center">
                      생년월일(연령)
                    </th>
                    <td className="border-r border-black p-1.5 w-36">
                      {client?.birthDate || '1945-03-12'} ({client?.age || 81}세, {client?.gender || '여'})
                    </td>
                    <th className="bg-stone-100 border-r border-black p-1.5 w-20 font-bold text-center">
                      위기도
                    </th>
                    <td className="p-1.5 font-bold text-center">
                      {doc.riskLevel || client?.riskLevel || '고위험'}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <th className="bg-stone-100 border-r border-black p-1.5 font-bold text-center">
                      주거 형태
                    </th>
                    <td className="border-r border-black p-1.5">
                      {client?.livingType || '독거노인'}
                    </td>
                    <th className="bg-stone-100 border-r border-black p-1.5 font-bold text-center">
                      수급 자격
                    </th>
                    <td className="border-r border-black p-1.5" colSpan={3}>
                      {client?.welfareType || '국민기초생활수급자(생계/의료)'}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-stone-100 border-r border-black p-1.5 font-bold text-center">
                      주 소
                    </th>
                    <td className="border-r border-black p-1.5" colSpan={3}>
                      {client?.address || '서울특별시 도봉구 쌍문동'}
                    </td>
                    <th className="bg-stone-100 border-r border-black p-1.5 font-bold text-center">
                      연락처
                    </th>
                    <td className="p-1.5">
                      {client?.phone || '010-3849-2918'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Assessment & Notes Content Block */}
              <div className="space-y-4 my-4">
                {doc.physicalHealthStatus && (
                  <div className="border border-black p-3 space-y-1">
                    <div className="font-bold text-[11px] bg-stone-100 p-1 -m-3 mb-2 border-b border-black">
                      1. 신체 및 일상생활동작(ADL/IADL) 수행 상태
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-stone-900">
                      {doc.physicalHealthStatus}
                    </div>
                  </div>
                )}

                {doc.emotionalCognitiveStatus && (
                  <div className="border border-black p-3 space-y-1">
                    <div className="font-bold text-[11px] bg-stone-100 p-1 -m-3 mb-2 border-b border-black">
                      2. 정서·인지 및 사회심리 상태 (우울·인지 검사)
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-stone-900">
                      {doc.emotionalCognitiveStatus}
                    </div>
                  </div>
                )}

                {doc.housingEnvironment && (
                  <div className="border border-black p-3 space-y-1">
                    <div className="font-bold text-[11px] bg-stone-100 p-1 -m-3 mb-2 border-b border-black">
                      3. 주거환경 및 안전 위협 요인
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-stone-900">
                      {doc.housingEnvironment}
                    </div>
                  </div>
                )}

                {doc.socialWorkerOpinion && (
                  <div className="border border-black p-3 space-y-1">
                    <div className="font-bold text-[11px] bg-stone-100 p-1 -m-3 mb-2 border-b border-black">
                      4. 사회복지사 종합 사정 및 서비스 개입 의견
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-stone-900 font-medium">
                      {doc.socialWorkerOpinion}
                    </div>
                  </div>
                )}

                {/* Service Plan Table if plan form */}
                {doc.servicePlanItems && doc.servicePlanItems.length > 0 && (
                  <div className="border border-black">
                    <div className="font-bold text-[11px] bg-stone-100 p-1 border-b border-black">
                      5. 맞춤형 서비스 지원 계획 세부 목록
                    </div>
                    <table className="w-full text-center border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-stone-50 border-b border-black">
                          <th className="border-r border-black p-1">영역</th>
                          <th className="border-r border-black p-1">서비스 항목</th>
                          <th className="border-r border-black p-1">제공 주기</th>
                          <th className="border-r border-black p-1">제공 기관</th>
                          <th className="p-1">담당자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.servicePlanItems.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 border-black">
                            <td className="border-r border-black p-1 font-semibold">{item.category}</td>
                            <td className="border-r border-black p-1 text-left">{item.serviceName}</td>
                            <td className="border-r border-black p-1">{item.frequency}</td>
                            <td className="border-r border-black p-1">{item.provider}</td>
                            <td className="p-1">{item.worker}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Official Seal Footer */}
              <div className="mt-12 pt-6 border-t-2 border-black text-center space-y-4 relative">
                <div className="text-xs text-stone-700">
                  위와 같이 재가노인지원서비스 운영규정 및 보건복지부 지침에 따라 사례관리 서식을 작성 및 보고합니다.
                </div>
                <div className="text-xs font-bold text-stone-800">
                  작성일자: {doc.createdAt || new Date().toISOString().slice(0, 10)}
                </div>
                <div className="text-sm font-extrabold text-stone-900 tracking-widest pt-2">
                  작성자: {workerName} (서명 / 인)
                </div>

                {/* Institution Name & Seal */}
                <div className="pt-4 flex items-center justify-center gap-2 relative">
                  <span className="text-base font-black tracking-widest text-stone-900">
                    {agencyName}
                  </span>

                  {/* Stamp Graphic */}
                  {includeOfficialSeal && (
                    <div className="w-16 h-16 rounded-full border-2 border-rose-600 flex items-center justify-center p-1 text-[10px] font-black text-rose-600 transform rotate-[-6deg] absolute right-16 sm:right-32 select-none">
                      <div className="border border-dashed border-rose-400 w-full h-full rounded-full flex items-center justify-center text-center leading-tight">
                        {sealText.slice(0, 6)}<br />{sealText.slice(6) || '직인'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
