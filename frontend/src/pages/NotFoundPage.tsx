import { Link } from 'react-router-dom';
import { ui } from '../theme';

export const NotFoundPage = () => (
  <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-900">
    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Not Found</h1>
      <p className="mt-3 text-sm text-slate-600">This page does not exist.</p>
      <Link to="/boards" className={`${ui.buttonPrimary} mt-5`}>
        Go to Boards
      </Link>
    </div>
  </div>
);
