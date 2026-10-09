import { TuItem, QcStatus } from '../types';
import { STATUS_MAP } from '../constants';

export const sanitizeItem = (item: any): TuItem | null => {
  if (!item || typeof item !== 'object') return null;
  const status: QcStatus = STATUS_MAP[item.status as QcStatus] ? (item.status as QcStatus) : 'Pending';
  return {
    id: String(item.id || `TU-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`),
    fileName: String(item.fileName || ''),
    floor: String(item.floor || ''),
    supply: String(item.supply || ''),
    gasType: String(item.gasType || 'OXY').toUpperCase(),
    soaItem: String(item.soaItem || ''),
    facility: String(item.facility || ''),
    tuNo: String(item.tuNo || ''),
    nistNo: String(item.nistNo || ''),
    lineValveNo: String(item.lineValveNo || ''),
    status: status,
    remark: String(item.remark || ''),
    updatedAt: String(item.updatedAt || new Date().toISOString())
  };
};

export const cleanSupplyZone = (supply = "", tuNo = ""): string => {
  const tuStr = String(tuNo || "").trim();
  const supplyStr = String(supply || "").trim();

  const tuAvsuMatch = tuStr.match(/([A-Z0-9/]+F\/)?(AVSU[\s_/-]*\d+[A-Z]?)/i);
  if (tuAvsuMatch) {
    const prefix = tuAvsuMatch[1] ? tuAvsuMatch[1] : "";
    const avsuPart = tuAvsuMatch[2].replace(/[\s_/-]+/g, " ").toUpperCase();
    return `${prefix}${avsuPart}`.trim();
  }

  let str = supplyStr || tuStr;
  if (!str) return "未分類 AVSU 閥箱";

  if (str.match(/\/TU\//i)) {
    str = str.split(/\/TU\//i)[0];
  }

  str = str.replace(/\/(OXY|VAC|MA4|SA7|N2O|CO2|ΟΧΥ)\//gi, "/");
  str = str.replace(/\/+/g, "/").replace(/\/$/, "");

  const match = str.match(/([A-Z0-9/]+F\/)?(AVSU[\s_/-]*\d+[A-Z]?)/i);
  if (match) {
    const prefix = match[1] ? match[1] : "";
    const avsuPart = match[2].replace(/[\s_/-]+/g, " ").toUpperCase();
    return `${prefix}${avsuPart}`.trim();
  }

  return str.trim() || "未分類 AVSU 閥箱";
};

export const extractTower = (supply = "", tuNo = "", floor = ""): string => {
  const combined = `${String(tuNo || '')} ${String(supply || '')} ${String(floor || '')}`;
  const match = combined.match(/\b(T\d+|Tower\s*\d+|Block\s*[A-Z0-9]+)\b/i);
  if (match) {
    let res = match[1].toUpperCase().replace(/\s+/, " ");
    if (res.startsWith("TOWER")) res = res.replace("TOWER", "T");
    return res;
  }
  return "其他 / 未指定大樓";
};
