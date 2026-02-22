import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DEFAULT_BOARD_BACKGROUND } from '../constants';
import { BoardHeader } from '../components/board/BoardHeader';
import { ColumnComponent } from '../components/board/ColumnComponent';
import { TaskDetailsPanel } from '../components/board/TaskDetailsPanel';
import { BackgroundPicker } from '../components/board/BackgroundPicker';
import { MemberPicker } from '../components/board/MemberPicker';
import { SlidePanel } from '../components/shared/SlidePanel';
import { useAppStore } from '../store/AppStoreContext';
import type { Column, Task } from '../types/models';
import { ui } from '../theme';

type BoardTaskPanelState =
  | { type: 'create'; columnId: string }
  | { type: 'edit'; taskId: string }
  | null;

interface DragTaskData {
  type: 'task';
  taskId: string;
  columnId: string;
}

interface DragColumnData {
  type: 'column';
  columnId: string;
}

const isDragTaskData = (value: unknown): value is DragTaskData =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  'taskId' in value &&
  'columnId' in value &&
  (value as { type?: unknown }).type === 'task';

const isDragColumnData = (value: unknown): value is DragColumnData =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  'columnId' in value &&
  (value as { type?: unknown }).type === 'column';

const BoardNotFound = () => (
  <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Board not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The board does not exist or you do not have access to it.
      </p>
      <Link
        to="/boards"
        className={`${ui.buttonPrimary} mt-4`}
      >
        Back to Boards
      </Link>
    </div>
  </div>
);

