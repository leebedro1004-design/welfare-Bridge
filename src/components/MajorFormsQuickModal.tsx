import React, { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Users,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  HeartHandshake
} from 'lucide-react';
import { ClientProfile, DocumentType } from '../types';
import { DOCUMENT_TYPE_LABELS, ORDERED_DOC_TYPES } from '../utils/documentTemplates';

interface MajorFormsQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  onSelectFormAndClient: (docType: DocumentType, client?: ClientProfile) => void;
}

interface FormQuickItem {
  type: DocumentType;
  lawNumber: string;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
  freq: '자주 사용' | '필수 법정' | '정기 평가';
}

export const MAJOR_LEGAL_FORMS: FormQuickItem[] = [
  {
    type: 'case_conference',
    lawNumber: '별지 제4호',
    title: '사례회의록 (Case Conference)',
    badge: '★ 최고 빈도',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    desc: '어르신 위기도 판정, 맞춤형 서비스 개입 전략 및 다학제 내부 사례회의 결과 기록',
    freq: '자주 사용',
  },
  {
    type: 'service_plan',
    lawNumber: '별지 제5호',
    title: '서비스 계획서 (Service Plan)',
    badge: '★ 최고 빈도',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    desc: '식사배달, 안전확인, 주거개선, 병원동행 등 4대 서비스 지원 목표 및 세부 일정 수립',
    freq: '자주 사용',
  },
  {
    type: 'intake',
    lawNumber: '별지 제1호',
    title: '초기면접지 (Intake)',
    badge: '첫 방문 필수',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    desc: '신규 대상자 인적사항, 기초연금·수급구분, 주거환경 및 초기 긴급호소 내용 기록',
    freq: '필수 법정',
  },
  {
    type: 'assessment',
    lawNumber: '별지 제2호',
    title: '사정기록지 (Assessment & 척도)',
    badge: '심층 사정',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
    desc: '신체기능, 영양/식사, 정신건강, 주거안전, ADL/IADL, SGDS 15문항 우울척도 종합 사정',
    freq: '필수 법정',
  },
  {
    type: 'scoring',
    lawNumber: '별지 제3호',
    title: '대상자 선정기준표 (Scoring)',
    badge: '선정 심사',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
    desc: '경제기능(수급/주택), 건강기능(신체/정서/장애/요양등급), 재량점수 및 총점 판정',
    freq: '필수 법정',
  },
  {
    type: 'agreement',
    lawNumber: '별지 제6호',
    title: '서비스 이용 동의서 및 승낙서',
    badge: '권익 보호',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
    desc: '개인정보 수집·이용·제공 승낙서 및 서비스 권리·의무 이용 계약 동의서',
    freq: '필수 법정',
  },
  {
    type: 'monitoring',
    lawNumber: '별지 제7호',
    title: '모니터링 기록지 (Monitoring)',
    badge: '정기 점검',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300',
    desc: '월별 서비스 제공 점검, 생활실태 변화 및 만족도 모니터링 기록부',
    freq: '자주 사용',
  },
  {
    type: 'reassessment',
    lawNumber: '별지 제8호',
    title: '재사정 기록지 (Re-assessment)',
    badge: '정기 재사정',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
    desc: '서비스 제공 6개월/1년 주기 상태 변화 및 지속 지원 필요성 재평가',
    freq: '정기 평가',
  },
  {
    type: 'termination',
    lawNumber: '별지 제9호',
    title: '종결보고서 및 사례평가서',
    badge: '종결/평가',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
    desc: '목표 달성도 평가, 시설 입소·사망·전출 등으로 인한 사례 종결 및 사후관리',
    freq: '정기 평가',
  },
  {
    type: 'referral',
    lawNumber: '별지 제10호',
    title: '서비스 연계 및 의뢰서',
    badge: '지역 자원',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
    desc: '지역사회 보건소, 복지관, 주민센터 및 전문의료기관 외부 자원 연계/의뢰서',
    freq: '자주 사용',
  },
];

export const MajorFormsQuickModal: React.FC<MajorFormsQuickModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSelectFormAndClient,
}) => {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('case_conference');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  if (!isOpen) return null;

  const handleLaunch = () => {
    const targetClient = clients.find((c) => c.id === selectedClientId) || clients[0];
    onSelectFormAndClient(selectedDocType, targetClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1916] rounded-3xl border border-stone-300 dark:border-stone-700 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                주요 법정 서식 빠른 작성 런처
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                보건복지부 노인보건복지사업안내 표준 10대 서식 원클릭 즉시 작성
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select Elder */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              1. 서식을 작성할 대상 어르신 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {clients.map((c) => {
                const isSelected = selectedClientId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClientId(c.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{c.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          c.riskLevel.includes('고')
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {c.riskLevel}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 truncate mt-1">
                      만 {c.age}세 · {c.livingType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Legal Form */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              2. 작성할 주요 법정 서식 선택 (원클릭)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAJOR_LEGAL_FORMS.map((form) => {
                const isSelected = selectedDocType === form.type;
                return (
                  <div
                    key={form.type}
                    onClick={() => setSelectedDocType(form.type)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                          {form.lawNumber}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${form.badgeColor}`}>
                          {form.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {form.title}
                      </h4>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                        {form.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold">
                      <span className={isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}>
                        {isSelected ? '✓ 선택됨' : '클릭하여 선택'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 dark:bg-[#181412] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
            선택: <strong className="text-stone-900 dark:text-stone-100">
              {clients.find((c) => c.id === selectedClientId)?.name || '어르신'}
            </strong> · <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {DOCUMENT_TYPE_LABELS[selectedDocType]?.label || selectedDocType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>서식 작성기 바로 열기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
