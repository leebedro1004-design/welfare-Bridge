import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ReassessmentFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  const reassessmentType = fields.reassessmentType || '새로운 욕구가 발생';
  const reassessmentFactor = fields.reassessmentFactor || '자원과 환경에 의한 요인 (장기요양 등급탈락)';
  const reassessmentDecision = fields.reassessmentDecision || '서비스 계획 변경 후 지속 제공 (재계획 수립)';

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          재 사 정 기 록 지
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 8호 - Page 17)
        </p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs p-3 bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 rounded-lg">
        <div className="flex items-center gap-1">
          <span className="text-stone-500">대상자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={doc.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] font-bold text-xs w-28"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">재사정일:</span>
          <input
            type="text"
            disabled={readOnly}
            value={fields.reassessmentDate || '2019. 07. 18'}
            onChange={(e) => onSpecificChange('reassessmentDate', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-28"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">담당자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={doc.author || '이상호 사회복지사'}
            onChange={(e) => onChange('author', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32 font-medium"
          />
        </div>
        <div>사례관리 구분: <strong>사례관리형</strong></div>
      </div>

      {/* Reassessment Reason & Category Table - Page 17 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-cyan-600" />
          <span>■ 재사정 유형 및 발생 요인 (체크/해제 선택)</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-32 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 border-r">재사정 유형</th>
              <td className="p-2.5">
                <RadioToggleGroup
                  options={[
                    '새로운 욕구가 발생',
                    '미해결 욕구가 존재',
                    '자원환경의 급격한 변화',
                    '기타 사유',
                  ]}
                  value={reassessmentType}
                  onChange={(v) => onSpecificChange('reassessmentType', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 border-r">재사정 요인</th>
              <td className="p-2.5">
                <RadioToggleGroup
                  options={[
                    '클라이언트에 의한 요인',
                    '자원과 환경에 의한 요인 (장기요양 등급탈락)',
                    '사례관리자에 의한 요인',
                    '기관 내부 사정',
                  ]}
                  value={reassessmentFactor}
                  onChange={(v) => onSpecificChange('reassessmentFactor', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Changes & Worker Assessment */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 클라이언트의 변화 및 신규 욕구
          </label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.reassessmentClientNeedChange || '국민건강보험공단 장기요양 재신청 결과 등급외(탈락) 판정을 받음에 따라, 공단 방문요양 서비스를 이용할 수 없게 됨. 이에 따라 본 센터를 통한 가사지원 및 병원동행, 주 2회 식사지원 서비스 지속 제공에 대한 절실한 욕구가 표출됨.'}
            onChange={(e) => onSpecificChange('reassessmentClientNeedChange', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 사회복지사 종합 평가 및 개입 방향
          </label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.reassessmentWorkerOpinion || '장기요양 등급탈락으로 인한 돌봄 공백이 우려되므로, 본 센터의 재가노인지원서비스를 유지하면서 지역사회 자원봉사센터 및 노인맞춤돌봄서비스와 연계하여 주 1회 가사지원과 병원동행을 신규 보충 편성함.'}
            onChange={(e) => onSpecificChange('reassessmentWorkerOpinion', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-2">
            3. 재사정 판정 및 후속 조치
          </label>
          <RadioToggleGroup
            options={[
              '서비스 계획 변경 후 지속 제공 (재계획 수립)',
              '현 서비스 계획 유지',
              '타 기관 이관 검토',
              '종결 처리',
            ]}
            value={reassessmentDecision}
            onChange={(v) => onSpecificChange('reassessmentDecision', v)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};
