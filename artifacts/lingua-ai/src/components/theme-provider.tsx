import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <>{children}</>;
}