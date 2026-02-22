import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';
import { DEFAULT_BOARD_BACKGROUND } from '../constants';
import { createBoardWithDefaults, loadAppState, saveAppState } from '../storage';
import { nowIso } from '../utils';
import type {
  AppState,
  Board,
  CreateTaskInput,
  MoveTaskInput,
  Task,
  TaskInput,
  User,
} from '../types/models';

type AppAction =
  | { type: 'LOGIN'; userId: string }
  | { type: 'LOGOUT' }
  | { type: 'CREATE_USER'; user: User; autoLogin: boolean }
  | { type: 'CREATE_BOARD'; board: Board; columns: AppState['columns'] }
  | { type: 'UPDATE_BOARD'; boardId: string; patch: Partial<Board> }
  | { type: 'TOGGLE_BOARD_MEMBER'; boardId: string; userId: string }
  | { type: 'SET_BOARD_BACKGROUND'; boardId: string; userId: string; background: string }
  | { type: 'ADD_COLUMN'; boardId: string; title: string }
  | { type: 'RENAME_COLUMN'; columnId: string; title: string }
  | { type: 'DELETE_COLUMN_AND_TASKS'; columnId: string }
  | { type: 'CREATE_TASK'; taskId: string; input: CreateTaskInput }
  | { type: 'UPDATE_TASK'; taskId: string; patch: TaskInput }
  | { type: 'DELETE_TASK'; taskId: string; columnId: string }
  | { type: 'MOVE_TASK'; input: MoveTaskInput };

