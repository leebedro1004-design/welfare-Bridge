import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  HeartPulse,
  ShieldAlert,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  Clock,
  HeartHandshake,
  Siren,
  PhoneCall,
  MessageSquare,
  AlertOctagon,
  Copy,
  Check,
  Activity,
  Eye,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ClientProfile, RiskLevel, LivingType, WelfareType, DocumentType } from '../types';
import { ClientConsultationTimeline } from './ClientConsultationTimeline';

interface ClientListProps {
  clients: ClientProfile[];
  onAddClient: (newClient: ClientProfile) => void;
  onSelectClientForConsultation: (client: ClientProfile) => void;
  onSelectClientForForm: (client: ClientProfile, docType?: DocumentType) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onAddClient,
  onSelectClientForConsultation,
  onSelectClientForForm,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDetailClient, setSelectedDetailClient] = useState<ClientProfile | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'info' | 'timeline' | 'emergency'>('timeline');
  const [copiedInfoToast, setCopiedInfoToast] = useState<string | null>(null);
  const [emergencyLoggedToast, setEmergencyLoggedToast] = useState<string | null>(null);

  // New Client Form State
  const [newName, setNewName] = useState<string>('');
  const [newBirth, setNewBirth] = useState<string>('1945-05-10');
  const [newAge, setNewAge] = useState<number>(81);
  const [newGender, setNewGender] = useState<'남' | '여'>('여');
  const [newPhone, setNewPhone] = useState<string>('010-');
  const [newEmergencyName, setNewEmergencyName] = useState<string>('');
  const [newEmergencyRel, setNewEmergencyRel] = useState<string>('자녀');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState<string>('010-');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newLivingType, setNewLivingType] = useState<LivingType>('독거노인');
  const [newWelfareType, setNewWelfareType] = useState<WelfareType>('기초생활수급자(생계/의료)');
  const [newLongTermCare, setNewLongTermCare] = useState<any>('등급외 B');
  const [newDiseases, setNewDiseases] = useState<string>('고혈압, 관절염');
  const [newRisk, setNewRisk] = useState<RiskLevel>('중위험');

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.includes(searchTerm) ||
      c.address.includes(searchTerm) ||
      c.chronicDiseases.some((d) => d.includes(searchTerm));
    const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: newName.trim(),
      birthDate: newBirth,
      age: Number(newAge) || 80,
      gender: newGender,
      phone: newPhone,
      emergencyContact: {
        name: newEmergencyName || '이웃 통장',
        relation: newEmergencyRel,
        phone: newEmergencyPhone,
      },
      address: newAddress || '관내 주소',
      livingType: newLivingType,
      welfareType: newWelfareType,
      longTermCareStatus: newLongTermCare,
      chronicDiseases: newDiseases.split(',').map((d) => d.trim()).filter(Boolean),
      riskLevel: newRisk,
      caseWorker: '이현정 사회복지사',
      registrationDate: new Date().toISOString().slice(0, 10),
      status: '진행중',
    };

    onAddClient(newClient);
    setIsAddModalOpen(false);
    setNewName('');
    setNewAddress('');
  };

  // 119 Emergency Quick Dispatch Copy & Call
  const handleEmergency119 = (client: ClientProfile) => {
    const dispatchBrief = `[119 응급환자 구조 요청 정보]\n- 대상자: ${client.name} (${client.age}세, ${client.gender})\n- 주소지: ${client.address}\n- 보호자 연락처: ${client.emergencyContact.name} (${client.emergencyContact.phone})\n- 보유 기저질환: ${client.chronicDiseases.join(', ')}\n- 장기요양상태: ${client.longTermCareStatus}\n- 담당 복지관: 굿실버노인복지센터 (02-2600-1111)`;
    navigator.clipboard.writeText(dispatchBrief);
    setCopiedInfoToast(`119 출동용 어르신 주소 및 질환 정보가 클립보드에 복사되었습니다! (119 즉시 통화 연결)`);
    setTimeout(() => setCopiedInfoToast(null), 4000);
    window.location.href = 'tel:119';
  };

  // Guardian Emergency Call
  const handleCallGuardian = (client: ClientProfile) => {
    const phone = client.emergencyContact.phone.replace(/[^0-9]/g, '');
    window.location.href = `tel:${phone || '010-0000-0000'}`;
  };

  // Guardian SMS Emergency Alert
  const handleSmsGuardian = (client: ClientProfile) => {
    const phone = client.emergencyContact.phone.replace(/[^0-9]/g, '');
    const message = `[재가노인지원센터 긴급연락] ${client.name} 어르신 댁 방문 중 긴급 확인이 필요하여 연락드립니다. 확인 즉시 담당 사회복지사에게 연락 부탁드립니다.`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    setCopiedInfoToast(`보호자 긴급 문자 발송 화면으로 연결되었습니다.`);
    setTimeout(() => setCopiedInfoToast(null), 3000);
  };

  // Log Emergency Action
  const handleLogEmergency = (client: ClientProfile, type: string) => {
    setEmergencyLoggedToast(`[${new Date().toLocaleTimeString('ko-KR')}] ${client.name} 어르신에 대한 '${type}' 긴급 대처 이력이 시스템에 기록되었습니다.`);
    setTimeout(() => setEmergencyLoggedToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            재가노인지원 관리 어르신 현황 ({clients.length}명)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            지역사회 취약계층 독거 및 부부 어르신의 위험도, 건강 질환, 응급망을 체계적으로 관리합니다.
          </p>
        </div>

        <button
          id="btn-open-add-client-modal"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>신규 어르신 등록</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="어르신 성명, 주소지, 질환명(관절염, 당뇨 등) 검색"
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">위기도:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">전체 위기도</option>
            <option value="고위험">고위험 (집중관리)</option>
            <option value="중위험">중위험 (일반지원)</option>
            <option value="일반">일반 (모니터링)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">사례상태:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">전체 상태</option>
            <option value="집중관리">집중관리</option>
            <option value="진행중">진행중</option>
            <option value="모니터링">모니터링</option>
            <option value="종결">종결</option>
          </select>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const isHighRisk = client.riskLevel === '고위험';
          const isMidRisk = client.riskLevel === '중위험';

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm border border-amber-300 shrink-0">
                      {client.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-stone-900">{client.name}</h3>
                        <span className="text-xs text-stone-500 font-medium">
                          ({client.age}세, {client.gender})
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium block">
                        {client.livingType} • {client.welfareType}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      isHighRisk
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isMidRisk
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {client.riskLevel}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-xs text-stone-600 bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{client.phone}</span>
                    <span className="text-stone-400">|</span>
                    <span className="text-[11px] text-stone-500 truncate">
                      비상: {client.emergencyContact.name} ({client.emergencyContact.phone})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-semibold text-amber-900">
                      장기요양: {client.longTermCareStatus}
                    </span>
                  </div>
                </div>

                {/* Chronic Diseases Chips */}
                <div>
                  <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    보유 만성질환 및 신체 특성
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {client.chronicDiseases.map((d, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action CTAs */}
              <div className="border-t border-stone-100 bg-stone-50/80 p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedDetailClient(client)}
                  className="w-full py-2 px-2.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>상세정보 & 긴급상황 대처</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectClientForConsultation(client)}
                    className="py-2 px-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/90 border border-amber-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>AI 녹취분석</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectClientForForm(client)}
                    className="py-2 px-2 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>서식 작성</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚨 Client Detail & Emergency Response Modal */}
      {selectedDetailClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black flex items-center justify-center text-base border border-amber-300 shrink-0">
                  {selectedDetailClient.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {selectedDetailClient.name} 어르신 통합 프로필 & 과거 상담 이력
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      ({selectedDetailClient.age}세, {selectedDetailClient.gender})
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      selectedDetailClient.riskLevel === '고위험'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : selectedDetailClient.riskLevel === '중위험'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {selectedDetailClient.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {selectedDetailClient.livingType} • {selectedDetailClient.welfareType} • 관리번호: {selectedDetailClient.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailClient(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 pt-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-[#201B18] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailModalTab('timeline')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'timeline'
                    ? 'border-amber-600 text-amber-900 dark:text-amber-300 bg-white dark:bg-[#1E1916] rounded-t-lg shadow-2xs'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>과거 상담 이력 타임라인</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab('info')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'info'
                    ? 'border-amber-600 text-amber-900 dark:text-amber-300 bg-white dark:bg-[#1E1916] rounded-t-lg shadow-2xs'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span>기본 인적·건강 정보</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab('emergency')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'emergency'
                    ? 'border-rose-600 text-rose-900 dark:text-rose-300 bg-white dark:bg-[#1E1916] rounded-t-lg shadow-2xs'
                    : 'border-transparent text-stone-500 hover:text-rose-600'
                }`}
              >
                <Siren className="w-3.5 h-3.5 text-rose-600" />
                <span>현장 긴급 대응 (119/보호자)</span>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
              {/* TAB 1: CONSULTATION TIMELINE VIEW */}
              {detailModalTab === 'timeline' && (
                <ClientConsultationTimeline
                  client={selectedDetailClient}
                  onOpenDocument={(docType, cId) => {
                    const client = selectedDetailClient;
                    setSelectedDetailClient(null);
                    onSelectClientForForm(client, docType);
                  }}
                  onStartNewConsultation={(client) => {
                    setSelectedDetailClient(null);
                    onSelectClientForConsultation(client);
                  }}
                />
              )}

              {/* TAB 2: GENERAL PROFILE INFORMATION */}
              {detailModalTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-2">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      기본 인적사항 및 수급자격
                    </h4>
                    <div className="space-y-1.5 text-stone-700 dark:text-stone-300">
                      <div className="flex justify-between">
                        <span className="text-stone-500">생년월일:</span>
                        <span className="font-semibold">{selectedDetailClient.birthDate} ({selectedDetailClient.age}세)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">본인 연락처:</span>
                        <span className="font-semibold">{selectedDetailClient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">주거 형태:</span>
                        <span className="font-semibold">{selectedDetailClient.livingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">수급 자격:</span>
                        <span className="font-semibold">{selectedDetailClient.welfareType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">거주 주소:</span>
                        <span className="font-semibold">{selectedDetailClient.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">담당 복지사:</span>
                        <span className="font-semibold">{selectedDetailClient.caseWorker}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800 space-y-2">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      건강 질환 및 비상연락망
                    </h4>
                    <div className="space-y-1.5 text-stone-700 dark:text-stone-300">
                      <div className="flex justify-between">
                        <span className="text-stone-500">비상연락인:</span>
                        <span className="font-semibold">{selectedDetailClient.emergencyContact.name} ({selectedDetailClient.emergencyContact.relation})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">비상연락처:</span>
                        <span className="font-semibold">{selectedDetailClient.emergencyContact.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">장기요양 인정:</span>
                        <span className="font-semibold">{selectedDetailClient.longTermCareStatus}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block mb-1">만성 질환:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDetailClient.chronicDiseases.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold text-[10px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EMERGENCY QUICK ACTIONS */}
              {detailModalTab === 'emergency' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white p-5 shadow-lg border border-rose-700/80 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-700/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-500 text-white animate-pulse">
                          <Siren className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <span>현장 긴급 상황 즉각 대처 (Emergency Quick Actions)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-400/30 text-rose-200 border border-rose-400/40 font-bold">
                              골든타임 대응
                            </span>
                          </h4>
                          <p className="text-xs text-rose-200">
                            낙상, 의식 저하, 급성 호흡곤란 발생 시 즉시 원클릭으로 119 및 보호자에게 연락합니다.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLogEmergency(selectedDetailClient, '응급 일지 자동 기록')}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-100 border border-rose-400/30 transition-colors cursor-pointer shrink-0"
                      >
                        응급일지 기록
                      </button>
                    </div>

                    {/* Emergency Action Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 119 Rescue Call */}
                      <button
                        type="button"
                        onClick={() => handleEmergency119(selectedDetailClient)}
                        className="p-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-rose-400"
                      >
                        <div className="flex items-center gap-1.5 text-sm">
                          <PhoneCall className="w-4 h-4 animate-bounce" />
                          <span>119 구급대 긴급신고</span>
                        </div>
                        <span className="text-[10px] font-normal text-rose-100 text-center">
                          주소·기저질환 브리핑 복사 & 통화
                        </span>
                      </button>

                      {/* Guardian Call */}
                      <button
                        type="button"
                        onClick={() => handleCallGuardian(selectedDetailClient)}
                        className="p-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-amber-400"
                      >
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>보호자 즉시 통화</span>
                        </div>
                        <span className="text-[10px] font-normal text-amber-100 text-center">
                          {selectedDetailClient.emergencyContact.name} ({selectedDetailClient.emergencyContact.phone})
                        </span>
                      </button>

                      {/* Guardian SMS Alert */}
                      <button
                        type="button"
                        onClick={() => handleSmsGuardian(selectedDetailClient)}
                        className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-stone-600"
                      >
                        <div className="flex items-center gap-1.5 text-sm">
                          <MessageSquare className="w-4 h-4" />
                          <span>보호자 긴급문자</span>
                        </div>
                        <span className="text-[10px] font-normal text-stone-300 text-center">
                          위기상황 안내문 자동 완성
                        </span>
                      </button>
                    </div>

                    {/* Quick Info Strip for Emergency Services */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300">구급대 전달용 주소:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedDetailClient.address);
                            setCopiedInfoToast('주소가 클립보드에 복사되었습니다.');
                            setTimeout(() => setCopiedInfoToast(null), 2500);
                          }}
                          className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> 주소 복사
                        </button>
                      </div>
                      <div className="text-white font-medium">{selectedDetailClient.address}</div>
                      <div className="text-[11px] text-rose-200 pt-1 border-t border-white/10 flex items-center gap-2">
                        <span>기저질환: <strong>{selectedDetailClient.chronicDiseases.join(', ')}</strong></span>
                        <span>•</span>
                        <span>장기요양: <strong>{selectedDetailClient.longTermCareStatus}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251F1C]">
              <button
                type="button"
                onClick={() => setSelectedDetailClient(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                닫기
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const client = selectedDetailClient;
                    setSelectedDetailClient(null);
                    onSelectClientForConsultation(client);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>AI 상담 녹취 시작</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const client = selectedDetailClient;
                    setSelectedDetailClient(null);
                    onSelectClientForForm(client);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>표준 사례관리 서식 작성</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Action Copied Toast */}
      {copiedInfoToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-rose-900 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl border border-rose-400/60 flex items-center gap-2.5 animate-slide-in">
          <Siren className="w-4 h-4 text-rose-300 shrink-0" />
          <span className="font-medium">{copiedInfoToast}</span>
        </div>
      )}

      {/* Emergency Action Logged Toast */}
      {emergencyLoggedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center gap-2.5 animate-slide-in">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{emergencyLoggedToast}</span>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-700" />
                신규 재가 어르신 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">어르신 성명 *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">연령 및 성별</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                      className="w-20 p-2.5 rounded-lg border border-stone-300 text-xs"
                    />
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="flex-1 p-2.5 rounded-lg border border-stone-300 text-xs"
                    >
                      <option value="여">여성</option>
                      <option value="남">남성</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">연락처</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">가구 형태</label>
                  <select
                    value={newLivingType}
                    onChange={(e) => setNewLivingType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                  >
                    <option value="독거노인">독거노인</option>
                    <option value="노인부부">노인부부</option>
                    <option value="조손가구">조손가구</option>
                    <option value="자녀동거">자녀동거</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">수급 유형</label>
                  <select
                    value={newWelfareType}
                    onChange={(e) => setNewWelfareType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                  >
                    <option value="기초생활수급자(생계/의료)">기초생활수급자 (생계/의료)</option>
                    <option value="기초생활수급자(주거/교육)">기초생활수급자 (주거/교육)</option>
                    <option value="차상위계층">차상위계층</option>
                    <option value="기초연금수급자">기초연금수급자</option>
                    <option value="일반저소득">일반저소득</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">장기요양 등급 인정 상태</label>
                  <select
                    value={newLongTermCare}
                    onChange={(e) => setNewLongTermCare(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                  >
                    <option value="등급외 A">등급외 A</option>
                    <option value="등급외 B">등급외 B (기본)</option>
                    <option value="등급외 C">등급외 C</option>
                    <option value="무등급">무등급 (신청 전)</option>
                    <option value="신청중">신청중</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">실거주지 주소</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="도로명 주소 및 층수/호수"
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">비상연락처 (이름 / 관계 / 전화번호)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newEmergencyName}
                    onChange={(e) => setNewEmergencyName(e.target.value)}
                    placeholder="보호자 성명"
                    className="p-2.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <input
                    type="text"
                    value={newEmergencyRel}
                    onChange={(e) => setNewEmergencyRel(e.target.value)}
                    placeholder="관계 (자녀, 통장)"
                    className="p-2.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <input
                    type="text"
                    value={newEmergencyPhone}
                    onChange={(e) => setNewEmergencyPhone(e.target.value)}
                    placeholder="연락처"
                    className="p-2.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">만성질환 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={newDiseases}
                  onChange={(e) => setNewDiseases(e.target.value)}
                  placeholder="예: 고혈압, 무릎관절염, 당뇨, 백내장"
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">초기 추정 위기도</label>
                <div className="flex gap-4">
                  {(['고위험', '중위험', '일반'] as RiskLevel[]).map((r) => (
                    <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="risk"
                        checked={newRisk === r}
                        onChange={() => setNewRisk(r)}
                        className="text-amber-600"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold cursor-pointer transition-colors"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
