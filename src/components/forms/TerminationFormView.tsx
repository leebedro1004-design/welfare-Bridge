import React, { useState } from 'react';
import { CaseDocument, ClientProfile } from '../../types';
import { Award, FileText, CheckCircle2, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface FormProps {
  doc: CaseDocument;
  client?: ClientProfile;
  onChange: (field: keyof CaseDocument, value: any) => void;
  onSpecificChange: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const TerminationFormView: React.FC<FormProps> = ({
  doc,
  client,
  onChange,
  onSpecificChange,
  readOnly = false,
}) => {
  const fields = doc.formSpecificFields || {};
  const [tab, setTab] = useState<'notice' | 'report' | 'evaluation'>('report');

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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
            <div>종결일자: <strong>{fields.terminationNoticeDate || '2019. 07. 20'}</strong></div>
            <div>발신기관: <strong>굿실버노인복지센터</strong></div>
          </div>
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded space-y-2 leading-relaxed">
            <p className="font-semibold text-rose-950 dark:text-rose-200">
              어르신께 제공되던 재가노인지원서비스의 종결 사유 및 후속 조치를 다음과 같이 안내해 드립니다.
            </p>
            <p><strong>• 종결 사유:</strong> 타 관할 지역(대구 달서구 상인동 → 성당동)으로의 거주지 이전에 따른 기관 이관 및 연계</p>
            <p><strong>• 후속 조치:</strong> 이관 대상 기관인 '성당노인복지센터'로 사례관리 기록 및 서비스 내역 일체를 인계하여 돌봄 공백이 발생하지 않도록 조치함.</p>
          </div>
        </div>
      )}

      {/* 2. 사례관리 종결보고서 (Page 21) */}
      {(tab === 'report' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2 flex items-center justify-between">
            <span>■ 사례관리 종결보고서 (초기사정 대비 변화 평가)</span>
            <span className="text-rose-700 dark:text-rose-300 font-bold">종결유형: 이관 / 전출</span>
          </h4>

          {/* Before & After Comparison Table */}
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-[#251E1A] border-b text-stone-600 dark:text-stone-400">
                <th className="p-2 border-r w-28">평가 영역</th>
                <th className="p-2 border-r text-left w-1/2">초기 개입 당시 상태</th>
                <th className="p-2 text-left">종결 시점 변화 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">1. 신체/건강</td>
                <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                  만성 관절염으로 식사 준비 곤란, 잦은 결식 및 영양 결핍 상태.
                </td>
                <td className="p-2 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                  주 2회 정기 영양 밑반찬 제공으로 기력 회복 및 규칙적 식습관 정착.
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">2. 정서/심리</td>
                <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                  배우자 사별 후 독거로 인한 극심한 우울감(SGDS 15점) 및 사회적 고립.
                </td>
                <td className="p-2 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                  주 1회 방문 말벗상담 및 생신잔치 지원으로 우울감 대폭 경감.
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-stone-50 dark:bg-[#251E1A] border-r font-semibold">3. 주거/안전</td>
                <td className="p-2 border-r text-left text-stone-600 dark:text-stone-400">
                  계단 및 화장실 내 낙상 위험 존재, 방충망 파손.
                </td>
                <td className="p-2 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                  안전손잡이 설치 및 방충망 교체 지원으로 안전한 주거환경 확보.
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <label className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
              사회복지사 종합 종결 소견
            </label>
            <textarea
              rows={2}
              disabled={readOnly}
              value={fields.terminationWorkerOpinion || '초기 수립된 단기 목표(영양개선, 우울감 완화, 주거안전)를 성공적으로 달성하였으며, 대상자의 거주지 이전에 따라 관할 성당노인복지센터로 안전하게 이관 연계 종결함.'}
              onChange={(e) => onSpecificChange('terminationWorkerOpinion', e.target.value)}
              className="w-full p-2.5 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-[#251E1A] leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 3. 사례평가서 (Page 22) */}
      {(tab === 'evaluation' || window.matchMedia?.('print')?.matches) && (
        <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-5 bg-white dark:bg-[#1E1916] space-y-4 text-xs">
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2 flex items-center justify-between">
            <span>■ 5단계 목표달성 사례평가서</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">
              목표 달성도: 90% 이상 (성공적 개입)
            </span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 dark:bg-[#251E1A] rounded border space-y-2">
              <h5 className="font-bold text-emerald-700 dark:text-emerald-400">긍정적 효과 및 성과</h5>
              <p className="leading-relaxed text-stone-600 dark:text-stone-400">
                • 결식 없는 안정적 식생활 영양 개선<br />
                • 정서적 지지망 강화를 통한 사회적 고립감 해소<br />
                • 공공 및 민간 안전망 상호 연계 체계 구축
              </p>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-[#251E1A] rounded border space-y-2">
              <h5 className="font-bold text-amber-700 dark:text-amber-400">한계점 및 향후 제언</h5>
              <p className="leading-relaxed text-stone-600 dark:text-stone-400">
                • 만성 관절염으로 인한 보행 불편은 지속되므로 이관 기관에서의 지속적인 병원동행 서비스 연계 필요
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