export interface AppStoreApi {
  state: AppState;
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  createUser: (user: User, autoLogin?: boolean) => void;
  createBoard: (name: string, ownerId: string) => string;
  updateBoard: (boardId: string, patch: Partial<Board>) => void;
  toggleBoardMember: (boardId: string, userId: string) => void;
  setBoardBackground: (boardId: string, userId: string, background: string) => void;
  addColumn: (boardId: string, title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumnAndTasks: (columnId: string) => void;
  createTask: (input: CreateTaskInput) => string;
  updateTask: (taskId: string, patch: TaskInput) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  moveTask: (input: MoveTaskInput) => void;
}

const AppStoreContext = createContext<AppStoreApi | null>(null);

const withBoardUpdatedAt = (state: AppState, boardId: string): AppState => {
  const board = state.boards[boardId];
  if (!board) return state;
  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        updatedAt: nowIso(),
      },
    },
  };
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: { currentUserId: action.userId },
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: { currentUserId: null },
      };
    case 'CREATE_USER':
      return {
        ...state,
        users: {
          ...state.users,
          [action.user.id]: action.user,
        },
        auth: {
          currentUserId: action.autoLogin ? action.user.id : state.auth.currentUserId,
        },
      };
    case 'CREATE_BOARD': {
      const nextState: AppState = {
        ...state,
        boards: {
          ...state.boards,
          [action.board.id]: action.board,
        },
        columns: {
          ...state.columns,
          ...action.columns,
        },
      };
      return nextState;
    }
    case 'UPDATE_BOARD': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...board,
            ...action.patch,
            updatedAt: nowIso(),
          },
        },
      };
    }
    case 'TOGGLE_BOARD_MEMBER': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const ownerId = board.memberIds[0];
      if (board.memberIds.includes(action.userId) && action.userId === ownerId) {
        return state;
      }
      const isMember = board.memberIds.includes(action.userId);
      const memberIds = isMember
        ? board.memberIds.filter((id) => id !== action.userId)
        : [...board.memberIds, action.userId];
      const currentUserId = state.auth.currentUserId;
      const nextPerUserPrefs = { ...board.perUserPrefs };
      if (!isMember) {
        nextPerUserPrefs[action.userId] = nextPerUserPrefs[action.userId] ?? {
          background:
            nextPerUserPrefs[currentUserId ?? '']?.background ?? DEFAULT_BOARD_BACKGROUND,
        };
      } else {
        delete nextPerUserPrefs[action.userId];
      }
      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            memberIds,
            perUserPrefs: nextPerUserPrefs,
            updatedAt: nowIso(),
          },
        },
      };
    }
    case 'SET_BOARD_BACKGROUND': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            perUserPrefs: {
              ...board.perUserPrefs,
              [action.userId]: {
                background: action.background,
              },
            },
            updatedAt: nowIso(),
          },
        },
      };
    }
    case 'ADD_COLUMN': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const trimmedTitle = action.title.trim();
      if (!trimmedTitle) return state;
      const columnId = uuidv4();
      const nextColumn = {
        id: columnId,
        boardId: board.id,
        title: trimmedTitle,
        order: board.columnIds.length,
        taskIds: [],
      };
      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnIds: [...board.columnIds, columnId],
            updatedAt: nowIso(),
          },
        },
        columns: {
          ...state.columns,
          [columnId]: nextColumn,
        },
      };
    }
    case 'RENAME_COLUMN': {
      const column = state.columns[action.columnId];
      if (!column) return state;
      const title = action.title.trim();
      if (!title) return state;
      const nextState: AppState = {
        ...state,
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            title,
          },
        },
      };
      return withBoardUpdatedAt(nextState, column.boardId);
    }
    case 'DELETE_COLUMN_AND_TASKS': {
      const column = state.columns[action.columnId];
      if (!column) return state;
      const board = state.boards[column.boardId];
      if (!board) return state;
      const nextColumns = { ...state.columns };
      delete nextColumns[column.id];

      const nextTasks = { ...state.tasks };
      column.taskIds.forEach((taskId) => {
        delete nextTasks[taskId];
      });

      const nextColumnIds = board.columnIds.filter((id) => id !== column.id);
      const reindexedColumns = { ...nextColumns };
      nextColumnIds.forEach((columnId, index) => {
        const col = reindexedColumns[columnId];
        if (col) {
          reindexedColumns[columnId] = { ...col, order: index };
        }
      });

      return {
        ...state,
        tasks: nextTasks,
        columns: reindexedColumns,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnIds: nextColumnIds,
            updatedAt: nowIso(),
          },
        },
      };
    }
    case 'CREATE_TASK': {
      const column = state.columns[action.input.columnId];
      if (!column) return state;
      const board = state.boards[column.boardId];
      if (!board) return state;
      const title = action.input.title.trim();
      if (!title) return state;
      const timestamp = nowIso();
      const task: Task = {
        id: action.taskId,
        title,
        description: action.input.description?.trim() ?? '',
        createdAt: timestamp,
        updatedAt: timestamp,
        color: action.input.color,
        isDone: action.input.isDone,
        assigneeIds: action.input.assigneeIds,
      };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: task,
        },
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            taskIds: [...column.taskIds, action.taskId],
          },
        },
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            updatedAt: nowIso(),
          },
        },
      };
    }
    case 'UPDATE_TASK': {
      const task = state.tasks[action.taskId];
      if (!task) return state;
      const title = action.patch.title.trim();
      if (!title) return state;
      const nextTask: Task = {
        ...task,
        title,
        description: action.patch.description?.trim() ?? '',
        color: action.patch.color || undefined,
        isDone: action.patch.isDone,
        assigneeIds: [...action.patch.assigneeIds],
        updatedAt: nowIso(),
      };
      const column = Object.values(state.columns).find((item) => item.taskIds.includes(task.id));
      const nextState: AppState = {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: nextTask,
        },
      };
      return column ? withBoardUpdatedAt(nextState, column.boardId) : nextState;
    }
    case 'DELETE_TASK': {
      const column = state.columns[action.columnId];
      if (!column) return state;
      if (!state.tasks[action.taskId]) return state;
      const nextTasks = { ...state.tasks };
      delete nextTasks[action.taskId];
      const nextState: AppState = {
        ...state,
        tasks: nextTasks,
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== action.taskId),
          },
        },
      };
      return withBoardUpdatedAt(nextState, column.boardId);
    }
    case 'MOVE_TASK': {
      const { taskId, fromColumnId, toColumnId, overTaskId } = action.input;
      const fromColumn = state.columns[fromColumnId];
      const toColumn = state.columns[toColumnId];
      if (!fromColumn || !toColumn) return state;
      if (!fromColumn.taskIds.includes(taskId)) return state;

      if (fromColumnId === toColumnId) {
        const oldIndex = fromColumn.taskIds.indexOf(taskId);
        const newIndex = overTaskId ? fromColumn.taskIds.indexOf(overTaskId) : fromColumn.taskIds.length - 1;
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return state;
        const reordered = arrayMove(fromColumn.taskIds, oldIndex, newIndex);
        const nextState: AppState = {
          ...state,
          columns: {
            ...state.columns,
            [fromColumn.id]: {
              ...fromColumn,
              taskIds: reordered,
            },
          },
        };
        return withBoardUpdatedAt(nextState, fromColumn.boardId);
      }

      const nextFromTaskIds = fromColumn.taskIds.filter((id) => id !== taskId);
      const nextToTaskIds = [...toColumn.taskIds];
      const insertIndex = overTaskId ? nextToTaskIds.indexOf(overTaskId) : nextToTaskIds.length;
      const safeInsertIndex = insertIndex >= 0 ? insertIndex : nextToTaskIds.length;
      nextToTaskIds.splice(safeInsertIndex, 0, taskId);

      const nextState: AppState = {
        ...state,
        columns: {
          ...state.columns,
          [fromColumn.id]: {
            ...fromColumn,
            taskIds: nextFromTaskIds,
          },
          [toColumn.id]: {
            ...toColumn,
            taskIds: nextToTaskIds,
          },
        },
      };

      const withSourceBoardUpdated = withBoardUpdatedAt(nextState, fromColumn.boardId);
      return withBoardUpdatedAt(withSourceBoardUpdated, toColumn.boardId);
    }
    default:
      return state;
  }
};

