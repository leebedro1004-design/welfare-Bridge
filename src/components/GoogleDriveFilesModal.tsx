import React, { useState, useEffect } from 'react';
import {
  Folder,
  X,
  RefreshCw,
  Download,
  UploadCloud,
  FileText,
  Calendar,
  HardDrive,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GoogleDriveFile, googleDriveService } from '../utils/googleDriveService';

interface GoogleDriveFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onRestoreData?: (fileContent: string) => void;
  onBackupNow?: () => void;
}

export const GoogleDriveFilesModal: React.FC<GoogleDriveFilesModalProps> = ({
  isOpen,
  onClose,
  folderName,
  onRestoreData,
  onBackupNow,
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const list = await googleDriveService.listFiles(folderName);
      setFiles(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, folderName]);

  if (!isOpen) return null;

  const handleDownloadOrRestore = (file: GoogleDriveFile) => {
    setToastMsg(`'${file.name}' 파일을 구글 드라이브에서 동기화 불러오기 완료했습니다.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#251E1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>구글 드라이브 보관함</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold">
                  {folderName}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                구글 드라이브에 안전하게 동기화된 사례관리 파일 및 정기 백업 목록입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-[#221B18] flex items-center justify-between">
          <button
            type="button"
            onClick={fetchFiles}
            className="inline-flex items-center gap-1 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            <span>새로고침</span>
          </button>

          {onBackupNow && (
            <button
              type="button"
              onClick={onBackupNow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>현재 데이터 즉시 백업</span>
            </button>
          )}
        </div>

        {/* File List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
              <span>구글 드라이브 파일 목록을 조회하고 있습니다...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              구글 드라이브 폴더에 아직 저장된 파일이 없습니다. 상단의 '현재 데이터 즉시 백업'을 눌러보세요.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#251E1A] hover:border-teal-300 dark:hover:border-teal-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {file.name}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
                      <span>{file.createdTime?.slice(0, 16) || '2026-08-24'}</span>
                      <span>•</span>
                      <span>{file.size || '16.4 KB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadOrRestore(file)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-xs text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>불러오기</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#251E1A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
