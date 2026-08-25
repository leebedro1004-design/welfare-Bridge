import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

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
        <div>대상자명: <strong className="text-sm">{doc.clientName}</strong></div>
        <div>재사정일: <strong>{fields.reassessmentDate || '2019. 07. 18'}</strong></div>
        <div>담당복지사: <strong>{doc.author || '이상호'}</strong></div>
        <div>사례관리 구분: <strong>사례관리형</strong></div>
      </div>

      {/* Reassessment Reason & Category Table - Page 17 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-cyan-600" />
          <span>■ 재사정 유형 및 발생 요인</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-32 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 border-r">재사정 유형</th>
              <td className="p-2.5 flex flex-wrap gap-4 font-bold">
                <span className="text-cyan-800 dark:text-cyan-300">■ 새로운 욕구가 발생</span>
                <span className="text-stone-400">□ 미해결 욕구가 존재</span>
                <span className="text-stone-400">□ 자원환경의 급격한 변화</span>
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 border-r">재사정 요인</th>
              <td className="p-2.5 flex flex-wrap gap-4 font-bold">
                <span className="text-stone-400">□ 클라이언트에 의한 요인</span>
                <span className="text-cyan-800 dark:text-cyan-300">■ 자원과 환경에 의한 요인 (장기요양 등급탈락)</span>
                <span className="text-stone-400">□ 사례관리자에 의한 요인</span>
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
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            3. 재사정 판정 및 후속 조치
          </label>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded font-bold flex items-center justify-between text-cyan-950 dark:text-cyan-200">
            <span>■ 서비스 재계획 수립 (서비스 유지 및 가사연계 확대)</span>
            <span className="text-xs font-normal">차기 회의를 통해 서비스 계획서 수정 반영</span>
          </div>
        </div>
      </div>
    </div>
  );
};
