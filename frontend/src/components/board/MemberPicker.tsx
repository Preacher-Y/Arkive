import type { User } from '../../types/models';
import { AvatarBadge } from '../shared/AvatarBadge';

interface MemberPickerProps {
  users: User[];
  boardMemberIds: string[];
  ownerId: string;
  onToggleUser: (userId: string) => void;
}

export const MemberPicker = ({
  users,
  boardMemberIds,
  ownerId,
  onToggleUser,
}: MemberPickerProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">Friends on this board</h2>
          <p className="text-xs text-slate-500">Toggle existing users in or out of board membership.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {users.map((user) => {
          const isMember = boardMemberIds.includes(user.id);
          const isOwner = user.id === ownerId;
          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center gap-3">
                <AvatarBadge initials={user.avatarInitials} label={user.name} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                {isOwner ? (
                  <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Owner
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleUser(user.id)}
                    className={`focus-ring rounded-xl px-3 py-2 text-xs font-semibold ${
                      isMember
                        ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                    aria-label={`${isMember ? 'Remove' : 'Add'} ${user.name} ${isMember ? 'from' : 'to'} board`}
                  >
                    {isMember ? 'Remove' : 'Add friend'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
