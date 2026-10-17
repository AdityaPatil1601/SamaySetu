import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22252A]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-2xl shadow-xl border border-[#E2D5B8] w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        <div className="p-4 sm:p-5 border-b border-[#E2D5B8] flex items-start justify-between gap-4 bg-[#F6F1E8]">
          <div>
            <h3 className="text-base font-bold text-[#22252A]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#535965] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#535965] hover:text-[#22252A] p-1 rounded-lg hover:bg-[#E2D5B8]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white text-[#22252A]">{children}</div>
      </div>
    </div>
  );
};
