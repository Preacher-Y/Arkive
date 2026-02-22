import { AvatarBadge } from '../components/shared/AvatarBadge';
import { useAppStore } from '../store/AppStoreContext';

export const ProfilePage = () => {
  const { currentUser, state } = useAppStore();
  if (!currentUser) return null;

  const visibleBoards = Object.values(state.boards).filter((board) => board.memberIds.includes(currentUser.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarBadge initials={currentUser.avatarInitials} label={currentUser.name} />
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">{currentUser.name}</h1>
            <p className="text-sm text-slate-600">{currentUser.email}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Boards visible</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleBoards.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Storage</p>
            <p className="mt-2 text-sm font-medium text-slate-900">Local browser only</p>
            <p className="mt-1 text-xs text-slate-500">No backend configured</p>
          </div>
        </div>
      </div>
    </div>
  );
};