export const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const {
    state,
    currentUser,
    addColumn,
    renameColumn,
    deleteColumnAndTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleBoardMember,
    setBoardBackground,
  } = useAppStore();

  const [isMembersSectionOpen, setMembersSectionOpen] = useState(false);
  const [isBackgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [taskPanelState, setTaskPanelState] = useState<BoardTaskPanelState>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const board = boardId ? state.boards[boardId] : undefined;

  if (!currentUser || !board || !board.memberIds.includes(currentUser.id)) {
    return <BoardNotFound />;
  }

  const orderedColumns = board.columnIds
    .map((columnId) => state.columns[columnId])
    .filter((column): column is Column => Boolean(column))
    .sort((a, b) => a.order - b.order);

  const taskIdToColumnId = useMemo(() => {
    const map = new Map<string, string>();
    orderedColumns.forEach((column) => {
      column.taskIds.forEach((taskId) => map.set(taskId, column.id));
    });
    return map;
  }, [orderedColumns]);

  const boardMembers = board.memberIds
    .map((memberId) => state.users[memberId])
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const allUsers = Object.values(state.users).sort((a, b) => a.name.localeCompare(b.name));
  const currentBackground =
    board.perUserPrefs[currentUser.id]?.background ?? DEFAULT_BOARD_BACKGROUND;

  const taskPanelMode = useMemo(() => {
    if (!taskPanelState) return null;

    if (taskPanelState.type === 'create') {
      const column = state.columns[taskPanelState.columnId];
      return column ? { type: 'create' as const, column } : null;
    }

    const task = state.tasks[taskPanelState.taskId];
    const columnId = taskIdToColumnId.get(taskPanelState.taskId);
    const column = columnId ? state.columns[columnId] : undefined;
    if (!task || !column) return null;
    return { type: 'edit' as const, task, column };
  }, [taskPanelState, state.columns, state.tasks, taskIdToColumnId]);

  const activeDragTask = activeTaskId ? state.tasks[activeTaskId] : null;

  const handleDeleteColumn = (column: Column) => {
    const hasTasks = column.taskIds.length > 0;
    const confirmed = window.confirm(
      hasTasks
        ? `Delete "${column.title}" and its ${column.taskIds.length} task(s)? This will delete all tasks in the column.`
        : `Delete "${column.title}"?`,
    );
    if (!confirmed) return;

    if (taskPanelState?.type === 'create' && taskPanelState.columnId === column.id) {
      setTaskPanelState(null);
    }
    if (taskPanelState?.type === 'edit') {
      const panelTaskColumnId = taskIdToColumnId.get(taskPanelState.taskId);
      if (panelTaskColumnId === column.id) setTaskPanelState(null);
    }
    deleteColumnAndTasks(column.id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current;
    if (isDragTaskData(dragData)) {
      setActiveTaskId(dragData.taskId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (!isDragTaskData(activeData)) return;

    const overData = over.data.current;
    if (isDragTaskData(overData)) {
      if (
        activeData.taskId === overData.taskId &&
        activeData.columnId === overData.columnId
      ) {
        return;
      }

      moveTask({
        taskId: activeData.taskId,
        fromColumnId: activeData.columnId,
        toColumnId: overData.columnId,
        overTaskId: overData.taskId,
      });
      return;
    }

    if (isDragColumnData(overData)) {
      moveTask({
        taskId: activeData.taskId,
        fromColumnId: activeData.columnId,
        toColumnId: overData.columnId,
        overTaskId: null,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  return (
    <div
      className="h-[calc(100dvh-65px)] overflow-hidden"
      style={{
        background: currentBackground,
      }}
    >
      <div className="h-full overflow-hidden bg-white/70">
        <div className="mx-auto flex h-full max-w-[1700px] flex-col px-4 py-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link to="/boards" className="focus-ring rounded px-1 hover:text-slate-700">
                  Boards
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-slate-700">{board.name}</li>
            </ol>
          </nav>

          <BoardHeader
            board={board}
            members={boardMembers}
            onToggleMembersPanel={() => setMembersSectionOpen(true)}
            onOpenBackgroundPicker={() => setBackgroundPickerOpen(true)}
          />

          <div className="mt-4 min-h-0 flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <div className="flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-2">
                {orderedColumns.map((column) => {
                  const tasks = column.taskIds
                    .map((taskId) => state.tasks[taskId])
                    .filter((task): task is Task => Boolean(task));

                  return (
                    <ColumnComponent
                      key={column.id}
                      column={column}
                      tasks={tasks}
                      usersById={state.users}
                      onOpenTask={(taskId) => setTaskPanelState({ type: 'edit', taskId })}
                      onCreateTask={(columnId) => setTaskPanelState({ type: 'create', columnId })}
                      onRenameColumn={renameColumn}
                      onDeleteColumn={handleDeleteColumn}
                      onToggleTaskDone={(task, checked) =>
                        updateTask(task.id, {
                          title: task.title,
                          description: task.description ?? '',
                          color: task.color,
                          isDone: checked,
                          assigneeIds: task.assigneeIds,
                        })
                      }
                    />
                  );
                })}

                <section className="h-fit w-[320px] shrink-0 self-start rounded-2xl border border-dashed border-slate-300 bg-white p-3 shadow-sm">
                  {showAddColumnForm ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const trimmed = newColumnTitle.trim();
                        if (!trimmed) return;
                        addColumn(board.id, trimmed);
                        setNewColumnTitle('');
                        setShowAddColumnForm(false);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label htmlFor="new-column-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Column title
                        </label>
                        <input
                          id="new-column-title"
                          type="text"
                          value={newColumnTitle}
                          onChange={(event) => setNewColumnTitle(event.target.value)}
                          className={ui.input}
                          placeholder="Review"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={ui.buttonPrimary}
                          aria-label="Add column"
                        >
                          Add column
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddColumnForm(false);
                            setNewColumnTitle('');
                          }}
                          className={ui.buttonSecondary}
                          aria-label="Cancel add column"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddColumnForm(true)}
                      className="focus-ring flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      aria-label="Add new column"
                    >
                      + Add column
                    </button>
                  )}
                </section>
              </div>

              <DragOverlay>
                {activeDragTask ? (
                  <div className="w-[320px] rounded-xl border border-blue-200 bg-white p-3 shadow-lg">
                    {activeDragTask.color ? (
                      <div
                        className="mb-3 h-1.5 rounded-full"
                        style={{ backgroundColor: activeDragTask.color }}
                      />
                    ) : null}
                    <p className="text-sm font-medium text-slate-900">{activeDragTask.title}</p>
                    {activeDragTask.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {activeDragTask.description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <TaskDetailsPanel
        open={Boolean(taskPanelMode)}
        mode={taskPanelMode}
        boardMembers={boardMembers}
        currentUserId={currentUser.id}
        onClose={() => setTaskPanelState(null)}
        onCreate={(columnId, input) => {
          createTask({
            columnId,
            title: input.title,
            description: input.description,
            color: input.color,
            isDone: input.isDone,
            assigneeIds: input.assigneeIds,
          });
        }}
        onUpdate={(taskId, input) => updateTask(taskId, input)}
        onDelete={(taskId, columnId) => deleteTask(taskId, columnId)}
      />

      <BackgroundPicker
        open={isBackgroundPickerOpen}
        currentBackground={currentBackground}
        onClose={() => setBackgroundPickerOpen(false)}
        onSelect={(background) => setBoardBackground(board.id, currentUser.id, background)}
      />

      <SlidePanel
        title="Friends on this board"
        open={isMembersSectionOpen}
        onClose={() => setMembersSectionOpen(false)}
        widthClassName="w-full max-w-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Friends on this board</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add or remove existing users from this board.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMembersSectionOpen(false)}
              className={ui.buttonSecondary}
              aria-label="Close members panel"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <MemberPicker
              users={allUsers}
              boardMemberIds={board.memberIds}
              ownerId={board.memberIds[0]}
              onToggleUser={(userId) => toggleBoardMember(board.id, userId)}
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
