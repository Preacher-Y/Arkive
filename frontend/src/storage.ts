import { v4 as uuidv4 } from 'uuid';
import {
  BOARD_BACKGROUND_OPTIONS,
  DEFAULT_BOARD_BACKGROUND,
  DEFAULT_BOARD_COLUMNS,
  STORAGE_KEY,
} from './constants';
import { initialsFromName, nowIso } from './utils';
import type { AppState, Board, Column, Task, User } from './types/models';

const createUser = (name: string, email: string): User => ({
  id: uuidv4(),
  name,
  email,
  avatarInitials: initialsFromName(name),
});

const createTask = (
  title: string,
  extras?: Partial<Pick<Task, 'description' | 'color' | 'isDone' | 'assigneeIds'>>,
): Task => {
  const timestamp = nowIso();
  return {
    id: uuidv4(),
    title,
    description: extras?.description ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
    color: extras?.color,
    isDone: extras?.isDone ?? false,
    assigneeIds: extras?.assigneeIds ?? [],
  };
};

const createColumn = (boardId: string, title: string, order: number, taskIds: string[]): Column => ({
  id: uuidv4(),
  boardId,
  title,
  order,
  taskIds,
});

const createBoard = (
  name: string,
  memberIds: string[],
  columnIds: string[],
  ownerId: string,
  background?: string,
): Board => {
  const timestamp = nowIso();
  return {
    id: uuidv4(),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    memberIds,
    columnIds,
    perUserPrefs: {
      [ownerId]: {
        background: background ?? DEFAULT_BOARD_BACKGROUND,
      },
    },
  };
};

const buildSeedState = (): AppState => {
  const user1 = createUser('Alex Carter', 'user1@example.com');
  const user2 = createUser('Jordan Lee', 'user2@example.com');
  const user3 = createUser('Morgan Diaz', 'user3@example.com');

  const users: Record<string, User> = {
    [user1.id]: user1,
    [user2.id]: user2,
    [user3.id]: user3,
  };

  const tasks: Record<string, Task> = {};
  const columns: Record<string, Column> = {};
  const boards: Record<string, Board> = {};

  const carBoardBackground = BOARD_BACKGROUND_OPTIONS[4].value;
  const personalBoardBackground = BOARD_BACKGROUND_OPTIONS[2].value;

  const carBoard = createBoard('Car Sharing', [user1.id, user2.id, user3.id], [], user1.id, carBoardBackground);
  const carTodoTasks = [
    createTask('Confirm insurance coverage', {
      description: 'Verify weekend trip policy and roadside coverage.',
      color: '#3b82f6',
      assigneeIds: [user1.id],
    }),
    createTask('Split fuel costs', {
      description: 'Create cost sheet for last two trips.',
      color: '#f97316',
      assigneeIds: [user2.id, user3.id],
    }),
  ];
  const carDoingTasks = [
    createTask('Schedule vehicle maintenance', {
      description: 'Book oil change and tire rotation.',
      color: '#10b981',
      assigneeIds: [user2.id],
    }),
    createTask('Update pickup rotation', {
      description: 'Rotate Monday pickup to Jordan.',
      color: '#8b5cf6',
      assigneeIds: [user3.id],
    }),
  ];
  const carDoneTasks = [
    createTask('Collect toll receipts', {
      isDone: true,
      color: '#f59e0b',
      assigneeIds: [user1.id, user2.id],
    }),
    createTask('Add emergency contact list', {
      isDone: true,
      color: '#ef4444',
      assigneeIds: [user3.id],
    }),
  ];

  [...carTodoTasks, ...carDoingTasks, ...carDoneTasks].forEach((task) => {
    tasks[task.id] = task;
  });

  const carTodo = createColumn(carBoard.id, 'To-do', 0, carTodoTasks.map((task) => task.id));
  const carDoing = createColumn(carBoard.id, 'Doing', 1, carDoingTasks.map((task) => task.id));
  const carDone = createColumn(carBoard.id, 'Done', 2, carDoneTasks.map((task) => task.id));
  [carTodo, carDoing, carDone].forEach((column) => {
    columns[column.id] = column;
  });
  carBoard.columnIds = [carTodo.id, carDoing.id, carDone.id];
  carBoard.perUserPrefs[user2.id] = { background: BOARD_BACKGROUND_OPTIONS[5].value };
  carBoard.perUserPrefs[user3.id] = { background: BOARD_BACKGROUND_OPTIONS[3].value };
  boards[carBoard.id] = carBoard;

  const personalBoard = createBoard('Personal Tasks', [user1.id], [], user1.id, personalBoardBackground);
  const pTodoTasks = [
    createTask('Renew license', {
      description: 'Upload required docs before Tuesday.',
      assigneeIds: [user1.id],
      color: '#0f172a',
    }),
    createTask('Plan gym schedule', {
      color: '#ec4899',
      assigneeIds: [user1.id],
    }),
  ];
  const pDoingTasks = [
    createTask('Build budgeting sheet', {
      description: 'Track subscriptions and recurring bills.',
      color: '#3b82f6',
      assigneeIds: [user1.id],
    }),
  ];
  const pDoneTasks = [
    createTask('Book dentist appointment', {
      isDone: true,
      color: '#10b981',
      assigneeIds: [user1.id],
    }),
  ];
  [...pTodoTasks, ...pDoingTasks, ...pDoneTasks].forEach((task) => {
    tasks[task.id] = task;
  });
  const pTodo = createColumn(personalBoard.id, 'To-do', 0, pTodoTasks.map((task) => task.id));
  const pDoing = createColumn(personalBoard.id, 'Doing', 1, pDoingTasks.map((task) => task.id));
  const pDone = createColumn(personalBoard.id, 'Done', 2, pDoneTasks.map((task) => task.id));
  [pTodo, pDoing, pDone].forEach((column) => {
    columns[column.id] = column;
  });
  personalBoard.columnIds = [pTodo.id, pDoing.id, pDone.id];
  boards[personalBoard.id] = personalBoard;

  return {
    users,
    boards,
    columns,
    tasks,
    auth: {
      currentUserId: null,
    },
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isValidAppState = (value: unknown): value is AppState => {
  if (!isRecord(value)) return false;
  return (
    isRecord(value.users) &&
    isRecord(value.boards) &&
    isRecord(value.columns) &&
    isRecord(value.tasks) &&
    isRecord(value.auth) &&
    ('currentUserId' in value.auth)
  );
};

export const loadAppState = (): AppState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = buildSeedState();
    saveAppState(seeded);
    return seeded;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidAppState(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to fresh seed if parsing fails.
  }

  const seeded = buildSeedState();
  saveAppState(seeded);
  return seeded;
};

export const saveAppState = (state: AppState): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createBoardWithDefaults = (
  name: string,
  ownerId: string,
): { board: Board; columns: Column[] } => {
  const boardId = uuidv4();
  const timestamp = nowIso();
  const board: Board = {
    id: boardId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    memberIds: [ownerId],
    columnIds: [],
    perUserPrefs: {
      [ownerId]: { background: DEFAULT_BOARD_BACKGROUND },
    },
  };

  const columns = DEFAULT_BOARD_COLUMNS.map((title, order) => ({
    id: uuidv4(),
    boardId,
    title,
    order,
    taskIds: [],
  }));
  board.columnIds = columns.map((column) => column.id);
  return { board, columns };
};

