import React from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { resolveDocumentAuthor } from '../../utils/userSettingsHelper';
import { Layers, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { CheckboxToggle } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const ServicePlanFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  const servicePlanList: Array<{ id: string; category: string; item: string; frequency: string; detail: string; manager: string; enabled: boolean }> =
    fields.servicePlanList || [
      { id: '1', category: '1. 일상생활', item: '밑반찬 배달서비스', frequency: '주 2회 (화/금)', detail: '3찬 1국 구성 균형 영양식 직접 전달 및 안부확인', manager: '복지사', enabled: true },
      { id: '2', category: '1. 일상생활', item: '김장김치 지원', frequency: '연 1회 (11월)', detail: '동절기 10kg 김장김치 전달 및 결식 예방', manager: '자원봉사', enabled: true },
      { id: '3', category: '2. 정서지원', item: '정기 안부·상담', frequency: '주 1회 (방문)', detail: '가정방문 말벗상담 및 우울감 완화, 건강체크', manager: '복지사', enabled: true },
      { id: '4', category: '2. 정서지원', item: '생신잔치 지원', frequency: '연 1회', detail: '생신 케이크 및 선물 전달을 통한 자존감 고취', manager: '후원팀', enabled: true },
      { id: '5', category: '3. 주거환경', item: '주거개선/방역', frequency: '연 1회/수시', detail: '화장실 안전손잡이 부착 및 하계 해충방역', manager: '봉사대', enabled: true },
      { id: '6', category: '4. 자원연계', item: '후원물품 연계', frequency: '분기별', detail: '쌀, 라면, 화장지 등 기초생필품 결연', manager: '복지사', enabled: true },
    ];

  const handleServiceChange = (idx: number, key: string, val: any) => {
    const updated = [...servicePlanList];
    updated[idx] = { ...updated[idx], [key]: val };
    onSpecificChange('servicePlanList', updated);
  };

  const handleAddService = () => {
    onSpecificChange('servicePlanList', [
      ...servicePlanList,
      {
        id: Date.now().toString(),
        category: '기타지원',
        item: '신규 서비스',
        frequency: '주 1회',
        detail: '세부 제공 내용 입력',
        manager: '복지사',
        enabled: true,
      },
    ]);
  };

  const handleRemoveService = (idx: number) => {
    const updated = servicePlanList.filter((_, i) => i !== idx);
    onSpecificChange('servicePlanList', updated);
  };

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          서 비 스 계 획 서
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 5호 - Page 12~13)
        </p>
      </div>

      {/* Target & Problem Definition */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1">
            <span className="text-stone-500">성명:</span>
            <input
              type="text"
              disabled={readOnly}
              value={doc.clientName}
              onChange={(e) => onChange('clientName', e.target.value)}
              className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] font-bold text-xs w-28"
            />
          </div>
          <div>생년월일: <strong>{client?.birthDate || '1945. 12. 31'}</strong></div>
          <div className="flex items-center gap-1">
            <span className="text-stone-500">수립일자:</span>
            <input
              type="text"
              disabled={readOnly}
              value={fields.servicePlanDate || '2019. 07. 10'}
              onChange={(e) => onSpecificChange('servicePlanDate', e.target.value)}
              className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-28"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-stone-500">사례관리자:</span>
            <input
              type="text"
              disabled={readOnly}
              value={resolveDocumentAuthor(doc.author, userSettings)}
              onChange={(e) => onChange('author', e.target.value)}
              className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] text-xs w-32 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            1. 대상자의 주요 문제 및 욕구
          </label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={fields.problemAndNeeds || '기초수급자 독거노인으로서 관절염과 우울감으로 인한 결식 우려 및 일상생활 불편, 정서적 고립감 심화.'}
            onChange={(e) => onSpecificChange('problemAndNeeds', e.target.value)}
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>

        <div>
          <label className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
            2. 해결목표 (장·단기 개입 목표)
          </label>
          <div className="space-y-2">
            <div className="p-2.5 bg-stone-50 dark:bg-[#251E1A] rounded border">
              <span className="font-bold text-violet-700 dark:text-violet-300 block mb-1">• 장기목표:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.longTermGoal || '지역사회 내에서 신체 잔존기능을 유지하고 결식 및 고립 없이 안정된 자립 노후생활 유지.'}
                onChange={(e) => onSpecificChange('longTermGoal', e.target.value)}
                className="w-full p-1.5 border rounded bg-white dark:bg-[#1E1916] text-xs"
              />
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-[#251E1A] rounded border">
              <span className="font-bold text-violet-700 dark:text-violet-300 block mb-1">• 단기목표:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.shortTermGoal || '주 2회 밑반찬 공급으로 영양개선(1), 주 1회 방문상담으로 우울지수 15점 이하 유지(2), 주거 안전손잡이 설치로 낙상 예방(3).'}
                onChange={(e) => onSpecificChange('shortTermGoal', e.target.value)}
                className="w-full p-1.5 border rounded bg-white dark:bg-[#1E1916] text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Service (16 Services) Table - Page 12 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-xs border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-violet-600" />
            <span>■ 기본 서비스 제공 계획 (직접 수정/추가/체크 가능)</span>
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddService}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-violet-700 hover:bg-violet-600 text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>서비스 항목 추가</span>
            </button>
          )}
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r w-16">선택</th>
              <th className="p-2 border-r w-24">영역</th>
              <th className="p-2 border-r w-36">서비스 항목</th>
              <th className="p-2 border-r w-28">제공주기</th>
              <th className="p-2 border-r text-left">제공 세부내용 및 목표</th>
              <th className="p-2 w-20">담당자</th>
              {!readOnly && <th className="p-2 w-10">삭제</th>}
            </tr>
          </thead>
          <tbody>
            {servicePlanList.map((svc, idx) => (
              <tr key={svc.id || idx} className={`border-b ${!svc.enabled ? 'opacity-50' : ''}`}>
                <td className="p-2 border-r">
                  <CheckboxToggle
                    label=""
                    checked={svc.enabled}
                    onChange={(val) => handleServiceChange(idx, 'enabled', val)}
                    disabled={readOnly}
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={svc.category}
                    onChange={(e) => handleServiceChange(idx, 'category', e.target.value)}
                    className="w-full p-1 border rounded text-center bg-stone-50 dark:bg-[#251E1A] text-xs font-semibold"
                  />
                </td>
                <td className="p-1 border-r text-left">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={svc.item}
                    onChange={(e) => handleServiceChange(idx, 'item', e.target.value)}
                    className="w-full p-1 border rounded bg-white dark:bg-[#1E1916] text-xs font-medium"
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={svc.frequency}
                    onChange={(e) => handleServiceChange(idx, 'frequency', e.target.value)}
                    className="w-full p-1 border rounded text-center bg-white dark:bg-[#1E1916] text-xs font-bold text-violet-700 dark:text-violet-300"
                  />
                </td>
                <td className="p-1 border-r text-left">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={svc.detail}
                    onChange={(e) => handleServiceChange(idx, 'detail', e.target.value)}
                    className="w-full p-1 border rounded bg-white dark:bg-[#1E1916] text-xs"
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={svc.manager}
                    onChange={(e) => handleServiceChange(idx, 'manager', e.target.value)}
                    className="w-full p-1 border rounded text-center bg-white dark:bg-[#1E1916] text-xs"
                  />
                </td>
                {!readOnly && (
                  <td className="p-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Service Frequency Rule Note */}
      <div className="p-3 bg-violet-50/60 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-lg text-xs flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-stone-700 dark:text-stone-300">
          <strong>※ 재가노인지원서비스 필수 제공 기준 준수:</strong> 연간 총 24회 이상 서비스 의무 제공 (물질/직접지원 연 12회 이상, 정서/상담지원 연 12회 이상) 편성 완료.
        </div>
      </div>
    </div>
  );
};
