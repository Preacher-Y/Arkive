import type { BoardMember, User } from './types/models';

export const nowIso = (): string => new Date().toISOString();

export const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const formatShortDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

export const sortUsersByName = (users: User[]): User[] =>
  [...users].sort((a, b) => a.name.localeCompare(b.name));

export const deriveBoardMembers = (
  memberIds: string[],
  ownerId: string | null,
): BoardMember[] =>
  memberIds.map((userId) => ({
    userId,
    role: ownerId && userId === ownerId ? 'owner' : 'member',
  }));

export const isGradient = (background: string): boolean =>
  background.includes('gradient');

