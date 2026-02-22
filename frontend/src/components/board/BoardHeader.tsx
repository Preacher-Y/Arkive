import { useState } from 'react';
import type { Board, User } from '../../types/models';
import { AvatarRow } from '../shared/AvatarRow';
import { ui } from '../../theme';

interface BoardHeaderProps {
  board: Board;
  members: User[];
  onToggleMembersPanel: () => void;
  onOpenBackgroundPicker: () => void;
}

export const BoardHeader = ({
  board,
  members,
  onToggleMembersPanel,
  onOpenBackgroundPicker,
}: BoardHeaderProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Board</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">{board.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Members</p>
            <div className="mt-1 flex items-center gap-2">
              <AvatarRow users={members} />
              <span className="text-xs text-slate-600">{members.length}</span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={ui.buttonSecondary}
              aria-label="Board settings"
              aria-expanded={isMenuOpen}
            >
              Settings
            </button>
            {isMenuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onOpenBackgroundPicker();
                    setMenuOpen(false);
                  }}
                  className="focus-ring w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  aria-label="Open board background picker"
                >
                  Change my background
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleMembersPanel();
                    setMenuOpen(false);
                  }}
                  className="focus-ring mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  aria-label="Toggle members section"
                >
                  Friends on this board
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
