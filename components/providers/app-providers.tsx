'use client';

import { ToastProvider } from '@/components/ui/achievement-toast';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
