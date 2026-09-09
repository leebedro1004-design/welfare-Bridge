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
  Printer,
  Archive,
  CheckSquare,
  Square,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { CaseDocument, ClientProfile, UserSettings } from '../types';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentTemplates';
import { bulkExportDocumentsToZip, triggerFileDownload } from '../utils/documentPdfExporter';

interface DocumentArchiveProps {
  documents: CaseDocument[];
  clients?: ClientProfile[];
  userSettings?: UserSettings;
  onOpenDocument: (doc: CaseDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({
  documents,
  clients = [],
  userSettings,
  onOpenDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Multi-selection state for Bulk PDF Export
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.includes(searchTerm) ||
      doc.clientName.includes(searchTerm) ||
      doc.author.includes(searchTerm);
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Master Checkbox logic
  const isAllFilteredSelected =
    filteredDocs.length > 0 && filteredDocs.every((d) => selectedDocIds.includes(d.id));
  const isSomeFilteredSelected =
    filteredDocs.some((d) => selectedDocIds.includes(d.id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered docs
      setSelectedDocIds((prev) => prev.filter((id) => !filteredDocs.some((d) => d.id === id)));
    } else {
      // Select all filtered docs
      const newIds = new Set(selectedDocIds);
      filteredDocs.forEach((d) => newIds.add(d.id));
      setSelectedDocIds(Array.from(newIds));
    }
  };

  const handleToggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleClearSelection = () => {
    setSelectedDocIds([]);
  };

  // Bulk PDF Export Action
  const handleBulkPdfExport = async () => {
    let targetDocs: CaseDocument[] = [];

    if (selectedDocIds.length > 0) {
      targetDocs = documents.filter((d) => selectedDocIds.includes(d.id));
    } else {
      // If none explicitly selected, offer to export currently filtered documents
      if (filteredDocs.length === 0) {
        setExportErrorMessage('내보낼 문서가 없습니다.');
        setTimeout(() => setExportErrorMessage(null), 4000);
        return;
      }
      const confirmExport = confirm(
        `선택된 문서가 없습니다. 현재 검색/필터된 ${filteredDocs.length}건의 문서를 일괄 PDF(ZIP)로 내보내시겠습니까?`
      );
      if (!confirmExport) return;
      targetDocs = filteredDocs;
    }

    setIsExportingZip(true);
    setExportProgress({ current: 0, total: targetDocs.length });
    setExportErrorMessage(null);

    try {
      const { zipBlob, zipFileName, count } = await bulkExportDocumentsToZip(
        targetDocs,
        clients,
        userSettings,
        (current, total) => {
          setExportProgress({ current, total });
        }
      );

      triggerFileDownload(zipBlob, zipFileName);

      setExportSuccessMessage(
        `총 ${count}건의 표준 서식이 '${zipFileName}' 단일 ZIP 파일로 성공적으로 다운로드되었습니다.`
      );
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error('Bulk PDF Export failed:', err);
      setExportErrorMessage(`일괄 PDF 내보내기 실패: ${err.message || String(err)}`);
      setTimeout(() => setExportErrorMessage(null), 6000);
    } finally {
      setIsExportingZip(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

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
      {/* Header & Action Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-amber-600" />
            사례관리 문서 보관함 및 이력 관리 ({documents.length}건)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            어르신별로 작성 및 결재된 초기면접, 종합사정, 사례회의록, 서비스계획서 등 보건복지부 표준 서식을 일괄 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 📦 Bulk PDF Export Button (User Request) */}
          <button
            id="btn-bulk-pdf-export"
            type="button"
            onClick={handleBulkPdfExport}
            disabled={isExportingZip}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
              selectedDocIds.length > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
            } disabled:opacity-50`}
            title="선택한 서식들을 공식 보건복지부 규격 PDF로 일괄 렌더링하여 하나의 ZIP 압축파일로 다운로드합니다."
          >
            {isExportingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>PDF 일괄 생성 중 ({exportProgress.current}/{exportProgress.total})...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-amber-300" />
                <span>일괄 PDF 내보내기 (ZIP)</span>
                {selectedDocIds.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 font-mono font-bold">
                    {selectedDocIds.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* JSON Backup Button */}
          <button
            type="button"
            onClick={exportAllAsJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 shadow-xs cursor-pointer transition-colors"
            title="전체 문서 메타데이터 및 사정 데이터를 JSON으로 백업합니다."
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>JSON 백업</span>
          </button>
        </div>
      </div>

      {/* Export Notifications */}
      {exportSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {exportErrorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{exportErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
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
              <option value="all">전체 10대 서식</option>
              <option value="intake">1. 초기상담·접수기록지</option>
              <option value="assessment">2. 종합사정표 (Assessment)</option>
              <option value="scoring">3. 사정 척도 검사표</option>
              <option value="case_conference">4. 사례회의록</option>
              <option value="service_plan">5. 서비스제공계획서</option>
              <option value="agreement">6. 이용 및 개인정보 동의서</option>
              <option value="monitoring">7. 모니터링일지</option>
              <option value="reassessment">8. 재사정표 (Re-Assessment)</option>
              <option value="termination">9. 종결보고서</option>
              <option value="referral">10. 외부자원 연계·의뢰서</option>
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

        {/* Selection summary badge */}
        {selectedDocIds.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span>선택됨: <strong>{selectedDocIds.length}</strong>건</span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] text-amber-700 hover:text-amber-900 hover:underline cursor-pointer ml-1"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      {/* Documents Table List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50/80 text-stone-700 border-b border-stone-200 font-bold">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="p-3.5 w-10 text-center">
                    <input
                      id="checkbox-select-all-docs"
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeFilteredSelected;
                        }
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer"
                      title="현재 목록 전체 선택 / 해제"
                    />
                  </th>
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
                  const isSelected = selectedDocIds.includes(item.id);
                  const typeInfo = DOCUMENT_TYPE_LABELS[item.documentType] || {
                    short: '서식',
                    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
                  };

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-50/60' : 'hover:bg-amber-50/30'
                      }`}
                      onClick={() => onOpenDocument(item)}
                    >
                      {/* Row Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectDoc(item.id)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer"
                          title="일괄 PDF 내보내기 대상 선택"
                        />
                      </td>
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
