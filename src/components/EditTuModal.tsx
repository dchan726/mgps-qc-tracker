import React from 'react';
import { X } from 'lucide-react';
import { GAS_CONFIG } from '../constants';
import { TuItem } from '../types';

interface EditTuModalProps {
  item: TuItem | null;
  onClose: () => void;
  setItem: (item: TuItem | null) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const EditTuModal: React.FC<EditTuModalProps> = ({
  item,
  onClose,
  setItem,
  onSubmit,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base">編輯點位 (Edit TU Record)</h3>
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
              value={item.tuNo}
              onChange={(e) => setItem({ ...item, tuNo: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">氣體種類</label>
              <select
                value={item.gasType}
                onChange={(e) => setItem({ ...item, gasType: e.target.value })}
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
                value={item.supply}
                onChange={(e) => setItem({ ...item, supply: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">設施 / 病房描述</label>
            <input
              type="text"
              value={item.facility}
              onChange={(e) => setItem({ ...item, facility: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">檢驗備註 / 缺失細節</label>
            <textarea
              rows={2}
              value={item.remark || ""}
              onChange={(e) => setItem({ ...item, remark: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="請輸入缺失說明或量測數據..."
            ></textarea>
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
              儲存更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
