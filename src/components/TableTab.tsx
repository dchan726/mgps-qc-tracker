import React from 'react';
import { Search, X, ChevronDown, SearchX, Edit3, Trash2 } from 'lucide-react';
import { TuItem, QcStatus } from '../types';
import { GAS_CONFIG, STATUS_MAP, getGasConfig, getStatusConfig } from '../constants';
import { cleanSupplyZone } from '../utils/sanitize';

interface TableTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  groupBy: string;
  setGroupBy: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  filterGas: string[];
  setFilterGas: (val: string[]) => void;
  filterStatus: string[];
  setFilterStatus: (val: string[]) => void;
  filterSupply: string[];
  setFilterSupply: (val: string[]) => void;
  filterTower: string[];
  setFilterTower: (val: string[]) => void;
  openFilterMenu: string | null;
  setOpenFilterMenu: (val: string | null) => void;
  uniqueSupplies: string[];
  uniqueTowers: string[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  groupedData: Record<string, TuItem[]>;
  filteredData: TuItem[];
  handleStatusChange: (id: string, newStatus: QcStatus) => Promise<void>;
  handleRemarkChange: (id: string, newRemark: string) => Promise<void>;
  handleBatchStatus: (newStatus: QcStatus) => Promise<void>;
  handleDeleteItem: (id: string) => Promise<void>;
  onEditItem: (item: TuItem) => void;
}

