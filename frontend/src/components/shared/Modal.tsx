import type { ReactNode } from 'react';
import { ui } from '../../theme';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ title, onClose, children, footer }: ModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className={ui.buttonSecondary}
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
        {children}
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
};
