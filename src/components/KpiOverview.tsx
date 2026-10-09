import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    defect: number;
    pending: number;
    rate: number;
  };
}

export const KpiOverview: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total TUs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-medium text-slate-500">總 TU 測試點位</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
          <span className="text-xs text-slate-400">個點</span>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/20">
        <div className="flex items-center justify-between text-emerald-700">
          <span className="text-xs font-semibold">合格完成</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700">{stats.completed}</span>
          <span className="text-xs font-semibold text-emerald-600">
            {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between bg-amber-50/20">
        <div className="flex items-center justify-between text-amber-700">
          <span className="text-xs font-semibold">測試進行中</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-700">{stats.inProgress}</span>
          <span className="text-xs text-amber-600">個</span>
        </div>
      </div>

      {/* Defects */}
      <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between bg-rose-50/20">
        <div className="flex items-center justify-between text-rose-700">
          <span className="text-xs font-semibold">缺失待跟進</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-700">{stats.defect}</span>
          <span className="text-xs text-rose-600">缺失</span>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-medium text-slate-500">未測試點位</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-600">{stats.pending}</span>
          <span className="text-xs text-slate-400">剩餘</span>
        </div>
      </div>

      {/* Overall Gauge */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-4 rounded-xl shadow-md flex flex-col justify-between">
        <span className="text-xs font-medium text-sky-100">整體合格進度</span>
        <div className="mt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold">{stats.rate}%</span>
            <span className="text-[10px] text-sky-200">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <div className="w-full bg-sky-900/50 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.rate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
