import React from 'react';
import { Loader2, CheckCircle2, FileDown } from 'lucide-react';
import { Modal } from './Modal';

interface BulkExportProgressModalProps {
  isOpen: boolean;
  title: string;
  current: number;
  total: number;
  statusMessage: string;
  isComplete: boolean;
  onClose: () => void;
}

export const BulkExportProgressModal: React.FC<BulkExportProgressModalProps> = ({
  isOpen,
  title,
  current,
  total,
  statusMessage,
  isComplete,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isComplete ? onClose : () => {}}
      title={title}
      subtitle="Generating multi-page Landscape A4 PDF document"
      maxWidth="md"
    >
      <div className="py-4 space-y-5 text-center">
        <div className="flex justify-center">
          {isComplete ? (
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {isComplete ? 'Document Generation Complete' : `Processing ${current} of ${total} Timetables`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-mono">
            {statusMessage}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {isComplete && (
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg shadow-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
