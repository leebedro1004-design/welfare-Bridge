import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  ShieldAlert,
  Lightbulb,
  Building2,
  PhoneCall,
  Compass,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ClientProfile } from '../types';

interface SupervisionAdvisorProps {
  clients: ClientProfile[];
}

export const SupervisionAdvisor: React.FC<SupervisionAdvisorProps> = ({ clients }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [dilemmaText, setDilemmaText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [supervisionAdvice, setSupervisionAdvice] = useState<string | null>(null);

  const QUICK_PROMPTS = [
    {
      label: '서비스 거부 및 문전박대 대응',
      query: '어르신이 자존심 때문에 반찬 배달과 복지관 방문을 극구 거부하시며 문을 열어주지 않으십니다. 라포 형성 및 거부감 완화를 위한 단계별 접근법과 가족/이웃 연계 팁을 알려주세요.',
    },
    {
      label: '장기요양 등급 신청 vs 재가유지 경계 판정',
      query: '어르신의 인지기능 저하와 보행불안이 급격히 심해지고 있습니다. 장기요양보험 1~5등급 신청 시기와 등급 인정 전까지 재가노인지원서비스의 안전망 공백 방지 전략을 제시해 주세요.',
    },
    {
      label: '자녀와의 연락 두절 및 방임 의심',
      query: '자녀가 부양의무를 기피하고 경제적 지원 및 연락을 일절 하지 않아 어르신이 극심한 우울감과 결식 상태에 놓여있습니다. 위기 긴급복지 지원 및 정서적 고립 해소 방안은 무엇인가요?',
    },
    {
      label: '낙상 고위험 주거환경 개선 자원연계',
      query: '화장실 문턱이 높고 미끄럼 사고가 반복되나 전월세 임대인이 공사를 꺼려합니다. 임대인 설득 논리와 지자체/민간 비파괴식 주거편의지원 자원연계 프로세스를 알려주세요.',
    },
  ];

  const handleConsultSupervision = async (queryText?: string) => {
    const textToSend = queryText || dilemmaText;
    if (!textToSend.trim()) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const clientSummary = selectedClient
      ? `${selectedClient.name} (${selectedClient.age}세, ${selectedClient.gender}, ${selectedClient.livingType}, ${selectedClient.welfareType}, ${selectedClient.longTermCareStatus}, 질환: ${selectedClient.chronicDiseases.join(', ')})`
      : '일반 재가노인지원 대상 어르신';

    setIsGenerating(true);
    setSupervisionAdvice(null);

    try {
      const response = await fetch('/api/ai/case-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSummary,
          currentDilemma: textToSend,
        }),
      });

      const data = await response.json();
      if (data.success && data.advice) {
        setSupervisionAdvice(data.advice);
      } else {
        throw new Error(data.error || '슈퍼비전 생성 실패');
      }
    } catch (err: any) {
      console.error(err);
      setSupervisionAdvice('슈퍼비전 자문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#382D26] via-[#2F2520] to-[#251D19] rounded-2xl p-6 text-white shadow-md border border-[#52443C]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium mb-3 border border-amber-400/30">
            <Bot className="w-3.5 h-3.5" />
            <span>사회복지사 AI 슈퍼비전 & 실무 코칭</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight mb-2 text-stone-100">
            복잡한 사례관리 딜레마 및 민관 복지자원 연계 맞춤형 자문
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            서비스 거부, 가족 방임, 치매 의심, 장기요양 등급 신청 경계 등 현장에서 마주치는 어려운 복지 문제에 대해 
            사회복지 실천론과 대한민국 노인복지 지침에 입각한 전문 슈퍼비전 조언을 실시간 제공합니다.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                사례 대상 어르신 선택
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs font-medium rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age}세, {c.livingType} / {c.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                현장 딜레마 / 슈퍼비전 요청 내용
              </label>
              <textarea
                rows={5}
                value={dilemmaText}
                onChange={(e) => setDilemmaText(e.target.value)}
                placeholder="예: 어르신이 식사를 거의 못 하시는데 반찬 지원을 타인의 동정이라 생각하고 거부하십니다. 어떻게 설득하고 라포를 형성해야 할까요?"
                className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
              />
            </div>

            <button
              type="button"
              disabled={isGenerating || !dilemmaText.trim()}
              onClick={() => handleConsultSupervision()}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isGenerating || !dilemmaText.trim()
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-amber-700 hover:bg-amber-600 shadow-sm'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>슈퍼바이저 조언 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>전문 슈퍼비전 조언 받기</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Dilemma Topic Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              자주 발생하는 현장 딜레마 빠른 질문
            </h4>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDilemmaText(p.query);
                    handleConsultSupervision(p.query);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-xs transition-colors cursor-pointer group shadow-xs"
                >
                  <div className="font-bold text-stone-800 group-hover:text-amber-900">
                    • {p.label}
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {p.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Advice & Guidelines (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {supervisionAdvice ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-700" />
                  <h3 className="text-sm font-bold text-stone-900">
                    사례관리 슈퍼비전 & 실무 가이드라인
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                  전문가 자문 완료
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans bg-stone-50 p-4 rounded-xl border border-stone-200">
                {supervisionAdvice}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 shadow-xs text-center text-stone-500 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-700 mb-1">
                사례관리 슈퍼비전 준비 중
              </h4>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed mb-4">
                어르신 사례를 선택하고 고민 사항을 입력하시거나, 좌측 '자주 발생하는 딜레마' 버튼을 클릭해 보세요.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left text-[11px] text-stone-600 max-w-md w-full">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-800 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    민관 복지자원 연계
                  </div>
                  <div>보건소, 치매안심센터, 주거복지, 민간후원 연계 매뉴얼</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-800 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    실천윤리 & 라포형성
                  </div>
                  <div>어르신 자기결정권 존중 및 강점 관점 실무 기법</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
