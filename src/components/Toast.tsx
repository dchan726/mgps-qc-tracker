import React from 'react';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationToast } from '../types';

interface ToastProps {
  notification: NotificationToast | null;
}

export const Toast: React.FC<ToastProps> = ({ notification }) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white flex items-center space-x-2 animate-fadeIn ${
        notification.type === 'success'
          ? 'bg-emerald-600'
          : notification.type === 'error'
          ? 'bg-rose-600'
          : 'bg-slate-800'
      }`}
    >
      {notification.type === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : notification.type === 'error' ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Info className="w-4 h-4" />
      )}
      <span>{notification.msg}</span>
    </div>
  );
};
