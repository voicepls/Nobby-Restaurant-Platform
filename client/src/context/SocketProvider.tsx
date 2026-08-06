'use client';
// TODO: Socket.IO context for real-time events
// Connects staff dashboard and ordering pages to NestJS Gateway
export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
