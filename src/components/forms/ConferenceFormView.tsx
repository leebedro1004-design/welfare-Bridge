import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Users, FileText, CheckCircle, Calendar, Clock } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ConferenceFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          사 례 회 의 록
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 4호 - Page 10~11, 18~19, 25)
        </p>
      </div>

      {/* Conference Basic Metadata */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>회의 개요</span>
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold">회의구분:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300">
              ■ 선정회의 □ 제공회의 □ 재사정회의 □ 종결회의
            </span>
          </div>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">회의일시</th>
              <td className="p-2 border-r">{fields.conferenceDate || '2019. 07. 05 (금) 10:00~11:00'}</td>
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">조사자</th>
              <td className="p-2">{fields.conferenceInvestigator || '이상호 사회복지사'}</td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">참석자</th>
              <td colSpan={3} className="p-2">
                {fields.conferenceAttendees || '장성태 센터장, 이상호 사회복지사, 정명훈 팀장, 박서연 간호조무사 (총 4명)'}
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">회의안건</th>
              <td colSpan={3} className="p-2 font-bold text-indigo-900 dark:text-indigo-200">
                {fields.conferenceTopic || `${doc.clientName} 어르신 신규 재가노인지원서비스 선정 심의 및 맞춤형 서비스 개입 방향 수립`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conference Discussion Content */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 회의내용 (주요 논의 사항 및 의견 교환)
          </label>
          <textarea
            rows={4}
            disabled={readOnly}
            value={fields.conferenceDiscussion || '1. 대상자의 기초수급 취약성과 만성 관절염으로 인한 결식 위험성에 대해 조사자의 보고 청취.\n2. 장기요양 등급탈락 상태이므로 제도적 돌봄 공백이 크며, 주 2회 밑반찬 배달과 주 1회 정서 말벗 방문이 절실하다는 의견 일치.\n3. 주거환경 점검 결과 2층 다세대주택으로 계단 낙상 위험이 있어 안전손잡이 설치 및 방충망 보수 자원봉사 연계 논의.'}
            onChange={(e) => onSpecificChange('conferenceDiscussion', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 회의결정 (최종 심의 결과)
          </label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.conferenceDecision || '• 만장일치로 "사례관리형 대상자"로 선정 가결함.\n• 2019년 7월 10일부터 주 2회 식사지원(밑반찬) 및 주 1회 방문상담 개시.\n• 지역 자원봉사대와 협력하여 낙상방지 및 주거환경 개선 즉각 지원 결정.'}
            onChange={(e) => onSpecificChange('conferenceDecision', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>
      </div>

      {/* 8 Major Service Decision Table (Page 11) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700">
          ■ 8대 영역별 서비스 제공 결정 내용
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r w-28">서비스 대분류</th>
              <th className="p-2 border-r">세부 서비스 명</th>
              <th className="p-2 border-r w-24">제공주기/횟수</th>
              <th className="p-2 w-28">제공 여부</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">1. 일상생활지원</td>
              <td className="p-2 border-r text-left">밑반찬 배달서비스, 김장김치 지원</td>
              <td className="p-2 border-r">주 2회 / 연 1회</td>
              <td className="p-2 font-bold text-emerald-600">■ 제공</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">2. 주거환경개선</td>
              <td className="p-2 border-r text-left">방역·소독, 안전손잡이 설치, 방충망 보수</td>
              <td className="p-2 border-r">수시 / 연 1회</td>
              <td className="p-2 font-bold text-emerald-600">■ 제공</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">3. 정서적지원</td>
              <td className="p-2 border-r text-left">정기 안부확인, 말벗상담, 생신잔치</td>
              <td className="p-2 border-r">주 1회 / 연 1회</td>
              <td className="p-2 font-bold text-emerald-600">■ 제공</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">4. 보건의료지원</td>
              <td className="p-2 border-r text-left">보건소 만성질환 관리 연계 및 병원동행</td>
              <td className="p-2 border-r">필요시</td>
              <td className="p-2 font-bold text-emerald-600">■ 연계</td>
            </tr>
            <tr>
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">5. 자원연계</td>
              <td className="p-2 border-r text-left">종교단체 쌀·생필품 후원물품 연계</td>
              <td className="p-2 border-r">분기별</td>
              <td className="p-2 font-bold text-emerald-600">■ 제공</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Signatures */}
      <div className="pt-4 border-t border-stone-300 dark:border-stone-700 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
        <div>
          서비스 개시 예정일: <span className="text-stone-900 dark:text-stone-100">{fields.conferenceStartDate || '2019. 07. 10'}</span>
        </div>
        <div className="flex items-center gap-6">
          <span>작성자: 이상호 (인)</span>
          <span>센터장: 장성태 (인)</span>
        </div>
      </div>
    </div>
  );
};
