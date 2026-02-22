import { Link } from 'react-router-dom';
import type { Board, User } from '../../types/models';
import { AvatarRow } from '../shared/AvatarRow';
import { formatShortDate } from '../../utils';
import { ui } from '../../theme';

interface BoardCardProps {
  board: Board;
  members: User[];
}

export const BoardCard = ({ board, members }: BoardCardProps) => {
  const heroBackground =
    board.perUserPrefs[board.memberIds[0]]?.background ?? '#F8FAFC';

  return (
    <Link
      to={`/boards/${board.id}`}
      className="focus-ring group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      aria-label={`Open board ${board.name}`}
    >
      <div className="h-20 rounded-xl border border-slate-200" style={{ background: heroBackground }} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">
            {board.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">Updated {formatShortDate(board.updatedAt)}</p>
        </div>
        <span className={ui.badge}>
          {members.length} members
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <AvatarRow users={members} />
        <span className="text-xs font-medium text-slate-500">Open</span>
      </div>
    </Link>
  );
};
