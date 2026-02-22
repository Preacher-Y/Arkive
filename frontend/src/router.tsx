import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAppStore } from './store/AppStoreContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BoardsPage } from './pages/BoardsPage';
import { BoardPage } from './pages/BoardPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const GuestOnly = () => {
  const { currentUser } = useAppStore();
  return currentUser ? <Navigate to="/boards" replace /> : <Outlet />;
};

const ProtectedOnly = () => {
  const { currentUser } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
};

const RootRedirect = () => {
  const { currentUser } = useAppStore();
  return <Navigate to={currentUser ? '/boards' : '/login'} replace />;
};

const MissingProtectedRoute = () => (
  <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <h1 className="font-display text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-300">That route does not exist inside the app.</p>
      <Link
        to="/boards"
        className="focus-ring mt-4 inline-flex rounded-2xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950"
      >
        Back to boards
      </Link>
    </div>
  </div>
);

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedOnly />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/boards', element: <BoardsPage /> },
          { path: '/boards/:boardId', element: <BoardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '*', element: <MissingProtectedRoute /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

