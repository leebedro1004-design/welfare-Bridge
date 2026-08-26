import React, { useState } from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import {
  User,
  DollarSign,
  Home,
  HeartPulse,
  Brain,
  Activity,
  Layers,
  Smile,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup, MultiCheckboxGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const AssessmentFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const [subTab, setSubTab] = useState<'basic' | 'story' | 'genogram' | 'adl' | 'emotion' | 'sgds'>('basic');

  // SGDS 15 questions calculation
  const sgdsQuestions = [
    { num: 1, text: '현재의 생활에 대체적으로 만족스럽지 않다고 느끼십니까?', default: 2 },
    { num: 2, text: '요즘 들어 활동량이나 의욕이 많이 떨어지셨습니까?', default: 1 },
    { num: 3, text: '자신이 헛되이 살고 있다고 느끼십니까?', default: 1 },
    { num: 4, text: '생활이 지루하게 느껴질 때가 많습니까?', default: 1 },
    { num: 5, text: '평소에 기분은 상쾌하지 못한 편이십니까?', default: 1 },
    { num: 6, text: '자신에게 불길한 일이 닥칠 것 같아 불안하십니까?', default: 1 },
    { num: 7, text: '대체로 마음이 우울하거나 슬픈 편이십니까?', default: 2 },
    { num: 8, text: '절망적이라는 느낌이 자주 드십니까?', default: 0 },
    { num: 9, text: '바깥에 나가기가 싫고 집에만 있고 싶습니까?', default: 1 },
    { num: 10, text: '비슷한 나이의 다른 노인들보다 기억력이 더 나쁘다고 느끼십니까?', default: 0 },
    { num: 11, text: '현재 살아 있다는 것이 즐겁지 않다고 생각되십니까?', default: 1 },
    { num: 12, text: '지금의 내 자신이 아무 쓸모없는 사람이라고 느끼십니까?', default: 0 },
    { num: 13, text: '기력이 예전보다 떨어지셨습니까?', default: 2 },
    { num: 14, text: '지금의 나에게는 희망이 없다고 생각되십니까?', default: 1 },
    { num: 15, text: '자신이 다른 사람들의 처지보다 더 못하다고 느끼십니까?', default: 1 },
  ];

  const currentSgdsAnswers = fields.sgdsAnswers || {};
  const totalSgdsScore: number = Object.values(currentSgdsAnswers).reduce<number>((acc, cur) => acc + (Number(cur) || 0), 0) || 15;

  const handleSgdsChange = (num: number, val: number) => {
    if (readOnly) return;
    const updated = { ...currentSgdsAnswers, [num]: val };
    const score: number = Object.values(updated).reduce<number>((acc, cur) => acc + (Number(cur) || 0), 0);
    onSpecificChange('sgdsAnswers', updated);
    onSpecificChange('sgdsTotalScore', score);
  };

  // ADL State
  const adlData: Record<string, string> = fields.adlData || {
    door: '자립가능',
    shoesOff: '자립가능',
    shoesCabinet: '자립가능',
    chair: '자립가능',
    bath: '자립가능',
    clothes: '자립가능',
    toilet: '자립가능',
    bowel: '자립가능',
    walk100m: '약간불편',
    stairRailing: '약간불편',
    stairNoRailing: '약간불편',
  };

  const handleAdlChange = (key: string, val: string) => {
    if (readOnly) return;
    const updated = { ...adlData, [key]: val };
    onSpecificChange('adlData', updated);
  };

  // IADL State
  const iadlData: Record<string, string> = fields.iadlData || {
    phone: '자립가능',
    shopping: '약간불편',
    cooking: '약간불편',
    cleaning: '약간불편',
    laundry: '약간불편',
    traffic: '약간불편',
    medication: '자립가능',
    money: '자립가능',
  };

  const handleIadlChange = (key: string, val: string) => {
    if (readOnly) return;
    const updated = { ...iadlData, [key]: val };
    onSpecificChange('iadlData', updated);
  };

  const economicStatus = fields.economicStatus || '기초생활수급자';
  const chronicDiseases: string[] = fields.chronicDiseases || ['고혈압', '관절염', '디스크'];

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Official Form Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          사 정 기 록 지
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 종합사정 표준 서식 2호 - Page 2~8)
        </p>
      </div>

      {/* Sub Section Navigation */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-stone-200 dark:border-stone-800 pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setSubTab('basic')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'basic'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          1. 기본·경제·주거·건강
        </button>
        <button
          type="button"
          onClick={() => setSubTab('story')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'story'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          2. 일반사정 & 과거/현재사
        </button>
        <button
          type="button"
          onClick={() => setSubTab('genogram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'genogram'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          3. 가계도 & 생태도 & 약도
        </button>
        <button
          type="button"
          onClick={() => setSubTab('adl')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'adl'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          4. ADL & IADL 척도표
        </button>
        <button
          type="button"
          onClick={() => setSubTab('emotion')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'emotion'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          5. 정서적·사회적 측면
        </button>
        <button
          type="button"
          onClick={() => setSubTab('sgds')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'sgds'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          6. 노인 우울증 (SGDS 15문항)
        </button>
      </div>

      {/* 1. 기본·경제·주거·건강 (Page 2) */}
      {(subTab === 'basic' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4">
          {/* Header Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs p-3 bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 rounded-lg">
            <div className="flex items-center gap-1">
              <span className="text-stone-500">상담일시:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.assessmentDate || '2019. 06. 30 (14:00~15:00)'}
                onChange={(e) => onSpecificChange('assessmentDate', e.target.value)}
                className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-stone-500">상담자:</span>
              <input
                type="text"
                disabled={readOnly}
                value={doc.author || '이상호 / 사회복지사'}
                onChange={(e) => onChange('author', e.target.value)}
                className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32 font-medium"
              />
            </div>
            <div>상담방법: <strong>방문상담</strong></div>
            <div>대상자: <strong>{doc.clientName}</strong></div>
          </div>

          {/* 경제사항 */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>경제사항 (체크 및 텍스트 수정)</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">보호형태</th>
                  <td className="p-2">
                    <RadioToggleGroup
                      options={['기초생활수급자', '차상위', '의료경감대상', '국가유공자', '일반 저소득']}
                      value={economicStatus}
                      onChange={(v) => onSpecificChange('economicStatus', v)}
                      disabled={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">소득상황</th>
                  <td className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20">근로소득:</span>
                        <input type="text" disabled={readOnly} value={fields.incomeWork || '150,000원'} onChange={(e) => onSpecificChange('incomeWork', e.target.value)} className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20">생계·주거비:</span>
                        <input type="text" disabled={readOnly} value={fields.incomeLivelihood || '270,000원'} onChange={(e) => onSpecificChange('incomeLivelihood', e.target.value)} className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20">기초연금:</span>
                        <input type="text" disabled={readOnly} value={fields.incomePension || '250,000원'} onChange={(e) => onSpecificChange('incomePension', e.target.value)} className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20">후원금:</span>
                        <input type="text" disabled={readOnly} value={fields.incomeDonation || '20,000원'} onChange={(e) => onSpecificChange('incomeDonation', e.target.value)} className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20">부양자지원:</span>
                        <input type="text" disabled={readOnly} value={fields.incomeFamilySupport || '100,000원'} onChange={(e) => onSpecificChange('incomeFamilySupport', e.target.value)} className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 w-20 font-bold text-amber-700 dark:text-amber-400">총 수입(月):</span>
                        <input type="text" disabled={readOnly} value={fields.incomeTotal || '약 790,000원'} onChange={(e) => onSpecificChange('incomeTotal', e.target.value)} className="p-1 border rounded bg-amber-50 dark:bg-[#2A231F] text-xs w-full font-bold" />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 주거사항 */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>주거사항 및 환경</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">소유/형태</th>
                  <td className="p-2">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.housingDetail || '월세 (보증금 1,000만원 / 월세 15만원), 아파트/빌라 (2층, 승강기 무)'}
                      onChange={(e) => onSpecificChange('housingDetail', e.target.value)}
                      className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                    />
                  </td>
                </tr>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">상태/위생</th>
                  <td className="p-2">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.housingHygiene || '주택상태: 불량 (도배/장판 노후), 위생상태: 양호'}
                      onChange={(e) => onSpecificChange('housingHygiene', e.target.value)}
                      className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">난방/화장실</th>
                  <td className="p-2">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.housingFacility || '난방: 가스보일러, 화장실: 단독 / 서양식 (안전손잡이 설치 필요)'}
                      onChange={(e) => onSpecificChange('housingFacility', e.target.value)}
                      className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 건강사항 */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
              <span>건강사항 및 만성질환 (체크/해제 가능)</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">만성질환</th>
                  <td className="p-2">
                    <MultiCheckboxGroup
                      options={[
                        '고혈압',
                        '관절염',
                        '디스크',
                        '당뇨',
                        '치매',
                        '뇌졸중',
                        '심부전',
                        '골다공증',
                        '백내장',
                      ]}
                      selectedValues={chronicDiseases}
                      onChange={(v) => onSpecificChange('chronicDiseases', v)}
                      disabled={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">신체/정신문제</th>
                  <td className="p-2">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.healthPhysicalMentalNotes || '신체: 시각(노안), 무릎 통증, 수면장애 / 정신: 우울증 (사별 후 고립감)'}
                      onChange={(e) => onSpecificChange('healthPhysicalMentalNotes', e.target.value)}
                      className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. 일반사정 & 과거/현재사 (Page 3) */}
      {(subTab === 'story' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 space-y-3 bg-white dark:bg-[#1E1916] text-xs">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-600" />
              <span>일반사정 (4대 영역 - 직접 수정 가능)</span>
            </h4>
            <div className="space-y-2">
              <div>
                <span className="font-bold block mb-1">① 외양:</span>
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.assessmentAppearance || '백발에 체구가 왜소하시며, 안색은 다소 창백하나 단정한 인상을 유지하심.'}
                  onChange={(e) => onSpecificChange('assessmentAppearance', e.target.value)}
                  className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
              <div>
                <span className="font-bold block mb-1">② 인지:</span>
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.assessmentCognition || '무학이나 시간, 장소, 사람에 대한 지남력이 양호하고 대화와 의사소통에 전혀 지장이 없음.'}
                  onChange={(e) => onSpecificChange('assessmentCognition', e.target.value)}
                  className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
              <div>
                <span className="font-bold block mb-1">③ 정서:</span>
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.assessmentEmotion || '배우자 사별 후 홀로 지내며 느끼는 적적함과 허전함, 경미한 우울감을 표현하심.'}
                  onChange={(e) => onSpecificChange('assessmentEmotion', e.target.value)}
                  className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
              <div>
                <span className="font-bold block mb-1">④ 행동:</span>
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.assessmentBehavior || '무릎 관절염으로 지팡이를 짚고 보행하며, 복지사의 방문에 매우 반갑게 맞아주며 협조적임.'}
                  onChange={(e) => onSpecificChange('assessmentBehavior', e.target.value)}
                  className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 bg-white dark:bg-[#1E1916] space-y-1.5">
              <h5 className="font-bold text-stone-800 dark:text-stone-200 border-b pb-1">대상자의 과거사</h5>
              <textarea
                rows={4}
                disabled={readOnly}
                value={fields.clientPastStory || '젊은 시절 시장에서 장사를 하며 슬하의 자녀들을 출가시켰으나, 수년 전 남편과 사별한 후 홀로 생활해 옴.'}
                onChange={(e) => onSpecificChange('clientPastStory', e.target.value)}
                className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
              />
            </div>
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 bg-white dark:bg-[#1E1916] space-y-1.5">
              <h5 className="font-bold text-stone-800 dark:text-stone-200 border-b pb-1">대상자의 현재사</h5>
              <textarea
                rows={4}
                disabled={readOnly}
                value={fields.clientPresentStory || '만성 관절염으로 활동량이 급격히 줄고 식사 준비에 어려움이 있어 끼니를 거르는 빈도가 잦아짐.'}
                onChange={(e) => onSpecificChange('clientPresentStory', e.target.value)}
                className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. 가계도 & 생태도 & 약도 (Page 4, 5) */}
      {(subTab === 'genogram' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] text-xs space-y-3">
              <div className="font-bold border-b pb-2 flex items-center justify-between">
                <span>가계도 (Genogram)</span>
                <span className="text-[11px] text-stone-500">가족 구조도</span>
              </div>
              <div className="bg-stone-50 dark:bg-[#251E1A] p-4 rounded-lg flex flex-col items-center justify-center space-y-4 min-h-[160px] border border-dashed border-stone-300 dark:border-stone-700">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 border-2 border-stone-600 dark:border-stone-400 flex items-center justify-center text-xs font-bold relative">
                      <span>남편</span>
                      <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-black">✕</div>
                    </div>
                  </div>
                  <div className="w-8 h-0.5 bg-stone-500"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 border-2 border-amber-600 rounded-full flex items-center justify-center text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400">
                      {doc.clientName?.slice(0, 2) || '본인'}
                    </div>
                  </div>
                </div>
                <div className="w-36 border-t-2 border-stone-400 pt-2 flex justify-between">
                  <div className="flex flex-col items-center text-[10px]">
                    <div className="w-7 h-7 border border-stone-500 flex items-center justify-center font-semibold">장남</div>
                    <span className="text-stone-500">연락두절</span>
                  </div>
                  <div className="flex flex-col items-center text-[10px]">
                    <div className="w-7 h-7 border border-stone-500 rounded-full flex items-center justify-center font-semibold">장녀</div>
                    <span className="text-stone-500">타지역</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] text-xs space-y-3">
              <div className="font-bold border-b pb-2 flex items-center justify-between">
                <span>생태도 (지역사회 연계망)</span>
                <span className="text-[11px] text-stone-500">사회적 지지체계</span>
              </div>
              <div className="bg-stone-50 dark:bg-[#251E1A] p-4 rounded-lg flex flex-col items-center justify-center space-y-3 min-h-[160px] border border-dashed border-stone-300 dark:border-stone-700">
                <div className="grid grid-cols-3 gap-2 w-full text-center text-[11px]">
                  <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-bold">
                    성당동 주민센터 ↔
                  </div>
                  <div></div>
                  <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 font-bold">
                    재가노인지원센터 ↔
                  </div>
                </div>
                <div className="w-20 h-20 rounded-full border-2 border-amber-600 bg-amber-50 dark:bg-amber-950 flex flex-col items-center justify-center font-bold text-amber-950 dark:text-amber-200">
                  <span>{doc.clientName}</span>
                  <span className="text-[10px] font-normal">(독거)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full text-center text-[11px]">
                  <div className="p-1.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-400">
                    이웃 주민
                  </div>
                  <div></div>
                  <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                    지역 교회
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADL & IADL 척도표 (Page 6) - Interactive Checkboxes */}
      {(subTab === 'adl' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4 text-xs">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
              <span>■ 일상생활 동작정도 (ADL - 각 항목을 클릭하여 상태 변경)</span>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                  <th className="p-2 border-r text-left">일상생활 동작 항목</th>
                  <th className="p-2 border-r w-24">자립가능</th>
                  <th className="p-2 border-r w-24">약간불편</th>
                  <th className="p-2 border-r w-24">도와주면 가능</th>
                  <th className="p-2 w-24">완전도움필요</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'door', label: '문 열고 닫기' },
                  { key: 'shoesOff', label: '혼자서 신발 벗기' },
                  { key: 'shoesCabinet', label: '신발을 신발장에 넣기' },
                  { key: 'chair', label: '의자를 책상에 넣고 빼기' },
                  { key: 'bath', label: '욕조 들어가 목욕하기 / 세수' },
                  { key: 'clothes', label: '옷 입기 및 벗기' },
                  { key: 'toilet', label: '변기에 앉기 및 뒷처리' },
                  { key: 'bowel', label: '대소변 조절하기' },
                  { key: 'walk100m', label: '혼자서 100m 이상 걷기' },
                  { key: 'stairRailing', label: '난간 잡고 계단 오르내리기' },
                  { key: 'stairNoRailing', label: '난간 없이 계단 오르내리기' },
                ].map((item) => (
                  <tr key={item.key} className="border-b border-stone-200 dark:border-stone-800">
                    <td className="p-2 text-left border-r font-medium">{item.label}</td>
                    {['자립가능', '약간불편', '도와주면 가능', '완전도움필요'].map((level) => (
                      <td key={level} className="p-1 border-r last:border-r-0">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleAdlChange(item.key, level)}
                          className={`w-full py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            adlData[item.key] === level
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {adlData[item.key] === level ? '■' : '□'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
              <span>■ 도구적 일상생활 동작 (IADL - 각 항목을 클릭하여 상태 변경)</span>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                  <th className="p-2 border-r text-left">도구적 일상동작 항목</th>
                  <th className="p-2 border-r w-24">자립가능</th>
                  <th className="p-2 border-r w-24">약간불편</th>
                  <th className="p-2 border-r w-24">도와주면 가능</th>
                  <th className="p-2 w-24">완전도움필요</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'phone', label: '전화 사용하기' },
                  { key: 'shopping', label: '물건 사기(장보기)' },
                  { key: 'cooking', label: '식사 준비하기' },
                  { key: 'cleaning', label: '집안 청소 및 정돈' },
                  { key: 'laundry', label: '빨래하기' },
                  { key: 'traffic', label: '대중교통 이용하기' },
                  { key: 'medication', label: '약 챙겨먹기' },
                  { key: 'money', label: '금전 관리(돈 계산)' },
                ].map((item) => (
                  <tr key={item.key} className="border-b border-stone-200 dark:border-stone-800">
                    <td className="p-2 text-left border-r font-medium">{item.label}</td>
                    {['자립가능', '약간불편', '도와주면 가능', '완전도움필요'].map((level) => (
                      <td key={level} className="p-1 border-r last:border-r-0">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleIadlChange(item.key, level)}
                          className={`w-full py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            iadlData[item.key] === level
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {iadlData[item.key] === level ? '■' : '□'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. 정서적·사회적 측면 */}
      {(subTab === 'emotion' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4 text-xs">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2">
              ■ 정서적 및 사회적 상태 사정 (직접 수정 가능)
            </h4>
            <div className="space-y-2">
              <div>
                <label className="font-semibold block mb-1">1. 정서 상태 및 주 호소 문제:</label>
                <textarea
                  rows={2}
                  disabled={readOnly}
                  value={fields.emotionMainComplaint || '배우자 사별 후 오랜 기간 독거로 생활하며 느끼는 외로움과 고립감이 깊음. 주간 시간대에 찾아오는 사람이 없어 적적함을 자주 호소함.'}
                  onChange={(e) => onSpecificChange('emotionMainComplaint', e.target.value)}
                  className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">2. 사회적 관계 및 지지체계:</label>
                <textarea
                  rows={2}
                  disabled={readOnly}
                  value={fields.socialSupportNotes || '인근 주민들과 가벼운 눈인사를 나누는 정도이며, 정기적인 친목 모임이나 경로당 출입은 관절 통증과 성격상 부담으로 인해 거의 하지 않음.'}
                  onChange={(e) => onSpecificChange('socialSupportNotes', e.target.value)}
                  className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 노인 우울증 (SGDS 15문항) */}
      {(subTab === 'sgds' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
          <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
            <span>■ 단축형 노인 우울척도 (SGDS-K 15문항 - 클릭하여 문항별 점수 선택)</span>
            <span className="text-amber-800 dark:text-amber-300 font-extrabold text-sm bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded border border-amber-300">
              총점: {totalSgdsScore}점 / 30점 ({totalSgdsScore >= 8 ? '중등도 이상 우울 의심' : '정상'})
            </span>
          </div>
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                <th className="p-2 border-r w-12">번호</th>
                <th className="p-2 border-r text-left">문항 내용</th>
                <th className="p-2 border-r w-24">예 (2점)</th>
                <th className="p-2 border-r w-24">보통 (1점)</th>
                <th className="p-2 w-24">아니오 (0점)</th>
              </tr>
            </thead>
            <tbody>
              {sgdsQuestions.map((q) => {
                const currentVal = currentSgdsAnswers[q.num] !== undefined ? currentSgdsAnswers[q.num] : q.default;
                return (
                  <tr key={q.num} className="border-b border-stone-200 dark:border-stone-800">
                    <td className="p-2 border-r font-semibold">{q.num}</td>
                    <td className="p-2 text-left border-r font-medium">{q.text}</td>
                    {[2, 1, 0].map((score) => (
                      <td key={score} className="p-1 border-r last:border-r-0">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleSgdsChange(q.num, score)}
                          className={`w-full py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            currentVal === score
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {currentVal === score ? '■' : '□'}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
