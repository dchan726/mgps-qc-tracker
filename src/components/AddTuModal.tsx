import React from 'react';
import { X } from 'lucide-react';
import { GAS_CONFIG } from '../constants';
import { QcStatus } from '../types';

interface AddTuModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    floor: string;
    supply: string;
    gasType: string;
    soaItem: string;
    facility: string;
    tuNo: string;
    status: QcStatus;
    remark: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    floor: string;
    supply: string;
    gasType: string;
    soaItem: string;
    facility: string;
    tuNo: string;
    status: QcStatus;
    remark: string;
  }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AddTuModal: React.FC<AddTuModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base">新增檢測點位 (Add New TU)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Terminal Unit (TU) 編號 *
            </label>
            <input
              type="text"
              placeholder="例: T5/7F/AVSU701/TU/OXY/01"
              value={form.tuNo}
              onChange={(e) => setForm({ ...form, tuNo: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">氣體種類</label>
              <select
                value={form.gasType}
                onChange={(e) => setForm({ ...form, gasType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.keys(GAS_CONFIG).map((gKey) => (
                  <option key={gKey} value={gKey}>
                    {GAS_CONFIG[gKey].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">AVSU 閥箱名稱</label>
              <input
                type="text"
                value={form.supply}
                onChange={(e) => setForm({ ...form, supply: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">設施 / 病房描述</label>
              <input
                type="text"
                value={form.facility}
                onChange={(e) => setForm({ ...form, facility: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">SoA 項目代碼</label>
              <input
                type="text"
                value={form.soaItem}
                onChange={(e) => setForm({ ...form, soaItem: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">檢驗狀態</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as QcStatus })}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Pending">未開始</option>
              <option value="In Progress">檢驗中</option>
              <option value="Completed">已合格完成</option>
              <option value="Defect">有缺失/需跟進</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-xs"
            >
              確認新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
