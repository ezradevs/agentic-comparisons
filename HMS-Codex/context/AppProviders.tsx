'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SystemProvider } from '@/context/SystemContext';

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <AuthProvider>
      <SystemProvider>{children}</SystemProvider>
    </AuthProvider>
  );
}
