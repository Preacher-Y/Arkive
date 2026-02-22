import type { User } from '../../types/models';
import { AvatarBadge } from './AvatarBadge';

interface AvatarRowProps {
  users: User[];
}

export const AvatarRow = ({ users }: AvatarRowProps) => {
  const preview = users.slice(0, 4);
  const hiddenCount = users.length - preview.length;

  return (
    <div className="flex items-center">
      {preview.map((user, index) => (
        <div key={user.id} className={index > 0 ? '-ml-2' : ''}>
          <AvatarBadge initials={user.avatarInitials} label={user.name} size="sm" />
        </div>
      ))}
      {hiddenCount > 0 ? (
        <span className="-ml-2 grid h-7 min-w-7 place-items-center rounded-full border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
};
