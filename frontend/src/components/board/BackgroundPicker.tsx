import { BOARD_BACKGROUND_OPTIONS } from '../../constants';
import { SlidePanel } from '../shared/SlidePanel';
import { ui } from '../../theme';

interface BackgroundPickerProps {
  open: boolean;
  currentBackground: string;
  onClose: () => void;
  onSelect: (background: string) => void;
}

export const BackgroundPicker = ({
  open,
  currentBackground,
  onClose,
  onSelect,
}: BackgroundPickerProps) => {
  return (
    <SlidePanel title="Board background picker" open={open} onClose={onClose} widthClassName="w-full max-w-md">
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">My board background</h2>
            <p className="mt-1 text-sm text-slate-600">
              This background is saved only for your user on this board.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={ui.buttonSecondary}
            aria-label="Close background picker"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3">
          {BOARD_BACKGROUND_OPTIONS.map((option) => {
            const selected = option.value === currentBackground;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`focus-ring rounded-xl border p-2 text-left ${
                  selected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                aria-label={`Select ${option.label} background`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-20 rounded-lg border border-slate-200" style={{ background: option.value }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-500">{selected ? 'Selected' : 'Choose background'}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SlidePanel>
  );
};
