interface AvatarBadgeProps {
  initials: string;
  label: string;
  size?: 'sm' | 'md';
}

export const AvatarBadge = ({ initials, label, size = 'md' }: AvatarBadgeProps) => {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs';

  return (
    <div
      className={`grid ${sizeClass} place-items-center rounded-full border border-slate-200 bg-white font-semibold text-slate-700`}
      title={label}
      aria-label={label}
    >
      {initials}
    </div>
  );
};