export const TableTab: React.FC<TableTabProps> = ({
  searchQuery,
  setSearchQuery,
  groupBy,
  setGroupBy,
  sortBy,
  setSortBy,
  filterGas,
  setFilterGas,
  filterStatus,
  setFilterStatus,
  filterSupply,
  setFilterSupply,
  filterTower,
  setFilterTower,
  openFilterMenu,
  setOpenFilterMenu,
  uniqueSupplies,
  uniqueTowers,
  selectedIds,
  setSelectedIds,
  groupedData,
  filteredData,
  handleStatusChange,
  handleRemarkChange,
  handleBatchStatus,
  handleDeleteItem,
  onEditItem,
}) => {
  const toggleMultiFilter = (
    currentArr: string[],
    setFn: (val: string[]) => void,
    item: string
  ) => {
    if (currentArr.includes(item)) {
      setFn(currentArr.filter((i) => i !== item));
    } else {
      setFn([...currentArr, item]);
    }
  };

  const handleSelectAllInGroup = (groupItems: TuItem[], isChecked: boolean) => {
    const groupIds = groupItems.map((i) => i.id);
    if (isChecked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Multi-Select Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋 TU 編號、AVSU 閥箱、病房/設施或缺失備註..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grouping & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 px-1">分組:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-md text-xs px-2 py-1 outline-none font-medium"
              >
                <option value="supply">依 AVSU 閥箱</option>
                <option value="tower">依大樓/座 (Tower)</option>
                <option value="gasType">依氣體種類</option>
                <option value="facility">依設施/病房</option>
                <option value="status">依 QC 狀態</option>
                <option value="none">無分組</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 px-1">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-md text-xs px-2 py-1 outline-none font-medium"
              >
                <option value="tuNo">TU 編號</option>
                <option value="supply">AVSU 閥箱</option>
                <option value="facility">設施名稱</option>
                <option value="status">QC 狀態</option>
              </select>
            </div>
          </div>
        </div>

        {/* Multi-Selection Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">多重篩選:</span>

          {/* Gas Filter Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenFilterMenu(openFilterMenu === 'gas' ? null : 'gas')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                filterGas.length > 0
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>氣體種類 {filterGas.length > 0 && `(${filterGas.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openFilterMenu === 'gas' && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 animate-fadeIn">
                <div className="flex justify-between items-center px-2 py-1 border-b border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-600">氣體種類</span>
                  <button onClick={() => setFilterGas([])} className="text-sky-600 hover:underline">
                    清除
                  </button>
                </div>
                {Object.keys(GAS_CONFIG).map((gKey) => {
                  const cfg = getGasConfig(gKey);
                  const isChecked = filterGas.includes(gKey);
                  return (
                    <label
                      key={gKey}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMultiFilter(filterGas, setFilterGas, gKey)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className={cfg.text}>{cfg.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status Filter Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenFilterMenu(openFilterMenu === 'status' ? null : 'status')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                filterStatus.length > 0
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>QC 狀態 {filterStatus.length > 0 && `(${filterStatus.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openFilterMenu === 'status' && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 animate-fadeIn">
                <div className="flex justify-between items-center px-2 py-1 border-b border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-600">QC 狀態</span>
                  <button onClick={() => setFilterStatus([])} className="text-sky-600 hover:underline">
                    清除
                  </button>
                </div>
                {Object.keys(STATUS_MAP).map((sKey) => {
                  const cfg = getStatusConfig(sKey);
                  const isChecked = filterStatus.includes(sKey);
                  return (
                    <label
                      key={sKey}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMultiFilter(filterStatus, setFilterStatus, sKey)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className={cfg.text}>{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* AVSU Zone Filter Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenFilterMenu(openFilterMenu === 'supply' ? null : 'supply')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                filterSupply.length > 0
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>AVSU 閥箱 {filterSupply.length > 0 && `(${filterSupply.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openFilterMenu === 'supply' && (
              <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn">
                <div className="flex justify-between items-center px-2 py-1 border-b border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-600">AVSU 閥箱</span>
                  <button onClick={() => setFilterSupply([])} className="text-sky-600 hover:underline">
                    清除
                  </button>
                </div>
                {uniqueSupplies.map((sup) => {
                  const isChecked = filterSupply.includes(sup);
                  return (
                    <label
                      key={sup}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs truncate"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMultiFilter(filterSupply, setFilterSupply, sup)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="truncate">{sup}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tower Filter Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenFilterMenu(openFilterMenu === 'tower' ? null : 'tower')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                filterTower.length > 0
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>大樓/座 {filterTower.length > 0 && `(${filterTower.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openFilterMenu === 'tower' && (
              <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 animate-fadeIn">
                <div className="flex justify-between items-center px-2 py-1 border-b border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-600">大樓/座 (Tower)</span>
                  <button onClick={() => setFilterTower([])} className="text-sky-600 hover:underline">
                    清除
                  </button>
                </div>
                {uniqueTowers.map((tw) => {
                  const isChecked = filterTower.includes(tw);
                  return (
                    <label
                      key={tw}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMultiFilter(filterTower, setFilterTower, tw)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>{tw}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Filter Badges */}
          {(filterGas.length > 0 ||
            filterStatus.length > 0 ||
            filterSupply.length > 0 ||
            filterTower.length > 0) && (
            <button
              onClick={() => {
                setFilterGas([]);
                setFilterStatus([]);
                setFilterSupply([]);
                setFilterTower([]);
              }}
              className="text-rose-600 hover:underline text-[11px] ml-auto font-medium"
            >
              重設所有篩選條件
            </button>
          )}
        </div>

        {/* Batch Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-sky-900 text-white p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
            <span className="text-xs font-semibold">
              已勾選 <u className="no-underline text-sky-300 font-bold px-1">{selectedIds.length}</u> 個點位，進行批量操作:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => handleBatchStatus("Pending")}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg font-medium transition"
              >
                設為「未開始」
              </button>
              <button
                onClick={() => handleBatchStatus("Completed")}
                className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg font-medium transition"
              >
                設為「合格完成」
              </button>
              <button
                onClick={() => handleBatchStatus("In Progress")}
                className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-lg font-medium transition"
              >
                設為「檢驗中」
              </button>
              <button
                onClick={() => handleBatchStatus("Defect")}
                className="bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded-lg font-medium transition"
              >
                設為「有缺失」
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition"
              >
                取消選擇
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grouped TUs List Section */}
      {Object.keys(groupedData).length === 0 || filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-700">未找到符合條件的點位</h3>
          <p className="text-xs text-slate-400">請嘗試調整搜尋關鍵字或清除篩選條件。</p>
        </div>
      ) : (
        Object.entries(groupedData).map(([groupTitle, groupItems]) => {
          const groupCompleted = groupItems.filter((i) => i.status === "Completed").length;
          const groupRate = Math.round((groupCompleted / groupItems.length) * 100);
          const allInGroupSelected = groupItems.every((i) => selectedIds.includes(i.id));

          return (
            <div
              key={groupTitle}
              className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
            >
              {/* Group Title Bar */}
              <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={allInGroupSelected && groupItems.length > 0}
                    onChange={(e) => handleSelectAllInGroup(groupItems, e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-bold text-slate-800 text-sm">{groupTitle}</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    {groupItems.length} 個點位
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-xs text-slate-500 font-medium">
                    合格率:{" "}
                    <strong className="text-emerald-700 font-bold">{groupRate}%</strong> (
                    {groupCompleted}/{groupItems.length})
                  </div>
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2" style={{ width: `${groupRate}%` }}></div>
                  </div>
                </div>
              </div>

              {/* TUs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="p-3 w-8 text-center">選取</th>
                      <th className="p-3">TU 編號 (Terminal Unit)</th>
                      <th className="p-3">氣體種類</th>
                      <th className="p-3">AVSU 閥箱區域</th>
                      <th className="p-3">設施 / 病房 Description</th>
                      <th className="p-3">SoA 編號</th>
                      <th className="p-3">QC 狀態</th>
                      <th className="p-3">缺失備註 / 檢驗紀錄</th>
                      <th className="p-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupItems.map((item) => {
                      const gasCfg = getGasConfig(item.gasType);
                      const statusCfg = getStatusConfig(item.status);
                      const isChecked = selectedIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition ${isChecked ? "bg-sky-50/50" : ""}`}
                        >
                          {/* Selection Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds((prev) => [...prev, item.id]);
                                else setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                              }}
                              className="rounded text-sky-600 focus:ring-sky-500"
                            />
                          </td>

                          {/* TU No. */}
                          <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.tuNo}
                          </td>

                          {/* Gas Type Badge */}
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${gasCfg.badge}`}
                            >
                              {gasCfg.name}
                            </span>
                          </td>

                          {/* Supply AVSU */}
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            {cleanSupplyZone(item.supply, item.tuNo)}
                          </td>

                          {/* Facility Description */}
                          <td className="p-3 text-slate-700 font-medium">
                            {item.facility || "—"}
                          </td>

                          {/* SoA Item Code */}
                          <td className="p-3 font-mono text-slate-500 text-[11px]">
                            {item.soaItem || "—"}
                          </td>

                          {/* Status Selector */}
                          <td className="p-3 whitespace-nowrap">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as QcStatus)}
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${statusCfg.badgeBg} ${statusCfg.border}`}
                            >
                              <option value="Pending">未開始</option>
                              <option value="In Progress">檢驗中</option>
                              <option value="Completed">已合格完成</option>
                              <option value="Defect">有缺失/需跟進</option>
                            </select>
                          </td>

                          {/* Remark Field */}
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="新增檢驗備註或缺失細節..."
                              value={item.remark || ""}
                              onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-slate-300 rounded px-2 py-1 text-xs outline-none transition"
                            />
                          </td>

                          {/* Edit & Delete Action Buttons */}
                          <td className="p-3 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1 text-slate-400 hover:text-sky-600 transition rounded hover:bg-slate-100"
                              title="編輯點位詳細資訊"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition rounded hover:bg-slate-100"
                              title="刪除此點位"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
