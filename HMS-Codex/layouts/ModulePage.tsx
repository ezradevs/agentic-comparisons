'use client';
import { AppShell } from '@/components/layout/AppShell';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  onQuickAction?: () => void;
  iconClassName?: string;
}

export function ModulePage({ title, subtitle, actions, children, toolbar, onQuickAction, iconClassName }: Props) {
  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      actions={actions}
      toolbar={toolbar}
      onQuickAction={onQuickAction}
      headingIconClass={iconClassName}
    >
      {children}
    </AppShell>
  );
}
