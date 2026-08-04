import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Loader2, Sparkles } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import { useAuth } from '../../../contexts/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const { mutate, isPending, error } = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;

    mutate(
      { name, email, password },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  }

  async function handleGoogleCredential(idToken: string) {
    setGoogleError(null);
    try {
      await auth.loginWithGoogle(idToken);
      navigate('/', { replace: true });
    } catch (err) {
      setGoogleError(
        axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : (err as Error).message,
      );
    }
  }

  const errorMessage =
    (error && axios.isAxiosError(error) ? error.response?.data?.message ?? error.message : error?.message) ??
    googleError;

  return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--surface-2)' }}>
      <div
        className="w-full max-w-sm space-y-6 rounded-xl p-8 shadow-sm"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)' }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm"
            style={{ background: 'var(--accent)', boxShadow: '0 1px 6px color-mix(in srgb, var(--accent) 40%, transparent)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--accent-ink)' }} strokeWidth={2.25} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('auth.title')}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.name')}
            autoComplete="name"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            autoComplete="email"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            autoComplete="new-password"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />

          {errorMessage && (
            <p className="text-sm" style={{ color: 'var(--status-critical)' }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {isPending ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('auth.orContinueWith')}
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
        </div>

        <GoogleLoginButton onCredential={handleGoogleCredential} />

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
