import React, { useState } from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { getEffectiveAgencyName } from '../../utils/userSettingsHelper';
import { Award, FileText, CheckCircle2, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const TerminationFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const [tab, setTab] = useState<'notice' | 'report' | 'evaluation'>('report');

  const terminationReasonType = fields.terminationReasonType || '타지역 전출/거주지 이전';

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          종결보고서 및 사례평가서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 9호 - Page 20~22)
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setTab('notice')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'notice'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          1. 서비스 종결 안내서 (Page 20)
        </button>
        <button
          type="button"
          onClick={() => setTab('report')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'report'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          2. 사례관리 종결보고서 (Page 21)
        </button>
        <button
          type="button"
          onClick={() => setTab('evaluation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'evaluation'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          3. 사례평가서 (Page 22)
        </button>
      </div>

      {/* 1. 서비스 종결 안내서 (Page 20) */}
      {(tab === 'notice' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300 border-b pb-2">
            ■ 서비스 종결 안내 통보서
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2.5 bg-stone-50 dark:bg-[#251E1A] rounded border">
            <div>대상자: <strong>{doc.clientName}</strong></div>
            <div>생년월일: <strong>{client?.birthDate || '1945. 12. 31'}</strong></div>
            <div className="flex items-center gap-1">
              <span className="text-stone-500">종결일자:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.terminationNoticeDate || '2019. 07. 20'}
                onChange={(e) => onSpecificChange('terminationNoticeDate', e.target.value)}
                className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-28"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-stone-500">발신기관:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.issuingOrg?.includes('굿실버') ? fields.issuingOrg.replace('굿실버노인복지센터', getEffectiveAgencyName(userSettings)) : (fields.issuingOrg || getEffectiveAgencyName(userSettings))}
                onChange={(e) => onSpecificChange('issuingOrg', e.target.value)}
                className="p-1 border rounded bg-white dark:bg-[#1E1916] text-xs w-32"
              />
            </div>
          </div>
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded space-y-2 leading-relaxed">
            <p className="font-semibold text-rose-950 dark:text-rose-200">
              어르신께 제공되던 재가노인지원서비스의 종결 사유 및 후속 조치를 다음과 같이 안내해 드립니다.
            </p>
            <div className="space-y-1">
              <label className="font-bold block">종결 사유 구분 (선택/수정):</label>
              <RadioToggleGroup
                options={[
                  '타지역 전출/거주지 이전',
                  '사망',
                  '시설 입소',
                  '이용 거부/스스로 종결 희망',
                  '장기요양 등급 취득에 따른 이관',
                  '상태 호전(목표 달성)',
                ]}
                value={terminationReasonType}
                onChange={(v) => onSpecificChange('terminationReasonType', v)}
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="font-bold block mb-1">상세 종결 사유 및 후속 조치 내용:</label>
              <textarea
                rows={3}
                disabled={readOnly}
                value={fields.terminationNoticeDetail || '• 종결 사유: 타 관할 지역(대구 달서구 상인동 → 성당동)으로의 거주지 이전에 따른 기관 이관 및 연계\n• 후속 조치: 이관 대상 기관인 성당노인복지센터로 사례관리 기록 및 서비스 내역 일체를 인계하여 돌봄 공백이 발생하지 않도록 조치함.'}
                onChange={(e) => onSpecificChange('terminationNoticeDetail', e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-[#1E1916] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. 사례관리 종결보고서 (Page 21) */}
      {(tab === 'report' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2 flex items-center justify-between">
            <span>■ 사례관리 종결보고서 (초기사정 대비 변화 평가)</span>
            <span className="text-rose-700 dark:text-rose-300 font-bold">유형: {terminationReasonType}</span>
          </h4>
          <div className="space-y-3">
            <div>
              <label className="font-semibold block mb-1">1. 개입 목표 달성도 평가:</label>
              <textarea
                rows={2}
                disabled={readOnly}
                value={fields.goalAchievementEvaluation || '주 2회 밑반찬 제공으로 결식 위험을 해소하고 영양 상태가 개선되었으며, 주 1회 정기 방문상담을 통해 우울 척도가 18점에서 12점으로 감소하여 목표를 85% 이상 달성함.'}
                onChange={(e) => onSpecificChange('goalAchievementEvaluation', e.target.value)}
                className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">2. 종결 후 사후관리(사후지도) 계획:</label>
              <textarea
                rows={2}
                disabled={readOnly}
                value={fields.followUpPlan || '이관 기관과 유선 연락망을 유지하며, 종결 후 1개월 및 3개월 시점에 유선 안부확인을 통해 새로운 환경 적응 및 서비스 연계 지속 여부를 모니터링함.'}
                onChange={(e) => onSpecificChange('followUpPlan', e.target.value)}
                className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. 사례평가서 (Page 22) */}
      {(tab === 'evaluation' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2">
            ■ 사례평가서 (종합 성과 및 제언)
          </h4>
          <div>
            <label className="font-semibold block mb-1">사회복지사 총괄 제언:</label>
            <textarea
              rows={3}
              disabled={readOnly}
              value={fields.overallWorkerReview || '지역사회 내 다학제적 자원연계(주민센터, 자원봉사센터, 보건소)가 원활히 작동하여 단기간 내에 대상자의 복합 위기를 효과적으로 경감시켰음.'}
              onChange={(e) => onSpecificChange('overallWorkerReview', e.target.value)}
              className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
