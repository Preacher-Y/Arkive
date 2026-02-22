import type { ReactNode } from 'react';

interface SlidePanelProps {
  title: string;
  open: boolean;
  onClose: () => void;
  widthClassName?: string;
  children: ReactNode;
}

export const SlidePanel = ({
  title,
  open,
  onClose,
  widthClassName = 'w-full max-w-xl',
  children,
}: SlidePanelProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-900/15 backdrop-blur-[2px] transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute right-0 top-0 h-full ${widthClassName} border-l border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 sm:p-6 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {children}
      </aside>
    </div>
  );
};
