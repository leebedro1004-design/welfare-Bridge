import React from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { ShieldCheck, FileCheck, CheckSquare, Lock } from 'lucide-react';
import { CheckboxToggle } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const AgreementFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  const agreeService = fields.agreeService !== false;
  const agreePrivacy = fields.agreePrivacy !== false;
  const agreeThirdParty = fields.agreeThirdParty !== false;

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          서비스 이용 동의서 및 승낙서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 6호 - Page 14~15)
        </p>
      </div>

      {/* Part 1: 서비스 이용 안내 및 동의서 (Page 14) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2 font-bold text-sm text-teal-800 dark:text-teal-300">
            <FileCheck className="w-4 h-4" />
            <span>[서식 1] 재가노인지원서비스 이용 동의서</span>
          </div>
          <CheckboxToggle
            label="서비스 이용 동의"
            checked={agreeService}
            onChange={(v) => onSpecificChange('agreeService', v)}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-3 leading-relaxed text-stone-700 dark:text-stone-300">
          <p>
            <strong>1. 서비스 목적:</strong> 본 기관은 지역사회 내 신체적·정신적·경제적 사유로 독립적인 일상생활이 어려운 어르신에게 맞춤형 재가노인지원서비스를 제공하여 자립적인 노후생활을 영위하도록 지원합니다.
          </p>
          <p>
            <strong>2. 서비스 내용 및 주기:</strong> 주 2회 밑반찬 배달, 주 1회 정기 안부 및 방문상담, 주거환경개선, 결연 후원물품 지원 등.
          </p>
          <p>
            <strong>3. 서비스 조정 및 중단 기준:</strong> 이용자의 건강 호전으로 타 서비스로 전환되거나, 장기요양 등급 인정으로 요양시설에 입소하는 경우, 또는 타 지역 전출 시 서비스가 조정되거나 종결될 수 있습니다.
          </p>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded font-semibold text-teal-950 dark:text-teal-200">
            위 재가노인지원서비스의 목적과 제공 내용 및 안내사항을 충분히 이해하였으며, 상기 서비스 이용에 성실히 참여할 것을 동의합니다.
          </div>
        </div>
      </div>

      {/* Part 2: 개인정보 제공 및 활용 승낙서 (Page 15) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2 font-bold text-sm text-teal-800 dark:text-teal-300">
            <Lock className="w-4 h-4" />
            <span>[서식 2] 개인정보 수집·이용 및 제3자 제공 동의서</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckboxToggle
              label="개인정보 수집 동의"
              checked={agreePrivacy}
              onChange={(v) => onSpecificChange('agreePrivacy', v)}
              disabled={readOnly}
            />
            <CheckboxToggle
              label="제3자 제공 동의"
              checked={agreeThirdParty}
              onChange={(v) => onSpecificChange('agreeThirdParty', v)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-3 leading-relaxed text-stone-700 dark:text-stone-300">
          <p>
            <strong>• 수집·이용 목적:</strong> 재가노인지원서비스 제공, 복지 서비스 연계, 사회복지시설정보시스템(W4C) 등록 및 사례관리 이력 관리.
          </p>
          <p>
            <strong>• 수집 항목:</strong> 성명, 주민등록번호, 주소, 연락처, 건강상태(만성질환), 경제상황(수급여부), 가족사항.
          </p>
          <p>
            <strong>• 제3자 제공 기관:</strong> 관할 시·군·구청, 읍·면·동 주민센터, 국민건강보험공단, 연계 의료기관 및 후원단체.
          </p>
        </div>
      </div>

      {/* Signature Box */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>동의일자:</span>
            <input
              type="text"
              disabled={readOnly}
              value={fields.agreementDate || '2019. 07. 10'}
              onChange={(e) => onSpecificChange('agreementDate', e.target.value)}
              className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>동의자(신청인):</span>
            <input
              type="text"
              disabled={readOnly}
              value={fields.applicantSign || `${doc.clientName} (서명/인)`}
              onChange={(e) => onSpecificChange('applicantSign', e.target.value)}
              className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
