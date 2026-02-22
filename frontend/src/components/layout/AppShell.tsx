import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/AppStoreContext';
import { AvatarBadge } from '../shared/AvatarBadge';
import { ui } from '../../theme';

export const AppShell = () => {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen ${ui.page}`}>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/boards" className="focus-ring inline-flex items-center gap-3 rounded-2xl px-2 py-1">
            <img
              src="/Arkive_i.svg"
              alt="Arkive logo"
              className="h-9 w-9"
            />
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Arkive</p>
              <p className="text-xs text-slate-500">Kanban boards</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <NavLink
              to="/boards"
              className={({ isActive }) =>
                `focus-ring rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              Boards
            </NavLink>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((value) => !value)}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                aria-label="Open user menu"
                aria-expanded={isUserMenuOpen}
              >
                {currentUser ? (
                  <AvatarBadge initials={currentUser.avatarInitials} label={currentUser.name} size="sm" />
                ) : null}
                <span className="hidden sm:inline">{currentUser?.name ?? 'User'}</span>
              </button>
              {isUserMenuOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="focus-ring block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    aria-label="Open profile"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="focus-ring mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100vh-65px)] bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};
