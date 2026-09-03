import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Eye, CheckCircle2, Sparkles, MessageSquare, Target, FileText } from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup } from './FormControls';

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
  const isAutoFilled = Boolean(fields.counselingPurpose || fields.counselingContent || fields.aiAutoFilledTimestamp);
  const scores: Record<string, number> = fields.monitoringSatisfactionScores || {
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
  };

  const satisfactionItems = [
    { key: 'q1', label: '1. 지난 6개월간 제공된 재가노인지원서비스에 전반적으로 만족하십니까?' },
    { key: 'q2', label: '2. 약속된 서비스 일정과 시간에 맞추어 정확하게 서비스가 제공되었습니까?' },
    { key: 'q3', label: '3. 서비스 제공 시 친절한 안내와 설명이 충분히 이루어졌습니까?' },
    { key: 'q4', label: '4. 제공된 서비스(식사/정서/주거 등)가 어르신의 일상생활 유지에 실질적 도움이 되었습니까?' },
    { key: 'q5', label: '5. 방문한 사회복지사 및 자원봉사자의 응대 태도와 전문성에 만족하십니까?' },
  ];

  const handleScoreChange = (qKey: string, scoreVal: number) => {
    if (readOnly) return;
    const updated = { ...scores, [qKey]: scoreVal };
    onSpecificChange('monitoringSatisfactionScores', updated);
  };

  const avgScore = (
    Object.values(scores).reduce((a, b) => a + Number(b), 0) / (Object.values(scores).length || 1)
  ).toFixed(1);

  const monitoringResult = fields.monitoringResult || '서비스 유지 (현 계획 지속 제공)';

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
            재가노인지원서비스 모니터링 및 상담기록지
          </h2>
          {isAutoFilled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI 서식 자동 완성 매핑됨</span>
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          (재가노인지원서비스 사례관리 표준 법정 서식 7호 - 상담기록지 연동)
        </p>
      </div>

      {/* Monitoring Metadata */}
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
          <span className="text-stone-500">상담·모니터링일:</span>
          <input
            type="text"
            disabled={readOnly}
            value={fields.monitoringDate || new Date().toISOString().slice(0, 10)}
            onChange={(e) => onSpecificChange('monitoringDate', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-28 font-mono"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">상담 방법/구분:</span>
          <input
            type="text"
            disabled={readOnly}
            value={fields.counselingMethod || fields.monitoringMethod || '방문상담 / 정기상담'}
            onChange={(e) => {
              onSpecificChange('counselingMethod', e.target.value);
              onSpecificChange('monitoringMethod', e.target.value);
            }}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">상담·기록자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={doc.author || '이상호 사회복지사'}
            onChange={(e) => onChange('author', e.target.value)}
            className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32 font-medium"
          />
        </div>
      </div>

      {/* 🎯 Statutory Consultation Form Specific Fields: Counseling Purpose & Content (법정 서식 상담 목적 & 상담 내용) */}
      <div className="border-2 border-amber-300/80 dark:border-amber-700/60 rounded-xl p-4 sm:p-5 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-[#251E1A] dark:via-[#1E1916] dark:to-[#1E1916] space-y-4 text-xs shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>■ 상담 기록부 (상담 목적 및 상담 내용)</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-normal">
                  법정 필수 서식 항목
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                AI 상담 녹취 분석 결과에서 원클릭으로 자동 추출 및 매핑되는 법정 상담 기록 필드입니다.
              </p>
            </div>
          </div>
          {fields.aiAutoFilledTimestamp && (
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded">
              자동완성 시각: {fields.aiAutoFilledTimestamp}
            </span>
          )}
        </div>

        {/* 1. 상담 목적 (Counseling Purpose) */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 mb-1.5">
            <Target className="w-4 h-4 text-amber-600" />
            <span>1. 상담 목적 (Consultation Purpose)</span>
            <span className="text-[11px] font-normal text-stone-500">
              - 내담 어르신의 주 호소 및 개입 욕구 기반 설정 목적
            </span>
          </label>
          <input
            type="text"
            id="field-counseling-purpose"
            disabled={readOnly}
            placeholder="상담 목적을 입력하거나 AI 서식 자동 완성을 실행하세요. (예: 어르신의 일상생활 자립 유지 및 결식 예방을 위한 재가복지서비스 연계)"
            value={fields.counselingPurpose || ''}
            onChange={(e) => onSpecificChange('counselingPurpose', e.target.value)}
            className="w-full p-2.5 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-[#1E1916] text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* 2. 상담 내용 (Counseling Content) */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 mb-1.5">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>2. 상담 내용 (Consultation Content & Observation Notes)</span>
            <span className="text-[11px] font-normal text-stone-500">
              - 개요, 건강상태, 정서/환경, 욕구, 종합의견 등 표준 서술
            </span>
          </label>
          <textarea
            id="field-counseling-content"
            rows={7}
            disabled={readOnly}
            placeholder="상담 면담 상세 내용을 입력하거나 AI 서식 자동 완성으로 채워집니다..."
            value={fields.counselingContent || ''}
            onChange={(e) => onSpecificChange('counselingContent', e.target.value)}
            className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-[#1E1916] text-xs leading-relaxed text-stone-900 dark:text-stone-100 font-sans focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium whitespace-pre-wrap"
          />
        </div>

        {/* 3. 조치 및 향후 계획 (Next Plan) */}
        <div>
          <label className="font-bold text-xs text-stone-800 dark:text-stone-200 block mb-1">
            3. 상담 조치사항 및 향후 관리 계획
          </label>
          <input
            type="text"
            id="field-counseling-next-plan"
            disabled={readOnly}
            placeholder="상담 후속 조치 계획 (예: 밑반찬 주 2회 배달 지속, 주 1회 안부전화 유지)"
            value={fields.counselingNextPlan || ''}
            onChange={(e) => onSpecificChange('counselingNextPlan', e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-[#251E1A] text-xs"
          />
        </div>
      </div>

      {/* 5-Item Satisfaction Survey Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>■ 이용자 만족도 점검 (5문항 5점 척도 - 클릭하여 선택/수정)</span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-800">
            평균 만족도: {avgScore} / 5.0
          </span>
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r text-left">평가 설문 항목</th>
              <th className="p-2 border-r w-20">매우만족(5점)</th>
              <th className="p-2 border-r w-20">만족(4점)</th>
              <th className="p-2 border-r w-20">보통(3점)</th>
              <th className="p-2 border-r w-20">불만족(2점)</th>
              <th className="p-2 w-20">매우불만(1점)</th>
            </tr>
          </thead>
          <tbody>
            {satisfactionItems.map((item) => {
              const currentScore = Number(scores[item.key] ?? 5);
              return (
                <tr key={item.key} className="border-b border-stone-200 dark:border-stone-800">
                  <td className="p-2.5 text-left border-r font-medium">{item.label}</td>
                  {[5, 4, 3, 2, 1].map((point) => (
                    <td key={point} className="p-1.5 border-r last:border-r-0">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleScoreChange(item.key, point)}
                        className={`w-full py-1 rounded font-bold transition-colors cursor-pointer ${
                          currentScore === point
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {currentScore === point ? '■' : '□'}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
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
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-2">
            3. 종합 모니터링 조치 결과 (체크/해제 선택)
          </label>
          <RadioToggleGroup
            options={[
              '서비스 유지 (현 계획 지속 제공)',
              '서비스 변경 (재사정 필요)',
              '종결 검토',
              '긴급위기 개입',
            ]}
            value={monitoringResult}
            onChange={(v) => onSpecificChange('monitoringResult', v)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};