export const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, loadAppState);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const login = useCallback((userId: string) => {
    dispatch({ type: 'LOGIN', userId });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const createUser = useCallback((user: User, autoLogin = true) => {
    dispatch({ type: 'CREATE_USER', user, autoLogin });
  }, []);

  const createBoard = useCallback((name: string, ownerId: string) => {
    const { board, columns } = createBoardWithDefaults(name, ownerId);
    const columnMap = columns.reduce<AppState['columns']>((acc, column) => {
      acc[column.id] = column;
      return acc;
    }, {});
    dispatch({ type: 'CREATE_BOARD', board, columns: columnMap });
    return board.id;
  }, []);

  const updateBoard = useCallback((boardId: string, patch: Partial<Board>) => {
    dispatch({ type: 'UPDATE_BOARD', boardId, patch });
  }, []);

  const toggleBoardMember = useCallback((boardId: string, userId: string) => {
    dispatch({ type: 'TOGGLE_BOARD_MEMBER', boardId, userId });
  }, []);

  const setBoardBackground = useCallback((boardId: string, userId: string, background: string) => {
    dispatch({ type: 'SET_BOARD_BACKGROUND', boardId, userId, background });
  }, []);

  const addColumn = useCallback((boardId: string, title: string) => {
    dispatch({ type: 'ADD_COLUMN', boardId, title });
  }, []);

  const renameColumn = useCallback((columnId: string, title: string) => {
    dispatch({ type: 'RENAME_COLUMN', columnId, title });
  }, []);

  const deleteColumnAndTasks = useCallback((columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN_AND_TASKS', columnId });
  }, []);

  const createTask = useCallback((input: CreateTaskInput) => {
    const taskId = uuidv4();
    dispatch({
      type: 'CREATE_TASK',
      taskId,
      input: {
        ...input,
        title: input.title,
      },
    });
    return taskId;
  }, []);

  const updateTask = useCallback((taskId: string, patch: TaskInput) => {
    dispatch({ type: 'UPDATE_TASK', taskId, patch });
  }, []);

  const deleteTask = useCallback((taskId: string, columnId: string) => {
    dispatch({ type: 'DELETE_TASK', taskId, columnId });
  }, []);

  const moveTask = useCallback((input: MoveTaskInput) => {
    dispatch({ type: 'MOVE_TASK', input });
  }, []);

  const currentUser = state.auth.currentUserId ? state.users[state.auth.currentUserId] ?? null : null;

  const value = useMemo<AppStoreApi>(
    () => ({
      state,
      currentUser,
      login,
      logout,
      createUser,
      createBoard,
      updateBoard,
      toggleBoardMember,
      setBoardBackground,
      addColumn,
      renameColumn,
      deleteColumnAndTasks,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
    }),
    [
      state,
      currentUser,
      login,
      logout,
      createUser,
      createBoard,
      updateBoard,
      toggleBoardMember,
      setBoardBackground,
      addColumn,
      renameColumn,
      deleteColumnAndTasks,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
};

export const useAppStore = (): AppStoreApi => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
};
