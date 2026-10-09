import { GasConfigItem, StatusConfigItem, QcStatus } from '../types';

export const GAS_CONFIG: Record<string, GasConfigItem> = {
  OXY: { name: "氧氣 (O2)", bg: "bg-emerald-600", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  VAC: { name: "負壓吸引 (VAC)", bg: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-900 border-amber-300" },
  MA4: { name: "醫療空氣 (MA4)", bg: "bg-sky-600", text: "text-sky-700", badge: "bg-sky-100 text-sky-800 border-sky-300" },
  SA7: { name: "器械空氣 (SA7)", bg: "bg-indigo-600", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  N2O: { name: "笑氣 (N2O)", bg: "bg-blue-600", text: "text-blue-700", badge: "bg-blue-100 text-blue-800 border-blue-300" },
  CO2: { name: "二氧化碳 (CO2)", bg: "bg-slate-600", text: "text-slate-700", badge: "bg-slate-100 text-slate-800 border-slate-300" }
};

export const getGasConfig = (gasType: string): GasConfigItem => {
  const code = String(gasType || "").toUpperCase();
  return GAS_CONFIG[code] || {
    name: gasType || "其他氣體",
    bg: "bg-slate-600",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-800 border-slate-300"
  };
};

export const STATUS_MAP: Record<QcStatus, StatusConfigItem> = {
  Pending: { label: "未開始", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", badgeBg: "bg-slate-100 text-slate-700" },
  "In Progress": { label: "檢驗中", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", badgeBg: "bg-amber-100 text-amber-800" },
  Completed: { label: "已合格完成", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", badgeBg: "bg-emerald-100 text-emerald-800" },
  Defect: { label: "有缺失/需跟進", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", badgeBg: "bg-rose-100 text-rose-800" }
};

export const getStatusConfig = (status: QcStatus | string): StatusConfigItem => {
  return (STATUS_MAP as Record<string, StatusConfigItem>)[status] || STATUS_MAP.Pending;
};

export const STORAGE_KEY = "mgps_qc_data_v5";
