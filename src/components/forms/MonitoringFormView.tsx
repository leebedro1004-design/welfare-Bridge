import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Eye, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const MonitoringFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const scores = fields.monitoringSatisfactionScores || {
    halfYearSatisfaction: '매우 만족',
    scheduleAdherence: '매우 만족',
    serviceGuideAccuracy: '매우 만족',
    lifeHelpEffectiveness: '매우 만족',
    workerSatisfaction: '매우 만족',
  };

  const satisfactionItems = [
    { key: 'halfYearSatisfaction', label: '1. 지난 6개월간 제공된 재가노인지원서비스에 전반적으로 만족하십니까?' },
    { key: 'scheduleAdherence', label: '2. 약속된 서비스 일정과 시간에 맞추어 정확하게 서비스가 제공되었습니까?' },
    { key: 'serviceGuideAccuracy', label: '3. 서비스 제공 시 친절한 안내와 설명이 충분히 이루어졌습니까?' },
    { key: 'lifeHelpEffectiveness', label: '4. 제공된 서비스(식사/정서/주거 등)가 어르신의 일상생활 유지에 실질적 도움이 되었습니까?' },
    { key: 'workerSatisfaction', label: '5. 방문한 사회복지사 및 자원봉사자의 응대 태도와 전문성에 만족하십니까?' },
  ];

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          재가노인지원서비스 모니터링 기록지
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 7호 - Page 16)
        </p>
      </div>

      {/* Monitoring Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs p-3 bg-stone-50 dark:bg-[#251E1A] border border-stone-200 dark:border-stone-800 rounded-lg">
        <div>대상자명: <strong className="text-sm">{doc.clientName}</strong></div>
        <div>모니터링 일시: <strong>{fields.monitoringDate || '2019. 07. 15'}</strong></div>
        <div>구분/방법: <strong>{fields.monitoringType || '정기'} / {fields.monitoringMethod || '방문상담'}</strong></div>
        <div>담당자: <strong>{doc.author || '이상호 사회복지사'}</strong></div>
      </div>

      {/* 5-Item Satisfaction Survey Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>■ 이용자 만족도 점검 (5문항 5점 척도)</span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            평균 만족도: 5.0 / 5.0 (매우 만족)
          </span>
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r text-left">평가 설문 항목</th>
              <th className="p-2 border-r w-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">매우만족 (5점)</th>
              <th className="p-2 border-r w-16">만족 (4점)</th>
              <th className="p-2 border-r w-16">보통 (3점)</th>
              <th className="p-2 border-r w-16">불만족 (2점)</th>
              <th className="p-2 w-16">매우불만 (1점)</th>
            </tr>
          </thead>
          <tbody>
            {satisfactionItems.map((item, idx) => (
              <tr key={item.key} className="border-b border-stone-200 dark:border-stone-800">
                <td className="p-2.5 text-left border-r font-medium">{item.label}</td>
                <td className="p-2 border-r font-black text-emerald-600">■</td>
                <td className="p-2 border-r text-stone-400">□</td>
                <td className="p-2 border-r text-stone-400">□</td>
                <td className="p-2 border-r text-stone-400">□</td>
                <td className="p-2 text-stone-400">□</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monitoring Findings & Changes */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 욕구 변화 및 추가 희망사항
          </label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.monitoringNeedChanges || '현재 제공 중인 주 2회 밑반찬에 대해 매우 만족해하시며, 여름철 폭염에 대비하여 낡은 선풍기 교체 및 찢어진 방충망 보수를 추가 희망하심.'}
            onChange={(e) => onSpecificChange('monitoringNeedChanges', e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 대상자의 상태 및 환경 변화 점검
          </label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.monitoringEnvironmentChanges || '규칙적인 식사로 기력이 다소 회복되었으며 복지사 방문 시 표정이 매우 밝아짐. 무릎 관절 통증은 여전하므로 계단 보행 시 주의 지도함.'}
            onChange={(e) => onSpecificChange('monitoringEnvironmentChanges', e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            3. 종합 모니터링 조치 결과
          </label>
          <div className="p-3 bg-stone-50 dark:bg-[#251E1A] rounded border flex flex-wrap items-center gap-6 font-bold">
            <span className="text-emerald-700 dark:text-emerald-400">■ 서비스 유지 (현 계획 지속 제공)</span>
            <span className="text-stone-400">□ 서비스 변경 (재사정 필요)</span>
            <span className="text-stone-400">□ 종결 검토</span>
          </div>
        </div>
      </div>
    </div>
  );
};
