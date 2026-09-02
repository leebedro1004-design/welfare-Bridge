import React, { useState } from 'react';
import {
  X,
  UserPlus,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
  FileText,
  Building,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { ClientProfile, RiskLevel, LivingType, WelfareType, DocumentType } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient?: (newClient: ClientProfile, immediateAction?: 'ai_consultation' | 'intake_form' | 'none') => void;
  onSaveClient?: (newClient: ClientProfile) => void;
  onStartAIConsultation?: (newClient: ClientProfile) => void;
  onStartIntakeForm?: (newClient: ClientProfile) => void;
  agencyName?: string;
  workerName?: string;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
  onSaveClient,
  onStartAIConsultation,
  onStartIntakeForm,
  agencyName = '사회복지시설 사례관리팀',
  workerName = '이현정',
}) => {
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('1946-04-12');
  const [age, setAge] = useState<number>(80);
  const [gender, setGender] = useState<'남' | '여'>('여');
  const [phone, setPhone] = useState<string>('010-');
  const [address, setAddress] = useState<string>('');
  const [livingType, setLivingType] = useState<LivingType>('독거노인');
  const [welfareType, setWelfareType] = useState<WelfareType>('기초생활수급자(생계/의료)');
  const [longTermCareStatus, setLongTermCareStatus] = useState<any>('등급외 B');
  const [chronicDiseases, setChronicDiseases] = useState<string>('고혈압, 관절염, 당뇨, 척추협착증');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('고위험');
  const [emergencyName, setEmergencyName] = useState<string>('');
  const [emergencyRel, setEmergencyRel] = useState<string>('자녀');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('010-');
  const [intakeReason, setIntakeReason] = useState<string>('지역사회 발굴 및 독거 고령으로 인한 영양결식·안전확인 필요');

  if (!isOpen) return null;

  const handleSubmit = (action: 'ai_consultation' | 'intake_form' | 'none') => {
    if (!name.trim()) {
      alert('어르신 성함을 입력해주세요.');
      return;
    }

    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      birthDate: birthDate || '1945-01-01',
      age: Number(age) || 80,
      gender: gender,
      phone: phone || '010-0000-0000',
      emergencyContact: {
        name: emergencyName || '이웃 통장',
        relation: emergencyRel || '인근 주민',
        phone: emergencyPhone || '010-0000-0000',
      },
      address: address || '서울특별시 관내 주소',
      livingType: livingType,
      welfareType: welfareType,
      longTermCareStatus: longTermCareStatus,
      chronicDiseases: chronicDiseases
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
      riskLevel: riskLevel,
      caseWorker: `${workerName} 사회복지사`,
      registrationDate: new Date().toISOString().slice(0, 10),
      status: '진행중',
      lastVisitDate: new Date().toISOString().slice(0, 10),
      visitPriority: riskLevel === '고위험' ? '긴급' : riskLevel === '중위험' ? '우선' : '일반',
    };

    // 1. Invoke onAddClient unified handler if provided
    if (onAddClient) {
      onAddClient(newClient, action);
    }

    // 2. Invoke specific action callback
    if (action === 'ai_consultation' && onStartAIConsultation) {
      onStartAIConsultation(newClient);
    } else if (action === 'intake_form' && onStartIntakeForm) {
      onStartIntakeForm(newClient);
    } else if (action === 'none' && onSaveClient) {
      onSaveClient(newClient);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-300 dark:border-stone-700 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                신규 어르신 등록 & 신규 사례 시작
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {agencyName} · 담당: {workerName} 사회복지사
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit('none');
          }}
          className="p-6 space-y-5 text-xs text-stone-800 dark:text-stone-200 max-h-[75vh] overflow-y-auto"
        >
          {/* Quick Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              신규 등록 즉시 <strong>[별지 제1호] 접수기록지</strong>가 자동 생성되며, 등록 완료 후 바로 <strong>실시간 AI 음성 녹취 상담</strong>으로 이동할 수 있습니다.
            </p>
          </div>

          {/* Section 1: Basic Profile */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1.5 text-xs sm:text-sm">
              <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              1. 기본 인적사항
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  어르신 성함 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길순"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  성별 & 연령
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as '남' | '여')}
                    className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium"
                  >
                    <option value="여">여성</option>
                    <option value="남">남성</option>
                  </select>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    placeholder="만 나이"
                    className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  생년월일
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  어르신 연락처 (휴대폰/유선)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  실거주지 주소
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="예: 서울시 도봉구 도봉로 123길 45, 2층"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Welfare & Health Status */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1.5 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              2. 수급구분 및 건강·위기도 상태
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  거주 형태
                </label>
                <select
                  value={livingType}
                  onChange={(e) => setLivingType(e.target.value as LivingType)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                >
                  <option value="독거노인">독거노인 (1인 가구)</option>
                  <option value="노인부부">노인부부 가구</option>
                  <option value="자녀동거">자녀 동거</option>
                  <option value="손자녀동거">조손 가구</option>
                  <option value="기타">기타 거주</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  소득/수급 구분
                </label>
                <select
                  value={welfareType}
                  onChange={(e) => setWelfareType(e.target.value as WelfareType)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                >
                  <option value="기초생활수급자(생계/의료)">기초생활수급자 (생계/의료)</option>
                  <option value="기초생활수급자(주거/교육)">기초생활수급자 (주거/교육)</option>
                  <option value="차상위계층">차상위계층</option>
                  <option value="기초연금수급자">기초연금수급자 (일반)</option>
                  <option value="일반저소득">일반 저소득</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  장기요양 등급 상태
                </label>
                <select
                  value={longTermCareStatus}
                  onChange={(e) => setLongTermCareStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                >
                  <option value="등급외 B">등급외 B (재가지원 주 대상)</option>
                  <option value="등급외 A">등급외 A</option>
                  <option value="등급외 C">등급외 C</option>
                  <option value="무등급">무등급 (신청 예정)</option>
                  <option value="신청중">국민건강보험 신청 중</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  주요 만성질환 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  placeholder="예: 고혈압, 퇴행성관절염, 당뇨, 백내장"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  초기 추정 위기도 (집중도)
                </label>
                <div className="flex gap-2 pt-1">
                  {(['고위험', '중위험', '일반'] as RiskLevel[]).map((r) => {
                    const isChecked = riskLevel === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskLevel(r)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isChecked
                            ? r === '고위험'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : r === '중위험'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        <span>{r}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1.5 text-xs sm:text-sm">
              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              3. 비상연락망 및 보호자
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="보호자 성명"
                className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
              />
              <input
                type="text"
                value={emergencyRel}
                onChange={(e) => setEmergencyRel(e.target.value)}
                placeholder="관계 (예: 장녀, 이웃통장)"
                className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
              />
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="보호자 연락처"
                className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold cursor-pointer transition-colors text-xs"
            >
              취소
            </button>

            {/* ACTION 1: Register & Start AI Consultation directly */}
            <button
              type="button"
              onClick={() => handleSubmit('ai_consultation')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] text-xs"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>등록 후 바로 AI 녹취 상담 시작</span>
            </button>

            {/* ACTION 2: Register & Open Intake Form */}
            <button
              type="button"
              onClick={() => handleSubmit('intake_form')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] text-xs"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>등록 후 초기상담서식 작성</span>
            </button>

            {/* ACTION 3: Register only */}
            <button
              type="button"
              onClick={() => handleSubmit('none')}
              className="px-4 py-2.5 rounded-xl bg-[#2D2622] hover:bg-[#3D332D] text-stone-200 font-bold cursor-pointer transition-colors text-xs"
            >
              기본 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
