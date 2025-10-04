'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import styles from './login.module.css';

const roles = [
  { value: 'administrator', label: 'Administrator' },
  { value: 'doctor', label: 'Physician' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'patient', label: 'Patient' }
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login, availableUsers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>(availableUsers[0]?.email ?? '');
  const [role, setRole] = useState<(typeof roles)[number]['value']>('administrator');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await login({ email, role });
    router.push('/dashboard');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.brandPanel}>
          <h2 className={styles.brandHeading}>Codex HMS</h2>
          <p className={styles.brandSubheading}>
            Secure, interoperable care coordination for hospitals that demand clarity and speed.
          </p>
          <ul className={styles.brandHighlights}>
            <li>
              <span />Unified electronic medical records
            </li>
            <li>
              <span />Real-time operations visibility
            </li>
            <li>
              <span />FHIR-ready integrations
            </li>
          </ul>
        </section>
        <section className={styles.formPanel}>
          <div>
            <h1>Sign in</h1>
            <p>Choose your secure workspace role to continue.</p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@hospital.org"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value as (typeof roles)[number]['value'])}
              >
                {roles.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="buttonPrimary" style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className={styles.supportActions}>
            <span>Need an account? Contact hospital IT.</span>
            <a href="mailto:it@codexhms.org" style={{ color: 'var(--accent)', fontWeight: 500 }}>
              Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
