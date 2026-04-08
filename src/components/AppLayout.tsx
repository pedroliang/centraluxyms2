import React from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
