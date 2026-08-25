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
    const updated = { ...currentSgdsAnswers, [num]: val };
    const score: number = Object.values(updated).reduce<number>((acc, cur) => acc + (Number(cur) || 0), 0);
    onSpecificChange('sgdsAnswers', updated);
    onSpecificChange('sgdsTotalScore', score);
  };

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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
            <div>상담일시: <strong>2019년 06월 30일 (14:00~15:00)</strong></div>
            <div>상담자: <strong>{doc.author || '이상호 / 사회복지사'}</strong></div>
            <div>상담방법: <strong>■ 방문 □ 내방 □ 전화</strong></div>
            <div>대상자: <strong>{doc.clientName}</strong></div>
          </div>

          {/* 경제사항 */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>경제사항</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">보호형태</th>
                  <td className="p-2 flex flex-wrap gap-3">
                    <span className="font-bold text-amber-700 dark:text-amber-400">■ 기초생활수급자</span>
                    <span className="text-stone-500">□ 차상위</span>
                    <span className="text-stone-500">□ 의료경감대상</span>
                    <span className="text-stone-500">□ 국가유공자</span>
                    <span className="text-stone-500">□ 일반</span>
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">소득상황</th>
                  <td className="p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <span>■ 근로소득: 150,000원</span>
                      <span>■ 생계·주거비: 270,000원</span>
                      <span>■ 기초연금: 250,000원</span>
                      <span>■ 후원금(종교): 20,000원</span>
                      <span>■ 부양자지원(첫째): 100,000원</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">총 수입(月): 약 790,000원</span>
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
                    <div className="flex flex-wrap gap-4">
                      <span className="font-bold">■ 월세 (보증금 1,000만원 / 월세 15만원)</span>
                      <span>■ 아파트/빌라 (2층이상, 승강기 무)</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">상태/위생</th>
                  <td className="p-2 flex flex-wrap gap-6">
                    <span>주택상태: <strong className="text-amber-700 dark:text-amber-400">■ 불량 (도배/장판 노후)</strong></span>
                    <span>위생상태: <strong>■ 양호</strong></span>
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">난방/화장실</th>
                  <td className="p-2 flex flex-wrap gap-6">
                    <span>난방: <strong>■ 가스보일러</strong></span>
                    <span>화장실: <strong>■ 단독 / ■ 서양식</strong></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 건강사항 */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
              <span>건강사항 및 질병 현황</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">전체건강</th>
                  <td className="p-2 font-bold text-amber-700 dark:text-amber-400">
                    ■ 질환은 있지만 건강한 편이다 (거동: 도움필요 / 지체장애 3급 / 장기요양 등급없음)
                  </td>
                </tr>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">만성질환</th>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2 text-stone-700 dark:text-stone-300">
                      <span className="font-bold text-stone-900 dark:text-stone-100">■ 고혈압</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">■ 관절염</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">■ 디스크</span>
                      <span className="text-stone-400">□ 당뇨</span>
                      <span className="text-stone-400">□ 치매</span>
                      <span className="text-stone-400">□ 뇌졸중</span>
                      <span className="text-stone-400">□ 심부전</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">신체/정신문제</th>
                  <td className="p-2 flex flex-wrap gap-4">
                    <span>신체문제: <strong>■ 시각 (노안), ■ 수면장애</strong></span>
                    <span>정신문제: <strong className="text-amber-700 dark:text-amber-400">■ 우울증 (사별 후 고립)</strong></span>
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
              <span>일반사정 (4대 영역)</span>
            </h4>
            <div className="space-y-2">
              <p><strong>① 외양:</strong> {fields.assessmentAppearance || '백발에 체구가 왜소하시며, 안색은 다소 창백하나 단정한 인상을 유지하심.'}</p>
              <p><strong>② 인지:</strong> {fields.assessmentCognition || '무학이나 시간, 장소, 사람에 대한 지남력이 양호하고 대화와 의사소통에 전혀 지장이 없음.'}</p>
              <p><strong>③ 정서:</strong> {fields.assessmentEmotion || '배우자 사별 후 홀로 지내며 느끼는 적적함과 허전함, 경미한 우울감을 표현하심.'}</p>
              <p><strong>④ 행동:</strong> {fields.assessmentBehavior || '무릎 관절염으로 지팡이를 짚고 보행하며, 복지사의 방문에 매우 반갑게 맞아주며 협조적임.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 bg-white dark:bg-[#1E1916] space-y-1.5">
              <h5 className="font-bold text-stone-800 dark:text-stone-200 border-b pb-1">대상자의 과거사</h5>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                {fields.clientPastStory || '젊은 시절 시장에서 장사를 하며 슬하의 자녀들을 출가시켰으나, 수년 전 남편과 사별한 후 홀로 생활해 옴.'}
              </p>
            </div>
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 bg-white dark:bg-[#1E1916] space-y-1.5">
              <h5 className="font-bold text-stone-800 dark:text-stone-200 border-b pb-1">대상자의 현재사</h5>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                {fields.clientPresentStory || '만성 관절염으로 활동량이 급격히 줄고 식사 준비에 어려움이 있어 끼니를 거르는 빈도가 잦아짐.'}
              </p>
            </div>
          </div>

          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 bg-white dark:bg-[#1E1916] space-y-2 text-xs">
            <h5 className="font-bold text-stone-800 dark:text-stone-200 border-b pb-1">대상자의 욕구사항 & 사회복지사 종합 소견</h5>
            <p><strong>• 일상생활지원 욕구:</strong> 밑반찬 배달(주 2회) 및 가사지원, 이동 시 차량 연계 희망</p>
            <p><strong>• 지역사회자원개발 욕구:</strong> 후원물품(쌀, 라면, 생필품) 지원 및 보청기/안과 검진</p>
            <p className="text-amber-800 dark:text-amber-300 font-semibold pt-1">
              <strong>• 사회복지사 소견:</strong> 경제적 취약성과 만성질환으로 인한 신체기능 저하, 독거로 인한 우울감 위험이 혼재되어 있어 정기적인 재가노인사례관리 개입이 반드시 필요함.
            </p>
          </div>
        </div>
      )}

      {/* 3. 가계도 & 생태도 & 약도 (Page 4, 5) */}
      {(subTab === 'genogram' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 가계도 Genogram Visual */}
            <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] text-xs space-y-3">
              <div className="font-bold border-b pb-2 flex items-center justify-between">
                <span>가계도 (Genogram)</span>
                <span className="text-[11px] text-stone-500">3대 가족구조도</span>
              </div>
              <div className="bg-stone-50 dark:bg-[#251E1A] p-4 rounded-lg flex flex-col items-center justify-center space-y-4 min-h-[160px] border border-dashed border-stone-300 dark:border-stone-700">
                {/* 1st Gen */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 border-2 border-stone-600 dark:border-stone-400 flex items-center justify-center text-xs font-bold relative">
                      <span>남편</span>
                      <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-black">✕ (사망)</div>
                    </div>
                  </div>
                  <div className="w-8 h-0.5 bg-stone-500"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 border-2 border-amber-600 rounded-full flex items-center justify-center text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400">
                      ct (본인)
                    </div>
                  </div>
                </div>
                {/* 2nd Gen Children */}
                <div className="w-36 border-t-2 border-stone-400 pt-2 flex justify-between">
                  <div className="flex flex-col items-center text-[10px]">
                    <div className="w-7 h-7 border border-stone-500 flex items-center justify-center font-semibold">장남</div>
                    <span className="text-stone-500">연락두절</span>
                  </div>
                  <div className="flex flex-col items-center text-[10px]">
                    <div className="w-7 h-7 border border-stone-500 rounded-full flex items-center justify-center font-semibold">장녀</div>
                    <span className="text-stone-500">타지역 거주</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 생태도 Ecomap Visual */}
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
                  <span className="text-[10px] font-normal">(75세 / 독거)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full text-center text-[11px]">
                  <div className="p-1.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-400">
                    이웃 주민 (인사정도)
                  </div>
                  <div></div>
                  <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                    지역 한울교회 (종교)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 약도 및 진입로 (Page 5) */}
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] text-xs space-y-2">
            <h4 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>약도 및 현장 교통편 / 진입 안내</span>
            </h4>
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              • 소재지: {client?.address || '대구광역시 달서구 대명천로 38-1, 2층 (왼쪽 첫 번째 대문)'}
            </p>
            <p className="text-stone-500">
              • 진입 요령: 대명천로 버스정류장 하차 후 송원철학관 골목으로 진입하여 좌측 첫 번째 적벽돌 주택 2층 계단 이용.
            </p>
          </div>
        </div>
      )}

      {/* 4. ADL & IADL 척도표 (Page 6) */}
      {(subTab === 'adl' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4 text-xs">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold border-b border-stone-300 dark:border-stone-700">
              ■ 일상생활 동작정도 (ADL)
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                  <th className="p-2 border-r w-24">구분</th>
                  <th className="p-2 border-r">일상생활 동작</th>
                  <th className="p-2 border-r w-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">자립가능</th>
                  <th className="p-2 border-r w-20 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">약간불편</th>
                  <th className="p-2 border-r w-24">도와주면 가능</th>
                  <th className="p-2 w-24">완전도움필요</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td rowSpan={4} className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">기본동작</td><td className="p-2 text-left border-r">문 열고 닫기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">혼자서 신발 벗기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">신발을 신장에 넣기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">의자를 책상에 넣고 빼기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>

                <tr className="border-b"><td rowSpan={4} className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">신변/용변</td><td className="p-2 text-left border-r">욕조 들어가 목욕하기 / 세수</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">옷 입기 및 벗기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">변기에 앉기 및 뒷처리</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">대소변 조절하기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>

                <tr className="border-b"><td rowSpan={3} className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">보행/이동</td><td className="p-2 text-left border-r">혼자서 100m 이상 걷기</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">난간 잡고 계단 오르내리기</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">난간 없이 계단 오르내리기</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
              </tbody>
            </table>
          </div>

          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold border-b border-stone-300 dark:border-stone-700">
              ■ 도구적 일상생활 동작 (IADL)
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                  <th className="p-2 border-r">항목</th>
                  <th className="p-2 border-r w-24">자립가능</th>
                  <th className="p-2 border-r w-24 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">약간불편</th>
                  <th className="p-2 border-r w-24">도와주면 가능</th>
                  <th className="p-2 w-24">완전도움필요</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-2 text-left border-r">전화 사용</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">외출 또는 여행</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">물건 구입 및 장보기</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">식사 준비 (조리)</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">집안일 (청소, 정리정돈)</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr className="border-b"><td className="p-2 text-left border-r">제시간에 정확한 용량의 약 복용</td><td className="p-2 border-r font-black text-emerald-600">✓</td><td className="p-2 border-r"></td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
                <tr><td className="p-2 text-left border-r">집 수공일 (바느질, 못질, 형광등교체)</td><td className="p-2 border-r"></td><td className="p-2 border-r font-black text-amber-600">✓</td><td className="p-2 border-r"></td><td className="p-2"></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. 정서적·사회적 측면 (Page 7) */}
      {(subTab === 'emotion' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4 text-xs">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3">
            <h4 className="font-bold border-b pb-2">■ 정서적 측면</h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span>• 이전에 비해 요즘 더 잘 잊어버리십니까? [기억력]</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">아니오 ✓</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>• 슬픔을 느끼는 적이 종종 있으십니까? [정서상태]</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">예 (사별 후 외로움)</span>
              </div>
              <div className="flex justify-between">
                <span>• 잠은 편안히 잘 주무십니까?</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">아니오 (자주 깸)</span>
              </div>
            </div>
          </div>

          <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3">
            <h4 className="font-bold border-b pb-2">■ 사회적 측면</h4>
            <div className="space-y-2">
              <p>• 출가 자녀와의 교류: <strong>④ 1달에 한두 번 정도 연락한다</strong></p>
              <p>• 이웃과의 친밀도: <strong>② 인사하는 정도이다 (교류 다소 제한)</strong></p>
              <p>• 여가 소일거리: <strong>③ 집에서 TV를 보거나 그냥 지낸다</strong></p>
              <p>• 어려움 발생 시 도움처: <strong>⑤ 사회복지관 / ⑥ 동 주민센터</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* 6. 노인 우울증 자가진단 SGDS 15문항 (Page 8) */}
      {(subTab === 'sgds' || window.matchMedia?.('print')?.matches) && (
        <div className="space-y-4 text-xs">
          <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
              <span>노인 우울증 자가진단 (SGDS 15문항)</span>
              <span className="text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                우울지수 총점: {totalSgdsScore}점
              </span>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                  <th className="p-2 border-r w-16">문항</th>
                  <th className="p-2 border-r text-left">문 제</th>
                  <th className="p-2 border-r w-20">아니다 (0점)</th>
                  <th className="p-2 border-r w-24">그런편이다 (1점)</th>
                  <th className="p-2 w-20">그렇다 (2점)</th>
                </tr>
              </thead>
              <tbody>
                {sgdsQuestions.map((q) => {
                  const val = currentSgdsAnswers[q.num] ?? q.default;
                  return (
                    <tr key={q.num} className="border-b border-stone-200 dark:border-stone-800 hover:bg-stone-50/50">
                      <td className="p-2 border-r font-semibold">{q.num}문항</td>
                      <td className="p-2 border-r text-left">{q.text}</td>
                      <td className="p-2 border-r">
                        <input
                          type="radio"
                          name={`sgds-${q.num}`}
                          checked={val === 0}
                          onChange={() => handleSgdsChange(q.num, 0)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2 border-r">
                        <input
                          type="radio"
                          name={`sgds-${q.num}`}
                          checked={val === 1}
                          onChange={() => handleSgdsChange(q.num, 1)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="radio"
                          name={`sgds-${q.num}`}
                          checked={val === 2}
                          onChange={() => handleSgdsChange(q.num, 2)}
                          disabled={readOnly}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SGDS 결과 판정 */}
          <div className="p-4 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
              <span className="text-sm">검진결과: 우울지수 {totalSgdsScore}점</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                {totalSgdsScore <= 14 ? '정상범위 (14점 이하)' : totalSgdsScore <= 23 ? '경미한 우울증 상태 (15~23점)' : '심한 우울증 상태 (24~30점)'}
              </span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
              • <strong>판정 소견:</strong> 경미한 우울증 상태로 지속적인 정서적 안부확인, 말벗 서비스 및 경로당/프로그램 참여 연계가 권장됨.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
