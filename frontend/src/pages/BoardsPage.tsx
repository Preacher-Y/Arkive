import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardCard } from '../components/boards/BoardCard';
import { CreateBoardModal } from '../components/boards/CreateBoardModal';
import { useAppStore } from '../store/AppStoreContext';
import { ui } from '../theme';

export const BoardsPage = () => {
  const { state, currentUser, createBoard } = useAppStore();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const boards = useMemo(() => {
    if (!currentUser) return [];
    return Object.values(state.boards)
      .filter((board) => board.memberIds.includes(currentUser.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [state.boards, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-slate-900">My Boards</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select a board or create a new one. Everything persists in localStorage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={ui.buttonPrimary}
          aria-label="Create board"
        >
          Create Board
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {boards.map((board) => {
          const members = board.memberIds
            .map((memberId) => state.users[memberId])
            .filter((user): user is NonNullable<typeof user> => Boolean(user));
          return <BoardCard key={board.id} board={board} members={members} />;
        })}
      </div>

      {boards.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900">No boards yet</h2>
          <p className="mt-2 text-sm text-slate-600">Create a board to start organizing work.</p>
        </div>
      ) : null}

      {isCreateOpen ? (
        <CreateBoardModal
          onClose={() => setCreateOpen(false)}
          onCreate={(boardName) => {
            const boardId = createBoard(boardName, currentUser.id);
            setCreateOpen(false);
            navigate(`/boards/${boardId}`);
          }}
        />
      ) : null}
    </div>
  );
};
