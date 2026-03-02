"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect, ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}
