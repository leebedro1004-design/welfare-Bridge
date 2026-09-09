import React, { useState } from 'react';
import {
  X,
  Users,
  Phone,
  MapPin,
  HeartPulse,
  ShieldAlert,
  Calendar,
  FileText,
  Sparkles,
  Clock,
  HeartHandshake,
  Siren,
  PhoneCall,
  MessageSquare,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  ArrowRight,
  Plus,
  Home,
  CheckCircle2,
  Filter,
  FileEdit,
  ExternalLink,
  ChevronRight,
  Building,
  UserCheck
} from 'lucide-react';
import { ClientProfile, CaseDocument, DocumentType, RiskLevel } from '../types';
import { getClientAssessment, ClientAssessmentDetail } from '../data/clientAssessmentData';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

interface ClientDetailRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  documents?: CaseDocument[];
  onSelectClientForConsultation?: (client: ClientProfile) => void;
  onSelectClientForForm?: (client: ClientProfile, docType?: DocumentType) => void;
  onUpdateClientRiskLevel?: (clientId: string, newRisk: RiskLevel) => void;
}

export const ClientDetailRecordModal: React.FC<ClientDetailRecordModalProps> = ({
  isOpen,
  onClose,
  client,
  documents = [],
  onSelectClientForConsultation,
  onSelectClientForForm,
  onUpdateClientRiskLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'consultation' | 'assessment' | 'info'>('consultation');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Consultation timeline filter & new log inline form state
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'visit' | 'call' | 'emergency'>('all');
  const [isAddLogOpen, setIsAddLogOpen] = useState<boolean>(false);
  const [newLogType, setNewLogType] = useState<'visit' | 'call' | 'center' | 'emergency'>('visit');
  const [newLogDate, setNewLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newLogSummary, setNewLogSummary] = useState<string>('');
  const [newLogQuote, setNewLogQuote] = useState<string>('');
  const [newLogAction, setNewLogAction] = useState<string>('');

  // Local timeline records
  const [localHistory, setLocalHistory] = useState([
    {
      id: 'h-1',
      date: '2025-01-15',
      time: '14:30',
      type: 'visit',
      typeLabel: '가정방문 상담',
      worker: '이현정 사회복지사',
      summary: '양측 무릎관절염 악화로 인한 실내 보행 곤란 및 화장실 문턱 낙상 위험 환경 조사. 냉장고 부실 식재료 확인.',
      quote: '"문턱 넘을 때 발이 걸려서 엉덩방아를 찧었는데, 혼자 쓰러져 있을까 봐 밤마다 겁이 나요."',
      riskTier: '최중점',
      tags: ['낙상위험', '영양결식', '주거개선'],
      action: '화장실 L자 안전손잡이 긴급 시공 의뢰 및 주 3회 맞춤 밑반찬 배달 연계 결정',
      linkedDocType: 'intake' as DocumentType,
      linkedDocTitle: '초기면접기록지',
    },
    {
      id: 'h-2',
      date: '2025-01-08',
      time: '10:20',
      type: 'call',
      typeLabel: '정기 안부전화',
      worker: '이현정 사회복지사',
      summary: '한파 대비 실내 난방 상태 및 고혈압·관절염 처방약 복용 여부 유선 확인.',
      quote: '"보일러 기름값이 아까워서 전기장판만 켜놓고 사는데 우풍이 심해."',
      riskTier: '중점',
      tags: ['한파취약', '만성질환', '난방비부담'],
      action: '방한 에어캡 및 덧신 긴급 지원품 배송 접수',
      linkedDocType: 'monitoring' as DocumentType,
      linkedDocTitle: '모니터링점검표',
    },
    {
      id: 'h-3',
      date: '2024-12-20',
      time: '11:00',
      type: 'visit',
      typeLabel: '정기 종합사정',
      worker: '이현정 사회복지사',
      summary: '보건복지부 재가노인지원서비스 표준 종합욕구사정표(ADL/IADL/SGDS) 대면 조사 진행.',
      quote: '"자식들도 살기 바빠서 명절에도 연락이 통 없으니 밥맛도 없고 적적해."',
      riskTier: '최중점',
      tags: ['우울고립', '가족단절', '사정완료'],
      action: '사례회의 안건 상정 및 서비스계획서 수립 결정',
      linkedDocType: 'assessment' as DocumentType,
      linkedDocTitle: '종합사정기록지',
    },
  ]);

  if (!isOpen || !client) return null;

  const assessment: ClientAssessmentDetail = getClientAssessment(client);
  const clientDocs = documents.filter((d) => d.clientId === client.id);

  // Normalize risk tier for display
  const isHigh = client.riskLevel.includes('고') || client.riskLevel.includes('최');
  const isMid = client.riskLevel.includes('중');
  const currentTierLabel = isHigh ? '최중점' : isMid ? '중점' : '일반';

  const handleCopy119 = () => {
    const text = `[119 응급환자 구조 이송 긴급정보]\n- 성명: ${client.name} (${client.age}세, ${client.gender})\n- 주소지: ${client.address}\n- 보호자 연락처: ${client.emergencyContact.name} (${client.emergencyContact.phone})\n- 보유 기저질환: ${client.chronicDiseases.join(', ')}\n- 장기요양상태: ${client.longTermCareStatus}\n- 담당기관: 도봉재가노인지원서비스센터 (02-2600-1111)`;
    navigator.clipboard.writeText(text);
    setCopiedToast('119 구조대 전달용 어르신 정보가 클립보드에 복사되었습니다. (119 즉시 통화 연결)');
    setTimeout(() => setCopiedToast(null), 3500);
    window.location.href = 'tel:119';
  };

  const handleCallGuardian = () => {
    const phone = client.emergencyContact.phone.replace(/[^0-9]/g, '');
    window.location.href = `tel:${phone || '010-0000-0000'}`;
  };

  const handleSmsGuardian = () => {
    const phone = client.emergencyContact.phone.replace(/[^0-9]/g, '');
    const msg = `[도봉재가노인센터] ${client.name} 어르신 댁 방문 중 안부 확인이 필요하여 연락드립니다. 확인 후 센터로 연락 바랍니다.`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`;
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogSummary.trim()) return;

    const typeLabels = {
      visit: '가정방문 상담',
      call: '안부전화 상담',
      center: '센터내방 상담',
      emergency: '긴급 위기개입',
    };

    const newEntry = {
      id: `h-${Date.now()}`,
      date: newLogDate,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type: newLogType,
      typeLabel: typeLabels[newLogType],
      worker: client.caseWorker || '이현정 사회복지사',
      summary: newLogSummary.trim(),
      quote: newLogQuote ? `"${newLogQuote.trim()}"` : '',
      riskTier: currentTierLabel,
      tags: ['현장상담', '맞춤지원'],
      action: newLogAction.trim() || '지속 관찰 및 필요 자원 연계',
      linkedDocType: undefined,
      linkedDocTitle: undefined,
    };

    setLocalHistory([newEntry, ...localHistory]);
    setIsAddLogOpen(false);
    setNewLogSummary('');
    setNewLogQuote('');
    setNewLogAction('');
  };

  const filteredHistory = localHistory.filter((item) => {
    if (timelineFilter === 'visit') return item.type === 'visit';
    if (timelineFilter === 'call') return item.type === 'call';
    if (timelineFilter === 'emergency') return item.type === 'emergency';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1C1815] rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in my-6 max-h-[92vh] flex flex-col">
        
        {/* Toast Notification */}
        {copiedToast && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{copiedToast}</span>
          </div>
        )}

        {/* 🌟 1. Top Header: Client Profile Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-[#2A221D] to-[#342821] text-white border-b border-stone-800 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-300 font-black text-xl flex items-center justify-center border-2 border-amber-400/40 shrink-0 shadow-xs">
                {client.name.slice(0, 1)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {client.name}
                    <span className="text-xs font-normal text-stone-300">어르신</span>
                  </h3>
                  <span className="text-xs text-stone-300 font-medium">
                    ({client.age}세 · {client.gender})
                  </span>

                  {/* Priority / Risk Level Tier Badge & Quick Toggle */}
                  <div className="inline-flex items-center gap-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                        currentTierLabel === '최중점'
                          ? 'bg-rose-500/30 text-rose-300 border-rose-400/60'
                          : currentTierLabel === '중점'
                          ? 'bg-amber-500/30 text-amber-300 border-amber-400/60'
                          : 'bg-emerald-500/30 text-emerald-300 border-emerald-400/60'
                      }`}
                    >
                      {currentTierLabel} 관리 대상
                    </span>

                    {onUpdateClientRiskLevel && (
                      <select
                        aria-label="관리 등급 변경"
                        value={client.riskLevel}
                        onChange={(e) => onUpdateClientRiskLevel(client.id, e.target.value as RiskLevel)}
                        className="text-[11px] bg-black/40 text-stone-200 border border-stone-600 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer hover:border-amber-400"
                        title="관리 등급 변경"
                      >
                        <option value="고위험">최중점 (고위험)</option>
                        <option value="중위험">중점 (중위험)</option>
                        <option value="일반">일반 (모니터링)</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {client.address}
                  </span>
                  <span className="text-stone-500 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:underline font-bold text-white">
                      {client.phone}
                    </a>
                  </span>
                  <span className="text-stone-500 hidden sm:inline">•</span>
                  <span>{client.livingType} · {client.welfareType}</span>
                </div>
              </div>
            </div>

            {/* Top Right: Emergency Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy119}
                className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-rose-400/40"
                title="119 출동용 정보 복사 및 즉시 통화 연결"
              >
                <Siren className="w-3.5 h-3.5 animate-pulse" />
                <span>119 긴급연계</span>
              </button>

              <button
                type="button"
                onClick={handleCallGuardian}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                title="보호자 전화 걸기"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>보호자 통화</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 2. Modal Navigation Tabs: 세부상담기록 vs 종합사정기록 vs 기본정보 */}
        <div className="px-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#201B18] flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('consultation')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'consultation'
                  ? 'border-amber-600 text-amber-900 dark:text-amber-400 bg-white dark:bg-[#1C1815]'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>세부 상담기록 ({localHistory.length}건)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assessment')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'assessment'
                  ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400 bg-white dark:bg-[#1C1815]'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>종합 사정기록 (ADL/IADL/SGDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-900 dark:text-blue-400 bg-white dark:bg-[#1C1815]'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>인적사항 & 비상망</span>
            </button>
          </div>

          {/* Quick AI & Form buttons inside tabs bar */}
          <div className="hidden sm:flex items-center gap-2 py-1">
            {onSelectClientForConsultation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectClientForConsultation(client);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1.5 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>AI 녹취실 바로가기</span>
              </button>
            )}

            {onSelectClientForForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectClientForForm(client, 'assessment');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>사정기록지 작성</span>
              </button>
            )}
          </div>
        </div>

        {/* 🌟 3. Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ================================================================ */}
          {/* TAB 1: 세부 상담기록 (Detailed Consultation Records) */}
          {/* ================================================================ */}
          {activeTab === 'consultation' && (
            <div className="space-y-5 animate-fade-in">
              {/* Consultation Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-bold flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> 상담유형:
                  </span>
                  {[
                    { id: 'all', label: '전체' },
                    { id: 'visit', label: '가정방문' },
                    { id: 'call', label: '안부전화' },
                    { id: 'emergency', label: '긴급개입' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTimelineFilter(f.id as any)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        timelineFilter === f.id
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLogOpen((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>상담일지 직접 기록</span>
                  </button>

                  {onSelectClientForConsultation && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectClientForConsultation(client);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>새 AI 실시간 녹취</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Add Consultation Form */}
              {isAddLogOpen && (
                <form
                  onSubmit={handleAddConsultation}
                  className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 space-y-3.5 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900 pb-2">
                    <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      신규 상담 이력 직접 등록
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddLogOpen(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">상담 유형</label>
                      <select
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value as any)}
                        className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-2"
                      >
                        <option value="visit">가정방문 상담</option>
                        <option value="call">안부전화 상담</option>
                        <option value="center">센터내방 상담</option>
                        <option value="emergency">긴급 위기개입</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">상담 일자</label>
                      <input
                        type="date"
                        value={newLogDate}
                        onChange={(e) => setNewLogDate(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-2"
                      />
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <label className="block font-bold text-stone-700 dark:text-stone-300">상담 요약 및 상황 관찰</label>
                    <textarea
                      rows={2}
                      value={newLogSummary}
                      onChange={(e) => setNewLogSummary(e.target.value)}
                      placeholder="어르신의 건강 상태, 식사 상태, 주거 및 특이사항을 간략히 기록하세요."
                      className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-2 text-xs"
                      required
                    />
                  </div>

                  <div className="text-xs space-y-1">
                    <label className="block font-bold text-stone-700 dark:text-stone-300">어르신 주요 발언 (Quote)</label>
                    <input
                      type="text"
                      value={newLogQuote}
                      onChange={(e) => setNewLogQuote(e.target.value)}
                      placeholder="어르신께서 직접 하신 주요 호소 말씀 (선택)"
                      className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-2 text-xs"
                    />
                  </div>

                  <div className="text-xs space-y-1">
                    <label className="block font-bold text-stone-700 dark:text-stone-300">사회복지사 조치사항</label>
                    <input
                      type="text"
                      value={newLogAction}
                      onChange={(e) => setNewLogAction(e.target.value)}
                      placeholder="밑반찬 연계, 안전바 설치 의뢰, 병원 동행 예약 등"
                      className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddLogOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-bold"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shadow-xs"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              )}

              {/* Consultation Timeline Feed */}
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                          {item.typeLabel}
                        </span>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          {item.date} ({item.time})
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                            item.riskTier === '최중점'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : item.riskTier === '중점'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.riskTier}
                        </span>
                      </div>

                      <span className="text-xs text-stone-500 font-medium">
                        담당: {item.worker}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                      <strong className="text-stone-900 dark:text-stone-100 block mb-1">상담 및 관찰 내용:</strong>
                      {item.summary}
                    </div>

                    {/* Quote */}
                    {item.quote && (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#251F1C] border-l-4 border-amber-500 text-xs text-stone-800 dark:text-stone-200 italic font-serif leading-relaxed">
                        {item.quote}
                      </div>
                    )}

                    {/* Tags & Action */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        <strong className="text-stone-800 dark:text-stone-200">조치:</strong> {item.action}
                      </div>
                    </div>

                    {/* Linked Document link */}
                    {item.linkedDocType && onSelectClientForForm && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectClientForForm(client, item.linkedDocType);
                          }}
                          className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>연계 서식 바로 열기 ({item.linkedDocTitle})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: 종합 사정기록 (Detailed Assessment Records) */}
          {/* ================================================================ */}
          {activeTab === 'assessment' && (
            <div className="space-y-6 animate-fade-in">
              {/* Assessment Top Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#1B3224] to-[#12251A] text-white border border-emerald-500/40 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      보건복지부 재가노인지원서비스 표준 종합사정
                    </span>
                    <h4 className="text-base font-extrabold text-white">
                      {client.name} 어르신 종합 기능 사정표 (최근 사정일: {assessment.assessmentDate})
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-200 font-medium">
                    사정자: {assessment.assessorName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[11px] text-emerald-300 block">일상생활(ADL) 점수</span>
                    <span className="text-sm font-extrabold text-white">{assessment.adlScoreTotal} / 24점</span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[11px] text-emerald-300 block">노인우울(SGDS) 척도</span>
                    <span className={`text-sm font-extrabold ${assessment.depressionScore >= 11 ? 'text-rose-300' : 'text-white'}`}>
                      {assessment.depressionScore} / 15점 ({assessment.depressionLevel.split('(')[0]})
                    </span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[11px] text-emerald-300 block">주거안전 위험도</span>
                    <span className={`text-sm font-extrabold ${assessment.housingSafetyScore === '위험' ? 'text-rose-300' : 'text-amber-300'}`}>
                      {assessment.housingSafetyScore} 등급
                    </span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[11px] text-emerald-300 block">관리 판정 등급</span>
                    <span className="text-sm font-extrabold text-amber-300">{currentTierLabel} 관리군</span>
                  </div>
                </div>
              </div>

              {/* 1. ADL & IADL 일상생활 자립도 내역 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    일상생활 자립도 및 신체기능 평가 (ADL / IADL)
                  </h4>
                  <span className="text-xs text-stone-500">
                    총 {assessment.adlItems.length}개 핵심 지표
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assessment.adlItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-stone-900 dark:text-stone-100 block">
                          {item.name}
                        </span>
                        {item.note && (
                          <span className="text-[11px] text-stone-500 leading-tight block">
                            {item.note}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold shrink-0 border ${
                          item.status === '완전도움'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : item.status === '부분도움'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-[#251F1C] text-xs text-stone-700 dark:text-stone-300">
                  <strong className="text-stone-900 dark:text-stone-100 block mb-1">신체기능 요약 소견:</strong>
                  {assessment.physicalSummary}
                </div>
              </div>

              {/* 2. 정서 & 우울 척도 (SGDS) 및 주거·경제 환경 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 정서 및 SGDS */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                  <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    정서 및 우울 상태 (SGDS-K)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">우울척도 점수:</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        {assessment.depressionScore}점 ({assessment.depressionLevel})
                      </span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl">
                      {assessment.emotionalSummary}
                    </p>
                    <div>
                      <span className="text-stone-500 block mb-1 font-bold">주요 우려 요인:</span>
                      <div className="flex flex-wrap gap-1">
                        {assessment.keyConcerns.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-medium border border-rose-200 dark:border-rose-900">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주거 및 경제 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                  <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <Home className="w-4 h-4 text-amber-600" />
                    주거환경 및 경제 상태
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">주거 안전도:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{assessment.housingSafetyScore} 상태</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl">
                      {assessment.housingDetails}
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-stone-500">경제 구분:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{assessment.economicStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 사회복지사 종합사정 소견 및 추천 서비스 계획 */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-3">
                <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  사회복지사 종합사정 의견 및 개입 방향
                </h4>
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                  {assessment.workerOverallOpinion}
                </p>

                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-2">
                    추천 재가서비스 및 전달 주기:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {assessment.recommendedServices.map((svc, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#1E1916] border border-amber-200/80 dark:border-amber-900/40"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <strong className="text-stone-900 dark:text-stone-100">{svc.serviceName}</strong>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{svc.frequency}</span>
                        </div>
                        <span className="text-[11px] text-stone-500 block">{svc.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. 연계된 10대 법정 서식 작성 현황 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                  <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    해당 어르신 연계 10대 법정 서식 현황 ({clientDocs.length}건 작성됨)
                  </h4>
                  {onSelectClientForForm && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectClientForForm(client, 'service_plan');
                      }}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새 법정 서식 추가 작성</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(['intake', 'assessment', 'scoring', 'case_conference', 'service_plan', 'monitoring'] as DocumentType[]).map((docType) => {
                    const existingDoc = clientDocs.find((d) => d.documentType === docType);
                    const labelInfo = DOCUMENT_TYPE_LABELS[docType];

                    return (
                      <div
                        key={docType}
                        onClick={() => {
                          if (onSelectClientForForm) {
                            onClose();
                            onSelectClientForForm(client, docType);
                          }
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all cursor-pointer space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {labelInfo?.short || '별지'}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              existingDoc
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                            }`}
                          >
                            {existingDoc ? existingDoc.status : '미작성'}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {labelInfo?.label.split('(')[0] || docType}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                          <span>{existingDoc ? '열람 및 수정' : '작성 시작'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: 기본 인적사항 & 비상연락망 (Personal Info) */}
          {/* ================================================================ */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Personal Info */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    기본 인적사항 및 거주 정보
                  </h4>
                  <div className="space-y-2 text-stone-700 dark:text-stone-300">
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">성명 / 성별:</span>
                      <span className="font-bold">{client.name} ({client.gender})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">생년월일 (연령):</span>
                      <span className="font-bold">{client.birthDate} (만 {client.age}세)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">본인 연락처:</span>
                      <a href={`tel:${client.phone}`} className="font-bold text-blue-600 hover:underline">
                        {client.phone}
                      </a>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">실거주 주소:</span>
                      <span className="font-bold text-right max-w-[200px]">{client.address}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">주거 형태:</span>
                      <span className="font-bold">{client.livingType}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">수급 자격:</span>
                      <span className="font-bold">{client.welfareType}</span>
                    </div>
                  </div>
                </div>

                {/* Health & Emergency Contacts */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    건강 및 비상 응급 연락망
                  </h4>
                  <div className="space-y-2 text-stone-700 dark:text-stone-300">
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">장기요양 인정상태:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{client.longTermCareStatus}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">비상연락인:</span>
                      <span className="font-bold">{client.emergencyContact.name} ({client.emergencyContact.relation})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">비상연락처:</span>
                      <a href={`tel:${client.emergencyContact.phone}`} className="font-bold text-rose-600 hover:underline">
                        {client.emergencyContact.phone}
                      </a>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/60">
                      <span className="text-stone-500">사례관리 담당자:</span>
                      <span className="font-bold">{client.caseWorker}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-stone-500 block mb-1">보유 만성 질환 목록:</span>
                      <div className="flex flex-wrap gap-1">
                        {client.chronicDiseases.map((d, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-900">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Communication Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-rose-700/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white animate-pulse">
                    <Siren className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm">골든타임 현장 응급 출동 지원</h5>
                    <p className="text-[11px] text-rose-200">
                      낙상 등 사고 발생 시 119 구급대 및 보호자에게 즉시 원클릭으로 정보를 전송하고 통화합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy119}
                    className="px-3 py-1.5 rounded-xl bg-white text-rose-900 font-black text-xs hover:bg-stone-100 transition-colors shadow-xs cursor-pointer"
                  >
                    119 정보복사 & 연결
                  </button>
                  <button
                    type="button"
                    onClick={handleSmsGuardian}
                    className="px-3 py-1.5 rounded-xl bg-rose-800/80 hover:bg-rose-700 text-white font-bold text-xs border border-rose-500 transition-colors cursor-pointer"
                  >
                    보호자 긴급문자
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 4. Bottom Action Bar */}
        <div className="p-4 bg-stone-100 dark:bg-[#201B18] border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            관리번호: <strong className="text-stone-700 dark:text-stone-300 font-mono">{client.id}</strong> · 등록일: {client.registrationDate}
          </div>

          <div className="flex items-center gap-2">
            {onSelectClientForConsultation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectClientForConsultation(client);
                }}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI 상담실 이동</span>
              </button>
            )}

            {onSelectClientForForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectClientForForm(client, 'assessment');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileEdit className="w-4 h-4" />
                <span>사정기록지 작성</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
