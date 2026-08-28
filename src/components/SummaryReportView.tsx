import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Share2,
  User,
  Calendar,
  Phone,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Sparkles,
  HeartPulse,
  Home,
  AlertTriangle,
  Building,
  ChevronRight,
  Send,
  Award,
  BookOpen,
  FolderCheck,
  Edit3
} from 'lucide-react';
import { ClientProfile, CaseDocument, ConsultationInsight } from '../types';
import { AppTab } from './Header';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import { CounselingSentimentTrendChart } from './CounselingSentimentTrendChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SummaryReportViewProps {
  clients: ClientProfile[];
  documents: CaseDocument[];
  insights?: ConsultationInsight[];
  selectedClient?: ClientProfile | null;
  onSelectClient?: (client: ClientProfile) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

export const SummaryReportView: React.FC<SummaryReportViewProps> = ({
  clients,
  documents,
  insights = [],
  selectedClient,
  onSelectClient,
  onNavigateTab,
}) => {
  // Active client selection state
  const [activeClientId, setActiveClientId] = useState<string>(
    selectedClient?.id || clients[0]?.id || ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [reportToast, setReportToast] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Active client object
  const currentClient = clients.find((c) => c.id === activeClientId) || clients[0] || selectedClient;

  // Documents belonging to active client
  const clientDocs = React.useMemo(() => {
    if (!currentClient) return [];
    return documents.filter((d) => d.clientId === currentClient.id || d.clientName === currentClient.name);
  }, [documents, currentClient]);

  // Insights belonging to active client
  const clientInsights = React.useMemo(() => {
    if (!currentClient) return [];
    return insights.filter((i) => i.clientName === currentClient.name || i.clientId === currentClient.id);
  }, [insights, currentClient]);

  const handleClientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setActiveClientId(cid);
    const selected = clients.find((c) => c.id === cid);
    if (selected && onSelectClient) {
      onSelectClient(selected);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    setReportToast('어르신 종합 사례관리 보고서 PDF 렌더링 중입니다...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
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

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `${currentClient?.name || '어르신'}_종합사례관리보고서_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      setReportToast(`[PDF 완료] ${fileName} 파일이 다운로드되었습니다.`);
      setTimeout(() => setReportToast(null), 3000);
    } catch (err) {
      console.error(err);
      setReportToast('PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!currentClient) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200">
        <p className="text-stone-500">등록된 어르신 프로필 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-[#2B231F] via-[#382D26] to-[#231B17] rounded-2xl p-6 text-white shadow-md border border-[#4D3F36] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>재가노인지원서비스 공식 기관 보고서 통계 엔진</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>{currentClient.name} 어르신 사례관리 종합 이력 보고서</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              currentClient.riskLevel === '고위험'
                ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                : currentClient.riskLevel === '중위험'
                ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
            }`}>
              {currentClient.riskLevel} 판정
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            선택된 대상자의 10대 법정 표준 서식, AI 상담 녹취 인사이트, 정서 추이 및 통합 서비스 연계 현황을 한눈에 집계한 공문서 표준 종합보고서입니다.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {/* Client Selector Dropdown */}
          <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-1.5 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400 ml-1 shrink-0" />
            <select
              value={activeClientId}
              onChange={handleClientSelectChange}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-2"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-stone-900 text-white">
                  {c.name} ({c.age}세 / {c.riskLevel})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>인쇄</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isGeneratingPdf}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition-all border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'PDF 생성 중...' : 'PDF 다운로드'}</span>
          </button>
        </div>
      </div>

      {/* Report Toast Notification */}
      {reportToast && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          <span>{reportToast}</span>
        </div>
      )}

      {/* Main Printable Document Sheet (공문서 타이포그래피 & 레이아웃 구조) */}
      <div
        ref={printRef}
        className="bg-white dark:bg-[#1C1714] rounded-2xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-md text-stone-900 dark:text-stone-100 space-y-8 print:p-0 print:border-none print:shadow-none select-text"
      >
        {/* Document Official Letterhead Header */}
        <div className="text-center space-y-2 border-b-2 border-amber-900/30 dark:border-amber-500/30 pb-6">
          <div className="inline-block px-3 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold tracking-widest uppercase mb-1">
            서울특별시아동·노인복지 표준 서식 제 2026-SR호
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-950 dark:text-amber-100 font-serif">
            재가노인지원서비스 사례관리 어르신 종합 이력 보고서
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            보고일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} | 기관명: 도봉재가노인지원서비스센터 사례관리팀
          </p>
        </div>

        {/* 1. SECTION: 대상자 기본 인적사항 & 가계/위기 특성 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              대상자 기본 인적사항 및 위기 상태 요약
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] font-bold text-stone-500">성명 / 성별 / 연령</span>
              <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                {currentClient.name} 어르신 ({currentClient.gender}, {currentClient.age}세)
              </div>
              <div className="text-[11px] text-stone-500">생년월일: {currentClient.birthDate}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] font-bold text-stone-500">보장구분 / 가구형태</span>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {currentClient.welfareType}
              </div>
              <div className="text-[11px] text-stone-600 dark:text-stone-400">
                주거: {currentClient.livingType}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] font-bold text-stone-500">장기요양 등급 / 위기도</span>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {currentClient.longTermCareStatus}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                위기도: {currentClient.riskLevel} (집중 관리)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] font-bold text-stone-500">담당자 / 최초등록일</span>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {currentClient.caseWorker || '이현정 사회복지사'}
              </div>
              <div className="text-[11px] text-stone-500">등록: {currentClient.registrationDate}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs space-y-2">
            <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <span>만성질환 및 건강 위험 소견</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentClient.chronicDiseases.map((d, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-amber-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px]">
                  • {d}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 pt-1">
              <strong>비상연락망:</strong> {currentClient.emergencyContact.name} ({currentClient.emergencyContact.relation}) - {currentClient.emergencyContact.phone}
            </p>
          </div>
        </section>

        {/* 2. SECTION: 표준 사례관리 10대 법정 서식 작성 이력 마트릭스 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                표준 사례관리 10대 법정 공문서 이력 마트릭스
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-medium">총 {clientDocs.length}건 서식 작성 완료</span>
          </div>

          {clientDocs.length === 0 ? (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 text-center text-xs text-stone-500">
              현재 작성된 법정 서식이 없습니다. [서식 작성] 탭에서 초기면접지 및 종합사정표를 새로 생성할 수 있습니다.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-[#251F1C] text-stone-700 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">서식 종류</th>
                    <th className="p-3">문서 제목</th>
                    <th className="p-3">작성일시</th>
                    <th className="p-3">작성자</th>
                    <th className="p-3">위기도</th>
                    <th className="p-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {clientDocs.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                      <td className="p-3 font-bold text-amber-900 dark:text-amber-300">
                        {DOCUMENT_TYPE_LABELS[d.documentType]?.short || d.documentType}
                      </td>
                      <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                        {d.title}
                      </td>
                      <td className="p-3 text-stone-500 text-[11px]">{d.updatedAt || d.createdAt}</td>
                      <td className="p-3 text-stone-600 dark:text-stone-400">{d.author}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.riskLevel === '고위험' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.riskLevel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {d.status || '결재완료'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 3. SECTION: Recharts 기반 회기별 상담 정서 추이 시각화 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              AI 녹취 분석 및 회기별 정서 흐름(Rapport) 추이
            </h2>
          </div>

          <CounselingSentimentTrendChart clientName={currentClient.name} />
        </section>

        {/* 4. SECTION: 맞춤형 통합 서비스 제공 및 자원 연계 현황 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
              4
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              맞춤형 통합 서비스 제공 및 자원 연계 현황
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>영양지원 (주 3회 밑반찬)</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                조리불가 독거 어르신 결식 방지를 위해 고단백 영양 밑반찬 제공 중 (수요일·금요일 배달).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>주거환경개선 (안전바 시공)</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                화장실 낙상 방지용 L자형 안전손잡이 2개소 및 미끄럼방지 패드 시공 완료.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>보건소 방문간호 연계</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                월 2회 방문간호사 혈압·혈당 관리 및 인슐린 복약지도 연계 진행.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SECTION: 담당 사례관리자 종합 소견 및 공식 3단 결재란 */}
        <section className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
              5
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              담당 사회복지사 종합 수퍼비전 소견 및 결재
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-300 dark:border-stone-700 text-xs leading-relaxed space-y-2 font-serif">
            <p className="text-stone-800 dark:text-stone-200">
              본 대상자는 {currentClient.age}세 독거 어르신으로 양측 관절염 및 낙상 위험이 높은 수급 가구입니다. 
              초기면접 및 종합사정을 거쳐 우선 제공 목표인 영양 지원 및 주거안전바 설치를 완료하였으며, 
              실시간 AI 음성 분석 결과 상담 진행에 따라 불안감이 현저히 줄어들고 사회복지사에 대한 강한 라포가 구축되었습니다.
            </p>
            <p className="text-stone-800 dark:text-stone-200">
              차기 재사정 주기(6개월 후)까지 현재의 집중 모니터링 체계를 유지하며 보건소 방문간호 및 정기 안부확인을 지속할 것을 보고합니다.
            </p>
          </div>

          {/* Official Korean Welfare Approval Stamp Box */}
          <div className="pt-6 flex justify-end">
            <div className="inline-grid grid-cols-3 border border-stone-400 dark:border-stone-700 text-center text-xs">
              <div className="border-r border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 font-bold p-2 w-24 flex items-center justify-center">
                담당자
              </div>
              <div className="border-r border-stone-400 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 font-bold p-2 w-24 flex items-center justify-center">
                팀 장
              </div>
              <div className="bg-stone-100 dark:bg-stone-800 font-bold p-2 w-24 flex items-center justify-center">
                센터장
              </div>

              <div className="border-r border-t border-stone-400 dark:border-stone-700 h-16 p-1 flex flex-col justify-between items-center text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">{currentClient.caseWorker || '이현정'}</span>
                <span className="text-amber-800 font-extrabold border border-amber-600 rounded px-1 text-[10px]">인 / 서명</span>
              </div>
              <div className="border-r border-t border-stone-400 dark:border-stone-700 h-16 p-1 flex flex-col justify-between items-center text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">김철수</span>
                <span className="text-stone-400 text-[10px]">서명</span>
              </div>
              <div className="border-t border-stone-400 dark:border-stone-700 h-16 p-1 flex flex-col justify-between items-center text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">박영희</span>
                <span className="text-stone-400 text-[10px]">서명</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
