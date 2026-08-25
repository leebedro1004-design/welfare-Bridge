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
  HeartHandshake
} from 'lucide-react';
import { ClientProfile, RiskLevel, LivingType, WelfareType } from '../types';

interface ClientListProps {
  clients: ClientProfile[];
  onAddClient: (newClient: ClientProfile) => void;
  onSelectClientForConsultation: (client: ClientProfile) => void;
  onSelectClientForForm: (client: ClientProfile) => void;
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
    // Reset form
    setNewName('');
    setNewAddress('');
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
              <div className="border-t border-stone-100 bg-stone-50/80 p-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectClientForConsultation(client)}
                  className="py-2 px-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/90 border border-amber-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>AI 녹취분석</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectClientForForm(client)}
                  className="py-2 px-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>서식 작성/보기</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
