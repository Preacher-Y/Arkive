import type { FormEvent } from 'react';
import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { ui } from '../../theme';

interface CreateBoardModalProps {
  onClose: () => void;
  onCreate: (boardName: string) => void;
}

export const CreateBoardModal = ({ onClose, onCreate }: CreateBoardModalProps) => {
  const [boardName, setBoardName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = boardName.trim();
    if (!trimmed) {
      setError('Board name is required.');
      return;
    }
    onCreate(trimmed);
  };

  return (
    <Modal
      title="Create Board"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={ui.buttonSecondary}
            aria-label="Cancel create board"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-board-form"
            className={ui.buttonPrimary}
            aria-label="Create board"
          >
            Create
          </button>
        </div>
      }
    >
      <form id="create-board-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="create-board-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Board name
          </label>
          <input
            id="create-board-name"
            type="text"
            value={boardName}
            onChange={(event) => {
              setBoardName(event.target.value);
              setError(null);
            }}
            className={ui.input}
            placeholder="New project board"
            required
            autoFocus
          />
        </div>
        <p className="text-xs text-slate-500">Default columns: To-do, Doing, Done.</p>
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
};
