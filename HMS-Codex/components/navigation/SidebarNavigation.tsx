'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import type { Route } from 'next';
import { AppIcon } from '@/components/navigation/AppIcon';
import styles from './SidebarNavigation.module.css';
import type { Role } from '@/lib/types';
import useAuth from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: Route;
  icon: ComponentProps<typeof AppIcon>['name'];
  roles: Role[];
  hint?: string;
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Clinical',
    items: [
      { label: 'Executive View', href: '/dashboard', icon: 'dashboard', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'Patients', href: '/patients', icon: 'patients', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'Appointments', href: '/appointments', icon: 'appointments', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'EMR', href: '/records', icon: 'records', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'Charting', href: '/charting', icon: 'charting', roles: ['doctor', 'nurse'] }
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Medications', href: '/medications', icon: 'medications', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'Laboratory', href: '/labs', icon: 'labs', roles: ['administrator', 'doctor', 'nurse'] },
      { label: 'Billing', href: '/billing', icon: 'billing', roles: ['administrator'] },
      { label: 'Resources', href: '/resources', icon: 'resources', roles: ['administrator'] },
      { label: 'Administration', href: '/admin', icon: 'admin', roles: ['administrator'] }
    ]
  }
];

interface Props {
  onRoleSwitch?: () => void;
}

export function SidebarNavigation({ onRoleSwitch }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentRole: Role | undefined = user?.role;

  return (
    <aside className={styles.sidebar}>
      <section className={styles.brand}>
        <span className={styles.brandName}>Codex HMS</span>
        <span className={styles.brandTagline}>Clinical operations, in clear view.</span>
      </section>
      {navSections.map((section) => {
        const visibleItems = section.items.filter((item) => (currentRole ? item.roles.includes(currentRole) : true));
        if (visibleItems.length === 0) {
          return null;
        }
        return (
          <div key={section.title}>
            <div className={styles.sectionLabel}>{section.title}</div>
            <ul className={styles.navList}>
              {visibleItems.map((item) => {
                const isActive = pathname.startsWith(item.href as string);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={clsx(styles.navLink, isActive && styles.navLinkActive)}>
                      <AppIcon name={item.icon} />
                      <span>{item.label}</span>
                      {item.hint ? <span className={styles.navHint}>{item.hint}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <div className={styles.divider} />
      <div className={styles.footer}>
        <div>Signed in as</div>
        <div className={styles.roleTag}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          {user?.role ?? 'Guest'}
        </div>
        <button type="button" className={styles.switcherButton} onClick={onRoleSwitch}>
          Switch workspace role
        </button>
      </div>
    </aside>
  );
}
