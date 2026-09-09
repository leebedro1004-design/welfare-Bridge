import React from 'react';
import { CaseDocument, ClientProfile, UserSettings } from '../../types';
import { resolveDocumentAuthor } from '../../utils/userSettingsHelper';
import { User, Home, HeartPulse, CheckSquare, Phone, MapPin, Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import { CheckboxToggle, MultiCheckboxGroup, RadioToggleGroup } from './FormControls';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  userSettings?: UserSettings;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const IntakeFormView: React.FC<FormProps> = ({
  doc,
  client,
  userSettings,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

  // Families state from formSpecificFields
  const familyList: Array<{ relation: string; name: string; address: string; age: string; job: string; livingWith: string; note: string }> =
    fields.familyList || [
      { relation: '장남', name: '홍철수', address: '대구 달서구 거주 (연락두절/행방불명)', age: '50세', job: '무직', livingWith: '비동거', note: '부양능력 없음' },
      { relation: '장녀', name: '홍순이', address: '경북 경산 거주', age: '48세', job: '일용직', livingWith: '비동거', note: '생계 곤란' },
    ];

  const handleFamilyChange = (idx: number, key: string, val: string) => {
    const updated = [...familyList];
    updated[idx] = { ...updated[idx], [key]: val };
    onSpecificChange('familyList', updated);
  };

  const handleAddFamilyRow = () => {
    onSpecificChange('familyList', [
      ...familyList,
      { relation: '', name: '', address: '', age: '', job: '', livingWith: '비동거', note: '' },
    ]);
  };

  const handleRemoveFamilyRow = (idx: number) => {
    const updated = familyList.filter((_, i) => i !== idx);
    onSpecificChange('familyList', updated);
  };

  // Selected values with fallback defaults
  const economicStatus = fields.economicStatus || '국민기초생활수급권자';
  const householdType = fields.householdType || '독거';
  const housingType = fields.housingType || '월세';
  const buildingType = fields.buildingType || '빌라/연립/다세대주택';
  const healthStatus = fields.healthStatus || '질환은 있지만 건강한 편이다';
  const hasDisability = fields.hasDisability || '유';
  const assistiveDevices: string[] = fields.assistiveDevices || ['지팡이'];
  const careGrade = fields.careGrade || '등급없음 (일반/등급외)';
  const eligibilityStatus = fields.eligibilityStatus || '적격';
  const eligibilityReasons: string[] = fields.eligibilityReasons || ['부양자의 부양능력 약화', '만성질환 독거노인 돌봄 필요'];

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 print:text-black">
      {/* Official Form Header */}
      <div className="text-center pb-4 border-b-2 border-stone-800 dark:border-stone-200">
        <h2 className="text-2xl font-black tracking-widest text-stone-900 dark:text-stone-100">
          초 기 면 접 지
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          (재가노인지원서비스 사례관리 표준 서식 1호)
        </p>
      </div>

      {/* 1. 기본사항 Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>기본사항</span>
          </div>
          <span className="text-[11px] text-stone-500 font-normal">※ 모든 항목 직접 수정 및 체크 가능</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                성 명
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 font-bold">
                <input
                  type="text"
                  disabled={readOnly}
                  value={doc.clientName}
                  onChange={(e) => onChange('clientName', e.target.value)}
                  className="w-full p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] font-bold"
                />
              </td>
              <th className="w-20 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                성 별
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                <RadioToggleGroup
                  options={['남', '여']}
                  value={fields.gender || client?.gender || '남'}
                  onChange={(v) => onSpecificChange('gender', v)}
                  disabled={readOnly}
                />
              </td>
              <th className="w-20 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                연 령
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.age || (client?.age ? `${client.age}세` : '75세')}
                  onChange={(e) => onSpecificChange('age', e.target.value)}
                  className="w-full p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                생년월일
              </th>
              <td className="p-2">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.birthDate || client?.birthDate || '1945-12-31'}
                  onChange={(e) => onSpecificChange('birthDate', e.target.value)}
                  className="w-full p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                학 력
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.education || client?.education || '초졸'}
                  onChange={(e) => onSpecificChange('education', e.target.value)}
                  className="w-full p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                종 교
              </th>
              <td colSpan={5} className="p-2">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.religion || client?.religion || '무교 / 불교'}
                  onChange={(e) => onSpecificChange('religion', e.target.value)}
                  className="w-full p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                />
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                현주소 & 연락처
              </th>
              <td colSpan={7} className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={fields.address || client?.address || '대구광역시 달서구 상인동 비둘기아파트 205동 1515호'}
                    onChange={(e) => onSpecificChange('address', e.target.value)}
                    placeholder="현 거주 주소"
                    className="md:col-span-2 p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                  />
                  <input
                    type="text"
                    disabled={readOnly}
                    value={fields.phone || client?.phone || '010-9012-4567'}
                    onChange={(e) => onSpecificChange('phone', e.target.value)}
                    placeholder="연락처"
                    className="p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 가족사항 Table (Editable rows + Add/Remove) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>가족사항</span>
            <span className="text-[11px] text-stone-500 font-normal">({familyList.length}명)</span>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddFamilyRow}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>가족 행 추가</span>
            </button>
          )}
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-16">관 계</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-20">성 명</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800">주 소</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-16">연 령</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-20">직 업</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-24">동거여부</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800">비 고</th>
              {!readOnly && <th className="p-2 w-10">삭제</th>}
            </tr>
          </thead>
          <tbody>
            {familyList.map((row, idx) => (
              <tr key={idx} className="border-b border-stone-200 dark:border-stone-800">
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.relation}
                    onChange={(e) => handleFamilyChange(idx, 'relation', e.target.value)}
                    placeholder="관계"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-center bg-stone-50 dark:bg-[#251E1A]"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.name}
                    onChange={(e) => handleFamilyChange(idx, 'name', e.target.value)}
                    placeholder="성명"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-center bg-stone-50 dark:bg-[#251E1A] font-medium"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.address}
                    onChange={(e) => handleFamilyChange(idx, 'address', e.target.value)}
                    placeholder="주소 및 거주 현황"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-left px-2 bg-stone-50 dark:bg-[#251E1A]"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.age}
                    onChange={(e) => handleFamilyChange(idx, 'age', e.target.value)}
                    placeholder="연령"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-center bg-stone-50 dark:bg-[#251E1A]"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.job}
                    onChange={(e) => handleFamilyChange(idx, 'job', e.target.value)}
                    placeholder="직업"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-center bg-stone-50 dark:bg-[#251E1A]"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <RadioToggleGroup
                    options={['동거', '비동거']}
                    value={row.livingWith}
                    onChange={(v) => handleFamilyChange(idx, 'livingWith', v)}
                    disabled={readOnly}
                    className="flex justify-center gap-1"
                  />
                </td>
                <td className="p-1 border-r border-stone-200 dark:border-stone-800">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={row.note}
                    onChange={(e) => handleFamilyChange(idx, 'note', e.target.value)}
                    placeholder="부양능력, 연락상태 등"
                    className="w-full p-1 border border-stone-200 dark:border-stone-700 rounded text-left px-2 bg-stone-50 dark:bg-[#251E1A]"
                  />
                </td>
                {!readOnly && (
                  <td className="p-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveFamilyRow(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                      title="행 삭제"
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

      {/* 3. 생활상태 (경제상황, 세대유형, 주거형태) - Interactive Checkboxes */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
          <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>생활상태 (클릭하여 체크/해제 선택)</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                경제상황
              </th>
              <td className="p-2.5 space-y-2">
                <RadioToggleGroup
                  options={[
                    '국민기초생활수급권자',
                    '차상위계층',
                    '의료급여 1·2종',
                    '일반 저소득',
                    '기타',
                  ]}
                  value={economicStatus}
                  onChange={(v) => onSpecificChange('economicStatus', v)}
                  disabled={readOnly}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0">월소득 약:</span>
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.monthlyIncome || '790,000원'}
                      onChange={(e) => onSpecificChange('monthlyIncome', e.target.value)}
                      className="w-full p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0">주소득원:</span>
                    <input
                      type="text"
                      disabled={readOnly}
                      value={fields.mainIncomeSource || '기초연금, 생계·주거급여'}
                      onChange={(e) => onSpecificChange('mainIncomeSource', e.target.value)}
                      className="w-full p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                세대유형
              </th>
              <td className="p-2.5">
                <RadioToggleGroup
                  options={['독거', '부부', '자녀가족동거', '친척동거', '조손가정', '기타']}
                  value={householdType}
                  onChange={(v) => onSpecificChange('householdType', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                주거형태
              </th>
              <td className="p-2.5 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-stone-500 text-[11px] font-semibold">점유 형태:</span>
                  <RadioToggleGroup
                    options={['자가', '전세', '월세', '임대아파트', '무료임대/의탁거주']}
                    value={housingType}
                    onChange={(v) => onSpecificChange('housingType', v)}
                    disabled={readOnly}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-stone-500 text-[11px] font-semibold">건물 형태:</span>
                  <RadioToggleGroup
                    options={['단독주택', '아파트', '빌라/연립/다세대주택', '옥탑/지하', '기타']}
                    value={buildingType}
                    onChange={(v) => onSpecificChange('buildingType', v)}
                    disabled={readOnly}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0">보증금 및 월세:</span>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={fields.rentDetails || '보증금 1,000만원 / 월세 15만원'}
                    onChange={(e) => onSpecificChange('rentDetails', e.target.value)}
                    placeholder="보증금 및 월세 금액"
                    className="w-full p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. 신체상태 (건강상태, 만성질환, 장애, 보장구, 요양등급) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>신체상태 (체크 및 텍스트 수정 가능)</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                건강상태
              </th>
              <td className="p-2.5">
                <RadioToggleGroup
                  options={[
                    '건강하다',
                    '특별한 질환 없으나 노환',
                    '질환은 있지만 건강한 편이다',
                    '질환으로 건강이 나쁘다',
                    '와상/거동불능',
                  ]}
                  value={healthStatus}
                  onChange={(v) => onSpecificChange('healthStatus', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                만성질환
              </th>
              <td className="p-2.5">
                <input
                  type="text"
                  disabled={readOnly}
                  value={fields.chronicDiseasesText || (client?.chronicDiseases?.join(', ') || '고혈압, 관절염, 만성요통')}
                  onChange={(e) => onSpecificChange('chronicDiseasesText', e.target.value)}
                  placeholder="보유 만성질환명 입력"
                  className="w-full p-1.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] font-semibold"
                />
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                장애여부
              </th>
              <td className="p-2.5 flex flex-wrap items-center gap-3">
                <RadioToggleGroup
                  options={['유', '무']}
                  value={hasDisability}
                  onChange={(v) => onSpecificChange('hasDisability', v)}
                  disabled={readOnly}
                />
                {hasDisability === '유' && (
                  <input
                    type="text"
                    disabled={readOnly}
                    value={fields.disabilityDetail || '지체장애 3급'}
                    onChange={(e) => onSpecificChange('disabilityDetail', e.target.value)}
                    placeholder="장애 유형 및 등급"
                    className="p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] text-xs font-semibold"
                  />
                )}
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                보장구 (다중 선택/해제)
              </th>
              <td className="p-2.5">
                <MultiCheckboxGroup
                  options={[
                    '사용안함',
                    '지팡이',
                    '휠체어',
                    '보행기(실버카)',
                    '목발',
                    '보청기',
                    '틀니',
                    '돋보기',
                  ]}
                  selectedValues={assistiveDevices}
                  onChange={(v) => onSpecificChange('assistiveDevices', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                장기요양등급
              </th>
              <td className="p-2.5">
                <RadioToggleGroup
                  options={[
                    '1등급',
                    '2등급',
                    '3등급',
                    '4등급',
                    '5등급',
                    '인지지원등급',
                    '등급없음 (일반/등급외)',
                    '신청중',
                  ]}
                  value={careGrade}
                  onChange={(v) => onSpecificChange('careGrade', v)}
                  disabled={readOnly}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. 타 서비스 이용 및 신청서비스 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700">
          타 서비스 이용 현황 및 신청서비스
        </div>
        <div className="p-3 space-y-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-400 block mb-1">타 서비스 이용 현황</label>
              <input
                type="text"
                disabled={readOnly}
                value={fields.otherServiceUsage || '보건소 만성질환 등록 관리 (타 재가복지서비스 이용 없음)'}
                onChange={(e) => onSpecificChange('otherServiceUsage', e.target.value)}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-400 block mb-1">신청서비스 (영역별 구분기재)</label>
              <input
                type="text"
                disabled={readOnly}
                value={fields.appliedServices || '일상생활지원(밑반찬, 김장, 생신), 정서적지원(말벗안부), 보건의료지원'}
                onChange={(e) => onSpecificChange('appliedServices', e.target.value)}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. 서비스 제공 여부 판정 */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>서비스 제공 여부 판정</span>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center gap-6 pb-2 border-b border-stone-200 dark:border-stone-800">
            <span className="font-bold">1) 서비스 제공 여부:</span>
            <RadioToggleGroup
              options={['적격', '부적격']}
              value={eligibilityStatus}
              onChange={(v) => onSpecificChange('eligibilityStatus', v)}
              disabled={readOnly}
            />
            {eligibilityStatus === '부적격' && (
              <input
                type="text"
                disabled={readOnly}
                value={fields.ineligibleReason || ''}
                onChange={(e) => onSpecificChange('ineligibleReason', e.target.value)}
                placeholder="부적격 사유 입력"
                className="p-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] text-xs"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <span className="font-bold">2) 서비스 제공 사유 (다중 선택/해제 가능):</span>
            <MultiCheckboxGroup
              options={[
                '자조능력 없음',
                '부양자의 부양능력 약화',
                '긴급구호/위기지원',
                '만성질환 독거노인 돌봄 필요',
                '사회적 고립/우울 완화',
              ]}
              selectedValues={eligibilityReasons}
              onChange={(v) => onSpecificChange('eligibilityReasons', v)}
              disabled={readOnly}
            />
          </div>
          <div>
            <span className="font-bold block mb-1">3) 제공 서비스 종합의견 및 조치계획:</span>
            <textarea
              rows={3}
              disabled={readOnly}
              value={doc.socialWorkerOpinion || '기초수급 독거노인으로 관절염과 우울증으로 식사 준비 및 정서적 고립이 우려됨. 주 2회 밑반찬 제공, 주 1회 이상 안부확인 및 응급안전망 연계를 즉시 실시함.'}
              onChange={(e) => onChange('socialWorkerOpinion', e.target.value)}
              className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 7. 의뢰인 정보 & 비고 & 서명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-xs space-y-2 bg-white dark:bg-[#1E1916]">
          <h4 className="font-bold text-stone-700 dark:text-stone-300 border-b pb-1">의뢰인 정보</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-20 text-stone-500">성 명:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referrerName || '성당동 주민센터 복지담당자'}
                onChange={(e) => onSpecificChange('referrerName', e.target.value)}
                className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-20 text-stone-500">관계:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referrerRelation || '공공기관 의뢰'}
                onChange={(e) => onSpecificChange('referrerRelation', e.target.value)}
                className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-20 text-stone-500">전화번호:</span>
              <input
                type="text"
                disabled={readOnly}
                value={fields.referrerPhone || '053-628-0119'}
                onChange={(e) => onSpecificChange('referrerPhone', e.target.value)}
                className="w-full p-1 border rounded bg-stone-50 dark:bg-[#251E1A]"
              />
            </div>
          </div>
        </div>

        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-xs space-y-1.5 bg-white dark:bg-[#1E1916]">
          <h4 className="font-bold text-stone-700 dark:text-stone-300 border-b pb-1">비고 요약</h4>
          <textarea
            rows={3}
            disabled={readOnly}
            value={fields.intakeNotes || '• 1. 가족사항: 자녀와 연락 소원 및 부양능력 부재\n• 2. 생활상태: 월세 다세대주택 독거, 소득 취약\n• 3. 건강상태: 고혈압, 지체장애 3급, 경미한 우울'}
            onChange={(e) => onSpecificChange('intakeNotes', e.target.value)}
            className="w-full p-1.5 border rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
          />
        </div>
      </div>

      {/* Footer Sign */}
      <div className="pt-4 border-t border-stone-300 dark:border-stone-700 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <span>면접일:</span>
          <input
            type="text"
            disabled={readOnly}
            value={fields.intakeDate || '2019. 06. 30'}
            onChange={(e) => onSpecificChange('intakeDate', e.target.value)}
            className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] font-bold text-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <span>상담자:</span>
          <input
            type="text"
            disabled={readOnly}
            value={resolveDocumentAuthor(doc.author, userSettings) ? `${resolveDocumentAuthor(doc.author, userSettings).replace('(인)', '').trim()} (인)` : '이현정 사회복지사 (인)'}
            onChange={(e) => onChange('author', e.target.value)}
            className="p-1 border rounded bg-stone-50 dark:bg-[#251E1A] font-bold text-stone-900 dark:text-stone-100"
          />
        </div>
      </div>
    </div>
  );
};
