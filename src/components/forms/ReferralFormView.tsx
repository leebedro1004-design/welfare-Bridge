import React, { useState } from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Send, Reply, CheckCircle2, Building, UserCheck } from 'lucide-react';

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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200 border-b pb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-600" />
            <span>■ 서비스 연계 및 의뢰서 (타 기관 송부용)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-[#251E1A] rounded border">
            <div>• 수신기관: <strong>{fields.referralTargetAgency || '성당노인복지센터 재가노인지원사업팀'}</strong></div>
            <div>• 발신기관: <strong>{fields.referralSenderAgency || '(사)굿실버복지회 굿실버노인복지센터'}</strong></div>
            <div>• 의뢰대상자: <strong>{doc.clientName} (75세 / 남)</strong></div>
            <div>• 의뢰일자: <strong>2019년 07월 20일</strong></div>
          </div>

          <div>
            <label className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
              1. 의뢰 사유 및 대상자 특이사항
            </label>
            <textarea
              rows={3}
              disabled={readOnly}
              value={fields.referralReason || '본 센터에서 재가노인지원서비스(밑반찬, 안부확인)를 제공받던 중, 거주지를 성당동으로 이전하게 되어 귀 기관으로 사례관리 및 계속적인 서비스 제공을 의뢰합니다.'}
              onChange={(e) => onSpecificChange('referralReason', e.target.value)}
              className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>

          {/* Requested Services Grid */}
          <div className="border border-stone-300 dark:border-stone-700 rounded overflow-hidden">
            <div className="bg-stone-100 dark:bg-[#2A231F] px-3 py-1.5 font-bold text-xs">
              2. 의뢰 요청 서비스 내역
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#251E1A] border-b">
                  <th className="p-2 border-r w-28">서비스 영역</th>
                  <th className="p-2 text-left">요청 세부내용</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">일상생활지원</td>
                  <td className="p-2 text-left">밑반찬 배달서비스 (주 2회 계속 지원 요망), 동절기 김장 지원</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">정서적지원</td>
                  <td className="p-2 text-left">독거 어르신 정기 안부확인 및 말벗상담 (주 1회 이상)</td>
                </tr>
                <tr>
                  <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">지역자원연계</td>
                  <td className="p-2 text-left">관절염 병원 진료 동행 및 기초생필품 결연 지원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. 연계 및 의뢰 회신서 (Page 24) */}
      {(tab === 'reply' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200 border-b pb-2 flex items-center gap-2">
            <Reply className="w-4 h-4 text-purple-600" />
            <span>■ 연계 및 의뢰 회신서 (접수 기관 회신용)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-[#251E1A] rounded border">
            <div>• 수신: <strong>굿실버노인복지센터 귀하</strong></div>
            <div>• 발신: <strong>성당노인복지센터 관장</strong></div>
            <div>• 회신일자: <strong>{fields.referralReplyDate || '2019년 07월 21일'}</strong></div>
            <div>• 담당자: <strong>김성민 사회복지사 (☎ 053-628-8800)</strong></div>
          </div>

          <div className="p-4 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded space-y-3 leading-relaxed">
            <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>의뢰에 대한 접수 및 지원 결정 결과</span>
            </div>
            <p>
              귀 기관에서 의뢰하신 <strong>{doc.clientName} 어르신</strong>의 사례관리 의뢰서를 정식 접수하였으며, 내부 사례회의 심의 결과 <strong>재가노인지원서비스 신규 대상자로 최종 선정</strong>하였음을 회신합니다.
            </p>
            <div className="space-y-1 pt-1 font-semibold text-stone-800 dark:text-stone-200">
              <p>• 개입 개시일: 2019년 07월 25일부터</p>
              <p>• 제공 서비스: 주 2회 밑반찬 배달 및 주 1회 방문 안부확인 개시</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
