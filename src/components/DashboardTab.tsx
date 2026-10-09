import React from 'react';
import { LayoutGrid, Database, AlertCircle, ArrowRight } from 'lucide-react';
import { GroupingAnalysisResult, GroupAnalysisItem } from '../types';
import { getGasConfig, STATUS_MAP } from '../constants';

interface DashboardTabProps {
  groupingAnalysis: GroupingAnalysisResult;
  dashboardGroupBy: string;
  setDashboardGroupBy: (val: string) => void;
  dashboardSort: string;
  setDashboardSort: (val: string) => void;
  onNavigateToGroup: (group: GroupAnalysisItem) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  groupingAnalysis,
  dashboardGroupBy,
  setDashboardGroupBy,
  dashboardSort,
  setDashboardSort,
  onNavigateToGroup,
}) => {
  return (
    <div className="space-y-6">
      {/* Grouping Analysis Control Panel */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <LayoutGrid className="w-5 h-5 text-sky-600" />
              <span>進度統計分析 (Progress Breakdown Analytics)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              自訂分析維度與排序方式以找出進度落後或缺失集中的區域
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Grouping Dimension Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
              <button
                onClick={() => setDashboardGroupBy("supply")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dashboardGroupBy === "supply"
                    ? "bg-white text-sky-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                依 AVSU 閥箱
              </button>
              <button
                onClick={() => setDashboardGroupBy("tower")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dashboardGroupBy === "tower"
                    ? "bg-white text-sky-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                依大樓/座 (Tower)
              </button>
              <button
                onClick={() => setDashboardGroupBy("gasType")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dashboardGroupBy === "gasType"
                    ? "bg-white text-sky-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                依氣體種類
              </button>
              <button
                onClick={() => setDashboardGroupBy("facility")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dashboardGroupBy === "facility"
                    ? "bg-white text-sky-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                依設施/病房
              </button>
              <button
                onClick={() => setDashboardGroupBy("status")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dashboardGroupBy === "status"
                    ? "bg-white text-sky-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                依 QC 狀態
              </button>
            </div>

            {/* Sorting Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">排序:</span>
              <select
                value={dashboardSort}
                onChange={(e) => setDashboardSort(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="total_desc">點位數量 (多 → 少)</option>
                <option value="total_asc">點位數量 (少 → 多)</option>
                <option value="passRate_desc">合格率 (高 → 低)</option>
                <option value="passRate_asc">合格率 (低 → 高)</option>
                <option value="defect_desc">缺失數量 (多 → 少)</option>
                <option value="name_asc">區域名稱 (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* High Level Analytical Insights Bar */}
        {groupingAnalysis.totalGroups > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-slate-600">
                分析群組總數: <strong className="text-sky-800">{groupingAnalysis.totalGroups} 個組</strong>
              </span>
              <span className="text-slate-500">
                平均合格率: <strong className="text-sky-800">{groupingAnalysis.avgPassRate}%</strong>
              </span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-slate-600">最佳進度群組:</span>
              <span className="font-semibold text-emerald-800 truncate max-w-[150px]">
                {groupingAnalysis.topGroup
                  ? `${groupingAnalysis.topGroup.name} (${groupingAnalysis.topGroup.passRate}%)`
                  : '無'}
              </span>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-slate-600">缺失最多群組:</span>
              <span className="font-semibold text-rose-800 truncate max-w-[150px]">
                {groupingAnalysis.defectGroup && groupingAnalysis.defectGroup.defect > 0
                  ? `${groupingAnalysis.defectGroup.name} (${groupingAnalysis.defectGroup.defect} 缺失)`
                  : '目前無缺失'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Group Cards List */}
      {groupingAnalysis.groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-700">尚未有任何測試資料</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            您可以切換至「匯入多份 PDF 檔案」頁籤匯入現場圖紙清單，或是點擊上方「新增點位」按鈕。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupingAnalysis.groups.map((group) => (
            <div
              key={group.name}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between hover:border-sky-300 transition"
            >
              <div>
                {/* Group Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{group.name}</h3>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {Array.from(group.gases).map((g) => {
                        const cfg = getGasConfig(g);
                        return (
                          <span
                            key={g}
                            className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${cfg.badge}`}
                          >
                            {g}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                    {group.total} 個點
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">合格完成率</span>
                    <span className="font-bold text-emerald-700">{group.passRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-emerald-500 h-2" style={{ width: `${group.passRate}%` }}></div>
                    <div
                      className="bg-amber-400 h-2"
                      style={{ width: `${group.total > 0 ? (group.inProgress / group.total) * 100 : 0}%` }}
                    ></div>
                    <div
                      className="bg-rose-500 h-2"
                      style={{ width: `${group.total > 0 ? (group.defect / group.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Counts Breakdown Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center my-3 text-[11px]">
                  <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-emerald-600">合格</div>
                    <div className="font-bold text-xs">{group.completed}</div>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-1.5 rounded-lg border border-amber-100">
                    <div className="text-[10px] text-amber-600">進行中</div>
                    <div className="font-bold text-xs">{group.inProgress}</div>
                  </div>
                  <div className="bg-rose-50 text-rose-800 p-1.5 rounded-lg border border-rose-100">
                    <div className="text-[10px] text-rose-600">缺失</div>
                    <div className="font-bold text-xs">{group.defect}</div>
                  </div>
                  <div className="bg-slate-50 text-slate-700 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">未開始</div>
                    <div className="font-bold text-xs">{group.pending}</div>
                  </div>
                </div>

                {/* Defect Preview Section */}
                {group.defectsList.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-100 bg-rose-50/40 p-2.5 rounded-lg">
                    <div className="text-[11px] font-bold text-rose-800 flex items-center space-x-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>缺失跟進事項 ({group.defectsList.length}):</span>
                    </div>
                    <ul className="space-y-1">
                      {group.defectsList.slice(0, 2).map((def, idx) => (
                        <li key={idx} className="text-[10px] text-rose-700 flex justify-between truncate">
                          <span className="font-mono font-semibold">{def.tuNo}:</span>
                          <span className="truncate ml-1">{def.remark || "未備註缺失細節"}</span>
                        </li>
                      ))}
                      {group.defectsList.length > 2 && (
                        <li className="text-[10px] text-rose-500 italic text-right">
                          等共 {group.defectsList.length} 處缺失...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick View Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onNavigateToGroup(group)}
                  className="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-sky-700 hover:text-sky-800 rounded-lg text-xs font-semibold transition border border-slate-200 hover:border-sky-200 flex items-center justify-center space-x-1"
                >
                  <span>查看詳細點位清單</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
