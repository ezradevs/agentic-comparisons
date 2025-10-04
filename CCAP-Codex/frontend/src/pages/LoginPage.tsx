import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };
  const { login, error } = useAuthStore((state) => ({ login: state.login, error: state.error }));
  const [email, setEmail] = useState('director@chessclub.io');
  const [password, setPassword] = useState('PlayWell!24');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setFormError('Could not sign you in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-primary-900/20 backdrop-blur">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-3xl font-black shadow-lg shadow-primary-600/40">♛</div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Chess Club Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage members, tournaments, and announcements.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              required
            />
          </div>
          {(error || formError) && <p className="text-sm text-red-400">{formError ?? error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/40 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
