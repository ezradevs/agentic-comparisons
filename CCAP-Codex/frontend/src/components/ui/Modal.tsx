import { ReactNode } from 'react';

interface ModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const Modal = ({ title, description, open, onClose, footer, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
        <div className="space-y-4 text-sm text-slate-200">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Modal;
