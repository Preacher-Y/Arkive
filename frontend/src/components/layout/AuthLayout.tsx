import { Link, Outlet, useLocation } from 'react-router-dom';

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="auth-reference-bg min-h-dvh overflow-y-auto px-4 py-4 text-slate-900 sm:px-6 lg:overflow-hidden lg:px-8 lg:py-4">
      <div className="mx-auto flex w-full max-w-7xl items-start lg:h-[calc(100dvh-3rem)] lg:items-center">
        <div className="w-full overflow-hidden rounded-4xl xl:scale-95 border border-white/20 bg-white shadow-2xl shadow-black/35">
          <div className="grid lg:h-full lg:min-h-180 xl:min-h-180 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="auth-visual-panel relative hidden overflow-hidden lg:flex flex-col justify-between p-8 text-white xl:p-10">
              
              <div className="relative z-10 flex items-center gap-3 pt-6">
                <span className="text-xs font-medium tracking-[0.28em] text-white/90">
                  ARKIVE WORKSPACE
                </span>
                <span className="h-px flex-1 bg-white/35" aria-hidden="true" />
              </div>

              <div className="relative z-10 pb-8">
                <h2 className="max-w-xs font-serif text-6xl leading-[0.9] tracking-tight text-white">
                  Plan
                  <br />
                  Track
                  <br />
                  Ship
                </h2>
                <p className="mt-6 max-w-sm text-base leading-7 text-white/80">
                  Organize boards, move tasks across columns, and keep your team aligned with a clear kanban flow in Arkive.
                </p>
                <div className="mt-8 grid max-w-md gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">Board Demo</p>
                    <p className="mt-1 font-medium text-white">user1@example.com</p>
                    <p className="text-white/75">Password123!</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">Team Member</p>
                    <p className="mt-1 font-medium text-white">user2@example.com</p>
                    <p className="text-white/75">Password123!</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#f6f6f7] px-6 py-8 sm:px-10 lg:px-12 lg:py-8 xl:px-14 xl:py-10">
              <div className="mx-auto flex h-full w-full max-w-md flex-col">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 text-lg font-medium text-slate-900">
                    <img
                      src="/Arkive.svg"
                      alt="Arkive logo"
                      className="h-8 w-8"
                    />
                    <span>Arkive</span>
                  </div>
                </div>

                <div className="mb-6 border-b border-slate-300/70 pb-2">
                  <nav className="flex items-center justify-center gap-8" aria-label="Auth navigation">
                    <Link
                      to="/login"
                      className={`focus-ring relative px-0 py-1 text-sm font-medium transition-colors ${
                        isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Login
                      {isLogin ? (
                        <span
                          className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-black"
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                    <Link
                      to="/signup"
                      className={`focus-ring relative px-0 py-1 text-sm font-medium transition-colors ${
                        !isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Signup
                      {!isLogin ? (
                        <span
                          className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-black"
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                  </nav>
                </div>

                <div className="flex-1">
                  <div className="auth-flip-stage">
                    <div key={location.pathname} className="auth-flip-card">
                      <Outlet />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
