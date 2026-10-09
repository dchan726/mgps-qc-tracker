import React from 'react';
import { Activity, PlusCircle, Download, RotateCcw, PieChart, ListChecks, FileUp } from 'lucide-react';

interface HeaderProps {
  isSyncing: boolean;
  isCloudConnected: boolean;
  activeTab: 'dashboard' | 'table' | 'upload';
  setActiveTab: (tab: 'dashboard' | 'table' | 'upload') => void;
  filteredCount: number;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSyncing,
  isCloudConnected,
  activeTab,
  setActiveTab,
  filteredCount,
  onOpenAddModal,
  onExportCsv,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2 rounded-xl text-white font-bold shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg leading-snug tracking-wide">
                  MGPS 醫療氣體終端組件 (TU) 檢測系統
                </h1>
                {isSyncing ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                    <span>同步中...</span>
                  </span>
                ) : isCloudConnected ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    <span>雲端實時同步</span>
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-300 border border-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                    本機數據模式
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Medical Gas Pipeline System QC Inspection Tracker & Analytics
              </p>
            </div>
          </div>

          {/* Toolbar Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>新增點位</span>
            </button>

            <button
              onClick={onExportCsv}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="匯出完整 QC 報告成 CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">匯出 Excel/CSV</span>
            </button>

            <button
              onClick={onResetData}
              className="flex items-center space-x-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-800/50 transition"
              title="重設所有測試數據"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">重設</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-t border-slate-800 pt-2 pb-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "dashboard"
                ? "border-sky-400 text-sky-400 bg-slate-800/60 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>進度分析 Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "table"
                ? "border-sky-400 text-sky-400 bg-slate-800/60 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>終端組件清單與 QC 紀錄</span>
            <span className="bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-sky-800">
              {filteredCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "upload"
                ? "border-sky-400 text-sky-400 bg-slate-800/60 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>匯入多份 PDF 檔案</span>
          </button>
        </div>
      </div>
    </header>
  );
};
