import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { ShieldCheck, FileCheck, CheckSquare, Lock } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const AgreementFormView: React.FC<FormProps> = ({
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
          서비스 이용 동의서 및 승낙서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 6호 - Page 14~15)
        </p>
      </div>

      {/* Part 1: 서비스 이용 안내 및 동의서 (Page 14) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b pb-2 font-bold text-sm text-teal-800 dark:text-teal-300">
          <FileCheck className="w-4 h-4" />
          <span>[서식 1] 재가노인지원서비스 이용 동의서</span>
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
        <div className="flex items-center gap-2 border-b pb-2 font-bold text-sm text-teal-800 dark:text-teal-300">
          <Lock className="w-4 h-4" />
          <span>[서식 2] 개인정보 수집·이용 및 제3자 제공 동의서</span>
        </div>

        <div className="space-y-3 leading-relaxed text-stone-700 dark:text-stone-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2.5 bg-stone-50 dark:bg-[#251E1A] rounded border">
            <div>• 수집항목: 성명, 주민등록번호, 주소, 연락처, 건강상태</div>
            <div>• 수집목적: 재가노인지원서비스 수급 자격 심사 및 서비스 연계</div>
            <div>• 보유기간: 서비스 종결 후 사회복지사업법 기준 5년 보관</div>
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <input type="checkbox" checked={fields.hasAgreedToPrivacyCollection !== false} readOnly />
              <span>■ [필수] 개인정보 수집 및 이용에 동의합니다.</span>
            </label>
            <label className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <input type="checkbox" checked={fields.hasAgreedToPrivacyThirdParty !== false} readOnly />
              <span>■ [필수] 사회복지 유관기관 및 지자체 제3자 정보 제공에 동의합니다.</span>
            </label>
          </div>
        </div>
      </div>

      {/* Signatures Form Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-stone-50 dark:bg-[#251E1A] text-xs space-y-3">
        <div className="text-center font-bold text-sm">
          {fields.agreementDate || '2019년 07월 10일'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p>• 신청인(이용자) 성명: <strong className="text-stone-900 dark:text-stone-100">{doc.clientName} (서명 / 인)</strong></p>
            <p>• 주민등록번호: <strong>{client?.residentNumber || '451231-1******'}</strong></p>
            <p>• 주 소: <strong>{client?.address || '대구광역시 달서구 상인동 비둘기아파트 205동 1515호'}</strong></p>
          </div>
          <div className="space-y-1 md:text-right">
            <p>• 제공기관: <strong>(사)굿실버복지회 굿실버노인복지센터</strong></p>
            <p>• 시설장: <strong>장 성 태 (직인생략)</strong></p>
            <p>• 담당 사회복지사: <strong>{doc.author || '이상호 (인)'}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};
