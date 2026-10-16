import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-slate-100',
    error: 'border-rose-200 bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-slate-100',
    info: 'border-sky-200 bg-white dark:bg-slate-900 shadow-lg text-slate-800 dark:text-slate-100',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border max-w-sm w-full transition-all animate-in fade-in slide-in-from-top-2 ${borders[type]}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-none">{title}</h4>
        {message && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
