import React, { useState, useEffect, useMemo } from 'react';
import { TuItem, QcStatus, NotificationToast, GroupAnalysisItem } from './types';
import { STORAGE_KEY, STATUS_MAP, getGasConfig, getStatusConfig } from './constants';
import { sanitizeItem, cleanSupplyZone, extractTower } from './utils/sanitize';
import { exportReportToCsv } from './utils/exportCsv';
import { parsePdfFiles } from './utils/pdfParser';
import { initFirebaseDB, FirebaseOps } from './services/firebase';

import { Header } from './components/Header';
import { KpiOverview } from './components/KpiOverview';
import { DashboardTab } from './components/DashboardTab';
import { TableTab } from './components/TableTab';
import { UploadTab } from './components/UploadTab';
import { AddTuModal } from './components/AddTuModal';
import { EditTuModal } from './components/EditTuModal';
import { Toast } from './components/Toast';

export function App() {
  // Main dataset state loaded from LocalStorage or empty array
  const [data, setData] = useState<TuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(sanitizeItem).filter(Boolean) as TuItem[] : [];
      }
    } catch (e) {
      console.error("Localstorage parse error:", e);
    }
    return [];
  });

  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  // UI Navigation & Control States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'upload'>('dashboard');
  const [dashboardGroupBy, setDashboardGroupBy] = useState("supply");
  const [dashboardSort, setDashboardSort] = useState("total_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-Select Filters
  const [filterGas, setFilterGas] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSupply, setFilterSupply] = useState<string[]>([]);
  const [filterTower, setFilterTower] = useState<string[]>([]);
  const [openFilterMenu, setOpenFilterMenu] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState("supply");
  const [sortBy, setSortBy] = useState("tuNo");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseLogs, setParseLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationToast | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TuItem | null>(null);

  // Form state for manual creation
  const [newTuForm, setNewTuForm] = useState<{
    floor: string;
    supply: string;
    gasType: string;
    soaItem: string;
    facility: string;
    tuNo: string;
    status: QcStatus;
    remark: string;
  }>({
    floor: "Block D (ONCO) - 7/F",
    supply: "T5/7F/AVSU 701",
    gasType: "OXY",
    soaItem: "1.11.1.01",
    facility: "6-Bed Room",
    tuNo: "",
    status: "Pending",
    remark: ""
  });

  // Persistent Storage Effect with error protection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [data]);

  // Auto-correct misclassified CO2 records from PDF imports
  useEffect(() => {
    if (!data.length) return;
    let modified = false;
    const corrected = data.map(item => {
      if (!item) return item;
      const tuUpper = String(item.tuNo || "").toUpperCase();
      const supplyUpper = String(item.supply || "").toUpperCase();
      if ((tuUpper.includes("/CO2/") || supplyUpper.includes("/CO2/") || supplyUpper.includes("CO2")) && item.gasType !== "CO2") {
        modified = true;
        const updated: TuItem = { ...item, gasType: "CO2", updatedAt: new Date().toISOString() };
        FirebaseOps.updateItem(item.id, { gasType: "CO2" }).catch(() => {});
        return updated;
      }
      return item;
    });
    if (modified) {
      setData(corrected);
    }
  }, [data]);

  // Firebase Firestore subscription effect
  useEffect(() => {
    let unsub: (() => void) | null = null;

    initFirebaseDB(
      (cloudData) => {
        const sanitizedCloud = (cloudData || []).map(sanitizeItem).filter(Boolean) as TuItem[];
        setData(sanitizedCloud);
        setIsCloudConnected(true);
        setIsSyncing(false);
      },
      (err) => {
        console.warn("Falling back to local storage due to cloud sync issue:", err);
        setIsCloudConnected(false);
        setIsSyncing(false);
      }
    ).then(unsubscribeFn => {
      if (unsubscribeFn) {
        unsub = unsubscribeFn;
      } else {
        setIsSyncing(false);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!item) return false;
      const tuNo = String(item.tuNo || "");
      const facility = String(item.facility || "");
      const remark = String(item.remark || "");
      const cleanSupply = cleanSupplyZone(item.supply, item.tuNo);
      const tower = extractTower(item.supply, item.tuNo, item.floor);
      const query = searchQuery.toLowerCase().trim();

      const matchSearch = query === "" || 
        tuNo.toLowerCase().includes(query) ||
        facility.toLowerCase().includes(query) ||
        cleanSupply.toLowerCase().includes(query) ||
        tower.toLowerCase().includes(query) ||
        remark.toLowerCase().includes(query);

      const matchGas = filterGas.length === 0 || filterGas.includes(item.gasType);
      const matchStatus = filterStatus.length === 0 || filterStatus.includes(item.status);
      const matchSupply = filterSupply.length === 0 || filterSupply.includes(cleanSupply);
      const matchTower = filterTower.length === 0 || filterTower.includes(tower);

      return matchSearch && matchGas && matchStatus && matchSupply && matchTower;
    }).sort((a, b) => {
      if (sortBy === "tuNo") return String(a.tuNo || "").localeCompare(String(b.tuNo || ""), undefined, { numeric: true });
      if (sortBy === "supply") return cleanSupplyZone(a.supply, a.tuNo).localeCompare(cleanSupplyZone(b.supply, b.tuNo));
      if (sortBy === "facility") return String(a.facility || "").localeCompare(String(b.facility || ""));
      if (sortBy === "status") return String(a.status || "").localeCompare(String(b.status || ""));
      return 0;
    });
  }, [data, searchQuery, filterGas, filterStatus, filterSupply, filterTower, sortBy]);

  const groupedData = useMemo(() => {
    if (groupBy === "none") {
      return { "所有檢測點位 (無分組)": filteredData };
    }

    const groups: Record<string, TuItem[]> = {};
    filteredData.forEach(item => {
      let key = "未分類";
      if (groupBy === "supply") key = cleanSupplyZone(item.supply, item.tuNo);
      else if (groupBy === "tower") key = `大樓/座: ${extractTower(item.supply, item.tuNo, item.floor)}`;
      else if (groupBy === "gasType") key = `氣體種類: ${getGasConfig(item.gasType).name}`;
      else if (groupBy === "facility") key = item.facility || "其他設施區域";
      else if (groupBy === "status") key = `狀態: ${getStatusConfig(item.status).label}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredData, groupBy]);

  const uniqueSupplies = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => {
      if (!d) return;
      const zone = cleanSupplyZone(d.supply, d.tuNo);
      if (zone) set.add(zone);
    });
    return Array.from(set).sort();
  }, [data]);

  const uniqueTowers = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => {
      if (!d) return;
      const tw = extractTower(d.supply, d.tuNo, d.floor);
      if (tw) set.add(tw);
    });
    return Array.from(set).sort();
  }, [data]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(d => d.status === "Completed").length;
    const inProgress = filteredData.filter(d => d.status === "In Progress").length;
    const defect = filteredData.filter(d => d.status === "Defect").length;
    const pending = filteredData.filter(d => d.status === "Pending").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, defect, pending, rate };
  }, [filteredData]);

  const groupingAnalysis = useMemo(() => {
    if (filteredData.length === 0) return { groups: [], topGroup: null, defectGroup: null, avgPassRate: 0, totalGroups: 0 };

    const groupsMap: Record<string, {
      name: string;
      rawKey: string;
      items: TuItem[];
      total: number;
      completed: number;
      inProgress: number;
      defect: number;
      pending: number;
      gases: Set<string>;
      defectsList: TuItem[];
    }> = {};

    filteredData.forEach(item => {
      let key = "未分類";
      if (dashboardGroupBy === "supply") key = cleanSupplyZone(item.supply, item.tuNo);
      else if (dashboardGroupBy === "tower") key = extractTower(item.supply, item.tuNo, item.floor);
      else if (dashboardGroupBy === "gasType") key = getGasConfig(item.gasType).name;
      else if (dashboardGroupBy === "facility") key = item.facility || "其他設施區域";
      else if (dashboardGroupBy === "status") key = getStatusConfig(item.status).label;

      if (!groupsMap[key]) {
        groupsMap[key] = {
          name: key,
          rawKey: (item as any)[dashboardGroupBy] || key,
          items: [],
          total: 0,
          completed: 0,
          inProgress: 0,
          defect: 0,
          pending: 0,
          gases: new Set(),
          defectsList: []
        };
      }

      const g = groupsMap[key];
      g.items.push(item);
      g.total += 1;
      if (item.status === "Completed") g.completed += 1;
      else if (item.status === "In Progress") g.inProgress += 1;
      else if (item.status === "Defect") {
        g.defect += 1;
        g.defectsList.push(item);
      } else g.pending += 1;

      if (item.gasType) g.gases.add(item.gasType);
    });

    let groupsList: GroupAnalysisItem[] = Object.values(groupsMap).map(g => ({
      ...g,
      passRate: g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0,
      defectRate: g.total > 0 ? Math.round((g.defect / g.total) * 100) : 0
    }));

    groupsList.sort((a, b) => {
      if (dashboardSort === "total_desc") return b.total - a.total;
      if (dashboardSort === "total_asc") return a.total - b.total;
      if (dashboardSort === "passRate_desc") return b.passRate - a.passRate;
      if (dashboardSort === "passRate_asc") return a.passRate - b.passRate;
      if (dashboardSort === "defect_desc") return b.defect - a.defect;
      if (dashboardSort === "name_asc") return String(a.name || '').localeCompare(String(b.name || ''), "zh-Hant");
      return b.total - a.total;
    });

    const topGroup = [...groupsList].sort((a, b) => b.passRate - a.passRate)[0] || null;
    const defectGroup = [...groupsList].sort((a, b) => b.defect - a.defect)[0] || null;
    const avgPassRate = Math.round(groupsList.reduce((acc, curr) => acc + curr.passRate, 0) / (groupsList.length || 1));

    return {
      groups: groupsList,
      topGroup,
      defectGroup,
      avgPassRate,
      totalGroups: groupsList.length
    };
  }, [filteredData, dashboardGroupBy, dashboardSort]);

  // Handlers
  const handleStatusChange = async (id: string, newStatus: QcStatus) => {
    setData(prev => prev.map(item => item.id === id ? sanitizeItem({ ...item, status: newStatus, updatedAt: new Date().toISOString() })! : item));
    try {
      await FirebaseOps.updateItem(id, { status: newStatus });
    } catch (e) {
      console.error("Cloud status update failed:", e);
    }
  };

  const handleRemarkChange = async (id: string, newRemark: string) => {
    setData(prev => prev.map(item => item.id === id ? sanitizeItem({ ...item, remark: newRemark, updatedAt: new Date().toISOString() })! : item));
    try {
      await FirebaseOps.updateItem(id, { remark: newRemark });
    } catch (e) {
      console.error("Cloud remark update failed:", e);
    }
  };

  const handleBatchStatus = async (newStatus: QcStatus) => {
    if (selectedIds.length === 0) return;
    const targetIds = [...selectedIds];
    setData(prev => prev.map(item => targetIds.includes(item.id) ? sanitizeItem({ ...item, status: newStatus, updatedAt: new Date().toISOString() })! : item));
    try {
      await FirebaseOps.updateBatchStatus(targetIds, newStatus);
    } catch (e) {
      console.error("Cloud batch update failed:", e);
    }
    showToast(`已批量更新 ${targetIds.length} 個點位狀態為「${getStatusConfig(newStatus).label}」`, "success");
    setSelectedIds([]);
  };

  const handleDeleteItem = async (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    try {
      await FirebaseOps.deleteItem(id);
    } catch (e) {
      console.error("Cloud delete failed:", e);
    }
    showToast("已刪除點位項目", "info");
  };

  const handleAddTuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTuForm.tuNo.trim()) {
      showToast("請輸入 Terminal Unit (TU) 編號", "error");
      return;
    }

    const newItem = sanitizeItem({
      id: `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fileName: "手動新增 (Manual Entry)",
      ...newTuForm,
      updatedAt: new Date().toISOString()
    })!;

    setData(prev => [newItem, ...prev]);
    try {
      await FirebaseOps.saveItem(newItem);
    } catch (e) {
      console.error("Cloud add failed:", e);
    }
    setShowAddModal(false);
    setNewTuForm(prev => ({ ...prev, tuNo: "" }));
    showToast(`成功新增點位 ${newItem.tuNo}`, "success");
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.tuNo.trim()) return;

    const updated = sanitizeItem({ ...editingItem, updatedAt: new Date().toISOString() })!;
    setData(prev => prev.map(item => item.id === editingItem.id ? updated : item));
    try {
      await FirebaseOps.saveItem(updated);
    } catch (e) {
      console.error("Cloud update failed:", e);
    }
    setEditingItem(null);
    showToast(`已更新點位 ${editingItem.tuNo}`, "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsParsing(true);
    setParseLogs(["[系統] 開始解析上傳的 PDF 檔案..."]);

    const newParsedItems = await parsePdfFiles(files, (log) => {
      setParseLogs(prev => [...prev, log]);
    });

    if (newParsedItems.length > 0) {
      const existingTuSet = new Set(data.map(p => p.tuNo));
      const freshItems = newParsedItems.filter(item => !existingTuSet.has(item.tuNo));

      if (freshItems.length > 0) {
        setData(prev => [...prev, ...freshItems]);
        try {
          await FirebaseOps.saveBatch(freshItems);
        } catch (e) {
          console.error("Cloud batch save failed:", e);
        }
        setParseLogs(prev => [...prev, `[雲端同步] 成功將 ${freshItems.length} 個新 TU 點位同步至 Firebase 雲端資料庫！`]);
        showToast(`成功匯入並同步 ${freshItems.length} 個 TU 點位`, "success");
      } else {
        setParseLogs(prev => [...prev, `[提示] 匯入的所有 TU 編號皆已存在，未新增重複項目。`]);
      }
      setActiveTab("table");
    } else {
      setParseLogs(prev => [...prev, `[提示] 未在 PDF 中發現符合格式之 TU 編號。`]);
    }

    setIsParsing(false);
  };

  const handleResetData = async () => {
    const itemsToDelete = [...data];
    setData([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    try {
      await FirebaseOps.clearAll(itemsToDelete);
    } catch (e) {
      console.error("Cloud clear failed:", e);
    }
    showToast("已清空所有點位資料（含雲端資料庫）", "info");
  };

  const handleExportCSV = () => {
    exportReportToCsv(data);
    showToast("已匯出 Excel/CSV QC 進度報告", "success");
  };

  const onNavigateToGroup = (group: GroupAnalysisItem) => {
    if (dashboardGroupBy === "supply") {
      setFilterSupply([group.name]);
      setFilterTower([]);
      setFilterGas([]);
      setFilterStatus([]);
      setSearchQuery("");
      setGroupBy("supply");
    } else if (dashboardGroupBy === "tower") {
      setFilterTower([group.name]);
      setFilterSupply([]);
      setFilterGas([]);
      setFilterStatus([]);
      setSearchQuery("");
      setGroupBy("tower");
    } else if (dashboardGroupBy === "gasType") {
      setFilterGas(Array.from(group.gases));
      setFilterSupply([]);
      setFilterTower([]);
      setFilterStatus([]);
      setSearchQuery("");
      setGroupBy("gasType");
    } else if (dashboardGroupBy === "status") {
      const matchedStatus = Object.keys(STATUS_MAP).filter(k => STATUS_MAP[k as QcStatus].label === group.name);
      setFilterStatus(matchedStatus.length > 0 ? matchedStatus : []);
      setFilterSupply([]);
      setFilterTower([]);
      setFilterGas([]);
      setSearchQuery("");
      setGroupBy("status");
    } else if (dashboardGroupBy === "facility") {
      setSearchQuery(group.name === "未分類" ? "" : group.name);
      setFilterSupply([]);
      setFilterTower([]);
      setFilterGas([]);
      setFilterStatus([]);
      setGroupBy("facility");
    } else {
      setSearchQuery(group.name === "未分類" ? "" : group.name);
    }
    setActiveTab("table");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      <Toast notification={notification} />

      {/* Header Bar */}
      <Header
        isSyncing={isSyncing}
        isCloudConnected={isCloudConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredCount={filteredData.length}
        onOpenAddModal={() => setShowAddModal(true)}
        onExportCsv={handleExportCSV}
        onResetData={handleResetData}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Overall KPI Overview Grid */}
        <KpiOverview stats={stats} />

        {activeTab === "dashboard" && (
          <DashboardTab
            groupingAnalysis={groupingAnalysis}
            dashboardGroupBy={dashboardGroupBy}
            setDashboardGroupBy={setDashboardGroupBy}
            dashboardSort={dashboardSort}
            setDashboardSort={setDashboardSort}
            onNavigateToGroup={onNavigateToGroup}
          />
        )}

        {activeTab === "table" && (
          <TableTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterGas={filterGas}
            setFilterGas={setFilterGas}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterSupply={filterSupply}
            setFilterSupply={setFilterSupply}
            filterTower={filterTower}
            setFilterTower={setFilterTower}
            openFilterMenu={openFilterMenu}
            setOpenFilterMenu={setOpenFilterMenu}
            uniqueSupplies={uniqueSupplies}
            uniqueTowers={uniqueTowers}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            groupedData={groupedData}
            filteredData={filteredData}
            handleStatusChange={handleStatusChange}
            handleRemarkChange={handleRemarkChange}
            handleBatchStatus={handleBatchStatus}
            handleDeleteItem={handleDeleteItem}
            onEditItem={(item) => setEditingItem(item)}
          />
        )}

        {activeTab === "upload" && (
          <UploadTab
            isParsing={isParsing}
            parseLogs={parseLogs}
            onFileUpload={handleFileUpload}
          />
        )}
      </main>

      {/* Add Item Modal */}
      <AddTuModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={newTuForm}
        setForm={setNewTuForm}
        onSubmit={handleAddTuSubmit}
      />

      {/* Edit Record Modal */}
      <EditTuModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        setItem={setEditingItem}
        onSubmit={handleSaveEditItem}
      />
    </div>
  );
}
