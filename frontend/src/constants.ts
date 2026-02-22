export const STORAGE_KEY = 'kanban-webtech-final-state';
export const HARDCODED_PASSWORD = 'Password123!';

export const DEFAULT_BOARD_COLUMNS = ['To-do', 'Doing', 'Done'] as const;

export const TASK_COLOR_OPTIONS = [
  '#334155',
  '#64748b',
  '#2563eb',
  '#0ea5e9',
  '#0f766e',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
] as const;

export const BOARD_BACKGROUND_OPTIONS = [
  { id: 'bg-1', label: 'Slate 50', value: '#F8FAFC' },
  { id: 'bg-2', label: 'Gray 50', value: '#F9FAFB' },
  { id: 'bg-3', label: 'Gray 100', value: '#F3F4F6' },
  { id: 'bg-4', label: 'White', value: '#FFFFFF' },
  { id: 'bg-5', label: 'Soft Mist', value: 'linear-gradient(180deg, #ffffff, #f8fafc)' },
  { id: 'bg-6', label: 'Paper Blue', value: 'linear-gradient(180deg, #f8fafc, #eff6ff)' },
] as const;

export const DEFAULT_BOARD_BACKGROUND = BOARD_BACKGROUND_OPTIONS[0].value;
