'use client';
// TODO: Wrap app with TanStack React Query provider
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
