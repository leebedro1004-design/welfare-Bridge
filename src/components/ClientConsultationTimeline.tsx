import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Phone,
  Home,
  Building,
  HeartPulse,
  AlertTriangle,
  FileText,
  Plus,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  User,
  Tag,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { ClientProfile, CaseDocument, DocumentType } from '../types';

export interface ConsultationHistoryItem {
  id: string;
  date: string;
  time: string;
  type: 'visit' | 'call' | 'center' | 'hospital' | 'emergency';
  typeLabel: string;
  counselor: string;
  summary: string;
  quote?: string;
  riskLevel: '고위험' | '중위험' | '일반';
  primaryNeeds: string[];
  actionTaken: string;
  linkedDocType?: DocumentType;
  linkedDocTitle?: string;
}

interface ClientConsultationTimelineProps {
  client: ClientProfile;
  documents?: CaseDocument[];
  onOpenDocument?: (docType: DocumentType, clientId: string) => void;
  onStartNewConsultation?: (client: ClientProfile) => void;
}

export const ClientConsultationTimeline: React.FC<ClientConsultationTimelineProps> = ({
  client,
  documents = [],
  onOpenDocument,
  onStartNewConsultation,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [newLogType, setNewLogType] = useState<'visit' | 'call' | 'center' | 'hospital' | 'emergency'>('visit');
  const [newLogDate, setNewLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newLogSummary, setNewLogSummary] = useState<string>('');
  const [newLogQuote, setNewLogQuote] = useState<string>('');
  const [newLogRisk, setNewLogRisk] = useState<'고위험' | '중위험' | '일반'>(
    client.riskLevel.includes('고') ? '고위험' : client.riskLevel.includes('중') ? '중위험' : '일반'
  );
  const [newLogAction, setNewLogAction] = useState<string>('');

  // Initial Mock Timeline data per client
  const [historyList, setHistoryList] = useState<ConsultationHistoryItem[]>([
    {
      id: 'h-1',
      date: '2026-08-20',
      time: '14:30',
      type: 'visit',
      typeLabel: '가정방문 사정',
      counselor: '이현정 사회복지사',
      summary: '식사 결식 상태 점검 및 욕실 문턱 낙상 위험 환경 조사. 냉장고 식재료 확인 및 틀니 상태 청취.',
      quote: '"틀니가 헐거워서 딱딱한 건 못 먹고 죽이나 찬물에 밥 말아먹는 날이 많아..."',
      riskLevel: '고위험',
      primaryNeeds: ['영양결식', '낙상예방', '주거환경개선'],
      actionTaken: '맞춤형 밑반찬 긴급 배달 주 3회 연계 승인 및 욕실 안전손잡이 설치 의뢰',
      linkedDocType: 'intake',
      linkedDocTitle: `${client.name} 어르신 초기면접기록지`,
    },
    {
      id: 'h-2',
      date: '2026-08-05',
      time: '10:15',
      type: 'call',
      typeLabel: '안부전화 상담',
      counselor: '김민수 사회복지사',
      summary: '폭염 대비 냉방기기 작동 점검 및 고혈압·당뇨 처방약 정기 복용 여부 유선 확인.',
      quote: '"선풍기가 오래돼서 소리가 요란한데 시원하진 않아. 어지럼증이 좀 있네."',
      riskLevel: '중위험',
      primaryNeeds: ['폭염취약', '만성질환'],
      actionTaken: '후원 서큘레이터 1대 긴급 배부 및 보건소 방문간호 혈압측정 연계',
      linkedDocType: 'monitoring',
      linkedDocTitle: `${client.name} 어르신 모니터링 상담일지`,
    },
    {
      id: 'h-3',
      date: '2026-07-18',
      time: '15:00',
      type: 'visit',
      typeLabel: '가정방문 상담',
      counselor: '이현정 사회복지사',
      summary: '재가노인지원서비스 표준 종합사정(ADL/IADL/SGDS) 실시 및 사례관리 동의서 체결.',
      quote: '"혼자 있으니까 하루가 너무 길고 적적해. 누가 찾아와주는 게 유일한 낙이지."',
      riskLevel: '중위험',
      primaryNeeds: ['우울고립', '일상생활지원'],
      actionTaken: '재가노인지원서비스 맞춤형 사례관리 대상자 선정 및 개입계획 수립',
      linkedDocType: 'assessment',
      linkedDocTitle: `${client.name} 어르신 종합사정표`,
    },
    {
      id: 'h-4',
      date: '2026-06-10',
      time: '11:00',
      type: 'hospital',
      typeLabel: '병원동행 및 진료지원',
      counselor: '자원봉사팀 / 이현정',
      summary: '관절염 통증 완화를 위한 정형외과 외래 진료 동행 및 보행기(실버카) 신청 지원.',
      riskLevel: '일반',
      primaryNeeds: ['의료연계', '보행보조'],
      actionTaken: '노인장기요양 복지용구 보행보조차(실버카) 구입 보조금 신청 접수 완료',
      linkedDocType: 'service_plan',
      linkedDocTitle: `${client.name} 어르신 서비스제공계획서`,
    },
  ]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogSummary.trim()) return;

    const typeLabels: Record<string, string> = {
      visit: '가정방문 상담',
      call: '안부전화 상담',
      center: '센터내방 상담',
      hospital: '병원동행 지원',
      emergency: '긴급 위기개입',
    };

    const newEntry: ConsultationHistoryItem = {
      id: `h-${Date.now()}`,
      date: newLogDate,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type: newLogType,
      typeLabel: typeLabels[newLogType] || '상담 기록',
      counselor: client.caseWorker || '이현정 사회복지사',
      summary: newLogSummary,
      quote: newLogQuote ? `"${newLogQuote}"` : undefined,
      riskLevel: newLogRisk,
      primaryNeeds: ['긴급모니터링', '사례관리'],
      actionTaken: newLogAction || '지속 관찰 및 맞춤형 서비스 연계 진행',
    };

    setHistoryList((prev) => [newEntry, ...prev]);
    setIsAddFormOpen(false);
    setNewLogSummary('');
    setNewLogQuote('');
    setNewLogAction('');
  };

  const filteredHistory = historyList.filter((item) => {
    if (filterType === 'visit') return item.type === 'visit';
    if (filterType === 'call') return item.type === 'call';
    if (filterType === 'emergency') return item.type === 'emergency';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'call':
        return <Phone className="w-4 h-4 text-teal-600" />;
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'center':
        return <Building className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {client.name} 어르신 과거 상담 및 방문 이력 타임라인
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            총 {historyList.length}회의 방문·유선 상담 이력이 시간순으로 누적 기록되어 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddFormOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>상담 일지 직접 추가</span>
          </button>

          {onStartNewConsultation && (
            <button
              type="button"
              onClick={() => onStartNewConsultation(client)}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI 녹취 시작</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-stone-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> 구분:
          </span>
          {[
            { id: 'all', label: '전체 이력' },
            { id: 'visit', label: '🏠 가정방문' },
            { id: 'call', label: '📞 안부전화' },
            { id: 'emergency', label: '🚨 긴급개입' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-stone-500 font-medium">
          최근 상담일: {historyList[0]?.date || '없음'}
        </span>
      </div>

      {/* Add New History Log Inline Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleAddLog}
          className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3 animate-fade-in text-xs"
        >
          <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
            <span>신규 상담 기록지 빠른 추가</span>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                상담 일자
              </label>
              <input
                type="date"
                value={newLogDate}
                onChange={(e) => setNewLogDate(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                상담 형태
              </label>
              <select
                value={newLogType}
                onChange={(e) => setNewLogType(e.target.value as any)}
                className="w-full bg-white dark:bg-stone-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700"
              >
                <option value="visit">가정방문 상담</option>
                <option value="call">안부전화 상담</option>
                <option value="center">센터내방 상담</option>
                <option value="hospital">병원동행 지원</option>
                <option value="emergency">긴급 위기개입</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                판정 위험도
              </label>
              <select
                value={newLogRisk}
                onChange={(e) => setNewLogRisk(e.target.value as any)}
                className="w-full bg-white dark:bg-stone-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700 font-bold"
              >
                <option value="고위험">고위험 (집중관리)</option>
                <option value="중위험">중위험 (주의관찰)</option>
                <option value="일반">일반 (정기유지)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
              상담 요약 및 관찰 내용 *
            </label>
            <textarea
              rows={2}
              value={newLogSummary}
              onChange={(e) => setNewLogSummary(e.target.value)}
              placeholder="상담 중 관찰된 어르신의 건강, 식사, 주거 상태 및 주요 호소 사항을 기록하세요."
              className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                어르신 주요 발언 인용구 (선택)
              </label>
              <input
                type="text"
                value={newLogQuote}
                onChange={(e) => setNewLogQuote(e.target.value)}
                placeholder='예: "무릎이 쑤셔서 밥 짓기도 힘들어..."'
                className="w-full bg-white dark:bg-stone-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                연계 조치 및 제공 계획 (선택)
              </label>
              <input
                type="text"
                value={newLogAction}
                onChange={(e) => setNewLogAction(e.target.value)}
                placeholder="예: 밑반찬 주2회 지원 연계 및 안전손잡이 설치"
                className="w-full bg-white dark:bg-stone-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold"
            >
              상담 기록 저장
            </button>
          </div>
        </form>
      )}

      {/* Visual Timeline Nodes */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-300 dark:before:bg-stone-700">
        {filteredHistory.map((item, index) => {
          const isHigh = item.riskLevel === '고위험';
          const isMedium = item.riskLevel === '중위험';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Icon Indicator */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs ${
                  isHigh
                    ? 'bg-rose-100 border-rose-500 text-rose-700'
                    : isMedium
                    ? 'bg-amber-100 border-amber-500 text-amber-700'
                    : 'bg-emerald-100 border-emerald-500 text-emerald-700'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              {/* Timeline Node Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-amber-400 transition-all space-y-2.5">
                {/* Node Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                      {item.typeLabel}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      ({item.date} {item.time})
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    담당: {item.counselor}
                  </span>
                </div>

                {/* Summary Body */}
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {item.summary}
                </p>

                {/* Client Quote Highlight */}
                {item.quote && (
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border-l-3 border-amber-500 text-xs italic text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                    {item.quote}
                  </div>
                )}

                {/* Tags & Action Taken */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.primaryNeeds.map((need, nIdx) => (
                      <span
                        key={nIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                      >
                        #{need}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-600 dark:text-stone-400">
                    <strong>조치:</strong> {item.actionTaken}
                  </div>
                </div>

                {/* Linked Document Quick Link if available */}
                {item.linkedDocType && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenDocument && onOpenDocument(item.linkedDocType!, client.id)}
                      className="text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{item.linkedDocTitle || '연계 서식 바로보기'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
