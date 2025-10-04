'use client';
import { useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import styles from './AppShell.module.css';
import { SidebarNavigation } from '@/components/navigation/SidebarNavigation';
import { TopBar } from '@/components/layout/TopBar';
import useAuth from '@/hooks/useAuth';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  onQuickAction?: () => void;
  headingIconClass?: string;
}

export function AppShell({ title, subtitle, actions, children, toolbar, onQuickAction, headingIconClass }: Props) {
  const router = useRouter();
  const { logout, user, loading } = useAuth();

  const handleRoleSwitch = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  return (
    <div className={styles.wrapper}>
      <SidebarNavigation onRoleSwitch={handleRoleSwitch} />
      <div className={styles.main}>
        <TopBar onCreate={onQuickAction} toolbar={toolbar} />
        <header className={styles.header}>
          <div className={styles.titleRow}>
            {headingIconClass ? (
              <span className={styles.headingIcon} aria-hidden>
                <i className={clsx('fa-solid', headingIconClass)} />
              </span>
            ) : null}
            <div className={styles.titleBlock}>
              <div className={styles.title}>{title}</div>
              {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
            </div>
          </div>
          <div className={styles.actions}>{actions}</div>
        </header>
        <section className={styles.content}>{children}</section>
      </div>
    </div>
  );
}
