import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { Task, User } from '../../types/models';
import { AvatarBadge } from '../shared/AvatarBadge';

interface TaskCardProps {
  task: Task;
  assignees: User[];
  columnId: string;
  onOpen: (taskId: string) => void;
  onToggleDone: (task: Task, checked: boolean) => void;
}

export const TaskCard = ({
  task,
  assignees,
  columnId,
  onOpen,
  onToggleDone,
}: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      taskId: task.id,
      columnId,
    },
  });

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`cursor-grab rounded-xl border bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing ${
        isDragging
          ? 'border-blue-300 opacity-80 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {task.color ? (
        <div
          className="mb-3 h-1.5 w-full rounded-full"
          style={{ backgroundColor: task.color }}
          aria-hidden="true"
        />
      ) : null}
      <div className="flex items-start gap-3">
        <input
          id={`task-done-${task.id}`}
          type="checkbox"
          checked={task.isDone}
          onChange={(event) => onToggleDone(task, event.target.checked)}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="focus-ring mt-1 h-4 w-4 rounded border-slate-300 bg-white text-blue-600"
          aria-label={task.isDone ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
        />
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="focus-ring flex-1 rounded-lg text-left"
          aria-label={`Open task details for ${task.title}`}
        >
          <p className={`text-sm font-medium ${task.isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
            {task.title}
          </p>
          {task.description ? (
            <p className={`mt-1 line-clamp-2 text-xs ${task.isDone ? 'text-slate-400' : 'text-slate-500'}`}>
              {task.description}
            </p>
          ) : null}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            task.isDone
              ? 'border-slate-300 bg-slate-100 text-slate-600'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {task.isDone ? 'Done' : 'Active'}
        </span>
        <div className="flex items-center">
          {assignees.slice(0, 3).map((user, index) => (
            <div key={user.id} className={index > 0 ? '-ml-2' : ''}>
              <AvatarBadge initials={user.avatarInitials} label={user.name} size="sm" />
            </div>
          ))}
          {assignees.length > 3 ? (
            <span className="-ml-2 grid h-7 min-w-7 place-items-center rounded-full border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600">
              +{assignees.length - 3}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};
