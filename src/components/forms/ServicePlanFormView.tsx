import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Calendar, Target, CheckSquare, Layers, ShieldCheck } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ServicePlanFormView: React.FC<FormProps> = ({
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
          서 비 스 계 획 서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 5호 - Page 12~13)
        </p>
      </div>

      {/* Target & Problem Definition */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>성명: <strong>{doc.clientName}</strong></div>
          <div>생년월일: <strong>{client?.birthDate || '1945. 12. 31'}</strong></div>
          <div>수립일자: <strong>{fields.servicePlanDate || '2019. 07. 10'}</strong></div>
          <div>사례관리자: <strong>{doc.author || '이상호 사회복지사'}</strong></div>
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 대상자의 주요 문제 및 욕구
          </label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.problemAndNeeds || '기초수급자 독거노인으로서 관절염과 우울감으로 인한 결식 우려 및 일상생활 불편, 정서적 고립감 심화.'}
            onChange={(e) => onSpecificChange('problemAndNeeds', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 해결목표 (장·단기 개입 목표)
          </label>
          <div className="space-y-2">
            <div className="p-2 bg-stone-50 dark:bg-[#251E1A] rounded border">
              <span className="font-bold text-violet-700 dark:text-violet-300">• 장기목표:</span> 지역사회 내에서 신체 잔존기능을 유지하고 결식 및 고립 없이 안정된 자립 노후생활 유지.
            </div>
            <div className="p-2 bg-stone-50 dark:bg-[#251E1A] rounded border">
              <span className="font-bold text-violet-700 dark:text-violet-300">• 단기목표:</span> 주 2회 밑반찬 공급으로 영양개선(1), 주 1회 방문상담으로 우울지수 15점 이하 유지(2), 주거 안전손잡이 설치로 낙상 예방(3).
            </div>
          </div>
        </div>
      </div>

      {/* Basic Service (16 Services) Table - Page 12 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-violet-600" />
            <span>■ 기본 서비스 제공 계획 (16종)</span>
          </span>
          <span className="text-[11px] text-stone-500">재가노인지원서비스 필수 지원</span>
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r w-28">영역</th>
              <th className="p-2 border-r">서비스 항목</th>
              <th className="p-2 border-r w-24">제공주기</th>
              <th className="p-2 border-r text-left">제공 세부내용 및 목표</th>
              <th className="p-2 w-20">담당자</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td rowSpan={2} className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">1. 일상생활</td>
              <td className="p-2 border-r text-left font-medium">■ 밑반찬 배달서비스</td>
              <td className="p-2 border-r font-bold text-violet-700 dark:text-violet-300">주 2회 (화/금)</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">3찬 1국 구성 균형 영양식 직접 전달 및 안부확인</td>
              <td className="p-2">복지사</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-medium">■ 김장김치 지원</td>
              <td className="p-2 border-r">연 1회 (11월)</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">동절기 10kg 김장김치 전달 및 결식 예방</td>
              <td className="p-2">자원봉사</td>
            </tr>

            <tr className="border-b">
              <td rowSpan={2} className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">2. 정서지원</td>
              <td className="p-2 border-r text-left font-medium">■ 정기 안부·상담</td>
              <td className="p-2 border-r font-bold text-violet-700 dark:text-violet-300">주 1회 (방문)</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">가정방문 말벗상담 및 우울감 완화, 건강체크</td>
              <td className="p-2">복지사</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-medium">■ 생신잔치 지원</td>
              <td className="p-2 border-r">연 1회</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">생신 케이크 및 선물 전달을 통한 자존감 고취</td>
              <td className="p-2">후원팀</td>
            </tr>

            <tr className="border-b">
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">3. 주거환경</td>
              <td className="p-2 border-r text-left font-medium">■ 주거개선/방역</td>
              <td className="p-2 border-r">연 1회/수시</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">화장실 안전손잡이 부착 및 하계 해충방역</td>
              <td className="p-2">봉사대</td>
            </tr>

            <tr>
              <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">4. 자원연계</td>
              <td className="p-2 border-r text-left font-medium">■ 후원물품 연계</td>
              <td className="p-2 border-r">분기별</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">쌀, 라면, 화장지 등 기초생필품 결연</td>
              <td className="p-2">복지사</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Service Frequency Rule Note */}
      <div className="p-3 bg-violet-50/60 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-lg text-xs flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-stone-700 dark:text-stone-300">
          <strong>※ 재가노인지원서비스 필수 제공 기준 준수:</strong> 연간 총 24회 이상 서비스 의무 제공 (물질/직접지원 연 12회 이상, 정서/상담지원 연 12회 이상) 편성 완료.
        </div>
      </div>
    </div>
  );
};
