import { useEffect, useMemo, useState } from 'react';
import { SlidePanel } from '../shared/SlidePanel';
import { TASK_COLOR_OPTIONS } from '../../constants';
import { formatShortDate } from '../../utils';
import type { Column, Task, TaskInput, User } from '../../types/models';
import { ui } from '../../theme';

type TaskPanelMode =
  | { type: 'create'; column: Column }
  | { type: 'edit'; task: Task; column: Column };

interface TaskDetailsPanelProps {
  mode: TaskPanelMode | null;
  open: boolean;
  boardMembers: User[];
  currentUserId: string;
  onClose: () => void;
  onCreate: (columnId: string, input: TaskInput) => void;
  onUpdate: (taskId: string, input: TaskInput) => void;
  onDelete: (taskId: string, columnId: string) => void;
}

interface TaskFormState {
  title: string;
  description: string;
  color: string;
  isDone: boolean;
  assigneeIds: string[];
}

const createEmptyFormState = (): TaskFormState => ({
  title: '',
  description: '',
  color: '',
  isDone: false,
  assigneeIds: [],
});

export const TaskDetailsPanel = ({
  mode,
  open,
  boardMembers,
  currentUserId,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: TaskDetailsPanelProps) => {
  const [form, setForm] = useState<TaskFormState>(createEmptyFormState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mode) {
      setForm(createEmptyFormState());
      setError(null);
      return;
    }

    if (mode.type === 'create') {
      setForm(createEmptyFormState());
      setError(null);
      return;
    }

    setForm({
      title: mode.task.title,
      description: mode.task.description ?? '',
      color: mode.task.color ?? '',
      isDone: mode.task.isDone,
      assigneeIds: [...mode.task.assigneeIds],
    });
    setError(null);
  }, [mode]);

  const panelTitle = useMemo(() => {
    if (!mode) return 'Task details';
    return mode.type === 'create' ? `New task in ${mode.column.title}` : 'Task details';
  }, [mode]);

  const submit = () => {
    if (!mode) return;
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    const payload: TaskInput = {
      title: trimmedTitle,
      description: form.description,
      color: form.color || undefined,
      isDone: form.isDone,
      assigneeIds: form.assigneeIds,
    };

    if (mode.type === 'create') {
      onCreate(mode.column.id, payload);
    } else {
      onUpdate(mode.task.id, payload);
    }
    onClose();
  };

  const toggleAssignee = (userId: string) => {
    setForm((current) => ({
      ...current,
      assigneeIds: current.assigneeIds.includes(userId)
        ? current.assigneeIds.filter((id) => id !== userId)
        : [...current.assigneeIds, userId],
    }));
  };

  const handleAssignToMe = () => {
    setForm((current) => ({
      ...current,
      assigneeIds: current.assigneeIds.includes(currentUserId)
        ? current.assigneeIds
        : [...current.assigneeIds, currentUserId],
    }));
  };

  return (
    <SlidePanel title={panelTitle} open={open} onClose={onClose} widthClassName="w-full max-w-xl">
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">{panelTitle}</h2>
            {mode ? (
              <p className="mt-1 text-xs text-slate-500">
                Column: <span className="font-medium text-slate-700">{mode.column.title}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={ui.buttonSecondary}
            aria-label="Close task details"
          >
            Close
          </button>
        </div>

        {mode ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="px-2">
                <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, title: event.target.value }));
                    setError(null);
                  }}
                  className={ui.input}
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="task-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={5}
                  className={ui.textarea}
                  placeholder="Add details, notes, or next steps..."
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Status</p>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isDone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isDone: event.target.checked }))
                      }
                      className="focus-ring h-4 w-4 rounded border-slate-300 bg-white text-blue-600"
                      aria-label="Mark task done"
                    />
                    Mark done
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-900">Color label</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, color: '' }))}
                      className={`focus-ring rounded-xl border px-3 py-2 text-xs ${
                        !form.color ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                      aria-label="Clear task color"
                    >
                      None
                    </button>
                    {TASK_COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, color }))}
                        className={`focus-ring h-9 w-9 rounded-xl border ${
                          form.color === color ? 'border-slate-500 ring-2 ring-slate-300' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Set task color ${color}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Assignees</p>
                  <button
                    type="button"
                    onClick={handleAssignToMe}
                    className="focus-ring rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    aria-label="Assign task to me"
                  >
                    Assign to me
                  </button>
                </div>
                <div className="space-y-2">
                  {boardMembers.map((member) => {
                    const checked = form.assigneeIds.includes(member.id);
                    return (
                      <label
                        key={member.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <span className="text-sm text-slate-700">{member.name}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAssignee(member.id)}
                          className="focus-ring h-4 w-4 rounded border-slate-300 bg-white text-blue-600"
                          aria-label={`Toggle assignee ${member.name}`}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {mode.type === 'edit' ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                  <p>Created: {formatShortDate(mode.task.createdAt)}</p>
                  <p className="mt-1">Updated: {formatShortDate(mode.task.updatedAt)}</p>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4">
              {mode.type === 'edit' ? (
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Delete task "${mode.task.title}"? This action cannot be undone.`,
                    );
                    if (confirmed) {
                      onDelete(mode.task.id, mode.column.id);
                      onClose();
                    }
                  }}
                  className={ui.buttonDanger}
                  aria-label="Delete task"
                >
                  Delete task
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={ui.buttonSecondary}
                  aria-label="Cancel task changes"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className={ui.buttonPrimary}
                  aria-label={mode.type === 'create' ? 'Create task' : 'Save task'}
                >
                  {mode.type === 'create' ? 'Create task' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SlidePanel>
  );
};
