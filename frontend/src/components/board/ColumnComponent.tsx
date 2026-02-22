import type { FormEvent } from 'react';
import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Column, Task, User } from '../../types/models';
import { TaskCard } from './TaskCard';
import { ui } from '../../theme';

interface ColumnComponentProps {
  column: Column;
  tasks: Task[];
  usersById: Record<string, User>;
  onOpenTask: (taskId: string) => void;
  onCreateTask: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (column: Column) => void;
  onToggleTaskDone: (task: Task, checked: boolean) => void;
}

export const ColumnComponent = ({
  column,
  tasks,
  usersById,
  onOpenTask,
  onCreateTask,
  onRenameColumn,
  onDeleteColumn,
  onToggleTaskDone,
}: ColumnComponentProps) => {
  const [isEditingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const { setNodeRef, isOver } = useDroppable({
    id: `column-drop-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = titleDraft.trim();
    if (!trimmed) return;
    onRenameColumn(column.id, trimmed);
    setEditingTitle(false);
  };

  return (
    <section className="flex h-full w-[340px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <div className="flex items-start justify-between gap-2">
        {isEditingTitle ? (
          <form onSubmit={handleRenameSubmit} className="flex-1">
            <label htmlFor={`rename-column-${column.id}`} className="sr-only">
              Rename column
            </label>
            <input
              id={`rename-column-${column.id}`}
              type="text"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={() => setEditingTitle(false)}
              className={ui.input}
              autoFocus
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(column.title);
              setEditingTitle(true);
            }}
            className="focus-ring flex-1 rounded-xl px-2 py-1 text-left"
            aria-label={`Rename column ${column.title}`}
            title="Rename column"
          >
            <h2 className="font-display text-base font-semibold text-slate-900">{column.title}</h2>
            <p className="text-xs text-slate-500">{tasks.length} tasks</p>
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteColumn(column)}
            className="focus-ring rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            aria-label={`Delete column ${column.title}`}
          >
            Delete
          </button>
        </div>
        </div>

        <button
          type="button"
          onClick={() => onCreateTask(column.id)}
          className="focus-ring mt-2 flex w-full items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          aria-label={`Add task in ${column.title}`}
        >
          + Add task
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[220px] flex-1 space-y-3 rounded-xl border p-2 transition ${
          isOver ? 'border-blue-300 bg-blue-50/70' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              assignees={task.assigneeIds
                .map((assigneeId) => usersById[assigneeId])
                .filter((user): user is User => Boolean(user))}
              onOpen={onOpenTask}
              onToggleDone={onToggleTaskDone}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="grid h-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-center">
            <p className="px-4 text-xs text-slate-500">Drop a task here or click Add task.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
