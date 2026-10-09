import { TuItem } from '../types';
import { cleanSupplyZone } from './sanitize';
import { getStatusConfig } from '../constants';

export const exportReportToCsv = (data: TuItem[]): void => {
  const headers = [
    "Floor/Location",
    "Supply AVSU Zone",
    "Gas Type",
    "SoA Item Code",
    "Facility Description",
    "Terminal Unit (TU) No.",
    "QC Status",
    "QC Remark / Defect Notes",
    "Source PDF File",
    "Last Updated"
  ];

  const rows = data.map(d => [
    `"${d.floor || ''}"`,
    `"${cleanSupplyZone(d.supply, d.tuNo)}"`,
    `"${d.gasType || ''}"`,
    `"${d.soaItem || ''}"`,
    `"${d.facility || ''}"`,
    `"${d.tuNo || ''}"`,
    `"${getStatusConfig(d.status).label}"`,
    `"${(d.remark || '').replace(/"/g, '""')}"`,
    `"${d.fileName || ''}"`,
    `"${d.updatedAt ? new Date(d.updatedAt).toLocaleString('zh-HK') : ''}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MGPS_TU_QC_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
