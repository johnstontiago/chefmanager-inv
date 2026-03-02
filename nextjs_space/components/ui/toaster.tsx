"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        },
      }}
    />
  );
}
