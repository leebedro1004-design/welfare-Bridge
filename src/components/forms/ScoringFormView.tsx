import React from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { resolveDocumentAuthor } from '../../utils/userSettingsHelper';
import { Calculator, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { CheckboxToggle } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ScoringFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  // Criteria scores with safe default values
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

  const verdict = totalScore >= 25 ? '사례관리형 (집중 개입)' : totalScore >= 18 ? '일반관리형 (정기 모니터링)' : '일반지원 (단순 서비스)';

  const setScore = (fieldKey: string, scoreVal: number) => {
    if (readOnly) return;
    onSpecificChange(fieldKey, scoreVal);
  };

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
        <div className="flex items-center gap-1">
          <span className="text-stone-500">성명:</span>
          <input
            type="text"
            disabled={readOnly}
            value={doc.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] font-bold text-xs w-28"
          />
        </div>
        <div>성별/연령: <strong>{client?.gender || '남'} / {client?.age ? `${client.age}세` : '75세'}</strong></div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">평가일자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={fields.scoringDate || '2019. 06. 30'}
            onChange={(e) => onSpecificChange('scoringDate', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-28"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">평가자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={resolveDocumentAuthor(doc.author, userSettings)}
            onChange={(e) => onChange('author', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32 font-medium"
          />
        </div>
      </div>

      {/* Scoring Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>선정 평가 영역별 배점 산정표 (각 옵션을 클릭하여 점수 체크/변경)</span>
          </span>
          <span className="text-amber-800 dark:text-amber-300 font-black text-sm bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded border border-amber-300 dark:border-amber-700">
            취득 총점: {totalScore}점 / 40점 ➔ [{verdict}]
          </span>
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r w-24">대분류</th>
              <th className="p-2 border-r w-32">평가 항목</th>
              <th className="p-2 border-r text-left">세부 기준 및 배점 (클릭하여 선택/체크)</th>
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
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="기초생활수급자 (5점)" checked={scoreEcoSupport === 5} onChange={() => setScore('scoreEconomicSupport', 5)} disabled={readOnly} />
                  <CheckboxToggle label="차상위계층 (4점)" checked={scoreEcoSupport === 4} onChange={() => setScore('scoreEconomicSupport', 4)} disabled={readOnly} />
                  <CheckboxToggle label="의료급여 1·2종 (3점)" checked={scoreEcoSupport === 3} onChange={() => setScore('scoreEconomicSupport', 3)} disabled={readOnly} />
                  <CheckboxToggle label="일반 저소득 (1점)" checked={scoreEcoSupport === 1} onChange={() => setScore('scoreEconomicSupport', 1)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreEcoSupport}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">2) 주택소유 형태</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="월세 (4점)" checked={scoreHousing === 4} onChange={() => setScore('scoreHousingType', 4)} disabled={readOnly} />
                  <CheckboxToggle label="전세 (3점)" checked={scoreHousing === 3} onChange={() => setScore('scoreHousingType', 3)} disabled={readOnly} />
                  <CheckboxToggle label="임대아파트 (2점)" checked={scoreHousing === 2} onChange={() => setScore('scoreHousingType', 2)} disabled={readOnly} />
                  <CheckboxToggle label="자가 (1점)" checked={scoreHousing === 1} onChange={() => setScore('scoreHousingType', 1)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreHousing}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">3) 월세 추가 가산</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="월세 20만원 미만 납부 가산 (+1점)" checked={scoreRentBonus === 1} onChange={() => setScore('scoreRentBonus', scoreRentBonus === 1 ? 0 : 1)} disabled={readOnly} />
                  <CheckboxToggle label="해당 없음 (0점)" checked={scoreRentBonus === 0} onChange={() => setScore('scoreRentBonus', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">+{scoreRentBonus}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">4) 월소득 수준</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="40만원 이상 80만원 미만 (5점)" checked={scoreIncome === 5} onChange={() => setScore('scoreIncome', 5)} disabled={readOnly} />
                  <CheckboxToggle label="40만원 미만 (6점)" checked={scoreIncome === 6} onChange={() => setScore('scoreIncome', 6)} disabled={readOnly} />
                  <CheckboxToggle label="80만원 이상 120만원 미만 (3점)" checked={scoreIncome === 3} onChange={() => setScore('scoreIncome', 3)} disabled={readOnly} />
                  <CheckboxToggle label="120만원 이상 (1점)" checked={scoreIncome === 1} onChange={() => setScore('scoreIncome', 1)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreIncome}점</td>
            </tr>

            {/* 2. 건강기능 */}
            <tr className="border-b">
              <td rowSpan={5} className="p-2.5 bg-stone-50 dark:bg-[#251E1A] border-r font-bold text-stone-700 dark:text-stone-300">
                2. 건강기능<br />(배점 24점)
              </td>
              <td className="p-2 border-r text-left font-semibold">1) 신체건강상태</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="만성질환 2~3개 보유 (2점)" checked={scorePhysicalHealth === 2} onChange={() => setScore('scorePhysicalHealth', 2)} disabled={readOnly} />
                  <CheckboxToggle label="만성질환 4개 이상 (4점)" checked={scorePhysicalHealth === 4} onChange={() => setScore('scorePhysicalHealth', 4)} disabled={readOnly} />
                  <CheckboxToggle label="만성질환 1개 (1점)" checked={scorePhysicalHealth === 1} onChange={() => setScore('scorePhysicalHealth', 1)} disabled={readOnly} />
                  <CheckboxToggle label="건강함 (0점)" checked={scorePhysicalHealth === 0} onChange={() => setScore('scorePhysicalHealth', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scorePhysicalHealth}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">2) 정서/정신건강</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="경미한 우울/불안 (2점)" checked={scoreEmotionalHealth === 2} onChange={() => setScore('scoreEmotionalHealth', 2)} disabled={readOnly} />
                  <CheckboxToggle label="중증 우울/자살위험/알코올 (4점)" checked={scoreEmotionalHealth === 4} onChange={() => setScore('scoreEmotionalHealth', 4)} disabled={readOnly} />
                  <CheckboxToggle label="정서 상태 양호 (0점)" checked={scoreEmotionalHealth === 0} onChange={() => setScore('scoreEmotionalHealth', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreEmotionalHealth}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">3) 장애 유무/등급</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="지체 3급/중증 장애 (4점)" checked={scoreDisability === 4} onChange={() => setScore('scoreDisability', 4)} disabled={readOnly} />
                  <CheckboxToggle label="1~2급 최중증 (6점)" checked={scoreDisability === 6} onChange={() => setScore('scoreDisability', 6)} disabled={readOnly} />
                  <CheckboxToggle label="경증 4~6급 (2점)" checked={scoreDisability === 2} onChange={() => setScore('scoreDisability', 2)} disabled={readOnly} />
                  <CheckboxToggle label="장애 없음 (0점)" checked={scoreDisability === 0} onChange={() => setScore('scoreDisability', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreDisability}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">4) 일상동작(ADL)</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="보행/계단 부분 도움필요 (2점)" checked={scoreAdl === 2} onChange={() => setScore('scoreAdl', 2)} disabled={readOnly} />
                  <CheckboxToggle label="전적 도움 필요/와상 (6점)" checked={scoreAdl === 6} onChange={() => setScore('scoreAdl', 6)} disabled={readOnly} />
                  <CheckboxToggle label="상당 부분 도움 (4점)" checked={scoreAdl === 4} onChange={() => setScore('scoreAdl', 4)} disabled={readOnly} />
                  <CheckboxToggle label="완전자립 (0점)" checked={scoreAdl === 0} onChange={() => setScore('scoreAdl', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreAdl}점</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 border-r text-left font-semibold">5) 장기요양등급</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="등급외/미신청 (0점, 재가지원)" checked={scoreCareGrade === 0} onChange={() => setScore('scoreCareGrade', 0)} disabled={readOnly} />
                  <CheckboxToggle label="인지지원등급 (2점)" checked={scoreCareGrade === 2} onChange={() => setScore('scoreCareGrade', 2)} disabled={readOnly} />
                  <CheckboxToggle label="1~5등급 (0점, 공단연계)" checked={scoreCareGrade === 99} onChange={() => setScore('scoreCareGrade', 99)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreCareGrade === 99 ? '0점(연계)' : `${scoreCareGrade}점`}</td>
            </tr>

            {/* 3. 사회복지사 종합 재량 점수 */}
            <tr className="border-b">
              <td className="p-2.5 bg-stone-50 dark:bg-[#251E1A] border-r font-bold text-stone-700 dark:text-stone-300">
                3. 종합판단
              </td>
              <td className="p-2 border-r text-left font-semibold">사례관리자 종합 소견</td>
              <td className="p-2 border-r text-left">
                <div className="flex flex-wrap gap-1.5">
                  <CheckboxToggle label="위기도 매우 높음 (6점)" checked={scoreDiscretionary === 6} onChange={() => setScore('scoreDiscretionary', 6)} disabled={readOnly} />
                  <CheckboxToggle label="위기도 보통 (4점)" checked={scoreDiscretionary === 4} onChange={() => setScore('scoreDiscretionary', 4)} disabled={readOnly} />
                  <CheckboxToggle label="단순지원 (2점)" checked={scoreDiscretionary === 2} onChange={() => setScore('scoreDiscretionary', 2)} disabled={readOnly} />
                  <CheckboxToggle label="미해당 (0점)" checked={scoreDiscretionary === 0} onChange={() => setScore('scoreDiscretionary', 0)} disabled={readOnly} />
                </div>
              </td>
              <td className="p-2 font-black text-amber-700 dark:text-amber-400">{scoreDiscretionary}점</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Evaluation Verdict Box */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3 text-xs">
        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center justify-between border-b pb-2">
          <span>최종 판정 및 사례관리 유형 구분</span>
          <span className="text-amber-700 dark:text-amber-300 font-extrabold text-sm">
            취득 배점: {totalScore}점 ➔ {verdict}
          </span>
        </h4>
        <div>
          <label className="font-semibold block mb-1">사례관리자 종합 판정 소견:</label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.scoringOpinion || '선정기준표 총점 31점으로 25점 이상인 [사례관리형]으로 최종 선정함. 기초수급 독거노인으로 만성질환 및 지체장애, 높은 우울지수로 인해 집중적인 사례관리와 민관 자원 연계가 시급함.'}
            onChange={(e) => onSpecificChange('scoringOpinion', e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
