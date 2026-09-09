import React from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { resolveDocumentAuthor, getEffectiveWorkerName, getEffectiveWorkerFullName } from '../../utils/userSettingsHelper';
import { Users, FileText, CheckCircle, Calendar, Clock } from 'lucide-react';
import { CheckboxToggle, RadioToggleGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ConferenceFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const conferenceType = fields.conferenceType || '선정회의';
  const workerName = getEffectiveWorkerName(userSettings, '이현정');
  const workerFullName = getEffectiveWorkerFullName(userSettings, '이현정 사회복지사');
  const investigatorName = resolveDocumentAuthor(fields.conferenceInvestigator || doc.author, userSettings);

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          사 례 회 의 록
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 4호 - Page 10~11, 18~19, 25)
        </p>
      </div>

      {/* Conference Basic Metadata */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>회의 개요</span>
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-stone-600 dark:text-stone-400">회의구분:</span>
            <RadioToggleGroup
              options={['선정회의', '제공회의', '재사정회의', '종결회의']}
              value={conferenceType}
              onChange={(v) => onSpecificChange('conferenceType', v)}
              disabled={readOnly}
            />
          </div>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">회의일시</th>
              <td className="p-2 border-r">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.conferenceDate || '2019. 07. 05 (금) 10:00~11:00'}
                  onChange={(e) => onSpecificChange('conferenceDate', e.target.value)}
                  className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">조사자</th>
              <td className="p-2">
                <input
                  type="text"
                  disabled={readOnly}
                  value={investigatorName}
                  onChange={(e) => onSpecificChange('conferenceInvestigator', e.target.value)}
                  className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">참석자</th>
              <td colSpan={3} className="p-2">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.conferenceAttendees?.includes('이상호') ? fields.conferenceAttendees.replace('이상호 사회복지사', workerFullName) : (fields.conferenceAttendees || `장성태 센터장, ${workerFullName}, 정명훈 팀장, 박서연 간호조무사 (총 4명)`)}
                  onChange={(e) => onSpecificChange('conferenceAttendees', e.target.value)}
                  className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 border-r">대상자</th>
              <td colSpan={3} className="p-2 font-bold">
                {doc.clientName} (75세, 독거, 국민기초생활수급자)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conference Agenda & Discussion */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 회의 안건 및 대상자 핵심 상황 보고
          </label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.conferenceAgenda || '• 안건: 신규 발굴 위기 독거어르신 재가노인지원서비스 [사례관리형] 적격 심의 및 맞춤형 서비스 지원 계획 수립의 건\n• 현황: 기초수급 독거노인으로 관절염과 우울감 심화로 결식 우려 및 고립 위기.'}
            onChange={(e) => onSpecificChange('conferenceAgenda', e.target.value)}
            className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 회의 내용 및 참석자 주요 발언 요약
          </label>
          <textarea
            rows={4}
            disabled={readOnly}
            value={fields.conferenceDiscussion?.includes('이상호 복지사') ? fields.conferenceDiscussion.replace(/이상호 복지사/g, `${workerName} 복지사`) : (fields.conferenceDiscussion || `• ${workerName} 복지사: 초기면접 및 사정 결과 우울 점수가 높고 보행 장애가 있어 주 2회 밑반찬과 주 1회 정기 방문상담이 절실함.\n• 정명훈 팀장: 동절기 김장 지원 및 낙상 예방을 위한 화장실 안전손잡이 긴급 설치 제안.\n• 장성태 센터장: 만장일치로 [사례관리형] 대상자로 최종 승인하며, 맞춤돌봄 및 보건소와 긴밀한 협력망 구축 당부.`)}
            onChange={(e) => onSpecificChange('conferenceDiscussion', e.target.value)}
            className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            3. 회의 최종 결정사항 및 역할 분담
          </label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.conferenceDecision?.includes('이상호 복지사') ? fields.conferenceDecision.replace(/이상호 복지사/g, `${workerName} 복지사`) : (fields.conferenceDecision || `1. 사례관리형 대상자로 최종 선정 승인 (선정기준표 31점)\n2. 주 2회 밑반찬 배달서비스 및 주 1회 방문상담 즉시 개시 (담당: ${workerName} 복지사)\n3. 7월 중 화장실 안전손잡이 부착 지원 (담당: 정명훈 팀장)`)}
            onChange={(e) => onSpecificChange('conferenceDecision', e.target.value)}
            className="w-full p-2 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed font-semibold text-indigo-950 dark:text-indigo-200"
          />
        </div>
      </div>
    </div>
  );
};
