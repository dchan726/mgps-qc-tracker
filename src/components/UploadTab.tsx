import React from 'react';
import { FileUp, UploadCloud } from 'lucide-react';

interface UploadTabProps {
  isParsing: boolean;
  parseLogs: string[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  isParsing,
  parseLogs,
  onFileUpload,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
      <div>
        <h2 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <FileUp className="w-5 h-5 text-sky-600" />
          <span>批量匯入圖紙 PDF 檔案 (Batch PDF Parser)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          系統自動解析 PDF 文字層，提取 AVSU 控制箱編號、樓層、設施病房與所有 Terminal Unit (TU) 項目並即時同步至雲端。
        </p>
      </div>

      {/* File Dropzone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-8 text-center transition bg-slate-50/50 hover:bg-sky-50/30">
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={onFileUpload}
          className="hidden"
          id="pdf-upload-input"
          disabled={isParsing}
        />
        <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-3 block">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <span className="text-sm font-bold text-sky-700">點擊選擇多份 PDF 檔案</span>
            <span className="text-xs text-slate-500 block mt-1">或直接拖曳 PDF 檔案至此處</span>
          </div>
          <span className="inline-block bg-white text-slate-500 border border-slate-200 px-3 py-1 rounded-lg text-xs font-medium">
            支援多檔同時解析 (NAH Gas Outlet Number Lists)
          </span>
        </label>
      </div>

      {/* Parsing Status & Log Console */}
      {parseLogs.length > 0 && (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>解析控制台輸出 (Console Logs)</span>
            {isParsing && <span className="text-sky-400 animate-pulse">處理中...</span>}
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
            {parseLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("錯誤")
                    ? "text-rose-400"
                    : log.includes("成功") || log.includes("雲端同步")
                    ? "text-emerald-400 font-bold"
                    : "text-slate-300"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
