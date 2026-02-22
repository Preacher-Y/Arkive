import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppStoreContext';
import { initialsFromName } from '../utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignupPage = () => {
  const { state, createUser } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const takenEmails = useMemo(
    () => new Set(Object.values(state.users).map((user) => user.email.toLowerCase())),
    [state.users],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) nextErrors.push('Name is required.');
    if (!EMAIL_REGEX.test(normalizedEmail)) nextErrors.push('Email format is invalid.');
    if (password.length < 8) nextErrors.push('Password must be at least 8 characters.');
    if (takenEmails.has(normalizedEmail)) nextErrors.push('Email already exists.');

    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    createUser(
      {
        id: uuidv4(),
        name: trimmedName,
        email: normalizedEmail,
        avatarInitials: initialsFromName(trimmedName),
      },
      true,
    );
    navigate('/boards', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-7 text-center">
        <h2 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Create Account
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Create a local account to start organizing your boards
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" aria-label="Signup form">
        <div>
          <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Create a password"
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

        {errors.length > 0 ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            <ul className="list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="submit"
          className="focus-ring w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
          aria-label="Create account"
        >
          Create Account
        </button>

        <p className="pt-1 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="focus-ring rounded font-medium text-slate-900 hover:underline">
            Log In
          </Link>
        </p>

        <p className="text-center text-xs text-slate-500">
          Local-only demo auth. Your account is stored in this browser.
        </p>
      </form>
    </div>
  );
};
