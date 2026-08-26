import React, { useState } from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Send, Reply, CheckCircle2, Building, UserCheck } from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ReferralFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const [tab, setTab] = useState<'request' | 'reply'>('request');

  const referralReplyStatus = fields.referralReplyStatus || '의뢰 수락 (서비스 즉시 연계)';

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          서비스 연계 및 의뢰서 / 회신서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 10호 - Page 23~24)
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setTab('request')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'request'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          1. 서비스 연계 및 의뢰서 (Page 23)
        </button>
        <button
          type="button"
          onClick={() => setTab('reply')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'reply'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          2. 연계 및 의뢰 회신서 (Page 24)
        </button>
      </div>

      {/* 1. 서비스 연계 및 의뢰서 (Page 23) */}
      {(tab === 'request' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              <span>■ 재가노인지원서비스 연계 및 의뢰서</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">의뢰일자:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referralDate || '2019. 07. 12'}
                onChange={(e) => onSpecificChange('referralDate', e.target.value)}
                className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs font-bold w-28"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-[#251E1A] rounded border">
            <div>
              <span className="font-semibold block mb-1">의뢰 기관 (발신):</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referralSourceOrg || '굿실버재가노인지원센터 (담당: 이상호 사회복지사 / ☎ 053-123-4567)'}
                onChange={(e) => onSpecificChange('referralSourceOrg', e.target.value)}
                className="w-full p-1.5 border rounded bg-white dark:bg-[#1E1916]"
              />
            </div>
            <div>
              <span className="font-semibold block mb-1">수신 기관 (연계처):</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referralTargetOrg || '달서구 자원봉사센터 및 지역사회보장협의체'}
                onChange={(e) => onSpecificChange('referralTargetOrg', e.target.value)}
                className="w-full p-1.5 border rounded bg-white dark:bg-[#1E1916]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">의뢰 사유 및 연계 요청 세부 내용:</label>
            <textarea
              rows={4}
              disabled={readOnly}
              value={fields.referralReason || '대상자는 국민기초생활수급 독거노인으로 관절염 악화로 인한 보행 불편과 식사 준비 곤란을 겪고 있습니다. 본 센터의 주 2회 밑반찬 배달과 병행하여 귀 기관의 주거환경개선 봉사단을 통해 화장실 안전손잡이 설치 및 방충망 보수 자원 연계를 정중히 의뢰합니다.'}
              onChange={(e) => onSpecificChange('referralReason', e.target.value)}
              className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 2. 연계 및 의뢰 회신서 (Page 24) */}
      {(tab === 'reply' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Reply className="w-4 h-4" />
              <span>■ 연계 및 의뢰 회신서</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">회신일자:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referralReplyDate || '2019. 07. 15'}
                onChange={(e) => onSpecificChange('referralReplyDate', e.target.value)}
                className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs font-bold w-28"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">회신 결과 상태 구분:</label>
            <RadioToggleGroup
              options={[
                '의뢰 수락 (서비스 즉시 연계)',
                '조건부 수락 (대기 후 제공)',
                '수용 불가 (자격 미달 또는 정원 초과)',
              ]}
              value={referralReplyStatus}
              onChange={(v) => onSpecificChange('referralReplyStatus', v)}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">회신 내용 및 지원 조치 계획:</label>
            <textarea
              rows={4}
              disabled={readOnly}
              value={fields.referralReplyDetail || '귀 기관에서 의뢰하신 독거어르신 주거안전 지원 요청을 정식 접수 및 승인하였습니다. 오는 7월 20일(토) 사랑의 봉사대 3명을 파견하여 화장실 안전손잡이 부착 및 방충망 교체 작업을 전액 무료로 진행할 예정입니다.'}
              onChange={(e) => onSpecificChange('referralReplyDetail', e.target.value)}
              className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
