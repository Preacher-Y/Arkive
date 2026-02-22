export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface BoardMember {
  userId: string;
  role: 'owner' | 'member';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  isDone: boolean;
  assigneeIds: string[];
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  taskIds: string[];
}

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
  columnIds: string[];
  perUserPrefs: Record<string, { background: string }>;
}

export interface AuthState {
  currentUserId: string | null;
}

export interface AppState {
  users: Record<string, User>;
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  auth: AuthState;
}

export interface TaskInput {
  title: string;
  description?: string;
  color?: string;
  isDone: boolean;
  assigneeIds: string[];
}

export interface CreateBoardInput {
  name: string;
}

export interface CreateTaskInput extends TaskInput {
  columnId: string;
}

export interface MoveTaskInput {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  overTaskId: string | null;
}

