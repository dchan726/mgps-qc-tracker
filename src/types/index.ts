export type QcStatus = 'Pending' | 'In Progress' | 'Completed' | 'Defect';

export interface TuItem {
  id: string;
  fileName: string;
  floor: string;
  supply: string;
  gasType: string;
  soaItem: string;
  facility: string;
  tuNo: string;
  nistNo?: string;
  lineValveNo?: string;
  status: QcStatus;
  remark: string;
  updatedAt: string;
}

export interface GasConfigItem {
  name: string;
  bg: string;
  text: string;
  badge: string;
}

export interface StatusConfigItem {
  label: string;
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
}

export interface GroupAnalysisItem {
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
  passRate: number;
  defectRate: number;
}

export interface GroupingAnalysisResult {
  groups: GroupAnalysisItem[];
  topGroup: GroupAnalysisItem | null;
  defectGroup: GroupAnalysisItem | null;
  avgPassRate: number;
  totalGroups: number;
}

export interface NotificationToast {
  msg: string;
  type: 'info' | 'success' | 'error';
}
