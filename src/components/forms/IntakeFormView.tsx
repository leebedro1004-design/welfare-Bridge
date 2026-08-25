import React from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { User, Home, HeartPulse, CheckSquare, Phone, MapPin, Calendar, FileText } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const IntakeFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};

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
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>기본사항</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                성 명
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 font-bold">
                {doc.clientName}
              </td>
              <th className="w-20 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                성 별
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                {client?.gender || '남'}
              </td>
              <th className="w-20 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                연 령
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                {client?.age ? `${client.age}세` : '75세'}
              </td>
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                생년월일
              </th>
              <td className="p-2">
                {client?.birthDate || '1945-12-31'}
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                학 력
              </th>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">
                {client?.education || '초졸'}
              </td>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                종 교
              </th>
              <td colSpan={5} className="p-2">
                {client?.religion || '무교 / 불교'}
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                현주소
              </th>
              <td colSpan={7} className="p-2">
                <div className="flex items-center justify-between gap-4">
                  <span>{client?.address || '대구광역시 달서구 상인동 비둘기아파트 205동 1515호'}</span>
                  <span className="text-stone-500 dark:text-stone-400 shrink-0 font-medium">
                    (☎ {client?.phone || '010-9012-4567'})
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 가족사항 Table */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700">
          가족사항
        </div>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#251E1A] border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-16">관 계</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-20">성 명</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800">주 소</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-16">연 령</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-20">직 업</th>
              <th className="p-2 border-r border-stone-200 dark:border-stone-800 w-20">동거여부</th>
              <th className="p-2 w-28">비 고</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 font-semibold">장남</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">홍철수</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 text-left">대구 달서구 거주 (연락두절/행방불명)</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">50세</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">무직</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 text-rose-600 font-bold">비동거</td>
              <td className="p-2 text-stone-500">부양능력 없음</td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 font-semibold">장녀</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">홍순이</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 text-left">경북 경산 거주</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">48세</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">일용직</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 text-rose-600 font-bold">비동거</td>
              <td className="p-2 text-stone-500">생계 곤란</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 font-semibold">-</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">-</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800 text-left text-stone-400">-</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">-</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">-</td>
              <td className="p-2 border-r border-stone-200 dark:border-stone-800">-</td>
              <td className="p-2 text-stone-400">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. 생활상태 (경제상황, 세대유형, 주거형태) */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-[#1E1916]">
        <div className="bg-stone-100 dark:bg-[#2A231F] px-4 py-2 font-bold text-sm border-b border-stone-300 dark:border-stone-700 flex items-center gap-2">
          <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>생활상태</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                경제상황
              </th>
              <td className="p-2.5 space-y-1.5">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-bold text-amber-700 dark:text-amber-400">■ 국민기초생활수급권자</span>
                  <span className="text-stone-500">□ 차상위</span>
                  <span className="text-stone-500">□ 일반</span>
                  <span className="text-stone-500">□ 기타( )</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-1 text-stone-700 dark:text-stone-300">
                  <span>■ 월소득 약: <strong>790,000원</strong></span>
                  <span>■ 주소득원: <strong>기초연금, 생계·주거비, 정부지원금</strong></span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                세대유형
              </th>
              <td className="p-2.5">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-bold text-amber-700 dark:text-amber-400">■ 독거</span>
                  <span className="text-stone-500">□ 부부</span>
                  <span className="text-stone-500">□ 자녀가족</span>
                  <span className="text-stone-500">□ 친척동거</span>
                  <span className="text-stone-500">□ 조손</span>
                  <span className="text-stone-500">□ 기타</span>
                </div>
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                주거형태
              </th>
              <td className="p-2.5 space-y-1.5">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-stone-500">□ 자가</span>
                  <span className="text-stone-500">□ 전세</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">■ 월세 (보증금 1,000만원 / 월세 15만원)</span>
                  <span className="text-stone-500">□ 임대아파트</span>
                  <span className="text-stone-500">□ 무료임대/의탁거주</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-stone-600 dark:text-stone-400 pt-1">
                  <span>□ 단독주택</span>
                  <span>□ 아파트</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">■ 빌라/연립/다세대주택</span>
                  <span>□ 기타</span>
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
          <span>신체상태</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="w-24 bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                건강상태
              </th>
              <td className="p-2.5">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-stone-500">□ 건강하다</span>
                  <span className="text-stone-500">□ 특별한 질환 없으나 노환</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">■ 질환은 있지만 건강한 편이다</span>
                  <span className="text-stone-500">□ 질환으로 건강이 나쁘다</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                만성질환
              </th>
              <td className="p-2.5 font-bold text-stone-800 dark:text-stone-200">
                {client?.chronicDiseases?.join(', ') || '고혈압, 관절염, 만성요통'}
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                장애여부
              </th>
              <td className="p-2.5">
                <span className="font-bold text-stone-900 dark:text-stone-100">■ 유 (장애유형: 지체장애 3급)</span>
                <span className="text-stone-500 ml-4">□ 무</span>
              </td>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                보장구
              </th>
              <td className="p-2.5 flex flex-wrap items-center gap-3">
                <span className="text-stone-500">□ 사용안함</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">■ 지팡이</span>
                <span className="text-stone-500">□ 휠체어</span>
                <span className="text-stone-500">□ 목발</span>
                <span className="text-stone-500">□ 보청기</span>
                <span className="text-stone-500">□ 틀니</span>
                <span className="text-stone-500">□ 돋보기</span>
              </td>
            </tr>
            <tr>
              <th className="bg-stone-50 dark:bg-[#251E1A] p-2.5 text-stone-600 dark:text-stone-400 font-semibold border-r border-stone-200 dark:border-stone-800">
                장기요양등급
              </th>
              <td className="p-2.5 flex flex-wrap items-center gap-3">
                <span className="text-stone-500">□ 1등급</span>
                <span className="text-stone-500">□ 2등급</span>
                <span className="text-stone-500">□ 3등급</span>
                <span className="text-stone-500">□ 4등급</span>
                <span className="text-stone-500">□ 5등급</span>
                <span className="text-stone-500">□ 등급 A·B</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">■ 등급없음 (일반/등급외)</span>
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
            <label className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <input type="radio" checked={fields.eligibilityStatus !== '부적격'} readOnly />
              ■ 적격
            </label>
            <label className="flex items-center gap-1.5 text-stone-500">
              <input type="radio" checked={fields.eligibilityStatus === '부적격'} readOnly />
              □ 부적격 (사유: {fields.ineligibleReason || '해당없음'})
            </label>
          </div>
          <div className="space-y-1.5">
            <span className="font-bold">2) 서비스 사유:</span>
            <div className="flex flex-wrap gap-4 pl-2 text-stone-700 dark:text-stone-300">
              <span>□ 자조능력 없음</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">■ 부양자의 부양능력 약화</span>
              <span>□ 긴급지원</span>
              <span>□ 기타(만성질환 독거노인 돌봄 필요)</span>
            </div>
          </div>
          <div>
            <span className="font-bold block mb-1">3) 제공 서비스 내용 (영역별 구분기재):</span>
            <textarea
              rows={2}
              disabled={readOnly}
              value={doc.socialWorkerOpinion || '기초수급 독거노인으로 관절염과 우울증으로 식사 준비 및 정서적 고립이 우려됨. 주 2회 밑반찬 제공, 주 1회 이상 안부확인 및 응급안전망 연계를 즉시 실시함.'}
              onChange={(e) => onChange('socialWorkerOpinion', e.target.value)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 7. 의뢰인 정보 & 비고 & 서명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-xs space-y-2 bg-white dark:bg-[#1E1916]">
          <h4 className="font-bold text-stone-700 dark:text-stone-300 border-b pb-1">의뢰인 정보</h4>
          <p>• 성 명: <strong>{fields.referrerName || '성당동 주민센터 복지담당자'}</strong></p>
          <p>• 노인과의 관계: <strong>{fields.referrerRelation || '공공기관 의뢰'}</strong></p>
          <p>• 전화번호: <strong>{fields.referrerPhone || '053-628-0119'}</strong></p>
          <p>• 의뢰경로: <strong>{fields.referralRoute || '통합사례관리 발굴 의뢰'}</strong></p>
        </div>

        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-3 text-xs space-y-1.5 bg-white dark:bg-[#1E1916]">
          <h4 className="font-bold text-stone-700 dark:text-stone-300 border-b pb-1">비고 요약</h4>
          <p className="line-clamp-1">• 1. 가족사항: 자녀와 연락 소원 및 부양능력 부재</p>
          <p className="line-clamp-1">• 2. 생활상태: 월세 다세대주택 독거, 소득 취약</p>
          <p className="line-clamp-1">• 3. 건강상태: 고혈압, 지체장애 3급, 경미한 우울</p>
        </div>
      </div>

      {/* Footer Sign */}
      <div className="pt-4 border-t border-stone-300 dark:border-stone-700 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
        <div>
          면접일: <span className="text-stone-900 dark:text-stone-100">{fields.intakeDate || '2019. 06. 30'}</span>
        </div>
        <div>
          상담자: <span className="text-stone-900 dark:text-stone-100">{doc.author || '이상호 사회복지사 (인)'}</span>
        </div>
      </div>
    </div>
  );
};
