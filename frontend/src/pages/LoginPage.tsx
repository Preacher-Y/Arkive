import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HARDCODED_PASSWORD } from '../constants';
import { useAppStore } from '../store/AppStoreContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const { state, login } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState(HARDCODED_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userIdsByEmail = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(state.users).forEach((user) => map.set(user.email.toLowerCase(), user.id));
    return map;
  }, [state.users]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== HARDCODED_PASSWORD) {
      setError('Invalid credentials.');
      return;
    }

    const userId = userIdsByEmail.get(normalizedEmail);
    if (!userId) {
      setError('No user found with that email.');
      return;
    }

    login(userId);
    const next = searchParams.get('next');
    navigate(next ? decodeURIComponent(next) : '/boards', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-7 text-center">
        <h2 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 xl:text-5xl">
          Welcome Back
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Enter your email and password to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="focus-ring h-4 w-4 rounded border-slate-300 bg-white text-slate-900"
              aria-label="Remember me"
            />
            Remember me
          </label>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="focus-ring rounded text-slate-700 hover:text-slate-900 hover:underline"
          >
            Forgot Password
          </a>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="focus-ring w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
          aria-label="Login"
        >
          Sign In
        </button>

        <p className="pt-1 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="focus-ring rounded font-medium text-slate-900 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};
