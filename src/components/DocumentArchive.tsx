import React, { useState } from 'react';
import {
  FolderCheck,
  Search,
  FileText,
  Calendar,
  User,
  Eye,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer
} from 'lucide-react';
import { CaseDocument, DocumentType } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';

interface DocumentArchiveProps {
  documents: CaseDocument[];
  onOpenDocument: (doc: CaseDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({
  documents,
  onOpenDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.includes(searchTerm) ||
      doc.clientName.includes(searchTerm) ||
      doc.author.includes(searchTerm);
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const exportAllAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `재가노인지원_사례관리문서_전체백업_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-amber-600" />
            사례관리 문서 보관함 및 이력 관리 ({documents.length}건)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            어르신별로 작성 및 결재된 초기면접, 종합사정, 사례회의록, 서비스계획서, 모니터링일지를 한눈에 열람합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={exportAllAsJSON}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 shadow-xs cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-amber-700" />
          <span>전체 문서 데이터 백업 (JSON)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="문서 제목, 어르신 성명, 담당 사회복지사 검색"
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">서식 유형:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">전체 7대 서식</option>
            <option value="intake">1. 초기면접지</option>
            <option value="assessment">2. 종합사정기록지</option>
            <option value="case_conference">3. 사례회의록</option>
            <option value="service_plan">4. 서비스제공계획서</option>
            <option value="monitoring">5. 모니터링일지</option>
            <option value="reassessment">6. 재사정표</option>
            <option value="termination">7. 종결보고서</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">결재 상태:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">전체 상태</option>
            <option value="결재완료">결재완료</option>
            <option value="작성완료">작성완료</option>
            <option value="임시저장">임시저장</option>
          </select>
        </div>
      </div>

      {/* Documents Table List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50/80 text-stone-700 border-b border-stone-200 font-bold">
                <tr>
                  <th className="p-3.5">서식 구분</th>
                  <th className="p-3.5">문서 제목</th>
                  <th className="p-3.5">대상 어르신</th>
                  <th className="p-3.5">위기도</th>
                  <th className="p-3.5">작성일시</th>
                  <th className="p-3.5">담당자</th>
                  <th className="p-3.5">결재 상태</th>
                  <th className="p-3.5 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDocs.map((item) => {
                  const typeInfo = DOCUMENT_TYPE_LABELS[item.documentType] || {
                    short: '서식',
                    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
                  };

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                      onClick={() => onOpenDocument(item)}
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeInfo.badgeColor}`}>
                          {typeInfo.short}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.sourceTranscript && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-medium">
                              AI 녹취분석
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-800 font-medium whitespace-nowrap">
                        {item.clientName} 어르신
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            item.riskLevel === '고위험'
                              ? 'bg-rose-100 text-rose-800'
                              : item.riskLevel === '중위험'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.riskLevel || '일반'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500 whitespace-nowrap">
                        {item.createdAt}
                      </td>
                      <td className="p-3.5 text-stone-700 whitespace-nowrap">
                        {item.author}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            item.status === '결재완료'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === '작성완료'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenDocument(item)}
                            className="p-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                            title="서식 열기 및 인쇄"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`'${item.title}' 문서를 삭제하시겠습니까?`)) {
                                onDeleteDocument(item.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-stone-600">조건에 맞는 문서가 없습니다.</p>
            <p className="text-xs text-stone-400 mt-1">상단 '새 상담 녹취 AI 분석'을 통해 새 서식을 생성해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
