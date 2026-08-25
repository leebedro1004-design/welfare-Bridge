import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Calculator, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ScoringFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  // Criteria scores from page 9
  const scoreEcoSupport = Number(fields.scoreEconomicSupport ?? 5);
  const scoreHousing = Number(fields.scoreHousingType ?? 4);
  const scoreRentBonus = Number(fields.scoreRentBonus ?? 1);
  const scoreIncome = Number(fields.scoreIncome ?? 5);
  const scorePhysicalHealth = Number(fields.scorePhysicalHealth ?? 2);
  const scoreEmotionalHealth = Number(fields.scoreEmotionalHealth ?? 2);
  const scoreDisability = Number(fields.scoreDisability ?? 4);
  const scoreAdl = Number(fields.scoreAdl ?? 2);
  const scoreCareGrade = Number(fields.scoreCareGrade ?? 0);
  const scoreDiscretionary = Number(fields.scoreDiscretionary ?? 6);

  const totalScore =
    scoreEcoSupport +
    scoreHousing +
    scoreRentBonus +
    scoreIncome +
    scorePhysicalHealth +
    scoreEmotionalHealth +
    scoreDisability +
    scoreAdl +
    scoreCareGrade +
    scoreDiscretionary;

  const verdict = totalScore >= 25 ? '사례관리형' : totalScore >= 18 ? '일반관리형' : '일반지원';

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          대 상 자 선 정 기 준 표
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 3호 - Page 9)
        </p>
      </div>

      {/* Basic Client Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs p-3 bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 rounded-lg">
        <div>성명: <strong className="text-sm">{doc.clientName}</strong></div>
        <div>성별/연령: <strong>{client?.gender || '남'} / {client?.age ? `${client.age}세` : '75세'}</strong></div>
        <div>평가일자: <strong>{fields.scoringDate || '2019. 06. 30'}</strong></div>
        <div>평가자: <strong>{doc.author || '이상호 사회복지사'}</strong></div>
      </div>

      {/* Scoring Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>선정 평가 영역별 배점 산정표</span>
          </span>
          <span className="text-amber-800 dark:text-amber-300 font-black text-sm">
            총점: {totalScore}점 ({verdict})
          </span>
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r w-24">대분류</th>
              <th className="p-2 border-r w-36">평가 항목</th>
              <th className="p-2 border-r text-left">세부 기준 및 배점 배정</th>
              <th className="p-2 w-20">취득점수</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. 경제기능 */}
            <tr className="border-b">
              <td rowSpan={4} className="p-2.5 bg-stone-50 dark:bg-[#251E1A] border-r font-bold text-stone-700 dark:text-stone-300">
                1. 경제기능<br />(배점 16점)
              </td>
              <td className="p-2 border-r text-left font-semibold">1) 수급형태</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 기초생활수급자(5점) □ 차상위(4점) □ 의료급여(3점) □ 일반(1점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreEcoSupport}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">2) 주택소유 형태</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 월세(4점) □ 전세(3점) □ 임대아파트(2점) □ 자가(1점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreHousing}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">3) 월세 추가 가산</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 월세 20만원 미만 납부 가산(+1점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">+{scoreRentBonus}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">4) 월소득 수준</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 40만원 이상 80만원 미만(5점) □ 40만원 미만(6점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreIncome}점</td>
            </tr>

            {/* 2. 건강기능 */}
            <tr className="border-b">
              <td rowSpan={5} className="p-2.5 bg-stone-50 dark:bg-[#251E1A] border-r font-bold text-stone-700 dark:text-stone-300">
                2. 건강기능<br />(배점 24점)
              </td>
              <td className="p-2 border-r text-left font-semibold">1) 신체건강상태</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 만성질환 2~3개 보유(2점) □ 4개 이상(4점) □ 건강(0점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scorePhysicalHealth}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">2) 정서/정신건강</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 경미한 우울/불안(2점) □ 중증 우울/알코올(4점) □ 양호(0점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreEmotionalHealth}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">3) 장애 유무/등급</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 중증/지체 3급(4점) □ 1~2급(6점) □ 경증(2점) □ 무(0점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreDisability}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">4) 일상동작(ADL)</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 보행/계단 부분 도움필요(2점) □ 전적도움(6점) □ 자립(0점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreAdl}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">5) 장기요양등급</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 등급외/미신청(0점) □ 인지지원(2점) □ 1~5등급(0점, 제도연계)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreCareGrade}점</td>
            </tr>

            {/* 3. 사회복지사 재량점수 */}
            <tr className="border-b">
              <td className="p-2.5 bg-stone-50 dark:bg-[#251E1A] border-r font-bold text-stone-700 dark:text-stone-300">
                3. 재량점수<br />(최대 10점)
              </td>
              <td className="p-2 border-r text-left font-semibold">사회복지사 평가</td>
              <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                ■ 독거로 인한 결식 우려 및 부양망 부재로 긴급 지원 필요 인정(+6점)
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">+{scoreDiscretionary}점</td>
            </tr>

            {/* Total Row */}
            <tr className="bg-amber-100/70 dark:bg-amber-950/60 font-bold">
              <td colSpan={3} className="p-2.5 text-right pr-6 border-r text-sm">
                종합 산출 총점:
              </td>
              <td className="p-2.5 text-base font-black text-amber-800 dark:text-amber-300">
                {totalScore}점
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Result Card */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3 text-xs">
        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>최종 선정 판정 결과</span>
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 rounded-full font-black text-xs">
            {verdict} 선정 (적격)
          </span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-stone-50 dark:bg-[#251E1A] rounded border">
          <div>• <strong>25점 이상:</strong> 사례관리형 (다차원 복합 지원)</div>
          <div>• <strong>18~24점:</strong> 일반관리형 (정기 모니터링)</div>
          <div>• <strong>18점 미만:</strong> 일반지원 (자원 연계)</div>
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-stone-700 dark:text-stone-300">사회복지사 종합 판정 의견</label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.scoreWorkerComment || '기초수급자로서 경제적 취약성이 높고 독거 및 관절염으로 인한 결식·고립 위험이 큼. 배점 총 29점으로 사례관리형 대상자로 최종 선정하여 맞춤형 서비스 개입을 추진함.'}
            onChange={(e) => onSpecificChange('scoreWorkerComment', e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
